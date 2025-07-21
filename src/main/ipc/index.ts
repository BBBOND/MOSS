import { ipcMain, shell, dialog } from 'electron';
import path from 'path';
import fs from 'fs';
import os from 'os';
import log from 'electron-log';

// 使用动态 import 来加载 node-llama-cpp
let llamaModule: any = null;

interface ModelState {
  llama?: any;
  model?: any;
  context?: any;
  session?: any;
  isLoading: boolean;
  isLoaded: boolean;
  modelPath?: string;
  error?: string;
}

interface ChatStats {
  totalTokens: number;
  promptTokens: number;
  completionTokens: number;
  timeTaken: number; // 毫秒
  tokensPerSecond: number;
}

let modelState: ModelState = {
  isLoading: false,
  isLoaded: false
};

// 获取默认模型目录路径
function getDefaultModelsDirectory(): string {
  // 使用用户主目录下的 .moss/models 文件夹，符合应用程序惯例
  const homeDir = os.homedir();
  return path.join(homeDir, '.moss', 'models');
}

// 动态加载 node-llama-cpp 模块
async function loadLlamaModule() {
  if (!llamaModule) {
    try {
      log.info('开始加载 node-llama-cpp 模块');
      llamaModule = await import('node-llama-cpp');
      log.info('node-llama-cpp 模块加载成功');
    } catch (error) {
      log.error('加载 node-llama-cpp 模块失败:', error);
      throw error;
    }
  }
  return llamaModule;
}

// 计算token数量的辅助函数
function estimateTokenCount(text: string): number {
  // 简单的token估算：大约每4个字符一个token（适用于英文），中文可能更少
  // 这是一个粗略估算，实际的tokenizer可能不同
  const chineseChars = (text.match(/[\u4e00-\u9fff]/g) || []).length;
  const otherChars = text.length - chineseChars;
  
  // 中文字符通常1-2个字符为1个token，其他字符约4个字符1个token
  const estimatedTokens = Math.ceil(chineseChars * 0.7 + otherChars / 4);
  log.debug(`文本长度: ${text.length}, 中文字符: ${chineseChars}, 其他字符: ${otherChars}, 估算token: ${estimatedTokens}`);
  return estimatedTokens;
}

export const loadFunctions = () => {
  log.info('注册 IPC 处理程序');
  
  // 获取可用的模型文件列表（从默认目录）
  ipcMain.handle('get-available-models', async () => {
    try {
      log.info('获取可用模型列表');
      const modelsDir = getDefaultModelsDirectory();
      log.info('模型目录路径:', modelsDir);
      
      if (!fs.existsSync(modelsDir)) {
        log.warn('模型目录不存在，正在创建:', modelsDir);
        try {
          fs.mkdirSync(modelsDir, { recursive: true });
          log.info('模型目录创建成功');
        } catch (error) {
          log.error('创建模型目录失败:', error);
          throw error;
        }
        return [];
      }
      
      const files = fs.readdirSync(modelsDir);
      log.debug('目录中的所有文件:', files);
      
      const modelFiles = files.filter(file => 
        file.endsWith('.gguf') || file.endsWith('.bin')
      );
      log.info(`找到 ${modelFiles.length} 个模型文件:`, modelFiles);
      
      const modelList = modelFiles.map(file => {
        const filePath = path.join(modelsDir, file);
        const stats = fs.statSync(filePath);
        return {
          name: file,
          path: filePath,
          size: stats.size
        };
      });
      
      log.debug('模型列表详情:', modelList);
      return modelList;
    } catch (error) {
      log.error('获取模型列表失败:', error);
      return [];
    }
  });

  // 选择模型文件
  ipcMain.handle('select-model-file', async () => {
    try {
      log.info('打开模型文件选择对话框');
      
      const result = await dialog.showOpenDialog({
        title: '选择模型文件',
        defaultPath: getDefaultModelsDirectory(),
        filters: [
          { name: 'GGUF 模型文件', extensions: ['gguf'] },
          { name: 'BIN 模型文件', extensions: ['bin'] },
          { name: '所有文件', extensions: ['*'] }
        ],
        properties: ['openFile']
      });

      if (result.canceled || result.filePaths.length === 0) {
        log.info('用户取消了文件选择');
        return {
          success: false,
          cancelled: true
        };
      }

      const selectedPath = result.filePaths[0];
      log.info('用户选择的模型文件:', selectedPath);

      // 验证文件是否存在
      if (!fs.existsSync(selectedPath)) {
        log.error('选择的文件不存在:', selectedPath);
        return {
          success: false,
          error: '选择的文件不存在'
        };
      }

      // 获取文件信息
      const stats = fs.statSync(selectedPath);
      const fileInfo = {
        name: path.basename(selectedPath),
        path: selectedPath,
        size: stats.size,
        directory: path.dirname(selectedPath)
      };

      log.info('文件信息:', fileInfo);

      return {
        success: true,
        file: fileInfo
      };
    } catch (error) {
      log.error('选择模型文件时发生错误:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error)
      };
    }
  });

  // 加载模型
  ipcMain.handle('load-model', async (event, modelPath: string) => {
    log.info('开始加载模型:', modelPath);
    const startTime = Date.now();
    
    try {
      if (modelState.isLoading) {
        const error = '模型正在加载中...';
        log.warn(error);
        throw new Error(error);
      }

      if (modelState.isLoaded) {
        const error = '模型已经加载，请先卸载当前模型';
        log.warn(error);
        throw new Error(error);
      }

      modelState.isLoading = true;
      modelState.error = undefined;
      
      // 检查模型文件是否存在
      if (!fs.existsSync(modelPath)) {
        throw new Error(`模型文件不存在: ${modelPath}`);
      }
      
      const fileStats = fs.statSync(modelPath);
      log.info(`模型文件大小: ${(fileStats.size / 1024 / 1024).toFixed(2)} MB`);
      
      // 发送加载进度更新
      event.sender.send('model-loading-progress', { stage: '初始化 Llama...', progress: 0 });
      log.info('阶段 1: 初始化 Llama...');
      
      // 动态加载模块
      const { getLlama, LlamaChatSession } = await loadLlamaModule();
      
      // 初始化 llama
      const llama = await getLlama();
      modelState.llama = llama;
      log.info('Llama 初始化完成');
      
      event.sender.send('model-loading-progress', { stage: '加载模型文件...', progress: 25 });
      log.info('阶段 2: 加载模型文件...');
      
      // 加载模型
      const model = await llama.loadModel({
        modelPath: modelPath
      });
      modelState.model = model;
      log.info('模型文件加载完成');
      
      event.sender.send('model-loading-progress', { stage: '创建上下文...', progress: 50 });
      log.info('阶段 3: 创建上下文...');
      
      // 创建上下文
      const context = await model.createContext({
        contextSize: 4096,
      });
      modelState.context = context;
      log.info('上下文创建完成，大小: 4096');
      
      event.sender.send('model-loading-progress', { stage: '初始化会话...', progress: 75 });
      log.info('阶段 4: 初始化会话...');
      
      // 创建聊天会话
      const session = new LlamaChatSession({
        contextSequence: context.getSequence()
      });
      modelState.session = session;
      log.info('聊天会话初始化完成');
      
      modelState.isLoading = false;
      modelState.isLoaded = true;
      modelState.modelPath = modelPath;
      
      const totalTime = Date.now() - startTime;
      log.info(`模型加载完成！总耗时: ${totalTime}ms`);
      
      event.sender.send('model-loading-progress', { stage: '加载完成', progress: 100 });
      
      return {
        success: true,
        message: '模型加载成功',
        modelPath: path.basename(modelPath)
      };
    } catch (error) {
      const totalTime = Date.now() - startTime;
      modelState.isLoading = false;
      modelState.error = error instanceof Error ? error.message : String(error);
      log.error(`模型加载失败，耗时: ${totalTime}ms，错误:`, error);
      return {
        success: false,
        error: modelState.error
      };
    }
  });

  // 卸载模型
  ipcMain.handle('unload-model', async () => {
    log.info('开始卸载模型');
    try {
      if (modelState.context) {
        log.debug('释放上下文资源');
        modelState.context.dispose();
      }
      if (modelState.model) {
        log.debug('释放模型资源');
        modelState.model.dispose();
      }
      
      const previousPath = modelState.modelPath;
      modelState = {
        isLoading: false,
        isLoaded: false
      };
      
      log.info('模型卸载成功，之前加载的模型:', previousPath);
      
      return {
        success: true,
        message: '模型卸载成功'
      };
    } catch (error) {
      log.error('模型卸载失败:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error)
      };
    }
  });

  // 获取模型状态
  ipcMain.handle('get-model-status', async () => {
    const status = {
      isLoading: modelState.isLoading,
      isLoaded: modelState.isLoaded,
      modelPath: modelState.modelPath,
      error: modelState.error
    };
    log.debug('模型状态查询:', status);
    return status;
  });

  // 发送消息给模型（带统计信息）
  ipcMain.handle('chat-with-model', async (event, message: string) => {
    log.info('收到聊天请求，消息长度:', message.length);
    log.debug('聊天消息内容:', message.substring(0, 100) + (message.length > 100 ? '...' : ''));
    
    try {
      if (!modelState.isLoaded || !modelState.session) {
        const error = '模型未加载';
        log.warn(error);
        throw new Error(error);
      }

      const startTime = Date.now();
      const promptTokens = estimateTokenCount(message);
      log.debug('估算输入tokens:', promptTokens);

      // 发送开始生成的事件
      event.sender.send('chat-generation-start');
      log.debug('开始生成回复');

      // 使用流式响应（如果支持）或普通响应
      let response: string;
      let actualPromptTokens = promptTokens;
      let actualCompletionTokens = 0;

      try {
        // 尝试获取更详细的token信息
        const result = await modelState.session.prompt(message, {
          // 一些可能的配置选项
          temperature: 0.7,
          maxTokens: 2048,
        });
        
        response = result;
        actualCompletionTokens = estimateTokenCount(response);
        log.debug('生成回复完成，回复长度:', response.length);
        
        // 如果结果包含token信息，使用实际值
        if (typeof result === 'object' && result.response) {
          response = result.response;
          if (result.usage) {
            actualPromptTokens = result.usage.prompt_tokens || promptTokens;
            actualCompletionTokens = result.usage.completion_tokens || actualCompletionTokens;
            log.debug('使用API返回的实际token数:', result.usage);
          }
        }
      } catch (error) {
        log.warn('高级API调用失败，回退到基本API:', error);
        // 如果高级API失败，使用基本API
        response = await modelState.session.prompt(message);
        actualCompletionTokens = estimateTokenCount(response);
      }

      const endTime = Date.now();
      const timeTaken = endTime - startTime;
      const totalTokens = actualPromptTokens + actualCompletionTokens;
      const tokensPerSecond = actualCompletionTokens / (timeTaken / 1000);

      const stats: ChatStats = {
        totalTokens,
        promptTokens: actualPromptTokens,
        completionTokens: actualCompletionTokens,
        timeTaken,
        tokensPerSecond: parseFloat(tokensPerSecond.toFixed(2))
      };

      log.info('聊天完成', {
        耗时: `${timeTaken}ms`,
        总tokens: totalTokens,
        输入tokens: actualPromptTokens,
        输出tokens: actualCompletionTokens,
        速度: `${stats.tokensPerSecond} tokens/s`
      });

      // 发送完成事件
      event.sender.send('chat-generation-complete', stats);

      return {
        success: true,
        response: response,
        stats: stats
      };
    } catch (error) {
      const endTime = Date.now();
      event.sender.send('chat-generation-error');
      
      log.error('聊天失败:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error)
      };
    }
  });

  // 获取模型信息
  ipcMain.handle('get-model-info', async () => {
    log.debug('获取模型信息请求');
    try {
      if (!modelState.isLoaded || !modelState.model) {
        const error = '模型未加载';
        log.warn(error);
        return {
          success: false,
          error: error
        };
      }

      // 尝试获取模型的详细信息
      const modelInfo = {
        name: modelState.modelPath ? path.basename(modelState.modelPath) : 'Unknown',
        contextSize: modelState.context?.contextSize || 4096,
        // 可以添加更多模型信息
      };

      log.debug('模型信息:', modelInfo);
      return {
        success: true,
        info: modelInfo
      };
    } catch (error) {
      log.error('获取模型信息失败:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error)
      };
    }
  });

  // 获取默认模型目录路径
  ipcMain.handle('get-models-directory', async () => {
    const modelsDir = getDefaultModelsDirectory();
    log.info('返回默认模型目录路径:', modelsDir);
    return modelsDir;
  });

  // 打开目录
  ipcMain.handle('open-directory', async (event, dirPath: string) => {
    try {
      log.info('请求打开目录:', dirPath);
      
      // 检查目录是否存在
      if (!fs.existsSync(dirPath)) {
        log.warn('目录不存在，尝试创建:', dirPath);
        fs.mkdirSync(dirPath, { recursive: true });
      }
      
      // 使用 shell.openPath 打开目录
      const result = await shell.openPath(dirPath);
      
      if (result) {
        log.error('打开目录失败:', result);
        return {
          success: false,
          error: `无法打开目录: ${result}`
        };
      } else {
        log.info('目录打开成功:', dirPath);
        return {
          success: true,
          message: '目录已打开'
        };
      }
    } catch (error) {
      log.error('打开目录时发生错误:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error)
      };
    }
  });
  
  log.info('所有 IPC 处理程序注册完成');
};