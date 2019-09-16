
const LevelSandbox = require('./LevelSandbox.js');
const SHA256 = require('crypto-js/sha256');

class Block{
	constructor(data){
     this.hash = "",
     this.height = 0,
     this.body = data,
     this.time = 0,
     this.previousBlockHash = ""
    }
}

class Blockchain{
  constructor(){
	this.levelSandbox = new LevelSandbox.LevelSandbox();
    this.getBlockHeight().then((height) => {
        if(height === -1){
            this.addBlock(new Block("First block in the chain - Genesis block"));
        }
    })
  }

  // Add new block
  addBlock(newBlock){
	let self = this;
	this.getBlockHeight().then((height) => {
			newBlock.height = height +1 ;
			newBlock.time = new Date().getTime().toString().slice(0,-3);
			if (newBlock.height === 0) {
				newBlock.hash = SHA256(JSON.stringify(newBlock)).toString();
				self.levelSandbox.addDataToLevelDB(JSON.stringify(newBlock));
				console.log("First block " + newBlock.height);
			} else {
				self.getBlock(height).then((blockJson) => {
				  let previousBlock = JSON.parse(blockJson)
				  newBlock.previousBlockHash = previousBlock.hash;
				  newBlock.hash = SHA256(JSON.stringify(newBlock)).toString();
				  console.log('New block #' + newBlock.height);
				  self.levelSandbox.addDataToLevelDB(JSON.stringify(newBlock));
				});
			}
		});
  }

  // Get block height
    getBlockHeight(){
      return this.levelSandbox.getBlocksCount().then((height) => {
			console.log("Current block height " + height);
			return Promise.resolve(height);
		}).catch((err) => {
				console.log(err + " when get height");
				return Promise.reject(err);
			});
    }

    // get block
    getBlock(blockHeight){
      // return object as a single string
	  return this.levelSandbox.getLevelDBData(blockHeight).then((block) => {
			console.log("Get block #" + blockHeight + " （from getBlock）： " + block);
			return Promise.resolve(block);
		}).catch((err) => { 
			console.log(err + " when get block");
			return Promise.reject(err);
			});
    }

    // validate block
    validateBlock(blockHeight){
      let self = this;
      // get block object
      return self.getBlock(blockHeight).then((blockJson) => {
          let block = JSON.parse(blockJson)
          // get block hash
          let blockHash = block.hash;
          // remove block hash to test block integrity
          block.hash = '';
          // generate block hash
          let validBlockHash = SHA256(JSON.stringify(block)).toString();
          // Compare
          if (blockHash===validBlockHash) {
              console.log('Block #'+blockHeight+' true');
              return true;
          } else {
              console.log('Block #'+blockHeight+' invalid hash:\n'+blockHash+'<>'+validBlockHash);
              return false;
          }
      })

    }

   // Validate blockchain
    validateChain(){
      this.getBlockHeight().then((height) =>{
          let errorLog = [];
          for (var j = 0; j < height; j++) {
              // validate block
              let i = j;
              this.validateBlock(i).then((value) => {
                  console.log('Block #' + i + ' is validate? : ' + value);
                  if(!value) errorLog.push(i);
              })

              // compare blocks hash link
              this.getBlock(i).then((blockJson) => {
                  let block = JSON.parse(blockJson);
                  // get block hash
                  let blockHash = block.hash;
                  console.log('Block #' + i + 'blockHash = ' + blockHash);
                  this.getBlock(i + 1).then((blockJson) => {
                      let previousBlock = JSON.parse(blockJson);
                      let previousHash = previousBlock.hash;
                      if (blockHash!==previousHash) {
                          errorLog.push(i);
                      }
                  })
              })

          }
          if (errorLog.length>0) {
              console.log('Block errors = ' + errorLog.length);
              console.log('Blocks: '+errorLog);
          } else {
              console.log('No errors detected');
          }
      })
    }
}

//let b1 = new Block('b1');
//let b2 = new Block('b2');
//let bc = new Blockchain();
//bc.addBlock(b1);
//bc.addBlock(b2);
//bc.getBlockHeight();
//bc.getBlock(0);

let myBlockChain = new Blockchain();



myBlockChain.validateChain();

