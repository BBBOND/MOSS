import { app, BrowserWindow } from 'electron';
import path from 'node:path';
import started from 'electron-squirrel-startup';
import { loadFunctions } from '@/electron';
import log from 'electron-log';

// 配置日志
log.transports.file.level = 'info';
log.transports.console.level = 'debug';
log.transports.file.maxSize = 5 * 1024 * 1024; // 5MB
log.transports.file.format = '[{y}-{m}-{d} {h}:{i}:{s}.{ms}] [{level}] {text}';

// 设置日志文件路径
log.transports.file.resolvePathFn = () => path.join(app.getPath('logs'), 'main.log');

// 记录应用启动
log.info('MOSS AI助手启动');
log.info('日志文件位置:', log.transports.file.getFile()?.path);

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (started) {
  log.info('应用通过安装程序启动，正在退出');
  app.quit();
}

const createWindow = () => {
  log.info('创建主窗口');
  
  // 动态确定图标路径
  const iconPath = MAIN_WINDOW_VITE_DEV_SERVER_URL 
    ? path.join(process.cwd(), 'icon.png')  // 开发模式：项目根目录
    : path.join(__dirname, '../icon.png');  // 生产模式：相对于构建目录
  
  log.info('图标路径:', iconPath);
  
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    title: 'MOSS - AI助手',
    icon: iconPath,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
    },
  });

  // and load the index.html of the app.
  if (MAIN_WINDOW_VITE_DEV_SERVER_URL) {
    log.info('开发模式：加载开发服务器 URL:', MAIN_WINDOW_VITE_DEV_SERVER_URL);
    mainWindow.loadURL(MAIN_WINDOW_VITE_DEV_SERVER_URL);
  } else {
    log.info('生产模式：加载本地文件');
    mainWindow.loadFile(path.join(__dirname, `../renderer/${MAIN_WINDOW_VITE_NAME}/index.html`));
  }

  if (!app.isPackaged) {
    // Open the DevTools.
    mainWindow.webContents.openDevTools();
  }
  
  // 监听窗口事件
  mainWindow.on('closed', () => {
    log.info('主窗口已关闭');
  });

  mainWindow.on('focus', () => {
    log.debug('主窗口获得焦点');
  });
  
  mainWindow.on('blur', () => {
    log.debug('主窗口失去焦点');
  });
};

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', () => {
  log.info('Electron 已准备就绪');
  createWindow();
});

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  log.info('所有窗口已关闭');
  if (process.platform !== 'darwin') {
    log.info('退出应用');
    app.quit();
  }
});

app.on('activate', () => {
  log.info('应用被激活');
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    log.info('没有打开的窗口，创建新窗口');
    createWindow();
  }
});

// 应用退出时的日志
app.on('before-quit', () => {
  log.info('应用即将退出');
});

app.on('will-quit', (event) => {
  log.info('应用准备退出');
});

// 捕获未处理的异常
process.on('uncaughtException', (error) => {
  log.error('未捕获的异常:', error);
});

process.on('unhandledRejection', (reason, promise) => {
  log.error('未处理的 Promise 拒绝:', reason, '在 Promise:', promise);
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and import them here.
app.whenReady().then(() => {
  log.info('开始加载功能模块');
  loadFunctions();
  log.info('功能模块加载完成');
});