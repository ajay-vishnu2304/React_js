import { Router } from "express";
import { listProducts } from "../controllers/productController";
import { adminMiddleware } from "../middleware/authMiddleware";

const router = Router();
router.use(adminMiddleware)
router.get("/", listProducts);

export default router;
