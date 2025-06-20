import mongoose from "mongoose";

export const connectDb = async () => {
    try{
        await mongoose.connect('mongodb://localhost:27017/whatsapp', {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        }).then(() => {
            console.log("Connected to MongoDB");
        }).catch((err) => {
            console.log("Error connecting to MongoDB");
        })
    }
    catch(err){
        console.log(err);
        process.exit(1);
    }
}