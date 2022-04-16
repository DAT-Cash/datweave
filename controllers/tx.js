const mongo = require('mongodb')

exports.tx_post = (req, res) => {
	console.log('/tx_post')
	const body = req.body
	const txn = {
		id: body.id,
		data_root: body.data_root,
		owner: body.owner
	}

	console.log(`/tx endpoint:\nid: ${txn.id}\nowner: ${txn.owner}\ndata_root:${txn.data_root}`)

	const MongoClient = mongo.MongoClient;

	MongoClient.connect('mongodb://localhost:27017/', function(err, db) {
		if (err) throw err;
		const datweave = db.db('datweave');
		const wallets = datweave.collection('wallets');
		const transactions = datweave.collection('transactions');

		transactions.insertOne(txn)
		.catch((err) => {
			if(err) {
				console.log(err)
				throw err
			}
		})
		.then(() => {
			console.log(`inserted txn ${ txn.id }`)
			res.json({ status: 200 })
			db.close()
		})
	});	
};


exports.tx_get_offset = (req, res) => {
	// front end calls this 114 times if does not get a valid resp
	console.log('/tx_get_offset') //gets NFTGallery data
	// console.log(req)

	// Assumes only one parameter in request

	if(Object.keys(req.params).length === 0) {
		console.log('get txnID no params')
		res.json({ status: 200 })
	}
	else {
		const txnID = req.params['0'].replace(/\s/g, '');

		if(txnID.length == 0) {
			console.log('no txnID')
			res.json({ status: 200 })
			return
		}

		var MongoClient = require('mongodb').MongoClient;

		MongoClient.connect('mongodb://localhost:27017/', function(err, db) {
			if (err) throw err;
			const datweave = db.db('datweave');
			const transactions = datweave.collection('transactions')

			transactions.findOne({ id: txnID })
			.catch((err) => {
				if(err) {
					console.log(err)
					throw err
				}
			})
			.then((document) => {

				if(document === null || !document.hasOwnProperty('chunk')) {
					res.json({ status: 200 })
				}
				else {
					let offsets = Object.keys(document.chunk).map(offset => parseInt(offset))
					const chunks = document.chunk
					const chunkKeys = Object.keys(document.chunk)
					const size = chunkKeys.reduce((prev, current) => prev + chunks[current].length, 0)

					res.json({
						offsets: offsets,
						size: size
					})
				}

				db.close()
			})
		});	
	}
};

// TODO: idk what this api does yet

exports.tx_get_status = (req, res) => {
	res.json({status: 200})
};