import { Request, Response, NextFunction } from "express";
import userService from "../service/UserService";

class UserController {

    async register(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { phone, password, name } = req.body;
            const result = await userService.register(phone, password, name);
            res.cookie('refreshToken', result.refreshToken, { httpOnly: true, sameSite: 'lax' });
            res.header('access-token', result.accessToken);
            res.status(200).json(result);
        } catch (error) {
            next(error);
        }
    }

    async login(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { phoneNumber, password } = req.body;
            const result = await userService.login(phoneNumber, password);
            res.cookie('refreshToken', result.refreshToken, { httpOnly: true, sameSite: 'lax' });
            res.header('access-token', result.accessToken);
            res.status(200).json(result);
        } catch (error) {
            console.log(error);
            next(error);
        }
    }

    async logout(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const token = req.cookies?.refreshToken || req.headers['x-refresh-token'];
            if (!token) {
                return next(new Error('No token provided'));

            }
            await userService.logout(token);
            res.status(200).send();
        } catch (error) {
            console.log(error);
            next(error);
        }
    }

    async refresh(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const token = req.cookies?.refreshToken || req.headers['x-refresh-token'];
            if (!token) {
                return next(new Error('No token provided'));
            }
            const result = await userService.refresh(token);
            res.json(result);
        } catch (error) {
            console.log(error);
            next(error);
        }
    }

    async getUsers(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const users = await userService.getAllUsers();
            res.status(200).send(users);
        } catch (error) {
            console.log(error);
        }
    }

    // think about logic that update user status
    async updateUserStatus(req: Request, res: Response, next: NextFunction): Promise<void> {
        try{

            const {userId,  status } = req.body;
            const updateUser = await userService.updateStatus(userId, status)
            res.json(updateUser);

        }
        catch (error) {
            console.log(error);
            next(error);
        }
    }
}

export default new UserController();