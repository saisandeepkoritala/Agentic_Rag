import { Collection } from "mongodb";
import {MongoDBAtlasVectorSearch} from "@langchain/mongodb";
import { getDb } from "@/utils/mongodb";
import { embeddings } from "@/utils/openai";

const KB_COLLECTION_NAME = 'kb_chunks';

const KB_INDEX_NAME = 'kb_vector_index';

let collection :  Promise<Collection> | null = null;
let vectorStore : Promise<MongoDBAtlasVectorSearch> | null = null;


export async function getKbCollection() : Promise<Collection>{
    if(!collection){

        collection = (
            async () => {
            const db = await getDb();
            return db.collection(KB_COLLECTION_NAME);
        }
    )();

    }
    
    return collection;
};



export async function getVectorStore() : Promise<MongoDBAtlasVectorSearch> {
    if(!vectorStore){

        vectorStore = (

            async () => {
            const getCollection = await getKbCollection();

            const vectorStore = new MongoDBAtlasVectorSearch(embeddings,{
                collection : getCollection as any,
                indexName : KB_INDEX_NAME,
                textKey : 'text',
                embeddingKey : 'embedding'
            });

            return vectorStore;
        }
    )();

    }

    return vectorStore;
};