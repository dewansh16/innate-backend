"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LLMAgent = void 0;
class LLMAgent {
    constructor(socket) {
        this.socket = socket;
    }
    sendMessage(message) {
        this.socket.send(message);
    }
}
exports.LLMAgent = LLMAgent;
