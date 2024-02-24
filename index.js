require('dotenv').config();
const express = require('express')
const cors = require('cors');
const Utils = require('./utils/utils');
const util = new Utils();

const routes = require('./routes');


const PORT = process.env.PORT || 5050;
const app = express()

app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.post('/api/*', async (req, res, next) => {
  await handleAuthenticationToken(req, res, next);
});

app.get('/api/*', async (req, res, next) => {
  await handleAuthenticationToken(req, res, next);
});

// Load the /index routes
app.use('/api/user', routes.user);
app.use('/api/data', routes.data);
app.use('/api/notion', routes.notion);

// Global error handling
// app.use((err, _req, res, next) => {
//   res.status(500).send("Uh oh! An unexpected error occured.")
// })

app.use((req, res, next) => {
  const status = 404; //404 not found
  res.status(status);
  res.send({});
});

async function handleAuthenticationToken(req, res, next) {
  let url = req.url;
  let anonymousAllowed = [
    '/api/user/login',
    '/api/user/addUser',
    '/api/data/ping'
  ];


  if (anonymousAllowed.includes(url) === true || !url) {
    next();
  }
  else {
    let parsedSig = await util.parseSignature(req);
    if (!parsedSig){
      const error = new Error("Unauthorized");
      next(error);
    }
    else{
      req.sig = {parsedSignature: parsedSig};
      res.header('token', parsedSig.signature);
      next();
    }
  }
}

app.use((req, res, next) => {
  const status = 404; //404 not found
  res.status(status);
  res.send({});
});
app.use((err, req, res, next) => {
  let body = {error: err};
  let status = 500;
  if (err && err.message === 'Unauthorized') {
    body = {error: err.message};
    status = 401; //401 unauthenticated vs 403 forbidden
  }
  res.status(status);
  res.send(body);
});

// start the Express server
app.listen(PORT, () => {
  console.log(`Server is running on port: ${PORT}`);
});
