import { Document } from "@langchain/core/documents";
import {RecursiveCharacterTextSplitter} from "@langchain/textsplitters";

const CHUNK_SIZE = 800;
const CHUNK_OVERLAP = 150;


const splitter = new RecursiveCharacterTextSplitter({
    chunkSize : CHUNK_SIZE,
    chunkOverlap : CHUNK_OVERLAP
});

export async function splitDocuments(docs : Document[]) : Promise<Document[]>{
    if(!docs.length) return [];

    const chunks = await splitter.splitDocuments(docs);

    return chunks.map((chunk,index)=>{
        const base = chunk?.metadata ?? {};

        return new Document({
            pageContent : chunk.pageContent.trim(),
            metadata :{
                ...base,
                source : base?.source ?? 'Unknown_Source',
                _chunkIndex : index
            }
        });

    });

    
}