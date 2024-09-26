const express = require('express');
const pp = require('../processors/pageProcessor');
const up = require("../processors/userProcessor");
const router = express.Router();

router.post("/setPageContent", async (req, res) => {
    let user_id = (req && req.sig && req.sig.parsedSignature) ? req.sig.parsedSignature.user_id : null;
    if (user_id) {
        let result = await pp.updatePageContent(user_id, req.body.page_id, req.body.page_content);
        res.send(result).status(200);
    }
    else{
        res.send({error : "user_id not found"}).status(200);
    }

})

router.get("/ping", async (req, res) => {
        res.send().status(200);
})

router.get("/getChildPages", async (req, res) => {
    let user_id = (req && req.sig && req.sig.parsedSignature) ? req.sig.parsedSignature.user_id : null;
    if (user_id){
        let result = await pp.getChildPages(user_id, req.body.parent_id);
        if (result){
            res.send(result).status(200);
        }
        else{
            res.send({error: "could not save changes"}).status(200);
        }
    }
    else{
        res.send({error:"user_id not found"}).status(200);
    }
})


router.post("/updatePage", async (req, res) => {
    let user_id = (req && req.sig && req.sig.parsedSignature) ? req.sig.parsedSignature.user_id : null;
    if (user_id){
        let result = await pp.updatePage(user_id, req.body.pageUpdates);
        if (result){
            res.send(result).status(200);
        }
        else{
            res.send({error: "could not save changes"}).status(200);
        }
    }
    else{
        res.send({error:"user_id not found"}).status(200);
    }
})

router.post("/changePageName/", async (req, res) => {
    let user_id = (req && req.sig && req.sig.parsedSignature) ? req.sig.parsedSignature.user_id : null;
    if (user_id) {
        let result = await pp.changePageName(user_id, req.body.page_id, req.body.page_name);
        res.send(result).status(200);
    }
    else{
        res.send({error:"user_id not found"}).status(200);
    }
})
router.get("/getRootPage/", async (req, res) => {
    let user_id = (req && req.sig && req.sig.parsedSignature) ? req.sig.parsedSignature.user_id : null;
    if (user_id) {
        let result = await pp.getUserRootPage(user_id);
        res.send(result).status(200);
    }
    else{
        res.send({error:"user_id not found"}).status(200);
    }
})

router.get("/getPage/:page_id", async (req, res) => {
    let user_id = (req && req.sig && req.sig.parsedSignature) ? req.sig.parsedSignature.user_id : null;
    if (user_id) {
        let result = await pp.getPage(user_id, req.params.page_id);
        res.send(result).status(200);
    }
    else{
        res.send({error:"user_id not found"}).status(200);
    }
})

router.get("/getUserData", async (req, res) => {
    let user_id = (req && req.sig && req.sig.parsedSignature) ? req.sig.parsedSignature.user_id : null;
    if (user_id){
        let result = await up.getUserData(user_id);
        res.send(result).status(200);
    }
    else{
        res.send({error: "user_id not found"}).status(200);
    }

})
router.get("/getPages", async (req, res) =>{
    let user_id = (req && req.sig && req.sig.parsedSignature) ? req.sig.parsedSignature.user_id : null;
    let result = await pp.getAllPages(user_id);
    res.send(result).status(200);
})

router.post("/addNewPage/", async (req, res) =>{
    let user_id = (req && req.sig && req.sig.parsedSignature) ? req.sig.parsedSignature.user_id : null;
    if (user_id) {
        let result = await pp.addNewPage(user_id, req.body.referenceID, req.body.newID, req.body.pageName);
        res.send(result).status(200);
    } else {
        res.send({error: "user_id not found"}).status(200);
    }
})

router.post("/addNewClass/", async (req, res) =>{
    let user_id = (req && req.sig && req.sig.parsedSignature) ? req.sig.parsedSignature.user_id : null;
    if (user_id) {
        let result = await pp.addNewClass(user_id, req.body.newClass);
        res.send(result).status(200);
    } else {
        res.send({error: "user_id not found"}).status(200);
    }
})

router.get("/removePage/:page_id", async (req, res) => {
    let user_id = (req && req.sig && req.sig.parsedSignature) ? req.sig.parsedSignature.user_id : null;
    if (user_id){
        let result = await pp.removePage(req.params.page_id, user_id);
        res.send(result).status(200);
    }
    else{
        res.send({error: "user_id not found"}).status(200);
    }


})


module.exports = router;