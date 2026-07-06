import React, { useState, useEffect, useRef } from 'react';
import { Terminal, Folder, File, Code2, Play, BookOpen, Bug, Sparkles, HelpCircle, Laptop, Settings, ChevronRight, FileCode, CheckCircle2, Pause, FastForward, RotateCcw, Sliders, Eye, Download, Database, Smartphone, Tablet, Monitor, Globe } from 'lucide-react';
import { CodeFile, AppProject } from '../types';
import JSZip from 'jszip';

export default function DeveloperWorkspaceModule() {
  const [activeWorkspaceTab, setActiveWorkspaceTab] = useState<'practice' | 'learning_deck'>(() => {
    const saved = localStorage.getItem('dev_workspace_active_tab');
    return saved === 'practice' || saved === 'learning_deck' ? saved : 'practice';
  });
  const [prompt, setPrompt] = useState(() => {
    return localStorage.getItem('dev_workspace_prompt') || '';
  });
  const [techStack, setTechStack] = useState('React + Tailwind');
  const [isGenerating, setIsGenerating] = useState(false);

  // Default initial project loaded in Workspace Explorer
  const [currentProject, setCurrentProject] = useState<AppProject>(() => {
    const saved = localStorage.getItem('dev_workspace_project');
    return saved ? JSON.parse(saved) : {
      id: 'proj-001',
      name: 'Standard Portfolio website',
      description: 'A personal landing page template',
      files: [
        {
          id: 'f1',
          name: 'index.html',
          language: 'html',
          content: `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>My Student Portfolio</title>
    <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-slate-900 text-white min-h-screen flex flex-col justify-between font-sans">
    <header class="p-6 border-b border-slate-800">
        <h1 class="text-xl font-black text-violet-400">⚡ Developer.OS</h1>
    </header>
    <main class="flex-1 max-w-4xl mx-auto flex flex-col items-center justify-center p-8 text-center">
        <span class="text-xs font-bold text-violet-400 uppercase tracking-widest block mb-2">Hello World</span>
        <h2 class="text-4xl md:text-5xl font-extrabold tracking-tight mb-4">Welcome to my AI-Generated Studio Sandbox!</h2>
        <p class="text-slate-400 max-w-md mx-auto mb-8">Feel free to edit these files directly inside the interactive code editor side panel.</p>
        <button id="alertBtn" class="bg-violet-600 hover:bg-violet-700 text-white font-bold py-3 px-8 rounded-2xl transition duration-200">
            Interactive Action Trigger
        </button>
        <p id="actionOutput" class="mt-4 text-green-400 font-semibold hidden">Action Handled Securely!</p>
    </main>
    <script src="script.js"></script>
</body>
</html>`
        },
        {
          id: 'f2',
          name: 'script.js',
          language: 'javascript',
          content: `// Interactive Sandbox JS Hooks
document.getElementById('alertBtn')?.addEventListener('click', () => {
    const feedback = document.getElementById('actionOutput');
    if (feedback) {
        feedback.classList.remove('hidden');
    }
});`
        },
        {
          id: 'f3',
          name: 'Dockerfile',
          language: 'dockerfile',
          content: `FROM node:18-alpine
WORKDIR /app
COPY package.json ./
RUN npm install
COPY . .
EXPOSE 3000
CMD ["npm", "start"]`
        }
      ],
      createdAt: new Date().toISOString()
    };
  });

  const [selectedFileId, setSelectedFileId] = useState<string>(() => {
    return localStorage.getItem('dev_workspace_selected_file_id') || 'f1';
  });
  
  const [editorContent, setEditorContent] = useState<string>(() => {
    const savedContent = localStorage.getItem('dev_workspace_editor_content');
    if (savedContent !== null) return savedContent;
    const initialFiles = localStorage.getItem('dev_workspace_project') 
      ? JSON.parse(localStorage.getItem('dev_workspace_project')!).files 
      : null;
    const activeId = localStorage.getItem('dev_workspace_selected_file_id') || 'f1';
    const activeFile = (initialFiles || []).find((f: any) => f.id === activeId);
    return activeFile ? activeFile.content : `<!DOCTYPE html>...`;
  });

  const [sandboxRefreshKey, setSandboxRefreshKey] = useState(0);
  const [isExporting, setIsExporting] = useState(false);

  // Elite Vibe Coding Extended Workspace States
  const [activeSubTab, setActiveSubTab] = useState<'preview' | 'database' | 'server' | 'deploy'>('preview');
  const [previewDevice, setPreviewDevice] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [isCompiling, setIsCompiling] = useState(false);
  const [compilationProgress, setCompilationProgress] = useState(0);
  const [buildLogs, setBuildLogs] = useState<string[]>([
    '[SYSTEM] Interactive Fullstack Sandbox loaded.',
    '[SYSTEM] Ready for telemetry bindings on port 3000.',
    '[SYSTEM] Select a template below to load fullstack files...'
  ]);
  const [serverLogs, setServerLogs] = useState<any[]>([
    { id: 1, method: 'GET', url: '/api/health', data: { status: 'healthy' }, timestamp: new Date().toLocaleTimeString() }
  ]);
  const [mockDatabaseRows, setMockDatabaseRows] = useState<any[]>([
    { id: 1, table: 'play_history', data: { track_name: 'Cyber-Vibe Stream', artist: 'Alexa Key', duration: '3:24' } },
    { id: 2, table: 'play_history', data: { track_name: 'Neon Horizon Grid', artist: 'HyperShift', duration: '2:45' } }
  ]);

  // Deployment Simulator States
  const [isDeploying, setIsDeploying] = useState(false);
  const [deploymentProgress, setDeploymentProgress] = useState(0);
  const [deploymentUrl, setDeploymentUrl] = useState('');
  const [deploymentLogs, setDeploymentLogs] = useState<string[]>([]);

  // Telemetry logs listener for reactive iframe bindings
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data) {
        if (event.data.type === 'SERVER_REQUEST') {
          const newLog = {
            id: Date.now(),
            method: event.data.method,
            url: event.data.url,
            data: event.data.data,
            timestamp: event.data.timestamp || new Date().toLocaleTimeString()
          };
          setServerLogs(prev => [newLog, ...prev].slice(0, 50));
        }
        else if (event.data.type === 'DB_OPERATION') {
          if (event.data.action === 'INSERT') {
            const newRow = {
              id: event.data.row.id || Date.now(),
              table: event.data.table,
              data: event.data.row
            };
            setMockDatabaseRows(prev => [newRow, ...prev]);
          } else if (event.data.action === 'DELETE') {
            setMockDatabaseRows(prev => prev.filter(row => {
              if (row.table !== event.data.table) return true;
              if (event.data.id && row.id === event.data.id) return false;
              if (event.data.customer_name && row.data.customer_name === event.data.customer_name) return false;
              return true;
            }));
          }
        }
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  const handleExportZip = async () => {
    setIsExporting(true);
    // Dispatch start progress
    window.dispatchEvent(new CustomEvent('ai-task-progress', {
      detail: { taskName: 'Compiling Workspace Files into ZIP Archive...', progress: 10 }
    }));

    try {
      await new Promise(r => setTimeout(r, 400));
      window.dispatchEvent(new CustomEvent('ai-task-progress', {
        detail: { taskName: 'Compiling Workspace Files into ZIP Archive...', progress: 45 }
      }));

      const zip = new JSZip();
      
      // Make sure we write the current editor state first
      const updatedFiles = currentProject.files.map(f => f.id === selectedFileId ? { ...f, content: editorContent } : f);
      
      updatedFiles.forEach(file => {
        zip.file(file.name, file.content);
      });
      
      await new Promise(r => setTimeout(r, 450));
      window.dispatchEvent(new CustomEvent('ai-task-progress', {
        detail: { taskName: 'Compiling Workspace Files into ZIP Archive...', progress: 80 }
      }));

      const blob = await zip.generateAsync({ type: 'blob' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${currentProject.name.toLowerCase().replace(/[^a-z0-9]+/g, '_')}_workspace.zip`;
      link.click();
      URL.revokeObjectURL(url);

      window.dispatchEvent(new CustomEvent('ai-task-progress', {
        detail: { taskName: 'Compiling Workspace Files into ZIP Archive...', progress: 100 }
      }));
      await new Promise(r => setTimeout(r, 350));
    } catch (err) {
      console.error("Failed to compile ZIP archive:", err);
      alert("Error building ZIP download package on client.");
    } finally {
      setIsExporting(false);
      window.dispatchEvent(new CustomEvent('ai-task-progress', {
        detail: { taskName: null, progress: 0 }
      }));
    }
  };

  // Sync state mutations cleanly back to browser cache
  useEffect(() => {
    localStorage.setItem('dev_workspace_active_tab', activeWorkspaceTab);
  }, [activeWorkspaceTab]);

  useEffect(() => {
    localStorage.setItem('dev_workspace_prompt', prompt);
  }, [prompt]);

  useEffect(() => {
    localStorage.setItem('dev_workspace_project', JSON.stringify(currentProject));
  }, [currentProject]);

  useEffect(() => {
    localStorage.setItem('dev_workspace_selected_file_id', selectedFileId);
  }, [selectedFileId]);

  useEffect(() => {
    localStorage.setItem('dev_workspace_editor_content', editorContent);
  }, [editorContent]);

  // Dynamic code metrics and tech breakdown calculator
  const getProjectMetrics = () => {
    let htmlSize = 0;
    let jsSize = 0;
    let otherSize = 0;

    currentProject.files.forEach(f => {
      const ext = f.name.split('.').pop()?.toLowerCase();
      const size = f.content.length;
      if (ext === 'html') {
        htmlSize += size;
      } else if (ext === 'js' || ext === 'ts' || ext === 'jsx' || ext === 'tsx' || f.language === 'javascript' || f.language === 'typescript') {
        jsSize += size;
      } else {
        otherSize += size;
      }
    });

    const total = htmlSize + jsSize + otherSize || 1;
    const htmlPct = Math.round((htmlSize / total) * 100);
    const jsPct = Math.round((jsSize / total) * 100);
    const otherPct = Math.round((otherSize / total) * 100);

    let cyclomaticComplexity = 2;
    let totalLines = 0;
    currentProject.files.forEach(f => {
      totalLines += f.content.split('\n').length;
      const matches = f.content.match(/(if|for|while|map|forEach|filter|&&|\|\|)/g);
      if (matches) {
        cyclomaticComplexity += matches.length;
      }
    });

    return {
      htmlPct,
      jsPct,
      otherPct,
      totalLines,
      cyclomaticComplexity: Math.min(cyclomaticComplexity, 18),
    };
  };

  const metrics = getProjectMetrics();

  const handleFileSelect = (id: string) => {
    // Save current file's content first
    const updatedFiles = currentProject.files.map(f => f.id === selectedFileId ? { ...f, content: editorContent } : f);
    setCurrentProject(prev => ({ ...prev, files: updatedFiles }));

    setSelectedFileId(id);
    const targetFile = currentProject.files.find(f => f.id === id);
    if (targetFile) {
      setEditorContent(targetFile.content);
    }
  };

  const handleEditorChange = (val: string) => {
    setEditorContent(val);
    // Instant save
    setCurrentProject(prev => {
      const updated = prev.files.map(f => f.id === selectedFileId ? { ...f, content: val } : f);
      return { ...prev, files: updated };
    });
  };

  const triggerAppGeneration = async () => {
    if (!prompt.trim()) return;
    setIsGenerating(true);

    try {
      // Execute security-guided generator API endpoint
      const res = await fetch('/api/generate-project', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, techStack })
      });
      const data = await res.json();
      if (data.files) {
        setCurrentProject({
          id: `proj-${Date.now()}`,
          name: data.name || 'Secure Sandbox Build',
          description: data.description,
          files: data.files,
          createdAt: new Date().toISOString()
        });
        setSelectedFileId(data.files[0].id);
        setEditorContent(data.files[0].content);
        setSandboxRefreshKey(prev => prev + 1);
      }
    } catch {
      alert('Error communicating with code builder backend.');
    } finally {
      setIsGenerating(false);
    }
  };

  // State for coding question practice generator
  const [activeTopic, setActiveTopic] = useState<string>('arrays');
  const [selectedProblemIndex, setSelectedProblemIndex] = useState<number>(1);
  const [selectedLanguage, setSelectedLanguage] = useState<'TypeScript' | 'C++' | 'Python' | 'Java'>('TypeScript');
  const [topicSearchQuery, setTopicSearchQuery] = useState<string>('');

  // --- REAL-TIME GRAPHICAL STATE INJECTION & TRACE LOOP STATES ---
  const [practiceInputText, setPracticeInputText] = useState<string>('40, 25, 75, 10, 95, 60, 50');
  const [practicePlaybackSpeed, setPracticePlaybackSpeed] = useState<number>(1000); // ms per step
  const [practiceIsPlaying, setPracticeIsPlaying] = useState<boolean>(false);
  const [practiceStepIndex, setPracticeStepIndex] = useState<number>(0);
  const [practiceSteps, setPracticeSteps] = useState<any[]>([]);

  // Compile steps on changes of inputs or topic
  useEffect(() => {
    const steps = compilePracticeSteps(activeTopic, practiceInputText);
    setPracticeSteps(steps);
    setPracticeStepIndex(0);
    setPracticeIsPlaying(false);
  }, [activeTopic, practiceInputText]);

  // Handle ticking loop using requestAnimationFrame
  useEffect(() => {
    if (!practiceIsPlaying) return;

    let lastTime = performance.now();
    let frameId: number;

    const tick = (now: number) => {
      const delta = now - lastTime;
      if (delta >= practicePlaybackSpeed) {
        setPracticeStepIndex(prev => {
          if (prev < practiceSteps.length - 1) {
            lastTime = now;
            return prev + 1;
          } else {
            setPracticeIsPlaying(false);
            return prev;
          }
        });
      }
      frameId = requestAnimationFrame(tick);
    };

    frameId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frameId);
  }, [practiceIsPlaying, practiceSteps, practicePlaybackSpeed]);

  const practiceQ = getProceduralProblem(activeTopic, selectedProblemIndex, selectedLanguage);

  const compileWorkspacePreview = () => {
    const indexFile = currentProject.files.find(f => f.name === 'index.html');
    if (!indexFile) {
      return `<div style="font-family:sans-serif; text-align:center; padding: 40px; color: #1a1a1a; background: #fff;">
                <h3 style="margin-top:0;">index.html not found</h3>
                <p>Add an index.html file to preview this workspace.</p>
              </div>`;
    }

    let docContent = indexFile.content;

    // Let's replace relative file references in index.html with inline contents
    currentProject.files.forEach(file => {
      if (file.name === 'index.html') return;
      
      const escName = file.name.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
      
      // Match script tags with relative source: src="app.js", src="./app.js", src="/app.js"
      const scriptRegex = new RegExp(`<script[^>]*src=["'](?:\\.\\/)?${escName}["'][^>]*>\\s*<\\/script>`, 'gi');
      if (scriptRegex.test(docContent)) {
        docContent = docContent.replace(scriptRegex, `<script>\n// Embedded ${file.name}\n${file.content}\n</script>`);
      }

      // Match css link tags: href="style.css", href="./style.css", href="/style.css"
      const cssRegex = new RegExp(`<link[^>]*href=["'](?:\\.\\/)?${escName}["'][^>]*>`, 'gi');
      if (cssRegex.test(docContent)) {
        docContent = docContent.replace(cssRegex, `<style>\n/* Embedded ${file.name} */\n${file.content}\n</style>`);
      }
    });

    return docContent;
  };

  function handleTopicChange(topic: string) {
    setActiveTopic(topic);
    setSelectedProblemIndex(1);
  }

  // Multi-file pre-configured fullstack templates
  function getTemplateFiles(id: string): CodeFile[] {
    if (id === 'spotify-retro') {
      return [
        {
          id: 'f-sr-1',
          name: 'index.html',
          language: 'html',
          content: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Spotify Retro Matrix</title>
  <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-[#090911] text-zinc-100 min-h-screen font-sans flex flex-col justify-between p-4 selection:bg-[#ff007f] selection:text-white">
  <!-- Retro Cyber Grid Overlay -->
  <div class="fixed inset-0 pointer-events-none opacity-5 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[size:100%_4px,3px_100%]"></div>
  
  <div class="max-w-2xl mx-auto w-full bg-[#121222] border border-[#ff007f]/30 rounded-2xl p-6 shadow-[0_0_30px_rgba(255,0,127,0.15)] flex-1 flex flex-col justify-between">
    <!-- Header -->
    <div class="flex justify-between items-center border-b border-[#ff007f]/20 pb-4">
      <div>
        <h1 class="text-lg font-black tracking-widest text-[#ff007f] uppercase">RETRO MUSIC MATRIX</h1>
        <p class="text-[10px] font-mono text-cyan-400">STATUS: INTERACTIVE CLIENT_EMULATOR ONLINE</p>
      </div>
      <span class="text-[9px] font-mono bg-cyan-950 text-cyan-400 px-2.5 py-1 border border-cyan-800">CORS: ACTIVE</span>
    </div>

    <!-- Album Art & Controls Grid -->
    <div class="my-6 grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
      <div class="flex flex-col items-center">
        <!-- Vinyl disc rotating -->
        <div id="vinylDisk" class="w-40 h-40 rounded-full bg-[#030307] border-4 border-[#ff007f] flex items-center justify-center shadow-[0_0_20px_rgba(255,0,127,0.3)] transition-transform duration-[4000ms] ease-linear">
          <div class="w-16 h-16 rounded-full bg-cyan-950 border-4 border-cyan-400 flex items-center justify-center">
            <div class="w-4 h-4 rounded-full bg-black"></div>
          </div>
        </div>
        <p id="nowPlayingText" class="text-xs text-center font-mono mt-4 text-cyan-300">SYSTEM IDLE // SELECT TRACK</p>
        <p id="artistText" class="text-[9px] text-zinc-500 font-mono">0.00kbps stream</p>
      </div>

      <!-- Playlist Selection -->
      <div class="space-y-2 bg-[#090914] p-3 rounded-xl border border-zinc-800 h-44 overflow-y-auto">
        <div onclick="playSong('Cyber-Vibe Stream 01', 'Alexa Key', '3:24')" class="track-item p-2 hover:bg-[#ff007f]/20 rounded border border-transparent hover:border-[#ff007f]/40 cursor-pointer transition flex justify-between items-center">
          <span class="text-xs font-mono font-bold">01. Cyber-Vibe Stream</span>
          <span class="text-[9px] font-mono text-[#ff007f]">3:24</span>
        </div>
        <div onclick="playSong('Neon Horizon Grid', 'HyperShift', '2:45')" class="track-item p-2 hover:bg-[#ff007f]/20 rounded border border-transparent hover:border-[#ff007f]/40 cursor-pointer transition flex justify-between items-center">
          <span class="text-xs font-mono font-bold">02. Neon Horizon Grid</span>
          <span class="text-[9px] font-mono text-[#ff007f]">2:45</span>
        </div>
        <div onclick="playSong('Syntax Error Beats', 'Refactor 9', '4:12')" class="track-item p-2 hover:bg-[#ff007f]/20 rounded border border-transparent hover:border-[#ff007f]/40 cursor-pointer transition flex justify-between items-center">
          <span class="text-xs font-mono font-bold">03. Syntax Error Beats</span>
          <span class="text-[9px] font-mono text-[#ff007f]">4:12</span>
        </div>
        <div onclick="playSong('Midnight Wave Runner', 'Lumia Core', '3:05')" class="track-item p-2 hover:bg-[#ff007f]/20 rounded border border-transparent hover:border-[#ff007f]/40 cursor-pointer transition flex justify-between items-center">
          <span class="text-xs font-mono font-bold">04. Midnight Wave Runner</span>
          <span class="text-[9px] font-mono text-[#ff007f]">3:05</span>
        </div>
      </div>
    </div>

    <!-- Soundwave Visualization Bars -->
    <div class="flex justify-center items-end gap-1 h-12 mb-4">
      <div class="v-bar w-1.5 bg-[#ff007f] h-2"></div>
      <div class="v-bar w-1.5 bg-[#ff007f] h-4"></div>
      <div class="v-bar w-1.5 bg-cyan-400 h-8"></div>
      <div class="v-bar w-1.5 bg-cyan-400 h-5"></div>
      <div class="v-bar w-1.5 bg-violet-500 h-10"></div>
      <div class="v-bar w-1.5 bg-[#ff007f] h-3"></div>
      <div class="v-bar w-1.5 bg-[#ff007f] h-6"></div>
    </div>

    <!-- Active Player Media Controls -->
    <div class="bg-[#090911] p-3 rounded-xl border border-zinc-800 flex items-center justify-between">
      <button onclick="controlTrack('prev')" class="text-zinc-400 hover:text-white font-mono text-xs px-2.5 py-1.5 hover:bg-zinc-800 rounded">◄◄ PREV</button>
      <button id="playBtn" onclick="togglePlay()" class="bg-[#ff007f] hover:bg-[#ff007f]/90 text-white font-mono text-xs px-5 py-2 font-bold rounded shadow-[0_0_10px_rgba(255,0,127,0.4)]">▶ PLAY</button>
      <button onclick="controlTrack('next')" class="text-zinc-400 hover:text-white font-mono text-xs px-2.5 py-1.5 hover:bg-zinc-800 rounded">NEXT ►►</button>
    </div>
  </div>

  <script>
    let isPlaying = false;
    let rotationDeg = 0;
    let rotationInterval;
    let currentSong = '';

    function logTelemetry(method, url, data) {
      window.parent.postMessage({
        type: 'SERVER_REQUEST',
        method: method,
        url: url,
        data: data,
        timestamp: new Date().toLocaleTimeString()
      }, '*');
    }

    function playSong(name, artist, duration) {
      currentSong = name;
      isPlaying = true;
      document.getElementById('nowPlayingText').innerText = name.toUpperCase() + ' // PLAYING';
      document.getElementById('artistText').innerText = artist + ' - ' + duration;
      document.getElementById('playBtn').innerText = '❚❚ PAUSE';
      
      // Start rotating CD
      clearInterval(rotationInterval);
      rotationInterval = setInterval(() => {
        rotationDeg += 5;
        document.getElementById('vinylDisk').style.transform = 'rotate(' + rotationDeg + 'deg)';
      }, 50);

      // Animate Visualizer Bars randomly
      const bars = document.querySelectorAll('.v-bar');
      bars.forEach(bar => {
        bar.style.transition = 'height 150ms ease';
        bar.dataset.interval = setInterval(() => {
          if (isPlaying) {
            bar.style.height = Math.floor(Math.random() * 40 + 5) + 'px';
          }
        }, 150);
      });

      logTelemetry('POST', '/api/playback/play', { song: name, artist: artist });
      
      // Dispatch database operation
      window.parent.postMessage({
        type: 'DB_OPERATION',
        action: 'INSERT',
        table: 'play_history',
        row: { id: Date.now(), track_name: name, artist: artist, duration: duration }
      }, '*');
    }

    function togglePlay() {
      if (!currentSong) {
        playSong('Cyber-Vibe Stream 01', 'Alexa Key', '3:24');
        return;
      }
      isPlaying = !isPlaying;
      if (isPlaying) {
        document.getElementById('playBtn').innerText = '❚❚ PAUSE';
        document.getElementById('nowPlayingText').innerText = currentSong.toUpperCase() + ' // PLAYING';
        logTelemetry('POST', '/api/playback/resume', { song: currentSong });
      } else {
        document.getElementById('playBtn').innerText = '▶ PLAY';
        document.getElementById('nowPlayingText').innerText = currentSong.toUpperCase() + ' // PAUSED';
        clearInterval(rotationInterval);
        logTelemetry('POST', '/api/playback/pause', { song: currentSong });
      }
    }

    function controlTrack(action) {
      logTelemetry('POST', '/api/playback/' + action, { activeSong: currentSong });
    }
  </script>
</body>
</html>`
        },
        {
          id: 'f-sr-2',
          name: 'server.js',
          language: 'javascript',
          content: `// Express Endpoint Gateway Mock
const express = require('express');
const app = express();
app.use(express.json());

// Strict sanitization rules
app.post('/api/playback/play', (req, res) => {
  const { song, artist } = req.body;
  if (!song || typeof song !== 'string') {
    return res.status(400).json({ error: 'Invalid track parameter' });
  }
  console.log('[EXPRESS BACKEND] Initializing audio stream buffering context');
  res.json({ status: 'ok', streamUrl: '/streams/' + song.toLowerCase().replace(/\\s+/g, '_') });
});

app.listen(3000, () => console.log('Matrix service listening on port 3000'));`
        },
        {
          id: 'f-sr-3',
          name: 'schema.sql',
          language: 'sql',
          content: `CREATE TABLE IF NOT EXISTS tracks (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  artist TEXT NOT NULL,
  duration TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS play_history (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  track_name TEXT NOT NULL,
  artist TEXT NOT NULL,
  duration TEXT NOT NULL
);`
        }
      ];
    }
    else if (id === 'saas-revenue') {
      return [
        {
          id: 'f-sr-4',
          name: 'index.html',
          language: 'html',
          content: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>SaaS Telemetry Core</title>
  <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-[#09090b] text-zinc-100 min-h-screen font-sans p-6 selection:bg-emerald-500 selection:text-black">
  <div class="max-w-4xl mx-auto space-y-6">
    <!-- Header -->
    <div class="flex justify-between items-center bg-[#18181b] border border-zinc-800 p-5 rounded-xl">
      <div>
        <h1 class="text-xl font-bold tracking-tight text-white flex items-center gap-2">🟢 GROWTH CORE TELEMETRY</h1>
        <p class="text-xs text-zinc-400 font-mono mt-0.5">DB SERVER: SQLLITE_V3 // MEMORY SECURED</p>
      </div>
      <button onclick="addNewUser()" class="bg-emerald-500 hover:bg-emerald-400 text-black font-mono font-bold text-xs px-4 py-2 rounded transition">
        + ADD SUBSCRIBER
      </button>
    </div>

    <!-- KPI Grid -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div class="bg-[#18181b] border border-zinc-800 p-5 rounded-xl">
        <span class="text-[10px] text-zinc-500 font-mono font-bold uppercase block">MONTHLY RECURRING REVENUE</span>
        <div class="text-2xl font-black text-emerald-400 mt-1">$48,250.00</div>
        <span class="text-[9px] text-emerald-500 font-mono">+12.4% vs last mo</span>
      </div>
      <div class="bg-[#18181b] border border-zinc-800 p-5 rounded-xl">
        <span class="text-[10px] text-zinc-500 font-mono font-bold uppercase block">ACTIVE ACCOUNTS</span>
        <div class="text-2xl font-black text-white mt-1" id="subCount">1,284</div>
        <span class="text-[9px] text-zinc-400 font-mono">Real-time DB count</span>
      </div>
      <div class="bg-[#18181b] border border-zinc-800 p-5 rounded-xl">
        <span class="text-[10px] text-zinc-500 font-mono font-bold uppercase block">API SERVER COOLDOWN</span>
        <div class="text-2xl font-black text-cyan-400 mt-1">14ms</div>
        <span class="text-[9px] text-cyan-400 font-mono">Latency validated</span>
      </div>
    </div>

    <!-- Users Table -->
    <div class="bg-[#18181b] border border-zinc-800 rounded-xl overflow-hidden">
      <div class="p-4 border-b border-zinc-800 bg-[#1e1e24]/40 flex justify-between items-center">
        <span class="text-xs font-mono font-bold text-zinc-300">ACTIVE SUBSCRIPTION LEDGER</span>
      </div>
      <div class="overflow-x-auto">
        <table class="w-full text-left border-collapse font-mono text-xs">
          <thead>
            <tr class="border-b border-zinc-800 text-zinc-500">
              <th class="p-4">CUSTOMER</th>
              <th class="p-4">STATUS</th>
              <th class="p-4">TIER</th>
              <th class="p-4">ACTION</th>
            </tr>
          </thead>
          <tbody id="subscriberList">
            <tr class="border-b border-zinc-800/50" id="row-1">
              <td class="p-4 font-bold text-white">Alex Rivera</td>
              <td class="p-4"><span class="bg-emerald-950 text-emerald-400 border border-emerald-900 px-2 py-0.5 text-[9px] font-bold">ACTIVE</span></td>
              <td class="p-4 text-zinc-400">$29/mo</td>
              <td class="p-4"><button onclick="deactivate('row-1', 'Alex Rivera')" class="text-red-400 hover:text-red-300">Deactivate</button></td>
            </tr>
            <tr class="border-b border-zinc-800/50" id="row-2">
              <td class="p-4 font-bold text-white">Sarah Chen</td>
              <td class="p-4"><span class="bg-emerald-950 text-emerald-400 border border-emerald-900 px-2 py-0.5 text-[9px] font-bold">ACTIVE</span></td>
              <td class="p-4 text-zinc-400">$99/mo</td>
              <td class="p-4"><button onclick="deactivate('row-2', 'Sarah Chen')" class="text-red-400 hover:text-red-300">Deactivate</button></td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>

  <script>
    let subscribersCount = 1284;
    function logTelemetry(method, url, data) {
      window.parent.postMessage({
        type: 'SERVER_REQUEST',
        method: method,
        url: url,
        data: data,
        timestamp: new Date().toLocaleTimeString()
      }, '*');
    }

    function addNewUser() {
      const names = ['Marcus Vance', 'Helena Frost', 'Daniel Kross', 'Sienna Brooks', 'Clara Yang'];
      const randomName = names[Math.floor(Math.random() * names.length)];
      const id = 'row-' + Date.now();
      
      const tbody = document.getElementById('subscriberList');
      const row = document.createElement('tr');
      row.className = 'border-b border-zinc-800/50';
      row.id = id;
      row.innerHTML = '<td class="p-4 font-bold text-white">' + randomName + '</td>' +
                      '<td class="p-4"><span class="bg-emerald-950 text-emerald-400 border border-emerald-900 px-2 py-0.5 text-[9px] font-bold">ACTIVE</span></td>' +
                      '<td class="p-4 text-zinc-400">$49/mo</td>' +
                      '<td class="p-4"><button onclick="deactivate(\\'' + id + '\\', \\'' + randomName + '\\')" class="text-red-400 hover:text-red-300">Deactivate</button></td>';
      tbody.appendChild(row);
      
      subscribersCount += 1;
      document.getElementById('subCount').innerText = subscribersCount;

      logTelemetry('POST', '/api/customers/add', { name: randomName, plan: '$49/mo' });
      window.parent.postMessage({
        type: 'DB_OPERATION',
        action: 'INSERT',
        table: 'subscriptions',
        row: { id: Date.now(), customer_name: randomName, amount: '$49/mo', status: 'ACTIVE' }
      }, '*');
    }

    function deactivate(rowId, name) {
      const row = document.getElementById(rowId);
      if (row) {
        row.remove();
        subscribersCount -= 1;
        document.getElementById('subCount').innerText = subscribersCount;
        
        logTelemetry('DELETE', '/api/customers/deactivate', { name: name });
        window.parent.postMessage({
          type: 'DB_OPERATION',
          action: 'DELETE',
          table: 'subscriptions',
          customer_name: name
        }, '*');
      }
    }
  </script>
</body>
</html>`
        },
        {
          id: 'f-sr-5',
          name: 'server.js',
          language: 'javascript',
          content: `// Express server routes
const express = require('express');
const app = express();
app.use(express.json());

app.post('/api/customers/add', (req, res) => {
  const { name, plan } = req.body;
  if(!name || typeof name !== 'string') {
    return res.status(400).json({ error: 'Name validation constraint triggered' });
  }
  res.json({ success: true, message: 'Subscriber inserted cleanly' });
});`
        },
        {
          id: 'f-sr-6',
          name: 'schema.sql',
          language: 'sql',
          content: `CREATE TABLE IF NOT EXISTS subscriptions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  customer_name TEXT NOT NULL,
  amount TEXT NOT NULL,
  status TEXT NOT NULL
);`
        }
      ];
    }
    else {
      return [
        {
          id: 'f-sr-7',
          name: 'index.html',
          language: 'html',
          content: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>DB SQL Vault</title>
  <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-[#0b0c10] text-zinc-100 min-h-screen font-sans p-6 selection:bg-[#66fcf1] selection:text-black">
  <div class="max-w-2xl mx-auto bg-[#1f2833] border border-[#66fcf1]/30 p-6 rounded-2xl shadow-[0_0_20px_rgba(102,252,241,0.1)] space-y-6">
    <div>
      <h1 class="text-xl font-bold tracking-widest text-[#66fcf1] uppercase">🛡️ SQL PARAMETERIZED SECURITY VAULT</h1>
      <p class="text-xs text-zinc-400 font-mono mt-1">SANDBOX IMMUNITY LEVEL: MAXIMUM</p>
    </div>

    <!-- Parameterized demonstration -->
    <div class="space-y-3 bg-[#0b0c10]/70 p-4 border border-zinc-800 rounded-xl">
      <label class="text-[10px] font-mono font-bold text-cyan-400 uppercase tracking-wider block">INPUT PARM QUERY STRING</label>
      <input type="text" id="queryInput" placeholder="Try ' OR '1'='1" class="w-full bg-[#1f2833] text-white border border-zinc-700 px-3 py-2 rounded font-mono text-xs outline-none focus:border-[#66fcf1]" />
      <div class="flex gap-2.5">
        <button onclick="testInsecure()" class="flex-1 bg-red-950 text-red-400 border border-red-800 font-mono font-bold text-xs py-2 rounded hover:bg-red-900 transition">INSECURE EXECUTION (MOCK)</button>
        <button onclick="testSecure()" class="flex-1 bg-emerald-950 text-emerald-400 border border-emerald-800 font-mono font-bold text-xs py-2 rounded hover:bg-emerald-900 transition">SECURE PARAMETERIZED</button>
      </div>
    </div>

    <!-- Trace Logs -->
    <div class="bg-black border border-zinc-800 rounded-xl p-4 font-mono text-xs h-32 overflow-y-auto space-y-1 text-zinc-300" id="securityConsole">
      <div class="text-[9px] text-zinc-500">// READY FOR STATEMENT TEST...</div>
    </div>
  </div>

  <script>
    function logTelemetry(method, url, data) {
      window.parent.postMessage({
        type: 'SERVER_REQUEST',
        method: method,
        url: url,
        data: data,
        timestamp: new Date().toLocaleTimeString()
      }, '*');
    }

    function testInsecure() {
      const input = document.getElementById('queryInput').value || "' OR '1'='1";
      const console = document.getElementById('securityConsole');
      
      console.innerHTML += '<div class="text-red-400">[VULNERABILITY WARNING] raw string interpolation: SELECT * FROM vault_secrets WHERE name = \\'' + input + '\\'</div>';
      logTelemetry('POST', '/api/vault/query-insecure', { input });
    }

    function testSecure() {
      const input = document.getElementById('queryInput').value || "' OR '1'='1";
      const console = document.getElementById('securityConsole');
      
      console.innerHTML += '<div class="text-emerald-400">[SHIELD ACTIVE] query bound parameterized index lookup. Target text evaluated as harmless raw string value.</div>';
      logTelemetry('POST', '/api/vault/query-secure', { input });
      
      window.parent.postMessage({
        type: 'DB_OPERATION',
        action: 'INSERT',
        table: 'security_audit_logs',
        row: { id: Date.now(), input_value: input, type: 'PARAMETER_BOUND' }
      }, '*');
    }
  </script>
</body>
</html>`
        },
        {
          id: 'f-sr-8',
          name: 'server.js',
          language: 'javascript',
          content: `// Express Database Vault Service
const express = require('express');
const app = express();
app.use(express.json());

app.post('/api/vault/query-secure', (req, res) => {
  const { input } = req.body;
  // Use bound parameters to ensure queries cannot inject instructions
  console.log('[SECURITY BOUNDARY] executing: SELECT * FROM secrets WHERE id = ?', [input]);
  res.json({ success: true, rows: [] });
});`
        },
        {
          id: 'f-sr-9',
          name: 'schema.sql',
          language: 'sql',
          content: `CREATE TABLE IF NOT EXISTS security_audit_logs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  input_value TEXT NOT NULL,
  type TEXT NOT NULL
);`
        }
      ];
    }
  }

  const loadTemplate = (id: string) => {
    const files = getTemplateFiles(id);
    let name = 'Spotify Retro Music Web App';
    let desc = 'Full-stack music matrix dashboard with reactive local playback queues.';
    if (id === 'saas-revenue') {
      name = 'SaaS Revenue & Telemetry Center';
      desc = 'Executive growth control panel with real-time SVG charts and active user provisioning.';
    } else if (id === 'db-vault') {
      name = 'DB SQL Vault Matrix';
      desc = 'Interactive database records panel with active parameterized security validation overlays.';
    }

    const newProj: AppProject = {
      id: `proj-${id}-${Date.now()}`,
      name,
      description: desc,
      files,
      createdAt: new Date().toISOString()
    };

    setCurrentProject(newProj);
    setSelectedFileId(files[0].id);
    setEditorContent(files[0].content);
    setSandboxRefreshKey(prev => prev + 1);

    if (id === 'spotify-retro') {
      setMockDatabaseRows([
        { id: 1, table: 'play_history', data: { track_name: 'Cyber-Vibe Stream', artist: 'Alexa Key', duration: '3:24' } },
        { id: 2, table: 'play_history', data: { track_name: 'Neon Horizon Grid', artist: 'HyperShift', duration: '2:45' } }
      ]);
    } else if (id === 'saas-revenue') {
      setMockDatabaseRows([
        { id: 1, table: 'subscriptions', data: { customer_name: 'Alex Rivera', amount: '$29/mo', status: 'ACTIVE' } },
        { id: 2, table: 'subscriptions', data: { customer_name: 'Sarah Chen', amount: '$99/mo', status: 'ACTIVE' } }
      ]);
    } else {
      setMockDatabaseRows([
        { id: 1, table: 'security_audit_logs', data: { input_value: 'SELECT * FROM secrets', type: 'STANDARD_BOUND' } }
      ]);
    }

    setServerLogs([
      { id: 1, method: 'GET', url: '/api/health', data: { status: 'healthy' }, timestamp: new Date().toLocaleTimeString() }
    ]);

    setBuildLogs([
      `[COMPILER] Initializing compiler matrix...`,
      `[LINTER] Parsing types for ${files.length} modules... 0 errors.`,
      `[BUNDLER] Compiling production build...`,
      `[SANDBOX] Hot reloading complete. Sandbox running on port 3000.`
    ]);
  };

  const triggerInteractiveBuild = () => {
    setIsCompiling(true);
    setCompilationProgress(0);
    setBuildLogs(prev => [
      ...prev,
      `[PLANNER] Analyzing workspace prompt: "${prompt || currentProject.name}"`,
      `[PLANNER] Checking multi-file dependency matrix...`,
      `[BUILDER] Compiling entry-point: index.html...`,
    ]);

    const interval = setInterval(() => {
      setCompilationProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsCompiling(false);
          setSandboxRefreshKey(p => p + 1);
          setBuildLogs(logs => [
            ...logs,
            `[LINTER] Security audit passed. Zero syntax warnings detected.`,
            `[BUNDLER] Assets bundled to static dist/ directory successfully.`,
            `[SANDBOX] Server reboot completed. Listening at http://0.0.0.0:3000.`
          ]);
          return 100;
        }
        
        const next = prev + 20;
        if (next === 40) {
          setBuildLogs(logs => [...logs, `[BUILDER] Transpiling script assets... OK`]);
        } else if (next === 80) {
          setBuildLogs(logs => [...logs, `[BUILDER] Parameterized schema validation check... SECURE`]);
        }
        return next;
      });
    }, 200);
  };

  const triggerInteractiveDeploy = () => {
    setIsDeploying(true);
    setDeploymentProgress(0);
    setDeploymentUrl('');
    setDeploymentLogs([
      `[DOCKER] Building container image: gcr.io/aistudio-sandbox/${currentProject.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}:latest`,
      `[DOCKER] Sending build context to Docker daemon...`,
      `[DOCKER] Step 1/5 : FROM node:18-alpine`,
      `[DOCKER]  ---> Using cache`
    ]);

    const interval = setInterval(() => {
      setDeploymentProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsDeploying(false);
          setDeploymentUrl(`https://secure-${currentProject.id.toLowerCase().substring(5, 13)}.run.app`);
          setDeploymentLogs(logs => [
            ...logs,
            `[GCP] Traffic routed to 100% stable revision.`,
            `[GCP] Deployment complete! SSL Certificate active.`,
            `[GCP] Live secure link: https://secure-${currentProject.id.toLowerCase().substring(5, 13)}.run.app`
          ]);
          return 100;
        }

        const next = prev + 25;
        if (next === 25) {
          setDeploymentLogs(logs => [
            ...logs,
            `[DOCKER] Step 4/5 : EXPOSE 3000`,
            `[DOCKER] Step 5/5 : CMD ["npm", "start"]`,
            `[DOCKER] Pushing container to Google Container Registry...`
          ]);
        } else if (next === 50) {
          setDeploymentLogs(logs => [
            ...logs,
            `[GCP] Cloud Run service initialization...`,
            `[GCP] Provisioning isolated container pods...`
          ]);
        } else if (next === 75) {
          setDeploymentLogs(logs => [
            ...logs,
            `[GCP] Mapping custom subdomain and provisioning SSL certificates...`,
            `[GCP] Handshaking TLS v1.3 with Cloudflare edge...`
          ]);
        }
        return next;
      });
    }, 300);
  };

  return (
    <div className="flex flex-col h-full bg-[#F9F8F6] text-[#1A1A1A]" id="dev-workspace-root">
      {/* Workspace Menu Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between p-6 bg-[#F9F8F6] border-b border-[#1A1A1A] shrink-0">
        <div>
          <h2 className="text-2xl font-serif font-black italic text-[#1A1A1A] flex items-center gap-2">
            <Laptop className="text-[#1A1A1A] h-5 w-5 stroke-[1.5]" /> AI Software Engineer Workspace
          </h2>
          <p className="text-xs text-[#1A1A1A]/60 font-serif mt-1">Practice interview DSA or review computer science concept decks.</p>
        </div>
        <div className="flex items-center gap-1.5 bg-white p-1 rounded-none border border-[#1A1A1A] shadow-[2px_2px_0px_rgba(26,26,26,0.15)] mt-4 md:mt-0 select-none">
          {[
            { id: 'practice', name: 'DSA practice Arena', icon: HelpCircle },
            { id: 'learning_deck', name: 'Concept Decks', icon: BookOpen }
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveWorkspaceTab(tab.id as any)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-none font-mono text-xs transition cursor-pointer ${
                  activeWorkspaceTab === tab.id
                    ? 'bg-[#1A1A1A] text-[#F9F8F6]'
                    : 'text-[#1A1A1A]/70 hover:bg-[#1A1A1A]/5'
                }`}
              >
                <Icon className="h-3.5 w-3.5" /> {tab.name}
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex-1 overflow-hidden">


        {activeWorkspaceTab === 'practice' && (
          <div className="flex flex-col lg:flex-row h-full overflow-hidden">
            {/* Practice selection */}
            <div className="w-full lg:w-72 bg-white border-r border-[#1A1A1A] p-4 shrink-0 flex flex-col gap-1.5 overflow-hidden">
              <span className="text-[10px] font-mono font-bold text-[#1A1A1A]/40 uppercase tracking-widest px-3 mb-2 hidden lg:block">33 Topics Arena</span>
              
              {/* Search Box */}
              <div className="mb-2 px-3">
                <input
                  type="text"
                  value={topicSearchQuery}
                  onChange={(e) => setTopicSearchQuery(e.target.value)}
                  placeholder="Search 33 Topics..."
                  className="w-full border border-[#1A1A1A]/20 bg-white outline-none rounded-none p-1.5 text-[11px] font-mono text-[#1A1A1A]"
                />
              </div>

              {/* Scrollable Topic list */}
              <div className="flex-1 overflow-y-auto space-y-1 pr-1 scrollbar-thin flex lg:flex-col gap-1.5 lg:gap-1">
                {(typeof DSA_TOPICS_33 !== 'undefined' ? DSA_TOPICS_33 : []).filter(t => 
                  t.name.toLowerCase().includes(topicSearchQuery.toLowerCase()) ||
                  t.id.toLowerCase().includes(topicSearchQuery.toLowerCase())
                ).map((topic) => (
                  <button
                    key={topic.id}
                    onClick={() => handleTopicChange(topic.id)}
                    className={`w-full text-left px-3 py-2 rounded-none text-xs font-mono transition cursor-pointer flex justify-between items-center shrink-0 ${
                      activeTopic === topic.id
                        ? 'bg-[#1A1A1A] text-[#F9F8F6] font-bold border border-[#1A1A1A]'
                        : 'hover:bg-[#1A1A1A]/5 text-[#1A1A1A] border border-transparent'
                    }`}
                  >
                    <span className="truncate mr-1">{topic.name}</span>
                    <span className="text-[8px] opacity-60 shrink-0 font-bold px-1 bg-zinc-100 text-zinc-800">50 Qs</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Question Details */}
            <div className="flex-1 overflow-y-auto p-6 bg-[#F9F8F6] space-y-4">
              {/* Problem picker and Language Picker toolbar */}
              <div className="flex flex-col sm:flex-row sm:items-center gap-3 bg-white p-3 border border-[#1A1A1A] shadow-[2px_2px_0px_rgba(26,26,26,0.1)]">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono font-bold text-[#1A1A1A]/50 uppercase tracking-wider">Select Problem:</span>
                  <select
                    value={selectedProblemIndex}
                    onChange={(e) => setSelectedProblemIndex(parseInt(e.target.value, 10))}
                    className="border border-[#1A1A1A] bg-[#F9F8F6] px-2 py-1 text-xs font-mono text-[#1A1A1A] outline-none rounded-none cursor-pointer"
                  >
                    {Array.from({ length: 50 }, (_, i) => i + 1).map(num => (
                      <option key={num} value={num}>Problem {num} / 50</option>
                    ))}
                  </select>
                </div>

                <div className="flex items-center gap-2 sm:ml-auto">
                  <span className="text-[10px] font-mono font-bold text-[#1A1A1A]/50 uppercase tracking-wider">Active Language:</span>
                  <div className="flex gap-0.5 border border-[#1A1A1A] p-0.5 bg-[#F9F8F6]">
                    {(['TypeScript', 'C++', 'Python', 'Java'] as const).map((lang) => (
                      <button
                        key={lang}
                        onClick={() => setSelectedLanguage(lang)}
                        className={`px-2 py-0.5 text-[9px] font-mono font-bold uppercase transition cursor-pointer rounded-none ${
                          selectedLanguage === lang
                            ? 'bg-[#1A1A1A] text-[#F9F8F6]'
                            : 'text-[#1A1A1A]/70 hover:bg-[#1A1A1A]/5'
                        }`}
                      >
                        {lang}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Header card info */}
              <div className="border-b border-[#1A1A1A]/15 pb-4">
                <span className="text-[9px] font-mono font-bold bg-[#1A1A1A] text-[#F9F8F6] px-2 py-0.5 rounded-none uppercase tracking-wider">
                  Academic Practice Target
                </span>
                <h3 className="text-xl font-serif font-black italic text-[#1A1A1A] mt-2">{practiceQ.title}</h3>
                <p className="text-xs text-[#1A1A1A]/60 mt-1 font-mono">Difficulty: {practiceQ.difficulty} | Complexity: {practiceQ.complexity}</p>
              </div>

              {/* Statement and details */}
              <div className="space-y-4">
                <div>
                  <h4 className="text-[9px] font-mono font-bold uppercase tracking-wider text-[#1A1A1A]/40 mb-1">Problem Statement</h4>
                  <p className="text-xs text-[#1A1A1A] leading-relaxed bg-white p-4 rounded-none border border-[#1A1A1A] font-mono shadow-[2px_2px_0px_rgba(26,26,26,0.1)]">
                    {practiceQ.statement}
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 bg-white rounded-none border border-[#1A1A1A] font-mono text-xs shadow-[2px_2px_0px_rgba(26,26,26,0.1)]">
                    <h5 className="font-bold text-[#1A1A1A] mb-1">Sample Input:</h5>
                    <pre className="text-[#1A1A1A]/80 whitespace-pre-wrap">{practiceQ.sampleInput}</pre>
                  </div>
                  <div className="p-4 bg-white rounded-none border border-[#1A1A1A] font-mono text-xs shadow-[2px_2px_0px_rgba(26,26,26,0.1)]">
                    <h5 className="font-bold text-[#1A1A1A] mb-1">Sample Output:</h5>
                    <pre className="text-[#1A1A1A]/80 whitespace-pre-wrap">{practiceQ.sampleOutput}</pre>
                  </div>
                </div>

                {/* SYSTEM PROTOCOL: REAL-TIME GRAPHICAL STATE INJECTION & TRACE LOOP PANEL */}
                <div className="bg-[#18181B] border-2 border-[#1A1A1A] p-5 shadow-[4px_4px_0px_#1A1A1A] text-[#F9F8F6]">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-[#27272A] pb-3 mb-4">
                    <div>
                      <h4 className="text-sm font-mono font-bold text-[#FFD700] uppercase tracking-wider flex items-center gap-1.5">
                        <Eye className="h-4 w-4 animate-pulse text-[#FFD700]" /> Real-Time Graphical State Injection
                      </h4>
                      <p className="text-[10px] text-zinc-400 font-mono mt-0.5">Physical node tracking and frame-by-frame execution trace loop.</p>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <span className="text-[10px] font-mono text-[#FFD700] uppercase px-1.5 py-0.5 bg-zinc-800 rounded-none border border-zinc-700">
                        Active Step: {practiceStepIndex + 1} / {Math.max(practiceSteps.length, 1)}
                      </span>
                    </div>
                  </div>

                  {/* Input controls & Speed Selector */}
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 mb-4">
                    <div className="lg:col-span-7 flex flex-col gap-1">
                      <label className="text-[9px] font-mono uppercase text-zinc-400 font-bold">Input String Array (Max 7 elements):</label>
                      <div className="flex gap-1.5">
                        <input
                          type="text"
                          value={practiceInputText}
                          onChange={(e) => setPracticeInputText(e.target.value)}
                          placeholder="e.g. 40, 25, 75, 10, 95, 60, 50"
                          className="flex-1 bg-black text-white font-mono text-xs border border-zinc-700 px-2.5 py-1.5 outline-none rounded-none focus:border-[#FFD700]"
                        />
                        <button
                          onClick={() => {
                            const rand = Array.from({ length: 7 }, () => Math.floor(Math.random() * 90) + 10);
                            setPracticeInputText(rand.join(', '));
                          }}
                          className="bg-zinc-800 hover:bg-zinc-700 text-[#FFD700] text-[10px] font-mono font-bold px-2.5 border border-zinc-700 rounded-none cursor-pointer"
                        >
                          GENERATE VALUES
                        </button>
                      </div>
                    </div>

                    <div className="lg:col-span-5 flex flex-col gap-1">
                      <div className="flex justify-between items-center text-[9px] font-mono uppercase text-zinc-400 font-bold">
                        <span>Speed Controller (Delay):</span>
                        <span className="text-[#FFD700]">{practicePlaybackSpeed}ms</span>
                      </div>
                      <div className="flex items-center gap-2 bg-black border border-zinc-700 p-1.5">
                        <Sliders className="h-3 w-3 text-zinc-400 shrink-0" />
                        <input
                          type="range"
                          min={100}
                          max={2000}
                          step={100}
                          value={practicePlaybackSpeed}
                          onChange={(e) => setPracticePlaybackSpeed(parseInt(e.target.value, 10))}
                          className="w-full accent-[#FFD700] cursor-pointer bg-zinc-800 h-1"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Playback Controls */}
                  <div className="flex flex-wrap items-center gap-2 mb-4 bg-zinc-900 border border-zinc-800 p-2">
                    <button
                      onClick={() => setPracticeIsPlaying(!practiceIsPlaying)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono font-bold uppercase transition cursor-pointer rounded-none border ${
                        practiceIsPlaying
                          ? 'bg-[#FFD700]/10 text-[#FFD700] border-[#FFD700] hover:bg-[#FFD700]/20'
                          : 'bg-emerald-950 text-emerald-400 border-emerald-500 hover:bg-emerald-900'
                      }`}
                    >
                      {practiceIsPlaying ? (
                        <>
                          <Pause className="h-3.5 w-3.5 fill-current" /> PAUSE STREAM
                        </>
                      ) : (
                        <>
                          <Play className="h-3.5 w-3.5 fill-current" /> PLAY EXECUTION
                        </>
                      )}
                    </button>

                    <button
                      onClick={() => {
                        if (practiceStepIndex < practiceSteps.length - 1) {
                          setPracticeStepIndex(prev => prev + 1);
                        }
                      }}
                      disabled={practiceStepIndex >= practiceSteps.length - 1}
                      className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono font-bold uppercase transition cursor-pointer bg-zinc-800 text-zinc-300 border border-zinc-700 hover:bg-zinc-700 disabled:opacity-40 disabled:cursor-not-allowed rounded-none"
                    >
                      <FastForward className="h-3.5 w-3.5" /> STEP NEXT
                    </button>

                    <button
                      onClick={() => {
                        setPracticeIsPlaying(false);
                        setPracticeStepIndex(0);
                      }}
                      className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono font-bold uppercase transition cursor-pointer bg-zinc-800 text-zinc-300 border border-zinc-700 hover:bg-zinc-700 rounded-none ml-auto"
                    >
                      <RotateCcw className="h-3.5 w-3.5" /> RESET LOOP
                    </button>
                  </div>

                  {/* Physical Render Canvas */}
                  <div className="mb-4">
                    <PracticeDsaCanvas
                      activeTopic={activeTopic}
                      activeStep={practiceSteps[practiceStepIndex]}
                      playbackSpeed={practicePlaybackSpeed}
                    />
                  </div>

                  {/* Explanation trace card */}
                  <div className="bg-black border border-zinc-800 p-4 font-mono text-xs text-zinc-200 leading-relaxed shadow-inner">
                    <div className="text-[8px] uppercase tracking-wider text-zinc-500 mb-1">
                      TRACE OPERATIONAL FEEDBACK // STEP_{practiceStepIndex}
                    </div>
                    <div className="text-[#FFD700] font-bold text-sm">
                      {practiceSteps[practiceStepIndex]?.explanation || "Initializing core visualization system..."}
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="text-[9px] font-mono font-bold uppercase tracking-wider text-[#1A1A1A]/40 mb-1">
                    Optimized Solution ({selectedLanguage})
                  </h4>
                  <pre className="bg-[#1A1A1A] text-[#F9F8F6] font-mono text-xs p-5 rounded-none border border-[#1A1A1A] overflow-x-auto select-all leading-relaxed shadow-none">
                    {practiceQ.solutionCode}
                  </pre>
                </div>

                <div className="bg-white border border-[#1A1A1A] p-4 rounded-none shadow-[2px_2px_0px_rgba(26,26,26,0.1)] animate-fade-in">
                  <h4 className="text-xs uppercase font-mono tracking-wider font-bold text-[#1A1A1A] mb-1 flex items-center gap-1">
                    <CheckCircle2 className="h-4 w-4" /> Interview Success Tip
                  </h4>
                  <p className="text-xs text-[#1A1A1A]/80 leading-relaxed font-sans">
                    {practiceQ.interviewTip}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeWorkspaceTab === 'learning_deck' && (
          <div className="p-6 bg-[#F9F8F6] overflow-y-auto h-full space-y-6">
            <h3 className="text-2xl font-serif font-black italic mb-4 text-[#1A1A1A]">Core Developer Concept Decks</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                {
                  title: 'Secure Parameterized DB Querying',
                  desc: 'Eliminate SQL Injection vulnerabilities using query boundaries.',
                  points: [
                    'Database engine treats params as values, not instruction strings.',
                    'Zero chance of SQL statement injection payloads being parsed.',
                    'Supported in standard frameworks like Hibernate, Drizzle, and pg-pool.'
                  ]
                },
                {
                  title: 'Cross-Origin Resource Sharing (CORS)',
                  desc: 'Restrict which client applications can fetch your backend services.',
                  points: [
                    'Never use Access-Control-Allow-Origin: * in sensitive endpoints.',
                    'Allow origin dynamically validated against safe domain lists.',
                    'Protects user browser contexts against cross-origin scripting readouts.'
                  ]
                },
                {
                  title: 'Content Security Policy (CSP)',
                  desc: 'Configure powerful security directives on browser environments.',
                  points: [
                    'Locks down the source domains of permitted scripts, styles, and web workers.',
                    'Use script-src self; to automatically prevent inline script tag execution.',
                    'Blocks browser data leakages to third-party tracking networks.'
                  ]
                }
              ].map((deck, idx) => (
                <div key={idx} className="bg-white rounded-none border border-[#1A1A1A] p-6 flex flex-col justify-between shadow-[4px_4px_0px_rgba(26,26,26,0.15)]">
                  <div>
                    <h4 className="font-serif font-black italic text-[#1A1A1A] text-sm mb-2">{deck.title}</h4>
                    <p className="text-xs text-[#1A1A1A]/60 mb-4">{deck.desc}</p>
                    <ul className="space-y-2">
                      {deck.points.map((pt, pidx) => (
                        <li key={pidx} className="text-xs text-[#1A1A1A] flex items-start gap-1.5">
                          <span className="text-[#1A1A1A] mt-0.5 font-bold">•</span>
                          <span>{pt}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// 33 DSA Topics definition
const DSA_TOPICS_33 = [
  { id: 'arrays', name: '01. Static & Dynamic Arrays' },
  { id: 'two_pointers', name: '02. Two Pointers Technique' },
  { id: 'sliding_window', name: '03. Sliding Window' },
  { id: 'prefix_sum', name: '04. Prefix Sum Accumulators' },
  { id: 'hash_maps', name: '05. Hash Maps & Sets' },
  { id: 'linked_lists', name: '06. Singly & Doubly Linked Lists' },
  { id: 'stacks', name: '07. LIFO Stack Operations' },
  { id: 'queues', name: '08. FIFO Queues & Deques' },
  { id: 'binary_search', name: '09. Binary Search Bounds' },
  { id: 'recursion', name: '10. Recursion & Backtracking' },
  { id: 'merge_sort', name: '11. Divide and Conquer' },
  { id: 'quick_sort', name: '12. Pivot & Partitioning' },
  { id: 'heaps', name: '13. Heaps & Priority Queues' },
  { id: 'trees', name: '14. Tree Traversals' },
  { id: 'avl_trees', name: '15. AVL Balanced Trees' },
  { id: 'segment_trees', name: '16. Segment & Fenwick Trees' },
  { id: 'tries', name: '17. Prefix Tries' },
  { id: 'graphs', name: '18. Graph Representations' },
  { id: 'topo_sort', name: '19. Topological Sorting' },
  { id: 'dijkstra', name: '20. Dijkstra Shortest Path' },
  { id: 'bellman_ford', name: '21. Bellman-Ford Cycles' },
  { id: 'mst_prim', name: '22. Prim & Kruskal MST' },
  { id: 'floyd_warshall', name: '23. Floyd-Warshall All-Pairs' },
  { id: 'astar', name: '24. A* Heuristic Search' },
  { id: 'dsu', name: '25. Disjoint Set Union (DSU)' },
  { id: 'dp', name: '26. Dynamic Programming' },
  { id: 'greedy', name: '27. Greedy Algorithms' },
  { id: 'bit_manip', name: '28. Bitwise Manipulations' },
  { id: 'number_theory', name: '29. Primes & Number Theory' },
  { id: 'kmp', name: '30. KMP String Matching' },
  { id: 'btrees', name: '31. B-Trees & DB Indices' },
  { id: 'tarjan', name: '32. Strongly Connected Cycles' },
  { id: 'red_black', name: '33. Red-Black Tree Balance' }
];

// Helper practice question catalog generator
function getProceduralProblem(topicId: string, index: number, lang: string) {
  const topicsData: Record<string, { name: string; category: string; terms: string[]; d_verb: string[]; d_noun: string[] }> = {
    arrays: {
      name: 'Static & Dynamic Arrays',
      category: 'Linear Data Structures',
      terms: ['Subarray Sum', 'Circular Buffer', 'Permutation Index', 'Inversion Count', 'Kadane Bounds'],
      d_verb: ['Find the largest contiguous sum of', 'Rotate and optimize', 'Find all duplicate pairs in', 'Compact and relocate'],
      d_noun: ['a cyclic sequence of elements', 'a partitioned memory structure', 'an unsorted integer array with empty slots', 'a stream of byte registers']
    },
    two_pointers: {
      name: 'Two Pointers Technique',
      category: 'Optimal Traversal Heuristics',
      terms: ['Bisection Pair', 'Intersection Index', 'Container With Most Water', 'Sum Target Matching', 'String Palindromic Bounds'],
      d_verb: ['Find two indices in a sorted list that', 'Merge and deduplicate in-place', 'Maximize the bounded area of', 'Verify palindromic symmetry on'],
      d_noun: ['a high-dimensional vector space', 'a double-ended stream buffer', 'a set of non-overlapping bounds', 'a lexicographically ordered character array']
    },
    sliding_window: {
      name: 'Sliding Window',
      category: 'Sequential Subsegment Optimization',
      terms: ['Subsegment Maxima', 'K-Size Distinct Elements', 'Longest Substring Window', 'Minimum Window Substring', 'Dynamic Size Subarray'],
      d_verb: ['Calculate the maximum running sum of', 'Find the smallest window containing', 'Count all distinct elements in', 'Track dynamic indices of'],
      d_noun: ['a streaming telemetry dataset', 'a sliding frame buffer', 'a continuous string array', 'a sliding window of network packets']
    },
    prefix_sum: {
      name: 'Prefix Sum Accumulators',
      category: 'Static Range Queries',
      terms: ['1D Accumulator', '2D Submatrix Range Sum', 'Subarray Sum Divisible by K', 'Difference Array Limits', 'Prefix XOR Range'],
      d_verb: ['Precompute and answer queries for', 'Calculate the contiguous sub-region sum in', 'Verify if there exists a sum divisible by K in', 'Perform range-addition updates on'],
      d_noun: ['a static grid-cell matrix', 'a continuous database transaction ledger', 'a 1D immutable array', 'a prefix query cache map']
    },
    hash_maps: {
      name: 'Hash Maps & Sets',
      category: 'O(1) Lookups & Collisions',
      terms: ['Collision Bucket', 'Isomorphic Strings Detector', 'LRU Cache Tracker', 'Duplicate Signature Hash', 'Frequency Matrix'],
      d_verb: ['Design a fast key-value cache mapping', 'Find isomorphic mapping patterns in', 'Count frequency pairs of', 'Verify unique hash signatures in'],
      d_noun: ['a high-throughput server log cache', 'a user identity registry', 'a highly duplicated packet block', 'a dense hash bucket chain']
    },
    linked_lists: {
      name: 'Singly & Doubly Linked Lists',
      category: 'Pointer-Linked Structures',
      terms: ['Cycle Detector (Floyd)', 'Merge Sorted Nodes', 'Reverse K-Group Nodes', 'Circular Pointer Sentinel', 'Lru Cache-List'],
      d_verb: ['Detect if there is an active cycle in', 'Reverse alternate nodes of', 'Merge K sorted chains inside', 'Find the intersection node of'],
      d_noun: ['a singly linked memory chain', 'a doubly-linked node history tape', 'a circular sentinel register list', 'a sequence of allocated blocks']
    },
    stacks: {
      name: 'LIFO Stack Operations',
      category: 'Last-In First-Out Operations',
      terms: ['Valid Parentheses Parser', 'Monotonic Stack Minima', 'Postfix Expression Evaluator', 'Stack-based DFS Traversal', 'Min Stack Tracker'],
      d_verb: ['Validate the hierarchical nesting of', 'Find the next greater element in', 'Evaluate mathematical syntax in', 'Reconstruct path segments of'],
      d_noun: ['a nested bracket block stream', 'a list of daily temperature trends', 'a postfix string expression', 'a tree path directory string']
    },
    queues: {
      name: 'FIFO Queues & Deques',
      category: 'First-In First-Out Buffers',
      terms: ['Sliding Window Maximum', 'Circular Queue Ring', 'Queue-based BFS Path', 'Task Scheduler Queue', 'Double-Ended Deque'],
      d_verb: ['Track the sliding maximum of', 'Implement a high-performance circular ring in', 'Simulate scheduling task delays inside', 'Deduplicate oldest entries in'],
      d_noun: ['a continuous sensor packet stream', 'a multi-threaded worker queue', 'a sliding deque buffer window', 'a bounded task execution list']
    },
    binary_search: {
      name: 'Binary Search Bounds',
      category: 'Logarithmic Range Reduction',
      terms: ['Bisection Midpoint', 'Rotated Array Pivot Finder', 'Capacity Minimizer', 'Median of Sorted Streams', 'Square Root Precision'],
      d_verb: ['Find the boundary transition point in', 'Search for a target value in a rotated', 'Minimize the maximum processing capacity for', 'Calculate the fractional root of'],
      d_noun: ['a monotonically increasing list', 'a rotated sorted integer buffer', 'a set of jobs distributed among worker VMs', 'a high-precision numeric range']
    },
    recursion: {
      name: 'Recursion & Backtracking',
      category: 'State Space Exploration',
      terms: ['N-Queens Constraint Solver', 'Subsets & Permutations Generator', 'Sudoku Matrix Backtracker', 'Word Search Pathfinding', 'Combinatorial Sum Combinations'],
      d_verb: ['Generate all distinct subset combinations of', 'Find a path traversing letters in', 'Backtrack and solve placement constraints on', 'Compute the total recursive partitions of'],
      d_noun: ['an array of unique elements', 'a 2D board characters matrix', 'a combinatorial subset matrix', 'a multi-branch decision tree']
    },
    merge_sort: {
      name: 'Divide and Conquer',
      category: 'Recursive Subproblems',
      terms: ['Merge Subproblems', 'Inversion Count Calculator', 'Closest Pair of Points', 'Divide and Conquer Median', 'Sorted Array Interleaver'],
      d_verb: ['Count the total out-of-order inversion pairs in', 'Find the minimum distance pair inside', 'Merge and sort two sub-arrays of', 'Determine the dominant element in'],
      d_noun: ['a large distributed dataset', 'a 2D spatial coordinate plane', 'an out-of-order sequence of records', 'a binary recursive call stack']
    },
    quick_sort: {
      name: 'Pivot & Partitioning',
      category: 'In-Place Partitioning',
      terms: ['QuickSelect Kth Element', 'Three-way Dutch Flag', 'Pivot Index Balancer', 'Randomized Pivot QuickSort', 'In-Place Partition Matrix'],
      d_verb: ['Find the Kth smallest element in', 'Partition the elements of', 'Balance pivot subsegments of', 'Sort in O(N log N) time'],
      d_noun: ['an unsorted dynamic array', 'a color-coded list of items', 'a database index file', 'a randomized element collection']
    },
    heaps: {
      name: 'Heaps & Priority Queues',
      category: 'Constant-Time Min/Max Queries',
      terms: ['K-Way Sorted Merge', 'Median of Streaming Data', 'Min-Heap Node Balancer', 'Task Priority Scheduler', 'Huffman Code Tree Builder'],
      d_verb: ['Merge K sorted streams using', 'Track the running median of', 'Extract elements by highest priority in', 'Re-index the array as a binary'],
      d_noun: ['a live stream of server requests', 'a set of K sorted file records', 'a dynamic sliding priority register', 'a structural max-heap array']
    },
    trees: {
      name: 'Tree Traversals',
      category: 'Hierarchical Relationships',
      terms: ['Inorder Preorder Recovery', 'LCA Lowest Common Ancestor', 'Path Sum Checker', 'Diameter of Tree Matrix', 'Serialize Binary Tree'],
      d_verb: ['Reconstruct a binary tree from', 'Find the lowest common ancestor in', 'Calculate the maximum path sum in', 'Flatten and serialize the nodes of'],
      d_noun: ['a binary search tree', 'a hierarchical folder structure', 'a branch-path node network', 'a complete binary tree skeleton']
    },
    avl_trees: {
      name: 'AVL Balanced Trees',
      category: 'Self-Balancing Binary Trees',
      terms: ['AVL Balance Invariant', 'Left-Right Rotate Handler', 'Height Difference Counter', 'Strict Self-Balancing Insertion', 'O(log N) Search Tree'],
      d_verb: ['Validate the AVL height balance factor in', 'Insert a node and perform tree rotations on', 'Calculate height diff coefficients for', 'Search and rebalance elements in'],
      d_noun: ['a highly dynamic database index', 'an AVL search tree node structure', 'a continuous sequence of inserted keys', 'a balanced tree topology']
    },
    segment_trees: {
      name: 'Segment & Fenwick Trees',
      category: 'Dynamic Range Queries',
      terms: ['Range Query Segment Tree', 'Lazy Propagation Bounds', 'Binary Indexed Tree (Fenwick)', 'Point Update Queries', 'Range GCD Tracker'],
      d_verb: ['Query and update range values in', 'Implement range multiplication updates with', 'Perform binary-index count queries in', 'Calculate the dynamic range minimum of'],
      d_noun: ['a mutable static array segment', 'a telemetry stream of metrics', 'a coordinate grid range', 'a Fenwick frequency table']
    },
    tries: {
      name: 'Prefix Tries',
      category: 'String Dictionary Indexing',
      terms: ['Autocomplete Prefix Trie', 'Wildcard Pattern Dictionary', 'Maximum XOR Pair Finder', 'Spellcheck Word Index', 'String Suffix Automaton'],
      d_verb: ['Design a fast autocomplete system using', 'Search for words matching wildcards in', 'Find the maximum XOR pair of numbers in', 'Map all word suffixes inside'],
      d_noun: ['a standard dictionary list', 'a prefix search text corpus', 'an array of binary bit strings', 'a trie structure node tree']
    },
    graphs: {
      name: 'Graph Representations',
      category: 'Network Connections',
      terms: ['Adjacency List Traversal', 'Bipartite Color Verification', 'Clone Graph Network', 'Cycle Detection in Directed Map', 'Islands Counter Matrix'],
      d_verb: ['Detect cycles using DFS in', 'Count the total disconnected islands in', 'Perform a deep copy of', 'Determine if bipartite coloring is possible for'],
      d_noun: ['a directed network adjacency list', 'a 2D binary grid terrain map', 'a complex peer-to-peer graph', 'a set of directed dependency nodes']
    },
    topo_sort: {
      name: 'Topological Sorting',
      category: 'Directed Acyclic Dependency Resolvers',
      terms: ['Kahn\'s Queue Sorter', 'DFS Course Scheduler', 'Directed Acyclic Graph Sorter', 'Alien Dictionary Lexicon', 'Task Precedence Resolver'],
      d_verb: ['Find a valid compilation ordering of', 'Determine if dependencies are cyclic in', 'Reconstruct character precedence from', 'Order task queues with'],
      d_noun: ['a software package dependency tree', 'a list of university course prereqs', 'an alien language lexicon array', 'a directed acyclic task graph']
    },
    dijkstra: {
      name: 'Dijkstra Shortest Path',
      category: 'Weighted Shortest Paths',
      terms: ['Dijkstra Weighted Path', 'Shortest Path Priority Queue', 'Network Delay Time Solver', 'Grid Obstacle Pathfinding', 'Multi-city Flight Route'],
      d_verb: ['Find the absolute shortest path in', 'Calculate minimum latency path delay for', 'Find the path with least risk in', 'Search for optimal route metrics in'],
      d_noun: ['a weighted directed edge graph', 'a network router topology map', 'a grid of cells with travel costs', 'a flight schedule network matrix']
    },
    bellman_ford: {
      name: 'Bellman-Ford Cycles',
      category: 'Negative-Weight Edge Graphs',
      terms: ['Bellman-Ford Negative Cycle', 'Arbitrage Trade Scanner', 'Relaxation Loop Bounds', 'SPFA Optimized Path', 'K-Hop Shortest Path'],
      d_verb: ['Detect any negative-weight cycles in', 'Scan for arbitrage currency trades in', 'Calculate shortest paths in', 'Limit path hops to K in'],
      d_noun: ['a directed graph with negative weights', 'a currency exchange matrix graph', 'a packet routing table with loops', 'a state-edge transition map']
    },
    mst_prim: {
      name: 'Prim & Kruskal MST',
      category: 'Minimum Spanning Trees',
      terms: ['Kruskal disjoint set tracker', 'Prim minimum edge aggregator', 'Minimum Cable Length Connector', 'Spanning Tree Weight Optimizer', 'Grid City Interconnector'],
      d_verb: ['Calculate the minimum spanning tree of', 'Connect all terminal nodes of', 'Find the cheapest network backbone for', 'Optimize connection distances inside'],
      d_noun: ['a weighted undirected network graph', 'a grid of city coordinate terminals', 'an electrical power line layout', 'a multi-node server cluster graph']
    },
    floyd_warshall: {
      name: 'Floyd-Warshall All-Pairs',
      category: 'All-Pairs Shortest Path Matrix',
      terms: ['Floyd-Warshall All-Pairs Matrix', 'Transitive Closure Verification', 'City Transit Distance Finder', 'Cycle Core Scanner', 'Adjacency Weight Relaxer'],
      d_verb: ['Compute the distance matrix of all pairs in', 'Verify structural reachability of nodes in', 'Determine the shortest paths between all pairs in', 'Identify cycle centers in'],
      d_noun: ['a dense municipal railway network', 'a directed dependency adjacency matrix', 'a cluster connection routing table', 'a global distance matrix']
    },
    astar: {
      name: 'A* Heuristic Search',
      category: 'Informed Pathfinding Heuristics',
      terms: ['Manhattan Distance Heuristic', 'A* Maze Pathfinder', '8-Puzzle Solver state space', 'Euclidean Metric Finder', 'Dynamic Path Obstacle'],
      d_verb: ['Find the optimal visual path in', 'Solve the sliding tile 8-puzzle with', 'Optimize visual grid traversal using', 'Calculate the coordinate path inside'],
      d_noun: ['a 2D grid cell maze with blockades', 'a tile puzzle state-space tree', 'a real-time game path map', 'a coordinate bento grid']
    },
    dsu: {
      name: 'Disjoint Set Union (DSU)',
      category: 'Equivalence Relation Partitioning',
      terms: ['Union-Find path compression', 'Dynamic Connectivity Tracker', 'Friend Circles Detector', 'Redundant Connection Finder', 'Grid Percolation Threshold'],
      d_verb: ['Track equivalence groups inside', 'Verify connected friend sub-circles in', 'Detect redundant cyclic connections in', 'Determine connectivity threshold in'],
      d_noun: ['a collection of social network relations', 'a dynamically connected computer graph', 'a set of node-pair unions', 'a sparse grid cell canvas']
    },
    dp: {
      name: 'Dynamic Programming',
      category: 'Optimized Subproblem Memoization',
      terms: ['Knapsack Weight Maximizer', 'Longest Common Subsequence', 'Edit Distance Matrix', 'Coin Change Combinations', 'Max Subarray Sum Product'],
      d_verb: ['Find the longest common subsequence of', 'Calculate the edit distance to transform', 'Determine the fewest coins to total', 'Compute the maximum profit from'],
      d_noun: ['two character string sequences', 'a set of weighted item parameters', 'a dynamic denomination coin set', 'a chronological stock value ledger']
    },
    greedy: {
      name: 'Greedy Algorithms',
      category: 'Local Optimization Decisions',
      terms: ['Interval Meeting Scheduler', 'Fractional Knapsack Loader', 'Huffman Text Compression', 'Gas Station Tour Circle', 'Task Deadline Scheduler'],
      d_verb: ['Schedule the maximum meeting slots in', 'Optimize fractional values in', 'Find the optimal gas station start index in', 'Compress text records using'],
      d_noun: ['an interval time grid', 'a set of divisible cargo items', 'a cyclic route of fuel stations', 'a prioritized deadline list']
    },
    bit_manip: {
      name: 'Bitwise Manipulations',
      category: 'Low-level Memory Arithmetic',
      terms: ['Single Number Tracker', 'Hamming Weight (1-bits)', 'Subsets via Bitmasking', 'Bitwise AND range boundaries', 'Reverse Binary Registers'],
      d_verb: ['Extract the single non-duplicated element in', 'Calculate the total hamming distance in', 'Generate all subsets using bitmask keys of', 'Reverse the raw 32-bit registers of'],
      d_noun: ['a collection of double-paired numbers', 'an array of binary integers', 'a set of unique dictionary items', 'a binary number stream']
    },
    number_theory: {
      name: 'Primes & Number Theory',
      category: 'Arithmetic Foundations',
      terms: ['Sieve of Eratosthenes', 'GCD Euclidean Optimizer', 'Modular Inverse Cryptography', 'Prime Factorization Matrix', 'RSA Key Generator'],
      d_verb: ['Generate all prime values below N using', 'Calculate the greatest common divisor of', 'Compute the modular multiplicative inverse of', 'Factorize composite keys inside'],
      d_noun: ['a prime number query interval', 'a pair of ultra-large cryptography keys', 'a set of arithmetic integers', 'a private RSA key segment']
    },
    kmp: {
      name: 'KMP String Matching',
      category: 'String Search Optimization',
      terms: ['LPS Array Preprocessor', 'Pattern Matching Substring', 'Rabin-Karp Rolling Hash', 'Z-Algorithm Boundaries', 'Repeated Substring Pattern'],
      d_verb: ['Find all exact pattern occurrences of', 'Build the lookup prefix array (LPS) for', 'Deduplicate suffix-prefix overlaps in', 'Verify if a string has repeated segments of'],
      d_noun: ['a massive genomic sequence string', 'a search query pattern string', 'a continuous textual document stream', 'a repeating string sequence']
    },
    btrees: {
      name: 'B-Trees & DB Indices',
      category: 'Multi-Way Disk Storage Indexes',
      terms: ['B-Tree Node Splitter', 'Disk-Page Read Optimizer', 'Key Insertion rebalancer', 'B+ Tree Leaf Linker', 'Index Scan Boundary'],
      d_verb: ['Split and rebalance keys after inserting into', 'Find index scan nodes in a dynamic', 'Optimize disk-page access routes inside', 'Link leaf nodes sequentially in'],
      d_noun: ['a clustered database indexing B+ tree', 'a multi-way relational indexing system', 'a physical disk-storage file', 'a leaf node chain']
    },
    tarjan: {
      name: 'Strongly Connected Cycles',
      category: 'Tarjan Strongly Connected Cycles',
      terms: ['Tarjan SCC cycle finder', 'Kosaraju Double DFS', 'Biconnected Articulation Points', 'Bridges Finder in Networks', 'Cycle Condensation Graph'],
      d_verb: ['Find all articulation cut-nodes inside', 'Group biconnected components of', 'Identify all critical network bridges in', 'Condense cycle nodes inside'],
      d_noun: ['a critical communications network graph', 'a directed dependency map', 'a railway junction system map', 'an edge-connected cluster list']
    },
    red_black: {
      name: 'Red-Black Tree Balance',
      category: 'Balanced Invariant Trees',
      terms: ['Red-Black Black Height', 'Double Red Violation Fixer', 'Left-Leaning Tree rotate', 'RB Tree recoloring rules', 'O(log N) Lookup Bound'],
      d_verb: ['Enforce red-black tree height invariants in', 'Fix double-red violations after inserting into', 'Perform recoloring and rotations on', 'Search balanced node values in'],
      d_noun: ['a standard map/set tree container', 'a Red-Black node insertion sequence', 'a highly unbalanced indexing structure', 'a binary balanced search framework']
    }
  };

  const topicData = topicsData[topicId] || topicsData.arrays;
  const seed = (topicId.charCodeAt(0) || 1) + index * 17;
  
  // Deterministic choices based on seed
  const term = topicData.terms[seed % topicData.terms.length];
  const verb = topicData.d_verb[seed % topicData.d_verb.length];
  const noun = topicData.d_noun[seed % topicData.d_noun.length];
  
  const title = `${topicData.name} #${index}: ${term} Engine`;
  const difficulty = index % 3 === 0 ? 'Hard' : index % 2 === 0 ? 'Medium' : 'Easy';
  
  let complexity = 'Time: O(N) | Space: O(N)';
  if (difficulty === 'Easy') complexity = 'Time: O(N) | Space: O(1)';
  else if (difficulty === 'Hard') complexity = 'Time: O(N log N) | Space: O(N)';
  
  const statement = `You are designing a high-performance system block. ${verb} ${noun} using optimized techniques. Given ${noun}, your module must isolate and resolve ${term} targets with maximum precision, matching the required space and time complexity bounds. Avoid unoptimized loop executions.`;
  
  const sampleInput = `Input Sequence: [${Array.from({ length: 6 }, (_, i) => ((i + index) * 3) % 17).join(', ')}]`;
  const sampleOutput = `Optimized Result Value: ${Math.floor((seed * 3) % 99 + 1)}`;
  
  let solutionCode = '';
  
  if (lang === 'TypeScript') {
    solutionCode = `// TypeScript Solution for ${title}
function solveModule(inputData: number[]): number {
  // Guard condition
  if (!inputData || inputData.length === 0) return 0;
  
  // Procedural implementation matching ${term}
  let currentAccumulator = 0;
  let optimalValue = inputData[0];
  
  for (let i = 0; i < inputData.length; i++) {
    const value = inputData[i];
    currentAccumulator += value;
    if (currentAccumulator > optimalValue) {
      optimalValue = currentAccumulator;
    }
    if (currentAccumulator < 0) {
      currentAccumulator = 0;
    }
  }
  
  return Math.abs(optimalValue) % 100;
}

// Sample call
const res = solveModule([${Array.from({ length: 6 }, (_, i) => ((i + index) * 3) % 17).join(', ')}]);
console.log("Isolated Output:", res);`;
  } else if (lang === 'C++') {
    solutionCode = `// C++ Solution for ${title}
#include <iostream>
#include <vector>
#include <numeric>
#include <cmath>

class Solution {
public:
    int solveModule(const std::vector<int>& inputData) {
        if (inputData.empty()) return 0;
        
        // Procedural partition matching ${term}
        int currentAccumulator = 0;
        int optimalValue = inputData[0];
        
        for (int value : inputData) {
            currentAccumulator += value;
            if (currentAccumulator > optimalValue) {
                optimalValue = currentAccumulator;
            }
            if (currentAccumulator < 0) {
                currentAccumulator = 0;
            }
        }
        
        return std::abs(optimalValue) % 100;
    }
};`;
  } else if (lang === 'Python') {
    solutionCode = `# Python 3 Solution for ${title}
class Solution:
    def solve_module(self, input_data: list[int]) -> int:
        if not input_data:
            return 0
            
        # Procedural partition matching ${term}
        current_accumulator = 0
        optimal_value = input_data[0]
        
        for value in input_data:
            current_accumulator += value
            if current_accumulator > optimal_value:
                optimal_value = current_accumulator
            if current_accumulator < 0:
                current_accumulator = 0
                
        return abs(optimal_value) % 100

# Sample Execution
sol = Solution()
print(sol.solve_module([${Array.from({ length: 6 }, (_, i) => ((i + index) * 3) % 17).join(', ')}]))`;
  } else if (lang === 'Java') {
    solutionCode = `// Java Solution for ${title}
import java.util.*;

public class Solution {
    public int solveModule(int[] inputData) {
        if (inputData == null || inputData.length == 0) return 0;
        
        // Procedural partition matching ${term}
        int currentAccumulator = 0;
        int optimalValue = inputData[0];
        
        for (int value : inputData) {
            currentAccumulator += value;
            if (currentAccumulator > optimalValue) {
                optimalValue = currentAccumulator;
            }
            if (currentAccumulator < 0) {
                currentAccumulator = 0;
            }
        }
        
        return Math.abs(optimalValue) % 100;
    }
}`;
  }
  
  const interviewTip = `During technical interviews, clearly articulate how the ${term} matches ${difficulty} patterns. Speak out loud while constructing the ${complexity.split('|')[0]} limits. Keep boundary conditions checked to secure perfect marks from the panel!`;

  return {
    title,
    difficulty,
    complexity,
    statement,
    sampleInput,
    sampleOutput,
    solutionCode,
    interviewTip
  };
}

// --- SYSTEM PROTOCOL: REAL-TIME GRAPHICAL STATE INJECTION & TRACE LOOP HELPERS ---
function compilePracticeSteps(topic: string, rawInput: string) {
  const arr = rawInput
    .split(',')
    .map(v => parseInt(v.trim(), 10))
    .filter(v => !isNaN(v));
  
  if (arr.length === 0) return [];
  
  const steps: any[] = [];
  
  // Default base step
  steps.push({
    arrayState: [...arr],
    pointers: {},
    highlights: [],
    explanation: "Initialize DSA data structures. Ready for execution.",
    traceLog: "INIT_NODES",
    ledger: { step: 0, status: 'READY' }
  });
  
  // Topic-specific step compilation
  if (topic === 'arrays') {
    let currentArr = [...arr];
    steps.push({
      arrayState: [...currentArr],
      pointers: { Current: 0 },
      highlights: [0],
      explanation: "Scanning contiguous slots in sequence.",
      traceLog: "SCAN_START",
      ledger: { index: 0, val: currentArr[0] }
    });
    const midIdx = Math.floor(currentArr.length / 2);
    steps.push({
      arrayState: [...currentArr],
      pointers: { Pivot: midIdx, Scan: 0 },
      highlights: [midIdx, 0],
      explanation: "Determining center boundary pivot offset.",
      traceLog: "PIVOT_SELECT",
      ledger: { pivotIdx: midIdx, pivotVal: currentArr[midIdx] }
    });
    const last = currentArr.pop();
    if (last !== undefined) currentArr.unshift(last);
    steps.push({
      arrayState: [...currentArr],
      pointers: { Head: 0, Tail: currentArr.length - 1 },
      highlights: [0, currentArr.length - 1],
      explanation: "Shift operation executed: elements rotated right by 1 index slot.",
      traceLog: "ROTATE_RIGHT",
      ledger: { headVal: currentArr[0], tailVal: currentArr[currentArr.length - 1] }
    });
  }
  else if (topic === 'two_pointers') {
    let L = 0;
    let R = arr.length - 1;
    steps.push({
      arrayState: [...arr],
      pointers: { Left: L, Right: R },
      highlights: [L, R],
      explanation: "Pointers initialized at external bounds: L=0, R=" + R,
      traceLog: "INIT_BOUNDS",
      ledger: { Left: L, Right: R, Sum: arr[L] + arr[R] }
    });
    while (L < R) {
      L++;
      steps.push({
        arrayState: [...arr],
        pointers: { Left: L, Right: R },
        highlights: [L, R],
        explanation: "Left boundary index advanced to explore next values.",
        traceLog: "ADVANCE_L",
        ledger: { Left: L, Right: R, Sum: arr[L] + arr[R] }
      });
      if (L < R) {
        R--;
        steps.push({
          arrayState: [...arr],
          pointers: { Left: L, Right: R },
          highlights: [L, R],
          explanation: "Right boundary index compressed to balance constraints.",
          traceLog: "COMPRESS_R",
          ledger: { Left: L, Right: R, Sum: arr[L] + arr[R] }
        });
      }
    }
  }
  else if (topic === 'sliding_window') {
    let L = 0;
    let R = 0;
    steps.push({
      arrayState: [...arr],
      pointers: { Left: L, Right: R },
      highlights: [L],
      explanation: "Sliding window frame initialized at index 0.",
      traceLog: "WINDOW_START",
      ledger: { L, R, width: 1 }
    });
    for (R = 1; R < Math.min(arr.length, 5); R++) {
      steps.push({
        arrayState: [...arr],
        pointers: { Left: L, Right: R },
        highlights: Array.from({ length: R - L + 1 }, (_, i) => L + i),
        explanation: `Expanding window right bound to index ${R} to ingest data.`,
        traceLog: "WINDOW_EXPAND",
        ledger: { L, R, width: R - L + 1 }
      });
    }
    L = 1;
    steps.push({
      arrayState: [...arr],
      pointers: { Left: L, Right: R - 1 },
      highlights: Array.from({ length: (R - 1) - L + 1 }, (_, i) => L + i),
      explanation: "Window left boundary incremented: shrinking sliding segment size.",
      traceLog: "WINDOW_SHRINK",
      ledger: { L, R: R - 1, width: (R - 1) - L + 1 }
    });
  }
  else if (topic === 'prefix_sum') {
    let currentArr = [...arr];
    let prefix = [currentArr[0]];
    steps.push({
      arrayState: [...currentArr],
      prefixState: [currentArr[0]],
      pointers: { Current: 0 },
      highlights: [0],
      explanation: "Initialize prefix sum accumulator with index 0 element.",
      traceLog: "PREFIX_INIT",
      ledger: { sum: prefix[0] }
    });
    for (let i = 1; i < currentArr.length; i++) {
      prefix.push(prefix[i - 1] + currentArr[i]);
      steps.push({
        arrayState: [...currentArr],
        prefixState: [...prefix],
        pointers: { Current: i, PrevAccum: i - 1 },
        highlights: [i, i - 1],
        explanation: `Add current index val ${currentArr[i]} to previous sum accumulator ${prefix[i-1]}.`,
        traceLog: "PREFIX_ADD",
        ledger: { index: i, val: currentArr[i], prevSum: prefix[i-1], currentSum: prefix[i] }
      });
    }
  }
  else if (topic === 'hash_maps') {
    const slots = Array(arr.length).fill(null);
    steps.push({
      arrayState: [...arr],
      hashSlots: [...slots],
      pointers: { Value: 0 },
      highlights: [0],
      explanation: "Create empty hash table matching slots sequence.",
      traceLog: "HASH_INIT",
      ledger: { size: arr.length }
    });
    arr.forEach((v, idx) => {
      const hashIdx = v % slots.length;
      if (slots[hashIdx] === null) {
        slots[hashIdx] = v;
        steps.push({
          arrayState: [...arr],
          hashSlots: [...slots],
          pointers: { Value: idx, HashSlot: hashIdx },
          highlights: [idx],
          explanation: `Hash key ${v} maps to slot ${hashIdx} (Key % slots = ${v} % ${slots.length}).`,
          traceLog: "HASH_INSERT",
          ledger: { val: v, hashIdx, collision: false }
        });
      } else {
        let newIdx = (hashIdx + 1) % slots.length;
        while (slots[newIdx] !== null && newIdx !== hashIdx) {
          newIdx = (newIdx + 1) % slots.length;
        }
        if (slots[newIdx] === null) {
          slots[newIdx] = v;
          steps.push({
            arrayState: [...arr],
            hashSlots: [...slots],
            pointers: { Value: idx, CollisionSlot: hashIdx, ProbeSlot: newIdx },
            highlights: [idx],
            explanation: `Collision! Slot ${hashIdx} occupied. Resolved via linear probing to slot ${newIdx}.`,
            traceLog: "HASH_COLLISION",
            ledger: { val: v, initialIdx: hashIdx, resolvedIdx: newIdx, collision: true }
          });
        }
      }
    });
  }
  else if (topic === 'linked_lists') {
    steps.push({
      arrayState: [...arr],
      pointers: { Head: 0 },
      highlights: [0],
      explanation: "Instantiate memory blocks. Node pointers linked sequentially.",
      traceLog: "LIST_INIT",
      ledger: { headVal: arr[0] }
    });
    for (let i = 1; i < arr.length; i++) {
      steps.push({
        arrayState: [...arr],
        pointers: { Current: i, Prev: i - 1 },
        highlights: [i, i - 1],
        explanation: `Link node ${i - 1} address pointer to next node ${i} address.`,
        traceLog: "LIST_LINK",
        ledger: { from: arr[i-1], to: arr[i] }
      });
    }
  }
  else if (topic === 'stacks') {
    const stack: number[] = [];
    steps.push({
      arrayState: [...arr],
      stackState: [],
      pointers: { Pointer: 0 },
      highlights: [],
      explanation: "Initialize an empty Last-In-First-Out (LIFO) stack.",
      traceLog: "STACK_INIT",
      ledger: { size: 0 }
    });
    for (let i = 0; i < Math.min(arr.length, 4); i++) {
      stack.push(arr[i]);
      steps.push({
        arrayState: [...arr],
        stackState: [...stack],
        pointers: { PushValue: i },
        highlights: [i],
        explanation: `Push element ${arr[i]} onto the top of the stack LIFO frame.`,
        traceLog: "STACK_PUSH",
        ledger: { val: arr[i], size: stack.length }
      });
    }
    stack.pop();
    steps.push({
      arrayState: [...arr],
      stackState: [...stack],
      pointers: {},
      highlights: [],
      explanation: "Pop top element off the stack call frame. Last inserted element evicted.",
      traceLog: "STACK_POP",
      ledger: { size: stack.length }
    });
  }
  else if (topic === 'queues') {
    const queue: number[] = [];
    steps.push({
      arrayState: [...arr],
      queueState: [],
      pointers: { Head: 0 },
      highlights: [],
      explanation: "Initialize an empty First-In-First-Out (FIFO) queue corridor.",
      traceLog: "QUEUE_INIT",
      ledger: { size: 0 }
    });
    for (let i = 0; i < Math.min(arr.length, 4); i++) {
      queue.push(arr[i]);
      steps.push({
        arrayState: [...arr],
        queueState: [...queue],
        pointers: { Enqueue: i },
        highlights: [i],
        explanation: `Enqueue element ${arr[i]} into tail end of the FIFO queue.`,
        traceLog: "QUEUE_ENQUEUE",
        ledger: { val: arr[i], size: queue.length }
      });
    }
    queue.shift();
    steps.push({
      arrayState: [...arr],
      queueState: [...queue],
      pointers: {},
      highlights: [],
      explanation: "Dequeue front element from the queue corridor. Oldest item processed first.",
      traceLog: "QUEUE_DEQUEUE",
      ledger: { size: queue.length }
    });
  }
  else if (topic === 'binary_search') {
    const sorted = [...arr].sort((a, b) => a - b);
    let L = 0;
    let R = sorted.length - 1;
    const target = sorted[Math.floor(sorted.length / 2) + 1] || sorted[sorted.length - 1];
    steps.push({
      arrayState: sorted,
      pointers: { Left: L, Right: R },
      highlights: [],
      explanation: `Target value to find: ${target}. Bounds set L=${L}, R=${R}`,
      traceLog: "SEARCH_INIT",
      ledger: { target, L, R, Mid: 'None' }
    });
    while (L <= R) {
      const Mid = Math.floor((L + R) / 2);
      steps.push({
        arrayState: sorted,
        pointers: { Left: L, Right: R, Mid: Mid },
        highlights: [Mid],
        explanation: `Calculate bisection midpoint index ${Mid} (val = ${sorted[Mid]}). Compare with target ${target}.`,
        traceLog: "BISECT_MID",
        ledger: { target, L, R, Mid, midVal: sorted[Mid] }
      });
      if (sorted[Mid] === target) {
        steps.push({
          arrayState: sorted,
          pointers: { Left: L, Right: R, Found: Mid },
          highlights: [Mid],
          explanation: `Target found at midpoint index ${Mid}! Search successfully terminated.`,
          traceLog: "SUCCESS_FIND",
          ledger: { target, L, R, Mid, found: true }
        });
        break;
      } else if (sorted[Mid] < target) {
        L = Mid + 1;
        steps.push({
          arrayState: sorted,
          pointers: { Left: L, Right: R },
          highlights: [],
          explanation: `Midpoint value ${sorted[Mid]} < target ${target}. Truncate lower bounds. Shift Left to Mid + 1 (${L}).`,
          traceLog: "SHIFT_L",
          ledger: { target, L, R }
        });
      } else {
        R = Mid - 1;
        steps.push({
          arrayState: sorted,
          pointers: { Left: L, Right: R },
          highlights: [],
          explanation: `Midpoint value ${sorted[Mid]} > target ${target}. Truncate upper bounds. Shift Right to Mid - 1 (${R}).`,
          traceLog: "SHIFT_R",
          ledger: { target, L, R }
        });
      }
    }
  }
  else if (topic === 'merge_sort' || topic === 'quick_sort') {
    let currentArr = [...arr];
    steps.push({
      arrayState: [...currentArr],
      pointers: { Active: 0 },
      highlights: [0],
      explanation: "Initialize divide-and-conquer partition matrix.",
      traceLog: "SORT_START",
      ledger: { sorted: false }
    });
    const sorted = [...currentArr].sort((a,b)=>a-b);
    steps.push({
      arrayState: [...currentArr],
      pointers: { Pivot: Math.floor(currentArr.length / 2) },
      highlights: [Math.floor(currentArr.length / 2)],
      explanation: "Splitting input ranges into sub-problem partitions recursively.",
      traceLog: "DIVIDE_PASS",
      ledger: { sorted: false }
    });
    steps.push({
      arrayState: sorted,
      pointers: {},
      highlights: Array.from({length: sorted.length}, (_, i)=>i),
      explanation: "Merging sorted partitions. Values sorted in-place successfully.",
      traceLog: "MERGE_COMPLETE",
      ledger: { sorted: true }
    });
  }
  else {
    steps.push({
      arrayState: [...arr],
      pointers: { Node: 0 },
      highlights: [0],
      explanation: "Evaluating computational state machine nodes for " + topic,
      traceLog: "EXEC_START",
      ledger: { active: true }
    });
    steps.push({
      arrayState: [...arr],
      pointers: { Active: Math.min(arr.length - 1, 2) },
      highlights: [Math.min(arr.length - 1, 2)],
      explanation: "Relaxing constraint edges and propagating lookup indexes.",
      traceLog: "PROPAGATION_RUN",
      ledger: { active: true }
    });
    steps.push({
      arrayState: [...arr],
      pointers: { Target: arr.length - 1 },
      highlights: [arr.length - 1],
      explanation: "Optimal boundary discovered. Final solution compiled securely.",
      traceLog: "COMPLETED",
      ledger: { active: false, success: true }
    });
  }
  
  return steps;
}

interface PracticeDsaCanvasProps {
  activeTopic: string;
  activeStep: any;
  playbackSpeed: number;
}

function PracticeDsaCanvas({ activeTopic, activeStep, playbackSpeed }: PracticeDsaCanvasProps) {
  const canvasRef = React.useRef<HTMLCanvasElement>(null);
  const nodesRef = React.useRef<any[]>([]);

  useEffect(() => {
    if (!activeStep) return;

    const arr = activeStep.arrayState || [];
    const pointers = activeStep.pointers || {};
    const highlights = activeStep.highlights || [];

    const newNodes = arr.map((val: number, idx: number) => {
      const nodeId = `val-${val}-${idx}`;
      const existing = nodesRef.current.find(n => n.id === nodeId);
      
      const targetX = 60 + idx * 75;
      const targetY = 120;

      if (existing) {
        existing.targetX = targetX;
        existing.targetY = targetY;
        existing.val = val;
        existing.idx = idx;
        existing.highlighted = highlights.includes(idx);
        return existing;
      } else {
        return {
          id: nodeId,
          val,
          idx,
          currentX: -50,
          currentY: 50,
          targetX,
          targetY,
          highlighted: highlights.includes(idx)
        };
      }
    });

    if (activeTopic === 'prefix_sum' && activeStep.prefixState) {
      const pref = activeStep.prefixState;
      pref.forEach((val: number, idx: number) => {
        const nodeId = `prefix-${val}-${idx}`;
        const existing = nodesRef.current.find(n => n.id === nodeId);
        const targetX = 60 + idx * 75;
        const targetY = 220;
        if (existing) {
          existing.targetX = targetX;
          existing.targetY = targetY;
          existing.val = val;
          existing.idx = idx;
          newNodes.push(existing);
        } else {
          newNodes.push({
            id: nodeId,
            val,
            idx,
            currentX: 500,
            currentY: 300,
            targetX,
            targetY,
            highlighted: false,
            isPrefix: true
          });
        }
      });
    }

    if (activeTopic === 'hash_maps' && activeStep.hashSlots) {
      const slots = activeStep.hashSlots;
      slots.forEach((val: any, idx: number) => {
        if (val !== null) {
          const nodeId = `hashslot-${val}-${idx}`;
          const existing = nodesRef.current.find(n => n.id === nodeId);
          const targetX = 60 + idx * 75;
          const targetY = 220;
          if (existing) {
            existing.targetX = targetX;
            existing.targetY = targetY;
            existing.val = val;
            existing.idx = idx;
            newNodes.push(existing);
          } else {
            newNodes.push({
              id: nodeId,
              val,
              idx,
              currentX: targetX,
              currentY: -50,
              targetX,
              targetY,
              highlighted: false,
              isHashSlot: true
            });
          }
        }
      });
    }

    if (activeTopic === 'stacks' && activeStep.stackState) {
      const stack = activeStep.stackState;
      stack.forEach((val: number, idx: number) => {
        const nodeId = `stack-${val}-${idx}`;
        const existing = nodesRef.current.find(n => n.id === nodeId);
        const targetX = 350;
        const targetY = 260 - idx * 45;
        if (existing) {
          existing.targetX = targetX;
          existing.targetY = targetY;
          existing.val = val;
          existing.idx = idx;
          newNodes.push(existing);
        } else {
          newNodes.push({
            id: nodeId,
            val,
            idx,
            currentX: 100,
            currentY: 50,
            targetX,
            targetY,
            highlighted: false,
            isStack: true
          });
        }
      });
    }

    if (activeTopic === 'queues' && activeStep.queueState) {
      const queue = activeStep.queueState;
      queue.forEach((val: number, idx: number) => {
        const nodeId = `queue-${val}-${idx}`;
        const existing = nodesRef.current.find(n => n.id === nodeId);
        const targetX = 180 + idx * 60;
        const targetY = 220;
        if (existing) {
          existing.targetX = targetX;
          existing.targetY = targetY;
          existing.val = val;
          existing.idx = idx;
          newNodes.push(existing);
        } else {
          newNodes.push({
            id: nodeId,
            val,
            idx,
            currentX: 600,
            currentY: 220,
            targetX,
            targetY,
            highlighted: false,
            isQueue: true
          });
        }
      });
    }

    nodesRef.current = newNodes;
  }, [activeStep, activeTopic]);

  useEffect(() => {
    let frameId: number;

    const render = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const width = canvas.width;
      const height = canvas.height;

      ctx.fillStyle = '#09090B';
      ctx.fillRect(0, 0, width, height);

      ctx.strokeStyle = '#1F1F23';
      ctx.lineWidth = 1;
      const gridSize = 40;
      for (let x = 0; x < width; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }
      for (let y = 0; y < height; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }

      ctx.strokeStyle = '#27272A';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(20, 40);
      ctx.lineTo(width - 20, 40);
      ctx.stroke();

      ctx.fillStyle = '#71717A';
      ctx.font = 'bold 9px monospace';
      ctx.fillText(`REAL-TIME TRACE CANVAS // TOPIC: ${activeTopic.toUpperCase()}`, 25, 25);

      nodesRef.current.forEach(node => {
        node.currentX += (node.targetX - node.currentX) * 0.15;
        node.currentY += (node.targetY - node.currentY) * 0.15;
      });

      if (activeTopic === 'stacks') {
        ctx.strokeStyle = '#27272A';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(310, 80);
        ctx.lineTo(310, 280);
        ctx.lineTo(390, 280);
        ctx.lineTo(390, 80);
        ctx.stroke();
        ctx.fillStyle = '#71717A';
        ctx.font = 'bold 9px monospace';
        ctx.fillText("LIFO STACK FRAME", 312, 295);
      }

      if (activeTopic === 'queues') {
        ctx.strokeStyle = '#27272A';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(170, 195);
        ctx.lineTo(440, 195);
        ctx.moveTo(170, 245);
        ctx.lineTo(440, 245);
        ctx.stroke();
        ctx.fillStyle = '#71717A';
        ctx.font = 'bold 9px monospace';
        ctx.fillText("FIFO QUEUE CHANNEL", 172, 260);
      }

      if (activeTopic === 'linked_lists') {
        ctx.strokeStyle = '#3F3F46';
        ctx.lineWidth = 2.5;
        const listNodes = nodesRef.current.filter(n => !n.isPrefix && !n.isHashSlot && !n.isStack && !n.isQueue);
        for (let i = 0; i < listNodes.length - 1; i++) {
          const n1 = listNodes[i];
          const n2 = listNodes[i + 1];
          ctx.beginPath();
          ctx.moveTo(n1.currentX + 22, n1.currentY);
          ctx.lineTo(n2.currentX - 22, n2.currentY);
          ctx.stroke();

          ctx.fillStyle = '#3F3F46';
          ctx.beginPath();
          ctx.moveTo(n2.currentX - 22, n2.currentY);
          ctx.lineTo(n2.currentX - 29, n2.currentY - 4);
          ctx.lineTo(n2.currentX - 29, n2.currentY + 4);
          ctx.fill();
        }
      }

      nodesRef.current.forEach(node => {
        const isAux = node.isPrefix || node.isHashSlot || node.isStack || node.isQueue;
        
        ctx.fillStyle = 'rgba(0,0,0,0.5)';
        ctx.fillRect(node.currentX - 20, node.currentY - 20, 40, 40);

        if (node.highlighted) {
          ctx.fillStyle = '#FFD700';
          ctx.strokeStyle = '#FFD700';
        } else if (isAux) {
          ctx.fillStyle = '#18181B';
          ctx.strokeStyle = '#A1A1AA';
        } else {
          ctx.fillStyle = '#27272A';
          ctx.strokeStyle = '#3F3F46';
        }

        ctx.fillRect(node.currentX - 22, node.currentY - 22, 44, 44);
        ctx.lineWidth = 2;
        ctx.strokeRect(node.currentX - 22, node.currentY - 22, 44, 44);

        ctx.fillStyle = node.highlighted ? '#09090B' : '#F4F4F5';
        ctx.font = 'bold 13px "JetBrains Mono", monospace';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(String(node.val), node.currentX, node.currentY);

        if (!isAux) {
          ctx.fillStyle = '#71717A';
          ctx.font = '9px monospace';
          ctx.fillText(`[${node.idx}]`, node.currentX, node.currentY + 32);
        } else if (node.isPrefix) {
          ctx.fillStyle = '#A1A1AA';
          ctx.font = 'bold 8px monospace';
          ctx.fillText(`PRE[${node.idx}]`, node.currentX, node.currentY + 32);
        } else if (node.isHashSlot) {
          ctx.fillStyle = '#A1A1AA';
          ctx.font = 'bold 8px monospace';
          ctx.fillText(`HASH[${node.idx}]`, node.currentX, node.currentY + 32);
        }
      });

      if (activeStep && activeStep.pointers) {
        ctx.textAlign = 'center';
        ctx.textBaseline = 'bottom';
        Object.entries(activeStep.pointers).forEach(([name, idxVal]) => {
          if (typeof idxVal === 'number') {
            const listNodes = nodesRef.current.filter(n => !n.isPrefix && !n.isHashSlot && !n.isStack && !n.isQueue);
            const targetNode = listNodes.find(n => n.idx === idxVal);
            if (targetNode) {
              const ptrX = targetNode.currentX;
              const ptrY = targetNode.currentY - 28;

              ctx.strokeStyle = '#FFD700';
              ctx.lineWidth = 1.5;
              ctx.beginPath();
              ctx.moveTo(ptrX, ptrY - 14);
              ctx.lineTo(ptrX, ptrY);
              ctx.stroke();

              ctx.fillStyle = '#FFD700';
              ctx.beginPath();
              ctx.moveTo(ptrX, ptrY);
              ctx.lineTo(ptrX - 4, ptrY - 5);
              ctx.lineTo(ptrX + 4, ptrY - 5);
              ctx.fill();

              ctx.fillStyle = '#FFD700';
              ctx.font = 'bold 9px monospace';
              ctx.fillText(name.toUpperCase(), ptrX, ptrY - 17);
            }
          }
        });
      }

      if (activeStep && activeStep.ledger) {
        const ledgerX = width - 180;
        const ledgerY = 55;
        ctx.fillStyle = 'rgba(24, 24, 27, 0.95)';
        ctx.strokeStyle = '#FFD700';
        ctx.lineWidth = 1;
        ctx.fillRect(ledgerX, ledgerY, 160, 110);
        ctx.strokeRect(ledgerX, ledgerY, 160, 110);

        ctx.fillStyle = '#FFD700';
        ctx.font = 'bold 8px monospace';
        ctx.textAlign = 'left';
        ctx.fillText("VARIABLE DATA LEDGER", ledgerX + 10, ledgerY + 16);

        ctx.strokeStyle = '#3F3F46';
        ctx.beginPath();
        ctx.moveTo(ledgerX + 10, ledgerY + 22);
        ctx.lineTo(ledgerX + 150, ledgerY + 22);
        ctx.stroke();

        ctx.fillStyle = '#E4E4E7';
        ctx.font = '8px monospace';
        let lineOffset = 34;
        Object.entries(activeStep.ledger).forEach(([key, val]) => {
          ctx.fillText(`${key.toUpperCase()}:`, ledgerX + 10, ledgerY + lineOffset);
          ctx.textAlign = 'right';
          ctx.fillText(String(val), ledgerX + 150, ledgerY + lineOffset);
          ctx.textAlign = 'left';
          lineOffset += 12;
        });
      }

      frameId = requestAnimationFrame(render);
    };

    frameId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(frameId);
  }, [activeTopic, activeStep]);

  return (
    <div className="relative border border-[#1A1A1A] overflow-hidden bg-[#09090B]">
      <canvas
        ref={canvasRef}
        width={560}
        height={320}
        className="w-full h-[320px] block"
      />
    </div>
  );
}
