import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import bodyParser from 'body-parser';
import authentication, { attachTokenToResponse, removeTokenToResponse } from './middleware/authentication';
import axios from 'axios';

const app = express();

import { User } from './User/model';
import { Twitter } from './Twitter/oauth';
import { Timeline } from './Twitter/model';


dotenv.config();

const PUBLIC_URL = path.join(__dirname, '../public');

app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, '../public')));
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Credentials', true);
  res.header('Access-Control-Allow-Origin', req.headers.origin);
  res.header(
    'Access-Control-Allow-Methods',
    'GET,PUT,POST,DELETE,UPDATE,OPTIONS'
  );
  res.header('Access-Control-Allow-Headers', 'Content-Type, *');
  next();
});
app.use(authentication);

app.get('/user/me', (req, res) => {
  try {
    const { user } = req;
    if (!user) throw new Error('You are not authenticated.');
    res.status(200).send({
      user
    });
  } catch (e) {
    res.status(401).send({
      message: e.message
    })
  }
})

app.post('/user/logout', (req, res) => {
  try {
    const { user } = req;
    if (!user) throw new Error('You are not authenticated.');
    res = removeTokenToResponse(res);
  } catch (e) {
    res.status(401).send({
      message: e.message
    })
  }
})

app.get('/user/me/all', async (req, res) => {
  try {
    const { user: cookieUser } = req;
    if (!cookieUser) throw new Error('You are not authenticated.');
    const user = new User({ id: cookieUser.id });
    await user.load();
    res.status(200).send({
      user
    });
  } catch (e) {
    console.log(e);
    res.status(401).send({
      message: e.message
    })
  }
})

app.get('/twitter/oauth_token', async (req, res) => {
  try {
    const identity = await Twitter.makeOauthToken();
    res.status(200).send({
      ...identity
    })
  } catch (e) {
    console.error(e);
    res.sendStatus(500)
  }
})

app.get('/twitter/timeline', async (req, res) => {
  try {
    const { user: cookieUser } = req;
    if (!cookieUser) throw new Error('You are not authenticated.');
    const user = new User({ id: cookieUser.id });

    const { query: { hashtags, location } } = req;

    let timeline = new Timeline({ userId: user.id });
    await timeline.load();

    if (timeline.isAPIFetchRequired({ days: 7 })) {
      await user.load();
      const { linkedAccounts: { twitter: { screen_name, user_id, oauth_token, oauth_token_secret } } } = user;
      const twitterOauth = new Twitter(screen_name, user_id, oauth_token, oauth_token_secret);
      const filteredTimeline = await twitterOauth.fetchFilteredTimeLine({ days: 7 });
      timeline = new Timeline({ userId: user.id, timeline: filteredTimeline });
      timeline.save();
    }

    const _location = location && decodeURIComponent(location);

    timeline.query({ hashtags, location: _location });

    const top_domain_shared = timeline.calculateMostDomainShared();
    const user_shared_most_links = timeline.calculateUserSharedMostLinks();

    res.send({
      total: timeline.timeline.length || 0,
      timeline: timeline.timeline,
      top_domain_shared,
      user_shared_most_links
    });
  } catch (e) {
    console.error(e);
    res.sendStatus(401)
  }
})

// app.get('/twitter/search', async (req, res) => {
//   try {
//     const { user: cookieUser } = req;
//     if (!cookieUser) throw new Error('You are not authenticated.');
//     const user = new User({ id: cookieUser.id });

//     const { query: { hashtags, location } } = req;
//     let timeline = new Timeline({ userId: user.id });
//     await timeline.query({ hashtags, location })
//     res.send({ timeline })
//   } catch (e) {
//     console.error(e);
//     res.sendStatus(401)
//   }
// })


app.get('/oauth/twitter', async (req, res) => {
  try {
    const { query: identity } = req;
    if (identity && identity.denied) {
      console.log('Twitter login was denied by the user');
      res.sendFile(PUBLIC_URL + '/denied.html');
      return;
    }

    //const twitterUser = await Twitter.makeFromIdentifier(identity);
    //console.log(twitterUser);
    const twitterUser = new Twitter();
    twitterUser.oauth_token = '98348061-brJLTo1wriE1CG1GYtRTo4UHGpmglScRMrNa8f4kX';
    twitterUser.oauth_token_secret = 'XfgpYItbKOLuw2NN6vuSaqKl6Jj0ufPbAMWGDAmhAl8TP';
    if (!twitterUser) {
      throw new Error('Unable to fetch user from Twitter');
    }
    const user = await User.makeFromTwitter(twitterUser);
    user.toString();
    //console.log('User For Signed', user.toString());
    res = attachTokenToResponse(res, user.toSession());
    res.sendStatus(200);

  } catch (e) {
    const message = e.response && e.response.data || e.message;
    console.log(e.response && e.response.data || e)
    res.status(500).send({
      message
    });
  }
})


app.use(function (req, res, next) {
  res.status(404);
  // respond with json
  if (req.accepts('json')) {
    res.send({ status: '404', error: 'Not found', });
    return;
  }
  next();
});

export default app;