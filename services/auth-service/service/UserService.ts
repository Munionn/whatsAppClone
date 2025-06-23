import UserModel from "../models/UserModel";
import bcrypt from "bcrypt";
import UserDto from "../dtos/UserDto";
import tokenService from "./TokenService";



class UserService {
    async register(phone: string, password: string) {
        const userModel = await UserModel.findOne({ phone });
        if (!userModel) {
            throw new Error('User does not exist');
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
        const isPassword = bcrypt.compare(password, user.password)
        if (!isPassword) {
            throw new Error('User does not exist');
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

        const userData = UserService.findById(userData.id);
    }
}

module.exports = new UserService();