const bcrypt = require("bcryptjs");
const mp = require("../processors/mongoProcessor");
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
        try{
            let mongoResult = await mp.getEntryByID(usersCollection, id);
            let mapped = {
                _id : mongoResult._id,
                email : mongoResult.email,
                userName : mongoResult.userName
            }
            return mapped;
            
        }
        catch (e){
            console.log(e);
        }
    }

    async createUser(rEmail, rPassword,rUserName){
        let email = sanitize(rEmail);
        let password = sanitize(rPassword);
        let userName = sanitize(rUserName);

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
            let newPageID = uuidv4();

            await pp.addNewPage(user._id, user.userName+"'s page", null, newPageID);
            let result = await mp.createEntryByID(usersCollection, user);
            if (result.acknowledged === true && result.insertedId){
                return user;
            }
            else{
                return ({error: "could not register user"});
            }
        }

    }


    async login(email, password){
        let result;
        let allowLogin;
        let user;
        user = await mp.searchCollectionByQuery(usersCollection, {"email": email});
        if (user) {
            allowLogin = await comparePassword(password, user.password);

            if (allowLogin){
                result = user;
            }
            else{
                result = null;
            }
            return result;
        } else {
            return null;
        }
    }
        //console.log(result);
}




const instance = new userProcessor();
module.exports = instance;