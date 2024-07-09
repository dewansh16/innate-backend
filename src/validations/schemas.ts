import { z } from "zod";

export const WebSocketMessageSchema = z.object({
  sessionId: z.string(),
  nextState: z.string().optional(),
  selectedComponent: z.string().optional(),
  userMessage: z.string().optional(),
  agentResponseMessage: z.string().optional(),
  insightModelStatus: z.string().optional(),
  refinedQueries: z.string().optional(),
  insightModel: z.string().optional(),
  type: z.string().optional(),
  data: z.string().optional(),
  context: z.string().optional(),
  suggestedLabels: z.string().optional(),
  specificityScore: z.string().optional(),
});

export const HttpRequestBodySchema = z.object({
  sessionId: z.string(),
  message: z.string(),
});
