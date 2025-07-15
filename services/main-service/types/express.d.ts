import {Types} from "mongoose";

interface User {
    id: Types.ObjectId;
    phone?: string;
    // add other user properties here
}

// Extend Express namespace
declare namespace Express {
    export interface Request {
        user?: User;
    }
}
