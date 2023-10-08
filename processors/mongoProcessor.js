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
            this.collectionCache = [];
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

    async getCollection(collectionName) {
        try{
            if (this.collectionCache[collectionName] != null){
                console.log("collection in cache");
                return this.collectionCache[collectionName];
            }
            else{
                let conn = await this.connect();
                let db = conn.db(dbName);
                let coll = await db.collection(collectionName);
                this.collectionCache[collectionName] = coll;
                console.log("collection not in cache");
                return coll;
            }
        }
        catch (e){
            console.log(e);
        }

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

    async addNewDocument(Collection, params) {
        try {
            let coll = await this.getCollection(Collection);
            let result = await coll.insertOne(params);
            return result;
        }
        catch (e){
            console.log(e);
            return null;
        }
    }

    async removeDocuments(Collection, query){
        try {
            let coll = await this.getCollection(Collection);
            let result = await coll.deleteMany(query);
            return result;
        }
        catch (e){
            console.log(e);
            return null;
        }
    }

    async getMultipleDocuments(Collection, query, options) {
        try{
            let coll = await this.getCollection(Collection);
            let result = await coll.find(query, options);
            return result;
        }
        catch (e){
            console.log(e);
            return null;
        }
    }

    async getEntryByID(Collection, id)
    {
        try {
            let coll = await this.getCollection(Collection);
            let user = await coll.findOne({_id: id});
            return user;
        }
        catch (e){
            this.connection = null;
            console.log(e);
            console.log("get user data failed");
            return null;
        }
    }

    async updateOneDoc(Collection, id, updateQuerie, statement){
        //statement is a $set
        //{ $set: { key : value }, etc, }
        //update querie is a check
        try{
            let coll = await this.getCollection(Collection);
            let result = await coll.updateOne(updateQuerie, statement);
            return result;
        }
        catch (e){
            console.log(e);
            return null;
        }
    }

    async updateCollectionById(collection, ids, updateDocument){
        //Ids is of format:
        // [oid, oid...]
        //update document is of format:
        //{ $set: { "field": <new value>, "field": <new value>, } }
        //so, for updating a userdata example:
        //{$set : {"pages": totalCache._id.pages, etc}

        try {
            let coll = await this.getCollection(Collection);
            let result = await coll.updateMany(
                {_id : {$in : ids}},
                updateDocument
            );
            return (result);
        }
        catch (e) {
            console.log(e);
            return null;
        }
    }

    async createEntryByID(Collection, body) {
        try{
            let coll = await this.getCollection(Collection);
            // body must be json object
            let result = await coll.insertOne(body);
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

            let coll = await this.getCollection(Collection);
            let user = await coll.findOne(keyValue);
            return user;
        }
        catch (e){
            this.connection = null;
            console.log(e);
            console.log("search collection by value failed");
            return null;
        }
    }

}



const instance = new mongoProcessor();
module.exports = instance;