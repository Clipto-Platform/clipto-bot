const dbClient = require('./requires/initDbClient')

var origlog = console.log;

console.log = function (obj, ...placeholders) {
    if (typeof obj === 'string')
        placeholders.unshift("[" + new Date().toISOString() + "] " + obj);
    else {
        // This handles console.log( object )
        placeholders.unshift(obj);
        placeholders.unshift(Date.now() + " %j");
    }

    origlog.apply(this, placeholders);
};

dbClient.requests.find({ twitterPostId: null }, function (err, requests) {

   if(requests.length == 0 ){ console.log('No database requests require to be ignored.')}
   requests.forEach(request => {
        dbClient.requests.update({ id: request.id }, { $set:{ twitterPostId: -1,  twitterPostTimestamp: '-1' }}, (err, num) => {
                if(num > 0) { console.log(`Database request ignored. Request id ${request.id}`); }
                if(err){ console.log(err); }
        });
   });
});

