import { WebSocketServer, WebSocket } from "ws";
import { SessionManager } from "./sessionManager";
import url from "url";
import express from "express";
import bodyParser from "body-parser";
import { WebSocketMessageSchema } from "./validations/schemas";
import { initPassport } from "./passport";
import dotenv from "dotenv";
import session from "express-session";
import passport from "passport";
import authRoute from "./router/auth";
import { PrismaClient } from "@prisma/client";
import cors from "cors";

dotenv.config();
const prisma = new PrismaClient();

const wss = new WebSocketServer({ port: 8080 });
const sessionManager = SessionManager.getInstance();
const app = express();

app.use(bodyParser.json());
app.use(
  session({
    secret: process.env.COOKIE_SECRET || "keyboard cat",
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false, maxAge: 24 * 60 * 60 * 1000 },
  })
);

initPassport();
app.use(passport.initialize());
app.use(passport.session());

app.use(
  cors({
    origin: "http://localhost:3000",
    methods: "GET,POST,PUT,DELETE",
    credentials: true,
  })
);

app.use("/auth", authRoute);

// Route to create and provide session ID
app.get("/session", async (req, res) => {
  try {
    const session = await prisma.session.create({
      data: {},
    });
    res.status(201).json({ sessionId: session.id });
  } catch (error) {
    console.error("Error creating session:", error);
    res.status(500).json({ error: "Failed to create session" });
  }
});

wss.on("connection", function connection(ws, req) {
  //@ts-ignore
  const queryParams = url.parse(req.url, true).query;
  const sessionId = queryParams.sessionId as string;

  ws.on("error", (error) => {
    console.error(`WebSocket error for session ${sessionId}:`, error);
  });

  ws.on("close", () => {
    sessionManager.removeSession(sessionId);
  });

  sessionManager.addSession(ws, sessionId);
});

app.post("/message", async (req, res) => {
  console.log("req.body = ", req.body);
  let JSONrefinedQueries = JSON.stringify(req.body.refinedQueries);
  // console.log("JSONrefinedQueries = ", JSONrefinedQueries);
  let JSONinsightModel = JSON.stringify(req.body.insightModel);
  // console.log("JSONinsightModel = ", JSONinsightModel);
  let JSONData = JSON.stringify(req.body.data);
  // console.log("JSONData = ", JSONData);
  let JSONContext = JSON.stringify(req.body.context);
  // console.log("JSONContext = ", JSONContext);
  let JSONSuggestedLabels = JSON.stringify(req.body.suggestedLabels);
  // console.log("JSONSuggestedLabels = ", JSONSuggestedLabels);
  let receivedData = {
    ...req.body,
    refinedQueries: JSONrefinedQueries,
    insightModel: JSONinsightModel,
    data: JSONData,
    context: JSONContext,
    suggestedLabels: JSONSuggestedLabels,
  };
  console.log("receivedData = ", receivedData);
  let requestBody;
  try {
    requestBody = WebSocketMessageSchema.parse(receivedData);
    console.log("Request body parsed successfully:", requestBody);
  } catch (error) {
    return res.status(400).json({ error: "Invalid request body format" });
  }

  const {
    sessionId,
    nextState,
    selectedComponent,
    userMessage,
    agentResponseMessage,
    insightModelStatus,
    refinedQueries,
    insightModel,
    type,
    data,
    context,
    suggestedLabels,
    specificityScore,
  } = requestBody;

  const session = sessionManager.getSession(sessionId);
  if (session && session.clientSocket.readyState === WebSocket.OPEN) {
    session.clientSocket.send(
      JSON.stringify({
        sessionId,
        nextState: nextState || " ",
        selectedComponent: selectedComponent || "",
        userMessage: userMessage || "",
        agentResponseMessage: agentResponseMessage || "",
        insightModelStatus: insightModelStatus || "",
        refinedQueries: refinedQueries || "",
        insightModel: insightModel || "",
        type: type || "ANSWER",
        data: data || "",
        context: context || "",
        suggestedLabels: suggestedLabels || "",
        specificityScore: specificityScore || "",
      })
    );

    console.log("reqestBody = ", requestBody);

    try {
      await prisma.message.create({
        data: {
          senderType: "agent",
          sessionId,
          nextState: nextState || " ",
          selectedComponent: selectedComponent || "",
          userMessage: userMessage || "",
          agentResponseMessage: agentResponseMessage || "",
          insightModelStatus: insightModelStatus || "",
          refinedQueries: refinedQueries || "",
          insightModel: insightModel || "",
          type: type || "ANSWER",
          data: data || "",
          context: context || "",
          suggestedLabels: suggestedLabels || "",
          specificityScore: specificityScore || "",
        },
      });
    } catch (error) {
      console.error("Error saving message:", error);
      res.status(500).json({ error: "Failed to save message" });
      return;
    }

    res.status(200).json({ message: "Success" });
  } else {
    res.sendStatus(404).json({ message: "server error." });
  }
});

app.get("/protected", (req, res) => {
  if (req.isAuthenticated()) {
    res.status(200).json({ message: "This is a protected route" });
  } else {
    res.status(401).json({ message: "Unauthorized" });
  }
});

app.listen(8000, () => {
  console.log("HTTP server is running on port 8000");
});

console.log("WebSocket server is running on port 8080");
