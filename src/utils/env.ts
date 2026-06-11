import 'dotenv/config';
import {z} from 'zod';

const EnvSchema = z.object({
    PORT : z.string().default("5000").transform(val=>Number(val)),
    OPENAI_API_KEY : z.string().min(1,'OpenAi key missing'),
    MONGODB_ATLAS_URI : z.string(),
    MONGODB_DB_NAME : z.string()
});

const parsed = EnvSchema.safeParse(process.env);

if(!parsed.success){
    console.log("Loading env error");
    process.exit(1);
} 

export const env = Object.freeze(parsed.data);