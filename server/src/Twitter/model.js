import { createOrUpdateTweets, fetchTweetsByUserId, fetchAllURLs, groupByUserName } from './db';

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

  constructor({ userId, tweets = [], total }) {
    this.userId = userId;
    this.tweets = tweets.map((_tweet) => {
      var tweet = Object.assign({}, _tweet);
      tweet.byUser = this.userId;
      return tweet;
    })
    this.total = total;
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
    const tweetsInserted = await createOrUpdateTweets(this.tweets);
    this.tweets = tweetsInserted;
  }

  load = async function (query) {
    const { tweets, total } = await fetchTweetsByUserId(this.userId, query);
    this.tweets = tweets;
    this.total = total;
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

  calculateMostDomainShared = async function () {
    const urlsArrayFetched = await fetchAllURLs();

    const urls = urlsArrayFetched.reduce((acc, urlArray) => {
      const { urls } = urlArray;
      return [...acc, ...urls];
    }, []);

    const domainCounts = urls.reduce((domains, url) => {
      const { display_url } = url;
      let domainName = display_url;
      if (display_url.includes('/')) {
        domainName = display_url.split('/')[0];
      }
      if (domains[domainName]) {
        domains[domainName] = domains[domainName] + 1;
      } else {
        domains[domainName] = 1;
      }
      return domains;
    }, {});

    let sortable = [];
    for (let domain in domainCounts) {
      sortable.push([domain, domainCounts[domain]]);
    }

    sortable.sort(function (a, b) {
      return b[1] - a[1];
    });

    return sortable;
  }

  calculateUserSharedMostLinks = function () {
    return groupByUserName();
  }

}