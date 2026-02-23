# Expo Issue 提交指南

---

## 📝 Issue 内容（复制粘贴）

**标题**:
```
EAS_BUILD_UNKNOWN_GRADLE_ERROR - 7 consecutive build failures with 12.8h queue time
```

**正文**:
```markdown
## Issue Summary

All 7 consecutive EAS builds are failing at the "Run gradlew" phase with:
- Error: `EAS_BUILD_UNKNOWN_GRADLE_ERROR`
- Message: `Gradle build failed with unknown error`
- Queue time: 12.8 hours (abnormal)
- Build duration: 43 hours (abnormal)

## Build Information

**Latest Build ID**: 6a87926c-10c8-4ba2-9844-99c43aa6819d
**Project**: @kidcompanion-jyy/kid-companion-jyy
**Project ID**: 9b5b723a-f716-4531-a2dd-5415177e41bd
**Account**: kidcompanion-jyy
**Platform**: Android
**SDK Version**: 51.0.0
**Build Profile**: preview

## Build History

| Build ID | Profile | SDK | Status |
|----------|---------|-----|--------|
| 6a87926c | preview | 51.0.0 | ❌ |
| de436a40 | development | 51.0.8 | ❌ |
| 133a04a7 | preview | 51.0.8 | ❌ |
| 5641d0e9 | production | 51.0.8 | ❌ |
| a58bf321 | production | 51.0.8 | ❌ |
| 140f4fd0 | production | 51.0.8 | ❌ |
| 8e79febc | production | 51.0.8 | ❌ |

**Previous successful build**: 49dcb828 (Feb 23, 2026)

## Critical Metrics

| Metric | Value | Normal |
|--------|-------|--------|
| Build Queue Time | 46118s (12.8h) | <5min |
| Build Duration | 155458s (43h) | 5-15min |

## Troubleshooting Attempts

✅ Cleared node_modules and reinstalled dependencies
✅ Downgraded Expo SDK 51.0.8 → 51.0.0
✅ Removed test dependencies
✅ Cleared EAS cache (--clear-cache)
✅ Tried all profiles (development/preview/production)
✅ Deleted android/ios prebuild directories

All builds fail at the same "Run gradlew" phase.

## Request

Please investigate:
1. EAS server health (queue time 12.8h is abnormal)
2. Gradle service status (build duration 43h is abnormal)
3. Build queue backlog
4. Any account/project-specific issues

## Impact

Production release blocked. Development stalled.

---

**Contact**: jyy3638@126.com
**Date**: 2026-02-24
```

---

## 🔗 提交链接

**Expo 论坛**: https://forums.expo.dev/

**提交步骤**:
1. 访问 https://forums.expo.dev/c/eas-build/
2. 点击 "New Topic"
3. 粘贴上面的标题和正文
4. 选择分类：EAS Build
5. 点击 "Create Topic"

**或者直接提交工单**:
- Expo 支持：https://expo.dev/support
- 选择 "Build" 类别
- 粘贴 issue 内容

---

## 📊 参考链接

**构建详情**: https://expo.dev/accounts/kidcompanion-jyy/projects/kid-companion-jyy/builds/6a87926c-10c8-4ba2-9844-99c43aa6819d

**GitHub 仓库**: https://github.com/jyyconrad/kid-companion-v3

**完整 Issue 报告**: `/root/.openclaw/workspace-coding/projects/kid-companion-v3/EXPO_ISSUE_REPORT.md`

---

## ⏰ 预期响应时间

- **论坛回复**: 24-48 小时
- **官方工单**: 12-24 小时
- **紧急支持**: 可能需要付费计划

---

**创建时间**: 2026-02-24 08:00  
**状态**: 等待手动提交到 Expo 论坛
