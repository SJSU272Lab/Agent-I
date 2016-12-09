/**
 * Created by Rentala on 09-12-2016.
 */
var MongoClient = require('mongodb').MongoClient;
var db;
var connected = false; /**Connects to the MongoDB Database with the provided URL**/
exports.connect = function(url, callback){
    var options = {
        db : {
            numberOfRetries : 5
        },
        server : {
            auto_reconnect : true,
            poolSize : 3,
            socketOptions : {
                connectTimeoutMS : 5000
            }
        },
        replSet : {},
        mongos : {}
    };
    MongoClient.connect(url, options, function(err, _db){
        if (err) {
            throw new Error('Could not connect: '+err);
        }
        db = _db;
        connected = true;
        callback(db);
    });
}; /**Returns the collection on the selected database**/
exports.collection = function(name){
    if (!connected) {
        throw new Error('Must connect to Mongo before calling "collection"');
    }
    return db.collection(name, {connectTimeoutMS: 3000});
};