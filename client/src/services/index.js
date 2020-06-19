import axios from 'axios';
import { SERVER_URL } from '../constants';

const instance = axios.create({
  withCredentials: true
})

const OAUTH_URL = '/twitter/oauth_token';
const ME_URL = '/user/me';
const ALL = '/all';
const TIMELINE = '/twitter/timeline';
const TIMELINE_SYNC = '/twitter/timeline/sync';
const LOGOUT = '/user/logout';
const ANALYSIS = '/twitter/timeline/analysis';

export const buildTwitterOauthURL = async () => {
  const { data: { oauth_url } } = await instance.get(`${SERVER_URL}${OAUTH_URL}`);
  return oauth_url;
}

export const currentUser = async ({ all } = {}) => {
  try {
    let url = `${SERVER_URL}${ME_URL}`;
    console.log(url);
    if (all) {
      url = url + ALL;
    }
    const { data } = await instance.get(url);
    console.log(data);
    return data;
  } catch (e) {
    return {};
  }
}

export const fetchTimeline = async ({page = 1, count = 50, hashtags, location}) => {
  let url = `${SERVER_URL}${TIMELINE}?page=${page}&count=${count}`;
  if(hashtags && hashtags.length>1){
    url = url + `&hashtags=${encodeURIComponent(hashtags)}`;
  }
  if(location && location.length>1){
    url = url + `&location=${encodeURIComponent(location)}`;
  }
  const { data } = await instance.get(url);

  return data;
}

export const logout = async () => {
  const { data } = await instance.get(`${SERVER_URL}${LOGOUT}`, {});
  return data;
}

export const analysis = async () => {
  const { data } = await instance.get(`${SERVER_URL}${ANALYSIS}`);
  return data;
}

export const sync = async () => {
  const { data } = await instance.get(`${SERVER_URL}${TIMELINE_SYNC}/7`);
  return data;
}