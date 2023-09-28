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
            let user = await coll.findOne({_id: id});
            console.log(conn);
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

    async createEntryByID(Collection, body) {
        try{
            console.log(body);
            let conn = await this.connect();
            let db = conn.db(dbName);
            let coll = db.collection(Collection);
            // body must be json object
            let result = await coll.insertOne(body);
            await this.closeConnection();
            console.log(body);
            return result;
        }
        catch (e){
            console.log(e);
            return null;
        }
    }
}



const instance = new mongoProcessor();
module.exports = instance;