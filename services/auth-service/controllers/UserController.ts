import { Request, Response, NextFunction } from "express";

export default class UserController {
    async register(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            res.json({ message: "Register" });
        } catch (error) {
            console.log(error);
        }
    }

    async login(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            res.json({ message: "Login" });
        } catch (error) {
            console.log(error);
        }
    }

    async logout(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            res.json({ message: "Logout" });
        } catch (error) {
            console.log(error);
        }
    }

    async refresh(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            res.json({ message: "Refresh Token" });
        } catch (error) {
            console.log(error);
        }
    }

    async getUsers(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            res.json(['sometext', 'another']);
        } catch (error) {
            console.log(error);
        }
    }
}