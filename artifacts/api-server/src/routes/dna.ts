import { Router, type IRouter, type Request, type Response } from "express";
import { eq, desc } from "drizzle-orm";
import { db, designDnaProfilesTable, designDnaSuggestionsTable } from "@workspace/db";
import {
  openai,
  getPreferredOpenAIModel,
} from "@workspace/integrations-openai-ai-server";

// ... existing routes unchanged ...

router.post("/dna/suggestions", async (req: Request, res: Response) => {
  if (!req.isAuthenticated()) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  const [profile] = await db
    .select()
    .from(designDnaProfilesTable)
    .where(eq(designDnaProfilesTable.userId, req.user.id));

  if (!profile) {
    res.status(400).json({ error: "No Design DNA profile found. Complete your profile first." });
    return;
  }

  const dnaVersion = Math.floor(Date.now() / 1000);

  const systemPrompt = `You are Maggie ...`;

  const userPrompt = `Generate 6 unique merch concepts ...`;

  let parsed: Array<{
    category: string;
    title: string;
    description: string;
    tags: string[];
    colourPalette: string[];
  }> = [];

  try {
    const completion = await openai.chat.completions.create({
      model: getPreferredOpenAIModel("gpt-4o-mini"),
      max_completion_tokens: 4096,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
    });

    const raw = completion.choices[0]?.message?.content ?? "[]";
    const cleaned = raw.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
    parsed = JSON.parse(cleaned);
  } catch (err) {
    req.log.error({ err }, "DNA suggestion generation failed");
    res.status(500).json({ error: "Failed to generate suggestions" });
    return;
  }

  // rest unchanged
});