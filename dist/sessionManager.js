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
exports.SessionManager = exports.Session = void 0;
const ws_1 = require("ws");
const axios_1 = __importDefault(require("axios"));
const schemas_1 = require("./validations/schemas");
const client_1 = require("@prisma/client");
const Prisma = new client_1.PrismaClient();
class Session {
    constructor(clientSocket, sessionId) {
        this.id = sessionId; // Use the provided sessionId
        this.clientSocket = clientSocket;
        this.clientSocket.on("message", (data) => __awaiter(this, void 0, void 0, function* () {
            var _a;
            const message = data.toString();
            console.log(`Received message from client: ${message}`);
            let parsedMessage;
            try {
                parsedMessage = schemas_1.WebSocketMessageSchema.parse(JSON.parse(message));
            }
            catch (error) {
                console.error("Invalid message format:", error);
                this.clientSocket.send(JSON.stringify({
                    type: "ERROR",
                    payload: { message: "Invalid message format" },
                }));
                return;
            }
            if (parsedMessage.type === "QUESTION") {
                const prompt = JSON.stringify((_a = parsedMessage.payload) === null || _a === void 0 ? void 0 : _a.message);
                const { sessionId, nextState, selectedComponent, userMessage, userMessageHistory, agentResponseMessage, insightModelStatus, refinedQueries, insightModel, type, payload, } = parsedMessage;
                try {
                    // Save message to database using Prisma
                    yield Prisma.message.create({
                        data: {
                            senderType: "client",
                            sessionId: this.id,
                            nextState,
                            selectedComponent,
                            userMessage,
                            userMessageHistory,
                            agentResponseMessage,
                            insightModelStatus,
                            refinedQueries,
                            insightModel,
                            type,
                        },
                    });
                    yield axios_1.default.post("http://localhost:9090/process", {
                        sessionId: this.id,
                        nextState,
                        selectedComponent,
                        userMessage,
                        userMessageHistory,
                        agentResponseMessage,
                        insightModelStatus,
                        refinedQueries,
                        insightModel,
                        type,
                    });
                }
                catch (error) {
                    console.error(`Error sending message to LLM or saving to database: ${error}`);
                }
            }
        }));
        this.clientSocket.on("close", () => {
            console.log(`Client WebSocket closed for session ${this.id}`);
        });
        this.clientSocket.on("error", (error) => {
            console.error(`Client WebSocket error for session ${this.id}:`, error);
        });
    }
    createPrompt(message) {
        return `Process this prompt: ${message}`;
    }
}
exports.Session = Session;
class SessionManager {
    constructor() {
        this.sessions = new Map();
    }
    static getInstance() {
        if (!SessionManager.instance) {
            SessionManager.instance = new SessionManager();
        }
        return SessionManager.instance;
    }
    addSession(clientSocket, sessionId) {
        const session = new Session(clientSocket, sessionId);
        this.sessions.set(sessionId, session);
    }
    removeSession(sessionId) {
        const session = this.sessions.get(sessionId);
        if (session) {
            if (session.clientSocket.readyState === ws_1.WebSocket.OPEN) {
                session.clientSocket.close();
            }
            this.sessions.delete(sessionId);
            console.log(`Session ${sessionId} removed`);
        }
        console.log("sessions map = ", this.sessions);
    }
    getSession(sessionId) {
        return this.sessions.get(sessionId);
    }
}
exports.SessionManager = SessionManager;
