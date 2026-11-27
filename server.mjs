import express from 'express';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import { Readable } from 'node:stream';
import { readdir } from 'node:fs/promises';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const app = express();
const ollamaUrl = (process.env.OLLAMA_URL || 'http://127.0.0.1:11434').replace(/\/$/, '');
const ollamaModel = process.env.OLLAMA_MODEL || 'qwen2.5vl:3b';
const datasetRoot = process.env.PLANTVILLAGE_DIR || 'C:/Users/rehan/Downloads/PlantVillage-Dataset-master/raw/color';
const projectRoot = path.dirname(fileURLToPath(import.meta.url));
const pythonPath = process.env.PYTHON_EXECUTABLE || (existsSync(path.join(projectRoot, '.venv', 'Scripts', 'python.exe'))
  ? path.join(projectRoot, '.venv', 'Scripts', 'python.exe') : 'python');
const classifierModel = process.env.PLANTVILLAGE_MODEL || path.join(projectRoot, 'models', 'plantvillage_mobilenet_v3_small.pt');

app.set('trust proxy', 1);

app.use(cors({
  origin: process.env.FRONTEND_ORIGIN || 'https://agri-guard-ai-k41d.onrender.com'
}));

app.use(express.json({ limit: '10mb' }));

app.use('/api', rateLimit({
  windowMs: 60 * 1000,
  limit: 10
}));

app.get('/', (req, res) => {
  res.send('AgriGuard AI Backend is running');
});

app.get('/api/dataset', async (_req, res) => {
  try {
    const folders = await readdir(datasetRoot, { withFileTypes: true });
    const categories = await Promise.all(folders.filter((entry) => entry.isDirectory()).map(async (entry) => {
      const files = await readdir(path.join(datasetRoot, entry.name));
      const [plant, disease] = entry.name.split('___');
      return {
        id: entry.name,
        plant: plant.replaceAll('_', ' ').replaceAll(',', ''),
        disease: (disease || '').replaceAll('_', ' ').trim() || 'Unknown',
        count: files.filter((file) => /\.(jpe?g|png)$/i.test(file)).length,
      };
    }));
    categories.sort((a, b) => a.plant.localeCompare(b.plant) || a.disease.localeCompare(b.disease));
    res.json({ source: 'PlantVillage', categories, totalImages: categories.reduce((sum, item) => sum + item.count, 0) });
  } catch {
    res.status(503).json({ error: 'PlantVillage dataset directory is unavailable.' });
  }
});

app.post('/api/classify', (req, res) => {
  if (!req.body?.image) return res.status(400).json({ error: 'A leaf image is required.' });
  const child = spawn(pythonPath, [path.join(projectRoot, 'predict_plantvillage.py'), classifierModel], {
    cwd: projectRoot,
    windowsHide: true,
    stdio: ['pipe', 'pipe', 'pipe'],
  });
  let stdout = '';
  let stderr = '';
  child.stdout.setEncoding('utf8').on('data', (chunk) => { stdout += chunk; });
  child.stderr.setEncoding('utf8').on('data', (chunk) => { stderr += chunk; });
  child.on('error', () => res.status(503).json({ error: 'Python ML runtime is unavailable. Install the requirements in requirements-ml.txt.' }));
  child.on('close', (code) => {
    if (res.headersSent) return;
    try {
      const result = JSON.parse(stdout.trim());
      if (code !== 0 || result.error) return res.status(503).json({ error: result.error || stderr || 'Classifier failed.' });
      res.json(result);
    } catch {
      res.status(500).json({ error: stderr || 'Could not read classifier output.' });
    }
  });
  child.stdin.end(JSON.stringify({ image: req.body.image }));
});

app.get('/api/health', async (req, res) => {
  try {
    const response = await fetch(`${ollamaUrl}/api/tags`, { signal: AbortSignal.timeout(3000) });
    if (!response.ok) throw new Error(`Ollama returned HTTP ${response.status}`);
    const data = await response.json();
    const installed = (data.models || []).some((item) => item.name === ollamaModel || item.name?.startsWith(`${ollamaModel}:`));
    res.status(installed ? 200 : 503).json({
      ok: installed,
      provider: 'Ollama (local)',
      model: ollamaModel,
      installed,
      message: installed ? 'Local AI is ready.' : `Model ${ollamaModel} is not downloaded yet.`
    });
  } catch {
    res.status(503).json({
      ok: false,
      provider: 'Ollama (local)',
      model: ollamaModel,
      installed: false,
      message: 'Ollama is not responding. Open Ollama and try again.'
    });
  }
});

app.post('/api/chat', async (req, res) => {
  try {
    const response = await fetch(`${ollamaUrl}/v1/chat/completions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: ollamaModel,
        messages: req.body.messages,
        temperature: req.body.temperature ?? 0.7,
        max_tokens: Math.min(req.body.max_tokens || 1800, 4096),
        stream: req.body.stream === true
      }),
      signal: AbortSignal.timeout(180000)
    });

    if (!response.ok) {
      return res.status(response.status).send(
        await response.text()
      );
    }

    if (req.body.stream === true) {
      res.setHeader('Content-Type', 'text/event-stream');
      res.setHeader('Cache-Control', 'no-cache');
      Readable.fromWeb(response.body).pipe(res);
    } else {
      res.json(await response.json());
    }

  } catch (error) {
    res.status(500).json({
      error: 'Local AI request timed out or Ollama is not running. Open Ollama, confirm the model is installed, then retry.'
    });
  }
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});
