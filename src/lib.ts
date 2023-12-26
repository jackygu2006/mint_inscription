import {execContract, execEIP1559Contract} from './web3';
import Web3 from "web3";
import dotenv from 'dotenv';
import axios from 'axios';
import sleep from 'sleep-promise';
dotenv.config();

// const rpcUrl = process.env.RPC_URL as string;
// const chainId = parseInt(process.env.CHAIN_ID as string);
// const priKey = process.env.PRI_KEY as string;
// const web3 = new Web3(new Web3.providers.HttpProvider(rpcUrl));

// // =================================================================
// // ========================== Bot ==================================
// // =================================================================
// const receiverAccount = (web3.eth.accounts.privateKeyToAccount('0x' + priKey)).address;

// const mint = (hex: string, id: number) => {
// 	execEIP1559Contract(web3, chainId, priKey, hex, 0, receiverAccount, {to: receiverAccount, id}, 
// 		(hash, data) => {console.log(data.id, data.to)},
// 		(confirmations, receipt, data) => {console.log(data.id, data.to)},
// 		(receipt, data) => {console.log(data.id, data.to)},
// 		(error, data) => {console.log(data.id, data.to)}
// 	)
// }

export const batchMint = async (
	web3: any,
	hex: string, 
	receiptAddress: string, 
	id: number, 
	max: number, 
	highestGasPrice: number,
	getBlockKey: string,
	rpcUrl: string,
	chainId: number,
	priKey: string,
) => {
	if(id <= max) {
		try {
			// execEIP1559Contract(web3, chainId, priKey, hex, 0, receiptAddress, {to: receiptAddress, id}, 
			const gasPrice = await getGasPrice(getBlockKey);
			console.log("gasPrice: ", (gasPrice / 1000000000).toFixed(2), "GWei, ", (gasPrice * 22040 * 47 / 1e18).toFixed(3), "USD");
			if(gasPrice * 1.02 > highestGasPrice * 1000000000) {
				console.log("touch highest gas, quit!");
				return;
			}
			execContract(web3, chainId, priKey, hex, 0, receiptAddress, {to: receiptAddress, id}, 
					(hash, data) => {
					console.log(`Minting #${data.id}: tx: ${hash}`);
				},
				async (confirmations, receipt, data) => {
					console.log(`Get receipt #${data.id}`);
					await sleep(1500);
					console.log("=============================================");
					id++;
					batchMint(web3, hex, receiptAddress, id, max, highestGasPrice, getBlockKey, rpcUrl, chainId, priKey);
					return;
				},
				async (receipt, data) => {
				},
				(error, data) => {
					console.log(error.message, data.id, data.to)
					// id++;
					// batchMint(hex, receiptAddress, id, max, highestGasPrice);
					// return;
				},
				undefined,
				Math.floor(gasPrice * 1.02),
			)
		} catch(err) {
			id++;
			return;
		}
	} else {
		console.log("Done!");
	}
}

export const getGasPrice = (key:string):Promise<number> => {
	return new Promise((resolve, reject) => {
		const url = `https://go.getblock.io/${key}/ext/bc/C/rpc`;
	
		axios({
			url,
			method: 'post',
			headers: {'Content-Type': 'application/json'},
			data: '{"jsonrpc": "2.0", "method": "eth_gasPrice", "params": [], "id": "getblock.io"}'
		}).then((res:any) => {
			const gasPrice = res.data.result;
			resolve(parseInt(gasPrice as string, 16));
			// console.log(parseInt(gasPrice, 16)); // 77.057838956
		}).catch(error => {
			reject(0);
		})
	})
}