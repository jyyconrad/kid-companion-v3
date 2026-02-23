# 必应搜索 API 集成实施计划

**版本**: v3.7.1  
**优先级**: P0（严重问题修复）  
**目标评分**: 95/100

---

## 🎯 问题背景

### 当前问题

**DuckDuckGo API 被墙**，导致：
- ❌ webSearch 工具完全不可用
- ❌ AI 无法获取实时网络信息
- ❌ 搜索功能失效

**测试结果**（2026-02-23 18:50）:
```bash
# DuckDuckGo - 超时
timeout 10 curl -s "https://api.duckduckgo.com/?q=test&format=json"
# ERROR: 请求超时或失败，退出码：124

# r.jina.ai - 正常
timeout 10 curl -s "https://r.jina.ai/https://example.com"
# ✅ 返回内容正常
```

---

## 📋 解决方案

### 采用方案：必应搜索 API

**理由**:
- ✅ 国内可访问（Azure 中国）
- ✅ 免费额度：1000 次/月（足够日常使用）
- ✅ 搜索结果质量高
- ✅ 支持中文
- ✅ API 简单易用

**备选方案**:
- SerpAPI（付费，100 次/月免费）
- 本地知识库（降级方案，离线可用）

---

## 🔧 实施步骤

### Step 1: 注册必应搜索 API

**网址**: https://www.microsoft.com/en-us/bing/apis/bing-web-search-api

**步骤**:
1. 登录 Azure 账号（免费）
2. 创建 "Bing Search v7" 资源
3. 选择免费层级（F0: 1000 次/月）
4. 获取 API Key 和 Endpoint

**预期结果**:
```
Endpoint: https://api.bing.microsoft.com/v7.0/search
API Key: xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

---

### Step 2: 更新环境变量

**文件**: `.env.example`

**新增内容**:
```env
# 必应搜索 API 配置
BING_SEARCH_ENDPOINT=https://api.bing.microsoft.com/v7.0/search
BING_SEARCH_KEY=your_bing_api_key_here

# 硅基流动 API（保留）
SILICONFLOW_API_KEY=your_siliconflow_key
SILICONFLOW_BASE_URL=https://api.siliconflow.cn/v1
```

**操作**:
```bash
cd /root/.openclaw/workspace-coding/projects/kid-companion-v3
cp .env.example .env
# 编辑 .env 填入真实的 API Key
```

---

### Step 3: 修改 webSearch.ts

**文件**: `src/tools/webSearch.ts`

**修改前**（DuckDuckGo）:
```typescript
const url = `https://api.duckduckgo.com/?q=${encodeURIComponent(query)}&format=json`;

const response = await fetch(url, {
  headers: {
    'Accept': 'application/json',
  },
});

const data = await response.json();
// 处理 DuckDuckGo 返回格式
```

**修改后**（必应搜索）:
```typescript
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const BING_ENDPOINT = process.env.BING_SEARCH_ENDPOINT || 'https://api.bing.microsoft.com/v7.0/search';
const BING_KEY = process.env.BING_SEARCH_KEY;

export const webSearchTool = tool({
  description: '搜索网络信息，获取实时知识和新闻（使用必应搜索）',
  parameters: z.object({
    query: z.string().describe('搜索关键词'),
    numResults: z.number().optional().describe('返回数量 (默认 5)'),
  }),
  execute: async ({ query, numResults = 5 }: { query: string; numResults?: number }) => {
    try {
      // 尝试必应搜索
      const response = await fetch(
        `${BING_ENDPOINT}?q=${encodeURIComponent(query)}&count=${numResults}&mkt=zh-CN`,
        {
          headers: {
            'Ocp-Apim-Subscription-Key': BING_KEY!,
            'User-Agent': 'KidCompanion/3.7.1',
          },
        }
      );

      if (!response.ok) {
        throw new Error(`必应搜索返回 ${response.status}`);
      }

      const data: BingSearchResponse = await response.json();
      
      // 转换为统一格式
      const results: SearchResult[] = (data.webPages?.value || []).map(item => ({
        title: item.name,
        url: item.url,
        snippet: item.snippet,
      }));

      return {
        success: true,
        query,
        results,
        count: results.length,
        source: 'Bing Search',
      };
    } catch (error: any) {
      console.error('必应搜索失败，降级到本地知识库:', error);
      
      // 降级到本地知识库
      return await fallbackToKnowledge(query);
    }
  },
}) as any;

// 降级函数
async function fallbackToKnowledge(query: string) {
  try {
    const knowledgeJson = await AsyncStorage.getItem('@knowledge_base');
    const knowledge: KnowledgeItem[] = knowledgeJson ? JSON.parse(knowledgeJson) : [];
    
    const results = knowledge.filter(item => 
      item.title.toLowerCase().includes(query.toLowerCase()) ||
      item.content.toLowerCase().includes(query.toLowerCase())
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

// 必应搜索响应类型
interface BingSearchResponse {
  webPages?: {
    value: Array<{
      name: string;
      url: string;
      snippet: string;
    }>;
  };
}
```

---

### Step 4: 更新配置界面

**文件**: `src/screens/ApiConfigScreen.tsx`

**新增配置项**:
```typescript
// 必应搜索配置
const [bingEndpoint, setBingEndpoint] = useState('https://api.bing.microsoft.com/v7.0/search');
const [bingKey, setBingKey] = useState('');

// 测试必应搜索
const testBingSearch = async () => {
  try {
    const response = await fetch(
      `${bingEndpoint}?q=test&count=1`,
      {
        headers: {
          'Ocp-Apim-Subscription-Key': bingKey,
        },
      }
    );
    
    if (response.ok) {
      Alert.alert('✅ 必应搜索测试成功');
    } else {
      Alert.alert('❌ 必应搜索测试失败', `HTTP ${response.status}`);
    }
  } catch (error: any) {
    Alert.alert('❌ 必应搜索测试失败', error.message);
  }
};

// UI 新增
<View style={styles.section}>
  <Text style={styles.sectionTitle}>必应搜索配置</Text>
  <TextInput
    style={styles.input}
    placeholder="API Endpoint"
    value={bingEndpoint}
    onChangeText={setBingEndpoint}
  />
  <TextInput
    style={styles.input}
    placeholder="API Key"
    value={bingKey}
    onChangeText={setBingKey}
    secureTextEntry
  />
  <Button title="测试必应搜索" onPress={testBingSearch} />
</View>
```

---

### Step 5: 更新配置管理

**文件**: `src/utils/configManager.ts`

**新增配置项**:
```typescript
interface AppConfig {
  // ... 现有配置
  bingSearch?: {
    endpoint: string;
    key: string;
  };
}

// 保存配置
export const aiUpdateConfig = async (
  section: string,
  field: string,
  value: any
): Promise<{ success: boolean; message: string }> => {
  // ... 现有逻辑
  
  // 新增：必应搜索配置
  if (section === 'bingSearch') {
    config.bingSearch = { ...config.bingSearch, [field]: value };
  }
  
  // ... 保存逻辑
};
```

---

### Step 6: 更新文档

**文件**: `README.md`

**新增内容**:
```markdown
## 必应搜索 API 配置

### 获取 API Key

1. 访问 https://www.microsoft.com/en-us/bing/apis/bing-web-search-api
2. 登录 Azure 账号（免费）
3. 创建 "Bing Search v7" 资源
4. 选择免费层级（F0: 1000 次/月）
5. 获取 API Key 和 Endpoint

### 配置方法

**方法 1: 环境变量**
```bash
# .env 文件
BING_SEARCH_ENDPOINT=https://api.bing.microsoft.com/v7.0/search
BING_SEARCH_KEY=your_api_key_here
```

**方法 2: App 内配置**
1. 打开设置 → API 配置
2. 填写必应搜索 Endpoint 和 Key
3. 点击"测试必应搜索"验证
```

---

## 🧪 测试计划

### 测试 1: API 连通性

```bash
curl -v "https://api.bing.microsoft.com/v7.0/search?q=test" \
  -H "Ocp-Apim-Subscription-Key: YOUR_KEY"
```

**预期**: HTTP 200，返回搜索结果

---

### 测试 2: 中文搜索

```bash
curl -v "https://api.bing.microsoft.com/v7.0/search?q=恐龙&mkt=zh-CN" \
  -H "Ocp-Apim-Subscription-Key: YOUR_KEY"
```

**预期**: 返回中文搜索结果

---

### 测试 3: 儿童内容搜索

```bash
curl -v "https://api.bing.microsoft.com/v7.0/search?q=儿童故事&mkt=zh-CN" \
  -H "Ocp-Apim-Subscription-Key: YOUR_KEY"
```

**预期**: 返回儿童故事相关内容

---

### 测试 4: 降级策略

**方法**: 使用错误的 API Key

**预期**: 
- 必应搜索失败
- 自动降级到本地知识库
- 返回本地知识结果

---

## 📊 验收标准

### 功能验收

- [ ] 必应搜索 API 调用成功
- [ ] 中文搜索正常
- [ ] 儿童内容搜索正常
- [ ] 降级策略有效
- [ ] 配置界面可用

### 性能验收

| 指标 | 目标 | 实测 |
|------|------|------|
| 响应时间 | <3s | 待测 |
| 成功率 | >95% | 待测 |
| 降级触发 | <1s | 待测 |

### 代码验收

- [ ] TypeScript 编译通过
- [ ] 无运行时错误
- [ ] 错误处理完善
- [ ] 日志记录完整

---

## 📝 任务清单

### CC 执行任务

#### Task-001: 注册必应 API（30 分钟）
- [ ] 注册 Azure 账号
- [ ] 创建 Bing Search 资源
- [ ] 获取 API Key 和 Endpoint
- [ ] 测试 API 连通性

#### Task-002: 更新代码（60 分钟）
- [ ] 修改 `src/tools/webSearch.ts`
- [ ] 添加降级函数
- [ ] 更新类型定义
- [ ] 添加错误处理

#### Task-003: 配置界面（30 分钟）
- [ ] 修改 `src/screens/ApiConfigScreen.tsx`
- [ ] 新增必应配置项
- [ ] 添加测试按钮
- [ ] 保存配置到 AsyncStorage

#### Task-004: 测试验证（30 分钟）
- [ ] API 连通性测试
- [ ] 中文搜索测试
- [ ] 降级策略测试
- [ ] 性能测试

#### Task-005: 文档更新（15 分钟）
- [ ] 更新 README.md
- [ ] 更新 .env.example
- [ ] 创建 BING_SETUP.md

---

## 🎯 预期效果

### 修复前

| 功能 | 状态 |
|------|------|
| webSearch | ❌ 不可用（超时） |
| AI 工作流 | ❌ 中断 |
| 用户体验 | ❌ 差 |

### 修复后

| 功能 | 状态 |
|------|------|
| webSearch | ✅ 可用（必应） |
| 降级策略 | ✅ 可用（本地知识库） |
| AI 工作流 | ✅ 完整 |
| 用户体验 | ✅ 良好 |

---

## 📈 评分提升

| 维度 | 修复前 | 修复后 | 提升 |
|------|--------|--------|------|
| 功能完整性 | 8.5/10 | 9.5/10 | +1 |
| API 可用性 | 5/10 | 9/10 | +4 |
| 代码质量 | 8.5/10 | 9/10 | +0.5 |
| 用户体验 | 8/10 | 9/10 | +1 |

**总体评分**: **88/100** → **93-95/100**

---

## 🚀 开始执行

**立即开始 Task-001: 注册必应 API**

完成后依次执行后续任务。

---

**文档版本**: v1.0  
**创建时间**: 2026-02-23 18:55  
**优先级**: P0（严重问题修复）
