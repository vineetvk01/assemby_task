import crypto from 'crypto';

export const base64Encode = (string) => {
  return Buffer.from(string).toString('base64');
}

export const base64Decode = (b64Encoded) => {
  return Buffer.from(b64Encoded, 'base64').toString();
}

export const base64String = (hexString) => {
  return Buffer.from(hexString, 'hex').toString('base64');
}

export const hexString = (base64String) => {
  return Buffer.from(base64String, 'base64').toString('hex');
}

export const hashHMACSHA1 = (text, key) => {
  return crypto.createHmac('sha1', key)
    .update(text)
    .digest('hex')
}

export const genNonce = (length) => {
  var text = "";
  var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  for(var i = 0; i < length; i++) {
      text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
}

export const objectFromString = (string) => {
  const _obj = {};
  let data = [];
  if(string.includes('&')){
    data.push(...string.split('&'));
  }else{
    data.push(string);
  }

  data.forEach((eachPair)=>{
    const [key, value] = eachPair.split('=');
    _obj[key] = value;
  })

  return _obj;
}