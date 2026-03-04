/**
 * 工具注册中心
 * 所有 AI 可调用的工具在此注册
 */
import { imageSearchTool } from './imageSearchTool';

// 导出所有工具
export const tools = {
  imageSearch: imageSearchTool,
};

// 工具列表（供 Vercel AI SDK 使用）
export const toolList = {
  imageSearch: imageSearchTool,
};

export { imageSearchTool };
export default tools;