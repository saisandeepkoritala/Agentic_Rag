import { Document } from "@langchain/core/documents";
import { getVectorStore } from "./03_vectorStore";

export interface IngestSummary {
    ok : boolean,
    namespace : string,
    totalChunks : number,
    sources :  string[]
};

export async function ingestDocuments(namespace:string, chunks:Document[]){
    if(!namespace) throw new Error('Namespace is needed');

    if(!chunks.length){
        return {
            ok : false,
            namespace,
            totalChunks:0,
            sources : []
        }
    } 

    const vectorstore = await getVectorStore();

    let currentId = 0;

    const docsWithMeta = chunks.map((chunk)=>{
        const source = (chunk?.metadata?.source as string) || 'Unknown_Source';

        const doc = new Document({
            pageContent : chunk.pageContent,
            metadata : {
                namespace,
                source,
                chunkId : currentId++
            }
        });

        return doc;
    });

    await vectorstore.addDocuments(docsWithMeta);

    const sources = Array.from(new Set(docsWithMeta.map(d=>d.metadata.source as string)));

    return {
        ok : true,
        namespace,
        totalChunks : docsWithMeta.length,
        sources
    };

}