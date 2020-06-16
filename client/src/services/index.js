import axios from 'axios';
import { SERVER_URL } from '../constants';

const OAUTH_URL = '/twitter/oauth_token';
const ME_URL = '/user/me';
const ALL = '/all';
const TIMELINE = '/twitter/timeline';
const LOGOUT = '/user/logout';

export const buildTwitterOauthURL = async () => {
  const { data: { oauth_url } } = await axios.get(`${SERVER_URL}${OAUTH_URL}`, { withCredentials: true });
  return oauth_url;
}

export const currentUser = async ({all}) => {
  try {
    let url = `${SERVER_URL}${ME_URL}`;
    if(all){
      url = url + ALL;
    }
    const { data } = await axios.get(url, { withCredentials: true });
    return data;
  } catch (e) {
    return {};
  }
}

export const fetchTimeline = async () => {
  const { data } = await axios.get(`${SERVER_URL}${TIMELINE}`, { withCredentials: true });
  return data;
}

export const logout = async () => {
  const { data } = await axios.post(`${SERVER_URL}${LOGOUT}`, { withCredentials: true });
  return data;
}
