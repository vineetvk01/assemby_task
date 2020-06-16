import { makeDb } from '../db';

export const saveNewOauthToken = async ({oauth_token, oauth_token_secret, oauth_callback_confirmed}) => {
  const db = await makeDb();
  const done = await db.collection('twitter').insertOne({oauth_token, oauth_token_secret, oauth_callback_confirmed});
  return done.insertedId;
}

export const updateOrCreateTimeline = async ( timelineObj ) => {
  delete timelineObj.id;
  const db = await makeDb();
  const query = { userId : timelineObj.userId };
  const config = { upsert: true, returnNewDocument: true };
  const update = {
    "$set": { timeline : timelineObj.timeline }
  };
  const data = await db.collection('timeline').findOneAndUpdate(query, update, config);
  const timelineInDb = {...data.value};
  timelineInDb.id = data.value && data.value._id;
  delete timelineInDb._id; 
  return timelineInDb;
}

export const fetchByUserId = async (userId) => {
  const db = await makeDb();
  const query = { userId };
  const data = await db.collection('timeline').findOne(query);
  return data;
}
