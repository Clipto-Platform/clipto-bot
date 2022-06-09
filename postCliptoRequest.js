
const dbClient = require('./requires/initDbClient')
const twitterClient = require('./requires/initTwitterClient')

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

/* SAMPLE
 id: '0xad05b50b71d1c05e3309e9f99e633a21741b77d9-v1-0',
    createdTimestamp: '1653345005',
    deadline: '5',
    amount: '210000000000000000',
    requester: '0xa2e7002e0ffc42e4228292d67c13a81fdd191870',
    creatorTwitterHandle: 'Ruby16838551',
    creatorAddress: '0xad05b50b71d1c05e3309e9f99e633a21741b77d9',
    twitterPostId: null,
*/


dbClient.requests.find({ twitterPostId: null}).sort({createdTimestamp: -1}).limit(1).exec((err, requests)=>{
    //console.log(requests);
    if(requests.length ==0) { console.log('No available requests in database to post to Twitter.'); }
    requests.forEach((request) =>{
      
      var dt = new Date(request.createdTimestamp * 1000).toISOString().
               replace(/T/, ' ').      // replace T with a space
               replace(/\..+/, '')     // delete the dot and everything after

      var twitterMessage = `
Clipto request has been created
Creator: @${request.creatorTwitterHandle}
Request Date: ${dt}
Deadline: ${request.deadline} day(s)
                           `;
/*
      twitterMessage = `
Hi @${request.creatorTwitterHandle}, you have a new Clipto request
Request Date: ${dt}
Deadline: ${request.deadline} day(s)
                           `;
*/

      console.log(twitterMessage);
      return;

      twitterClient.tweetsV2.createTweet({"text": twitterMessage}).then((response) => {
        console.log(JSON.stringify(response));
        console.log(request.id);

	dbClient.requests.update({ id: request.id }, { $set:{ twitterPostId: response.data.id }}, (err, num) => {
                if(num > 0) { console.log(`Tweet post with id ${response.data.id}. Updated request.`); }
  		if(err){ console.log(err); }
        });
      });
    });
})

