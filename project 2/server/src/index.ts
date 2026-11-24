import app from "./app.js";

const port = Number(process.env.PORT ?? 3000);
const server = app.listen(port, () => {
  console.info(`API server listening on port ${port}`);
});

function shutdown(): void {
  server.close((error) => {
    if (error) {
      console.error("Error while closing the API server.");
      process.exitCode = 1;
    }
  });
}

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
