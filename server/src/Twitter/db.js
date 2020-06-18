import { makeDb } from '../db';

export const saveNewOauthToken = async ({ oauth_token, oauth_token_secret, oauth_callback_confirmed }) => {
  const db = await makeDb();
  const done = await db.collection('twitter').insertOne({ oauth_token, oauth_token_secret, oauth_callback_confirmed });
  return done.insertedId;
}

export const createOrUpdateTweets = async (tweets = []) => {
  const db = await makeDb();

  if (!tweets || tweets.length === 0) {
    throw new Error('No Tweets found');
  }

  const ids = [];
  const tweetsToPersist = tweets.map((tweet) => {
    tweet._id = tweet.id;
    ids.push(tweet._id);
    delete tweet.id;
  })

  try {
    await db.collection('timeline').insertMany(tweets, { ordered: false }).catch((e) => { console.log(e.message); });
    const tweetsFetched = await db.collection('timeline').find({ _id: { $in: ids } });
    return tweetsFetched.toArray();
  } catch (e) {
    console.error(e)
  }

}

export const fetchTweetsByUserId = async (userId, { page = 1, count = 50, location, hashtags }) => {
  const db = await makeDb();
  const query = { byUser: userId };
  if (location) {
    query.location = location
  }
  if (hashtags && hashtags.length > 0) {
    query.hashtags = { $elemMatch: { text: { $in: hashtags } } };
  }
  const skip = (page - 1) * count;
  console.log(skip, count);

  const data = await db.collection('timeline').find(query).skip(skip).limit(parseInt(count));
  const tweets = await data.toArray();

  const total = await db.collection('timeline').find(query).count();

  return {
    tweets, total
  }
}

export const groupByUserName = async (count = 5) => {
  const db = await makeDb();
  const data = await db.collection('timeline').aggregate([
    { $group: { _id: "$name", count: { $sum: 1 } } },
    { $sort: { count: -1 } },
    { $project: {  _id: 0, name: "$_id", count: 1 }
}
  ]).limit(count)
  return data.toArray();
}

export const fetchAllURLs = async( count = 5 ) => {
  const db = await makeDb();
  const data = await db.collection('timeline').find({},{ fields: { _id: 0, urls: 1}});
  return data.toArray();
}