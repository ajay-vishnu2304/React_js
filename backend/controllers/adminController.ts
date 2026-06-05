import { Response } from "express";
import { AuthRequest } from "../middleware/authMiddleware";
import { db } from "../src/config/db";
import bcrypt from "bcrypt";

export const getStats = async (_req: AuthRequest, res: Response) => {
  try {
    const [userRows]: any = await db.query(
      "SELECT COUNT(*) as userCount FROM users",
    );
    const userCount = userRows[0].userCount;

    const [productRows]: any = await db.query(
      "SELECT COUNT(*) as productCount FROM products",
    );
    const productCount = productRows[0].productCount;
    res.json({ userCount, productCount, orderCount: 0 });
  } catch {
    res.status(500).json({ message: "Server error" });
  }
};

export const getUsers = async (_req: AuthRequest, res: Response) => {
  try {
    const [users]: any = await db.query(
      "SELECT id, name, email, role, created_at FROM users",
    );
    res.json(users);
  } catch {
    res.status(500).json({ message: "Server error" });
  }
};

export const updateUserRole = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { role } = req.body;
    if (!["admin", "user"].includes(role)) {
      res.status(400).json({ message: "Invalid role" });
      return;
    }
    await db.query("UPDATE users SET role = ? WHERE id = ?", [role, id]);
    res.json({ message: "Role updated" });
  } catch {
    res.status(500).json({ message: "Server error" });
  }
};

export const createUser = async (req: AuthRequest, res: Response) => {
  try {
    const { name, email, password, role } = req.body;
    if (!name || !email || !password) {
      res
        .status(400)
        .json({ message: "Name, email and password are required" });
      return;
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    await db.query(
      "INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)",
      [name, email, hashedPassword, role || "user"],
    );
    res.status(201).json({ message: "User created" });
  } catch {
    res.status(500).json({ message: "Server error" });
  }
};

export const deleteUser = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    await db.query("DELETE FROM users WHERE id = ?", [id]);
    res.json({ message: "User deleted" });
  } catch {
    res.status(500).json({ message: "Server error" });
  }
};

export const getProducts = async (_req: AuthRequest, res: Response) => {
  try {
    const [products]: any = await db.query("SELECT * FROM products");
    res.json(products);
  } catch {
    res.status(500).json({ message: "Server error" });
  }
};

export const createProduct = async (req: AuthRequest, res: Response) => {
  try {
    const { name, description, price, stock_no, brand, color, size, image } =
      req.body;
    await db.query(
      `INSERT INTO products (name, description, price, stock_no, brand, color, size, image) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [name, description, price, stock_no, brand, color, size, image],
    );
    res.status(201).json({ message: "Product created" });
  } catch {
    res.status(500).json({ message: "Server error" });
  }
};

export const updateProduct = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { name, description, price, stock_no, brand, color, size, image } =
      req.body;
    await db.query(
      `UPDATE products SET name=?, description=?, price=?, stock_no=?, brand=?, color=?, size=?, image=? WHERE id=?`,
      [name, description, price, stock_no, brand, color, size, image, id],
    );
    res.json({ message: "Product updated" });
  } catch {
    res.status(500).json({ message: "Server error" });
  }
};

export const deleteProduct = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    await db.query("DELETE FROM products WHERE id = ?", [id]);
    res.json({ message: "Product deleted" });
  } catch {
    res.status(500).json({ message: "Server error" });
  }
};
