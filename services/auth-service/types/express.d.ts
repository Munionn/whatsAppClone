import { TokenPayload } from "./tokenTypes";

declare global {
    namespace Express {
        interface Request {
            user?: TokenPayload;
        }
    }
}