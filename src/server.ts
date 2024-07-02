import { WebSocketServer, WebSocket } from "ws";
import { SessionManager } from "./sessionManager";
import url from "url";
import express from "express";
import bodyParser from "body-parser";
import { HttpRequestBodySchema } from "./validations/schemas";
import { initPassport } from "./passport";
import dotenv from "dotenv";
import session from "express-session";
import passport from "passport";
import authRoute from "./router/auth";

const wss = new WebSocketServer({ port: 8080 });
const sessionManager = SessionManager.getInstance();
const app = express();
app.use(bodyParser.json());

app.use("/auth", authRoute);

wss.on("connection", function connection(ws, req) {
  //@ts-ignore
  const queryParams = url.parse(req.url, true).query;
  console.log("queryParams = ", queryParams);
  const sessionId = queryParams.sessionId as string;

  ws.on("error", (error) => {
    console.error(`WebSocket error for session ${sessionId}:`, error);
  });

  ws.on("close", () => {
    sessionManager.removeSession(sessionId);
  });

  sessionManager.addSession(ws, sessionId);
});

app.post("/message", (req, res) => {
  let requestBody;
  try {
    requestBody = HttpRequestBodySchema.parse(req.body);
  } catch (error) {
    return res.status(400).json({ error: "Invalid request body format" });
  }

  const { sessionId, message } = requestBody;
  const session = sessionManager.getSession(sessionId);
  if (session && session.clientSocket.readyState === WebSocket.OPEN) {
    session.clientSocket.send(
      JSON.stringify({ type: "ANSWER", payload: { message } })
    );
    res.sendStatus(200);
  } else {
    res.sendStatus(404);
  }
});

app.listen(8000, () => {
  console.log("HTTP server is running on port 8000");
});

console.log("WebSocket server is running on port 8080");
