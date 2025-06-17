/** @format */
import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "../server/routes";
import { serveStatic, log } from "../server/vite";

const app = express();

// Force production mode pour Vercel
process.env.NODE_ENV = "production";

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Votre middleware de logging...
app.use((req, res, next) => {
  // ... votre code existant
  next();
});

// Configuration async
(async () => {
  await registerRoutes(app);

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    res.status(status).json({ message });
  });

  serveStatic(app);
})();

export default app;
