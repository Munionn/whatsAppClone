import UserModel from "../models/UserModel";
import bcrypt from "bcrypt";
import UserDto from "../dtos/UserDto";
import tokenService from "./TokenService";
import {TokenPayload} from "../types/tokenTypes";
import userModel from "../models/UserModel";



class UserService {
    async register(phone: string, password: string) {
        const userModel = await UserModel.findOne({ phone });
        if (userModel) {
            throw new Error('User does already  exist');
        }
        const hashedPassword = await bcrypt.hash(password, 12);
        const user = await UserModel.create({phone, password: hashedPassword });

        const userDto = new UserDto(user);
        const tokens = tokenService.generateTokens({...userDto});
        await tokenService.saveToken(userDto.id, tokens.refreshToken);
        return {...tokens, user: userDto};
    }

    async login(phone: string, password: string) {
        const user = await UserModel.findOne({phone});
        if (!user) {
            throw new Error('User does not exist');
        }
        const isPassword = await bcrypt.compare(password, user.password);
        if (!isPassword) {
            throw new Error('Invalid password');
        }
        const userDto = new UserDto(user);
        const tokens = tokenService.generateTokens({...userDto});

        await tokenService.saveToken(userDto.id, tokens.refreshToken);
        return {...tokens, user: userDto };
    }

    async logout(refreshToken: string) {
        const token = await tokenService.removeToken(refreshToken);
        return token;
    }

    async refresh(refreshToken: string) {
        if (!refreshToken) {
            throw new Error('Refresh token not set');
        }
        const userData = tokenService.validateRefreshToken(refreshToken);
        const tokensFromDb =  await tokenService.findToken(refreshToken);
        if (!tokensFromDb) {
            throw new Error('Refresh token not set');
        }

        const user = await UserModel.findById(userData?.id);
        const userDto = new UserDto(user);
        const tokens = tokenService.generateTokens({...userDto});
        await tokenService.saveToken(userDto.id, tokens.refreshToken);
        return {...tokens, user: userDto};
    }

    async getAllUsers(): Promise<UserDto[]> {
        const users = await UserModel.find();
        return users.map((user) => new UserDto(user));
    }
    async updateStatus(userId: number, status: 'online' | 'offline'){
        const user = await userModel.findByIdAndUpdate(userId, {
            status,
            lastSeen: status === 'offline' ?  new  Date() : undefined,
            },
            {new: true}
        );
        if (!user) {
            throw new Error('User does not exist');
        }
        return new UserDto(user);
    }
}

export default new UserService();