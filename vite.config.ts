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

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), youtubeTranscriptPlugin()],
  server: {
    port: 5173,
    host: true
  }
})

