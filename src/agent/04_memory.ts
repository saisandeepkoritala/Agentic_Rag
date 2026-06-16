import { getDb } from "@/utils/mongodb";
import { Collection, WithId } from "mongodb";
import { nanoid } from "nanoid";

export type ChatRole =  'user' | 'assistant';

export interface ChatMessage{
    role : ChatRole,
    content : string,
};

export interface ConversationDoc {
    threadId : string,
    messages : {
        role :  ChatRole,
        content : string,
    }[],
    createdAt : Date,
    updatedAt : Date
};


const conversation_collection = 'conversations';

let convCollectionPromise : Promise<Collection<ConversationDoc>> | null = null;

export function getConversationsCollection(): Promise<Collection<ConversationDoc>> {
    if (!convCollectionPromise) {
        // We assign the execution promise directly to the cache variable
        convCollectionPromise = (async () => {
            const db = await getDb();
            const col = db.collection<ConversationDoc>(conversation_collection);
            await col.createIndex({ threadId: 1 }, { unique: true });
            return col;
        })();
    }

    // convCollectionPromise is guaranteed to be a Promise here, satisfying the return type
    return convCollectionPromise;
}


export async function ensureThreadId(isThreadIdPresent ?: string) :Promise<string>{
    const col = await getConversationsCollection();

    if(isThreadIdPresent){
        const existing = await col.findOne({threadId : isThreadIdPresent});
        if(existing) return isThreadIdPresent;
    }   

    const threadId = nanoid(12);
    const now = new Date();

    await col.insertOne({
            threadId,
            messages : [],
            createdAt : now,
            updatedAt : now
    });

    return threadId;
};


export async function getHistory(threadId : string){

    const col = await getConversationsCollection();
    const conv : WithId<ConversationDoc> | null = await col.findOne({threadId});

    if(!conv) return []

    return conv.messages.map(msg =>({
        role : msg.role,
        content : msg.content,
    }));
};

export async function appendToHistory(threadId : string,...messages : ChatMessage[])
: Promise<void>{
    if(!messages.length) return;

    const col = await getConversationsCollection();

    const messagesWithTs = messages.map(msg=>({
        role : msg.role,
        content : msg.content,
    }));

    await col.updateOne(
        {threadId},
        {
            $push:{
                messages:{
                    $each : messagesWithTs
                }
            },
            $set:{
                updatedAt : new Date()
            }
        }
    )
};

