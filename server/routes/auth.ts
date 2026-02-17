import { Router } from "express";
import { OAuth2Client } from "google-auth-library";
import jwt from "jsonwebtoken";
import { User } from "../models/User";

const router = Router();
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

import bcrypt from "bcryptjs";

// ... existing imports ...

// REGISTER
router.post("/register", async (req, res) => {
  const { email, password, name } = req.body;

  if (!email || !password || !name) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({
      email,
      password: hashedPassword,
      name,
    });

    const token = jwt.sign(
      { userId: user._id, email: user.email },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
      },
      token,
    });
  } catch (error) {
    console.error("Registration Error:", error);
    res.status(500).json({ error: "Registration failed" });
  }
});

// LOGIN (Email/Password)
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: "Missing email or password" });
  }

  try {
    const user = await User.findOne({ email });
    if (!user || !user.password) {
      // If user exists but has no password (e.g. Google auth only), this also fails safely
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const token = jwt.sign(
      { userId: user._id, email: user.email },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        picture: user.picture,
      },
      token,
    });
  } catch (error) {
    console.error("Login Error:", error);
    res.status(500).json({ error: "Login failed" });
  }
});

// GOOGLE LOGIN (Existing)
router.post("/google", async (req, res) => {
  const { credential, type } = req.body; // type can be 'id_token' (default) or 'access_token'

  if (!credential) {
    return res.status(400).json({ error: "Missing Google credential" });
  }

  try {
    let googleUser: { googleId: string; email: string; name: string; picture?: string };

    if (type === 'access_token') {
      // Handle Access Token (from useGoogleLogin hook)
      const userInfoResponse = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
        headers: { Authorization: `Bearer ${credential}` },
      });
      
      if (!userInfoResponse.ok) {
        throw new Error("Failed to fetch user info with access token");
      }
      
      const userInfo = await userInfoResponse.json();
      googleUser = {
        googleId: userInfo.sub,
        email: userInfo.email,
        name: userInfo.name,
        picture: userInfo.picture
      };
    } else {
      // Handle ID Token (Legacy/Default)
      const ticket = await client.verifyIdToken({
        idToken: credential,
        audience: process.env.GOOGLE_CLIENT_ID,
      });

      const payload = ticket.getPayload();
      if (!payload || !payload.sub || !payload.email) {
        return res.status(401).json({ error: "Invalid Google token" });
      }

      googleUser = {
        googleId: payload.sub,
        email: payload.email,
        name: payload.name || "Google User",
        picture: payload.picture
      };
    }

    // 2. Find or Create User in MongoDB
    let user = await User.findOne({ googleId: googleUser.googleId });

    if (!user) {
      user = await User.create({
        googleId: googleUser.googleId,
        email: googleUser.email,
        name: googleUser.name,
        picture: googleUser.picture,
      });
    } else {
      user.name = googleUser.name || user.name;
      user.picture = googleUser.picture || user.picture;
      await user.save();
    }

    // 3. Generate JWT
    const token = jwt.sign(
      { userId: user._id, email: user.email },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    // 4. Return user and token
    res.json({
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        picture: user.picture,
      },
      token,
    });
  } catch (error) {
    console.error("Google Login Error:", error);
    res.status(500).json({ error: "Authentication failed" });
  }
});

export const authRoutes = router;
