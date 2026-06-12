import {z} from 'zod';
import {tool} from 'langchain';
import { retreiveRelevantChunks } from '@/kb/05_retreival';


const DEFAULT_NAMESPACE = 'default';


export const kbSearchTool = tool(
    async({question})=>{
        const ns = DEFAULT_NAMESPACE
        const {docs,confidence} = await retreiveRelevantChunks(question,ns,2);

        const context = docs.map((doc)=>{
            const source = (doc?.metadata?.source as string) || 'Unknown source';

            const chunkId = (doc?.metadata?.chunkId as number) ?? (
                doc?.metadata?._chunkIndex as number
            );

            const preview = doc.pageContent.length > 400 ? 
            doc.pageContent.slice(0,400) + '...' : doc.pageContent;

            return {
                source,
                chunkId,
                preview
            };

        });

        return {
            confidence,
            ns,
            context
        };
    },
    {
        name : 'kb_search',
        description : 'Search the documentation for relevant answers',
        schema:z.object({
            question :z.string().describe("User's question or follow up that must be answered from docs"),
            // namespace : z.string().describe("KB namespace to query")
        }) 
    },
);

export const agentTools = [kbSearchTool];