const mp = require("../processors/mongoProcessor");
const cacheManager = require('../utils/cachemanager');
const pageCollection = "pages";
const { v4: uuidv4 } = require('uuid');
const sanitize = require('mongo-sanitize');
const {updatePage} = require("@notionhq/client/build/src/api-endpoints");
class pageProcessor {
    constructor() {
        if (!pageProcessor.instance) {
            pageProcessor.instance = this;

        }
        return pageProcessor.instance;
    }

    async updatePage(rawUser_id, rawUpdates){
        //{
        //                 "page_id" : null,
        //                 "content" : {
        //                     "dirty" : false,
        //                     "changes" : null
        //                 },
        //                 "properties" : {
        //                     "dirty" : false,
        //                     "changes" : null,
        //                 },
        //                 "name" : {
        //                     "dirty" : false,
        //                     "newName" : null
        //                 }
        //             }
        let user_id = sanitize(rawUser_id);
        let updates = sanitize(rawUpdates);
        try{

            //.log(updates);
            let updateQuerie = {_id : updates.page_id, user_id:user_id};
            let updateObj = {};
            if (updates.content.dirty){
                updateObj.content = updates.content.changes;
            }
            if (updates.properties.dirty){
                updateObj.properties = updates.properties.changes;
            }

            updateObj.page_name = updates.name.newName;

            let set = {$set : updateObj};
            console.log(set);
            let result = await mp.updateOneDoc(pageCollection, updateQuerie, set);
            return result;
        }
        catch (e){
            console.log(e);
            return {"error" : "error submitting page update"};
        }

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

    async updatePageProperties(rawUser_id, rawPage_id, rawNewPageProps) {
        let user_id = sanitize(rawUser_id);
        let page_id = sanitize(rawPage_id);
        let newPageProps = sanitize(rawNewPageProps);
        try {
            let updateQuerie = {_id : page_id, user_id : user_id}
            let set = {$set : {"properties" : newPageProps}}

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

    async getAllPages(user_id){
        try {
            let query = {user_id: user_id, parent_id: {$ne: null}}
            let result = await mp.getMultipleDocuments(pageCollection, query);
            if (!result){
                result = [];
            }
            let rootQuery = {user_id : user_id, parent_id : null};
            let root = await mp.searchCollectionByQuery(pageCollection, rootQuery);
            result.splice(0, 0, root);
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

    async addNewPage(user_id, rawPageName, parent_id, newPageID){
        let pageName = sanitize(rawPageName);
        try{
            if (parent_id){
                let parentPage = await this.getPage(user_id, parent_id);
                let newPageCont = {
                    "type" : "page",
                    "name" : pageName,
                    "page_id" : newPageID
                };
                parentPage.content.push(newPageCont);
                await this.updatePageContent(user_id, parent_id, parentPage.content);
            }
            let result = await mp.addNewDocument(pageCollection,
                {
                    page_name: pageName,
                    user_id: user_id,
                    content: [{type:"text",value:" ",id:0}],
                    parent_id: parent_id,
                    _id:newPageID,
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