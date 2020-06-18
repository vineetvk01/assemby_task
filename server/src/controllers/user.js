import express from 'express';
import { User } from '../User/model';
import {removeTokenToResponse } from '../middleware/authentication';

const route = express.Router();


route.get('/me', (req, res) => {
  try {
    const { user } = req;
    res.status(200).send({
      user
    });
  } catch (e) {
    res.status(500).send({
      message: e.message
    })
  }
});

route.get('/logout', (req, res) => {
  try {
    console.log('Logout is requested')
    res = removeTokenToResponse(res);
    res.sendStatus(200);
  } catch (e) {
    res.status(500).send({
      message: e.message
    })
  }
})

route.get('/me/all', async (req, res) => {
  try {
    const { user: cookieUser } = req;
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


export default route;