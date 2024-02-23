const bcrypt = require("bcryptjs");
const mp = require("../processors/mongoProcessor");
const cacheManager = require('../utils/cachemanager');
const cache = new cacheManager();
const usersCollection = "Users";
const { v4: uuidv4 } = require('uuid');
const sanitize = require('mongo-sanitize');
const pp = require('../processors/pageProcessor');
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
            result = await cache.getCacheKeyValue(id+"-userData");
            if (result) {
                console.log("user data in cache")
                return result;
            }
            else{
                console.log("user data not in cache.... adding");
                let mongoResult = await mp.getEntryByID(usersCollection, id);
                let mapped = {
                    _id : mongoResult._id,
                    email : mongoResult.email,
                    userName : mongoResult.userName
                }
                await cache.setCacheEntry('', id+"-userData", mapped);
                return mapped;
            }
        }
        catch (e){
            console.log(e);
        }
    }

    async createUser(rEmail, rPassword,rUserName){
        let email = sanitize(rEmail);
        let password = sanitize(rPassword);
        let userName = sanitize(rUserName);

        let result;
        let emailTaken = await mp.searchCollectionByQuery(usersCollection, {email : email});
        if (emailTaken) {
            return {error: "email taken"};
        }
        else{
            let hashed = await hashPassword(password);
            let user = {
                userName: userName,
                email : email,
                password : hashed,
                _id : uuidv4()
            };

            await pp.addNewPage(user._id, user.userName+"'s page", null, []);
            let result = await mp.createEntryByID(usersCollection, user);
            console.log(user);
            await cache.setCacheEntry('', email+"-userData", user);
            return result;
        }

    }


    async login(email, password){
        let result;
        let allowLogin;
        let user;
        try {
            user = await mp.searchCollectionByQuery(usersCollection, {"email": email});
            if (user) {
                await cache.setCacheEntry('', user.email+"-userData", user);
            }
            else{
                //console.log("user is not defined");
                return null;
            }
            allowLogin = await comparePassword(password, user.password);

            if (allowLogin){
                result = user;
            }
            else{
                result = null;
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