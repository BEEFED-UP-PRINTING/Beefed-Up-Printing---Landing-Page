import { Router } from "express";
import { db } from "@workspace/db";
import { dropWaitlistTable } from "@workspace/db/schema";

const router = Router();

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

router.post("/drops/notify", async (req, res) => {
  const { email } = req.body ?? {};
  if (!email || typeof email !== "string" || !EMAIL_RE.test(email.trim())) {
    return res.status(400).json({ error: "Invalid email address." });
  }

  try {
    await db
      .insert(dropWaitlistTable)
      .values({ email: email.trim().toLowerCase() })
      .onConflictDoNothing();
    res.json({ ok: true });
  } catch (err) {
    console.error("drops/notify error:", err);
    res.status(500).json({ error: "Failed to save. Please try again." });
  }
});

export default router;
