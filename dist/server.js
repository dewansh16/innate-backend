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
const passport_1 = require("./passport");
const dotenv_1 = __importDefault(require("dotenv"));
const express_session_1 = __importDefault(require("express-session"));
const passport_2 = __importDefault(require("passport"));
const auth_1 = __importDefault(require("./router/auth"));
const client_1 = require("@prisma/client");
const cors_1 = __importDefault(require("cors"));
dotenv_1.default.config();
const prisma = new client_1.PrismaClient();
const wss = new ws_1.WebSocketServer({ port: 8080 });
const sessionManager = sessionManager_1.SessionManager.getInstance();
const app = (0, express_1.default)();
app.use(body_parser_1.default.json());
app.use((0, express_session_1.default)({
    secret: process.env.COOKIE_SECRET || "keyboard cat",
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false, maxAge: 24 * 60 * 60 * 1000 },
}));
app.use(passport_2.default.initialize());
app.use(passport_2.default.session());
(0, passport_1.initPassport)();
app.use((0, cors_1.default)({
    origin: "*",
    methods: "GET,POST,PUT,DELETE",
    credentials: true,
}));
app.use("/auth", auth_1.default);
wss.on("connection", function connection(ws, req) {
    //@ts-ignore
    const queryParams = url_1.default.parse(req.url, true).query;
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
app.get("/protected", (req, res) => {
    if (req.isAuthenticated()) {
        res.status(200).json({ message: "This is a protected route" });
    }
    else {
        res.status(401).json({ message: "Unauthorized" });
    }
});
app.listen(8000, () => {
    console.log("HTTP server is running on port 8000");
});
console.log("WebSocket server is running on port 8080");
