import { app } from "./app";
import { env } from "./config/env";

const server = app.listen(env.PORT, "0.0.0.0", () => {
  console.log(JSON.stringify({ level: "info", message: "Express API started", port: env.PORT }));
});

server.on("error", (error: NodeJS.ErrnoException) => {
  if (error.code === "EADDRINUSE") {
    console.error(JSON.stringify({
      level: "error",
      message: `Port ${env.PORT} is already in use`,
      code: "PORT_IN_USE"
    }));
  } else {
    console.error(JSON.stringify({ level: "error", message: error.message, code: "SERVER_ERROR" }));
  }
  process.exit(1);
});
