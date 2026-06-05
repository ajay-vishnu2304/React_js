import { Request, Response } from "express";
import { db } from "../src/config/db";

export const listProducts = async (_req: Request, res: Response) => {
  try {
    const [products]: any = await db.query("SELECT * FROM products");
    res.json(products);
  } catch {
    res.status(500).json({ message: "Server error" });
  }
};
