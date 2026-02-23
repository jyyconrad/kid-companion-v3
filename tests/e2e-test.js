#!/usr/bin/env node

/**
 * v3.7 端到端真实测试
 * 
 * 测试内容:
 * 1. DuckDuckGo webSearch API - 真实调用
 * 2. r.jina.ai websiteReader - 真实调用
 * 3. 完整工作流 - 搜索 + 阅读
 */

const https = require('https');

// 颜色输出
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

function log(color, message) {
  console.log(`${color}${message}${colors.reset}`);
}

// 测试 1: DuckDuckGo webSearch API
async function testWebSearch(query) {
  log(colors.cyan, '\n🔍 测试 1: DuckDuckGo webSearch API');
  log(colors.blue, `查询：${query}`);
  
  const url = `https://api.duckduckgo.com/?q=${encodeURIComponent(query)}&format=json&no_redirect=1&no_html=1&skip_disamb=1`;
  
  return new Promise((resolve, reject) => {
    const startTime = Date.now();
    
    https.get(url, {
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'KidCompanion/3.7',
      },
    }, (res) => {
      let data = '';
      
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        const duration = Date.now() - startTime;
        
        try {
          const result = JSON.parse(data);
          
          log(colors.green, `✅ 响应时间：${duration}ms`);
          log(colors.green, `✅ 状态码：${res.statusCode}`);
          
          // 分析结果
          if (result.Heading) {
            log(colors.green, `✅ 主答案：${result.Heading}`);
          }
          if (result.Abstract) {
            log(colors.green, `✅ 摘要：${result.Abstract.slice(0, 100)}...`);
          }
          if (result.RelatedTopics && result.RelatedTopics.length > 0) {
            log(colors.green, `✅ 相关主题：${result.RelatedTopics.length} 个`);
            result.RelatedTopics.slice(0, 2).forEach((topic, i) => {
              log(colors.blue, `   [${i+1}] ${topic.Text?.slice(0, 80)}...`);
            });
          }
          
          resolve({
            success: true,
            duration,
            data: result,
          });
        } catch (error) {
          log(colors.red, `❌ 解析失败：${error.message}`);
          resolve({
            success: false,
            error: error.message,
          });
        }
      });
    }).on('error', (error) => {
      const duration = Date.now() - startTime;
      log(colors.red, `❌ 请求失败：${error.message}`);
      log(colors.red, `⏱️ 耗时：${duration}ms`);
      resolve({
        success: false,
        error: error.message,
      });
    });
  });
}

// 测试 2: r.jina.ai websiteReader
async function testWebsiteReader(url) {
  log(colors.cyan, '\n📖 测试 2: r.jina.ai websiteReader');
  log(colors.blue, `URL: ${url}`);
  
  const readerUrl = `https://r.jina.ai/${url}`;
  
  return new Promise((resolve, reject) => {
    const startTime = Date.now();
    
    https.get(readerUrl, {
      headers: {
        'Accept': 'application/json',
        'X-With-Generated-Alt': 'true',
        'User-Agent': 'KidCompanion/3.7',
      },
    }, (res) => {
      let data = '';
      
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        const duration = Date.now() - startTime;
        
        try {
          const result = JSON.parse(data);
          
          log(colors.green, `✅ 响应时间：${duration}ms`);
          log(colors.green, `✅ 状态码：${res.statusCode}`);
          
          if (result.data) {
            const { title, content, description } = result.data;
            
            if (title) {
              log(colors.green, `✅ 标题：${title}`);
            }
            if (content) {
              log(colors.green, `✅ 内容长度：${content.length} 字符`);
              log(colors.blue, `   预览：${content.slice(0, 100)}...`);
            }
            if (description) {
              log(colors.green, `✅ 描述：${description.slice(0, 80)}...`);
            }
          }
          
          resolve({
            success: true,
            duration,
            data: result,
          });
        } catch (error) {
          log(colors.red, `❌ 解析失败：${error.message}`);
          log(colors.yellow, `原始数据：${data.slice(0, 200)}...`);
          resolve({
            success: false,
            error: error.message,
          });
        }
      });
    }).on('error', (error) => {
      const duration = Date.now() - startTime;
      log(colors.red, `❌ 请求失败：${error.message}`);
      log(colors.red, `⏱️ 耗时：${duration}ms`);
      resolve({
        success: false,
        error: error.message,
      });
    });
  });
}

// 测试 3: 完整工作流
async function testFullWorkflow(query) {
  log(colors.cyan, '\n🔄 测试 3: 完整工作流（搜索 + 阅读）');
  log(colors.blue, `用户问题：${query}`);
  
  // 步骤 1: 搜索
  const searchResult = await testWebSearch(query);
  
  if (!searchResult.success || !searchResult.data.RelatedTopics?.length) {
    log(colors.yellow, '⚠️  搜索结果为空，跳过阅读测试');
    return;
  }
  
  // 步骤 2: 读取第一个相关主题的 URL
  const firstTopic = searchResult.data.RelatedTopics[0];
  if (firstTopic.FirstURL) {
    log(colors.blue, `\n📖 读取第一个相关主题：${firstTopic.FirstURL}`);
    await testWebsiteReader(firstTopic.FirstURL);
  }
  
  log(colors.green, '\n✅ 完整工作流测试完成');
}

// 主函数
async function main() {
  log(colors.cyan, '╔════════════════════════════════════════════╗');
  log(colors.cyan, '║  KidCompanion v3.7 端到端真实测试          ║');
  log(colors.cyan, '╚════════════════════════════════════════════╝');
  log(colors.blue, '\n开始时间：', new Date().toISOString());
  
  // 测试用例
  const testQuery = '恐龙';
  const testUrl = 'https://zh.wikipedia.org/zh-cn/恐龙';
  
  try {
    // 测试 1: DuckDuckGo webSearch
    await testWebSearch(testQuery);
    
    // 测试 2: r.jina.ai websiteReader
    await testWebsiteReader(testUrl);
    
    // 测试 3: 完整工作流
    await testFullWorkflow(testQuery);
    
    // 总结
    log(colors.green, '\n╔════════════════════════════════════════════╗');
    log(colors.green, '║  ✅ 所有测试完成！                        ║');
    log(colors.green, '╚════════════════════════════════════════════╝');
    
  } catch (error) {
    log(colors.red, '\n❌ 测试中断：', error.message);
    process.exit(1);
  }
}

// 运行测试
main();
