import { Router } from "express";
import { listProducts } from "../controllers/productController";
import { authMiddleware, adminMiddleware } from "../middleware/authMiddleware";

const router = Router();
router.get("/", authMiddleware, listProducts);

export default router;
