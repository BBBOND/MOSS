import { contextBridge, ipcRenderer } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'

// Custom APIs for renderer
export const api = {

  // 获取可用的模型列表 
  getAvailableModels: () => ipcRenderer.invoke('get-available-models'),
  
  // 选择模型文件
  selectModelFile: () => ipcRenderer.invoke('select-model-file'),
  
  // 加载模型
  loadModel: (modelPath: string) => ipcRenderer.invoke('load-model', modelPath),
  
  // 卸载模型
  unloadModel: () => ipcRenderer.invoke('unload-model'),
  
  // 获取模型状态
  getModelStatus: () => ipcRenderer.invoke('get-model-status'),
  
  // 获取模型信息
  getModelInfo: () => ipcRenderer.invoke('get-model-info'),
  
  // 获取默认模型目录路径
  getModelsDirectory: () => ipcRenderer.invoke('get-models-directory'),
  
  // 打开目录
  openDirectory: (dirPath: string) => ipcRenderer.invoke('open-directory', dirPath),
  
  // 与模型聊天
  chatWithModel: (message: string) => ipcRenderer.invoke('chat-with-model', message),
  
  // 监听模型加载进度
  onModelLoadingProgress: (callback: (progress: { stage: string; progress: number }) => void) => {
    ipcRenderer.on('model-loading-progress', (event, progress) => callback(progress));
  },
  
  // 移除模型加载进度监听
  removeModelLoadingProgressListener: () => {
    ipcRenderer.removeAllListeners('model-loading-progress');
  },

  // 监听聊天生成事件
  onChatGenerationStart: (callback: () => void) => {
    ipcRenderer.on('chat-generation-start', callback);
  },

  onChatGenerationComplete: (callback: (stats: any) => void) => {
    ipcRenderer.on('chat-generation-complete', (event, stats) => callback(stats));
  },

  onChatGenerationError: (callback: () => void) => {
    ipcRenderer.on('chat-generation-error', callback);
  },

  // 移除聊天事件监听
  removeChatEventListeners: () => {
    ipcRenderer.removeAllListeners('chat-generation-start');
    ipcRenderer.removeAllListeners('chat-generation-complete');
    ipcRenderer.removeAllListeners('chat-generation-error');
  }
}

// Use `contextBridge` APIs to expose Electron APIs to
// renderer only if context isolation is enabled, otherwise
// just add to the DOM global.
if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', electronAPI)
    contextBridge.exposeInMainWorld('moss', {
      model: api
    })
  } catch (error) {
    console.error(error)
  }
} else {
  // @ts-ignore (define in dts)
  window.electron = electronAPI
  // @ts-ignore (define in dts)
  window.moss = {
    model: api
  }
}
