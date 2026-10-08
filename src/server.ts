import express from "express";

const app = express();

app.use(express.json());

const version = process.env.APP_VERSION ?? "local";
const environment = process.env.NODE_ENV ?? "development";

app.get("/health", (_req, res) => {
  res.status(200).json({
    status: "healthy"
  });
});

app.get("/version", (_req, res) => {
  res.status(200).json({
    version,
    environment
  });
});

const port = Number(process.env.PORT ?? 3000);

if (process.env.NODE_ENV !== "test") {
  app.listen(port, () => {
    console.log(`API listening on port ${port}`);
  });
}

export default app;
