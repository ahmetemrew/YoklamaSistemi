const { app, BrowserWindow } = require('electron');
const path = require('path');
const { spawn } = require('child_process');
const os = require('os');

let mainWindow;
let serverProcess;
const PORT = 3000;

function getLocalIP() {
    const interfaces = os.networkInterfaces();
    for (const name of Object.keys(interfaces)) {
        for (const iface of interfaces[name]) {
            if (iface.family === 'IPv4' && !iface.internal) {
                return iface.address;
            }
        }
    }
    return 'localhost';
}

function startBackendServer() {
    console.log('Starting backend server...');

    const serverPath = path.join(__dirname, 'backend-server.js');

    serverProcess = spawn('node', [serverPath], {
        cwd: __dirname,
        env: { ...process.env, PORT: PORT }
    });

    serverProcess.stdout.on('data', (data) => {
        console.log(`[Server] ${data}`);
    });

    serverProcess.stderr.on('data', (data) => {
        console.error(`[Server Error] ${data}`);
    });

    serverProcess.on('close', (code) => {
        console.log(`Server process exited with code ${code}`);
    });
}

function createWindow() {
    mainWindow = new BrowserWindow({
        width: 1400,
        height: 900,
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
            enableRemoteModule: false
        },
        icon: path.join(__dirname, 'icon.png'),
        autoHideMenuBar: true,
        title: 'Yoklama Sistemi'
    });

    // Start backend server
    startBackendServer();

    // Wait for server to start, then load
    setTimeout(() => {
        mainWindow.loadURL(`http://localhost:${PORT}`);
    }, 3000);

    mainWindow.on('closed', () => {
        mainWindow = null;
    });

    // Open DevTools in development
    // mainWindow.webContents.openDevTools();
}

app.whenReady().then(() => {
    createWindow();

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) {
            createWindow();
        }
    });
});

app.on('window-all-closed', () => {
    if (serverProcess) {
        serverProcess.kill();
    }
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('quit', () => {
    if (serverProcess) {
        serverProcess.kill();
    }
});

// Log local IP on startup
console.log('==========================================');
console.log('Yoklama Sistemi');
console.log('==========================================');
console.log(`Local IP: ${getLocalIP()}`);
console.log(`Server will run on: http://localhost:${PORT}`);
console.log(`Scanner URL: http://${getLocalIP()}:${PORT}/scanner`);
console.log('==========================================');
