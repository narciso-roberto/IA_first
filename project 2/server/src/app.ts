import express from "express";
import { healthStatus } from "./health.js";

const app = express();

app.use(express.json());

app.get("/api/health", (_request, response) => {
  response.status(200).json(healthStatus());
});

export default app;
