#!/usr/bin/env node

const os = require('os');
const path = require('path');
const fs = require('fs');

// 获取日志目录
function getLogDirectory() {
  const platform = os.platform();
  const appName = 'unraid-vite';
  
  switch (platform) {
    case 'darwin': // macOS
      return path.join(os.homedir(), 'Library', 'Logs', appName);
    case 'win32': // Windows
      return path.join(os.homedir(), 'AppData', 'Roaming', appName, 'logs');
    case 'linux': // Linux
      return path.join(os.homedir(), '.config', appName, 'logs');
    default:
      return path.join(os.homedir(), '.config', appName, 'logs');
  }
}

// 格式化文件大小
function formatFileSize(bytes) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// 主函数
function main() {
  const logDir = getLogDirectory();
  
  console.log('🔍 Unraid-Vite 日志查看器\n');
  console.log(`📁 日志目录: ${logDir}\n`);
  
  // 检查日志目录是否存在
  if (!fs.existsSync(logDir)) {
    console.log('❌ 日志目录不存在。请先运行应用程序以生成日志文件。');
    return;
  }
  
  // 读取日志文件
  try {
    const files = fs.readdirSync(logDir);
    const logFiles = files.filter(file => file.endsWith('.log'));
    
    if (logFiles.length === 0) {
      console.log('❌ 未找到日志文件。请先运行应用程序以生成日志文件。');
      return;
    }
    
    console.log(`📄 找到 ${logFiles.length} 个日志文件:\n`);
    
    // 显示文件信息
    logFiles.forEach((file, index) => {
      const filePath = path.join(logDir, file);
      const stats = fs.statSync(filePath);
      const size = formatFileSize(stats.size);
      const modifiedTime = stats.mtime.toLocaleString('zh-CN');
      
      console.log(`${index + 1}. ${file}`);
      console.log(`   📊 大小: ${size}`);
      console.log(`   🕒 修改时间: ${modifiedTime}`);
      console.log(`   📍 路径: ${filePath}\n`);
    });
    
    // 如果只有一个日志文件，显示最后几行
    if (logFiles.length === 1) {
      const mainLogPath = path.join(logDir, logFiles[0]);
      console.log('📖 最新日志内容 (最后20行):\n');
      console.log(''.padEnd(80, '='));
      
      const content = fs.readFileSync(mainLogPath, 'utf8');
      const lines = content.split('\n').filter(line => line.trim());
      const lastLines = lines.slice(-20);
      
      lastLines.forEach(line => {
        // 根据日志级别添加颜色
        if (line.includes('[ERROR]')) {
          console.log(`\x1b[31m${line}\x1b[0m`); // 红色
        } else if (line.includes('[WARN]')) {
          console.log(`\x1b[33m${line}\x1b[0m`); // 黄色
        } else if (line.includes('[INFO]')) {
          console.log(`\x1b[36m${line}\x1b[0m`); // 青色
        } else if (line.includes('[DEBUG]')) {
          console.log(`\x1b[37m${line}\x1b[0m`); // 灰色
        } else {
          console.log(line);
        }
      });
      
      console.log(''.padEnd(80, '='));
    }
    
    console.log('\n💡 提示:');
    console.log('- 在 macOS 上，您可以使用 Console.app 查看日志');
    console.log('- 使用 tail -f 命令实时查看日志更新');
    console.log(`- 示例: tail -f "${path.join(logDir, 'main.log')}"`);
    
  } catch (error) {
    console.error('❌ 读取日志文件时发生错误:', error.message);
  }
}

// 运行主函数
main(); 