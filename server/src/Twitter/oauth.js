import axios from 'axios';
import { Timeline } from './model';
import { hashHMACSHA1, base64String, objectFromString } from '../utils';
import { saveNewOauthToken, updateOauthToken } from './db';
import btoa from 'btoa';


const TWITTER_API_URL = 'https://api.twitter.com';
const TWITTER_CLIENT_OAUTH = '/oauth/authorize';

const VERIFY_CREDENTIALS = {
  url: '/1.1/account/verify_credentials.json',
  method: 'get',
  headers: ['oauth_signature_method', 'oauth_timestamp', 'oauth_consumer_key', 'oauth_version']
}

const REQUEST_TOKEN = {
  url: '/oauth/request_token',
  method: 'post',
  headers: ['oauth_callback', 'oauth_signature_method', 'oauth_timestamp', 'oauth_consumer_key', 'oauth_version']
}

const ACCESS_TOKEN = {
  url: '/oauth/access_token',
  method: 'post',
  headers: ['oauth_signature_method', 'oauth_timestamp', 'oauth_consumer_key', 'oauth_version', 'oauth_token']
}

const HOME_TIMELINE = {
  url: '/1.1/statuses/home_timeline.json',
  method: 'get',
  headers: ['oauth_signature_method', 'oauth_timestamp', 'oauth_consumer_key', 'oauth_version']
}

export class Twitter {

  static consumerKey = process.env.TWITTER_CONSUMER_KEY;
  static consumerSecret = process.env.TWITTER_CONSUMER_SECRET;
  static callback = process.env.OAUTH_CALLBACK_URL;
  static access_token_secret = process.env.ACCESS_TOKEN_SECRET;
  static access_token = process.env.ACCESS_TOKEN;

  constructor(screen_name, user_id, oauth_token, oauth_token_secret) {
    this.screen_name = screen_name;
    this.user_id = user_id;
    this.oauth_token = oauth_token;
    this.oauth_token_secret = oauth_token_secret;
  }

  static signOauthHeaders = (request, oauthHeaders, access_token_secret = '') => {
    const completeURL = `${TWITTER_API_URL}${request.url}`;
    const method = request.method && request.method.toUpperCase();
    const completeUnsignedRequest = `${method}&${encodeURIComponent(completeURL)}&${encodeURIComponent(oauthHeaders)}`;
    const key = `${encodeURIComponent(Twitter.consumerSecret)}&${encodeURIComponent(access_token_secret)}`;
    const signedOauth = hashHMACSHA1(completeUnsignedRequest, key);
    return encodeURIComponent(base64String(signedOauth));
  }


  static generate(key) {
    switch (key) {
      case 'oauth_callback': return Twitter.callback;
      case 'oauth_consumer_key': return Twitter.consumerKey;
      case 'oauth_nonce': return btoa(`${Twitter.consumerKey}${Math.floor(Date.now() / 1000)}`)
      case 'oauth_timestamp': return Math.floor(Date.now() / 1000);
      case 'oauth_version': return '1.0';
      case 'oauth_signature_method': return "HMAC-SHA1";
      default: return '';
    }
  }

  static makeOauthToken = async function () {
    try {
      const oauth_nonce = encodeURIComponent(Twitter.generate('oauth_nonce'));
      const _auth_String = REQUEST_TOKEN.headers.map((key) => {
        return `${key}=${encodeURIComponent(Twitter.generate(key))}`
      })
      _auth_String.push(`oauth_nonce=${oauth_nonce}`);

      const oauth_signature = Twitter.signOauthHeaders(REQUEST_TOKEN, _auth_String.sort().join('&'));
      const auth_String = REQUEST_TOKEN.headers.map((key) => {
        return `${key}="${encodeURIComponent(Twitter.generate(key))}"`
      })
      auth_String.push(`oauth_signature="${oauth_signature}"`);
      auth_String.push(`oauth_nonce="${oauth_nonce}"`);

      const oauth = auth_String.sort().join(',');
      const response = await axios[REQUEST_TOKEN.method](`${TWITTER_API_URL}${REQUEST_TOKEN.url}`, {}, {
        headers: {
          'Authorization': `OAuth ${oauth}`
        }
      });

      const { data } = response;

      const obj = objectFromString(data);
      obj.id = await saveNewOauthToken(obj);
      obj.oauth_url = `${TWITTER_API_URL}${TWITTER_CLIENT_OAUTH}?oauth_token=${obj.oauth_token}`;
      return obj;


    } catch (e) {
      console.log(e.response && e.response.data || e)
    }
  }

  static makeFromIdentifier = async function (identity) {
    try {
      const oauth_nonce = encodeURIComponent(Twitter.generate('oauth_nonce'));
      const _auth_String = REQUEST_TOKEN.headers.map((key) => {
        return `${key}=${encodeURIComponent(Twitter.generate(key))}`
      })
      _auth_String.push(`oauth_nonce=${oauth_nonce}`);
      _auth_String.push(`oauth_verifier=${identity.oauth_verifier}`);
      _auth_String.push(`oauth_token=${identity.oauth_token}`);

      const oauth_signature = Twitter.signOauthHeaders(ACCESS_TOKEN, _auth_String.sort().join('&'));

      const auth_String = REQUEST_TOKEN.headers.map((key) => {
        return `${key}="${encodeURIComponent(Twitter.generate(key))}"`
      })
      auth_String.push(`oauth_signature="${oauth_signature}"`);
      auth_String.push(`oauth_nonce="${oauth_nonce}"`);

      const oauth = auth_String.sort().join(',');

      const response = await axios[ACCESS_TOKEN.method](`${TWITTER_API_URL}${ACCESS_TOKEN.url}?oauth_token=${identity.oauth_token}&oauth_verifier=${identity.oauth_verifier}`, {}, {
        headers: {
          'Authorization': `OAuth ${oauth}`
        }
      });

      const { data } = response;
      const { screen_name, user_id, oauth_token, oauth_token_secret } = objectFromString(data);
      return new Twitter(screen_name, user_id, oauth_token, oauth_token_secret);

    } catch (e) {
      console.log('error')
      console.log(e.response.data || e);
    }
  }

  fetchAccountInfo = async function () {
    try {
      const oauth_nonce = encodeURIComponent(Twitter.generate('oauth_nonce'));
      const _auth_String = VERIFY_CREDENTIALS.headers.map((key) => {
        return `${key}=${encodeURIComponent(Twitter.generate(key))}`
      })
      _auth_String.push(`oauth_nonce=${oauth_nonce}`);
      _auth_String.push(`oauth_token=${this.oauth_token}`);
      _auth_String.push(`include_email=true`);

      const oauth_signature = Twitter.signOauthHeaders(VERIFY_CREDENTIALS, _auth_String.sort().join('&'), this.oauth_token_secret);
      //console.log('Signed Oauth: ', oauth_signature);
      const auth_String = VERIFY_CREDENTIALS.headers.map((key) => {
        return `${key}="${encodeURIComponent(Twitter.generate(key))}"`
      })
      auth_String.push(`oauth_signature="${oauth_signature}"`);
      auth_String.push(`oauth_nonce="${oauth_nonce}"`);
      auth_String.push(`oauth_token="${this.oauth_token}"`);

      const oauth = auth_String.sort().join(',');
      const response = await axios.get(`${TWITTER_API_URL}${VERIFY_CREDENTIALS.url}?include_email=true`, {
        headers: {
          'Authorization': `OAuth ${oauth}`
        }
      });

      const { data } = response;
      const { id, name, screen_name, location, description, profile_image_url, email } = data;
      this.twitter_id = id;
      this.name = name;
      this.screen_name = screen_name;
      this.location = location;
      this.description = description;
      this.profile_image_url = profile_image_url;
      this.email = email;

    } catch (e) {
      console.log(e.response.data);
    }
  }

  fetchHomeTimeline = async function (max_id) {
    console.log(' Going to make API call for MAX_ID, ', max_id)
    let max_id_string = '';
    try {
      const oauth_nonce = encodeURIComponent(Twitter.generate('oauth_nonce'));
      const _auth_String = HOME_TIMELINE.headers.map((key) => {
        return `${key}=${encodeURIComponent(Twitter.generate(key))}`
      })
      _auth_String.push(`oauth_nonce=${oauth_nonce}`);
      _auth_String.push(`oauth_token=${this.oauth_token}`);
      _auth_String.push(`count=400`);
      _auth_String.push(`tweet_mode=extended`);
      if (max_id && max_id != 0) {
        max_id_string = `max_id=${max_id}`
        _auth_String.push(max_id_string);
      }

      const oauth_signature = Twitter.signOauthHeaders(HOME_TIMELINE, _auth_String.sort().join('&'), this.oauth_token_secret);
      //console.log('Signed Oauth: ', oauth_signature);
      const auth_String = HOME_TIMELINE.headers.map((key) => {
        return `${key}="${encodeURIComponent(Twitter.generate(key))}"`
      })
      auth_String.push(`oauth_signature="${oauth_signature}"`);
      auth_String.push(`oauth_nonce="${oauth_nonce}"`);
      auth_String.push(`oauth_token="${this.oauth_token}"`);

      const oauth = auth_String.sort().join(',');
      const response = await axios.get(`${TWITTER_API_URL}${HOME_TIMELINE.url}?count=400&tweet_mode=extended&${max_id_string}`, {
        headers: {
          'Authorization': `OAuth ${oauth}`
        }
      });

      const { data } = response;
      return data;
    } catch (e) {
      console.log(e.response.data);
    }
  }

  fetchFilteredTimeLine = async function ({ days = 0 }) {
    const requiredDaysBack = new Date();
    requiredDaysBack.setDate(requiredDaysBack.getDate() - days);

    let max_id = 0;
    let last_date = new Date();
    const result = []
    try {
      do {
        const fetched = await this.fetchHomeTimeline(max_id);
        if(!fetched || fetched.length === 0){
          throw new Error('Unable to fetch API');
        }
        console.log("Fetched Tweets : ", fetched.length);
        if(fetched.length < 2){
          throw new Error('Fetched ! Same Id loop ! No more Tweets !')
        }
        const { created_at, id } = fetched[fetched.length - 1];
        const filtered = Timeline.filterTimeLine(fetched);
        console.log("Filtered Tweets : ", filtered.length);
        result.push(...filtered);
        
        last_date = new Date(created_at);
        console.log("Current Cursor at, ", last_date.toUTCString(), last_date.getTime())
        console.log("Required Till, ", requiredDaysBack.toUTCString(), requiredDaysBack.getTime())
        console.log(id)
        max_id = id;
      } while (last_date.getTime() > requiredDaysBack.getTime())
    } catch (err) {
      console.log('Error while fetching : ', err.message)
    }
    return result;
  }

}