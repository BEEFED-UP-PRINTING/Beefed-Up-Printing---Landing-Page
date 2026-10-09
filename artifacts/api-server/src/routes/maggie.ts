import { Router, type IRouter, type Request, type Response } from "express";
import { openai } from "@workspace/integrations-openai-ai-server";

const router: IRouter = Router();

// Your Cloudflare Worker that generates images
const IMAGE_WORKER_URL = "https://maggie-image-gen.beefedupp.workers.dev/";

router.post("/maggie", async (req: Request, res: Response) => {
  const prompt = typeof req.body?.prompt === "string" ? req.body.prompt.trim().slice(0, 4000) : "";
  const dnaBrief = typeof req.body?.dnaBrief === "string" ? req.body.dnaBrief.trim().slice(0, 5000) : "";

  if (!prompt) {
    res.status(400).json({ success: false, error: "A prompt is required." });
    return;
  }

  try {
    // 1. Get Maggie's text reply
    const completion = await openai.chat.completions.create({
      model: process.env.OPENAI_MODEL || "gpt-4o-mini",
      max_completion_tokens: 800,
      messages: [
        {
          role: "system",
          content: `You are Maggie, the warm and sharp creative AI design advisor for Beefed Up Printing, a South African hip-hop and street-culture custom merch brand. 
Give practical, vivid ideas for tees, hoodies, caps, stickers, posters, and brand drops. Respect Mzansi context. Keep replies concise and actionable.
When the user asks for a design, describe it clearly so it can be turned into a visual.`,
        },
        ...(dnaBrief ? [{ role: "system" as const, content: "The visitor's Design DNA brief is:\n" + dnaBrief }] : []),
        { role: "user" as const, content: prompt },
      ],
    });

    const reply = completion.choices[0]?.message?.content?.trim() ?? "I’m ready. Tell me what you want to create.";

    // 2. Try to generate a real image
    let imageBase64: string | null = null;

    try {
      const imagePrompt = `${prompt}, streetwear design, South African style, high quality graphic, bold, clean composition, suitable for t-shirt print, neon orange and ice blue accents on black if no colors specified`;

      const imageRes = await fetch(IMAGE_WORKER_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: imagePrompt }),
      });

      if (imageRes.ok) {
        const arrayBuffer = await imageRes.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        imageBase64 = `data:image/jpeg;base64,${buffer.toString("base64")}`;
      }
    } catch (imgErr) {
      console.error("Image generation failed:", imgErr);
    }

    // 3. Return both text + image
    res.json({
      success: true,
      reply,
      image: imageBase64,
    });
  } catch (err) {
    req.log?.error?.({ err }, "Maggie chat failed");
    res.status(500).json({ success: false, error: "Maggie is temporarily unavailable. Please try again." });
  }
});

export default router;
export default router;
