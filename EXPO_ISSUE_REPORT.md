# EAS Build Issue Report

**Title**: EAS_BUILD_UNKNOWN_GRADLE_ERROR - 7 consecutive build failures with abnormal queue/build times

**Priority**: High  
**Build ID**: 6a87926c-10c8-4ba2-9844-99c43aa6819d  
**Project**: @kidcompanion-jyy/kid-companion-jyy  
**Date**: 2026-02-24

---

## Issue Summary

All 7 consecutive EAS builds are failing at the "Run gradlew" phase with the error:
```
EAS_BUILD_UNKNOWN_GRADLE_ERROR
Gradle build failed with unknown error
```

**Critical finding**: Build metrics show abnormal queue and build durations, indicating EAS server resource issues.

---

## Build History

| Build ID | Profile | SDK | Status | Queue Time | Build Duration |
|----------|---------|-----|--------|------------|----------------|
| 6a87926c | preview | 51.0.0 | ❌ | 12.8 hours | 43 hours |
| de436a40 | development | 51.0.8 | ❌ | - | - |
| 133a04a7 | preview | 51.0.8 | ❌ | - | - |
| 5641d0e9 | production | 51.0.8 | ❌ | - | - |
| a58bf321 | production | 51.0.8 | ❌ | - | - |
| 140f4fd0 | production | 51.0.8 | ❌ | - | - |
| 8e79febc | production | 51.0.8 | ❌ | - | - |

**Previous successful build**: 49dcb828 (Feb 23, 2026, preview profile)

---

## Critical Metrics (Latest Build)

**Build ID**: 6a87926c-10c8-4ba2-9844-99c43aa6819d

| Metric | Value | Normal | Status |
|--------|-------|--------|--------|
| Build Wait Time | 230s | <60s | ⚠️ Elevated |
| **Build Queue Time** | **46118s (12.8h)** | <5min | ❌ **Critical** |
| **Build Duration** | **155458s (43h)** | 5-15min | ❌ **Critical** |

---

## Error Details

**Error Code**: `EAS_BUILD_UNKNOWN_GRADLE_ERROR`

**Error Message**: 
```
Gradle build failed with unknown error.
See logs for the "Run gradlew" phase for more information.
```

**Failure Phase**: Run gradlew

**Log Files** (expired):
- https://job-logs.eascdn.net/production/6a87926c-10c8-4ba2-9844-99c43aa6819d/1771888398546-490c9f76-9dc6-4b15-9a26-9d647e55a949.txt
- https://job-logs.eascdn.net/production/6a87926c-10c8-4ba2-9844-99c43aa6819d/1771888405430-48e60c51-14cc-40ea-8919-701e3b8e8ec8.txt
- https://job-logs.eascdn.net/production/6a87926c-10c8-4ba2-9844-99c43aa6819d/1771888405693-7056711e-e92e-4e7b-84f7-b0b6fb28399f.txt
- https://job-logs.eascdn.net/production/6a87926c-10c8-4ba2-9844-99c43aa6819d/1771888405886-0b56d58a-d729-4402-a503-624750ae77c4.txt

---

## Troubleshooting Attempts

We have tried the following fixes without success:

### Dependency Fixes
- ✅ Cleared node_modules and lock files
- ✅ Reinstalled dependencies with --legacy-peer-deps
- ✅ Removed test dependencies causing peer conflicts
- ✅ Installed expo-dev-client
- ✅ Downgraded Expo SDK 51.0.8 → 51.0.0

### Configuration Fixes
- ✅ Updated minSdkVersion 23 → 24
- ✅ Added eas.json appVersionSource configuration
- ✅ Added gradleCommand configuration
- ✅ Deleted android/ios prebuild directories

### Build Strategy
- ✅ Used --clear-cache to clear EAS cache
- ✅ Tried development profile
- ✅ Tried preview profile
- ✅ Tried production profile

**Result**: All 7 builds fail at the same "Run gradlew" phase.

---

## Analysis

### Evidence of EAS Server Issues

1. **Abnormal Queue Time (12.8 hours)**
   - Normal queue time should be <5 minutes
   - This indicates severe server resource constraints

2. **Abnormal Build Duration (43 hours)**
   - Normal Android build should complete in 5-15 minutes
   - This indicates Gradle process is stuck or timing out

3. **Consistent Failure Pattern**
   - All 7 builds fail at the exact same phase
   - Error message is generic ("unknown error")
   - This suggests infrastructure issue, not project configuration

4. **Previous Success**
   - Build 49dcb828 succeeded on Feb 23 (preview profile)
   - All builds after that date fail
   - No significant project changes between success and failures

### Root Cause Hypothesis

**EAS server resource exhaustion or service degradation**

The abnormal queue times (12.8h) and build durations (43h) strongly suggest:
- EAS build servers are overloaded
- Gradle processes are timing out due to resource constraints
- Build queue is severely backlogged

---

## Request

Please investigate:

1. **EAS server health** - Check for resource exhaustion or service degradation
2. **Build queue status** - Verify if there's a backlog affecting build times
3. **Gradle service** - Check if Gradle build servers are functioning normally
4. **Our project** - Verify if there are any account/project-specific issues

---

## Project Information

**Project Details**:
- Account: kidcompanion-jyy
- Project: kid-companion-jyy
- Project ID: 9b5b723a-f716-4531-a2dd-5415177e41bd
- SDK Version: 51.0.0 (downgraded from 51.0.8)
- Platform: Android
- Build Profile: preview (also tried development and production)

**Git Repository**:
- Commit: ac1da7b71027dec958f723e476bd3157a5501db9
- Commit Message: "fix: 降级 Expo SDK 到 51.0.0 修复构建问题"
- Repository: https://github.com/jyyconrad/kid-companion-v3

---

## Impact

**Development blocked**: Cannot release v3.7.1 to production
**Timeline**: 7 build failures over ~2 hours (06:29 - 07:16 UTC+8)
**Severity**: High - production release blocked

---

## Contact

**Submitted by**: kidcompanion-jyy (jyy3638@126.com)
**Date**: 2026-02-24 07:55 (Asia/Shanghai)

---

## Attachments

- Build metrics JSON (from eas build:view --json)
- Troubleshooting documentation
- Previous successful build reference (49dcb828)

---

**Expected Response Time**: 24-48 hours
**Preferred Contact**: Email (jyy3638@126.com) or Expo dashboard notifications
