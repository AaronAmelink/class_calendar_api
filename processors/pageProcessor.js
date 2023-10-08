const mp = require("../processors/mongoProcessor");
const cacheManager = require('../utils/cachemanager');
const userData = "UserDataSampleSet";
const pageCollection = "pages";
const { v4: uuidv4 } = require('uuid');
class pageProcessor {
    constructor() {
        if (!pageProcessor.instance) {
            pageProcessor.instance = this;

        }
        return pageProcessor.instance;
    }


    async updatePageContent(page_id, newPageContent) {
        try {
            let updateQuerie = {_id : page_id}
            let set = {$set : {"content" : newPageContent}}

            //update document is of format:
            //{ $set: { key : value }, etc, }
            let result = await mp.updateOneDoc(pageCollection, page_id, updateQuerie, set);
            return result;
        }
        catch (e) {
            console.log(e);
            return null;
        }

    }

    async removePage(page_id){
        try{
            let query = {_id : page_id};
            let result = await mp.removeDocuments(pageCollection, query);
            return result;
        }
        catch (e){
            console.log(e);
            return null;
        }
    }

    async addNewPage(user_id, pageName, parent_id, properties){
        try{
            let result = await mp.addNewDocument(pageCollection,
                {
                    page_name: pageName,
                    user_id: user_id,
                    content: [],
                    parent_id: parent_id,
                    _id:uuidv4(),
                    properties : properties
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