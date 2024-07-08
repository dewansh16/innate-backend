"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HttpRequestBodySchema = exports.WebSocketMessageSchema = void 0;
const zod_1 = require("zod");
exports.WebSocketMessageSchema = zod_1.z.object({
    sessionId: zod_1.z.string(),
    nextState: zod_1.z.string().optional(),
    selectedComponent: zod_1.z.string().optional(),
    userMessage: zod_1.z.string().optional(),
    userMessageHistory: zod_1.z.string().optional(),
    agentResponseMessage: zod_1.z.string().optional(),
    insightModelStatus: zod_1.z.string().optional(),
    refinedQueries: zod_1.z.string().optional(),
    insightModel: zod_1.z.string().optional(),
    type: zod_1.z.string().optional(),
    payload: zod_1.z
        .object({
        message: zod_1.z.string().optional(),
    })
        .optional(),
});
exports.HttpRequestBodySchema = zod_1.z.object({
    sessionId: zod_1.z.string(),
    message: zod_1.z.string(),
});
