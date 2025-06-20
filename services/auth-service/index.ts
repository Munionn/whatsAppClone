import express, { Express, Request, Response , Application } from 'express';

const app: Application = express();
const port = process.env.PORT || 3001;
app.get('/', (req: Request, res: Response) => {
    res.send('Welcome');
})

app.listen(port, () => {
    console.log(`Listening on port ${port}`);
})
