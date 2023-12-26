import { batchMint, getGasPrice } from "./lib";
import { program  } from "commander";
import { exit } from "process";
import Web3 from "web3";

program
	.allowUnknownOption()
	.version('0.1.0')
	.usage('mint [options]')

program
	.option('-t --to <MintToAddress>', 'Mint target account')
	.option('-p --prikey <PrivateKey>', 'Private key of operator account')
	.option('-s --size <SizeOfMint>', 'Total mint times')
	.option('-g --gasprice <GasPriceLimit>', 'The highest gas price can accept')
	.option('-r --rpc <rpc>', 'RPC')
	.option('-x --hex <HexString>', 'Hex string of inscription')
	.option('-c --chainid <ChainId>', 'Chain id')
	.option('-b --getblockkey <GetBlockKey>', 'GetBlock access key')

if(!process.argv[2]) program.help();
program.parse(process.argv);

const options = program.opts();
const hexString = options.hex;
const receiptAccount = options.to;
const highestGasPrice = parseInt(options.gasprice); // 80 Gwei
const quantity = parseInt(options.size);
const priKey = options.prikey;
const getBlockKey = options.getblockkey;
const rpc = options.rpc || "https://api.avax.network/ext/bc/C/rpc";
const chainId = options.chainid || "43114";

if(hexString === undefined || receiptAccount === undefined || isNaN(highestGasPrice) || isNaN(quantity) || priKey === undefined || getBlockKey === undefined) {
	console.log("options is wrong!");
	exit(0);
}

const web3 = new Web3(new Web3.providers.HttpProvider(rpc));

batchMint(web3, hexString, receiptAccount, 1, quantity, highestGasPrice, getBlockKey, rpc, parseInt(chainId), priKey);

// getGasPrice().then(res => console.log(res));