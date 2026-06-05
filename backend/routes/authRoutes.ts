import {Router} from 'express'
import {signup,login} from "../controllers/authController"
import {authMiddleware} from "../middleware/authMiddleware"

const router = Router()
router.post("/signup",signup)
router.post("/login",login)
router.get("/profile", authMiddleware, (req, res) => {
  res.json({ user: (req as any).user });
});

export default router