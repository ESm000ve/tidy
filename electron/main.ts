import { app, BrowserWindow, ipcMain, dialog, shell, Menu, systemPreferences, nativeTheme } from 'electron';
import path from 'path';
import fs from 'fs';
import { promises as fsp } from 'fs';
import crypto from 'crypto';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';
import schedule from 'node-schedule';
import * as dotenv from 'dotenv';

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
process.env.APP_ROOT = path.join(__dirname, '..');

export const VITE_DEV_SERVER_URL = process.env['VITE_DEV_SERVER_URL'];
export const MAIN_DIST = path.join(process.env.APP_ROOT, 'dist-electron');
export const RENDERER_DIST = path.join(process.env.APP_ROOT, 'dist');
process.env.VITE_PUBLIC = VITE_DEV_SERVER_URL ? path.join(process.env.APP_ROOT, 'public') : RENDERER_DIST;

let win: BrowserWindow | null;

function createWindow() {
  const preloadPath = path.join(__dirname, 'preload.cjs');

  win = new BrowserWindow({
    webPreferences: {
      preload: preloadPath,
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false,
    },
    width: 1024,
    height: 768,
    minWidth: 800,
    minHeight: 600,
    titleBarStyle: 'hiddenInset',
    // Match the system appearance at launch so there is no dark/light flash
    // before the React renderer paints. nativeTheme updates automatically when
    // the user switches appearance while the app is running.
    backgroundColor: nativeTheme.shouldUseDarkColors ? '#1E1E1E' : '#ECECEC',
  });

  // Keep backgroundColor in sync if the user switches appearance mid-session.
  nativeTheme.on('updated', () => {
    win?.setBackgroundColor(nativeTheme.shouldUseDarkColors ? '#1E1E1E' : '#ECECEC');
  });

  if (VITE_DEV_SERVER_URL) {
    win.loadURL(VITE_DEV_SERVER_URL);
  } else {
    win.loadFile(path.join(RENDERER_DIST, 'index.html'));
  }

  win.on('enter-full-screen', () => {
    win?.webContents.send('window:fullscreen-change', true);
  });
  win.on('leave-full-screen', () => {
    win?.webContents.send('window:fullscreen-change', false);
  });
}

// -- AI Smart Rename Cache --
let smartRenameCache = new Map<string, { suggested: string, reason: string, confidence: string }>();
let cacheFilePath = '';

app.whenReady().then(() => {
  cacheFilePath = path.join(app.getPath('userData'), '.file-organizer-cache.json');
  try {
    if (fs.existsSync(cacheFilePath)) {
      const data = fs.readFileSync(cacheFilePath, 'utf-8');
      const parsed = JSON.parse(data);
      smartRenameCache = new Map(Object.entries(parsed));
    }
  } catch (e) {
    console.warn("Failed to load smart rename cache", e);
  }

  if (process.platform === 'darwin') {
    app.setAboutPanelOptions({
      applicationName: 'Tidy',
      applicationVersion: app.getVersion(),
      version: '1.0.0',
      copyright: 'Copyright © 2026 Tidy Team',
      credits: 'Built with HIG Excellence',
    });
  }

  createWindow();
  setupMenu();
});

function setupMenu() {
  const isMac = process.platform === 'darwin';

  const template: any[] = [
    // ── Tidy (App menu) ────────────────────────────────────────────────────────
    // HIG: App menu contains only app-global items — About, Preferences, Services,
    // Hide/Quit. Task-level actions (Run, Reset) live in the Actions menu instead.
    ...(isMac ? [{
      label: app.name,
      submenu: [
        { role: 'about' },
        { type: 'separator' },
        {
          label: 'Preferences…',   // ⌘, — required by macOS HIG
          accelerator: 'CmdOrCtrl+,',
          click: () => {
            win?.webContents.send('menu:action', 'open-preferences');
          }
        },
        { type: 'separator' },
        { role: 'services' },
        { type: 'separator' },
        { role: 'hide' },
        { role: 'hideOthers' },
        { role: 'unhide' },
        { type: 'separator' },
        { role: 'quit' }
      ]
    }] : []),
    // ── File ───────────────────────────────────────────────────────────────────
    {
      label: 'File',
      submenu: [
        {
          label: 'Select Source Folder…',
          accelerator: 'CmdOrCtrl+O',
          click: () => {
            win?.webContents.send('menu:action', 'open-source');
          }
        },
        {
          // Cmd+Shift+O instead of Cmd+D — Cmd+D is "Don't Save" in macOS dialogs.
          label: 'Select Destination Folder…',
          accelerator: 'CmdOrCtrl+Shift+O',
          click: () => {
            win?.webContents.send('menu:action', 'open-destination');
          }
        },
        { type: 'separator' },
        isMac ? { role: 'close' } : { role: 'quit' }
      ]
    },
    // ── Actions ────────────────────────────────────────────────────────────────
    // Task-level actions moved here from the App menu (HIG violation fixed).
    // Run Tidy: Cmd+Return — natural "execute" shortcut, no standard macOS conflict.
    // Reset All Rules: no shortcut — it's a destructive action, intentional friction.
    {
      label: 'Actions',
      submenu: [
        {
          label: 'Run Tidy',
          accelerator: 'CmdOrCtrl+Return',
          click: () => {
            win?.webContents.send('menu:action', 'run-tidy');
          }
        },
        {
          label: 'Reset All Rules…',
          click: () => {
            win?.webContents.send('menu:action', 'reset-rules');
          }
        }
      ]
    },
    // ── Edit ───────────────────────────────────────────────────────────────────
    {
      label: 'Edit',
      submenu: [
        {
          label: 'Undo Last Organize',
          accelerator: 'CmdOrCtrl+Z',
          click: () => {
            win?.webContents.send('menu:action', 'undo-organize');
          }
        },
        { role: 'redo' },
        { type: 'separator' },
        { role: 'cut' },
        { role: 'copy' },
        { role: 'paste' },
        ...(isMac ? [
          { role: 'pasteAndMatchStyle' },
          { role: 'delete' },
          { role: 'selectAll' },
          { type: 'separator' },
          {
            label: 'Speech',
            submenu: [
              { role: 'startSpeaking' },
              { role: 'stopSpeaking' }
            ]
          }
        ] : [
          { role: 'delete' },
          { type: 'separator' },
          { role: 'selectAll' }
        ])
      ]
    },
    // ── View ───────────────────────────────────────────────────────────────────
    {
      label: 'View',
      submenu: [
        {
          label: 'Show Insights',
          accelerator: 'CmdOrCtrl+I',
          click: () => {
            win?.webContents.send('menu:action', 'toggle-insights');
          }
        },
        {
          label: 'Show Audit Log',
          accelerator: 'CmdOrCtrl+L',
          click: () => {
            win?.webContents.send('menu:action', 'toggle-audit');
          }
        },
        { type: 'separator' },
        {
          label: 'Clear Search',
          accelerator: 'CmdOrCtrl+K',
          click: () => {
            win?.webContents.send('menu:action', 'clear-search');
          }
        },
        { type: 'separator' },
        // Dev tools gated behind isPackaged — never shown in production builds.
        ...(!app.isPackaged ? [
          { role: 'reload' as const },
          { role: 'forceReload' as const },
          { role: 'toggleDevTools' as const },
          { type: 'separator' as const },
        ] : []),
        { role: 'resetZoom' },
        { role: 'zoomIn' },
        { role: 'zoomOut' },
        { type: 'separator' },
        { role: 'togglefullscreen' }
      ]
    },
    // ── Window ─────────────────────────────────────────────────────────────────
    {
      label: 'Window',
      submenu: [
        { role: 'minimize' },
        { role: 'zoom' },
        ...(isMac ? [
          { type: 'separator' },
          { role: 'front' },
          { type: 'separator' },
          { role: 'window' }
        ] : [
          { role: 'close' }
        ])
      ]
    },
    {
      role: 'help',
      submenu: [
        {
          label: 'Learn More',
          click: async () => {
            await shell.openExternal('https://github.com/ericauzenne/file-organizer-app');
          }
        },
        {
          label: 'Documentation',
          click: async () => {
            await shell.openExternal('https://github.com/ericauzenne/file-organizer-app#readme');
          }
        },
        { type: 'separator' },
        {
          label: 'Report an Issue',
          click: async () => {
            await shell.openExternal('https://github.com/ericauzenne/file-organizer-app/issues');
          }
        }
      ]
    }
  ];

  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);

  // Set Dock Menu
  if (isMac) {
    const dockMenu = Menu.buildFromTemplate([
      {
        label: 'Run Tidy',
        click: () => {
          win?.webContents.send('menu:action', 'run-tidy');
        }
      },
      {
        label: 'Open Source Folder',
        click: () => {
          win?.webContents.send('menu:action', 'open-source');
        }
      }
    ]);
    app.dock.setMenu(dockMenu);
  }
}

// System Preferences helper
ipcMain.handle('system:getAccentColor', () => {
  if (process.platform !== 'darwin') return null;
  return systemPreferences.getAccentColor();
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

// -- IPC Handlers --

ipcMain.handle('dialog:openDirectory', async () => {
  if (!win) return null;
  const { canceled, filePaths } = await dialog.showOpenDialog(win, {
    properties: ['openDirectory', 'createDirectory']
  });
  if (canceled) {
    return null;
  } else {
    return filePaths[0];
  }
});

function saveCacheToDisk() {
  if (!cacheFilePath) return;
  try {
    const obj = Object.fromEntries(smartRenameCache);
    fs.writeFileSync(cacheFilePath, JSON.stringify(obj, null, 2));
  } catch (e) {
    console.warn("Failed to save smart rename cache", e);
  }
}

// -- AI Smart Rename Helper --
async function generateSmartRenames(files: { id: string; name: string; path: string; size: number }[]): Promise<Record<string, any>> {
  // Requires a GEMINI_API_KEY environment variable
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.warn("GEMINI_API_KEY not set. Using local heuristic fallback for Smart Rename.");
    const fallbackResults: Record<string, any> = {};
    const now = new Date();
    const dateStr = now.toISOString().split('T')[0];

    for (const file of files) {
      const extMatch = file.name.match(/\.[0-9a-z]+$/i);
      const ext = extMatch ? extMatch[0] : '';
      const nameWithoutExt = file.name.slice(0, file.name.length - ext.length);

      // 1. Screenshots (macOS)
      const screenshotMatch = nameWithoutExt.match(/^Screen\s?shot\s+(.+)$/i);
      if (screenshotMatch) {
        const datePart = screenshotMatch[1].replace(/\s+at\s+/gi, '_').replace(/[:\s\.]+/g, '-');
        fallbackResults[file.id] = {
          suggested: `${datePart}_Screenshot${ext}`,
          reason: "Standardized screenshot format",
          confidence: "high",
          subfolder: "Screenshots"
        };
        continue;
      }

      // 2. Camera Images (IMG_XXXX, DSC_XXXX)
      if (/^(IMG|DSC|P|IMAGE|PHOTO)_?\d+/i.test(nameWithoutExt)) {
        fallbackResults[file.id] = {
          suggested: `${dateStr}_Capture_${nameWithoutExt}${ext}`,
          reason: "Standardized camera image name",
          confidence: "medium",
          subfolder: "Photos"
        };
        continue;
      }

      // 3. Generic Documents (Document, Scan, Untitled)
      if (/^(Document|Scan|Untitled|New Document|Report|Draft)_?\d*/i.test(nameWithoutExt)) {
        fallbackResults[file.id] = {
          suggested: `${dateStr}_Doc_${nameWithoutExt}${ext}`,
          reason: "Prepend date to generic document",
          confidence: "medium",
          subfolder: "Documents"
        };
        continue;
      }

      // 4. Audio/Voice Clips
      if (/^(Voice|Track|Audio|Rec|Recording)_?\d+/i.test(nameWithoutExt)) {
        fallbackResults[file.id] = {
          suggested: `${dateStr}_Audio_${nameWithoutExt}${ext}`,
          reason: "Standardized audio recording name",
          confidence: "medium",
          subfolder: "Audio"
        };
        continue;
      }

      // 5. Generic Video
      if (/^(MOV|VID|VIDEO|Clip)_?\d+/i.test(nameWithoutExt)) {
        fallbackResults[file.id] = {
          suggested: `${dateStr}_Video_${nameWithoutExt}${ext}`,
          reason: "Standardized video name",
          confidence: "medium",
          subfolder: "Video"
        };
        continue;
      }

      // 6. Generic "File" or "Download"
      if (/^(File|Download|Data|Export|Backup)_?\d*/i.test(nameWithoutExt)) {
        fallbackResults[file.id] = {
          suggested: `${dateStr}_${nameWithoutExt}${ext}`,
          reason: "Prepend date to generic download/export",
          confidence: "low",
          subfolder: "Other"
        };
        continue;
      }
    }
    return fallbackResults;
  }

  try {
    const ai = new GoogleGenAI({ apiKey });

    const parts: any[] = [];
    parts.push({
      text: `
You are an expert file organizer utility. Analyze the following list of files.
For images and documents, I am providing their binary content when possible. For other files, use just the filename to deduce context.
Provide a highly descriptive, human-readable "smart" filename for EACH file.

Crucial Instruction:
You MUST attempt to extract visual or textual context from the file contents (e.g., if an image shows a dog in a park, name it "Golden_Retriever_Dog_Park.jpg").
Do NOT just return the original name. Even if the original name is somewhat organized (like "2024-01-01_Screenshot.jpg"), you MUST look at the image content and rename it to describe what is actually in the image (e.g. "2024-01-01_Recipe_For_Pie.jpg").
You must also classify each file into a logical, semantic "subfolder" based on its content (e.g., "Screenshots", "Photos", "Scans", "Invoices", "Receipts", "Contracts", "Memes", etc). Keep subfolder names brief and capitalized.

Guidelines for new names:
- Use visual/content context if provided.
- Clean up junk characters but keep extensions exactly the same.
- Use dashes or underscores for spaces.
- Keep output strictly as clean JSON.

Return a JSON object where the key is the file ID, and the value is an object containing:
- "suggested": The new clean filename (MUST include the original extension).
- "reason": A brief 1-sentence reason why you changed it.
- "confidence": "high", "medium", or "low".
- "subfolder": A short semantic category string (e.g. "Screenshots", "Invoices").

Files to analyze:` });

    const MAX_INLINE_SIZE = 1024 * 1024; // 1MB to improve speed and prevent timeouts

    for (const file of files) {
      parts.push({ text: `\n\nFile ID: ${file.id}\nOriginal Name: ${file.name}` });

      const ext = path.extname(file.name).toLowerCase();
      const isImage = ['.jpg', '.jpeg', '.png', '.webp', '.heic'].includes(ext);
      const isDoc = ['.pdf', '.txt', '.md'].includes(ext);

      if ((isImage || isDoc) && file.size < MAX_INLINE_SIZE) {
        try {
          const mimeMap: Record<string, string> = {
            '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.png': 'image/png',
            '.webp': 'image/webp', '.heic': 'image/heic', '.pdf': 'application/pdf',
            '.txt': 'text/plain', '.md': 'text/plain'
          };
          const buf = await fsp.readFile(file.path);
          parts.push({ inlineData: { data: buf.toString('base64'), mimeType: mimeMap[ext] } });
        } catch (e) {
          console.error("Failed to read inline data for", file.name, e);
        }
      }
    }

    parts.push({ text: "\n\nEnd of files. Provide the JSON dictionary." });

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: parts,
      config: {
        responseMimeType: "application/json",
      }
    });

    const jsonText = response.text || "{}";
    return JSON.parse(jsonText);
  } catch (error) {
    console.error("AI Smart Rename generation failed:", error);
    return {};
  }
}

ipcMain.handle('dialog:getFolderInsights', async (event, sourcePath: string) => {
  if (!sourcePath || !fs.existsSync(sourcePath)) return { counts: {}, total: 0 };

  try {
    const dir = await fsp.opendir(sourcePath);
    const counts: Record<string, number> = {
      screenshots: 0, photos: 0, recordings: 0,
      invoices: 0, contracts: 0, audioMissingMeta: 0, duplicates: 0
    };
    let total = 0;

    for await (const dirent of dir) {
      if (!dirent.isFile() || dirent.name.startsWith('.')) continue;
      
      const filename = dirent.name;
      const ext = path.extname(filename).toLowerCase();
      const lowerName = filename.toLowerCase();

      if (['.jpg', '.jpeg', '.png', '.heic', '.webp'].includes(ext)) {
        if (lowerName.includes('screen shot') || lowerName.includes('screenshot')) counts.screenshots++;
        else counts.photos++;
      } else if (['.mp4', '.mov', '.mkv'].includes(ext)) {
        if (lowerName.includes('screen record')) counts.recordings++;
      } else if (['.pdf', '.docx', '.pages'].includes(ext)) {
        if (lowerName.includes('invoice') || lowerName.includes('receipt') || lowerName.includes('bill')) counts.invoices++;
        if (lowerName.includes('contract') || lowerName.includes('agreement') || lowerName.includes('nda')) counts.contracts++;
      } else if (['.mp3', '.wav', '.m4a'].includes(ext)) {
        if (lowerName.match(/track\s*\d+|untitled/i)) counts.audioMissingMeta++;
      }

      // Quick heuristic for "duplicates"
      if (lowerName.match(/(_1|\(\d+\)|\scopy)\.\w+$/i)) counts.duplicates++;
      
      total++;
    }

    return { counts, total };
  } catch (err) {
    console.error("Insights scan error:", err);
    return { counts: {}, total: 0 };
  }
});

ipcMain.handle('dialog:getFolderPreview', async (event, sourcePath: string, categories: any[], smartRenameEnabled?: boolean) => {
  if (!sourcePath || !fs.existsSync(sourcePath)) return [];

  try {
    const previewFiles: any[] = [];

    // Extension map for categorization
    const extMap = new Map();
    categories.forEach((cat: any) => {
      cat.extensions.forEach((ext: string) => {
        const cleanExt = (ext.startsWith('.') ? ext : `.${ext}`).toLowerCase();
        extMap.set(cleanExt, cat);
      });
    });

    const fileHashes = new Map<string, string>(); // hash -> original filename

    const dir = await fsp.opendir(sourcePath);

    for await (const dirent of dir) {
      if (dirent.isFile() && !dirent.name.startsWith('.')) {
        const filename = dirent.name;
        const fullPath = path.join(sourcePath, filename);
        const stats = await fsp.stat(fullPath);

        const ext = path.extname(filename).toLowerCase();
        const categoryObj = extMap.get(ext);
        const category = categoryObj ? categoryObj.name : 'Other';

        // Format size
        const sizeInBytes = stats.size;
        let sizeStr = '';
        if (sizeInBytes < 1024) sizeStr = `${sizeInBytes} B`;
        else if (sizeInBytes < 1024 * 1024) sizeStr = `${(sizeInBytes / 1024).toFixed(1)} KB`;
        else sizeStr = `${(sizeInBytes / (1024 * 1024)).toFixed(1)} MB`;

        // Check for duplicates via MD5 hashing ONLY if duplicateDetection is enabled for this category
        // To keep it fast, we'll hash the first 64KB of the file
        let isDuplicate = false;
        let duplicateOf = undefined;
        
        if (categoryObj && categoryObj.duplicateDetection && sizeInBytes > 0) {
          try {
            const fd = await fsp.open(fullPath, 'r');
            const buffer = Buffer.alloc(Math.min(sizeInBytes, 64 * 1024));
            await fd.read(buffer, 0, buffer.length, 0);
            await fd.close();
            const fileHash = crypto.createHash('md5').update(buffer).digest('hex') + sizeInBytes.toString();

            if (fileHashes.has(fileHash)) {
              isDuplicate = true;
              duplicateOf = fileHashes.get(fileHash);
            } else {
              fileHashes.set(fileHash, filename);
            }
          } catch (e) {
            console.warn("Hashing failed for", filename, e);
          }
        }

        previewFiles.push({
          id: Math.random().toString(36).substr(2, 9),
          name: filename,
          ext: ext.slice(1),
          size: sizeStr,
          from: sourcePath.replace(process.env.HOME || '', '~'),
          category: category.toLowerCase(),
          needsReview: false,
          isDuplicate,
          duplicateOf
        });

        // Limit to 50 files for performance in preview
        if (previewFiles.length >= 50) break;
      }
    }

    // Apply Smart Rename if enabled
    if (smartRenameEnabled && previewFiles.length > 0) {
      const filesForAI: any[] = [];
      let aiSuggestions: Record<string, any> = {};

      for (const f of previewFiles) {
        let rawSize = parseInt(f.size.split(' ')[0]) || 0;
        if (f.size.includes('KB')) rawSize *= 1024;
        if (f.size.includes('MB')) rawSize *= 1024 * 1024;

        const cacheKey = `${f.name}|${rawSize}`;
        if (smartRenameCache.has(cacheKey)) {
          aiSuggestions[f.id] = smartRenameCache.get(cacheKey);
        } else {
          filesForAI.push({
            id: f.id,
            name: f.name,
            path: path.join(sourcePath, f.name),
            size: rawSize,
            cacheKey: cacheKey
          });
        }
      }

      if (filesForAI.length > 0) {
        // Batch processing sequentially to avoid strict rate limits
        const BATCH_SIZE = 10;

        for (let i = 0; i < filesForAI.length; i += BATCH_SIZE) {
          const batch = filesForAI.slice(i, i + BATCH_SIZE);
          const batchSuggestions = await generateSmartRenames(batch);

          for (const [fileId, suggestion] of Object.entries(batchSuggestions)) {
            aiSuggestions[fileId] = suggestion;
            // Find cacheKey for this ID and store it
            const bFile = batch.find(bf => bf.id === fileId);
            if (bFile) {
              smartRenameCache.set(bFile.cacheKey, suggestion as any);
            }
          }
          saveCacheToDisk(); // Save after each batch
        }
      }

      // Merge suggestions back into previewFiles
      for (const file of previewFiles) {
        if (aiSuggestions[file.id] && aiSuggestions[file.id].suggested !== file.name) {
          file.smartRename = {
            suggested: aiSuggestions[file.id].suggested,
            reason: aiSuggestions[file.id].reason || "AI generated suggestion",
            confidence: aiSuggestions[file.id].confidence || "medium",
          };
          file.classSource = "ai"; // Tag as AI updated
        }
      }
    }

    return previewFiles;
  } catch (err) {
    console.error('Error scanning folder for preview:', err);
    return [];
  }
});

ipcMain.handle('organize:run', async (event, config: any) => {
  return await runOrganizationJob(
    config,
    (progress) => {
      event.sender.send('organize:progress', {
        status: 'running',
        progress: progress,
      });
    },
    (level, message) => {
      event.sender.send('organize:log', { level, message, time: new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false }) });
    }
  );
});

async function runOrganizationJob(config: any, onProgress?: (progress: number) => void, onLog?: (level: "info" | "warn" | "error" | "success", message: string) => void) {
  const { sourcePath, destPath, categories, filters, conflictResolution, renames } = config;

  const log = (level: "info" | "warn" | "error" | "success", message: string) => {
    if (onLog) onLog(level, message);
  };

  if (!sourcePath || !destPath) {
    log("error", "Source or destination path missing");
    return { success: false, error: 'Source or destination path missing' };
  }

  try {
    log("info", `Scan started — ${sourcePath}`);
    const files = await fsp.readdir(sourcePath);
    const totalFiles = files.length;
    log("info", `Found ${totalFiles} files to process`);
    let movedCount = 0;
    let errorCount = 0;
    let renamedCount = 0;
    const operations: { originalPath: string; newPath: string; originalName: string; newName: string }[] = [];

    // Create a extension-to-category map for faster lookup
    const extMap = new Map();
    categories.forEach((cat: any) => {
      if (cat.enabled) {
        cat.extensions.forEach((ext: string) => {
          const cleanExt = (ext.startsWith('.') ? ext : `.${ext}`).toLowerCase();
          extMap.set(cleanExt, {
            categoryName: cat.name,
            useSubfolders: cat.subfolders,
            smartCategorization: cat.smartCategorization,
            duplicateDetection: cat.duplicateDetection
          });
        });
      }
    });

    const fileHashes = new Set<string>(); // Used to detect true duplicates during the run

    for (let i = 0; i < files.length; i++) {
      const filename = files[i];
      const fullSourcePath = path.join(sourcePath, filename);

      try {
        const stats = await fsp.stat(fullSourcePath);
        if (!stats.isFile()) continue;

        // Filters
        if (filters.excludeHidden && filename.startsWith('.')) continue;

        if (filters.dateModified !== 'any') {
          const now = Date.now();
          const mtime = stats.mtimeMs;
          const diffDays = (now - mtime) / (1000 * 60 * 60 * 24);
          const limitMap: any = { today: 1, week: 7, month: 30, year: 365 };
          if (diffDays > limitMap[filters.dateModified]) continue;
        }

        if (filters.fileSize !== 'any') {
          const MB = 1024 * 1024;
          const size = stats.size;
          if (filters.fileSize === 'small' && size >= MB) continue;
          if (filters.fileSize === 'medium' && (size < MB || size > 100 * MB)) continue;
          if (filters.fileSize === 'large' && size <= 100 * MB) continue;
        }

        // Categorization
        const ext = path.extname(filename).toLowerCase();
        const catInfo = extMap.get(ext);
        if (catInfo) {
          const { categoryName, useSubfolders, smartCategorization, duplicateDetection } = catInfo;
          let finalDestDir = path.join(destPath, categoryName);

          let isReviewRequired = false;
          let isDuplicate = false;
          let targetFilename = filename;
          let semanticSubfolder = null;

          // Duplicate Detection Check
          if (duplicateDetection) {
            try {
              const fd = await fsp.open(fullSourcePath, 'r');
              const buffer = Buffer.alloc(Math.min(stats.size, 64 * 1024)); // 64KB chunk
              await fd.read(buffer, 0, buffer.length, 0);
              await fd.close();
              const fileHash = crypto.createHash('md5').update(buffer).digest('hex') + stats.size.toString();

              if (fileHashes.has(fileHash)) {
                isDuplicate = true;
              } else {
                fileHashes.add(fileHash);
              }
            } catch (e) {
              console.warn("Hashing failed during organize run for", filename, e);
            }
          }

          // If it's a duplicate and user wants to Archive, short-circuit normal routing
          if (isDuplicate && conflictResolution === 'archive') {
            finalDestDir = path.join(destPath, "Duplicates_Archive");
            log("warn", `${filename} is a duplicate, moving to Archives`);
            // ensure targetFilename remains original name, handled by rename logic below if name collision inside Archive
          } else if (isDuplicate && conflictResolution === 'skip') {
            log("warn", `Skipped duplicate: ${filename}`);
            continue;
          } else {
            // Normal AI and metadata routing routing
            if (renames && renames[filename]) {
              targetFilename = renames[filename].suggested || renames[filename];
              semanticSubfolder = renames[filename].subfolder;

              // Check confidence level from the frontend's preview structure
              if (renames[filename].confidence && (renames[filename].confidence === 'low' || renames[filename].confidence === 'medium')) {
                isReviewRequired = true;
              }
              renamedCount++;
            }

            if (useSubfolders) {
              if (smartCategorization && semanticSubfolder) {
                finalDestDir = path.join(finalDestDir, semanticSubfolder);
              } else {
                // Fallback to extension subfolders if Smart Categorization is disabled or returned null
                finalDestDir = path.join(finalDestDir, ext.slice(1) || 'no_extension');
              }
            }

            if (isReviewRequired) {
              finalDestDir = path.join(destPath, "Review");
            }
          }

          await fsp.mkdir(finalDestDir, { recursive: true });
          let targetPath = path.join(finalDestDir, targetFilename);

          if (fs.existsSync(targetPath)) {
            if (conflictResolution === 'skip') continue;
            if (conflictResolution === 'rename') {
              const extName = path.extname(targetFilename);
              const baseName = path.basename(targetFilename, extName);
              let counter = 1;
              while (fs.existsSync(targetPath)) {
                targetPath = path.join(finalDestDir, `${baseName} (${counter})${extName}`);
                counter++;
              }
            }
          }

          try {
            await fsp.rename(fullSourcePath, targetPath);
          } catch (err: any) {
            if (err.code === 'EXDEV') {
              await fsp.copyFile(fullSourcePath, targetPath);
              await fsp.unlink(fullSourcePath);
            } else {
              throw err;
            }
          }
          operations.push({ originalPath: fullSourcePath, newPath: targetPath, originalName: filename, newName: path.basename(targetPath) });
          movedCount++;

          if (targetFilename !== filename) {
            log("info", `Renamed ${filename} → ${targetFilename} and moved to ${categoryName}/`);
          } else {
            log("info", `Moved ${filename} → ${categoryName}/`);
          }
        }
      } catch (err) {
        log("error", `Failed to process ${filename}`);
        console.error(`Failed to process ${filename}:`, err);
        errorCount++;
      }

      // Basic progress reporting
      if (i % 10 === 0 || i === files.length - 1) {
        if (onProgress) {
          onProgress(Math.floor(((i + 1) / totalFiles) * 100));
        }
      }
    }

    log("success", "Run completed successfully — undo manifest saved");
    return { success: true, moved: movedCount, errors: errorCount, renamed: renamedCount, operations };
  } catch (err: any) {
    log("error", `Organization error: ${err.message}`);
    console.error('Organization error:', err);
    return { success: false, error: err.message };
  }
}

let currentJob: schedule.Job | null = null;
let savedScheduleConfig: any = null;

ipcMain.handle('schedule:save', async (event, config: any) => {
  try {
    const { schedule: schedData, ...runConfig } = config;

    // Always cancel existing job first
    if (currentJob) {
      currentJob.cancel();
      currentJob = null;
    }

    if (!schedData.enabled || schedData.frequency === "manual") {
      savedScheduleConfig = null;
      return { success: true, message: "Schedule disabled" };
    }

    // Save for persistence layer
    savedScheduleConfig = config;

    // Parse time
    const [hours, minutes] = schedData.time.split(':').map(Number);
    let cronRule = "";

    if (schedData.frequency === "daily") {
      cronRule = `${minutes} ${hours} * * *`;
    } else if (schedData.frequency === "weekly") {
      // Default to monday 1
      cronRule = `${minutes} ${hours} * * 1`;
    } else if (schedData.frequency === "monthly") {
      // Default to 1st of month
      cronRule = `${minutes} ${hours} 1 * *`;
    } else {
      // fallback manual
      return { success: true, message: "Manual set, no cron created" };
    }

    currentJob = schedule.scheduleJob(cronRule, async () => {
      console.log("Triggering scheduled organization job...");
      try {
        const result = await runOrganizationJob(runConfig);
        console.log("Scheduled job complete:", result);
      } catch (e) {
        console.error("Scheduled job failed:", e);
      }
    });

    console.log(`Job scheduled with rule: ${cronRule}`);
    return { success: true, message: "Scheduled successfully" };
  } catch (e: any) {
    console.error("Scheduling failed", e);
    return { success: false, error: e.message };
  }
});

ipcMain.handle('open:folder', async (event, folderPath: string) => {
  try {
    await shell.openPath(folderPath);
    return { success: true };
  } catch (err: any) {
    console.error('Failed to open folder:', err);
    return { success: false, error: err.message };
  }
});

ipcMain.handle('organize:undo', async (event, operations: any[]) => {
  let revertedCount = 0;
  let errorCount = 0;
  for (const op of operations) {
    try {
      if (fs.existsSync(op.newPath)) {
        await fsp.rename(op.newPath, op.originalPath);
        revertedCount++;
      }
    } catch (err) {
      console.error(`Failed to revert ${op.newPath}:`, err);
      try {
        if (fs.existsSync(op.newPath)) {
          await fsp.copyFile(op.newPath, op.originalPath);
          await fsp.unlink(op.newPath);
          revertedCount++;
        }
      } catch (backupErr) {
        console.error(`Failed fallback revert ${op.newPath}:`, backupErr);
        errorCount++;
      }
    }
  }
  return { success: true, reverted: revertedCount, errors: errorCount };
});

// -- AI Natural Language Rule Parser --
ipcMain.handle('ai:parseRule', async (event, rule: string, currentConfig: any) => {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY is not set. Please add it to your .env file.");
    }

    // Note: Assuming API key works with @google/genai syntax used elsewhere in this codebase
    const genAI = new GoogleGenAI({ apiKey });

    const prompt = `You are an expert configuration parser for a File Organizer App.
The user wants to create a new rule or update settings using natural language.
User's Rule: "${rule}"

Current Categories context (to help you decide whether to update an existing category or create a new one):
${JSON.stringify(currentConfig.categories.map((c: any) => ({ id: c.id, name: c.name, extensions: c.extensions })), null, 2)}

Return a strict JSON response containing ONLY the updates required. Do not include markdown code blocks.
The exact JSON schema MUST be:
{
  "newCategories": [
    { "name": "Category Name", "extensions": ["ext1", "ext2"], "subfolders": boolean, "smartCategorization": boolean, "duplicateDetection": boolean }
  ],
  "updateCategories": [
    { "id": "existing-category-id", "enabled": boolean, "extensions": ["added_ext1"], "smartCategorization": boolean, "duplicateDetection": boolean }
  ],
  "updateFilters": {
    "fileSize": "any" | "small" | "medium" | "large",
    "dateModified": "any" | "today" | "week" | "month" | "year"
  },
  "smartRename": boolean
}

Rules:
1. If a field is not affected by the user's rule, omit it or leave it empty/null.
2. Infer standard file extensions for requested categories (e.g. "Archive" usually means ["zip", "rar", "tar", "gz"], "Invoices" usually means ["pdf"]). Be thorough.
3. Never include periods in the extensions (e.g., use "pdf", not ".pdf").
4. If the user asks to "rename" or "smart rename" files, set "smartRename" to true.
5. If the user asks for a category but it already exists in the context, add the extensions to the existing category via updateCategories.`;

    const response = await genAI.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt
    });
    if (!response.text) return { success: false, error: "AI returned no content." };

    let cleanedText = response.text.trim();
    if (cleanedText.startsWith('\`\`\`json')) cleanedText = cleanedText.substring(7);
    if (cleanedText.startsWith('\`\`\`')) cleanedText = cleanedText.substring(3);
    if (cleanedText.endsWith('\`\`\`')) cleanedText = cleanedText.slice(0, -3);

    const parsed = JSON.parse(cleanedText.trim());
    return { success: true, data: parsed };
  } catch (error: any) {
    console.error("AI Parse Rule Error:", error);
    return { success: false, error: error.message || "Failed to parse rule." };
  }
});
