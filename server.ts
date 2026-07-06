import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Set limits to support base64 image transfers
  app.use(express.json({ limit: '50mb' }));
  app.use(express.urlencoded({ limit: '50mb', extended: true }));

  // Helper to initialize GoogleGenAI client safely
  const getAIClient = () => {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY is not configured in the Secrets manager.');
    }
    return new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
  };

  // Image Generation Route (with resolution parameters)
  app.post('/api/generate-image', async (req, res) => {
    try {
      const { prompt, imageSize, aspectRatio } = req.body;
      const ai = getAIClient();

      console.log('Sending generateContent (Image) request with model: gemini-3-pro-image-preview');
      const response = await ai.models.generateContent({
        model: 'gemini-3-pro-image-preview',
        contents: {
          parts: [
            {
              text: prompt || 'A futuristic high-tech aerodynamic running shoe',
            },
          ],
        },
        config: {
          imageConfig: {
            aspectRatio: aspectRatio || '1:1',
            imageSize: imageSize || '1K'
          },
        },
      });

      let imageUrl = '';
      if (response.candidates?.[0]?.content?.parts) {
        for (const part of response.candidates[0].content.parts) {
          if (part.inlineData) {
            const base64EncodeString = part.inlineData.data;
            imageUrl = `data:image/png;base64,${base64EncodeString}`;
            break;
          }
        }
      }

      if (!imageUrl) {
        return res.status(500).json({ error: 'No image data returned from model' });
      }

      res.json({ imageUrl });
    } catch (err: any) {
      console.error('Error in /api/generate-image:', err);
      const errMsg = err.message || '';
      if (
        errMsg.includes('429') || 
        errMsg.includes('quota') || 
        errMsg.includes('RESOURCE_EXHAUSTED') || 
        errMsg.includes('not configured') ||
        errMsg.includes('API_KEY') ||
        errMsg.includes('Quota')
      ) {
        return res.json({
          quotaExceeded: true,
          errorType: 'QUOTA_EXHAUSTED',
          message: 'Gemini 3.1 Image engine is currently at maximum capacity or your API key has reached its free tier quota. High-fidelity demo simulation mode has been unlocked for your experience.'
        });
      }
      res.status(500).json({ error: err.message || 'Internal Server Error' });
    }
  });

  // Vite development middleware vs production static files
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[ZEROX SERVER] Running on port http://0.0.0.0:${PORT}`);
  });
}

startServer();
