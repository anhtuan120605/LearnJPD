import { defineConfig, Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import { fetchTranscript } from 'youtube-transcript-plus'

function youtubeTranscriptPlugin(): Plugin {
  return {
    name: 'youtube-transcript-endpoint',
    configureServer(server) {
      server.middlewares.use('/api/youtube-transcript', async (req, res) => {
        try {
          const parsedUrl = new URL(req.url || '', 'http://localhost:5173');
          const videoId = parsedUrl.searchParams.get('id');
          if (!videoId) {
            res.statusCode = 400;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ error: 'Missing videoId' }));
            return;
          }

          console.log(`[YouTube Subtitle] Fetching transcript for: ${videoId}`);
          const transcript = await fetchTranscript(videoId);
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ success: true, transcript }));
        } catch (err: any) {
          console.error(`[YouTube Subtitle] Error fetching transcript:`, err.message);
          res.statusCode = 200; // Trả về 200 kèm success: false để client fallback
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ success: false, error: err.message || 'No subtitles available' }));
        }
      });
    }
  };
}

function japaneseTtsPlugin(): Plugin {
  return {
    name: 'japanese-tts-endpoint',
    configureServer(server) {
      server.middlewares.use('/api/tts', async (req, res) => {
        try {
          const parsedUrl = new URL(req.url || '', 'http://localhost:5173');
          const text = parsedUrl.searchParams.get('q');
          const lang = parsedUrl.searchParams.get('tl') || 'ja';
          if (!text) {
            res.statusCode = 400;
            res.setHeader('Content-Type', 'text/plain; charset=utf-8');
            res.end('Missing text query param q');
            return;
          }

          const targetUrl = `https://translate.googleapis.com/translate_tts?client=gtx&tl=${lang}&q=${encodeURIComponent(text)}`;
          const response = await fetch(targetUrl, {
            headers: {
              'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36'
            }
          });

          if (!response.ok) {
            res.statusCode = response.status;
            res.setHeader('Content-Type', 'text/plain; charset=utf-8');
            res.end('TTS fetch failed');
            return;
          }

          res.setHeader('Content-Type', 'audio/mpeg');
          res.setHeader('Cache-Control', 'public, max-age=86400');
          res.setHeader('Access-Control-Allow-Origin', '*');
          const arrayBuffer = await response.arrayBuffer();
          res.end(Buffer.from(arrayBuffer));
        } catch (err: any) {
          console.error('[TTS Proxy] Error:', err?.message);
          res.statusCode = 500;
          res.setHeader('Content-Type', 'text/plain; charset=utf-8');
          res.end('Internal Server Error');
        }
      });
    }
  };
}

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), youtubeTranscriptPlugin(), japaneseTtsPlugin()],
  server: {
    port: 5173,
    host: true
  }
})

