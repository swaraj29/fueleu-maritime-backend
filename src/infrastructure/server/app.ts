import express from "express";
import router from "@adapters/inbound/http/routes";

const app = express();

// Middlewares
app.use(express.json());

// Routes
app.use(router);

// Basic health check
app.get("/health", (_, res) => {
  res.json({ status: "OK" });
});

// Global error handler (basic version)
app.use((err: any, _: any, res: any, __: any) => {
  console.error(err);
  res.status(500).json({
    message: err.message || "Internal Server Error"
  });
});

export default app;