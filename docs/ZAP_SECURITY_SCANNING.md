# OWASP ZAP Security Scanning Implementation Guide

## Overview

This guide explains how to implement automated vulnerability scanning using OWASP ZAP (Zed Attack Proxy) via `zaproxy/action-full-scan` GitHub Action in your Darknet Duel CI/CD pipeline.

## Implementation Strategy

### 1. Workflow Structure

You'll need a separate job or workflow that:
1. **Starts your application stack** (backend, frontend, database)
2. **Waits for services to be ready** (health checks)
3. **Runs ZAP scan** against your running application
4. **Handles authentication** (since your API requires Bearer tokens)
5. **Publishes results** (reports, artifacts)
6. **Fails if High/Medium vulnerabilities are found**

### 2. Key Considerations

#### Authentication Handling
Your backend requires Bearer token authentication. ZAP needs to:
- Register/login a test user
- Obtain a session token
- Use that token for authenticated scans

#### Target URLs
You need to configure ZAP to scan:
- **Backend API**: `http://localhost:20000/api` (ports 20000-20006 are used to avoid conflicts)

**Note**: Only the API is scanned, not the frontend. Destructive endpoints are excluded.

#### Scan Types
- **Baseline Scan**: Quick scan (recommended for CI/CD)
- **Full Scan**: Comprehensive but slower (for scheduled scans)

## Example Workflow

Create `.github/workflows/security-scan.yml`:

```yaml
name: Security Scan - OWASP ZAP

on:
  push:
    branches: [dev, main]
  pull_request:
    branches: [dev, main]
  schedule:
    # Run weekly on Mondays at 2 AM UTC
    - cron: '0 2 * * 1'
  workflow_dispatch:

jobs:
  zap-baseline-scan:
    runs-on: ubuntu-latest
    name: ZAP Baseline Scan
    
    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Set up Docker Buildx
        uses: docker/setup-buildx-action@v3

      - name: Create .env for docker compose
        run: |
          cat > .env <<EOF
          MYSQL_ROOT_PASSWORD=test_root_password
          DB_PASSWORD=test_db_password
          JWT_SECRET=test_jwt_secret_for_scanning_only
          SERVER_API_KEY=test_server_api_key
          XENDIT_API_KEY=test_xendit_key
          FRONTEND_URL=http://localhost:8002
          BACKEND_URL=http://localhost:8000
          GAME_URL=http://localhost:8001
          FRONTEND_PORT=8002
          BACKEND_PORT=8000
          GAME_PORT=8001
          DB_PORT=3306
          PHPMYADMIN_PORT=8003
          EOF

      - name: Build Docker images
        run: docker compose build

      - name: Start application stack
        run: |
          docker compose up -d
          # Wait for services to be healthy
          timeout 60 bash -c 'until docker compose ps | grep -q "healthy\|Up"; do sleep 2; done'

      - name: Wait for backend to be ready
        run: |
          echo "Waiting for backend to start..."
          timeout 60 bash -c 'until curl -f http://localhost:8000/api/health || curl -f http://localhost:8000/api || true; do sleep 2; done'

      - name: Wait for frontend to be ready
        run: |
          echo "Waiting for frontend to start..."
          timeout 60 bash -c 'until curl -f http://localhost:8002 || true; do sleep 2; done'

      - name: Create test user for ZAP scanning
        id: create-user
        run: |
          # Register a test user
          RESPONSE=$(curl -s -X POST http://localhost:8000/api/auth/register \
            -H "Content-Type: application/json" \
            -d '{
              "email": "zap-scanner@darknetduel.com",
              "username": "zapscanner",
              "password": "ZapTest123!@#"
            }')
          
          # Login and get token
          LOGIN_RESPONSE=$(curl -s -X POST http://localhost:8000/api/auth/login \
            -H "Content-Type: application/json" \
            -d '{
              "email": "zap-scanner@darknetduel.com",
              "password": "ZapTest123!@#"
            }')
          
          TOKEN=$(echo $LOGIN_RESPONSE | grep -o '"token":"[^"]*' | cut -d'"' -f4)
          echo "token=$TOKEN" >> $GITHUB_OUTPUT
          echo "Created test user and obtained token"

      - name: ZAP Baseline Scan
        uses: zaproxy/action-full-scan@v0.10.0
        with:
          token: ${{ steps.create-user.outputs.token }}
          docker_name: 'zap-scan'
          target: 'http://localhost:8002'
          rules_file_name: '.zap/rules.tsv'
          cmd_options: '-a'
          fail_action: true

      - name: ZAP API Scan
        uses: zaproxy/action-full-scan@v0.10.0
        with:
          token: ${{ steps.create-user.outputs.token }}
          docker_name: 'zap-api-scan'
          target: 'http://localhost:8000/api'
          format: openapi
          api_spec: 'http://localhost:8000/api/swagger.json'
          cmd_options: '-a'
          fail_action: true

      - name: Upload ZAP results
        if: always()
        uses: actions/upload-artifact@v4
        with:
          name: zap-reports
          path: |
            report_html.html
            report_json.json
            report_md.md
          retention-days: 30

      - name: Stop Docker containers
        if: always()
        run: docker compose down -v

      - name: Fail on High/Medium vulnerabilities
        if: always()
        run: |
          if [ -f report_json.json ]; then
            HIGH_COUNT=$(jq '[.[] | select(.risk == "High")] | length' report_json.json || echo "0")
            MEDIUM_COUNT=$(jq '[.[] | select(.risk == "Medium")] | length' report_json.json || echo "0")
            
            if [ "$HIGH_COUNT" -gt 0 ] || [ "$MEDIUM_COUNT" -gt 0 ]; then
              echo "❌ Found $HIGH_COUNT High and $MEDIUM_COUNT Medium vulnerabilities"
              echo "See the uploaded reports for details"
              exit 1
            else
              echo "✅ No High or Medium vulnerabilities found"
            fi
          fi
```

## Alternative: Simplified Approach with Authentication Context

For better authentication handling, create a ZAP context file:

### 1. Create `.zap/context.json`:

```json
{
  "url": "http://localhost:8002",
  "login": {
    "url": "http://localhost:8002/auth",
    "username": "zapscanner",
    "password": "ZapTest123!@#",
    "submitButton": "button[type='submit']",
    "usernameField": "input[name='email']",
    "passwordField": "input[name='password']"
  },
  "api": {
    "url": "http://localhost:8000/api",
    "tokenEndpoint": "/auth/login",
    "tokenField": "token",
    "headerName": "Authorization",
    "headerValue": "Bearer {token}"
  }
}
```

### 2. Simplified Workflow Step:

```yaml
- name: ZAP Full Scan with Authentication
  uses: zaproxy/action-full-scan@v0.10.0
  with:
    target: 'http://localhost:8002'
    context_file: '.zap/context.json'
    cmd_options: '-a -j'
    fail_action: true
```

## Recommended Configuration

### Option 1: API Scan with Filtered Swagger (Recommended)

This approach filters out destructive endpoints before scanning:

```yaml
- name: Download and filter Swagger spec
  run: |
    curl -s http://localhost:20000/api/swagger.json -o swagger-original.json
    # Remove destructive endpoints using jq
    jq '
      .paths."/api/account/me".delete = null |
      .paths."/api/admin/users/{id}".delete = null |
      .paths."/api/admin/users/{id}/ban".post = null |
      .paths."/api/admin/users/{id}/unban".post = null |
      with_entries(select(.value != null))
    ' swagger-original.json > swagger-filtered.json

- name: ZAP API Scan
  uses: zaproxy/action-api-scan@v0.10.0
  with:
    target: 'http://localhost:20000/api'
    format: openapi
    api_spec: './swagger-filtered.json'
    cmd_options: '-a -J'
    fail_action: true
```

### Option 2: API Baseline Scan (Faster - For PR checks)

```yaml
- name: ZAP API Baseline Scan
  uses: zaproxy/action-baseline-scan@v0.12.0
  with:
    target: 'http://localhost:20000/api'
    rules_file_name: '.zap/rules.tsv'
    cmd_options: '-J'
    fail_action: true
```

**Note**: The workflow example uses ports 20000-20006 to avoid conflicts with other services.

## Handling False Positives

### Create `.zap/rules.tsv`

When you encounter false positives, you can create rules to ignore them:

```tsv
10063  IGNORE  (XSS false positive on static content)
10054  IGNORE  (Path traversal false positive)
```

## Integration with Existing CI/CD

You can integrate this into your existing workflow:

```yaml
jobs:
  build-and-deploy:
    # ... your existing build steps ...

  security-scan:
    needs: build-and-deploy
    runs-on: ubuntu-latest
    # ... ZAP scan steps ...
```

## Best Practices

1. **Separate Jobs**: Keep security scanning as a separate job that can run in parallel
2. **Health Checks**: Always wait for services to be ready before scanning
3. **Test User**: Use a dedicated test account that gets cleaned up
4. **Artifact Retention**: Keep reports for at least 30 days for analysis
5. **Fail on High/Medium**: Only fail the pipeline on High/Medium severity
6. **Weekly Scans**: Run comprehensive scans weekly, baseline scans on every PR
7. **Token Rotation**: Use different credentials for scanning than production

## Troubleshooting

### ZAP can't reach the application
- Check that services are listening on `0.0.0.0`, not just `127.0.0.1`
- Verify network connectivity between ZAP container and app containers
- Use `docker network ls` and `docker network inspect` to debug

### Authentication fails
- Verify the login endpoint and payload format
- Check that CORS allows the ZAP user agent
- Use ZAP's authentication context for complex flows

### Too many false positives
- Tune ZAP rules via `.zap/rules.tsv`
- Use baseline scan instead of full scan for CI/CD
- Add context-specific rules for your framework (React, Express)

## Next Steps

1. Create the workflow file: `.github/workflows/security-scan.yml`
2. Test locally with Docker Compose
3. Add `.zap/` directory to `.gitignore` (if storing sensitive configs)
4. Configure repository secrets if needed
5. Run first scan and review results
6. Tune rules based on findings
7. Integrate into your CI/CD pipeline

## References

- [OWASP ZAP GitHub Action](https://github.com/zaproxy/action-full-scan)
- [ZAP Documentation](https://www.zaproxy.org/docs/)
- [ZAP API Documentation](https://www.zaproxy.org/docs/api/)

