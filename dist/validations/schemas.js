"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HttpRequestBodySchema = exports.WebSocketMessageSchema = void 0;
const zod_1 = require("zod");
exports.WebSocketMessageSchema = zod_1.z.object({
    type: zod_1.z.enum(["QUESTION"]),
    payload: zod_1.z.object({
        message: zod_1.z.string(),
    }),
});
exports.HttpRequestBodySchema = zod_1.z.object({
    sessionId: zod_1.z.string(),
    message: zod_1.z.string(),
});
