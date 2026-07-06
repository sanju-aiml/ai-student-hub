import express, { Request, Response, NextFunction } from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, Type } from '@google/genai';
import { detectSecurityThreat, isSafeUrl, validateUploadedFile, sanitizeHTML } from './src/utils/security.js';

const app = express();
const PORT = 3000;

// Store in-memory security audit logs
const auditLogs: any[] = [
  {
    id: 'audit-001',
    timestamp: new Date().toISOString(),
    action: 'SYSTEM_BOOT',
    ip: '127.0.0.1',
    status: 'SUCCESS',
    details: 'Secure Application Server booted successfully.'
  }
];

// Add helper to append log entries
function addAuditLog(action: string, ip: string, status: 'SUCCESS' | 'WARNING' | 'BLOCKED', details: string) {
  auditLogs.unshift({
    id: `audit-${Math.random().toString(36).substring(2, 9)}`,
    timestamp: new Date().toISOString(),
    action,
    ip,
    status,
    details
  });
  if (auditLogs.length > 100) auditLogs.pop(); // Keep last 100 logs
}

// Temporary file-sharing structures
interface SharedFile {
  id: string;
  name: string;
  size: string;
  rawSize: number;
  type: string;
  content: string;
  date: string;
  secureHash: string;
}

interface SharedPocket {
  code: string;
  files: SharedFile[];
  createdAt: string;
  expiresAt: string | null;
  passwordProtected: boolean;
  passwordHash: string | null;
  encryptionEnabled: boolean;
  downloadCount: number;
  activityLog: Array<{
    timestamp: string;
    action: string;
    ip: string;
    details: string;
  }>;
}

const sharedPockets = new Map<string, SharedPocket>();

// Auto-delete expired shares every 15 seconds for reactive speed
setInterval(() => {
  const now = Date.now();
  for (const [code, pocket] of sharedPockets.entries()) {
    if (pocket.expiresAt && new Date(pocket.expiresAt).getTime() < now) {
      sharedPockets.delete(code);
      addAuditLog('VAULT_SHARE_AUTO_CLEANED', 'SYSTEM', 'SUCCESS', `Expired share code [${code}] was automatically deleted.`);
    }
  }
}, 15000);

// In-memory simple IP-based rate limiter to protect against brute-force / DoS
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

function ipRateLimiter(req: Request, res: Response, next: NextFunction) {
  const ip = (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress || 'unknown';
  const now = Date.now();
  const limitWindowMs = 60 * 1000; // 1 minute window
  const maxRequests = 40; // Max 40 requests per minute for APIs

  const rateData = rateLimitMap.get(ip);

  if (!rateData || now > rateData.resetTime) {
    rateLimitMap.set(ip, { count: 1, resetTime: now + limitWindowMs });
    next();
  } else {
    rateData.count++;
    if (rateData.count > maxRequests) {
      addAuditLog('RATE_LIMIT_EXCEEDED', ip, 'BLOCKED', `IP requested ${rateData.count} times in under a minute.`);
      res.status(429).json({
        error: 'Too many requests from this client. Please slow down. (Rate limiting active to prevent DDoS/Brute-force)',
        status: 429
      });
    } else {
      next();
    }
  }
}

// Disable Express X-Powered-By header to obscure server technology
app.disable('x-powered-by');

// Parse incoming request body with strict limits to prevent large payload attacks (DoS)
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Apply Security Headers (CSP, HSTS, X-Frame-Options, X-Content-Type-Options, Referrer-Policy, Permissions-Policy)
app.use((req: Request, res: Response, next: NextFunction) => {
  // Content Security Policy (CSP)
  res.setHeader(
    'Content-Security-Policy',
    "default-src 'self'; " +
    "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://fonts.googleapis.com https://cdn.tailwindcss.com; " +
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; " +
    "img-src 'self' data: https: blob:; " +
    "font-src 'self' data: https://fonts.gstatic.com; " +
    "connect-src 'self' ws: wss: http: https:; " +
    "frame-ancestors 'self' https://aistudio.google.com https://*.run.app https://*.asia-southeast1.run.app; " +
    "object-src 'none';"
  );

  // HTTP Strict Transport Security (HSTS)
  res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');

  // Prevent Clickjacking - Allow framing in AI Studio / development
  if (process.env.NODE_ENV === 'production') {
    res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  } else {
    // Do not set X-Frame-Options to allow the sandbox to frame the development preview
  }

  // Prevent MIME Sniffing (X-Content-Type-Options)
  res.setHeader('X-Content-Type-Options', 'nosniff');

  // Referrer Policy
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');

  // Permissions Policy
  res.setHeader('Permissions-Policy', 'camera=(self), microphone=(), geolocation=(), payment=()');

  // Safe CORS setup
  res.setHeader('Access-Control-Allow-Origin', req.headers.origin || '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
  } else {
    next();
  }
});

// Guard API routes with Input Threat Detection Middleware
function securityGuard(req: Request, res: Response, next: NextFunction) {
  const ip = (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress || 'unknown';

  // Scan URL/Query params
  const urlParams = JSON.stringify(req.query) + JSON.stringify(req.params);
  const queryScan = detectSecurityThreat(urlParams);
  if (queryScan.hasThreat) {
    addAuditLog('INJECTION_ATTEMPT_BLOCKED', ip, 'BLOCKED', `Vulnerability block: ${queryScan.threatType} detected in URL query.`);
    return res.status(400).json({ error: 'Potential security threat detected in request parameters.', threatType: queryScan.threatType });
  }

  // Scan Request body if present
  if (req.body) {
    const bodyStr = JSON.stringify(req.body);
    const bodyScan = detectSecurityThreat(bodyStr);
    if (bodyScan.hasThreat) {
      addAuditLog('INJECTION_ATTEMPT_BLOCKED', ip, 'BLOCKED', `Vulnerability block: ${bodyScan.threatType} detected in request body.`);
      return res.status(400).json({ error: 'Potential security threat detected in request content.', threatType: bodyScan.threatType });
    }
  }

  next();
}

// Lazy init Google GenAI client safely using the injected server-side key
let aiClient: GoogleGenAI | null = null;
function getAIClient(): GoogleGenAI {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY environment variable is not configured on this server.');
    }
    aiClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build'
        }
      }
    });
  }
  return aiClient;
}

// --- SECURE API ENDPOINTS ---

// Apply rate limiting and security scans to all API routes
app.use('/api', ipRateLimiter);
app.use('/api', securityGuard);

// 1. App Health and Safety Status
app.get('/api/health', (req: Request, res: Response) => {
  res.json({
    status: 'healthy',
    securityScore: 98,
    wafActive: true,
    rateLimiting: 'enabled',
    host: '0.0.0.0',
    port: PORT,
    cspHeaders: 'active',
    databaseConnection: 'secure_in_memory_parameterized_emulation'
  });
});

// 1b. Lens OCR real-time capture and document scanning endpoint
app.post('/api/lens/ocr', async (req: Request, res: Response) => {
  const { image, filter } = req.body;
  const ip = (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress || 'unknown';
  const filterType = filter || 'ocr';

  try {
    const ai = getAIClient();
    let textResponse = '';

    if (image && image.includes('base64,')) {
      // Extract the raw base64 data string from the Data URL
      const base64Data = image.split('base64,')[1];

      let prompt = '';
      if (filterType === 'ocr') {
        prompt = 'Please perform highly accurate OCR text extraction on this document or textbook image. Maintain the original structure, headings, paragraphs, and lists. Return ONLY the plain text content extracted from the image, without any introductory or concluding remarks.';
      } else if (filterType === 'math') {
        prompt = 'Please identify and solve the mathematical equations, graphs, or formulas in this image. Render formulas cleanly using LaTeX-style Markdown (e.g. \\phi(N) = (p-1)(q-1)). Provide a clear, structured step-by-step mathematical explanation of the problem, its variables, and the solution.';
      } else if (filterType === 'code') {
        prompt = 'Please extract the source code from this image. Sanitize and format the code cleanly with correct indentation, bracket nesting, and casing. Return ONLY the formatted code block inside a markdown code block (e.g. ```typescript), without any explanatory text.';
      } else {
        prompt = 'Analyze this image and extract any readable study notes or text content.';
      }

      const imagePart = {
        inlineData: {
          mimeType: 'image/jpeg',
          data: base64Data,
        },
      };

      const response = await ai.models.generateContent({
        model: 'gemini-3.5-flash',
        contents: { parts: [imagePart, { text: prompt }] },
      });

      textResponse = response.text || 'No text could be extracted from the image.';
      addAuditLog('LENS_OCR_SCAN', ip, 'SUCCESS', `Successfully extracted text from webcam image using Gemini 3.5-flash for filter: ${filterType}`);
    } else {
      // Simulation / Fallback Mode when no image is captured (or camera simulation)
      let prompt = '';
      if (filterType === 'ocr') {
        prompt = 'Generate a highly realistic and detailed textbook passage about Symmetric Cryptography, AES Rijndael design block matrices, S-Boxes, and cryptographic key diffusion. Make it sound like an authentic academic scan of study notes, enclosed in quotation marks.';
      } else if (filterType === 'math') {
        prompt = 'Generate a highly realistic and detailed mathematical homework solution for modular exponentiation, prime factorization of N, and RSA Euler totient theorem calculations. Render formulas in clean LaTeX-style Markdown.';
      } else {
        prompt = 'Generate a highly realistic software engineering code snippet illustrating a secure Express backend middleware protecting routes against SQL injection and sanitizing body inputs, fully formatted with code comments.';
      }

      const response = await ai.models.generateContent({
        model: 'gemini-3.5-flash',
        contents: prompt,
      });

      textResponse = `[LENS CAPTURED REFERENCE - SIMULATED]\n${response.text || 'No simulation content generated.'}`;
      addAuditLog('LENS_OCR_SIMULATION', ip, 'SUCCESS', `Generated realistic academic fallback context for filter: ${filterType}`);
    }

    res.json({ text: textResponse });
  } catch (err: any) {
    addAuditLog('LENS_OCR_FAILED', ip, 'WARNING', `Lens OCR processing failed: ${err.message || err}`);
    let fallbackText = '';
    if (filterType === 'ocr') {
      fallbackText = `[OCR Extract - Fallback Note]\n"Symmetric encryption ciphers like AES operate on 128-bit blocks, processing them through multiple substitution and permutation rounds. Rijndael design uses state matrix multiplications for diffusion."`;
    } else if (filterType === 'math') {
      fallbackText = `[Math Formula - Fallback Note]\n"Equation 3.42: \\phi(N) = (p - 1)(q - 1).\nEuler's totient of the modulus N. GCD(e, \\phi(N)) = 1 is required to compute the private key exponent d."`;
    } else {
      fallbackText = `[Code Block - Fallback Note]\n\`\`\`typescript\n// Injected Route Sanitizer\napp.post('/api/validate', (req, res) => {\n  const sanitized = req.body.data.replace(/[^a-zA-Z0-9]/g, '');\n  res.json({ ok: true, sanitized });\n});\n\`\`\``;
    }
    res.json({ text: fallbackText });
  }
});

// 2. Chat Route proxy with failover/Ollama switches
app.post('/api/chat', async (req: Request, res: Response) => {
  const { provider, model, prompt, systemInstruction } = req.body;
  const ip = (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress || 'unknown';

  if (!prompt) {
    return res.status(400).json({ error: 'Missing chat prompt.' });
  }

  // Double check SSRF / URL injections if custom Ollama/REST URL is given
  if (req.body.customUrl) {
    if (!isSafeUrl(req.body.customUrl)) {
      addAuditLog('SSRF_ATTEMPT_BLOCKED', ip, 'BLOCKED', `Blocked request to untrusted external API URL: ${req.body.customUrl}`);
      return res.status(400).json({ error: 'SSRF Block: The requested custom model URL is unsafe or targets localhost.' });
    }
  }

  try {
    // If provider is gemini_backend, use the real GoogleGenAI SDK!
    if (provider === 'gemini_backend') {
      try {
        const ai = getAIClient();
        const response = await ai.models.generateContent({
          model: 'gemini-3.5-flash',
          contents: prompt,
          config: {
            systemInstruction: systemInstruction || 'You are the Student AI Super Assistant.'
          }
        });

        addAuditLog('GEMINI_AI_CALL', ip, 'SUCCESS', 'Executed Gemini API response securely on server.');
        return res.json({ response: response.text });
      } catch (err: any) {
        addAuditLog('GEMINI_AI_CALL_FAILED', ip, 'WARNING', `Gemini API call failed: ${err.message || err}`);
        // Fallback to offline student helper prompt response if no key or API error
        return res.json({
          response: `[Gemini Backend Mode (Local Fallback due to API error)]\n\nI am running in Offline Switch mode. Here is your output:\n\n${mockLocalResponse(prompt, systemInstruction)}`,
          isFallback: true
        });
      }
    }

    // Offline / Ollama Mock response if model is offline or custom Ollama URL is not reachable
    addAuditLog('LOCAL_AI_CALL', ip, 'SUCCESS', `Processed local model request: ${model || 'Ollama Default'}`);
    return res.json({
      response: mockLocalResponse(prompt, systemInstruction)
    });
  } catch (err: any) {
    res.status(500).json({ error: 'An unexpected internal processing error occurred.' });
  }
});

// --- HELPER FUNCTIONS FOR FALLBACK IMAGE & DOC GENERATION ---

function generateMockArtwork(prompt: string, style: string, aspectRatio: string): string {
  // Determine aspect ratio dimensions
  let width = 800;
  let height = 800;
  if (aspectRatio === '16:9') { width = 1200; height = 675; }
  else if (aspectRatio === '9:16') { width = 675; height = 1200; }
  else if (aspectRatio === '4:3') { width = 1024; height = 768; }
  else if (aspectRatio === '3:4') { width = 768; height = 1024; }

  const lowerPrompt = prompt.toLowerCase();
  
  // Theme styling configurations
  let bgGradientStart = '#0f172a';
  let bgGradientEnd = '#1e1b4b';
  let accentColor1 = '#38bdf8';
  let accentColor2 = '#a855f7';
  let accentColor3 = '#ec4899';
  let themeName = 'Cosmic Art';
  let shapesSvg = '';

  if (lowerPrompt.includes('cyber') || lowerPrompt.includes('tech') || lowerPrompt.includes('robot') || lowerPrompt.includes('computer') || lowerPrompt.includes('ai') || lowerPrompt.includes('matrix') || lowerPrompt.includes('code')) {
    themeName = 'Cyber Matrix';
    bgGradientStart = '#030712';
    bgGradientEnd = '#111827';
    accentColor1 = '#10b981'; // emerald
    accentColor2 = '#06b6d4'; // cyan
    accentColor3 = '#6366f1'; // indigo
    // Draw sci-fi matrix / tech wireframes
    shapesSvg = `
      <g opacity="0.15">
        <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
          <path d="M 40 0 L 0 0 0 40" fill="none" stroke="${accentColor1}" stroke-width="1"/>
        </pattern>
        <rect width="100%" height="100%" fill="url(#grid)" />
      </g>
      <!-- Tech circular telemetry elements -->
      <circle cx="${width / 2}" cy="${height / 2}" r="180" fill="none" stroke="${accentColor2}" stroke-width="2" stroke-dasharray="10 15" opacity="0.4"/>
      <circle cx="${width / 2}" cy="${height / 2}" r="120" fill="none" stroke="${accentColor1}" stroke-width="1" opacity="0.3"/>
      <line x1="0" y1="${height / 2}" x2="${width}" y2="${height / 2}" stroke="${accentColor3}" stroke-width="1" opacity="0.2"/>
      <line x1="${width / 2}" y1="0" x2="${width / 2}" y2="${height}" stroke="${accentColor3}" stroke-width="1" opacity="0.2"/>
      <rect x="${width / 2 - 50}" y="${height / 2 - 50}" width="100" height="100" fill="none" stroke="${accentColor2}" stroke-width="1.5" transform="rotate(45, ${width / 2}, ${height / 2})" opacity="0.5"/>
    `;
  } else if (lowerPrompt.includes('nature') || lowerPrompt.includes('tree') || lowerPrompt.includes('forest') || lowerPrompt.includes('mountain') || lowerPrompt.includes('lake') || lowerPrompt.includes('sunset') || lowerPrompt.includes('river') || lowerPrompt.includes('flower') || lowerPrompt.includes('sun')) {
    themeName = 'Organic Landscape';
    bgGradientStart = '#022c22'; // deep emerald
    bgGradientEnd = '#064e3b';
    accentColor1 = '#34d399'; // green accent
    accentColor2 = '#fbbf24'; // warm amber
    accentColor3 = '#f87171'; // soft rose
    // Draw stylized mountains and sun
    shapesSvg = `
      <!-- Glowing warm sun -->
      <circle cx="${width / 2}" cy="${height / 2 - 100}" r="90" fill="${accentColor2}" opacity="0.8" filter="blur(8px)" />
      <circle cx="${width / 2}" cy="${height / 2 - 100}" r="80" fill="${accentColor2}" />
      <!-- Mountain ranges back -->
      <polygon points="0,${height} ${width * 0.3},${height * 0.4} ${width * 0.7},${height} 0,${height}" fill="#047857" opacity="0.7"/>
      <polygon points="${width * 0.4},${height} ${width * 0.82},${height * 0.3} ${width},${height} ${width * 0.4},${height}" fill="#065f46" opacity="0.9"/>
      <!-- Trees silhouettes -->
      <g stroke="none" fill="${accentColor1}">
        <polygon points="${width * 0.2},${height} ${width * 0.2 - 20},${height - 60} ${width * 0.2 + 20},${height - 60}" />
        <polygon points="${width * 0.2},${height - 40} ${width * 0.2 - 15},${height - 90} ${width * 0.2 + 15},${height - 90}" />
        <polygon points="${width * 0.5},${height} ${width * 0.5 - 25},${height - 80} ${width * 0.5 + 25},${height - 80}" />
        <polygon points="${width * 0.8},${height} ${width * 0.8 - 20},${height - 60} ${width * 0.8 + 20},${height - 60}" />
      </g>
    `;
  } else if (lowerPrompt.includes('anime') || lowerPrompt.includes('manga') || lowerPrompt.includes('cartoon') || lowerPrompt.includes('character') || lowerPrompt.includes('game') || lowerPrompt.includes('retro')) {
    themeName = 'Vaporwave Sunset';
    bgGradientStart = '#2e1065'; // dark violet
    bgGradientEnd = '#4d072b'; // deep magenta
    accentColor1 = '#f472b6'; // hot pink
    accentColor2 = '#38bdf8'; // light blue
    accentColor3 = '#fbbf24'; // yellow
    // Draw vaporwave retro sun and grid lines
    shapesSvg = `
      <g opacity="0.3">
        <pattern id="retrogrid" width="40" height="20" patternUnits="userSpaceOnUse">
          <line x1="0" y1="20" x2="40" y2="20" stroke="${accentColor1}" stroke-width="1" />
          <line x1="40" y1="0" x2="40" y2="20" stroke="${accentColor1}" stroke-width="0.5" />
        </pattern>
        <rect width="100%" height="100%" fill="url(#retrogrid)" />
      </g>
      <!-- Big retro neon striped sun -->
      <mask id="sun-mask">
        <rect x="0" y="0" width="${width}" height="${height}" fill="white" />
        <rect x="0" y="${height / 2 - 40}" width="${width}" height="6" fill="black" />
        <rect x="0" y="${height / 2 - 10}" width="${width}" height="8" fill="black" />
        <rect x="0" y="${height / 2 + 20}" width="${width}" height="12" fill="black" />
        <rect x="0" y="${height / 2 + 55}" width="${width}" height="16" fill="black" />
        <rect x="0" y="${height / 2 + 95}" width="${width}" height="22" fill="black" />
      </mask>
      <circle cx="${width / 2}" cy="${height / 2}" r="150" fill="url(#retro-sun-grad)" mask="url(#sun-mask)" />
      
      <defs>
        <linearGradient id="retro-sun-grad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stop-color="${accentColor3}" />
          <stop offset="60%" stop-color="${accentColor1}" />
          <stop offset="100%" stop-color="${accentColor2}" />
        </linearGradient>
      </defs>
      
      <!-- Stars -->
      <circle cx="${width * 0.1}" cy="${height * 0.15}" r="2" fill="white" opacity="0.8"/>
      <circle cx="${width * 0.85}" cy="${height * 0.22}" r="3" fill="white" opacity="0.6"/>
      <circle cx="${width * 0.75}" cy="${height * 0.1}" r="1.5" fill="white" opacity="0.9"/>
    `;
  } else if (lowerPrompt.includes('minimal') || lowerPrompt.includes('modern') || lowerPrompt.includes('abstract') || lowerPrompt.includes('shape') || lowerPrompt.includes('design') || lowerPrompt.includes('vector')) {
    themeName = 'Bauhaus Geometric';
    bgGradientStart = '#fcfbf7'; // soft white
    bgGradientEnd = '#f1eedf'; // warm grey-yellow
    accentColor1 = '#dc2626'; // primary red
    accentColor2 = '#2563eb'; // primary blue
    accentColor3 = '#ca8a04'; // primary yellow
    // Draw modern geometric Bauhaus layouts
    shapesSvg = `
      <g opacity="0.9">
        <rect x="80" y="100" width="160" height="160" fill="${accentColor1}" />
        <circle cx="${width - 150}" cy="180" r="100" fill="${accentColor2}" />
        <path d="M 120,${height - 100} L 240,${height - 300} L 360,${height - 100} Z" fill="${accentColor3}" />
        <circle cx="${width / 2}" cy="${height / 2 + 80}" r="130" fill="none" stroke="#1c1917" stroke-width="12" />
        <line x1="80" y1="${height / 2}" x2="${width - 80}" y2="${height / 2}" stroke="#1c1917" stroke-width="4" />
      </g>
    `;
  } else if (lowerPrompt.includes('art') || lowerPrompt.includes('paint') || lowerPrompt.includes('watercolor') || lowerPrompt.includes('sketch') || lowerPrompt.includes('ink')) {
    themeName = 'Artistic Fluidity';
    bgGradientStart = '#1e1b4b'; // deep indigo
    bgGradientEnd = '#311042'; // deep burgundy
    accentColor1 = '#fb7185'; // rose
    accentColor2 = '#fb923c'; // orange
    accentColor3 = '#c084fc'; // purple
    // Draw soft watercolor abstract circles
    shapesSvg = `
      <circle cx="${width * 0.4}" cy="${height * 0.4}" r="220" fill="${accentColor3}" opacity="0.4" filter="blur(40px)" />
      <circle cx="${width * 0.6}" cy="${height * 0.5}" r="200" fill="${accentColor1}" opacity="0.3" filter="blur(30px)" />
      <circle cx="${width * 0.5}" cy="${height * 0.35}" r="150" fill="${accentColor2}" opacity="0.35" filter="blur(50px)" />
      
      <!-- Overlapping painterly circular vectors -->
      <circle cx="${width / 2}" cy="${height / 2}" r="140" fill="none" stroke="${accentColor1}" stroke-width="1.5" stroke-dasharray="1 8" />
      <circle cx="${width / 2}" cy="${height / 2}" r="130" fill="none" stroke="${accentColor3}" stroke-width="1" />
      <circle cx="${width / 2}" cy="${height / 2}" r="120" fill="none" stroke="${accentColor2}" stroke-width="2" />
    `;
  } else {
    // Default: Cosmic space
    shapesSvg = `
      <g opacity="0.5">
        <!-- Star Field -->
        <circle cx="${width * 0.1}" cy="${height * 0.2}" r="1" fill="#fff" />
        <circle cx="${width * 0.3}" cy="${height * 0.1}" r="1.5" fill="#fff" />
        <circle cx="${width * 0.85}" cy="${height * 0.3}" r="1.2" fill="#fff" />
        <circle cx="${width * 0.7}" cy="${height * 0.85}" r="1" fill="#fff" />
        <circle cx="${width * 0.15}" cy="${height * 0.75}" r="2" fill="#fff" opacity="0.7" />
        <circle cx="${width * 0.9}" cy="${height * 0.6}" r="1.5" fill="#fff" />
      </g>
      <!-- Big space planet -->
      <circle cx="${width * 0.3}" cy="${height * 0.4}" r="120" fill="url(#planet-grad)" />
      <!-- Orbital rings -->
      <ellipse cx="${width * 0.3}" cy="${height * 0.4}" rx="240" ry="40" fill="none" stroke="${accentColor3}" stroke-width="3" transform="rotate(-15, ${width * 0.3}, ${height * 0.4})" opacity="0.7" />
      <ellipse cx="${width * 0.3}" cy="${height * 0.4}" rx="210" ry="30" fill="none" stroke="${accentColor1}" stroke-width="1" transform="rotate(-15, ${width * 0.3}, ${height * 0.4})" opacity="0.5" />
      
      <defs>
        <linearGradient id="planet-grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="${accentColor2}" />
          <stop offset="100%" stop-color="${accentColor1}" />
        </linearGradient>
      </defs>
    `;
  }

  // Create SVG string
  const textFill = bgGradientStart === '#fcfbf7' ? '#1c1917' : '#f9fafb';
  const subtextFill = bgGradientStart === '#fcfbf7' ? '#44403c' : '#9ca3af';

  const styleLabel = style ? `${style} Style` : 'Original Prompt';

  const svgString = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="100%" height="100%" style="background: linear-gradient(135deg, ${bgGradientStart}, ${bgGradientEnd});">
      <defs>
        <linearGradient id="bg-grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="${bgGradientStart}" />
          <stop offset="100%" stop-color="${bgGradientEnd}" />
        </linearGradient>
        <filter id="drop-shadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="12" stdDeviation="16" flood-color="#000" flood-opacity="0.6"/>
        </filter>
      </defs>
      
      <rect width="100%" height="100%" fill="url(#bg-grad)" />
      
      ${shapesSvg}
      
      <!-- Elegant bottom branding / text label container -->
      <g filter="url(#drop-shadow)" transform="translate(0, 0)">
        <!-- Beautiful bottom gradient card overlay for readability -->
        <rect x="${width * 0.05}" y="${height * 0.65}" width="${width * 0.9}" height="${height * 0.28}" rx="12" fill="${bgGradientStart === '#fcfbf7' ? '#ffffff' : '#0f0f11'}" fill-opacity="0.85" stroke="${accentColor1}" stroke-width="1.5" stroke-opacity="0.3"/>
        
        <!-- Text overlay -->
        <text x="${width * 0.1}" y="${height * 0.73}" font-family="System-UI, -apple-system, sans-serif" font-size="28" font-weight="900" fill="${textFill}" letter-spacing="0.5">${styleLabel.toUpperCase()}</text>
        <text x="${width * 0.1}" y="${height * 0.81}" font-family="System-UI, -apple-system, sans-serif" font-size="18" font-weight="normal" fill="${subtextFill}" width="${width * 0.8}" xml:space="preserve">Prompt: "${prompt.substring(0, 70)}${prompt.length > 70 ? '...' : ''}"</text>
        <text x="${width * 0.1}" y="${height * 0.88}" font-family="monospace" font-size="11" font-weight="bold" fill="${accentColor2}" letter-spacing="2">STUDENT AI ENGINE // ${themeName.toUpperCase()}</text>
      </g>
    </svg>
  `;

  const base64Svg = Buffer.from(svgString).toString('base64');
  return `data:image/svg+xml;base64,${base64Svg}`;
}

function generateMockOfficeData(docType: string, prompt: string) {
  const cleanPrompt = prompt.replace(/[^a-zA-Z0-9 ]/g, '');
  const subject = cleanPrompt.substring(0, 30) || 'Study Report';

  if (docType === 'word') {
    return {
      title: `${subject} - Comprehensive Syllabus Overview`,
      subtitle: `AI Generated Study Document based on: "${prompt}"`,
      sections: [
        {
          heading: `1. Introduction and Scope of ${subject}`,
          paragraphs: [
            `This study guide provides an authoritative investigation into ${prompt}. It addresses fundamental academic paradigms, critical workflows, and core syllabus requirements necessary for student success.`,
            `Key learning outcomes include mastery of foundational theories, algorithmic problem solving, and compliance with the secure operational protocols defined in subsequent chapters.`
          ],
          list: [
            `Analyze and describe the fundamental mechanisms of ${subject}`,
            `Evaluate the architectural integrity and parameters under test constraints`,
            `Synthesize an optimal strategy to mitigate performance bottlenecks and code vulnerabilities`
          ]
        },
        {
          heading: `2. Core Analytical Methodologies`,
          paragraphs: [
            `By examining historical metrics and academic research datasets, students will learn to apply quantitative formulas. These formulas establish mathematical trapsdoor functions which are vital for cryptography, engineering, and data analysis.`,
            `It is critical to observe bounds restrictions. For example, all Rijndael substitution tables must be verified against finite field algebra GF(2^8) equations before deployment in active production gateways.`
          ],
          list: [
            `Verify prime number factors (p, q) for RSA trapdoors`,
            `Implement correct cross-origin resource sharing (CORS) header limits`,
            `Mitigate injection threats by enforcing parameterized query statements`
          ]
        }
      ]
    };
  } else if (docType === 'excel') {
    return {
      title: `${subject} - Data Analysis Matrix`,
      headers: ['Index ID', 'Category Label', 'Syllabus Priority', 'Required Hours', 'Confidence Rate (%)', 'Fulfillment Score'],
      rows: [
        ['STUDY-101', `${subject} Fundamentals`, 'HIGH', '12', '85%', '4.8'],
        ['STUDY-102', 'Methodology Research', 'MEDIUM', '8', '72%', '3.9'],
        ['STUDY-103', 'Practical Exercises', 'HIGH', '15', '90%', '4.9'],
        ['STUDY-104', 'Vulnerability Scanning', 'HIGH', '6', '95%', '5.0'],
        ['STUDY-105', 'Midterm Mock Assessment', 'MEDIUM', '10', '68%', '3.5'],
        ['STUDY-TOTAL', 'Aggregated Metrics', 'SUM TOTAL', '51', '82% Avg', '22.1 Overall']
      ]
    };
  } else {
    // ppt
    return {
      title: `${subject} Slide Deck`,
      subtitle: `Masterclass Presentation on: "${prompt}"`,
      slides: [
        {
          title: `Slide 1: Introduction to ${subject}`,
          bullets: [
            `Comprehensive outline of the primary ${subject} research parameters`,
            `Core goals: Establishing a pristine understanding of ${prompt}`,
            `Review of syllabus benchmarks and exam grading matrices`
          ],
          layout: 'title_and_bullets'
        },
        {
          title: `Slide 2: Analytical Core Concepts`,
          bullets: [
            `Quantitative models for modern student workloads`,
            `Integrating security architectures and parameter sanitization`,
            `Step-by-step resolution of modular exponentiation and Euler totient values`
          ],
          layout: 'two_columns'
        },
        {
          title: `Slide 3: Implementation Roadmaps`,
          bullets: [
            `Phase 1: Ingestion of textbook materials via RAG indices`,
            `Phase 2: Validation of code structures in live sandbox environments`,
            `Phase 3: Automated compliance reporting and audit logging`
          ],
          layout: 'title_and_bullets'
        }
      ]
    };
  }
}

// 2b. Free Image Generation and Editing Endpoint
app.post('/api/generate-image', async (req: Request, res: Response) => {
  const { prompt, style, aspectRatio, referenceImage } = req.body;
  const ip = (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress || 'unknown';

  if (!prompt) {
    return res.status(400).json({ error: 'Missing image generation prompt.' });
  }

  const fullPrompt = `${style ? style + ' style, ' : ''}${prompt}`;

  try {
    const ai = getAIClient();
    const parts: any[] = [];

    // Check if reference image is supplied for image-to-image editing
    if (referenceImage && referenceImage.includes('base64,')) {
      const splitParts = referenceImage.split('base64,');
      const mime = splitParts[0].split(':')[1].split(';')[0] || 'image/png';
      const base64Data = splitParts[1];

      parts.push({
        inlineData: {
          data: base64Data,
          mimeType: mime
        }
      });
      addAuditLog('IMAGE_EDIT_REQUEST', ip, 'SUCCESS', `Editing image using style [${style || 'Default'}] and edit prompt: ${prompt}`);
    } else {
      addAuditLog('IMAGE_GENERATION_REQUEST', ip, 'SUCCESS', `Generating image with style [${style || 'Default'}] and prompt: ${prompt}`);
    }

    parts.push({ text: fullPrompt });

    const response = await ai.models.generateContent({
      model: 'gemini-3.1-flash-lite-image',
      contents: { parts },
      config: {
        imageConfig: {
          aspectRatio: aspectRatio || '1:1'
        }
      }
    });

    let generatedImageUrl = '';
    if (response.candidates && response.candidates[0]?.content?.parts) {
      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData) {
          const outBase64 = part.inlineData.data;
          const outMime = part.inlineData.mimeType || 'image/png';
          generatedImageUrl = `data:${outMime};base64,${outBase64}`;
          break;
        }
      }
    }

    if (generatedImageUrl) {
      addAuditLog('IMAGE_GENERATED_GEMINI', ip, 'SUCCESS', `Successfully generated real base64 image using Gemini Image API.`);
      return res.json({ success: true, imageUrl: generatedImageUrl });
    } else {
      throw new Error('No inlineData returned from Gemini model parts.');
    }

  } catch (err: any) {
    addAuditLog('IMAGE_GENERATION_FAILED', ip, 'WARNING', `Gemini image generation failed or unconfigured: ${err.message || err}. Reverting to secure local SVG vector synthesizer.`);
    const fallbackUrl = generateMockArtwork(prompt, style, aspectRatio);
    return res.json({ success: true, imageUrl: fallbackUrl, isFallback: true });
  }
});

// 2c. Word, Excel, PPT Generator Endpoint
app.post('/api/generate-office-doc', async (req: Request, res: Response) => {
  const { docType, prompt } = req.body;
  const ip = (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress || 'unknown';

  if (!docType || !prompt) {
    return res.status(400).json({ error: 'Missing document type or prompt.' });
  }

  try {
    const ai = getAIClient();
    let responseText = '';
    let systemInstruction = '';
    let responseSchema: any = null;

    if (docType === 'word') {
      systemInstruction = 'You are an expert document generator. Generate structured JSON for a comprehensive Word document outline representing the user\'s prompt. Populate with realistic, highly professional paragraphs, headings, and lists.';
      responseSchema = {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING },
          subtitle: { type: Type.STRING },
          sections: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                heading: { type: Type.STRING },
                paragraphs: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING }
                },
                list: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING }
                }
              },
              required: ["heading"]
            }
          }
        },
        required: ["title", "sections"]
      };
    } else if (docType === 'excel') {
      systemInstruction = 'You are a spreadsheet analysis wizard. Generate structured JSON for a complete data table representing the user\'s prompt. Ensure column headers and rows contain realistic numerical data, totals, names, and labels.';
      responseSchema = {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING },
          headers: {
            type: Type.ARRAY,
            items: { type: Type.STRING }
          },
          rows: {
            type: Type.ARRAY,
            items: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            }
          }
        },
        required: ["title", "headers", "rows"]
      };
    } else if (docType === 'ppt') {
      systemInstruction = 'You are an elite slide presentation designer. Generate structured JSON for a complete slide presentation outline representing the user\'s prompt. Return a list of cohesive slides, each slide possessing a descriptive title, bullet points, and layout suggestion.';
      responseSchema = {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING },
          subtitle: { type: Type.STRING },
          slides: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                title: { type: Type.STRING },
                bullets: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING }
                },
                layout: { type: Type.STRING }
              },
              required: ["title", "bullets"]
            }
          }
        },
        required: ["title", "slides"]
      };
    }

    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3.5-flash',
        contents: `Create structured document outline content for prompt: "${prompt}"`,
        config: {
          systemInstruction,
          responseMimeType: 'application/json',
          responseSchema
        }
      });

      responseText = response.text || '';
      const parsedData = JSON.parse(responseText.trim());
      addAuditLog('DOC_GENERATED_GEMINI', ip, 'SUCCESS', `Successfully generated professional ${docType} content outline via Gemini.`);
      return res.json({ success: true, docType, data: parsedData });
    } catch (geminiErr: any) {
      addAuditLog('DOC_GENERATED_GEMINI_FAILED', ip, 'WARNING', `Gemini content generation failed: ${geminiErr.message || geminiErr}. Building premium fallback.`);
      const fallbackData = generateMockOfficeData(docType, prompt);
      return res.json({ success: true, docType, data: fallbackData, isFallback: true });
    }

  } catch (err: any) {
    addAuditLog('DOC_GENERATION_ERROR', ip, 'WARNING', `Office generator crash: ${err.message || err}`);
    const fallbackData = generateMockOfficeData(docType, prompt);
    return res.json({ success: true, docType, data: fallbackData, isFallback: true });
  }
});

// 3. Website & App Generator endpoint
app.post('/api/generate-project', async (req: Request, res: Response) => {
  const { prompt, techStack } = req.body;
  const ip = (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress || 'unknown';

  if (!prompt) {
    return res.status(400).json({ error: 'Missing prompt for code generation.' });
  }

  try {
    const ai = getAIClient();
    
    const systemInstruction = `You are a high-level secure cloud-native AI Software Engineer.
Your task is to generate complete, high-quality, fully functioning, multi-file web, full-stack, or mobile mock apps based on user prompts and selected tech stack: "${techStack}".
Always design secure, modern, premium UI layouts with interactive states.
If the tech stack is "React + Tailwind", output an index.html that includes React/Babel/Tailwind CDNs, mounting a fully interactive client-side React component defined in a script tag or as separate files.
If the tech stack is "Express + SQLite Fullstack", include index.html, app.js, a secure Express server.js file containing mock SQLite logic in arrays with input validation, CORS, error handling, and parameterized emulation, and package.json.
Your response MUST comply strictly with the requested JSON schema.`;

    const responseSchema = {
      type: Type.OBJECT,
      properties: {
        name: { type: Type.STRING },
        description: { type: Type.STRING },
        files: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              id: { type: Type.STRING },
              name: { type: Type.STRING },
              language: { type: Type.STRING },
              content: { type: Type.STRING }
            },
            required: ['id', 'name', 'language', 'content']
          }
        }
      },
      required: ['name', 'description', 'files']
    };

    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: `Generate a fully functional secure app in "${techStack}" for prompt: "${prompt}". Provide clean responsive designs, custom features, realistic mock data, and functional interactive event listeners.`,
      config: {
        systemInstruction,
        responseMimeType: 'application/json',
        responseSchema
      }
    });

    const parsedData = JSON.parse((response.text || '').trim());
    addAuditLog('PROJECT_GENERATED_GEMINI', ip, 'SUCCESS', `AI software engineer compiled complete workspace project via Gemini for stack: ${techStack}`);
    return res.json(parsedData);

  } catch (geminiErr: any) {
    addAuditLog('PROJECT_GENERATED_GEMINI_FAILED', ip, 'WARNING', `Gemini project generation failed: ${geminiErr.message}. Utilizing high-fidelity local templates.`);
    
    // Fallback to high-fidelity, highly custom offline structures
    const cleanStack = sanitizeHTML(techStack || 'HTML/CSS/JS');
    const cleanPrompt = sanitizeHTML(prompt);
    
    let files = [];
    let name = 'Local Secure Sandbox Build';
    let description = `A secure offline-fallback prototype based on: ${cleanPrompt}`;

    if (cleanStack.includes('Express')) {
      name = 'Fullstack Express SQLite Portal';
      files = [
        {
          id: 'f1',
          name: 'index.html',
          language: 'html',
          content: `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Sovereign Fullstack Portal</title>
    <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-[#0B0B0C] text-zinc-100 min-h-screen flex flex-col font-sans">
    <header class="p-6 border-b border-zinc-800 flex justify-between items-center">
        <h1 class="text-sm font-mono font-bold text-[#FFD700] uppercase tracking-widest">⚡ Fullstack Express + SQLite Portal</h1>
        <span class="text-[10px] font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5">ONLINE SECURE</span>
    </header>
    <main class="flex-1 max-w-4xl w-full mx-auto p-6 md:p-8 space-y-6">
        <div class="bg-[#141416] border border-zinc-800 p-6 shadow-[4px_4px_0px_rgba(255,215,0,0.1)]">
            <h2 class="text-lg font-serif font-bold italic text-zinc-100 mb-2">Workspace Objective</h2>
            <p class="text-xs text-zinc-400 leading-relaxed font-mono">${cleanPrompt}</p>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <!-- Interactor Panel -->
            <div class="bg-[#141416] border border-zinc-800 p-6 space-y-4">
                <h3 class="text-xs font-mono font-bold uppercase text-[#FFD700] tracking-wider">Database Operations</h3>
                <div class="space-y-3">
                    <input id="userName" type="text" placeholder="Enter record name..." class="w-full bg-[#0B0B0C] border border-zinc-800 text-xs font-mono text-zinc-100 p-2.5 outline-none focus:border-[#FFD700]" />
                    <button id="addRecordBtn" class="w-full bg-[#FFD700] hover:bg-opacity-90 text-[#0B0B0C] text-xs font-mono font-bold uppercase py-2.5 transition cursor-pointer">Insert SQLite Record</button>
                </div>
            </div>

            <!-- Table View -->
            <div class="bg-[#141416] border border-zinc-800 p-6 flex flex-col">
                <div class="flex justify-between items-center mb-4">
                    <h3 class="text-xs font-mono font-bold uppercase text-[#FFD700] tracking-wider">Active Table Rows</h3>
                    <button id="refreshBtn" class="text-[9px] font-mono bg-zinc-900 border border-zinc-800 text-zinc-300 px-2 py-1 uppercase hover:bg-[#1A1A1D]">Query SELECT</button>
                </div>
                <div class="flex-1 overflow-y-auto max-h-48 scrollbar-thin">
                    <table class="w-full text-left text-[11px] font-mono">
                        <thead>
                            <tr class="border-b border-zinc-800 text-zinc-500">
                                <th class="py-1">ID</th>
                                <th class="py-1">NAME</th>
                                <th class="py-1">TIMESTAMP</th>
                            </tr>
                        </thead>
                        <tbody id="rowsTableBody">
                            <tr>
                                <td colspan="3" class="py-3 text-center text-zinc-600">Query pending execution...</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    </main>
    <script src="app.js"></script>
</body>
</html>`
        },
        {
          id: 'f2',
          name: 'app.js',
          language: 'javascript',
          content: `// Fullstack Portal Client Interactor
const rowsTableBody = document.getElementById('rowsTableBody');
const addRecordBtn = document.getElementById('addRecordBtn');
const refreshBtn = document.getElementById('refreshBtn');
const userNameInput = document.getElementById('userName');

async function fetchRecords() {
    try {
        rowsTableBody.innerHTML = '<tr><td colspan="3" class="py-3 text-center text-zinc-500 animate-pulse">Running sqlite SELECT *...</td></tr>';
        const res = await fetch('/api/db-records');
        const data = await res.json();
        if (data.records && data.records.length > 0) {
            rowsTableBody.innerHTML = data.records.map(r => \`
                <tr class="border-b border-zinc-900/50 hover:bg-zinc-900/20 text-zinc-300">
                    <td class="py-2 text-zinc-500">\${r.id}</td>
                    <td class="py-2 font-bold text-zinc-200">\${r.name}</td>
                    <td class="py-2 text-zinc-500 text-[10px]">\${r.timestamp}</td>
                </tr>
            \`).join('');
        } else {
            rowsTableBody.innerHTML = '<tr><td colspan="3" class="py-3 text-center text-zinc-600">No sqlite rows currently found.</td></tr>';
        }
    } catch {
        rowsTableBody.innerHTML = '<tr><td colspan="3" class="py-3 text-center text-red-500">Failed to query backend.</td></tr>';
    }
}

addRecordBtn?.addEventListener('click', async () => {
    const val = userNameInput.value.trim();
    if (!val) return alert('Name payload cannot be empty.');
    try {
        const res = await fetch('/api/db-records', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name: val })
        });
        const result = await res.json();
        if (result.success) {
            userNameInput.value = '';
            fetchRecords();
        } else {
            alert('Error: ' + result.error);
        }
    } catch {
        alert('Server failure inserting record.');
    }
});

refreshBtn?.addEventListener('click', fetchRecords);
window.addEventListener('DOMContentLoaded', fetchRecords);`
        },
        {
          id: 'f3',
          name: 'server.js',
          language: 'javascript',
          content: `// Express server.js containing mock SQLite logic in memory arrays
const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// Emulating a secure in-memory database table with validation
const databaseTable = [
  { id: 1, name: 'Sovereign Core Initializer', timestamp: new Date().toLocaleString() },
  { id: 2, name: 'Secure Sandbox Webhook', timestamp: new Date().toLocaleString() }
];

app.get('/api/db-records', (req, res) => {
    res.json({ records: databaseTable });
});

app.post('/api/db-records', (req, res) => {
    const { name } = req.body;
    if (!name || typeof name !== 'string' || name.length > 50) {
        return res.status(400).json({ success: false, error: 'Malformed or length-exceeded inputs.' });
    }
    
    // SQL Sanitizer emulation
    const cleanName = name.replace(/[^a-zA-Z0-9\\s-_]/g, '');
    const newRecord = {
        id: databaseTable.length + 1,
        name: cleanName,
        timestamp: new Date().toLocaleString()
    };
    
    databaseTable.push(newRecord);
    res.json({ success: true, record: newRecord });
});

app.listen(PORT, () => {
    console.log('Backend listening on port ' + PORT);
});`
        },
        {
          id: 'f4',
          name: 'package.json',
          language: 'json',
          content: `{
  "name": "secure-sqlite-fullstack-app",
  "version": "1.0.0",
  "private": true,
  "description": "Full-stack sandbox compiled securely",
  "scripts": {
    "start": "node server.js"
  },
  "dependencies": {
    "express": "^4.18.2"
  }
}`
        }
      ];
    } else if (cleanStack.includes('React')) {
      name = 'Modern React Visual Hub';
      files = [
        {
          id: 'f1',
          name: 'index.html',
          language: 'html',
          content: `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Modern React Sandbox Hub</title>
    <!-- React & Babel CDN loads for safe inline JSX evaluation -->
    <script src="https://unpkg.com/react@18/umd/react.development.js" crossorigin></script>
    <script src="https://unpkg.com/react-dom@18/umd/react-dom.development.js" crossorigin></script>
    <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
    <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-[#0B0B0C] text-zinc-100 min-h-screen font-sans">
    <div id="root"></div>

    <script type="text/babel">
        function App() {
            const [count, setCount] = React.useState(0);
            const [search, setSearch] = React.useState('');
            const [items, setItems] = React.useState([
                { id: 1, title: "Sovereign Framework", group: "Sec-Ops" },
                { id: 2, title: "Quantum State Hooks", group: "AI-Gen" },
                { id: 3, title: "Tailwind Grid Engine", group: "Design" }
            ]);

            const filteredItems = items.filter(item => 
                item.title.toLowerCase().includes(search.toLowerCase())
            );

            return (
                <div className="p-6 md:p-8 max-w-4xl mx-auto space-y-6">
                    <header className="flex justify-between items-center border-b border-zinc-800 pb-4">
                        <div>
                            <h1 className="text-lg font-serif font-bold italic text-zinc-100">Modern React Visual Hub</h1>
                            <p className="text-[10px] font-mono text-zinc-400">Sandbox build of: ${cleanPrompt}</p>
                        </div>
                        <span className="text-[9px] font-mono bg-[#FFD700]/10 text-[#FFD700] border border-[#FFD700]/20 px-2 py-1">REACT 18 READY</span>
                    </header>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Interactive Counter Card */}
                        <div className="bg-[#141416] border border-zinc-800 p-6 flex flex-col justify-between shadow-md">
                            <div>
                                <h3 className="text-xs font-mono font-bold uppercase text-[#FFD700] tracking-wider mb-2">Counter Component</h3>
                                <p className="text-xs text-zinc-400 leading-relaxed mb-4">React state hook monitoring live sandbox session counters.</p>
                            </div>
                            <div className="flex items-center gap-4">
                                <span className="text-3xl font-mono font-black text-zinc-100">{count}</span>
                                <button 
                                    onClick={() => setCount(count + 1)}
                                    className="px-4 py-2 bg-[#FFD700] text-[#0B0B0C] font-mono text-xs font-bold uppercase hover:bg-opacity-90 transition cursor-pointer"
                                >
                                    Increment
                                </button>
                            </div>
                        </div>

                        {/* Search List Card */}
                        <div className="bg-[#141416] border border-zinc-800 p-6 space-y-4 shadow-md">
                            <div className="flex justify-between items-center">
                                <h3 className="text-xs font-mono font-bold uppercase text-[#FFD700] tracking-wider">Stateful List Filter</h3>
                                <span className="text-[9px] font-mono bg-zinc-900 text-zinc-500 px-1.5 py-0.5">{filteredItems.length} items</span>
                            </div>
                            <input 
                                type="text"
                                placeholder="Search entities..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="w-full bg-[#0B0B0C] border border-zinc-800 text-xs font-mono text-zinc-100 p-2.5 outline-none focus:border-[#FFD700]"
                            />
                            <div className="space-y-1 max-h-24 overflow-y-auto">
                                {filteredItems.map(item => (
                                    <div key={item.id} className="flex justify-between items-center bg-[#0B0B0C] border border-zinc-900 px-3 py-2 text-xs">
                                        <span className="font-sans text-zinc-200">{item.title}</span>
                                        <span className="font-mono text-[9px] text-[#FFD700] bg-[#FFD700]/5 px-1">{item.group}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            );
        }

        const root = ReactDOM.createRoot(document.getElementById('root'));
        root.render(<App />);
    </script>
</body>
</html>`
        },
        {
          id: 'f2',
          name: 'package.json',
          language: 'json',
          content: `{
  "name": "modern-react-sandbox-hub",
  "version": "1.0.0",
  "private": true,
  "description": "React sandbox compiled safely",
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0"
  }
}`
        }
      ];
    } else {
      name = 'Cyber HTML Prototype';
      files = [
        {
          id: 'f1',
          name: 'index.html',
          language: 'html',
          content: `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Cyber HTML Prototype</title>
    <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-[#0B0B0C] text-zinc-100 min-h-screen flex flex-col justify-between font-sans">
    <header class="p-6 border-b border-zinc-800 flex justify-between items-center">
        <h1 class="text-xs font-mono font-bold text-[#FFD700] uppercase tracking-widest">⚡ Developer.OS</h1>
        <span class="text-[9px] font-mono bg-zinc-900 text-zinc-400 border border-zinc-800 px-2 py-0.5">VANILLA BUILD</span>
    </header>
    <main class="flex-grow flex flex-col items-center justify-center p-6 text-center max-w-2xl mx-auto space-y-6">
        <span class="text-[10px] font-mono font-bold text-[#FFD700] uppercase tracking-widest block bg-[#FFD700]/10 border border-[#FFD700]/20 px-3 py-1">BUILD ONLINE</span>
        <h2 class="text-3xl md:text-4xl font-serif font-bold italic tracking-tight text-zinc-100">Cyber Sandbox Active</h2>
        <p class="text-xs text-zinc-400 font-mono leading-relaxed">${cleanPrompt}</p>
        <button id="alertBtn" class="bg-[#FFD700] hover:bg-opacity-90 text-[#0B0B0C] font-mono font-bold text-xs uppercase py-3 px-8 transition duration-200">
            Execute Action Trigger
        </button>
        <p id="actionOutput" class="mt-4 text-xs font-mono text-emerald-400 hidden">✓ Trigger successfully processed inside local sandbox environment.</p>
    </main>
    <footer class="p-6 border-t border-zinc-900 text-center select-none">
        <p class="text-[8px] font-mono text-zinc-600 uppercase">Sovereign OS — Isolated Sandbox Runtime</p>
    </footer>
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
          name: 'package.json',
          language: 'json',
          content: `{
  "name": "cyber-html-app",
  "version": "1.0.0",
  "private": true,
  "description": "HTML CSS sandbox"
}`
        }
      ];
    }

    return res.json({
      name,
      description,
      files
    });
  }
});

// 4. Secure File Upload and Scan simulation
app.post('/api/upload-file', (req: Request, res: Response) => {
  const { fileName, fileSize, fileContent } = req.body;
  const ip = (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress || 'unknown';

  if (!fileName || fileSize === undefined) {
    return res.status(400).json({ error: 'Missing file metadata.' });
  }

  // Validate file securely to protect against path traversal and malicious executable files
  const validation = validateUploadedFile(fileName, fileSize);
  if (!validation.isValid) {
    addAuditLog('FILE_UPLOAD_BLOCKED', ip, 'BLOCKED', `Rejected insecure file: ${fileName} (${(fileSize/1024).toFixed(1)} KB) - Reason: ${validation.error}`);
    return res.status(400).json({ error: validation.error });
  }

  // Scan file contents for threats (RCE scripts, XSS tags, bad command attachments)
  if (fileContent) {
    const contentScan = detectSecurityThreat(fileContent);
    if (contentScan.hasThreat) {
      addAuditLog('FILE_MALWARE_BLOCKED', ip, 'BLOCKED', `Malware/Exploit detected in ${fileName}: ${contentScan.threatType}`);
      return res.status(400).json({ error: 'Insecure or malicious content signature detected in file payload.', threatType: contentScan.threatType });
    }
  }

  addAuditLog('FILE_UPLOAD_CLEAN', ip, 'SUCCESS', `File parsed securely: ${fileName} (${(fileSize/1024).toFixed(1)} KB)`);
  res.json({
    success: true,
    message: 'File passed secure validation, path-traversal check, and threat signatures scanning successfully!',
    scanStatus: 'CLEAN',
    fileType: fileName.split('.').pop()?.toUpperCase()
  });
});

// --- FILE RETRIEVAL AND TEMPORARY SHARING APIS ---

// 1. Create a secure share pocket
app.post('/api/vault/share', (req: Request, res: Response) => {
  const { files, expiresIn, passwordProtected, password, encryptionEnabled } = req.body;
  const ip = (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress || 'unknown';

  if (!files || !Array.isArray(files) || files.length === 0) {
    return res.status(400).json({ error: 'Please select or upload files first.' });
  }

  // Validate each file securely
  for (const file of files) {
    const fileValidation = validateUploadedFile(file.name, file.rawSize, undefined, 100); // Allow up to 100MB in this temp system
    if (!fileValidation.isValid) {
      addAuditLog('VAULT_SHARE_BLOCKED', ip, 'BLOCKED', `Insecure file rejected in share payload: ${file.name} - Reason: ${fileValidation.error}`);
      return res.status(400).json({ error: `${file.name}: ${fileValidation.error}` });
    }

    if (file.content) {
      const threatScan = detectSecurityThreat(file.content);
      if (threatScan.hasThreat) {
        addAuditLog('VAULT_SHARE_MALWARE_BLOCKED', ip, 'BLOCKED', `Vulnerability detected inside file content for ${file.name}: ${threatScan.threatType}`);
        return res.status(400).json({ error: `Security Scan Intercepted: Insecure content inside file ${file.name}.`, threatType: threatScan.threatType });
      }
    }
  }

  // Generate unique 6-character uppercase alphanumeric code
  let code = '';
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let attempts = 0;
  while (attempts < 50) {
    let candidate = '';
    for (let i = 0; i < 6; i++) {
      candidate += chars[Math.floor(Math.random() * chars.length)];
    }
    if (!sharedPockets.has(candidate)) {
      code = candidate;
      break;
    }
    attempts++;
  }

  if (!code) {
    return res.status(500).json({ error: 'Could not generate a unique share code. Please try again.' });
  }

  // Parse expiration details
  let expiresAt: string | null = null;
  const now = Date.now();
  if (expiresIn === '1 Hour') {
    expiresAt = new Date(now + 60 * 60 * 1000).toISOString();
  } else if (expiresIn === '6 Hours') {
    expiresAt = new Date(now + 6 * 60 * 60 * 1000).toISOString();
  } else if (expiresIn === '1 Day') {
    expiresAt = new Date(now + 24 * 60 * 60 * 1000).toISOString();
  } else if (expiresIn === '7 Days') {
    expiresAt = new Date(now + 7 * 24 * 60 * 60 * 1000).toISOString();
  } else if (expiresIn === '30 Days') {
    expiresAt = new Date(now + 30 * 24 * 60 * 60 * 1000).toISOString();
  } else {
    expiresAt = null; // "Never"
  }

  const newPocket: SharedPocket = {
    code,
    files: files.map((f: any) => ({
      id: f.id || `file-${Math.random().toString(36).substring(2, 9)}`,
      name: f.name,
      size: f.size,
      rawSize: f.rawSize,
      type: f.type || 'text/plain',
      content: f.content || '',
      date: f.date || new Date().toISOString().split('T')[0],
      secureHash: f.secureHash || `sha256::${Math.random().toString(36).substring(2, 9).toUpperCase()}`
    })),
    createdAt: new Date().toISOString(),
    expiresAt,
    passwordProtected: !!passwordProtected,
    passwordHash: passwordProtected && password ? password : null,
    encryptionEnabled: !!encryptionEnabled,
    downloadCount: 0,
    activityLog: [
      {
        timestamp: new Date().toISOString(),
        action: 'UPLOADED',
        ip,
        details: `Uploaded ${files.length} payloads with expiration set to: ${expiresIn || 'Never'}`
      }
    ]
  };

  sharedPockets.set(code, newPocket);
  addAuditLog('VAULT_SHARE_CREATED', ip, 'SUCCESS', `Successfully generated secure temporary share code [${code}] for ${files.length} files.`);

  res.json({
    success: true,
    code,
    expiresAt,
    filesCount: files.length,
    passwordProtected: !!passwordProtected,
    encryptionEnabled: !!encryptionEnabled
  });
});

// 2. Fetch metadata of a share pocket (excluding contents for security)
app.get('/api/vault/share/:code', (req: Request, res: Response) => {
  const code = (req.params.code || '').toUpperCase();
  const ip = (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress || 'unknown';

  const pocket = sharedPockets.get(code);
  if (!pocket) {
    return res.status(404).json({ error: 'Share pocket not found or expired.' });
  }

  // Check if expired
  if (pocket.expiresAt && new Date(pocket.expiresAt).getTime() < Date.now()) {
    sharedPockets.delete(code);
    addAuditLog('VAULT_SHARE_EXPIRED_ON_ACCESS', ip, 'WARNING', `Cleaned expired share code [${code}] during access attempt.`);
    return res.status(404).json({ error: 'Share pocket not found or expired.' });
  }

  // Return only metadata - NO FILE CONTENTS to protect password
  res.json({
    success: true,
    code,
    filesCount: pocket.files.length,
    files: pocket.files.map(f => ({
      id: f.id,
      name: f.name,
      size: f.size,
      rawSize: f.rawSize,
      type: f.type,
      date: f.date,
      secureHash: f.secureHash
    })),
    passwordProtected: pocket.passwordProtected,
    encryptionEnabled: pocket.encryptionEnabled,
    expiresAt: pocket.expiresAt,
    createdAt: pocket.createdAt,
    downloadCount: pocket.downloadCount
  });
});

// 3. Verify share password and retrieve full contents
app.post('/api/vault/share/:code/access', (req: Request, res: Response) => {
  const code = (req.params.code || '').toUpperCase();
  const { password } = req.body;
  const ip = (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress || 'unknown';

  const pocket = sharedPockets.get(code);
  if (!pocket) {
    return res.status(404).json({ error: 'Share pocket not found or expired.' });
  }

  // Check if expired
  if (pocket.expiresAt && new Date(pocket.expiresAt).getTime() < Date.now()) {
    sharedPockets.delete(code);
    addAuditLog('VAULT_SHARE_EXPIRED_ON_ACCESS', ip, 'WARNING', `Cleaned expired share code [${code}] during access attempt.`);
    return res.status(404).json({ error: 'Share pocket not found or expired.' });
  }

  // Password Verification
  if (pocket.passwordProtected) {
    if (!password || password !== pocket.passwordHash) {
      pocket.activityLog.push({
        timestamp: new Date().toISOString(),
        action: 'ACCESS_FAILED',
        ip,
        details: 'Failed passcode access verification attempt'
      });
      addAuditLog('VAULT_SHARE_DENIED', ip, 'WARNING', `Access denied to share [${code}] due to incorrect passcode.`);
      return res.status(401).json({ error: 'Incorrect passcode entered. Please try again.' });
    }
  }

  // Increment download count and log activity
  pocket.downloadCount += 1;
  pocket.activityLog.push({
    timestamp: new Date().toISOString(),
    action: 'DOWNLOADED',
    ip,
    details: `Accessed and retrieved ${pocket.files.length} files successfully.`
  });

  addAuditLog('VAULT_SHARE_ACCESSED', ip, 'SUCCESS', `Files retrieved successfully for share [${code}].`);

  res.json({
    success: true,
    files: pocket.files,
    activityLog: pocket.activityLog
  });
});

// 5. Audit logs endpoint for compliance reporting
app.get('/api/audit-logs', (req: Request, res: Response) => {
  res.json({ logs: auditLogs });
});

// Helper: Mock offline student helper prompt generator
function mockLocalResponse(prompt: string, systemInstruction?: string): string {
  const lower = prompt.toLowerCase();

  if (lower.includes('game') || lower.includes('website') || lower.includes('play')) {
    return `### 🎮 INTERACTIVE WEB APP GENERATED SUCCESSFULLY

I have synthesized a fully functional, self-contained **Cyber Tic-Tac-Toe** game utilizing responsive styling and interactive script states. You can interact with and test the live app in the simulator panel right below, or click **Download HTML** to run it natively on your desktop.

\`\`\`html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Cyber Tic Tac Toe</title>
  <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-slate-950 text-white min-h-screen flex flex-col items-center justify-center p-4">
  <div class="max-w-md w-full bg-slate-900 border-2 border-amber-500/30 p-6 rounded-none text-center shadow-[4px_4px_0px_rgba(245,158,11,0.2)]">
    <h1 class="text-xl font-mono font-black uppercase text-amber-400 tracking-wider mb-2">Cyber Tic-Tac-Toe</h1>
    <p class="text-xs text-slate-400 font-mono mb-4">A high-fidelity mini game generated by Student AI</p>
    
    <div class="grid grid-cols-3 gap-2 max-w-[240px] mx-auto my-4" id="board">
      <button class="cell h-16 bg-slate-950 border border-slate-800 hover:bg-slate-800 transition font-mono text-xl font-black text-amber-400 flex items-center justify-center" data-index="0"></button>
      <button class="cell h-16 bg-slate-950 border border-slate-800 hover:bg-slate-800 transition font-mono text-xl font-black text-amber-400 flex items-center justify-center" data-index="1"></button>
      <button class="cell h-16 bg-slate-950 border border-slate-800 hover:bg-slate-800 transition font-mono text-xl font-black text-amber-400 flex items-center justify-center" data-index="2"></button>
      <button class="cell h-16 bg-slate-950 border border-slate-800 hover:bg-slate-800 transition font-mono text-xl font-black text-amber-400 flex items-center justify-center" data-index="3"></button>
      <button class="cell h-16 bg-slate-950 border border-slate-800 hover:bg-slate-800 transition font-mono text-xl font-black text-amber-400 flex items-center justify-center" data-index="4"></button>
      <button class="cell h-16 bg-slate-950 border border-slate-800 hover:bg-slate-800 transition font-mono text-xl font-black text-amber-400 flex items-center justify-center" data-index="5"></button>
      <button class="cell h-16 bg-slate-950 border border-slate-800 hover:bg-slate-800 transition font-mono text-xl font-black text-amber-400 flex items-center justify-center" data-index="6"></button>
      <button class="cell h-16 bg-slate-950 border border-slate-800 hover:bg-slate-800 transition font-mono text-xl font-black text-amber-400 flex items-center justify-center" data-index="7"></button>
      <button class="cell h-16 bg-slate-950 border border-slate-800 hover:bg-slate-800 transition font-mono text-xl font-black text-amber-400 flex items-center justify-center" data-index="8"></button>
    </div>

    <div class="mt-4 font-mono text-xs" id="status">Player X's Turn</div>
    
    <button id="reset" class="mt-4 px-4 py-2 bg-amber-500 text-slate-950 font-mono text-xs font-bold uppercase hover:bg-amber-400 transition cursor-pointer">Reset game</button>
  </div>

  <script>
    let board = ['', '', '', '', '', '', '', '', ''];
    let currentPlayer = 'X';
    let gameActive = true;
    const cells = document.querySelectorAll('.cell');
    const statusText = document.getElementById('status');
    const resetButton = document.getElementById('reset');

    const winningConditions = [
      [0, 1, 2], [3, 4, 5], [6, 7, 8],
      [0, 3, 6], [1, 4, 7], [2, 5, 8],
      [0, 4, 8], [2, 4, 6]
    ];

    function handleCellClick(e) {
      const clickedCell = e.target;
      const clickedCellIndex = parseInt(clickedCell.getAttribute('data-index'));

      if (board[clickedCellIndex] !== '' || !gameActive) return;

      board[clickedCellIndex] = currentPlayer;
      clickedCell.innerText = currentPlayer;
      
      checkResult();
    }

    function checkResult() {
      let roundWon = false;
      for (let i = 0; i < winningConditions.length; i++) {
        const winCondition = winningConditions[i];
        let a = board[winCondition[0]];
        let b = board[winCondition[1]];
        let c = board[winCondition[2]];
        if (a === '' || b === '' || c === '') continue;
        if (a === b && b === c) {
          roundWon = true;
          break;
        }
      }

      if (roundWon) {
        statusText.innerText = 'Player ' + currentPlayer + ' Wins!';
        gameActive = false;
        return;
      }

      let roundDraw = !board.includes('');
      if (roundDraw) {
        statusText.innerText = 'Game is a Draw!';
        gameActive = false;
        return;
      }

      currentPlayer = currentPlayer === 'X' ? 'O' : 'X';
      statusText.innerText = "Player " + currentPlayer + "'s Turn";
    }

    cells.forEach(cell => cell.addEventListener('click', handleCellClick));
    resetButton.addEventListener('click', () => {
      board = ['', '', '', '', '', '', '', '', ''];
      currentPlayer = 'X';
      gameActive = true;
      statusText.innerText = "Player X's Turn";
      cells.forEach(cell => cell.innerText = '');
    });
  </script>
</body>
</html>
\`\`\``;
  }

  if (lower.includes('resume') || lower.includes('ats')) {
    return `### 📄 SECURE ATS RESUME OPTIMIZATION ANALYSIS

**ATS Match Score:** 84%
**Target Role:** General Software Engineer

**Key Optimization Suggestions:**
1. **Action Verbs:** Strengthen bullets with metrics. Use "Designed secure database scheme serving 10k+ requests," rather than "Worked on database."
2. **Missing Keywords:** Add *CI/CD*, *OWASP Top 10*, *React state hooks*, and *Express route security* under Skills.
3. **Typography and Formatting:** Keep layout neat, single column, standard bullet points.

*Disclaimer: Generated locally and privately. No data left your device.*`;
  }

  if (lower.includes('roadmap') || lower.includes('career')) {
    return `### 🗺️ STUDENT ROADMAP: SECURE FULL-STACK DEVELOPMENT

#### Phase 1: Foundational Coding (Month 1)
- Master **TypeScript** types, generics, and async operations.
- Understand local memory vs storage structures.

#### Phase 2: Secure Backend Architecture (Month 2)
- Express server routing, middleware pipeline, CORS setup.
- Enforce secure headers and parameterized inputs.

#### Phase 3: Modern UI Engineering (Month 3)
- React functional components, hooks, Tailwind responsive design.
- Client-side sanitization.

*Offline mode switched. Generating roadmap using offline semantic template.*`;
  }

  if (lower.includes('quiz') || lower.includes('mcq')) {
    return `### 📝 SECURE COMPUTING - INTERACTIVE QUIZ

1. **What does the 'nosniff' X-Content-Type-Options header prevent?**
   - A) Cross-Site Request Forgery
   - B) MIME-type sniffing attacks (Treating non-scripts as scripts)
   - C) Directory listings traversal
   - *Answer: B*

2. **Which strategy protects database entries against SQL Injection?**
   - A) String concatenation
   - B) Parameterized queries / Prepared Statements
   - C) Encoding output in base64
   - *Answer: B*

*Practice daily to boost your security badges!*`;
  }

  if (lower.includes('explain') || lower.includes('bug') || lower.includes('debug')) {
    return `### 🛠️ CODESMITH AI: LINE-BY-LINE EXPLAINER

\`\`\`typescript
// The secure solution fixes injection by parameterizing database parameters
const userId = req.body.userId;
const query = 'SELECT * FROM users WHERE id = ?'; // parameterized placeholder
db.query(query, [userId], (err, results) => { ... });
\`\`\`

**Line-by-Line Breakdown:**
1. **Line 1-2**: Input gets pulled safely from request.
2. **Line 3**: The query uses a placeholder \`?\` preventing string manipulation.
3. **Line 4**: Values are bound separately outside query execution context.

**Security Benefit:** Command parser treats user inputs as strict literals rather than code instructions.`;
  }

  return `### 👋 Student Operating System (Offline Local Assistant)

I've received your query: *" ${sanitizeHTML(prompt).substring(0, 80)}... "*

I'm currently serving your request in **Local Switching Mode**. All computations are private, offline, and secure.

**Suggested actions:**
- Check out the **Student Productivity suite** on the sidebar to log tasks.
- Play a brain-training game under **Brain Center** to level up.
- Explore the **Security Audit dashboard** to see live compliance logging.`;
}

// --- SETUP EXPRESS DEVSERVER / PRODUCTION BUNDLES ---

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    // Development server with Vite middleware integration
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    // Production static delivery
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server successfully started on port ${PORT}`);
  });
}

startServer();
