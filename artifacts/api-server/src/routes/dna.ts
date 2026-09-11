import { Router, type IRouter, type Request, type Response } from "express";
import { eq, desc } from "drizzle-orm";
import { db, designDnaProfilesTable, designDnaSuggestionsTable } from "@workspace/db";
import { openai } from "@workspace/integrations-openai-ai-server";

const router: IRouter = Router();

router.get("/dna/profile", async (req: Request, res: Response) => {
  if (!req.isAuthenticated()) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  const [profile] = await db
    .select()
    .from(designDnaProfilesTable)
    .where(eq(designDnaProfilesTable.userId, req.user.id));
  res.json({ profile: profile ?? null });
});

router.put("/dna/profile", async (req: Request, res: Response) => {
  if (!req.isAuthenticated()) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  const { favouriteColours, musicGenres, styleVibes, designKeywords, rawNotes } = req.body;

  const [profile] = await db
    .insert(designDnaProfilesTable)
    .values({
      userId: req.user.id,
      favouriteColours: favouriteColours ?? [],
      musicGenres: musicGenres ?? [],
      styleVibes: styleVibes ?? [],
      designKeywords: designKeywords ?? [],
      rawNotes: rawNotes ?? null,
    })
    .onConflictDoUpdate({
      target: designDnaProfilesTable.userId,
      set: {
        favouriteColours: favouriteColours ?? [],
        musicGenres: musicGenres ?? [],
        styleVibes: styleVibes ?? [],
        designKeywords: designKeywords ?? [],
        rawNotes: rawNotes ?? null,
        updatedAt: new Date(),
      },
    })
    .returning();

  res.json({ profile });
});

router.get("/dna/suggestions", async (req: Request, res: Response) => {
  if (!req.isAuthenticated()) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  const suggestions = await db
    .select()
    .from(designDnaSuggestionsTable)
    .where(eq(designDnaSuggestionsTable.userId, req.user.id))
    .orderBy(desc(designDnaSuggestionsTable.createdAt))
    .limit(12);
  res.json({ suggestions });
});

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

  const systemPrompt = `You are Maggie, the creative AI design advisor for Beefed Up Printing — a South African hip-hop street culture custom merch brand. 
Your job is to generate hyper-personalised merch concepts based on a customer's Design DNA profile.
Beefed Up Printing specialises in: custom t-shirts, hoodies, caps, sticker packs, posters, and branded streetwear.
The brand is bold, authentic, rooted in Mzansi culture. Every suggestion must feel like it was made JUST for this person.
Always respond with valid JSON only — no markdown, no explanation.`;

  const userPrompt = `Generate 6 unique merch concepts for a customer with this Design DNA:

Favourite Colours: ${profile.favouriteColours.join(", ") || "not specified"}
Music Genres: ${profile.musicGenres.join(", ") || "not specified"}
Style Vibes: ${profile.styleVibes.join(", ") || "not specified"}
Design Keywords: ${profile.designKeywords.join(", ") || "not specified"}
${profile.rawNotes ? `Personal notes: ${profile.rawNotes}` : ""}
${profile.purchaseHistory.length > 0 ? `Previous purchases: ${JSON.stringify(profile.purchaseHistory)}` : ""}
${profile.projectHistory.length > 0 ? `Previous projects: ${JSON.stringify(profile.projectHistory)}` : ""}

Return a JSON array of exactly 6 objects, each with:
- category: one of "merch", "sticker_pack", "poster", "hoodie", "cap", "tee"
- title: short punchy name (max 8 words)
- description: vivid 2-3 sentence description of the concept, referencing their specific style
- tags: array of 3-5 relevant style/theme tags
- colourPalette: array of 2-4 hex colour codes that match their vibe

Make each concept feel deeply personal and uniquely South African street culture.`;

  let parsed: Array<{
    category: string;
    title: string;
    description: string;
    tags: string[];
    colourPalette: string[];
  }> = [];

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-5.4",
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

  const toInsert = parsed.map((s) => ({
    userId: req.user.id,
    category: s.category ?? "merch",
    title: s.title ?? "Untitled Concept",
    description: s.description ?? "",
    tags: Array.isArray(s.tags) ? s.tags : [],
    colourPalette: Array.isArray(s.colourPalette) ? s.colourPalette : [],
    dnaVersion,
  }));

  const suggestions = await db
    .insert(designDnaSuggestionsTable)
    .values(toInsert)
    .returning();

  res.json({ suggestions });
});

export default router;
