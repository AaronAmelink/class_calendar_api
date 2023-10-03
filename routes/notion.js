const express = require('express');
const np = require('../processors/notionProcessor');
const router = express.Router();

router.post("/database/create", async (req, res) => {
    const title = req.body.name;
    let result = await np.createDatabase(title);
    res.send(result).status(200);
});

module.exports = router;