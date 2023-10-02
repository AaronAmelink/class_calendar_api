const {query} = require("express");
const {ObjectId, Collection} = require("mongodb");
const dbName = process.env.dbName;
let MongoClient = require('mongodb').MongoClient;
const connectionString = process.env.uri;

class mongoProcessor {
    constructor() {
        if (!mongoProcessor.instance) {
            mongoProcessor.instance = this;
            this.connection = null;
        }
        return mongoProcessor.instance;
    }

    async resetConnectection() {
        console.log("re setting connection");
        try {
            if (this.connection){
                await this.connection.close();
            }
            this.connection = null;
            let c = await this.connect();
            if (c) {
                console.log("opened a new connection");
                this.connection = c;
            }
            else{
                console.log("failed reset")
            }
        }
        catch (e) {
            console.log(e);
        }
    }

    async connect(){
        if (!this.connection) {
            this.connection = await MongoClient.connect(connectionString);
        }
        return this.connection;
    }

    async closeConnection(){
        try {
            if (this.connection) {
                await this.connection.close();
                this.connection = null;
            }
            else{
                console.log("Connection Already Closed");
            }
        }
        catch (e) {
            console.log(e);
        }
    }

    async getEntryByID(Collection, id)
    {
        try {
            let conn = await this.connect();
            let db = conn.db(dbName);
            let coll = await db.collection(Collection);
            id = new ObjectId(id)
            let user = await coll.findOne({_id: id});
            await this.closeConnection();
            return user;
        }
        catch (e){
            this.connection = null;
            console.log(e);
            console.log("get user data failed");
            return null;
        }
    }

    async updateCollectionById(dbName, collection,ids, updateDocument){
        //Ids is of format:
        // [oid, oid...]
        //update document is of format:
        //{ $set: { "field": <new value>, "field": <new value>, } }
        //so, for updating a userdata example:
        //{$set : {"pages": totalCache._id.pages, etc}

        try {
            let conn = await this.connect();
            let db = conn.db(dbName);
            let coll = db.collection(Collection);
            await coll.updateMany(
                {_id : {$in : ids}},
                updateDocument
            );
            await this.closeConnection();
            return ("successfully updated mongo");
        }
        catch (e) {
            console.log(e);
            return null;
        }
    }

    async createEntryByID(Collection, body) {
        try{
            let conn = await this.connect();
            let db = conn.db(dbName);
            let coll = db.collection(Collection);
            // body must be json object
            let result = await coll.insertOne(body);
            await this.closeConnection();
            return result;
        }
        catch (e){
            console.log(e);
            this.connection = null;
            return null;
        }
    }

    async searchCollectionByValue(Collection, keyValue){
        try {
            let conn = await this.connect();
            let db = conn.db(dbName);
            let coll = await db.collection(Collection);
            let user = await coll.findOne(keyValue);
            await this.closeConnection();
            return user;
        }
        catch (e){
            this.connection = null;
            console.log(e);
            console.log("get user data failed");
            return null;
        }
    }

}



const instance = new mongoProcessor();
module.exports = instance;