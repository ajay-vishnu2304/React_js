import { Router } from "express";
import { authMiddleware,adminMiddleware } from "../middleware/authMiddleware";
import {
  getStats,
  getUsers,
  createUser,
  updateUserRole,
  deleteUser,
  getProducts,
  createProduct,
  updateProduct,
  deleteProduct,
} from "../controllers/adminController";

const router = Router();

router.use(authMiddleware);
router.use(adminMiddleware)

router.get("/stats", getStats);
router.get("/users", getUsers);
router.post("/users", createUser);
router.patch("/users/:id/role", updateUserRole);
router.delete("/users/:id", deleteUser);
router.get("/products", getProducts);
router.post("/products", createProduct);
router.put("/products/:id", updateProduct);
router.delete("/products/:id", deleteProduct);

export default router;
