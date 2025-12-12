import express from "express";
import { createServer } from "http";
import path from "path";
import { fileURLToPath } from "url";
import axios from "axios";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const server = createServer(app);

  app.use(express.json());

  // API Routes
  const apiRouter = express.Router();

  // Fetch config from URL
  apiRouter.get("/config/fetch", async (req, res) => {
    try {
      const { url } = req.query;
      
      if (!url || typeof url !== 'string') {
        return res.status(400).json({ error: "URL is required" });
      }

      let configUrl = url;
      
      // Handle ModelScope/HuggingFace URLs
      if (configUrl.includes('modelscope.cn/models/')) {
        if (!configUrl.endsWith('config.json')) {
          configUrl = configUrl.replace(/\/$/, '') + '/resolve/master/config.json';
        }
      } else if (configUrl.includes('huggingface.co/')) {
        if (!configUrl.endsWith('config.json')) {
          configUrl = configUrl.replace(/\/$/, '') + '/resolve/main/config.json';
        }
      }

      console.log(`Fetching config from: ${configUrl}`);
      
      const response = await axios.get(configUrl, {
        timeout: 10000,
        headers: {
          'User-Agent': 'LLM-VRAM-Estimator/1.0'
        }
      });

      res.json(response.data);
    } catch (error: any) {
      console.error("Error fetching config:", error.message);
      res.status(500).json({ 
        error: "Failed to fetch config", 
        details: error.message 
      });
    }
  });

  app.use("/api", apiRouter);

  // Serve static files from dist/public in production
  const staticPath =
    process.env.NODE_ENV === "production"
      ? path.resolve(__dirname, "public")
      : path.resolve(__dirname, "..", "dist", "public");

  app.use(express.static(staticPath));

  // Handle client-side routing - serve index.html for all routes
  app.get("*", (_req, res) => {
    res.sendFile(path.join(staticPath, "index.html"));
  });

  const port = process.env.PORT || 3000;

  server.listen(port, () => {
    console.log(`Server running on http://localhost:${port}/`);
  });
}

startServer().catch(console.error);
