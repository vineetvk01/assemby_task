import express from 'express';
import path from 'path';

import { attachTokenToResponse, mustBeLoggedIn } from '../middleware/authentication';
import { User } from '../User/model';
import { TwitterOauth } from '../Twitter/oauth';
import { Timeline } from '../Twitter/model';

const PUBLIC_URL = path.join(__dirname, '../../public');

const route = express.Router();


route.get('/oauth_token', async (req, res) => {
  try {
    const identity = await TwitterOauth.makeOauthToken();
    res.status(200).send({
      ...identity
    })
  } catch (e) {
    console.error(e);
    res.sendStatus(500)
  }
})

route.get('/timeline/sync/:days?', mustBeLoggedIn, async (req, res) => {
  try {
    const { user: cookieUser } = req;
    const { days = 0 } = req.params;

    const user = new User({ id: cookieUser.id });
    await user.load();

    const { linkedAccounts: { twitter: { screen_name, user_id, oauth_token, oauth_token_secret } } } = user;

    const twitterOauth = new TwitterOauth(screen_name, user_id, oauth_token, oauth_token_secret);
    const filteredTweets = await twitterOauth.fetchFilteredTweets({ days });
    const timeline = new Timeline({ userId: user.id, tweets: filteredTweets });
    timeline.save();

    res.send({
      success: true,
      total_synced: timeline.tweets.length
    });
  } catch (e) {
    console.error(e);
    res.sendStatus(401)
  }
});

route.get('/timeline', mustBeLoggedIn, async (req, res) => {
  const { user, query } = req;
  const { hashtags, location } = query;

  if (hashtags) {
    console.log(hashtags);
    query.hashtags = hashtags.trim().split(',');
  }

  if (location) {
    query.location = decodeURIComponent(location);
  }

  console.log('Page : ',query.page)
  const timeline = new Timeline({ userId: user.id });
  await timeline.load(query);
  console.log('Page After: ',query.page)

  res.status(200).send({
    status: "success",
    tweets: timeline.tweets,
    page: query.page || 1,
    total_count: timeline.total
  })
});

route.get('/timeline/analysis', mustBeLoggedIn, async (req, res) => {
  const { user } = req;

  const timeline = new Timeline({ userId: user.id });
  const user_shared_most_links = await timeline.calculateUserSharedMostLinks();
  const top_domain_shared = await timeline.calculateMostDomainShared();

  res.status(200).send({
    status: "success",
    user_shared_most_links,
    top_domain_shared
  })
});

route.get('/oauth_callback', async (req, res) => {
  try {
    const { query: identity } = req;
    if (identity && identity.denied) {
      console.log('Twitter login was denied by the user');
      res.sendFile(PUBLIC_URL + '/denied.html');
      return;
    }

    const twitterUser = await TwitterOauth.makeFromIdentifier(identity);

    if (!twitterUser) {
      throw new Error('Unable to fetch user from Twitter');
    }
    console.log('User is fetched from the account')
    const user = await User.makeFromTwitter(twitterUser);
    console.log('User To be Signed', user.toSession());
    res = attachTokenToResponse(res, user.toSession());
    
    if (identity && identity.oauth_token && identity.oauth_verifier) {
      res.sendFile(PUBLIC_URL + '/approved.html');
      return;
    }

  } catch (e) {
    const message = e.response && e.response.data || e.message;
    console.log(e.response && e.response.data || e)
    res.status(500).send({
      message
    });
  }
});


export default route;