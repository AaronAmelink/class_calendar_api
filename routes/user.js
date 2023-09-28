
const express = require('express');
const mp = require('../processors/mongoProcessor.js');
const router = express.Router();
const ObjectId = require('mongodb').ObjectId


router.get("/getUser/:id", async (req, res) => {
    //must check users exists
    //when cache is added, must check if user is in cache before checking mongo
    let userID = new ObjectId(req.params.id)
    let result = await mp.getEntryByID("Users", userID);
    res.send(result).status(200);
})

router.post("/addUser/", async (req, res) => {
    console.log(req.params);
    let result = await mp.createEntryByID("Users", {
        userName : req.body.userName,
        email : req.body.email,
        password : req.body.password

    });
    let newUserID = result.insertedId;
    let result2 = await mp.createEntryByID("UserDataSampleSet", {
        _id : newUserID,
        pages: [],
        dates: []
    })
    res.send(result2).status(200);
})

module.exports = router;
