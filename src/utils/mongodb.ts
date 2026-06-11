import { Db, MongoClient } from "mongodb";
import { env } from "./env";


let client : MongoClient | null = null;
let db : Db | null = null;


export async function getMongoClient() : Promise<MongoClient>{
    if(client) return client;

    client = new MongoClient(env.MONGODB_ATLAS_URI,{});
    await client.connect();

    console.log('Connected to Mongodb');
    return client;
};

export async function getDb() : Promise<Db>{
    if(db) return db;

    const extractMongoClient = await getMongoClient();
    db = extractMongoClient.db(env.MONGODB_DB_NAME);

    console.log(`Using this Db ${env.MONGODB_DB_NAME}`);
    return db;
}