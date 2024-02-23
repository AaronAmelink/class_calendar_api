const jsonWebToken = require('jsonwebtoken');
const sessionDuration = 8*60; // 8 hours
const renewRange = 5; // 5 minutes
const certs = require('../certs.json');

class JWTUtils {
    constructor() {
    }

    decodeJWTToken(jwtToken)
    {
        try
        {
            let decoded = jsonWebToken.decode(jwtToken);
            return decoded;
        } catch (e) {
            return null;
        }
    }

    mapToken(token, decoded) {
        if (!decoded || !token || decoded.iss !== 'selfsigned')
            return {};

        // do some mapping where needed
        const decodedToken = {
            user_id: decoded.user_id,
            signature : token
        };

        return decodedToken;
    }

    async validateToken(token){
        return new Promise((resolve, reject) => {
        try {
            let decodedToken = this.decodeJWTToken(token);
            if (decodedToken) {
                let cert = this.getJWTCert("public-key", decodedToken);
                if (cert){
                    jsonWebToken.verify(token, cert.value, {algorithms: ['RS256'], ignoreNotBefore: true},   (err, verified) => {
                        if (!err){
                            if (cert.name === "public-key"){
                                let value = this.mapToken(token, verified);
                                let expirePoint = Math.floor(Date.now() / 1000) + (renewRange * 60);
                                if (verified && verified.exp && (verified.exp < expirePoint)){
                                    let newToken = this.issueNewToken(value);
                                    return resolve(newToken);
                                }
                                else {
                                    return resolve(value);
                                }
                            }
                        }
                        else{
                            console.log(err);
                        }
                    });
                }
            }

        }
        catch (e){
            console.log(e);
            return reject();
        }});
    }

    async issueNewToken(data) {
        return new Promise((resolve, reject) => {
        try{
            let payload = {
                iss : "selfsigned",
                user_id : data.user_id
            }

            let cert = this.getJWTCert('private-key')

            if (cert) {
                jsonWebToken.sign(payload, cert.value, {algorithm: 'RS256', expiresIn: 60 * sessionDuration}, (err, token) => {
                    if (token) {
                        data.signature = token;
                        return resolve(data);
                    }
                    else{
                        return reject();
                    }
                });

            }
            else{
                return reject();
            }

        }
        catch (e){
            console.log(e);
            return reject();
        }});
    }

    getJWTCert(name, decodedToken) {
        // filter the certs by name and env
        if (certs && certs.certs) {
            let cert = certs.certs.filter(c => {
                if (name && decodedToken) {
                    return c.name === name && c.iss === decodedToken.iss;
                }
                else if (name) {
                    return c.name === name;
                }
                else if (decodedToken) {
                    return c.iss === decodedToken.iss;
                }
                else {
                    return false;
                }
            });

            if (cert && cert.length === 1) {
                return cert[0];
            }
        }
        return null;
    }

}

module.exports = JWTUtils;