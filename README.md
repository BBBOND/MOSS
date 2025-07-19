# MOSS - AI助手

> MOSS (Mobile Operating System) - 基于 Electron + Vite + React + node-llama-cpp 构建的本地 AI 聊天应用。
> 
> 灵感来自刘慈欣《流浪地球》中的人工智能系统 MOSS。

## ✨ 功能特性

- 🤖 **本地运行**: AI 模型完全在本地运行，无需联网，保护隐私
- 📁 **智能管理**: 可视化模型管理界面，支持多种加载方式
- 💬 **流畅对话**: 友好的聊天界面，支持 Markdown 渲染
- 📊 **实时监控**: 加载进度、Token 统计、响应时间等详细信息
- 🎯 **双重选择**: 默认目录 + 手动选择两种模型加载方式
- 🔧 **简单易用**: 一键安装，开箱即用

## 📍 重要说明

**MOSS v1.0+ 已将默认模型目录更改为 `~/.moss/models`**，这样更符合应用程序数据存储的标准惯例。

如果您之前在项目根目录的 `./models/` 文件夹中存放了模型文件，请运行以下命令迁移：

```bash
# 创建新的默认目录
mkdir -p ~/.moss/models

# 迁移现有模型文件（如果有的话）
mv ./models/*.gguf ~/.moss/models/ 2>/dev/null || true
mv ./models/*.bin ~/.moss/models/ 2>/dev/null || true
```

## 🚀 快速开始

### 1. 安装依赖

```bash
npm install
```

### 2. 准备模型文件

#### 方式一（推荐）：默认目录
```bash
# 创建模型目录（应用会自动创建）
mkdir -p ~/.moss/models

# 将 .gguf 文件放入默认目录
cp your-model.gguf ~/.moss/models/
```

#### 方式二：任意位置
将模型文件放在任意位置，使用应用内的文件选择器加载。

**推荐的模型来源**：
- [Hugging Face](https://huggingface.co/models) - 搜索 "GGUF" 格式
- 热门模型：Llama 2/3, Qwen, Mistral, CodeLlama 等

### 3. 启动 MOSS

```bash
npm start
```

### 4. 使用流程

1. 🚀 启动应用，进入 **模型管理** 页面
2. 📂 选择模型：从默认目录列表选择，或手动选择文件
3. ⚡ 点击 **加载** 按钮，等待模型初始化完成
4. 💬 前往 **AI 聊天** 页面，开始与 MOSS 对话

## 📁 项目结构

```
MOSS/
├── src/
│   ├── electron/          # 主进程代码
│   │   └── index.ts       # 模型加载、IPC 通信逻辑
│   ├── render/            # 渲染进程代码
│   │   ├── app.tsx        # 主应用组件
│   │   ├── pages/         # 页面组件
│   │   │   ├── ModelManager.tsx    # 模型管理界面
│   │   │   └── ChatInterface.tsx   # AI 聊天界面
│   │   └── components/    # 公共组件
│   │       └── MarkdownRenderer.tsx # Markdown 渲染器
│   ├── main.ts            # Electron 主进程入口
│   ├── preload.ts         # 安全的 IPC 预加载脚本
│   └── renderer.tsx       # React 渲染进程入口
├── scripts/               # 工具脚本
│   └── view-logs.js       # 日志查看器
└── package.json

用户数据目录:
~/.moss/
└── models/                # 本地模型文件目录
```

## 🛠 技术栈

- **🖥 Electron**: 跨平台桌面应用框架
- **⚡ Vite**: 现代化构建工具
- **⚛️ React**: 声明式用户界面库
- **📘 TypeScript**: 类型安全的 JavaScript
- **🦙 node-llama-cpp**: LLaMA.cpp 的 Node.js 绑定
- **📝 React-Markdown**: Markdown 渲染支持
- **📊 Electron-Log**: 完整的日志系统

## 🔧 开发指南

### 开发模式

```bash
npm start
```

### 构建发布

```bash
# 打包应用
npm run package

# 制作安装包
npm run make

# 发布应用
npm run publish
```

### 查看日志

```bash
# 查看日志（带颜色）
npm run logs

# 打开日志目录
npm run logs:open

# 实时查看日志
npm run logs:tail
```

## 📡 API 接口

### 主进程 IPC 接口

- `get-available-models` - 获取默认目录中的模型列表
- `select-model-file` - 打开文件选择器选择模型
- `load-model` - 加载指定路径的模型
- `unload-model` - 卸载当前模型
- `get-model-status` - 获取模型加载状态
- `chat-with-model` - 发送消息给模型
- `get-models-directory` - 获取默认模型目录路径
- `open-directory` - 在系统文件管理器中打开目录

### 渲染进程 API

```typescript
// 模型管理
const models = await window.electronAPI.model.getAvailableModels();
const result = await window.electronAPI.model.loadModel(modelPath);
const status = await window.electronAPI.model.getModelStatus();

// 文件操作
const fileResult = await window.electronAPI.model.selectModelFile();
await window.electronAPI.model.openDirectory(dirPath);

// AI 对话
const response = await window.electronAPI.model.chatWithModel("你好，MOSS！");

// 事件监听
window.electronAPI.model.onModelLoadingProgress((progress) => {
  console.log(`${progress.stage}: ${progress.progress}%`);
});
```

## ⚙️ 系统要求

### 最低配置
- **内存**: 8GB RAM（用于运行中小型模型）
- **存储**: 10GB 可用空间（取决于模型大小）
- **操作系统**: Windows 10/11, macOS 10.15+, Linux

### 推荐配置
- **内存**: 16GB+ RAM（用于大型模型）
- **处理器**: 支持 AVX 指令集的现代 CPU
- **存储**: SSD 固态硬盘（更快的模型加载）

## 🔍 故障排除

### 模型加载失败

- ✅ 检查模型文件格式（仅支持 .gguf 和 .bin）
- ✅ 确认系统内存充足（至少为模型大小的 1.5 倍）
- ✅ 验证模型文件完整性
- ✅ 查看应用日志：`npm run logs`

### 应用启动问题

- ✅ 确认 Node.js 版本 >= 16
- ✅ 重新安装依赖：`rm -rf node_modules && npm install`
- ✅ 检查系统兼容性（Apple Silicon 需要 Metal 支持）

### 性能优化

- 💡 关闭不必要的应用释放内存
- 💡 使用量化版本的模型（如 Q4_0, Q5_1）
- 💡 调整模型上下文大小参数

## 📈 路线图

- [ ] 🎨 主题切换支持
- [ ] 🌐 多语言国际化
- [ ] 📂 对话历史管理
- [ ] 🔌 插件系统
- [ ] 🚀 模型推荐引擎

## 🤝 贡献

欢迎贡献代码、报告问题或提出建议！

1. Fork 本项目
2. 创建特性分支：`git checkout -b feature/amazing-feature`
3. 提交更改：`git commit -m 'Add amazing feature'`
4. 推送分支：`git push origin feature/amazing-feature`
5. 提交 Pull Request

## 📄 许可证

MIT License - 详见 [LICENSE](LICENSE) 文件

## 👨‍💻 作者

**JinWeiyang**
- 📧 Email: jwy8645@gmail.com
- 🐙 GitHub: [BBBOND](https://github.com/BBBOND)

---

> 💡 "MOSS，为我计算一下重启地球引擎的成功概率。" - 《流浪地球》
> 
> 现在，让 MOSS 为你提供本地化的 AI 智能服务。

## 📖 多语言版本

- **中文文档**: README.md (本文件)
- **English Documentation**: [README_EN.md](README_EN.md)

## 🔗 相关文档

- [图标指南 (中文)](ICON_GUIDE.md)
- [Icon Guide (English)](ICON_GUIDE_EN.md) 