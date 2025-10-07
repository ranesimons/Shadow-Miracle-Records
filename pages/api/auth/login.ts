// pages/api/auth/login.ts
import type { NextApiRequest, NextApiResponse } from "next";

// You’ll replace this with your real user database / hashing logic
const dummyUser = {
  email: "user@example.com",
  password: "password123", // in production, never store plain text
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: "Missing fields" });
  }

  // Validate credentials (this is dummy — replace with real logic)
  if (email === dummyUser.email && password === dummyUser.password) {
    // On success, issue a session / cookie / JWT etc.
    // Here we'll set a cookie (non‑secure example)
    res.setHeader(
      "Set-Cookie",
      `token=some-jwt-or-session-id; Path=/; HttpOnly; SameSite=Lax`
    );
    return res.status(200).json({ success: true });
  } else {
    return res.status(401).json({ error: "Invalid credentials" });
  }
}
