const bcrypt = require("bcryptjs");
const mp = require("../processors/mongoProcessor");
const cacheManager = require('../utils/cachemanager');
const cache = new cacheManager();
const {ObjectId} = require("mongodb");
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
                let id = new ObjectId(id);
                let mongoResult = await mp.getEntryByID("UserDataSampleSet", id);
                await cache.setCacheEntry('', id, mongoResult);
                return mongoResult;
            }
        }
        catch (e){
            console.log(e);
        }
    }

    async createUser(email, password, userName){
        let result;
        let emailTaken = await mp.searchCollectionByValue("Users", {email : email});
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

            let result = await mp.createEntryByID("Users", user);
            let userData = {
                _id : result.insertedId,
                pages: [],
                dates: []
            };
            console.log(user);
            await cache.setCacheEntry("", result.insertedId.toString(), userData);
            await cache.setCacheEntry('', email+"-userLogin", user);

            console.log(userData);
            result = await mp.createEntryByID("UserDataSampleSet", userData);
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
                user = await mp.searchCollectionByValue("Users", {"email": email});
                if (user) {
                    await cache.setCacheEntry('', user.email+"-userLogin", user);
                }
                else{
                    console.log("user is not defined");
                    return null;
                }

            }

            let casheduserData = await cache.getCacheKeyValue(user._id);
            if (!casheduserData) {
                let userData = await mp.getEntryByID("UserDataSampleSet", user._id);
                await cache.setCacheEntry('', user._id, userData);
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