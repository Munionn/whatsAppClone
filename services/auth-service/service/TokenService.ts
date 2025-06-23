import jwt,{SignOptions, JwtPayload } from 'jsonwebtoken';
import {TokenPayload} from "../types/tokenTypes";
import * as process from "node:process";
import tokenModel from "../models/tokenModel";

class TokenService {
    generateTokens(payLoad: TokenPayload) {
        const accessToken =  jwt.sign(payLoad, process.env.JWT_SECRET as string, {
            expiresIn: '1h'
        })
        const refreshToken =  jwt.sign(payLoad, process.env.JWT_SECRET as string, {
            expiresIn: '3h'
        })
        return { accessToken, refreshToken }
    }
    validateAccessToken(token: string): TokenPayload | null{
        try{
            const accessToken =  jwt.verify(token, process.env.JWT_ACCESS_SECRET as string);
            return accessToken;
        }catch(err){
            return null;
        }
    }
    validateRefreshToken(token: string){
        try{
            const accessToken =  jwt.verify(token, process.env.JWT_REFRESH_SECRET as string);
            return accessToken;
        }catch(err){
            return null;
        }
    }
    async saveToken(userId: string, refreshToken: string) {
        const tokenData = await tokenModel.findOne({ user: userId})
        if(tokenData){
            tokenData.refreshToken = refreshToken;
            return tokenData.save();
        }
        const token = await tokenModel.create({ user: userId, refreshToken });
        return token;
    }

    async removeToken(refreshToken: string) {
        const tokenData = await tokenModel.deleteOne({ refreshToken });
        return tokenData;
    }

    async findToken(refreshToken: string) {
        const tokenData = await tokenModel.findOne({refreshToken})
        return tokenData;
    }
}

export default new TokenService();