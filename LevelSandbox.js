/* ===== Persist data with LevelDB ==================
|  Learn more: level: https://github.com/Level/level |
/===================================================*/

const level = require('level');
const chainDB = './chaindata';

class LevelSandbox {

    constructor() {
        this.db = level('./chaindata');
    }

    // Get data from levelDB with key (Promise)
    getLevelDBData(key){
        let self = this;
        return new Promise(function(resolve, reject) {
            // Add your code here, remember in Promises you need to resolve() or reject()
			self.db.get(key, function (err, value) {
				if (err) {
					reject(err);
					return console.log('Not found!', err);
				} else {
					console.log('Get block ' + key + '（from getLevelDBData） : ' + value);
					resolve(value);
				}
			})
        });
    }

    // Add data to levelDB with key and value (Promise)
    addLevelDBData(key, value) {
		let self = this;
        return new Promise(function(resolve, reject) {
			self.db.put(key, value, function (err) {
				if (err) {
					reject(err)
					return console.log('Block ' + key + ' submission failed', err);					
				} else {
					resolve(value)
				}
			})			
		});
    }

	addDataToLevelDB(value) {
		// Add your code here, remember in Promises you need to resolve() or reject() 
		let i = 0;
		let self = this;
		this.db.createReadStream().on('data', function (data) {
			i++;
		}).on('error', function (err) {
			console.log('Unable to read data stream!', err)
			return Promise.reject(err);
		}).on('close', function () {
			console.log('Add block #' + i + " to level");
			return self.addLevelDBData(i, value);
		});
	}
	
    // Method that return the height
    getBlocksCount() {
        let self = this;
        return new Promise(function(resolve, reject){
            // Add your code here, remember in Promises you need to resolve() or reject()
			let i = 0;
			self.db.createReadStream().on('data', function (data) {
				i++;
			}).on('error', function (err) {
				console.log('Unable to read data stream!', err)
				reject(err);
			}).on('close', function () {
				resolve(i-1);
			});
        });
    }
        

}




module.exports.LevelSandbox = LevelSandbox;
