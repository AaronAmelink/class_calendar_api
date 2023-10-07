const bcrypt = require("bcryptjs");
const mp = require("../processors/mongoProcessor");
const cacheManager = require('../utils/cachemanager');
const cache = new cacheManager();
const {ObjectId} = require("mongodb");
const userDataCollection = "UserDataSampleSet";
const usersCollection = "Users";
async function hashPassword(plaintextPassword) {
    return await bcrypt.hash(plaintextPassword, 10);
}
async function comparePassword(plaintextPassword, hash) {
    return await bcrypt.compare(plaintextPassword, hash);
}
class userProcessor{
    constructor() {
        if (!userProcessor.instance) {
            userProcessor.instance = this;
            this.connection = null;

        }
        return userProcessor.instance;
    }

    async addUserPages(user_id, newPageArray_ids){
        try{
            let o_id = new ObjectId(user_id);
            let querie = {_id : o_id};
            let update = {$push : {pages : {$each : newPageArray_ids}}};
            let result = await mp.updateOneDoc(userDataCollection, o_id, querie, update);
            return result;
        }
        catch (e){
            console.log(e);
            return null;
        }
    }

    async getUserData(id) {
        let result;
        try{
            result = await cache.getCacheKeyValue(id);
            if (result) {
                console.log("user data in cache")
                return result;
            }
            else{
                console.log("user data not in cache.... adding");
                let options = {
                    // Include only the `pages` and `_id` fields in each returned document
                    projection: { pages: 1, _id : 1},
                };
                let mongoResult = await mp.getEntryByID(userDataCollection, id);
                await cache.setCacheEntry('', id+"-userData", mongoResult);
                return mongoResult;
            }
        }
        catch (e){
            console.log(e);
        }
    }

    async createUser(email, password, userName){
        let result;
        let emailTaken = await mp.searchCollectionByValue(usersCollection, {email : email});
        if (emailTaken) {
            result = 'email taken - try another';
            return result;
        }
        else{
            let hashed = await hashPassword(password);
            let user = {
                userName: userName,
                email : email,
                password : hashed
            };

            let result = await mp.createEntryByID(usersCollection, user);
            let userData = {
                _id : result.insertedId,
                pages: [],
                dates: []
            };
            console.log(user);
            await cache.setCacheEntry('', email+"-userLogin", user);

            console.log(userData);
            result = await mp.createEntryByID(userDataCollection, userData);
            return result;
        }

    }


    async login(email, password){
        let result;
        let allowLogin;
        let user;

        try {
            let cacheResult = await cache.getCacheKeyValue(email+"-userLogin");

            if (cacheResult) {
                user = cacheResult;
                console.log("user exists in cache");
            }
            else {
                console.log("user dne exist in cache");
                user = await mp.searchCollectionByValue(usersCollection, {"email": email});
                if (user) {
                    await cache.setCacheEntry('', user.email+"-userLogin", user);
                }
                else{
                    console.log("user is not defined");
                    return null;
                }

            }

            let casheduserData = await cache.getCacheKeyValue(user._id.toString()+'-userData');
            if (!casheduserData) {
                let userData = await mp.getEntryByID(userDataCollection, user._id);
                await cache.setCacheEntry('', user._id+'-userData', userData);
                console.log(userData);
            }

            allowLogin = await comparePassword(password, user.password);

            if (allowLogin && user){
                result = user;
            }
            else{
                result = "wrong email / password";
            }
            return result;
        }
        catch(e){
            throw e;
        }
        //console.log(result);
    }

}


const instance = new userProcessor();
module.exports = instance;