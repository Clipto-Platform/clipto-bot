require('./requires/console')
require('isomorphic-fetch');
const ethers = require('ethers')
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
    erc20
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
          const tokens = {
            '0x0000000000000000000000000000000000000000': {
              address: '0x0000000000000000000000000000000000000000',
              decimals: 18,
              symbol: 'MATIC',
              priceUSD: 0.6
            },
            '0x0d500b1d8e8ef31e21c99d1db9a6444d3adf1270': {
              address: '0x0d500b1d8e8ef31e21c99d1db9a6444d3adf1270',
              decimals: 18,
              symbol: 'WMATIC',
              priceUSD: 0.6

            },
            '0x7ceb23fd6bc0add59e62ac25578270cff1b9f619': {
              address: '0x7ceb23fd6bc0add59e62ac25578270cff1b9f619',
              decimals: 18,
              symbol: 'WETH',
              priceUSD: 1700
            },
            '0x2791bca1f2de4661ed88a30c99a7a9449aa84174': {
              address: '0x2791bca1f2de4661ed88a30c99a7a9449aa84174',
              decimals: 6,
              symbol: 'USDC',
              priceUSD: 1
            },
          }
					// New request, insert it
          //twitterPostId is used to track if the notification has been given
          console.log('asdfsdf')
          console.log(request.erc20)
          console.log(request.amount)
          console.log(tokens[request.erc20].decimals)
          console.log(ethers.utils.parseUnits(request.amount, tokens[request.erc20].decimals))
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
							twitterPostTimestamp: null,
              erc20: request.erc20,
              valueInUSD: ethers.utils.formatUnits(request.amount, tokens[request.erc20].decimals) * tokens[request.erc20].priceUSD
						}; //todo: make code better
						//0x2791bca1f2de4661ed88a30c99a7a9449aa84174 is usdc which has 6 decimals

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

