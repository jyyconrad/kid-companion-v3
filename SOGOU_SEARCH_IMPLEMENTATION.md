# 搜狗搜索集成实施计划 v3.7.1

**版本**: v3.7.1  
**优先级**: P0（严重问题修复）  
**目标评分**: 95/100  
**预计时间**: 2 小时

---

## 🎯 任务目标

替换不可用的 DuckDuckGo API，使用搜狗搜索实现国内可用的免费搜索功能。

---

## 📋 需求规格

### 功能需求

**FR-001: 搜索功能**
- 支持中文搜索
- 支持儿童相关内容搜索
- 返回 5-10 条搜索结果
- 包含标题、摘要、URL

**FR-002: 错误处理**
- 网络超时处理（10 秒）
- 验证码检测
- 降级到本地知识库

**FR-003: 反爬控制**
- 使用真实 User-Agent
- 添加随机延迟（1-3 秒）
- 限制请求频率（<10 次/分钟）

### 性能需求

| 指标 | 目标 | 实测 |
|------|------|------|
| 响应时间 | <5s | 待测 |
| 成功率 | >90% | 待测 |
| 降级触发 | <1s | 待测 |

---

## 🔧 技术设计

### 整体架构

```
用户查询
    ↓
AI 调用 webSearchTool
    ↓
搜狗搜索（www.sogou.com）
    ↓
HTML 解析器
    ↓
返回 JSON 结果
    ↓
AI 生成回复
```

### 核心组件

| 组件 | 职责 | 文件 |
|------|------|------|
| **webSearchTool** | 搜索工具定义 | src/tools/webSearch.ts |
| **parseSogouHTML** | HTML 解析器 | src/tools/webSearch.ts |
| **fallbackToKnowledge** | 降级函数 | src/tools/webSearch.ts |

---

## 📝 实施步骤

### Step 1: 修改 webSearch.ts

**文件**: `src/tools/webSearch.ts`

**修改内容**:

```typescript
import { tool } from 'ai';
import { z } from 'zod';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { SearchResult } from '../types/search';
import type { KnowledgeItem } from '../types/knowledge';

/**
 * Web Search 工具定义
 * 使用搜狗搜索（国内免费，无需 API Key）
 */
export const webSearchTool = tool({
  description: '搜索网络信息，获取实时知识和新闻（使用搜狗搜索）',
  parameters: z.object({
    query: z.string().describe('搜索关键词'),
    numResults: z.number().optional().describe('返回数量 (默认 5)'),
  }),
  execute: async ({ query, numResults = 5 }: { query: string; numResults?: number }) => {
    try {
      // 构建搜狗搜索 URL
      const url = `https://www.sogou.com/web?query=${encodeURIComponent(query)}`;
      
      // 随机延迟（1-3 秒）
      const delay = Math.random() * 2000 + 1000;
      await new Promise(resolve => setTimeout(resolve, delay));
      
      // 调用搜狗搜索
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
          'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8',
        },
      });

      if (!response.ok) {
        throw new Error(`搜狗搜索返回 ${response.status}`);
      }

      const html = await response.text();
      
      // 检查是否返回验证码页面
      if (html.includes('captcha') || html.includes('验证码')) {
        throw new Error('触发验证码，请稍后重试');
      }
      
      // 解析 HTML 提取搜索结果
      const results = parseSogouHTML(html, numResults);
      
      if (results.length === 0) {
        throw new Error('未找到相关结果');
      }

      return {
        success: true,
        query,
        results,
        count: results.length,
        source: 'Sogou',
      };
    } catch (error: any) {
      console.error('搜狗搜索失败，降级到本地知识库:', error);
      
      // 降级到本地知识库
      return await fallbackToKnowledge(query);
    }
  },
}) as any;

/**
 * 解析搜狗搜索 HTML
 */
function parseSogouHTML(html: string, maxResults: number): SearchResult[] {
  const results: SearchResult[] = [];
  
  try {
    // 提取搜索结果块
    const resultRegex = /<div class="fb-hint"[^>]*>([\s\S]*?)<\/div>/g;
    const vrRegex = /<div class="vrwrap"[^>]*>([\s\S]*?)<\/div>/g;
    
    // 提取标题
    const titleRegex = /<h3[^>]*class="[^"]*"(?:[^>]*>)?([\s\S]*?)<\/h3>/gi;
    const titles = [...html.matchAll(titleRegex)]
      .map(m => stripHTML(m[1]))
      .filter(t => t.length > 0 && t.length < 200)
      .slice(0, maxResults);
    
    // 提取摘要
    const snippetRegex = /<div class="fz-mid space-txt[^>]*>([\s\S]*?)<\/div>/gi;
    const snippets = [...html.matchAll(snippetRegex)]
      .map(m => stripHTML(m[1]))
      .filter(s => s.length > 0 && s.length < 300)
      .slice(0, maxResults);
    
    // 提取 URL（搜狗使用/link?url=xxx 重定向）
    const urlRegex = /<a[^>]*href="\/link\?url=([^"]+)"/gi;
    const urls = [...html.matchAll(urlRegex)]
      .map(m => {
        try {
          return decodeURIComponent(m[1]);
        } catch {
          return '';
        }
      })
      .filter(u => u.startsWith('http'))
      .slice(0, maxResults);
    
    // 组合结果
    for (let i = 0; i < Math.max(titles.length, snippets.length); i++) {
      results.push({
        title: titles[i] || '无标题',
        url: urls[i] || '',
        snippet: snippets[i] || '',
      });
    }
    
    return results;
  } catch (error) {
    console.error('解析搜狗 HTML 失败:', error);
    return [];
  }
}

/**
 * 去除 HTML 标签
 */
function stripHTML(html: string): string {
  return html
    .replace(/<[^>]*>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * 降级到本地知识库
 */
async function fallbackToKnowledge(query: string) {
  try {
    const knowledgeJson = await AsyncStorage.getItem('@knowledge_base');
    const knowledge: KnowledgeItem[] = knowledgeJson ? JSON.parse(knowledgeJson) : [];
    
    const results = knowledge.filter(item => 
      item.title.toLowerCase().includes(query.toLowerCase()) ||
      item.content.toLowerCase().includes(query.toLowerCase()) ||
      item.tags.some(tag => tag.toLowerCase().includes(query.toLowerCase()))
    ).slice(0, 5);
    
    return {
      success: true,
      query,
      results: results.map(k => ({
        title: k.title,
        url: '',
        snippet: k.content.slice(0, 200),
      })),
      count: results.length,
      source: 'Local Knowledge (Fallback)',
    };
  } catch (error: any) {
    return {
      success: false,
      query,
      error: error.message,
      source: 'Fallback Failed',
    };
  }
}
```

---

### Step 2: 更新 kidsSearch.ts

**文件**: `src/tools/webSearch.ts`

**修改内容**:

```typescript
/**
 * 简化版搜索（适用于儿童）
 */
export const kidsSearchTool = tool({
  description: '为儿童搜索适合的知识内容',
  parameters: z.object({
    question: z.string().describe('孩子的问题'),
    category: z.enum(['animal', 'plant', 'space', 'science', 'history']).optional(),
  }),
  execute: async ({ question, category }: { question: string; category?: 'animal' | 'plant' | 'space' | 'science' | 'history' }) => {
    // 构建适合儿童的搜索词
    const searchQuery = `${category || '知识'} ${question} 儿童版`;
    
    // 调用搜狗搜索
    const result: any = await (webSearchTool as any).execute({ query: searchQuery, numResults: 3 });
    
    // 过滤和简化内容
    if (result && result.success) {
      return {
        ...result,
        results: (result.results || []).map((r: any) => ({
          ...r,
          snippet: simplifyContentForKids(r.snippet),
        })),
      };
    }
    
    return result;
  },
}) as any;

/**
 * 简化内容适合儿童阅读
 */
const simplifyContentForKids = (text: string): string => {
  // 移除复杂链接和格式
  let simplified = text
    .replace(/https?:\/\/\S+/g, '')  // 移除 URL
    .replace(/[#*_~]/g, '')  // 移除 Markdown 符号
    .split('\n')
    .slice(0, 3)  // 只保留前 3 行
    .join(' ');
  
  // 限制长度
  if (simplified.length > 200) {
    simplified = simplified.slice(0, 200) + '...';
  }
  
  return simplified;
};
```

---

### Step 3: 更新 aiService.ts

**文件**: `src/services/aiService.ts`

**修改内容**: 无需修改（工具接口不变）

---

### Step 4: 测试验证

**测试脚本**: `tests/test-sogou-search.js`

```javascript
#!/usr/bin/env node

/**
 * 搜狗搜索测试脚本
 */

const https = require('https');

function testSogouSearch(query) {
  return new Promise((resolve, reject) => {
    const url = `https://www.sogou.com/web?query=${encodeURIComponent(query)}`;
    
    console.log(`\n🔍 测试搜索：${query}`);
    console.log(`URL: ${url}`);
    
    const startTime = Date.now();
    
    https.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
    }, (res) => {
      let data = '';
      
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        const duration = Date.now() - startTime;
        
        console.log(`✅ 响应时间：${duration}ms`);
        console.log(`✅ HTTP 状态：${res.statusCode}`);
        
        // 检查是否返回验证码
        if (data.includes('captcha') || data.includes('验证码')) {
          console.log('❌ 触发验证码');
          resolve({ success: false, error: '验证码' });
          return;
        }
        
        // 简单解析
        const titleMatch = data.match(/<h3[^>]*>([\s\S]*?)<\/h3>/i);
        if (titleMatch) {
          const title = titleMatch[1].replace(/<[^>]*>/g, '').trim();
          console.log(`✅ 首个结果：${title}`);
        }
        
        resolve({
          success: true,
          duration,
          htmlLength: data.length,
        });
      });
    }).on('error', (error) => {
      const duration = Date.now() - startTime;
      console.log(`❌ 请求失败：${error.message}`);
      resolve({
        success: false,
        error: error.message,
      });
    });
  });
}

async function main() {
  console.log('╔════════════════════════════════════════════╗');
  console.log('║  搜狗搜索测试                              ║');
  console.log('╚════════════════════════════════════════════╝');
  
  // 测试用例
  const tests = [
    '恐龙',
    '儿童故事',
    '为什么天空是蓝色的',
  ];
  
  for (const query of tests) {
    await testSogouSearch(query);
    // 延迟避免触发反爬
    await new Promise(resolve => setTimeout(resolve, 2000));
  }
  
  console.log('\n✅ 测试完成');
}

main();
```

---

## 🧪 测试计划

### 测试 1: 基本搜索

**命令**:
```bash
node tests/test-sogou-search.js
```

**预期**:
- ✅ 返回 HTTP 200
- ✅ 响应时间 <5 秒
- ✅ 包含搜索结果

---

### 测试 2: 中文搜索

**查询**: "恐龙"

**预期**:
- ✅ 返回恐龙相关内容
- ✅ 包含百科、视频、文章

---

### 测试 3: 儿童内容搜索

**查询**: "儿童故事"

**预期**:
- ✅ 返回儿童故事相关内容
- ✅ 内容适合儿童

---

### 测试 4: 复杂查询

**查询**: "为什么天空是蓝色的"

**预期**:
- ✅ 返回科普解释
- ✅ 包含多个来源

---

### 测试 5: 错误处理

**方法**: 断开网络

**预期**:
- ✅ 降级到本地知识库
- ✅ 返回友好错误信息

---

## 📊 验收标准

### 功能验收

- [ ] 搜索"恐龙"返回有效结果
- [ ] 搜索"儿童故事"返回有效结果
- [ ] 搜索"为什么天空是蓝色的"返回科普内容
- [ ] 错误时降级到本地知识库
- [ ] 无验证码触发

### 性能验收

| 指标 | 目标 | 实测 | 结果 |
|------|------|------|------|
| 响应时间 | <5s | 待测 | ⏳ |
| 成功率 | >90% | 待测 | ⏳ |
| 降级触发 | <1s | 待测 | ⏳ |

### 代码验收

- [ ] TypeScript 编译通过
- [ ] 无运行时错误
- [ ] 错误处理完善
- [ ] 日志记录完整

---

## 📝 任务清单

### CC 执行任务

#### Task-001: 实现搜狗搜索工具（60 分钟）
- [ ] 修改 `src/tools/webSearch.ts`
- [ ] 实现 `parseSogouHTML` 函数
- [ ] 实现 `stripHTML` 函数
- [ ] 实现 `fallbackToKnowledge` 函数
- [ ] 更新 `kidsSearchTool`
- [ ] 添加反爬控制

#### Task-002: 创建测试脚本（15 分钟）
- [ ] 创建 `tests/test-sogou-search.js`
- [ ] 实现基本测试逻辑
- [ ] 添加测试用例

#### Task-003: 测试验证（30 分钟）
- [ ] 运行测试脚本
- [ ] 验证搜索结果
- [ ] 测试错误处理
- [ ] 记录测试结果

#### Task-004: 文档更新（15 分钟）
- [ ] 更新 `README.md`
- [ ] 更新 `E2E_TEST_REPORT.md`
- [ ] 创建 `SOGOU_SEARCH_GUIDE.md`

---

## 🚀 开始执行

**立即开始 Task-001: 实现搜狗搜索工具**

完成后依次执行后续任务，最后进行完整验证测试。

---

**文档版本**: v1.0  
**创建时间**: 2026-02-23 19:10  
**优先级**: P0（严重问题修复）  
**目标评分**: 95/100
