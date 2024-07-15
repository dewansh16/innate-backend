"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
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
(0, passport_1.initPassport)();
app.use(passport_2.default.initialize());
app.use(passport_2.default.session());
app.use((0, cors_1.default)({
    origin: "http://localhost:3000",
    methods: "GET,POST,PUT,DELETE",
    credentials: true,
}));
app.use("/auth", auth_1.default);
// Route to create and provide session ID
app.get("/session", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const session = yield prisma.session.create({
            data: {},
        });
        res.status(201).json({ sessionId: session.id });
    }
    catch (error) {
        console.error("Error creating session:", error);
        res.status(500).json({ error: "Failed to create session" });
    }
}));
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
app.post("/message", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
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
    let receivedData = Object.assign(Object.assign({}, req.body), { refinedQueries: JSONrefinedQueries, insightModel: JSONinsightModel, data: JSONData, context: JSONContext, suggestedLabels: JSONSuggestedLabels });
    console.log("receivedData = ", receivedData);
    let requestBody;
    try {
        requestBody = schemas_1.WebSocketMessageSchema.parse(receivedData);
        console.log("Request body parsed successfully:", requestBody);
    }
    catch (error) {
        return res.status(400).json({ error: "Invalid request body format" });
    }
    const { sessionId, nextState, selectedComponent, userMessage, agentResponseMessage, insightModelStatus, refinedQueries, insightModel, type, data, context, suggestedLabels, specificityScore, } = requestBody;
    const session = sessionManager.getSession(sessionId);
    if (session && session.clientSocket.readyState === ws_1.WebSocket.OPEN) {
        session.clientSocket.send(JSON.stringify({
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
        }));
        console.log("reqestBody = ", requestBody);
        try {
            yield prisma.message.create({
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
        }
        catch (error) {
            console.error("Error saving message:", error);
            res.status(500).json({ error: "Failed to save message" });
            return;
        }
        res.status(200).json({ message: "Success" });
    }
    else {
        res.sendStatus(404).json({ message: "server error." });
    }
}));
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
