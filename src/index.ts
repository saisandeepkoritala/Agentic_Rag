import express from 'express';
import cors from 'cors';
import { kbRouter } from './routes/kbRouter';
import { env } from './utils/env';
import { agentRouter } from './routes/agentRouter';


const app = express();

app.use(cors({
    origin : 'http://localhost:5173'
}));

app.use(express.json());

app.use("/kb",kbRouter);
app.use("/agent",agentRouter);



app.listen(env.PORT,()=>{
    console.log(`Server is runnning on port ${env.PORT}`);
});


