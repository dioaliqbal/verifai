import express from 'express';
import path from 'path';
import dotenv from 'dotenv';
import { analyzeImageForensics } from './server/detectorService.ts';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json({ limit: '25mb' }));

app.post('/api/analyze', async (req, res) => {
  try {
    const { base64Data, mimeType } = req.body;
    if (!base64Data) {
      return res.status(400).json({ error: 'base64Data is required' });
    }
    const result = await analyzeImageForensics(base64Data, mimeType || 'image/jpeg');
    return res.status(200).json(result);
  } catch (error: any) {
    console.error('API /api/analyze error:', error);
    return res.status(500).json({ error: error?.message || 'Internal server error during detection' });
  }
});

// Serve frontend build if present
const distPath = path.resolve(process.cwd(), 'dist');
app.use(express.static(distPath));

app.get('*', (req, res) => {
  res.sendFile(path.join(distPath, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
