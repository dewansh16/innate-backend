import { z } from "zod";

export const WebSocketMessageSchema = z.object({
  type: z.enum(["QUESTION"]),
  payload: z.object({
    message: z.string(),
  }),
});

export const HttpRequestBodySchema = z.object({
  sessionId: z.string(),
  message: z.string(),
});
