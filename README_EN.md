# MOSS - AI Assistant

> MOSS (Mobile Operating System) - A local AI chat application built with Electron + Vite + React + node-llama-cpp.
> 
> Inspired by the artificial intelligence system MOSS from Liu Cixin's "The Wandering Earth".

## ✨ Features

- 🤖 **Local Operation**: AI models run completely locally, no internet required, protecting privacy
- 📁 **Smart Management**: Visual model management interface with multiple loading options
- 💬 **Smooth Conversation**: Friendly chat interface with Markdown rendering support
- 📊 **Real-time Monitoring**: Loading progress, token statistics, response time and other detailed information
- 🎯 **Dual Options**: Default directory + manual selection for model loading
- 🔧 **Easy to Use**: One-click installation, ready to use out of the box

## 📍 Important Notice

**MOSS v1.0+ has changed the default model directory to `~/.moss/models`** for better compliance with application data storage conventions.

If you previously stored model files in the project root `./models/` folder, please run the following commands to migrate:

```bash
# Create new default directory
mkdir -p ~/.moss/models

# Migrate existing model files (if any)
mv ./models/*.gguf ~/.moss/models/ 2>/dev/null || true
mv ./models/*.bin ~/.moss/models/ 2>/dev/null || true
```

## 🚀 Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Prepare Model Files

#### Method 1 (Recommended): Default Directory
```bash
# Create models directory (app will auto-create)
mkdir -p ~/.moss/models

# Put .gguf files into default directory
cp your-model.gguf ~/.moss/models/
```

#### Method 2: Any Location
Place model files anywhere and use the in-app file selector to load them.

**Recommended Model Sources**:
- [Hugging Face](https://huggingface.co/models) - Search for "GGUF" format
- Popular models: Llama 2/3, Qwen, Mistral, CodeLlama, etc.

### 3. Start MOSS

```bash
npm start
```

### 4. Usage Flow

1. 🚀 Launch the app and go to **Model Management** page
2. 📂 Select a model: Choose from default directory list or manually select file
3. ⚡ Click **Load** button and wait for model initialization
4. 💬 Go to **AI Chat** page and start chatting with MOSS

## 📁 Project Structure

```
MOSS/
├── src/
│   ├── electron/          # Main process code
│   │   └── index.ts       # Model loading, IPC communication logic
│   ├── render/            # Renderer process code
│   │   ├── app.tsx        # Main app component
│   │   ├── pages/         # Page components
│   │   │   ├── ModelManager.tsx    # Model management interface
│   │   │   └── ChatInterface.tsx   # AI chat interface
│   │   └── components/    # Common components
│   │       └── MarkdownRenderer.tsx # Markdown renderer
│   ├── main.ts            # Electron main process entry
│   ├── preload.ts         # Secure IPC preload script
│   └── renderer.tsx       # React renderer process entry
├── scripts/               # Utility scripts
│   └── view-logs.js       # Log viewer
└── package.json

User Data Directory:
~/.moss/
└── models/                # Local model files directory
```

## 🛠 Tech Stack

- **🖥 Electron**: Cross-platform desktop application framework
- **⚡ Vite**: Modern build tool
- **⚛️ React**: Declarative user interface library
- **📘 TypeScript**: Type-safe JavaScript
- **🦙 node-llama-cpp**: Node.js bindings for LLaMA.cpp
- **📝 React-Markdown**: Markdown rendering support
- **📊 Electron-Log**: Complete logging system

## 🔧 Development Guide

### Development Mode

```bash
npm start
```

### Build & Release

```bash
# Package application
npm run package

# Create installer
npm run make

# Publish application
npm run publish
```

### View Logs

```bash
# View logs (with colors)
npm run logs

# Open logs directory
npm run logs:open

# Real-time log viewing
npm run logs:tail
```

## 📡 API Interface

### Main Process IPC Interface

- `get-available-models` - Get list of models in default directory
- `select-model-file` - Open file selector to choose model
- `load-model` - Load model from specified path
- `unload-model` - Unload current model
- `get-model-status` - Get model loading status
- `chat-with-model` - Send message to model
- `get-models-directory` - Get default models directory path
- `open-directory` - Open directory in system file manager

### Renderer Process API

```typescript
// Model management
const models = await window.moss.model.getAvailableModels();
const result = await window.moss.model.loadModel(modelPath);
const status = await window.moss.model.getModelStatus();

// File operations
const fileResult = await window.moss.model.selectModelFile();
await window.moss.model.openDirectory(dirPath);

// AI chat
const response = await window.moss.model.chatWithModel("Hello, MOSS!");

// Event listeners
window.moss.model.onModelLoadingProgress((progress) => {
  console.log(`${progress.stage}: ${progress.progress}%`);
});
```

## ⚙️ System Requirements

### Minimum Requirements
- **Memory**: 8GB RAM (for small to medium models)
- **Storage**: 10GB available space (depends on model size)
- **OS**: Windows 10/11, macOS 10.15+, Linux

### Recommended Configuration
- **Memory**: 16GB+ RAM (for large models)
- **Processor**: Modern CPU with AVX instruction set support
- **Storage**: SSD (faster model loading)

## 🔍 Troubleshooting

### Model Loading Failed

- ✅ Check model file format (only .gguf and .bin supported)
- ✅ Ensure sufficient system memory (at least 1.5x model size)
- ✅ Verify model file integrity
- ✅ Check application logs: `npm run logs`

### Application Startup Issues

- ✅ Confirm Node.js version >= 16
- ✅ Reinstall dependencies: `rm -rf node_modules && npm install`
- ✅ Check system compatibility (Apple Silicon requires Metal support)

### Performance Optimization

- 💡 Close unnecessary applications to free memory
- 💡 Use quantized model versions (e.g., Q4_0, Q5_1)
- 💡 Adjust model context size parameters

## 📈 Roadmap

- [ ] 🎨 Theme switching support
- [ ] 🌐 Multi-language internationalization
- [ ] 📂 Chat history management
- [ ] 🔌 Plugin system
- [ ] 🚀 Model recommendation engine

## 🤝 Contributing

Welcome to contribute code, report issues, or suggest improvements!

1. Fork this project
2. Create feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push branch: `git push origin feature/amazing-feature`
5. Submit Pull Request

## 📄 License

MIT License - See [LICENSE](LICENSE) file for details

## 👨‍💻 Author

**JinWeiyang**
- 📧 Email: jwy8645@gmail.com
- 🐙 GitHub: [BBBOND](https://github.com/BBBOND)

---

> 💡 "MOSS, calculate the probability of successfully restarting the Earth's engines." - "The Wandering Earth"
> 
> Now, let MOSS provide you with localized AI intelligence services.

## 📖 Language Versions

- **中文文档**: [README.md](README.md)
- **English Documentation**: README_EN.md (this file)

## 🔗 Additional Documentation

- [Icon Guide (English)](ICON_GUIDE_EN.md)
- [Icon Guide (中文)](ICON_GUIDE.md) 