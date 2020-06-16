import app from './app';

const normalizePort = (val) => {
  const port = parseInt(val, 10);

  if (isNaN(port)) {
    return val;
  }

  if (port >= 0) {
    return port;
  }
  return false;
};

const port = normalizePort('4000');

app.listen(port, () => {
  console.log('Server listening on port ' + port);
});