import {ApiError} from "../exceptions/ApiError";
import TokenService from "../service/TokenService";
import {Response, Request,NextFunction} from "express";
import tokenService from "../service/TokenService";

const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
    try{
        const authToken = req.headers.authorization;
        if(!authToken){
            return next(ApiError.UnauthorizedError())
        }

        const accessToken = authToken.split(' ')[1];
        if(!accessToken){
            return next(ApiError.UnauthorizedError())
        }

        const userData = tokenService.validateAccessToken(accessToken)
        if(!userData){
            return next(ApiError.UnauthorizedError())
        }

        req.user = userData;
        next();
    }
    catch(err){
        return next(ApiError.UnauthorizedError());
    }
}


export default authMiddleware;