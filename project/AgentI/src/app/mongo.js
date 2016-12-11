var MongoClient = require('mongodb').MongoClient;

exports.connect = function(url, callback) {
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
  MongoClient.connect(url, options, function(err, db){
    if (err) throw new Error('Could not connect: '+err);
    callback(db);
    db.close();
  });
};