import express, { Express, Request, Response , Application } from 'express';
import { connectDb } from "./db";
import cookieParser from "cookie-parser";
import cors from "cors";
import router from "./router/index";
const app: Application = express();
const port = process.env.PORT || 3001;

app.use(cors());
app.use(cookieParser());
app.use(express.json());
app.use('/api', router);
app.get('/', (req: Request, res: Response) => {
    res.send('Welcome');
})

const start = async () => {
    try{
        connectDb();
        app.listen(port, () => {
            console.log(`Listening on port ${port}`);
        })

    }catch(e){
        console.error(e);
    }
}


start();
