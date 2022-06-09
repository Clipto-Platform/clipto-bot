var Datastore = require('nedb')
var db = {};
db.requests = new Datastore({ filename: 'cliptorequests.db', autoload: true });

// Using a unique constraint with the index
db.requests.ensureIndex({ fieldName: 'id', unique: true }, function (err) {
});

module.exports = db
