import { updateOrCreateTimeline, fetchByUserId, fetchQuery } from './db';

//Params required
const params = new Set();
params.add('id');
params.add('created_at');
params.add('full_text');

const entities_params = new Set();
entities_params.add('hashtags');
entities_params.add('urls');

const user_params = new Set();
user_params.add('name');
user_params.add('location');
user_params.add('profile_image_url');


export class Timeline {

  constructor({ id, userId, timeline }) {
    this.id = id;
    this.userId = userId;
    this.timeline = timeline;
  }

  static filterTimeLine(timeline) {
    const filteredTimeline = timeline.reduce((acc, tweet) => {
      try {
        const { entities = {}, user = {} } = tweet;
        const required = {};
        params.forEach((reqKey) => {
          required[reqKey] = tweet[reqKey];
        })

        entities_params.forEach((reqKey) => {
          required[reqKey] = entities[reqKey];
        })

        user_params.forEach((reqKey) => {
          required[reqKey] = user[reqKey];
        })
        if (required["urls"].length > 0) {
          acc.push(required);
        }
        return acc;
      } catch (e) {
        console.log(e.message);
      }
    }, [])
    return filteredTimeline;
  }

  save = async function () {
    await updateOrCreateTimeline(this);
  }

  load = async function () {
    const fetchFromDb = await fetchByUserId(this.userId);
    if (fetchFromDb == null) return;
    this.id = fetchFromDb._id;
    this.timeline = fetchFromDb.timeline;
  }

  query = async function ({ hashtags, location }) {
    const hashtagsArr = hashtags && hashtags.split(',') || [];
    if (hashtagsArr.length > 0) {
      console.log('Going to do HashTags Filter ')
      this.timeline = this.timeline.reduce((acc, tweet) => {
        const { hashtags } = tweet;
        hashtags.forEach(({ text }) => {
          if (hashtagsArr.includes(text)) {
            acc.push(tweet);
            return;
          }
        });
        return acc;
      }, []);
    }
    if (location) {
      console.log('Going to do Location Filter ', typeof location)

      this.timeline = this.timeline.reduce((acc, tweet) => {
        const { location: _location } = tweet;
        if (_location === location) {
          acc.push(tweet);
        }
        return acc;
      }, []);
    }
  }

  isAPIFetchRequired = function ({ days = 0 }) {
    const timeline = this.timeline;
    if (timeline == null || timeline.length < 1) {
      return true;
    }
    const requiredDate = new Date();
    requiredDate.setDate(requiredDate.getDate() - days);
    requiredDate.setHours(0);
    requiredDate.setMinutes(0);
    requiredDate.setSeconds(0);

    const lastTweet = timeline[timeline.length - 1];
    console.log(lastTweet.created_at);
    const lastDateTweet = new Date(lastTweet.created_at)
    lastDateTweet.setHours(0);
    lastDateTweet.setMinutes(0);
    lastDateTweet.setSeconds(0);
    console.log('--------------------')
    console.log('Required Date', requiredDate.toUTCString())
    console.log('Last Tweet Date', lastDateTweet.toUTCString())
    console.log('call should be made ? ', lastDateTweet.getTime() > requiredDate.getTime())
    console.log('--------------------')
    return lastDateTweet.getTime() > requiredDate.getTime();
  }

  calculateMostDomainShared = function () {
    const tweets = this.timeline;
    const domain = {};

    tweets.forEach(tweet => {
      const { urls } = tweet;
      urls.forEach((url) => {
        const { display_url } = url;
        let domainName = display_url;
        if(display_url.includes('/')){
          domainName = display_url.split('/')[0];
        }
        if(domain[domainName]){
          domain[domainName] = domain[domainName] + 1;
        }else{
          domain[domainName] = 1;
        }
      })
    });

    return domain;
  }

  calculateUserSharedMostLinks = function(){
    const tweets = this.timeline;
    const user = {};

    tweets.forEach(tweet => {
      const { name } = tweet;
      if(user[name]){
        user[name] = user[name] + 1;
      }else{
        user[name] = 1;
      }
    });

    return user;
  }

}