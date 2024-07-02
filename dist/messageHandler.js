"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MessageHandler = void 0;
class MessageHandler {
    static handleClientMessage(session, message) {
        const messageStr = message.toString();
        const parsedMessage = JSON.parse(messageStr);
        console.log(`Received message from client: ${messageStr}`);
        if (parsedMessage.type === "QUESTION") {
            const prompt = this.createPrompt(parsedMessage.payload.message);
            session.llmSocket.send(JSON.stringify({ type: "PROMPT", payload: { message: prompt } }));
        }
    }
    static handleLLMMessage(session, message) {
        const messageStr = message.toString();
        const parsedMessage = JSON.parse(messageStr);
        console.log(`Received message from LLM: ${messageStr}`);
        if (parsedMessage.type === "RESPONSE") {
            session.clientSocket.send(JSON.stringify({
                type: "ANSWER",
                payload: { message: parsedMessage.payload.message },
            }));
        }
    }
    static handleLLMConnection(session) {
        console.log("LLM agent connected");
    }
    static createPrompt(message) {
        return `Process this prompt: ${message}`;
    }
}
exports.MessageHandler = MessageHandler;
