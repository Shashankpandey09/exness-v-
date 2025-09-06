import express from "express";
import { UserRouter } from "./routes/User";
import { createClient } from "redis";

const app = express();
app.use(express.json());

export const redisClient = createClient();

redisClient.on("connect", () => console.log(" Connected to Redis"));
redisClient.on("error", (err) => console.error(" Redis Client Error:", err));

app.use("/api/v1/user", UserRouter);

async function Express() {
  try {
    await redisClient.connect();

    app.listen(3000, () => {
      console.log(" Server started on port 3000");
    });
  } catch (error) {
    console.error(" Failed to start:", error);
  }
}

Express();
