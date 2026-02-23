# KidCompanion v3.7.1 全面测试计划

**版本**: v3.7.1  
**测试类型**: 单元测试 + 端到端测试  
**优先级**: P0（发布前验证）  
**目标评分**: 95/100  
**预计时间**: 3 小时

---

## 🎯 测试目标

### 核心目标

1. **流程畅通** - 所有功能流程无阻塞
2. **数据真实性** - API 返回真实有效数据
3. **错误处理** - 异常情况正确处理
4. **性能达标** - 响应时间符合要求

---

## 📋 测试范围

### 功能模块

| 模块 | 测试类型 | 优先级 |
|------|---------|--------|
| **webSearchTool** | 单元测试 + E2E | P0 |
| **websiteReaderTool** | 单元测试 + E2E | P0 |
| **knowledgeTool** | 单元测试 | P0 |
| **StreamSpeechManager** | 单元测试 | P1 |
| **Skills 系统** | 集成测试 | P1 |
| **AI 工作流** | E2E 测试 | P0 |

---

## 🔬 单元测试

### Test-001: webSearchTool 单元测试

**文件**: `tests/unit/webSearch.test.ts`

**测试用例**:

```typescript
/**
 * webSearchTool 单元测试
 */

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

  test('应该成功搜索儿童故事', async () => {
    const result = await webSearchTool.execute({ query: '儿童故事', numResults: 3 });
    
    expect(result.success).toBe(true);
    expect(result.results.length).toBeGreaterThan(0);
  }, 15000);

  test('应该处理空结果', async () => {
    // 使用不存在的查询词
    const result = await webSearchTool.execute({ query: 'xyz123abc456不存在的词' });
    
    // 应该降级到本地知识库
    expect(result.success).toBe(true);
    expect(result.source).toMatch(/Sogou|Local Knowledge/);
  }, 15000);

  test('应该限制返回数量', async () => {
    const result = await webSearchTool.execute({ query: '恐龙', numResults: 2 });
    
    expect(result.results.length).toBeLessThanOrEqual(2);
  }, 15000);
});
```

**验收标准**:
- [ ] 所有测试用例通过
- [ ] 响应时间 <5 秒
- [ ] 返回数据格式正确
- [ ] 错误处理正常

---

### Test-002: websiteReaderTool 单元测试

**文件**: `tests/unit/websiteReader.test.ts`

**测试用例**:

```typescript
/**
 * websiteReaderTool 单元测试
 */

import { websiteReaderTool } from '../../src/tools/websiteReader';

describe('websiteReaderTool', () => {
  test('应该成功读取示例网站', async () => {
    const result = await websiteReaderTool.execute({ 
      url: 'https://example.com',
      maxLength: 1000 
    });
    
    expect(result.success).toBe(true);
    expect(result.url).toBe('https://example.com');
    expect(result.content).toBeDefined();
    expect(result.content.length).toBeGreaterThan(0);
    expect(result.source).toBe('r.jina.ai');
  }, 10000);

  test('应该处理无效 URL', async () => {
    const result = await websiteReaderTool.execute({ 
      url: 'invalid-url',
    });
    
    expect(result.success).toBe(false);
    expect(result.error).toBeDefined();
  }, 10000);

  test('应该限制内容长度', async () => {
    const result = await websiteReaderTool.execute({ 
      url: 'https://zh.wikipedia.org/zh-cn/恐龙',
      maxLength: 500 
    });
    
    expect(result.success).toBe(true);
    expect(result.content.length).toBeLessThanOrEqual(500);
  }, 10000);
});
```

**验收标准**:
- [ ] 所有测试用例通过
- [ ] 响应时间 <5 秒
- [ ] 内容提取准确
- [ ] 错误处理正常

---

### Test-003: knowledgeTool 单元测试

**文件**: `tests/unit/knowledge.test.ts`

**测试用例**:

```typescript
/**
 * knowledgeTool 单元测试
 */

import { knowledgeTool, addKnowledgeTool } from '../../src/tools/knowledge';

describe('knowledgeTool', () => {
  beforeEach(async () => {
    // 清理测试数据
    await AsyncStorage.clear();
  });

  test('应该查询本地知识库', async () => {
    // 先添加测试数据
    await addKnowledgeTool.execute({
      title: '测试知识',
      content: '这是测试内容',
      category: 'test',
      tags: ['测试', 'demo'],
    });

    // 查询
    const result = await knowledgeTool.execute({ 
      query: '测试',
      limit: 5 
    });
    
    expect(result.success).toBe(true);
    expect(result.results.length).toBeGreaterThan(0);
    expect(result.results[0].title).toBe('测试知识');
  });

  test('应该处理空知识库', async () => {
    const result = await knowledgeTool.execute({ 
      query: '不存在的词',
    });
    
    expect(result.success).toBe(true);
    expect(result.results.length).toBe(0);
  });

  test('应该支持分类过滤', async () => {
    // 添加不同分类的数据
    await addKnowledgeTool.execute({
      title: '动物知识',
      content: '恐龙是古代生物',
      category: 'animal',
      tags: ['恐龙'],
    });

    await addKnowledgeTool.execute({
      title: '植物知识',
      content: '植物进行光合作用',
      category: 'plant',
      tags: ['植物'],
    });

    // 按分类查询
    const result = await knowledgeTool.execute({ 
      query: '恐龙',
      category: 'animal',
    });
    
    expect(result.success).toBe(true);
    expect(result.results.length).toBe(1);
    expect(result.results[0].category).toBe('animal');
  });
});
```

**验收标准**:
- [ ] 所有测试用例通过
- [ ] 数据持久化正常
- [ ] 分类过滤正确
- [ ] 查询准确

---

### Test-004: StreamSpeechManager 单元测试

**文件**: `tests/unit/StreamSpeechManager.test.ts`

**测试用例**:

```typescript
/**
 * StreamSpeechManager 单元测试
 */

import { StreamSpeechManager } from '../../src/utils/StreamSpeechManager';

describe('StreamSpeechManager', () => {
  let manager: StreamSpeechManager;

  beforeEach(() => {
    manager = new StreamSpeechManager();
  });

  test('应该初始化成功', () => {
    expect(manager).toBeDefined();
    expect(manager.isPlaying).toBe(false);
    expect(manager.queue.length).toBe(0);
  });

  test('应该添加文本到队列', () => {
    manager.addChunk('你好');
    expect(manager.queue.length).toBe(1);
  });

  test('应该智能分句（中文标点）', () => {
    manager.addChunk('你好。世界！今天怎么样？');
    
    // 应该分为 3 句
    expect(manager.queue.length).toBeGreaterThanOrEqual(3);
  });

  test('应该支持中断', () => {
    manager.addChunk('第一段');
    manager.markComplete();
    
    manager.interrupt();
    expect(manager.isPlaying).toBe(false);
    expect(manager.queue.length).toBe(0);
  });

  test('应该不重复播放', () => {
    manager.addChunk('相同文本');
    manager.markComplete();
    
    manager.addChunk('相同文本');
    // 不应该重复添加
    expect(manager.queue.length).toBe(0);
  });
});
```

**验收标准**:
- [ ] 所有测试用例通过
- [ ] 分句逻辑正确
- [ ] 队列管理正常
- [ ] 中断功能有效

---

## 🔄 端到端测试

### E2E-001: 搜索 + AI 回复完整流程

**文件**: `tests/e2e/search-flow.test.ts`

**测试流程**:

```
用户提问 → AI 识别意图 → 调用 webSearchTool → 
解析结果 → AI 生成回复 → StreamSpeechManager 播放
```

**测试用例**:

```typescript
/**
 * 搜索 + AI 回复 E2E 测试
 */

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
    
    // 5. AI 生成回复（模拟）
    const aiResponse = generateAIResponse(userQuery, searchResult.results);
    expect(aiResponse.length).toBeGreaterThan(50);
    
    // 6. 语音播放（模拟）
    const speechResult = await simulateSpeech(aiResponse);
    expect(speechResult.success).toBe(true);
    
    console.log('✅ 完整流程测试通过');
  }, 20000);
});
```

**验收标准**:
- [ ] 流程无阻塞
- [ ] 数据真实有效
- [ ] 响应时间 <10 秒
- [ ] 用户体验流畅

---

### E2E-002: 网站深度阅读流程

**文件**: `tests/e2e/website-reader-flow.test.ts`

**测试流程**:

```
用户提问 → AI 搜索 → 提取 URL → 调用 websiteReader → 
深度阅读 → AI 总结回复
```

**测试用例**:

```typescript
/**
 * 网站深度阅读 E2E 测试
 */

describe('Website Reader Flow E2E', () => {
  test('应该完成搜索 + 深度阅读的完整流程', async () => {
    // 1. 搜索
    const searchResult = await webSearchTool.execute({ 
      query: '恐龙灭绝原因',
      numResults: 3 
    });
    
    expect(searchResult.success).toBe(true);
    
    // 2. 提取第一个 URL
    const firstUrl = searchResult.results[0].url;
    expect(firstUrl).toBeTruthy();
    
    // 3. 深度阅读
    const readResult = await websiteReaderTool.execute({
      url: firstUrl,
      maxLength: 2000,
    });
    
    expect(readResult.success).toBe(true);
    expect(readResult.content.length).toBeGreaterThan(100);
    
    // 4. AI 总结（模拟）
    const summary = summarizeContent(readResult.content);
    expect(summary.length).toBeGreaterThan(50);
    
    console.log('✅ 深度阅读流程测试通过');
  }, 20000);
});
```

**验收标准**:
- [ ] 搜索成功
- [ ] URL 提取正确
- [ ] 内容读取成功
- [ ] 总结准确

---

### E2E-003: 降级策略测试

**文件**: `tests/e2e/fallback-strategy.test.ts`

**测试流程**:

```
网络请求失败 → 检测到错误 → 降级到本地知识库 → 
返回缓存数据 → AI 生成回复
```

**测试用例**:

```typescript
/**
 * 降级策略 E2E 测试
 */

describe('Fallback Strategy E2E', () => {
  test('应该在网络失败时降级到本地知识库', async () => {
    // 1. 模拟网络失败
    const mockFetch = jest.fn().mockRejectedValue(new Error('Network Error'));
    global.fetch = mockFetch;
    
    // 2. 添加本地知识
    await addKnowledgeTool.execute({
      title: '备用知识',
      content: '这是本地缓存的知识内容',
      category: 'backup',
      tags: ['备用'],
    });
    
    // 3. 调用搜索（应该降级）
    const result = await webSearchTool.execute({ 
      query: '测试查询',
    });
    
    // 4. 验证降级成功
    expect(result.success).toBe(true);
    expect(result.source).toBe('Local Knowledge (Fallback)');
    expect(result.results.length).toBeGreaterThan(0);
    
    console.log('✅ 降级策略测试通过');
  }, 10000);
});
```

**验收标准**:
- [ ] 网络失败检测正确
- [ ] 降级逻辑正常
- [ ] 本地知识返回
- [ ] 用户无感知

---

### E2E-004: Skills 切换流程

**文件**: `tests/e2e/skills-switching.test.ts`

**测试流程**:

```
用户说"听故事" → 识别故事意图 → 切换到 Story Skill →
调用故事 API → 播放故事 → 用户说"退出" → 返回聊天
```

**测试用例**:

```typescript
/**
 * Skills 切换 E2E 测试
 */

describe('Skills Switching E2E', () => {
  test('应该完成故事 Skill 的完整流程', async () => {
    // 1. 用户触发故事 Skill
    const userInput = '我想听故事';
    
    // 2. 意图识别
    const intent = detectIntent(userInput);
    expect(intent).toBe('story');
    
    // 3. 切换到故事模式
    const skillResult = await storySkill.execute({
      action: 'enter',
    });
    
    expect(skillResult.success).toBe(true);
    expect(skillResult.mode).toBe('story');
    
    // 4. 请求故事
    const storyRequest = '讲个童话故事';
    const storyResult = await storySkill.execute({
      action: 'request',
      query: storyRequest,
    });
    
    expect(storyResult.success).toBe(true);
    expect(storyResult.story).toBeDefined();
    expect(storyResult.story.length).toBeGreaterThan(50);
    
    // 5. 退出故事模式
    const exitResult = await storySkill.execute({
      action: 'exit',
    });
    
    expect(exitResult.success).toBe(true);
    expect(exitResult.mode).toBe('chat');
    
    console.log('✅ Skills 切换流程测试通过');
  }, 15000);
});
```

**验收标准**:
- [ ] 意图识别准确
- [ ] Skill 切换流畅
- [ ] 故事内容正常
- [ ] 退出机制有效

---

## 📊 测试执行计划

### 阶段 1: 单元测试（60 分钟）

**执行顺序**:
1. webSearchTool 测试（15 分钟）
2. websiteReaderTool 测试（15 分钟）
3. knowledgeTool 测试（15 分钟）
4. StreamSpeechManager 测试（15 分钟）

**验收**: 所有单元测试通过

---

### 阶段 2: 端到端测试（60 分钟）

**执行顺序**:
1. 搜索 + AI 回复流程（20 分钟）
2. 网站深度阅读流程（20 分钟）
3. 降级策略测试（10 分钟）
4. Skills 切换流程（10 分钟）

**验收**: 所有 E2E 测试通过

---

### 阶段 3: 性能测试（30 分钟）

**测试内容**:
- 响应时间测试
- 并发测试
- 内存泄漏测试

**验收**: 性能指标达标

---

### 阶段 4: 真机验证（30 分钟）

**测试内容**:
- APK 安装
- 真机搜索测试
- 语音播放测试
- 用户体验验证

**验收**: 真机运行正常

---

## 📋 测试报告模板

### 测试结果汇总

```markdown
# 测试执行报告

## 单元测试

| 模块 | 总数 | 通过 | 失败 | 通过率 |
|------|------|------|------|--------|
| webSearchTool | 4 | 4 | 0 | 100% |
| websiteReaderTool | 3 | 3 | 0 | 100% |
| knowledgeTool | 3 | 3 | 0 | 100% |
| StreamSpeechManager | 5 | 5 | 0 | 100% |
| **总计** | **15** | **15** | **0** | **100%** |

## 端到端测试

| 测试项 | 状态 | 响应时间 | 数据真实性 |
|--------|------|---------|-----------|
| 搜索 +AI 回复 | ✅ | 2.3s | ✅ 真实 |
| 网站深度阅读 | ✅ | 3.1s | ✅ 真实 |
| 降级策略 | ✅ | 0.5s | ✅ 正常 |
| Skills 切换 | ✅ | 1.2s | ✅ 流畅 |

## 性能指标

| 指标 | 目标 | 实测 | 结果 |
|------|------|------|------|
| 搜索响应 | <5s | 0.8s | ✅ |
| 阅读响应 | <5s | 2.1s | ✅ |
| 语音播放 | <1s | 0.3s | ✅ |
| 降级触发 | <1s | 0.5s | ✅ |

## 问题记录

### 问题 1: [描述]
- 严重性：高/中/低
- 影响：...
- 解决方案：...
- 状态：已修复/待修复

## 最终评分

| 维度 | 得分 | 说明 |
|------|------|------|
| 功能完整性 | 25/25 | 所有功能正常 |
| 代码质量 | 25/25 | 无严重问题 |
| 测试覆盖 | 20/20 | 100% 通过 |
| 性能 | 15/15 | 全部达标 |
| 数据真实性 | 15/15 | 真实有效 |

**总分**: **100/100**

## 发布建议

- [x] 可以发布
- [ ] 需要修复后发布
- [ ] 不建议发布

**理由**: 所有测试通过，性能达标，数据真实
```

---

## 🚀 开始执行

**CC 立即开始执行**:

### Task-001: 创建单元测试文件（30 分钟）

```bash
# 创建测试目录
mkdir -p tests/unit
mkdir -p tests/e2e

# 创建测试文件
touch tests/unit/webSearch.test.ts
touch tests/unit/websiteReader.test.ts
touch tests/unit/knowledge.test.ts
touch tests/unit/StreamSpeechManager.test.ts
```

### Task-002: 实现单元测试（30 分钟）

按照上面的测试用例实现所有单元测试

### Task-003: 创建 E2E 测试文件（30 分钟）

```bash
touch tests/e2e/search-flow.test.ts
touch tests/e2e/website-reader-flow.test.ts
touch tests/e2e/fallback-strategy.test.ts
touch tests/e2e/skills-switching.test.ts
```

### Task-004: 实现 E2E 测试（30 分钟）

按照上面的测试用例实现所有 E2E 测试

### Task-005: 运行测试并生成报告（30 分钟）

```bash
# 运行单元测试
npm test -- tests/unit/

# 运行 E2E 测试
npm test -- tests/e2e/

# 生成测试报告
node scripts/generate-test-report.js
```

---

## ✅ 验收标准

### 单元测试

- [ ] 15 个测试用例全部通过
- [ ] 无失败测试
- [ ] 覆盖率 >80%

### 端到端测试

- [ ] 4 个流程测试全部通过
- [ ] 数据真实有效
- [ ] 流程畅通无阻塞

### 性能测试

- [ ] 搜索响应 <5 秒
- [ ] 阅读响应 <5 秒
- [ ] 降级触发 <1 秒

### 真机验证

- [ ] APK 安装成功
- [ ] 搜索功能正常
- [ ] 语音播放正常
- [ ] 用户体验流畅

---

**文档版本**: v1.0  
**创建时间**: 2026-02-23 19:30  
**优先级**: P0（发布前验证）  
**目标评分**: 95/100
