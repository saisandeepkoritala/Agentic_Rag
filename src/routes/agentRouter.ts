import { runProductAgent } from "@/agent/03_agent";
import { Router } from "express";



export const agentRouter = Router();

agentRouter.post("/chat",async(req,res)=>{
    try{

        const {message} = req.body as {message?: string};

        if(!message){
            return  res.status(400).json({
                ok:false,
                message:'message is required'
            })
        }

        const userMsg = {
            role : 'user' as const,
            content : message.trim()
        };

        const {answer,citations}  = await runProductAgent([userMsg]);

        return res.status(200).json({
            ok : true,
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