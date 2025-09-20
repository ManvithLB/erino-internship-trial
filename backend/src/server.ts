import { createServer } from "http";
import app from "./app.js";

const PORT = process.env.PORT ? Number(process.env.PORT) : 4000;

const server = createServer(app);

server.listen(PORT, () => {
  console.log(`API listening on port ${PORT}`);
});
