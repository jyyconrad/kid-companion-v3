#!/usr/bin/env node

/**
 * 搜狗搜索测试脚本
 * 
 * 测试内容:
 * 1. 基本搜索功能
 * 2. 中文搜索
 * 3. 儿童内容搜索
 * 4. 错误处理
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

// 测试搜狗搜索
function testSogouSearch(query) {
  return new Promise((resolve, reject) => {
    const url = `https://www.sogou.com/web?query=${encodeURIComponent(query)}`;
    
    log(colors.cyan, `\n🔍 测试搜索：${query}`);
    log(colors.blue, `URL: ${url}`);
    
    const startTime = Date.now();
    
    https.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
      },
    }, (res) => {
      let data = '';
      
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        const duration = Date.now() - startTime;
        
        log(colors.green, `✅ 响应时间：${duration}ms`);
        log(colors.green, `✅ HTTP 状态：${res.statusCode}`);
        log(colors.green, `✅ 响应大小：${data.length} bytes`);
        
        // 检查是否返回验证码
        if (data.includes('captcha') || data.includes('验证码')) {
          log(colors.red, '❌ 触发验证码');
          resolve({ success: false, error: '验证码' });
          return;
        }
        
        // 简单解析 HTML
        const titleRegex = /<h3[^>]*class="[^"]*"(?:[^>]*>)?([\s\S]*?)<\/h3>/gi;
        const titles = [...data.matchAll(titleRegex)]
          .map(m => m[1].replace(/<[^>]*>/g, '').trim())
          .filter(t => t.length > 0 && t.length < 200)
          .slice(0, 3);
        
        if (titles.length > 0) {
          log(colors.green, `✅ 找到 ${titles.length} 个结果`);
          titles.forEach((title, i) => {
            log(colors.blue, `   [${i+1}] ${title}`);
          });
        } else {
          log(colors.yellow, '⚠️  未找到结果');
        }
        
        resolve({
          success: true,
          duration,
          htmlLength: data.length,
          resultCount: titles.length,
        });
      });
    }).on('error', (error) => {
      const duration = Date.now() - startTime;
      log(colors.red, `❌ 请求失败：${error.message}`);
      log(colors.red, `⏱️  耗时：${duration}ms`);
      resolve({
        success: false,
        error: error.message,
      });
    });
  });
}

// 主函数
async function main() {
  log(colors.cyan, '╔════════════════════════════════════════════╗');
  log(colors.cyan, '║  搜狗搜索测试                              ║');
  log(colors.cyan, '╚════════════════════════════════════════════╝');
  log(colors.blue, '\n开始时间：', new Date().toISOString());
  
  // 测试用例
  const tests = [
    { name: '基本搜索', query: '恐龙' },
    { name: '儿童内容', query: '儿童故事' },
    { name: '科普问题', query: '为什么天空是蓝色的' },
  ];
  
  const results = [];
  
  for (const test of tests) {
    const result = await testSogouSearch(test.query);
    results.push({
      name: test.name,
      query: test.query,
      ...result,
    });
    
    // 延迟避免触发反爬（2 秒）
    await new Promise(resolve => setTimeout(resolve, 2000));
  }
  
  // 汇总结果
  log(colors.cyan, '\n╔════════════════════════════════════════════╗');
  log(colors.cyan, '║  测试结果汇总                              ║');
  log(colors.cyan, '╚════════════════════════════════════════════╝');
  
  const successCount = results.filter(r => r.success).length;
  const totalCount = results.length;
  
  log(colors.blue, `\n总测试数：${totalCount}`);
  log(colors.green, `成功：${successCount}`);
  log(colors.red, `失败：${totalCount - successCount}`);
  
  if (successCount === totalCount) {
    log(colors.green, '\n✅ 所有测试通过！');
  } else {
    log(colors.yellow, '\n⚠️  部分测试失败');
  }
  
  // 详细结果
  log(colors.cyan, '\n详细结果:');
  results.forEach((r, i) => {
    const status = r.success ? '✅' : '❌';
    const duration = r.duration ? `${r.duration}ms` : 'N/A';
    log(colors.blue, `[${i+1}] ${status} ${r.name}: ${r.query} (${duration})`);
  });
  
  log(colors.green, '\n✅ 测试完成');
}

// 运行测试
main().catch(error => {
  log(colors.red, '❌ 测试中断:', error.message);
  process.exit(1);
});
