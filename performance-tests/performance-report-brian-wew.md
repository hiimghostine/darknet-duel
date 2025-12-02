# Batch Stress Test Report
**Date:** 2025-11-30T16:28:08.256Z
**Configuration:**
- Backend: https://dnd-backend-dev.aetherrflare.org
- Game Server: https://dnd-game-dev.aetherrflare.org
- **Max Stable Concurrent Users:** 2

## Batch Progression
| Batch Size | Success | Failed | Max Latency (ms) | Status |
|------------|---------|--------|------------------|--------|
| 1 | 1 | 0 | 1871 | PASS |
| 2 | 2 | 0 | 1005 | PASS |
| 3 | 3 | 0 | 7431 | FAIL |

## Detailed Metrics (Last Batch)
**Batch Size:** 3

| User | Register | Login | Profile | Lobby | Socket | Update | Search | Total |
|------|----------|-------|---------|-------|--------|--------|--------|-------|
| 0 | 367 | 398 | 311 | 448 | 598 | 311 | 294 | 2728 |
| 1 | 376 | 399 | 517 | 347 | 1045 | 316 | 284 | 3284 |
| 2 | 451 | 1078 | 174 | 7431 | 5400 | 315 | 172 | 15022 |

## Errors (Last Batch)