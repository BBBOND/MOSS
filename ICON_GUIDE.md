# 🎨 MOSS 图标指南

## 📁 图标文件位置

- **主图标**: `assets/icon-simple.svg` (推荐使用)
- **备用图标**: `assets/icon.svg` (带特效版本)

## 🌟 图标设计理念

MOSS图标设计灵感来自《流浪地球》中的人工智能系统：

- **🎯 核心元素**: 科技感的圆形"眼睛"
- **🔗 连接线**: 代表数据传输和网络连接
- **🌈 色彩**: 蓝青色渐变，体现未来科技感
- **⚡ 视觉**: 简洁现代，易于识别

## 🛠 生成图标步骤

### 方法一：在线转换 (推荐)

1. **打开 SVG 文件**：`assets/icon-simple.svg`
2. **在线转换工具**：
   - [Convertio](https://convertio.co/svg-png/) - 免费，支持批量
   - [CloudConvert](https://cloudconvert.com/svg-to-png) - 高质量转换
   - [Canva](https://www.canva.com/) - 可进一步编辑

3. **生成所需尺寸**：
   ```
   16x16, 32x32, 48x48, 64x64, 128x128, 256x256, 512x512, 1024x1024
   ```

4. **保存位置**：将生成的PNG文件保存到 `assets/icons/` 目录

### 方法二：使用设计工具

1. **Adobe Illustrator** / **Inkscape** / **Figma**
2. 打开 `assets/icon-simple.svg`
3. 导出为PNG格式，不同尺寸
4. 保存到 `assets/icons/` 目录

### 方法三：专用工具

```bash
# 安装 electron-icon-maker
npm install -g electron-icon-maker

# 生成图标 (需要先有一个1024x1024的PNG)
electron-icon-maker --input=assets/icon-1024.png --output=assets/icons/
```

## 📦 Electron 集成

### 更新 forge.config.ts

```typescript
export default {
  makers: [
    {
      name: '@electron-forge/maker-squirrel',
      config: {
        iconUrl: 'https://your-domain.com/icon.ico',
        setupIcon: './assets/icons/icon.ico'
      }
    },
    {
      name: '@electron-forge/maker-zip',
      platforms: ['darwin'],
      config: {
        icon: './assets/icons/icon.icns'
      }
    },
    {
      name: '@electron-forge/maker-deb',
      config: {
        options: {
          icon: './assets/icons/icon.png'
        }
      }
    }
  ]
};
```

### 主进程中设置图标

```typescript
// src/main.ts
const mainWindow = new BrowserWindow({
  width: 1200,
  height: 800,
  title: 'MOSS - AI助手',
  icon: path.join(__dirname, '../assets/icons/icon.png'), // 添加这行
  webPreferences: {
    preload: path.join(__dirname, 'preload.js'),
  },
});
```

## 🔄 快速图标生成

如果你想要快速开始，可以先用这个简单的PNG图标：

```bash
# 创建临时图标目录
mkdir -p assets/icons

# 从在线工具下载生成的PNG文件，或使用以下命令行工具：
# (需要安装 ImageMagick)
convert assets/icon-simple.svg -resize 512x512 assets/icons/icon.png
convert assets/icon-simple.svg -resize 256x256 assets/icons/icon-256.png
convert assets/icon-simple.svg -resize 128x128 assets/icons/icon-128.png
```

## 🎯 所需图标文件清单

- [ ] `icon.png` (512x512) - 主图标
- [ ] `icon.ico` (多尺寸) - Windows
- [ ] `icon.icns` (多尺寸) - macOS
- [ ] `icon-16.png` ~ `icon-1024.png` - 各种尺寸

## 🚀 应用图标后

1. **重新构建应用**：`npm run make`
2. **检查效果**：查看任务栏、Dock、文件管理器中的图标
3. **调整优化**：根据实际效果调整设计

## 💡 设计建议

- **保持简洁**：图标在小尺寸下仍需清晰可见
- **高对比度**：确保在深色/浅色背景下都清晰
- **一致性**：与应用界面色彩保持一致
- **可缩放性**：矢量设计，适配所有尺寸

---

🎨 **现在开始为 MOSS 创建独特的视觉标识吧！** 