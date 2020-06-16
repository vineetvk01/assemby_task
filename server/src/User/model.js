import { updateOrCreate, findUserById } from './db';

export class User {

  id;
  email;
  linkedAccounts;

  constructor({ id, email, linkedAccounts }) {
    this.id = id;
    this.email = email;
    this.linkedAccounts = linkedAccounts;
  }

  save = async function(){
    const { id } = await updateOrCreate(this);
    this.id = id;
  }

  load = async function(){
    const userdb = await findUserById(this.id);
    this.email = userdb.email;
    this.linkedAccounts = userdb.linkedAccounts;
  }

  toSession = function(){
    if(!this.id){
      throw new Error('Id is required for to String. Please persist the data first.')
    }

    return {
      id: this.id,
      email: this.email,
    };
  }

  static makeFromTwitter = async function (twitterUser) {
    await twitterUser.fetchAccountInfo();
    if (twitterUser.email == null) {
      throw new Error('Email is absent in the user info');
    }
    //console.log(twitterUser);
    const user = new User({ email: twitterUser.email, linkedAccounts: { twitter: twitterUser } });
    if (!user) {
      throw new Error('No user found with the authenticated token.')
    }
    await user.save();
    return user;
  }
}