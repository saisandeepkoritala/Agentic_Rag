import {z} from 'zod';
import { createAgent, providerStrategy } from 'langchain';
import { chatModel } from '@/utils/openai';
import { agentTools } from './02_tools';
import { POLICY_TEXT } from './01_policy';

const AgentResponseSchema = z.object({
    answer  : z.string(),
    citations : z.array(
        z.object({
            source : z.string(),
            chunkId : z.number(),
            preview : z.string()
        })
    ),
});

export const ProductAgent  = createAgent({
    model : chatModel,
    tools : agentTools,
    systemPrompt : POLICY_TEXT,
    responseFormat : providerStrategy(AgentResponseSchema)
});


export async function runProductAgent(
    messages : {role:string,content:string}[]
){
    
    const result : any = await ProductAgent.invoke({messages});

    if(result?.structuredResponse){
        return {
            answer : result?.structuredResponse?.answer,
            citations : result?.structuredResponse?.citations
        }
    }

    return {
        answer : '',
        citations : []
    }
};

