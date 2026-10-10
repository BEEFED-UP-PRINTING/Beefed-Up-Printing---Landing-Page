import { Router, Request, Response } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { db, usersTable } from "@workspace/db";
import { eq } from "drizzle-orm";

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || "dev-secret-change-in-production";
const BCRYPT_ROUNDS = 10;

interface AuthUser {
  id: string;
  email: string;
}

interface JWTPayload {
  id: string;
  email: string;
  iat: number;
  exp: number;
}

// Register endpoint
router.post("/register", async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({ error: "Email and password required" });
      return;
    }

    // Check if user exists
    const existingUser = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.email, email))
      .limit(1);

    if (existingUser.length > 0) {
      res.status(409).json({ error: "User already exists" });
      return;
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, BCRYPT_ROUNDS);

    // Create user
    const newUser = await db
      .insert(usersTable)
      .values({
        id: `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        email,
        password_hash: passwordHash,
      })
      .returning();

    // Generate JWT token
    const token = jwt.sign(
      { id: newUser[0].id, email: newUser[0].email },
      JWT_SECRET,
      { expiresIn: "24h" }
    );

    res.status(201).json({
      success: true,
      user: { id: newUser[0].id, email: newUser[0].email },
      token,
    });
  } catch (error) {
    console.error("Register error:", error);
    res.status(500).json({ error: "Registration failed" });
  }
});

// Login endpoint
router.post("/login", async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({ error: "Email and password required" });
      return;
    }

    // Find user
    const users = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.email, email))
      .limit(1);

    if (users.length === 0) {
      res.status(401).json({ error: "Invalid credentials" });
      return;
    }

    const user = users[0];

    // Verify password
    const passwordMatch = await bcrypt.compare(
      password,
      user.password_hash || ""
    );

    if (!passwordMatch) {
      res.status(401).json({ error: "Invalid credentials" });
      return;
    }

    // Generate JWT token
    const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, {
      expiresIn: "24h",
    });

    res.json({
      success: true,
      user: { id: user.id, email: user.email },
      token,
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ error: "Login failed" });
  }
});

// Verify token endpoint
router.post("/verify", (req: Request, res: Response) => {
  try {
    const token = req.headers.authorization?.replace("Bearer ", "");

    if (!token) {
      res.status(401).json({ error: "No token provided" });
      return;
    }

    const decoded = jwt.verify(token, JWT_SECRET) as JWTPayload;
    res.json({ valid: true, user: { id: decoded.id, email: decoded.email } });
  } catch (error) {
    res.status(401).json({ error: "Invalid token" });
  }
});

// Get current user endpoint
router.get("/me", (req: Request, res: Response) => {
  try {
    const token = req.headers.authorization?.replace("Bearer ", "");

    if (!token) {
      res.status(401).json({ error: "No token provided" });
      return;
    }

    const decoded = jwt.verify(token, JWT_SECRET) as JWTPayload;
    res.json({ user: { id: decoded.id, email: decoded.email } });
  } catch (error) {
    res.status(401).json({ error: "Invalid token" });
  }
});

export default router;