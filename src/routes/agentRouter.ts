import { runProductAgent } from "@/agent/03_agent";
import { appendToHistory, ensureThreadId, getHistory } from "@/agent/04_memory";
import { Router, Request, Response } from "express";

export const agentRouter = Router();

// Define a type for incoming request body
interface ChatRequestBody {
  message: string;
  threadId?: string;
}

agentRouter.post("/chat", async (req: Request, res: Response) => {
  try {
    const { message, threadId: incomingThreadId } = req.body as ChatRequestBody;

    // 1. Validation (Using string trim)
    if (!message || !message.trim()) {
      return res.status(400).json({
        ok: false,
        message: 'Message is required and cannot be empty.'
      });
    }

    // 2. Thread and History Management
    const threadId = await ensureThreadId(incomingThreadId);
    const history = await getHistory(threadId);

    const userMsg = {
      role: 'user' as const,
      content: message.trim()
    };

    // Append to database memory
    await appendToHistory(threadId, userMsg);

    // Combine history safely using array spread
    const messagesForAgent = [...history, userMsg];

    // 3. AI Agent Execution
    const { answer, citations } = await runProductAgent(messagesForAgent);

    const assistantMsg = {
      role: 'assistant' as const,
      content: answer
    };

    // Append AI response to database memory
    await appendToHistory(threadId, assistantMsg);

    // 4. Successful Response
    return res.status(200).json({
      ok: true,
      threadId,
      answer,
      citations
    });

  } catch (err) {
    // Safely extract message string so it doesn't serialize to an empty object {}
    const errorMessage = err instanceof Error ? err.message : String(err);
    
    return res.status(500).json({
      ok: false,
      error: 'InternalServerError',
      message: errorMessage
    });
  }
});