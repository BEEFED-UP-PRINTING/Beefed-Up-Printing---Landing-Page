import { Router, type IRouter, type Request, type Response } from "express";
import {
  openai,
  getPreferredOpenAIModel,
} from "@workspace/integrations-openai-ai-server";

const router: IRouter = Router();

router.post("/maggie", async (req: Request, res: Response) => {
  const prompt =
    typeof req.body?.prompt === "string" ? req.body.prompt.trim().slice(0, 4000) : "";
  const dnaBrief =
    typeof req.body?.dnaBrief === "string" ? req.body.dnaBrief.trim().slice(0, 5000) : "";

  if (!prompt) {
    res.status(400).json({ success: false, error: "A prompt is required." });
    return;
  }

  try {
    const completion = await openai.chat.completions.create({
      model: getPreferredOpenAIModel("gpt-4o-mini"),
      max_completion_tokens: 800,
      messages: [
        {
          role: "system",
          content:
            "You are Maggie, the warm and sharp creative AI design advisor for Beefed Up Printing ...",
        },
        ...(dnaBrief ? [{ role: "system" as const, content: "The visitor's Design DNA brief is:\n" + dnaBrief }] : []),
        { role: "user" as const, content: prompt },
      ],
    });

    const reply =
      completion.choices[0]?.message?.content?.trim() ??
      "I’m ready. Tell me what you want to create.";

    res.json({ success: true, reply });
  } catch (err) {
    req.log.error({ err }, "Maggie chat failed");
    res.status(500).json({
      success: false,
      error: "Maggie is temporarily unavailable. Please try again.",
    });
  }
});

export default router;