import { Router, Request, Response, NextFunction } from "express";
import UserController from "../controllers/UserController";
import authMiddleware from "../middleware/authMiddleware";
const router = Router();


router.post('/register', (req: Request, res: Response, next: NextFunction) => {
    UserController.register(req, res, next);
});

router.post('/login', (req: Request, res: Response, next: NextFunction) => {
    UserController.login(req, res, next);
});

router.post('/logout', (req: Request, res: Response, next: NextFunction) => {
    UserController.logout(req, res, next);
});

router.get('/refresh', (req: Request, res: Response, next: NextFunction) => {
    UserController.refresh(req, res, next);
});

router.get('/users', authMiddleware,(req: Request, res: Response, next: NextFunction) => {
    UserController.getUsers(req, res, next);
});

export default router;