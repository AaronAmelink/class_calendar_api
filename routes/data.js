const express = require('express');
const dp = require('../processors/dataProcessor');
const router = express.Router();

router.post("/setPageContent", async (req, res) => {
    let result = await dp.updatePage(req.body.user_id, req.body.page_id, req.body.page_content);
    res.send(result).status(200);
})



module.exports = router;