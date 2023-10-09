const mp = require("../processors/mongoProcessor");
const cacheManager = require('../utils/cachemanager');
const pageCollection = "pages";
const { v4: uuidv4 } = require('uuid');
const sanitize = require('mongo-sanitize');
class pageProcessor {
    constructor() {
        if (!pageProcessor.instance) {
            pageProcessor.instance = this;

        }
        return pageProcessor.instance;
    }


    async updatePageContent(rawUser_id, rawPage_id, rawNewPageContent) {
        let user_id = sanitize(rawUser_id);
        let page_id = sanitize(rawPage_id);
        let newPageContent = sanitize(rawNewPageContent);
        try {
            let updateQuerie = {_id : page_id, user_id : user_id}
            let set = {$set : {"content" : newPageContent}}

            //update document is of format:
            //{ $set: { key : value }, etc, }
            let result = await mp.updateOneDoc(pageCollection, updateQuerie, set);
            return result;
        }
        catch (e) {
            console.log(e);
            return null;
        }

    }

    async getPage(user_id, page_id){
        try {
            let query = {user_id : user_id, _id: page_id};
            let result = await mp.searchCollectionByQuery(pageCollection, query);
            return result;
        }
        catch (e){
            console.log(e.toString());
            return null;
        }
    }

    async getUserRootPage(user_id){
        try{
            let query = {user_id : user_id, parent_id : null};
            let result = await mp.searchCollectionByQuery(pageCollection, query);
            return result;
        }
        catch (e){
            console.log(e.toString());
            return null;
        }
    }

    async changePageName(user_id, page_id, rNewPageName){
        let newPageName = sanitize(rNewPageName);
        try{
            let query = {_id : page_id, user_id : user_id}
            let update = {$set : {page_name : newPageName}}
            let result = await mp.updateOneDoc(pageCollection, query, update);
            return result;
        }
        catch (e){
            console.log(e.toString());
            return null;
        }
    }

    async removePage(page_id, user_id){
        try{
            let query = {_id : page_id, user_id : user_id};
            let result = await mp.removeDocuments(pageCollection, query);
            return result;
        }
        catch (e){
            console.log(e);
            return null;
        }
    }

    //add new properties function

    //remove properties function

    async addNewPage(user_id, rawPageName, parent_id){
        let pageName = sanitize(rawPageName);
        try{
            let newPage_id = uuidv4();
            if (parent_id){
                let parentPage = await this.getPage(user_id, parent_id);
                let newPageCont = {
                    "type" : "page",
                    "name" : pageName,
                    "page_id" : newPage_id
                };
                parentPage.content.push(newPageCont);
                await this.updatePageContent(user_id, parent_id, parentPage.content);
            }
            let result = await mp.addNewDocument(pageCollection,
                {
                    page_name: pageName,
                    user_id: user_id,
                    content: [],
                    parent_id: parent_id,
                    _id:newPage_id,
                    properties : []
                })
            return result;
        }
        catch (e){
            console.log(e);
            return null;
        }
    }




}


const instance = new pageProcessor();
module.exports = instance;