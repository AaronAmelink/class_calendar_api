const mp = require("../processors/mongoProcessor");
const up = require("../processors/userProcessor");
const cacheManager = require('../utils/cachemanager');
const cache = new cacheManager();
const {ObjectId} = require("mongodb");
const collection = "UserDataSampleSet";
class dataProcessor{
    constructor() {
        if (!dataProcessor.instance) {
            dataProcessor.instance = this;
            this.connection = null;

        }
        return dataProcessor.instance;
    }


    async updatePage(user_id, page_id, newPageContent) {
        try {
            let _id = new ObjectId(user_id);
            let updateQuerie = {
                _id : {$eq : _id},
                pages : {
                    $elemMatch: {
                        page_id: {$eq : page_id}
                    }
                }}
            let set = {$set : {"pages.$.content" : newPageContent}}

            //update document is of format:
            //{ $set: { key : value }, etc, }
            let o_id = new ObjectId(user_id);
            let result = await mp.updateOneDoc(collection, o_id, updateQuerie, set);
            return result;
        }
        catch (e) {
            console.log(e);
            return null;
        }

    }




}


const instance = new dataProcessor();
module.exports = instance;