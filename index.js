require('dotenv').config();
const express = require('express')
const cors = require('cors');

const routes = require('./routes');


const PORT = process.env.PORT || 5050;
const app = express()

app.use(cors());
app.use(express.json());

// Load the /index routes
app.use('/api/user', routes.user);
app.use('/api/data', routes.data);

// Global error handling
app.use((err, _req, res, next) => {
  res.status(500).send("Uh oh! An unexpected error occured.")
})

// start the Express server
app.listen(PORT, () => {
  console.log(`Server is running on port: ${PORT}`);
});
