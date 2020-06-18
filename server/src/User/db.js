import { makeDb, makeObjectId } from '../db';

export const updateOrCreate = async ( user ) => {
  delete user.id;
  const db = await makeDb();
  const query = { email : user.email };
  const config = { upsert: true, returnNewDocument: true };
  const update = {
    "$set": { linkedAccounts : user.linkedAccounts }
  };
  
  const data = await db.collection('users').findOneAndUpdate(query, update, config);
  const userInDb = {...data.value};
  userInDb.id = data.value && data.value._id;
  delete userInDb._id; 
  return userInDb;
}

export const findUserById = async (id) => {
  const db = await makeDb();
  const query = { _id : makeObjectId(id) };
  const data = await db.collection('users').findOne(query);
  return data;
}


