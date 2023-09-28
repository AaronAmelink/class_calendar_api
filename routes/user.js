
const express = require('express');
const mp = require('../processors/mongoProcessor.js');
const router = express.Router();


router.get("/getUser/:id", async (req, res) => {
    let result = await mp.getEntryByID("Users", req.params.id);
    res.send(result).status(200);
})

module.exports = router;
