require('./requires/console')
require('isomorphic-fetch');

const dbClient = require('./requires/initDbClient')

// Get latest request from database
function getLatestRequestTimestamp(){
    return new Promise((resolve, reject) => {
        dbClient.requests.find({}).sort({ createdTimestamp: -1}).limit(1).exec(function (err, docs) {
            err ? reject(err) : resolve(docs);
        });
    });
}

// Get latest request from database
getLatestRequestTimestamp().then((docs)=> {
	
	let afterCreatedTimestamp = 1;
	// Db has requests, use latest request createdTimestamp to filter subgraph query
	if(docs.length ==1) afterCreatedTimestamp = docs[0].createdTimestamp;
	//console.log(afterCreatedTimestamp);

	var graphquery = `{
	  requests(
		where: {delivered: false, refunded: false, createdTimestamp_gt: ${afterCreatedTimestamp}}
		orderBy: createdTimestamp
		orderDirection: desc
	  ) {
		id
		createdTimestamp
		deadline
		description
		amount
		requester
		creator {
		  userName
		  twitterHandle
		  address
		}
	  }
	}`;

	console.log(`Fetching requests after ${ new Date(afterCreatedTimestamp * 1000).toISOString() } - Newest request on DB (createdTimestamp): ${afterCreatedTimestamp}`);

	// Fetch data from subgraph
 	fetch('https://api.thegraph.com/subgraphs/name/clipto-platform/clipto-subgraph-mainnet', {
		  method: 'POST',
		  headers: {
			'Content-Type': 'application/json',
			'authorization': `Bearer ${''}`,
		  },
		  body: JSON.stringify({ query: graphquery }),
	}).then((res)=>{
	  res.json().then((json) => {
		var requests = json.data.requests;
		
		console.log("Fetched requests:", requests.length);
		
		requests.forEach((request) => { 
		
		  dbClient.requests.find({ id: request.id }, function (err, docs) {
			    // Maybe not needed because added createdTimestamp filter after. Leaving just in case 
				if (docs.length > 0) {				
					// Request in database
					console.log("Request id", request.id, "already in database. Ignoring ...")
				} else {
					// New request, insert it
						var o = {
							id: request.id,
							createdTimestamp: request.createdTimestamp,
							deadline: request.deadline,
							amount: request.amount,
							requester: request.requester,
							creatorUsername: request.creator.username,
							creatorTwitterHandle: request.creator.twitterHandle,
							creatorAddress: request.creator.address,
							twitterPostId: null,
							twitterPostTimestamp: null
						};
						
						dbClient.requests.insert(o, function (err) {
							if (err)
								console.log("Insert database error:", err.message);
							else {
								console.log("Insert database successful.Request id", request.id);
						   }
						});
				}
		  }); //dbclient.find
		}); // requests.forEach
	  }); // res
	}); // fetch
});

