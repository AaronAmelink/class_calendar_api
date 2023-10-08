const { v4: uuidv4 } = require('uuid');
const jwtUtils = require('./JWTUtils');
const jwt = new jwtUtils();

class Utils {
    constructor() {
    }


    async parseSignature(req) {
        const prefix = 'Bearer ';
        let signature = req.header('Authorization');
        if (signature && signature.indexOf(prefix) === 0) {
            let sig = signature.substring(prefix.length);
            return await jwt.validateToken(sig);
        }
        return null;
    }


    async createSignature(source) {
        return await jwt.issueNewToken(source);
    }

}
module.exports = Utils;
