import jwt from 'jsonwebtoken';

const KEY = process.env.JWT_KEY || 'test_key';
const COOKIE_NAME = 'auth_token'

const authentication = async (req, res, next) => {
  console.log('Checking Authentication');
  try {
    if (req.headers.cookie) {
      const cookieArray = req.headers.cookie
        .split(';')
        .filter((cookie) => cookie.indexOf(COOKIE_NAME) !== -1);
      if (cookieArray.length > 0) {
        const token = cookieArray[0].split('=')[1];

        if (!token) {
          console.log('Unauthenticated Request !')
          res.status(401).send({
            error: 'Not authorized to access this resource, no token',
          });
        } else {
          const data = await jwt.verify(token, KEY);
          req.user = data;
          console.log('Authenticated Request !');
        }
      }
    } else {
      console.log('No Cookie attached to Request !');
    }
    next();
  } catch (error) {
    res.status(500).send({ error: 'Something went wrong', });
  }
};

export const attachTokenToResponse = (response, dataToAttach) => {
  const signedValue = jwt.sign({ ...dataToAttach, }, KEY);
  return response.cookie(COOKIE_NAME, signedValue, { maxAge: 86400000, httpOnly: true, });
};

export const removeTokenToResponse = (response) => {
  return response.clearCookie(COOKIE_NAME, {});
}

export const mustBeLoggedIn = (req, res, next) => {
  try {
    const { user: cookieUser } = req;
    if (!cookieUser) throw new Error('You are not authenticated.');
    next();
  } catch (e) {
    console.log('Authentication is must for this Request')
    res.status(401).send({ status: "failure", message: e.message })
  }
}

export default authentication;