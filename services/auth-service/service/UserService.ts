import userModel from "../models/userModel";
import bcrypt from "bcrypt";


class UserService {
    async register(phone: string, password: string): Promise<void> {
        const userModel = await userModel.findOne({ phone });
        if (!userModel) {
            throw new Error('User does not exist');
        }
        const user = await userModel.create({phone, password: bcrypt.hashSync(password, 10) });

    }
}

module.exports = new UserService();