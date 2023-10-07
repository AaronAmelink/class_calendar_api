const mp = require("../processors/mongoProcessor");
const up = require("../processors/userProcessor");
const cacheManager = require('../utils/cachemanager');
const cache = new cacheManager();
const {ObjectId} = require("mongodb");
const userData = "UserDataSampleSet";
const pageCollection = "pages";
class pageProcessor {
    constructor() {
        if (!pageProcessor.instance) {
            pageProcessor.instance = this;
            this.connection = null;

        }
        return pageProcessor.instance;
    }


    async updatePage(page_id, newPageContent) {
        try {
            let o_id = new ObjectId(page_id);
            let updateQuerie = {_id : o_id}
            let set = {$set : {"content" : newPageContent}}

            //update document is of format:
            //{ $set: { key : value }, etc, }
            let result = await mp.updateOneDoc(pageCollection, o_id, updateQuerie, set);
            return result;
        }
        catch (e) {
            console.log(e);
            return null;
        }

    }

    async removePage(page_id){
        try{
            let o_id = new ObjectId(page_id);
            let query = {_id : o_id};
            let result = await mp.removeDocuments(pageCollection, query);
            return result;
        }
        catch (e){
            console.log(e);
            return null;
        }
    }

    async addNewPage(user_id, pageName){
        try{
            let o_id = new ObjectId(user_id);
            let result = await mp.addNewDocument(pageCollection, {page_name: pageName, user_id: o_id, content: []})
            //NEED TO UPDATE USERDATA'S PAGE ARRAY
            await up.addUserPages(user_id, [result.insertedId])

            await cache.clearCacheEntry('', user_id+'-userData');
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