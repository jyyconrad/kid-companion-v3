# CC 测试任务清单

**版本**: v3.7.1  
**优先级**: P0（发布前验证）  
**执行者**: CC  
**预计时间**: 3 小时

---

## 📋 任务概览

### 阶段 1: 单元测试（90 分钟）

| 任务 ID | 测试文件 | 用例数 | 预计时间 | 状态 |
|--------|---------|--------|---------|------|
| **UT-001** | tests/unit/webSearch.test.ts | 4 | 15 分钟 | ⏳ 待执行 |
| **UT-002** | tests/unit/websiteReader.test.ts | 3 | 15 分钟 | ⏳ 待执行 |
| **UT-003** | tests/unit/knowledge.test.ts | 3 | 15 分钟 | ⏳ 待执行 |
| **UT-004** | tests/unit/StreamSpeechManager.test.ts | 5 | 15 分钟 | ⏳ 待执行 |
| **UT-005** | tests/unit/wizard.test.ts | 3 | 15 分钟 | ⏳ 待执行 |
| **UT-006** | tests/unit/story.test.ts | 5 | 15 分钟 | ⏳ 待执行 |
| **UT-007** | tests/unit/science.test.ts | 4 | 15 分钟 | ⏳ 待执行 |
| **UT-008** | tests/unit/intentDetection.test.ts | 6 | 15 分钟 | ⏳ 待执行 |
| **UT-009** | tests/unit/configManager.test.ts | 5 | 15 分钟 | ⏳ 待执行 |
| **UT-010** | tests/unit/aiService.test.ts | 4 | 15 分钟 | ⏳ 待执行 |

**小计**: 10 个文件，42 个测试用例

---

### 阶段 2: E2E 测试（60 分钟）

| 任务 ID | 测试文件 | 用例数 | 预计时间 | 状态 |
|--------|---------|--------|---------|------|
| **E2E-001** | tests/e2e/search-flow.test.ts | 1 | 15 分钟 | ⏳ 待执行 |
| **E2E-002** | tests/e2e/website-reader-flow.test.ts | 1 | 15 分钟 | ⏳ 待执行 |
| **E2E-003** | tests/e2e/fallback-strategy.test.ts | 1 | 10 分钟 | ⏳ 待执行 |
| **E2E-004** | tests/e2e/skills-switching.test.ts | 1 | 10 分钟 | ⏳ 待执行 |
| **E2E-005** | tests/e2e/persona-config-flow.test.ts | 1 | 15 分钟 | ⏳ 待执行 |
| **E2E-006** | tests/e2e/story-flow.test.ts | 1 | 15 分钟 | ⏳ 待执行 |
| **E2E-007** | tests/e2e/agent-collaboration.test.ts | 1 | 15 分钟 | ⏳ 待执行 |
| **E2E-008** | tests/e2e/chat-flow.test.ts | 1 | 15 分钟 | ⏳ 待执行 |

**小计**: 8 个文件，12 个测试用例

---

### 阶段 3: 测试报告（30 分钟）

| 任务 ID | 任务 | 预计时间 | 状态 |
|--------|------|---------|------|
| **RPT-001** | 汇总测试结果 | 10 分钟 | ⏳ 待执行 |
| **RPT-002** | 生成测试报告 | 15 分钟 | ⏳ 待执行 |
| **RPT-003** | 提交 Git | 5 分钟 | ⏳ 待执行 |

---

## 🚀 开始执行

### Step 1: 创建测试目录结构

```bash
cd /root/.openclaw/workspace-coding/projects/kid-companion-v3

# 创建测试目录
mkdir -p tests/unit
mkdir -p tests/e2e
mkdir -p tests/fixtures
mkdir -p tests/mocks

# 创建测试文件
touch tests/unit/webSearch.test.ts
touch tests/unit/websiteReader.test.ts
touch tests/unit/knowledge.test.ts
touch tests/unit/StreamSpeechManager.test.ts
touch tests/unit/wizard.test.ts
touch tests/unit/story.test.ts
touch tests/unit/science.test.ts
touch tests/unit/intentDetection.test.ts
touch tests/unit/configManager.test.ts
touch tests/unit/aiService.test.ts

touch tests/e2e/search-flow.test.ts
touch tests/e2e/website-reader-flow.test.ts
touch tests/e2e/fallback-strategy.test.ts
touch tests/e2e/skills-switching.test.ts
touch tests/e2e/persona-config-flow.test.ts
touch tests/e2e/story-flow.test.ts
touch tests/e2e/agent-collaboration.test.ts
touch tests/e2e/chat-flow.test.ts
```

---

### Step 2: 实现单元测试

**参考文档**: `COMPREHENSIVE_TEST_PLAN_V2.md`

**实现要求**:
1. 按照测试用例模板实现
2. 使用 Jest 测试框架
3. 模拟外部依赖（fetch, AsyncStorage）
4. 添加详细的断言和错误信息

**示例** (`tests/unit/webSearch.test.ts`):
```typescript
import { webSearchTool } from '../../src/tools/webSearch';

describe('webSearchTool', () => {
  test('应该成功搜索恐龙', async () => {
    const result = await webSearchTool.execute({ query: '恐龙', numResults: 3 });
    
    expect(result.success).toBe(true);
    expect(result.query).toBe('恐龙');
    expect(result.results).toBeDefined();
    expect(result.results.length).toBeGreaterThan(0);
    expect(result.source).toBe('Sogou');
    
    // 验证结果格式
    result.results.forEach(r => {
      expect(r.title).toBeDefined();
      expect(r.title.length).toBeGreaterThan(0);
      expect(r.url).toBeDefined();
      expect(r.snippet).toBeDefined();
    });
  }, 15000);
});
```

---

### Step 3: 实现 E2E 测试

**参考文档**: `COMPREHENSIVE_TEST_PLAN_V2.md`

**实现要求**:
1. 模拟真实用户流程
2. 验证数据真实性
3. 验证流程畅通性
4. 记录性能指标

**示例** (`tests/e2e/search-flow.test.ts`):
```typescript
describe('Search Flow E2E', () => {
  test('应该完成搜索到回复的完整流程', async () => {
    // 1. 用户提问
    const userQuery = '恐龙有什么特点';
    
    // 2. AI 识别需要搜索
    const searchNeeded = detectSearchIntent(userQuery);
    expect(searchNeeded).toBe(true);
    
    // 3. 调用搜索工具
    const searchResult = await webSearchTool.execute({ 
      query: userQuery,
      numResults: 5 
    });
    
    expect(searchResult.success).toBe(true);
    expect(searchResult.results.length).toBeGreaterThan(0);
    
    // 4. 验证数据真实性
    searchResult.results.forEach(r => {
      expect(r.title).toBeTruthy();
      expect(r.url).toBeTruthy();
      expect(r.snippet).toBeTruthy();
    });
    
    console.log('✅ 完整流程测试通过');
  }, 20000);
});
```

---

### Step 4: 运行测试

```bash
# 安装测试依赖（如果需要）
npm install --save-dev jest @types/jest ts-jest

# 配置 Jest（如果需要）
npx ts-jest config:init

# 运行单元测试
npm test -- tests/unit/ --verbose

# 运行 E2E 测试
npm test -- tests/e2e/ --verbose

# 运行所有测试
npm test -- --verbose
```

---

### Step 5: 生成测试报告

**文件**: `TEST_EXECUTION_REPORT.md`

**报告内容**:
```markdown
# 测试执行报告

## 执行时间
- 开始：2026-02-23 21:00
- 结束：2026-02-23 23:30
- 总耗时：2.5 小时

## 测试结果汇总

### 单元测试

| 模块 | 总数 | 通过 | 失败 | 通过率 |
|------|------|------|------|--------|
| webSearchTool | 4 | 4 | 0 | 100% |
| websiteReaderTool | 3 | 3 | 0 | 100% |
| ... | ... | ... | ... | ... |
| **总计** | **42** | **42** | **0** | **100%** |

### E2E 测试

| 测试项 | 状态 | 响应时间 | 数据真实性 | 流程畅通 |
|--------|------|---------|-----------|---------|
| 搜索+AI 回复 | ✅ | 2.3s | ✅ | ✅ |
| ... | ... | ... | ... | ... |

## 性能指标

| 指标 | 目标 | 实测 | 结果 |
|------|------|------|------|
| 搜索响应 | <5s | 0.8s | ✅ |
| ... | ... | ... | ... |

## 问题记录

### 问题 1: [描述]
- 严重性：高/中/低
- 影响：...
- 解决方案：...
- 状态：已修复/待修复

## 最终评分

| 维度 | 得分 | 说明 |
|------|------|------|
| 功能完整性 | 25/25 | ... |
| 代码质量 | 25/25 | ... |
| 测试覆盖 | 20/20 | ... |
| 性能 | 15/15 | ... |
| 数据真实性 | 15/15 | ... |

**总分**: **100/100**

## 发布建议

- [x] 可以发布
- [ ] 需要修复后发布
- [ ] 不建议发布

**理由**: ...
```

---

### Step 6: 提交 Git

```bash
# 添加测试文件
git add tests/
git add TEST_EXECUTION_REPORT.md

# 提交
git commit -m "test: 完成全面测试（61 个用例 100% 通过）

单元测试:
- webSearchTool: 4 个用例通过
- websiteReaderTool: 3 个用例通过
- knowledgeTool: 3 个用例通过
- StreamSpeechManager: 5 个用例通过
- storySkill: 5 个用例通过
- scienceSkill: 4 个用例通过
- intentDetection: 6 个用例通过
- configManager: 5 个用例通过
- aiService: 4 个用例通过
- Wizard/Persona: 3 个用例通过

E2E 测试:
- 搜索流程：通过
- 深度阅读：通过
- 降级策略：通过
- Skills 切换：通过
- 角色配置：通过
- 故事讲解：通过
- Agent 协作：通过
- 聊天对话：通过

测试结果:
- 总计：61 个用例
- 通过：61 个
- 失败：0 个
- 通过率：100%

最终评分：100/100
发布建议：可以发布"
```

---

## ✅ 验收标准

### 单元测试

- [ ] 42 个测试用例全部实现
- [ ] 所有测试通过（100%）
- [ ] 无失败测试
- [ ] 测试覆盖率 >80%

### E2E 测试

- [ ] 12 个流程测试全部实现
- [ ] 所有测试通过（100%）
- [ ] 数据真实有效
- [ ] 流程畅通无阻塞

### 测试报告

- [ ] 报告完整
- [ ] 数据准确
- [ ] 评分客观
- [ ] 建议合理

### Git 提交

- [ ] 测试文件已提交
- [ ] 测试报告已提交
- [ ] 提交信息清晰

---

## 📊 预期结果

**测试通过率**: 100%（61/61）

**最终评分**: **95-100/100**

**发布建议**: ✅ 可以发布

---

## 🆘 遇到问题

### 问题 1: 测试依赖缺失

**解决**:
```bash
npm install --save-dev jest @types/jest ts-jest
```

### 问题 2: 测试超时

**解决**:
- 增加超时时间（默认 15 秒）
- 检查网络请求
- 优化模拟数据

### 问题 3: 测试失败

**解决**:
- 查看详细错误信息
- 检查测试逻辑
- 修复代码或测试用例

---

## 📞 联系方式

**文档参考**:
- `COMPREHENSIVE_TEST_PLAN_V2.md` - 完整测试计划
- `SOGOU_SEARCH_IMPLEMENTATION.md` - 搜索实现
- `VERIFICATION_TEST_REPORT.md` - 初步测试报告

**立即开始执行！**

---

**任务版本**: v1.0  
**创建时间**: 2026-02-23 21:00  
**执行者**: CC  
**目标**: 100% 通过，评分 95-100/100
