import { Router, type IRouter, type Request, type Response } from "express";
import { openai } from "@workspace/integrations-openai-ai-server";

const router: IRouter = Router();

type ChatMessage = { role: "user" | "assistant"; content: string };

router.post("/maggie/chat", async (req: Request, res: Response) => {
  if (!req.isAuthenticated()) {
    res.status(401).json({ error: "Please log in before chatting with Maggie." });
    return;
  }

  const incoming = Array.isArray(req.body?.messages) ? req.body.messages : [];
  const messages = incoming
    .filter((message: unknown): message is ChatMessage => {
      if (!message || typeof message !== "object") return false;
      const value = message as Record<string, unknown>;
      return (value.role === "user" || value.role === "assistant") && typeof value.content === "string";
    })
    .slice(-12)
    .map((message) => ({ role: message.role, content: message.content.trim().slice(0, 4000) }))
    .filter((message) => message.content.length > 0);

  if (!messages.length) {
    res.status(400).json({ error: "A message is required." });
    return;
  }

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-5.4",
      max_completion_tokens: 1200,
      messages: [
        { role: "system", content: "You are Maggie, the warm and sharp creative AI design advisor for Beefed Up Printing, a South African hip-hop and street-culture custom merch brand. Give practical, vivid ideas for tees, hoodies, caps, stickers, posters, and brand drops. Respect Mzansi context. Keep replies concise and actionable." },
        ...messages,
      ],
    });
    const message = completion.choices[0]?.message?.content?.trim() ?? "I’m ready. Tell me what you want to create.";
    res.json({ message });
  } catch (err) {
    req.log.error({ err }, "Maggie chat failed");
    res.status(500).json({ error: "Maggie is temporarily unavailable. Please try again." });
  }
});

export default router;
