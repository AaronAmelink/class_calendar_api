const cacheManager = require('cache-manager');
const redisStore = require('cache-manager-redis-store');

const redis_url = process.env.REDIS_URl;
const redis_port = process.env.REDIS_PORT;
const redis_pass = process.env.REDIS_PASS;

let redisConfig = {
    store : redisStore,
    host: redis_url,
    port: redis_port,
    auth_pass : redis_pass,
    db: 0,
    ttl : 10880 //8hours
}

let memoryConfig = {
    store: 'memory', max:1000, ttl: 3600
};

//let cacher = (redis_url && redis_port != 0) ? cacheManager.caching(redis_port) : cacheManager.caching(memoryConfig);
let cacher = cacheManager.caching(redisConfig);
let redisClient = (cacher && cacher.store && cacher.store.name != "memory") ? cacher.store.getClient() : null;
if (redisClient) {
    redisClient.on('error', (error) =>{
        console.log(error);
        cacher = cacheManager.caching(memoryConfig);
        redisClient.end(true);
    });
}

class CacheManager {
    constructor() {
    }

    getCacheStore() {
        return (cacher && cacher.store) ? cacher.store.name : "none";
    }

    getCacheManagerInstance() {
        if (redisClient && !redisClient.ready) {
            cacher = cacheManager.caching(redisConfig);
            if (cacher && cacher.store && cacher.store.name != 'memory'){
                redisClient = cacher.store.getClient();
            }

        }
        return cacher;
    }
    async getCacheKeyValue(key) {
        try{
            if (cacher){
                let ask = await cacher.get(key);
                if (ask) {
                    return ask;
                }
                else{
                    return 0;
                }
            }
            else{
                console.log("cacher DNE");
                return -1;
            }
        }
        catch (e){
            console.log(e);
            return e;
        }

    }

    getCacheKey(domain, key){
        const cacheKey = key;
        return cacheKey
    }

    setCacheEntry(domain, key, value, ttl) {
        //caching is done by combining the prop of tehe signature
        //ie env:org:channel:userId:local
        const promise = new Promise((resolve, reject) => {
            if (key && value) {
                const cacheKey = this.getCacheKey(domain, key);
                cacher.set(cacheKey, value, {ttl : ttl ? ttl: 28800}, function(error) {
                    resolve(value);
                });
            }
            else{
                resolve(value);
            }
        });
        return promise;
    }


    getCacheEntryDeprecated(domain, key) {
        const promise = new Promise((resolve, reject) => {
            const cacheKey = this.getCacheKey(domain, key);
            cacher.get(cacheKey, function(err, result) {
                if (err == null && result){
                    resolve(result);
                }
                else{
                    reject(err);
                }
            });
        });
        return promise;
    }

    async getAllKeys() {

    }

    clearCacheEntry(domain, key) {
        const promise = new Promise((resolve, reject) => {
            if (key) {
                const cacheKey = this.getCacheKey(domain, key);
                cacher.del(cacheKey, function(err) {});
                resolve();
            }
            else{
                resolve();
            }
        });
        return promise;
    }
}

module.exports = CacheManager;