import express from "express";
import { SERVER_PORT } from "./config";

const app = express();

app.listen(SERVER_PORT, () => {
  console.log(`Server ready at port ${SERVER_PORT}`);
});
