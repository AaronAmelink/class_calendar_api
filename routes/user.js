
const express = require('express');
const up = require('../processors/userProcessor');
const router = express.Router();


router.get("/getUserData/:id", async (req, res) => {
    let result = await up.getUserData(req.params.id);
    res.send(result).status(200);
})

router.post("/login", async (req, res) => {
    //login information
    let result = await up.login(req.body.email, req.body.password);
    res.send(result).status(200);
})



router.post("/addUser/", async (req, res) => {
    //needs to check if email already used
    let result = await up.createUser(req.body.email, req.body.password, req.body.userName);
    res.send(result).status(200);
})

module.exports = router;
