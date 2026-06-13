import { runProductAgent } from "@/agent/03_agent";
import { appendToHistory, ensureThreadId, getHistory } from "@/agent/04_memory";
import { Router } from "express";


export const agentRouter = Router();

agentRouter.post("/chat",async(req,res)=>{
    try{

        const {message,threadId : incomingThreadId} = req.body as {message?: string,threadId?:string};

        if(!message){
            return  res.status(400).json({
                ok:false,
                message:'message is required'
            })
        }

        if(!incomingThreadId){
            return  res.status(400).json({
                ok:false,
                message:'ThreadId is required'
            })
        }

        const threadId = await ensureThreadId(incomingThreadId);

        const history = await getHistory(threadId);

        const userMsg = {
            role : 'user' as const,
            content : message.trim()
        };

        await appendToHistory(threadId,userMsg);

        const messagesForAgent = [...history,userMsg]

        const {answer,citations}  = await runProductAgent(messagesForAgent);

        const assistantMsg  = {
            role : 'assistant' as const,
            content : answer
        };

        await appendToHistory(threadId,assistantMsg);

        return res.status(200).json({
            ok : true,
            threadId,
            answer,
            citations
        })

    }
    catch(err){
        return res.status(500).json({
            ok : false,
            error:'error',
            message : err as any
        })
    }
});