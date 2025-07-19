const fs = require('fs');
const path = require('path');

// 图标尺寸配置
const iconSizes = {
  // macOS 图标尺寸
  'icon-16x16.png': 16,
  'icon-32x32.png': 32,
  'icon-128x128.png': 128,
  'icon-256x256.png': 256,
  'icon-512x512.png': 512,
  'icon-1024x1024.png': 1024,
  
  // Windows 图标尺寸
  'icon-16.png': 16,
  'icon-24.png': 24,
  'icon-32.png': 32,
  'icon-48.png': 48,
  'icon-64.png': 64,
  'icon-128.png': 128,
  'icon-256.png': 256,
  
  // Linux 图标尺寸
  'icon-scalable.png': 512,
  
  // Electron Builder 图标
  'icon.png': 512,
  'icon.ico': 256, // Windows ICO
  'icon.icns': 512 // macOS ICNS
};

// 创建图标目录
const iconsDir = path.join(__dirname, '../assets/icons');
if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir, { recursive: true });
}

console.log('🎨 MOSS 图标生成脚本');
console.log('=====================================');

// 检查是否安装了 sharp (用于图像处理)
let sharp;
try {
  sharp = require('sharp');
  console.log('✅ Sharp 图像处理库已安装');
} catch (error) {
  console.log('❌ Sharp 未安装，请运行: npm install sharp --save-dev');
  console.log('📝 或者使用在线工具转换 SVG 到 PNG');
  showManualInstructions();
  return;
}

// SVG 路径
let svgPath = path.join(__dirname, '../assets/icon-simple.svg');

if (!fs.existsSync(svgPath)) {
  console.log('❌ SVG 图标文件不存在:', svgPath);
  console.log('🔄 尝试查找其他SVG文件...');
  
  const altSvgPath = path.join(__dirname, '../assets/icon.svg');
  if (fs.existsSync(altSvgPath)) {
    console.log('✅ 找到备用SVG文件:', altSvgPath);
    svgPath = altSvgPath;
  } else {
    return;
  }
}

console.log('📂 从 SVG 生成图标:', svgPath);
console.log('📁 输出目录:', iconsDir);
console.log('');

// 生成所有尺寸的图标
async function generateIcons() {
  const svgBuffer = fs.readFileSync(svgPath);
  
  for (const [filename, size] of Object.entries(iconSizes)) {
    try {
      const outputPath = path.join(iconsDir, filename);
      
      if (filename.endsWith('.png')) {
        await sharp(svgBuffer)
          .resize(size, size)
          .png()
          .toFile(outputPath);
        
        console.log(`✅ 生成: ${filename} (${size}x${size})`);
      } else {
        console.log(`⏭️  跳过: ${filename} (需要专用工具处理)`);
      }
    } catch (error) {
      console.log(`❌ 生成失败: ${filename} - ${error.message}`);
    }
  }
  
  console.log('');
  console.log('🎉 图标生成完成!');
  console.log('');
  console.log('📋 下一步操作:');
  console.log('1. 检查 assets/icons/ 目录中的图标文件');
  console.log('2. 将 icon.png 复制到项目根目录 (Electron Builder 需要)');
  console.log('3. 更新 forge.config.ts 中的图标路径');
  console.log('');
  console.log('💡 提示:');
  console.log('- ICO 和 ICNS 格式需要专用工具处理');
  console.log('- 可以使用 https://convertio.co/ 在线转换');
  console.log('- 或安装 electron-icon-maker: npm i -g electron-icon-maker');
}

function showManualInstructions() {
  console.log('');
  console.log('📋 手动生成图标步骤:');
  console.log('1. 打开 assets/icon.svg');
  console.log('2. 使用在线工具转换为 PNG:');
  console.log('   - https://convertio.co/svg-png/');
  console.log('   - https://cloudconvert.com/svg-to-png');
  console.log('3. 生成以下尺寸的图标:');
  Object.entries(iconSizes).forEach(([filename, size]) => {
    if (filename.endsWith('.png')) {
      console.log(`   - ${filename}: ${size}x${size}px`);
    }
  });
  console.log('4. 保存到 assets/icons/ 目录');
  console.log('');
}

// 执行图标生成
if (sharp) {
  generateIcons().catch(console.error);
}

module.exports = { generateIcons, iconSizes }; 