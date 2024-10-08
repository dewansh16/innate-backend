import { WebSocket } from "ws";
import axios from "axios";
import { WebSocketMessageSchema } from "./validations/schemas";
import { PrismaClient } from "@prisma/client";

const Prisma = new PrismaClient();

export class Session {
  public id: string;
  public clientSocket: WebSocket;

  constructor(clientSocket: WebSocket, sessionId: string) {
    this.id = sessionId; // Use the provided sessionId
    this.clientSocket = clientSocket;

    this.clientSocket.on("message", async (data) => {
      const message = data.toString();
      console.log(`Received message from client: ${message}`);

      let parsedMessage;

      try {
        parsedMessage = WebSocketMessageSchema.parse(JSON.parse(message));
      } catch (error) {
        console.error("Invalid message format:", error);
        this.clientSocket.send(
          JSON.stringify({
            type: "ERROR",
            agentResponseMessage: "Invalid message format",
          })
        );
        return;
      }

      if (parsedMessage.type === "QUESTION") {
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
        } = parsedMessage;

        try {
          // Save message to database using Prisma
          await Prisma.message.create({
            data: {
              senderType: "client",
              sessionId: this.id,
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
            },
          });

          await axios.post("http://localhost:9090/process", {
            sessionId: this.id,
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
          });
        } catch (error) {
          console.error(
            `Error sending message to LLM or saving to database: ${error}`
          );
        }
      }
    });

    this.clientSocket.on("close", () => {
      console.log(`Client WebSocket closed for session ${this.id}`);
    });

    this.clientSocket.on("error", (error) => {
      console.error(`Client WebSocket error for session ${this.id}:`, error);
    });
  }

  private createPrompt(message: string): string {
    return `Process this prompt: ${message}`;
  }
}

export class SessionManager {
  private static instance: SessionManager;
  private sessions: Map<string, Session>;

  private constructor() {
    this.sessions = new Map<string, Session>();
  }

  public static getInstance(): SessionManager {
    if (!SessionManager.instance) {
      SessionManager.instance = new SessionManager();
    }
    return SessionManager.instance;
  }

  addSession(clientSocket: WebSocket, sessionId: string) {
    const session = new Session(clientSocket, sessionId);
    this.sessions.set(sessionId, session);
  }

  removeSession(sessionId: string) {
    const session = this.sessions.get(sessionId);
    if (session) {
      if (session.clientSocket.readyState === WebSocket.OPEN) {
        session.clientSocket.close();
      }

      this.sessions.delete(sessionId);
      console.log(`Session ${sessionId} removed`);
    }
    console.log("sessions map = ", this.sessions);
  }

  public getSession(sessionId: string): Session | undefined {
    return this.sessions.get(sessionId);
  }
}
