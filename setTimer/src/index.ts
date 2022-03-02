import express from "express";
import mongoose from "mongoose";
import { json } from "body-parser";
import { timerRouter } from "./routes/timer";
import { checkMissingWebhooks } from "./utils/utils";

const app = express();
app.use(json());
app.use(timerRouter);

async function connect() {
  await mongoose
    .connect("mongodb://localhost:27017/timer", {})
    .catch((err) => console.log(err.reason));
}

// Connect to database
// Confirm mongoose connection
/*
  0: disconnected
  1: connected
  2: connecting
  3: disconnecting
*/
connect();
console.log("Connect status:");
console.log(mongoose.connection.readyState);

app.listen(3000, () => {
  console.log("Server is listening on port 3000");
  // Check if there's any webhook not triggered due to
  // failures
  checkMissingWebhooks();
});
