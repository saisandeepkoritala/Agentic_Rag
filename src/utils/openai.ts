import { OpenAIEmbeddings,ChatOpenAI } from "@langchain/openai";
import { env } from "./env";


export const embeddings = new OpenAIEmbeddings({
    model:'text-embedding-3-small',
    openAIApiKey : env.OPENAI_API_KEY
});

export const chatModel = new ChatOpenAI({
    model : 'gpt-4o-mini',
    temperature : 0.2,
    openAIApiKey : env.OPENAI_API_KEY
}); 

