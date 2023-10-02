const mp = require("../processors/mongoProcessor");
const cacheManager = require('../utils/cachemanager');
const cache = new cacheManager();
const {ObjectId} = require("mongodb");
class dataProcessor{
    constructor() {
        if (!dataProcessor.instance) {
            dataProcessor.instance = this;
            this.connection = null;

        }
        return dataProcessor.instance;
    }

    async updateMongo(){
        
    }




}


const instance = new dataProcessor();
module.exports = instance;