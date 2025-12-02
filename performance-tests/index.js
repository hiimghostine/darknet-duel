const VirtualUser = require('./VirtualUser');
const readline = require('readline');
const fs = require('fs');
const path = require('path');

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

const askQuestion = (query) => new Promise((resolve) => rl.question(query, resolve));

async function main() {
    console.log('=== Darknet Duel Stress Tester (Batch Ramp-Up) ===');

    const defaultBackendUrl = 'http://localhost:8000';
    const defaultGameServerUrl = 'http://localhost:8001';

    // Interactive prompts
    const backendUrlInput = await askQuestion(`Enter Backend URL (default: ${defaultBackendUrl}): `);
    const backendUrl = backendUrlInput.trim() || defaultBackendUrl;

    const gameServerUrlInput = await askQuestion(`Enter Game Server URL (default: ${defaultGameServerUrl}): `);
    const gameServerUrl = gameServerUrlInput.trim() || defaultGameServerUrl;

    console.log(`\nTargeting:\nBackend: ${backendUrl}\nGame Server: ${gameServerUrl}`);
    console.log('Starting Batch Ramp-Up Test...');
    console.log('Methodology: Run N concurrent users. If successful (<5000ms), increment N and repeat.\n');

    const batchResults = [];
    let batchSize = 1;
    let isRunning = true;

    // Handle graceful shutdown
    process.on('SIGINT', () => {
        console.log('\nStopping test...');
        isRunning = false;
    });

    try {
        while (isRunning) {
            console.log(`\n--- Running Batch Size: ${batchSize} ---`);

            // Create users for this batch
            const users = Array.from({ length: batchSize }, () => new VirtualUser(backendUrl, gameServerUrl));

            const batchStartTime = Date.now();

            // Run users concurrently
            const results = await Promise.all(users.map(async (user, index) => {
                const userMetrics = { id: index, totalTime: 0, steps: {}, error: null };
                const startTime = Date.now();

                try {
                    // 1. Register
                    const regRes = await user.register();
                    if (!regRes.success) throw new Error(`Register: ${regRes.error}`);
                    userMetrics.steps.register = regRes.duration;

                    // 2. Login
                    const loginRes = await user.login();
                    if (!loginRes.success) throw new Error(`Login: ${loginRes.error}`);
                    userMetrics.steps.login = loginRes.duration;

                    // 3. Profile
                    const profRes = await user.getProfile();
                    if (!profRes.success) throw new Error(`Profile: ${profRes.error}`);
                    userMetrics.steps.profile = profRes.duration;

                    // 4. Lobby (Create own lobby for pure concurrency test)
                    const createRes = await user.createLobby();
                    if (!createRes.success) throw new Error(`Create Lobby: ${createRes.error}`);

                    const joinRes = await user.joinLobby(createRes.matchID, '0');
                    if (!joinRes.success) throw new Error(`Join Lobby: ${joinRes.error}`);

                    userMetrics.steps.lobby = createRes.duration + joinRes.duration;

                    // 5. Socket
                    const socketRes = await user.connectSocket();
                    if (!socketRes.success) throw new Error(`Socket: ${socketRes.error}`);
                    userMetrics.steps.socket = socketRes.duration;

                    // 6. Update Profile (Heavy Write)
                    const updateRes = await user.updateProfile();
                    if (!updateRes.success) throw new Error(`Update Profile: ${updateRes.error}`);
                    userMetrics.steps.update = updateRes.duration;

                    // 7. Search User (Read)
                    const searchRes = await user.searchUser();
                    if (!searchRes.success) throw new Error(`Search User: ${searchRes.error}`);
                    userMetrics.steps.search = searchRes.duration;

                    userMetrics.totalTime = Date.now() - startTime;
                    userMetrics.success = true;

                } catch (err) {
                    userMetrics.error = err.message;
                    userMetrics.success = false;
                    userMetrics.totalTime = Date.now() - startTime;
                } finally {
                    user.disconnect();
                }

                return userMetrics;
            }));

            const batchDuration = Date.now() - batchStartTime;

            // Analyze Batch
            const successful = results.filter(r => r.success);
            const failed = results.filter(r => !r.success);

            const maxLatency = successful.length > 0
                ? Math.max(...successful.map(r => Math.max(
                    r.steps.register || 0,
                    r.steps.login || 0,
                    r.steps.profile || 0,
                    r.steps.lobby || 0,
                    r.steps.socket || 0,
                    r.steps.update || 0,
                    r.steps.search || 0
                )))
                : 0;

            console.log(`Batch ${batchSize} Completed in ${batchDuration}ms`);
            console.log(`Success: ${successful.length}, Failed: ${failed.length}`);
            console.log(`Max Latency: ${maxLatency}ms`);

            if (failed.length > 0) {
                console.log('Errors:', failed.map(f => f.error).join(', '));
            }

            batchResults.push({
                batchSize,
                successCount: successful.length,
                failCount: failed.length,
                maxLatency,
                results
            });

            // Failure Condition
            if (maxLatency >= 5000) {
                console.log(`\n⚠️ Threshold reached! Max latency ${maxLatency}ms >= 5000ms.`);
                break;
            }

            if (failed.length > 0) {
                console.log(`\n⚠️ Errors encountered. Stopping.`);
                break;
            }

            batchSize++;
            // Optional: small cooldown between batches
            await new Promise(r => setTimeout(r, 1000));
        }

    } catch (error) {
        console.error('\nFatal Error:', error);
    } finally {
        rl.close();
        generateReport(batchResults, backendUrl, gameServerUrl);
    }
}

function generateReport(batchResults, backendUrl, gameServerUrl) {
    const reportPath = path.join(__dirname, 'performance-report.md');

    if (batchResults.length === 0) {
        fs.writeFileSync(reportPath, '# Stress Test Report\nNo batches completed.');
        return;
    }

    const maxSuccessfulBatch = batchResults
        .filter(b => b.failCount === 0 && b.maxLatency < 5000)
        .sort((a, b) => b.batchSize - a.batchSize)[0];

    const maxUsers = maxSuccessfulBatch ? maxSuccessfulBatch.batchSize : 0;

    const reportContent = `
# Batch Stress Test Report
**Date:** ${new Date().toISOString()}
**Configuration:**
- Backend: ${backendUrl}
- Game Server: ${gameServerUrl}
- **Max Stable Concurrent Users:** ${maxUsers}

## Batch Progression
| Batch Size | Success | Failed | Max Latency (ms) | Status |
|------------|---------|--------|------------------|--------|
${batchResults.map(b => `| ${b.batchSize} | ${b.successCount} | ${b.failCount} | ${b.maxLatency} | ${b.maxLatency >= 5000 || b.failCount > 0 ? 'FAIL' : 'PASS'} |`).join('\n')}

## Detailed Metrics (Last Batch)
**Batch Size:** ${batchResults.length > 0 ? batchResults[batchResults.length - 1].batchSize : 0}

| User | Register | Login | Profile | Lobby | Socket | Update | Search | Total |
|------|----------|-------|---------|-------|--------|--------|--------|-------|
${batchResults.length > 0 ? batchResults[batchResults.length - 1].results.map(r =>
        `| ${r.id} | ${r.steps.register || '-'} | ${r.steps.login || '-'} | ${r.steps.profile || '-'} | ${r.steps.lobby || '-'} | ${r.steps.socket || '-'} | ${r.steps.update || '-'} | ${r.steps.search || '-'} | ${r.totalTime} |`
    ).join('\n') : ''}

## Errors (Last Batch)
${batchResults.length > 0 ? batchResults[batchResults.length - 1].results.filter(r => !r.success).map(r => `- User ${r.id}: ${r.error}`).join('\n') : 'None'}
  `.trim();

    fs.writeFileSync(reportPath, reportContent);
    console.log(`\nReport generated at: ${reportPath}`);
}

main();
