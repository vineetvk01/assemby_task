import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import bodyParser from 'body-parser';
import authentication, { attachTokenToResponse, removeTokenToResponse, mustBeLoggedIn } from './middleware/authentication';

const app = express();

import userRoutes from './controllers/user';
import twitterRoutes from './controllers/twitter';


dotenv.config();

const PUBLIC_URL = path.join(__dirname, '../public');

app.use(bodyParser.json());
app.use(express.static(PUBLIC_URL));

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

app.use('/user', mustBeLoggedIn, userRoutes);
app.use('/twitter', twitterRoutes );

app.use(function (req, res, next) {
  res.status(404);
  if (req.accepts('json')) {
    res.send({ status: '404', error: 'Not found', });
    return;
  }
  next();
});

export default app;