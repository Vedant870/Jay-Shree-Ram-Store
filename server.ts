import express from "express";
import { createServer as createViteServer } from "vite";
import type { ViteDevServer } from "vite";
import path from "path";
import type { Server as HttpServer } from "http";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import cors from "cors";
import { connectDB } from "./src/lib/database.js";
import apiRoutes from "./src/routes/api.js";
dotenv.config({ path: '.env.local' });
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

declare global {
  // eslint-disable-next-line no-var
  var __jsrHttpServer__: HttpServer | undefined;
  // eslint-disable-next-line no-var
  var __jsrViteServer__: ViteDevServer | undefined;
}

async function closeExistingDevResources() {
  if (globalThis.__jsrViteServer__) {
    await globalThis.__jsrViteServer__.close();
    globalThis.__jsrViteServer__ = undefined;
  }

  if (globalThis.__jsrHttpServer__) {
    await new Promise<void>((resolve, reject) => {
      globalThis.__jsrHttpServer__?.close((error) => {
        if (error) {
          reject(error);
          return;
        }

        resolve();
      });
    });

    globalThis.__jsrHttpServer__ = undefined;
  }
}

async function startServer() {
  await closeExistingDevResources();

  const app = express();
  const PORT = Number(process.env.PORT) || 3000;

  // Connect to database (non-blocking)
  connectDB().catch(() => {
    console.log('💡 Tip: Fix MongoDB connection to enable persistent data storage');
  });

  // Middleware
  app.use(cors());
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true }));

  // API Routes
  app.use('/api', apiRoutes);

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    globalThis.__jsrViteServer__ = vite;
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  const server = app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });

  globalThis.__jsrHttpServer__ = server;
}

startServer();
