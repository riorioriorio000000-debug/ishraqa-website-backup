import express from "express";
import { createServer } from "http";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function getHealthTimestamp(input: unknown) {
  if (typeof input !== "string") return Date.now();
  try {
    const parsed = JSON.parse(input) as { json?: { timestamp?: unknown } };
    const timestamp = parsed.json?.timestamp;
    return typeof timestamp === "number" ? timestamp : Date.now();
  } catch {
    return Date.now();
  }
}

export function createApp() {
  const app = express();

  // The managed runtime checks this tRPC-compatible endpoint before it routes
  // traffic to a new replica. Keep it independent of static asset availability.
  app.get("/api/trpc/system.health", (req, res) => {
    res.status(200).json({
      result: {
        data: {
          json: {
            status: "ok",
            timestamp: getHealthTimestamp(req.query.input),
          },
        },
      },
    });
  });

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

  return app;
}

export async function startServer() {
  const app = createApp();
  const server = createServer(app);

  const port = process.env.PORT || 3000;

  server.listen(port, () => {
    console.log(`Server running on http://localhost:${port}/`);
  });
}

if (process.env.VITEST !== "true") {
  startServer().catch(console.error);
}
