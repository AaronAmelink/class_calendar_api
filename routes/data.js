const express = require('express');
const pp = require('../processors/pageProcessor');
const router = express.Router();

router.post("/setPageContent", async (req, res) => {
    let result = await pp.updatePageContent(req.body.page_id, req.body.page_content);
    res.send(result).status(200);
})

router.post("/addNewPage/:user_id", async (req, res) =>{
    let result = await pp.addNewPage(req.params.user_id, req.body.page_name);
    res.send(result).status(200);
})

router.get("/removePage/:page_id", async (req, res) => {
    let result = await pp.removePage(req.params.page_id);
    res.send(result).status(200);
})


module.exports = router;