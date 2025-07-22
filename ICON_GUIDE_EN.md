# 🎨 MOSS Icon Guide

## 📁 Icon File Locations

- **Main Icon**: `assets/icon-simple.svg` (recommended)
- **Alternative Icon**: `assets/icon.svg` (version with effects)

## 🌟 Icon Design Philosophy

MOSS icon design is inspired by the artificial intelligence system from "The Wandering Earth":

- **🎯 Core Element**: Tech-style circular "eye"
- **🔗 Connection Lines**: Representing data transmission and network connectivity
- **🌈 Colors**: Blue-cyan gradient, embodying futuristic technology
- **⚡ Visual**: Simple and modern, easy to recognize

## 🛠 Icon Generation Steps

### Method 1: Online Conversion (Recommended)

1. **Open SVG File**: `assets/icon-simple.svg`
2. **Online Conversion Tools**:
   - [Convertio](https://convertio.co/svg-png/) - Free, supports batch processing
   - [CloudConvert](https://cloudconvert.com/svg-to-png) - High-quality conversion
   - [Canva](https://www.canva.com/) - Can be further edited

3. **Generate Required Sizes**:
   ```
   16x16, 32x32, 48x48, 64x64, 128x128, 256x256, 512x512, 1024x1024
   ```

4. **Save Location**: Save generated PNG files to `assets/icons/` directory

### Method 2: Using Design Tools

1. **Adobe Illustrator** / **Inkscape** / **Figma**
2. Open `assets/icon-simple.svg`
3. Export as PNG format in different sizes
4. Save to `assets/icons/` directory

### Method 3: Specialized Tools

```bash
# Install electron-icon-maker
npm install -g electron-icon-maker

# Generate icons (requires a 1024x1024 PNG first)
electron-icon-maker --input=assets/icon-1024.png --output=assets/icons/
```

## 📦 Electron Integration

### Update forge.config.ts

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

### Set Icon in Main Process

```typescript
// src/main.ts
const mainWindow = new BrowserWindow({
  width: 1200,
  height: 800,
  title: 'MOSS - AI Assistant',
  icon: path.join(__dirname, '../assets/icons/icon.png'), // Add this line
  webPreferences: {
    preload: path.join(__dirname, 'preload.js'),
  },
});
```

## 🔄 Quick Icon Generation

If you want to get started quickly, you can use this simple PNG icon first:

```bash
# Create temporary icon directory
mkdir -p assets/icons

# Download generated PNG files from online tools, or use command line tools:
# (requires ImageMagick installation)
convert assets/icon-simple.svg -resize 512x512 assets/icons/icon.png
convert assets/icon-simple.svg -resize 256x256 assets/icons/icon-256.png
convert assets/icon-simple.svg -resize 128x128 assets/icons/icon-128.png
```

## 🎯 Required Icon Files Checklist

- [ ] `icon.png` (512x512) - Main icon
- [ ] `icon.ico` (multi-size) - Windows
- [ ] `icon.icns` (multi-size) - macOS
- [ ] `icon-16.png` ~ `icon-1024.png` - Various sizes

## 🚀 After Applying Icons

1. **Rebuild Application**: `npm run make`
2. **Check Results**: View icons in taskbar, Dock, file manager
3. **Adjust & Optimize**: Fine-tune design based on actual appearance

## 💡 Design Recommendations

- **Keep Simple**: Icon should remain clear at small sizes
- **High Contrast**: Ensure clarity on both dark/light backgrounds
- **Consistency**: Maintain color harmony with app interface
- **Scalability**: Vector design that adapts to all sizes

## 🔧 Technical Notes

### Icon Format Requirements

- **Windows**: `.ico` format (multi-resolution)
- **macOS**: `.icns` format (multi-resolution)
- **Linux**: `.png` format (various sizes)

### Electron Forge Configuration

Make sure your `forge.config.ts` properly references icon files:

```typescript
const config: ForgeConfig = {
  packagerConfig: {
    asar: true,
    icon: 'assets/icons/icon', // Auto-selects .icns (macOS), .ico (Windows), .png (Linux)
  },
  // ... rest of config
};
```

### Build Process

1. **Development**: Icon appears in dock/taskbar during `npm start`
2. **Package**: Icon embedded in application bundle during `npm run package`
3. **Distribution**: Icon used for installer and final app during `npm run make`

## 🎨 Design Tools & Resources

### Free Tools
- **GIMP**: Free alternative to Photoshop
- **Inkscape**: Free vector graphics editor
- **Canva**: Online design tool with templates

### Online Converters
- **ICO Convert**: Convert images to ICO format
- **ICNS Maker**: Create macOS icon files
- **PNG to ICO**: Batch conversion tools

### Icon Libraries
- **Heroicons**: Beautiful hand-crafted SVG icons
- **Feather Icons**: Simply beautiful open source icons
- **Material Icons**: Google's icon library

## 🚨 Common Issues & Solutions

### Issue: Icon not appearing in app
**Solution**: Check file paths in `forge.config.ts` and `main.ts`

### Issue: Icon blurry on high-DPI displays
**Solution**: Ensure you have 2x and 3x resolution versions

### Issue: Build fails due to missing icon
**Solution**: Verify all referenced icon files exist in specified paths

### Issue: Icon doesn't match app theme
**Solution**: Create separate light/dark variants if needed

---

## 📖 Language Versions

- **English Documentation**: ICON_GUIDE_EN.md (this file)
- **中文文档**: [ICON_GUIDE.md](ICON_GUIDE.md)

## 🔗 Related Documentation

- [Main README (English)](README_EN.md)
- [Main README (中文)](README.md) 