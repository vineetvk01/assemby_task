import mongodb from 'mongodb';
import dotenv from 'dotenv';

dotenv.config();

const MongoClient = mongodb.MongoClient;
const url = process.env.MONGODB_URL;
const dbName = process.env.DATABASE_NAME;
const client = new MongoClient(url, { useNewUrlParser: true, useUnifiedTopology: true, });

export async function makeDb() {
  if (!client.isConnected()) {
    await client.connect();
  }
  return client.db(dbName);
}

export function makeObjectId(idString){
  return new mongodb.ObjectID(idString);
}