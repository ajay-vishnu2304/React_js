import { Request, Response } from "express";
import { db } from "../src/config/db";
import bcrypt from "bcrypt";

import jwt from 'jsonwebtoken'

export const signup = async (req: Request, res: Response) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({
        message: "All fields are required",
      });
    }

    const [existingUsers]: any = await db.query(
      "SELECT id FROM users WHERE email = ?",
      [email],
    );

    if (existingUsers.length > 0) {
      return res.status(400).json({ message: "Email already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    await db.query(`INSERT INTO users(name, email, password) VALUES(?, ?, ?)`, [
      name,
      email,
      hashedPassword,
    ]);

    return res.status(201).json({ message: "User created successfully" });
  } catch (error) {
    console.log("signup error:",error)
    return res.status(500).json({ message: "Server error" });
    
  }
};


export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({
        message: "Email and password required",
      });
    }

    const [users]: any = await db.query(
      `SELECT * FROM users WHERE email = ?`,
      [email]
    );

    const user = users[0];
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid Credentials" });
    }

    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET ?? "",
      { expiresIn: "1d" }
    );

    return res.json({ message: "Login Successful", token });
  } catch (error) {
    console.log("login error:", error);
    return res.status(500).json({ message: "Server error" });
  }
};