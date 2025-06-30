import mongoose from "mongoose";

export const connectDb = async () => {
    try{
        const conn = await mongoose.connect(process.env.DB_URL as string);
        console.log(`Connected to DB ${conn.connection.host}}`)
    }
    catch(err){
        console.log(err);
        process.exit(1);
    }
}