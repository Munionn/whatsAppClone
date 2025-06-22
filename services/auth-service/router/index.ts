import { Router, Request, Response, NextFunction } from "express";
import UserController from "../controllers/UserController";

const router = Router();
const userController = new UserController();

router.post('/register', (req: Request, res: Response, next: NextFunction) => {
    userController.register(req, res, next);
});

router.post('/login', (req: Request, res: Response, next: NextFunction) => {
    userController.login(req, res, next);
});

router.post('/logout', (req: Request, res: Response, next: NextFunction) => {
    userController.logout(req, res, next);
});

router.get('/refresh', (req: Request, res: Response, next: NextFunction) => {
    userController.refresh(req, res, next);
});

router.get('/users', (req: Request, res: Response, next: NextFunction) => {
    userController.getUsers(req, res, next);
});

export default router;