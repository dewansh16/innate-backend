"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const ws_1 = require("ws");
const sessionManager_1 = require("./sessionManager");
const url_1 = __importDefault(require("url"));
const express_1 = __importDefault(require("express"));
const body_parser_1 = __importDefault(require("body-parser"));
const schemas_1 = require("./validations/schemas");
const wss = new ws_1.WebSocketServer({ port: 8080 });
const sessionManager = sessionManager_1.SessionManager.getInstance();
const app = (0, express_1.default)();
app.use(body_parser_1.default.json());
wss.on("connection", function connection(ws, req) {
    //@ts-ignore
    const queryParams = url_1.default.parse(req.url, true).query;
    console.log("queryParams = ", queryParams);
    const sessionId = queryParams.sessionId;
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
        requestBody = schemas_1.HttpRequestBodySchema.parse(req.body);
    }
    catch (error) {
        return res.status(400).json({ error: "Invalid request body format" });
    }
    const { sessionId, message } = requestBody;
    const session = sessionManager.getSession(sessionId);
    if (session && session.clientSocket.readyState === ws_1.WebSocket.OPEN) {
        session.clientSocket.send(JSON.stringify({ type: "ANSWER", payload: { message } }));
        res.sendStatus(200);
    }
    else {
        res.sendStatus(404);
    }
});
app.listen(8000, () => {
    console.log("HTTP server is running on port 8000");
});
console.log("WebSocket server is running on port 8080");
