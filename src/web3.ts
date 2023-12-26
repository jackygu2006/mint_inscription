import { Common } from '@ethereumjs/common'
import { FeeMarketEIP1559Transaction, FeeMarketEIP1559TxData, LegacyTransaction, LegacyTxData } from '@ethereumjs/tx';
import Web3 from 'web3';

export const execEIP1559Contract = (
	web3: Web3, 
	chainId: string | number, 
	priKey: string, 
	sendEncodeABI: string, 
	value: string | number, 
	contractAddress: string, 
	data: any,
	onTransactionHashFun: ((txHash: string, data: any) => void), 
	onConfirmedFunc: ((confirmationNumber: number, receipt: string, data: any) => void), 
	onReceiptFunc: ((receipt: string, data: any) => void), 
	onErrorFunc: ((error: any, data: any) => void),
	gas: number | undefined,
	gasPrice: number | undefined,
) => {
	const senderAddress = (web3.eth.accounts.privateKeyToAccount('0x' + priKey)).address;
	console.log("sender", senderAddress);
	try {
		web3.eth.estimateGas({
			to: contractAddress,
			data: sendEncodeABI,
			value: web3.utils.toHex(value),
			from: senderAddress
		}, (error, estimateGas) => {
			if(error) {
				onErrorFunc(error, data);
			} else {
				console.log("estimateGas: " + estimateGas);
				// web3.eth.getMaxPriorityFeePerGas().then((price) => {
					// console.log('price' + price);
					web3.eth.getTransactionCount(senderAddress).then((transactionNonce) => {
						console.log('nonce', transactionNonce);
						sendEIP1559Transaction(web3, chainId as number, {
							chainId: web3.utils.toHex(chainId as string),
							nonce: web3.utils.toHex(transactionNonce),
							gasLimit: web3.utils.toHex(estimateGas),
							maxFeePerGas: web3.utils.toHex(25000000000), // 3GWei
							maxPriorityFeePerGas: web3.utils.toHex(25000000000), // price,
							to: contractAddress,
							value: web3.utils.toHex(value),
							data: sendEncodeABI,
							accessList: [],
							type: "0x02"
						}, priKey)
						.on('transactionHash', (txHash: string) => {
							// console.log('transactionHash:', txHash)
							if(onTransactionHashFun !== null) onTransactionHashFun(txHash, data);
						})
						.on('receipt', (receipt: any) => {
							// console.log('receipt:', receipt)
							if(onReceiptFunc !== null) onReceiptFunc(receipt, data);
						})
						.on('confirmation', (confirmationNumber: any, receipt: any) => {
							if(confirmationNumber >=1 && confirmationNumber < 2) {
								// console.log('confirmations:', confirmationNumber);
								if(onConfirmedFunc !== null) onConfirmedFunc(confirmationNumber, receipt, data);
							}
						})
						.on('error', (error: any) => {
							// console.error(error)
							if(onErrorFunc !== null) onErrorFunc(error, data);
						})
					})
				// })
			}
		});
	} catch (err) {
		// console.log(err);
		if(onErrorFunc !== null) onErrorFunc(err, data);
	}
}

export const execContract = (
	web3: Web3, 
	chainId: number | string, 
	priKey: string, 
	sendEncodeABI: string, 
	value: string | number, 
	contractAddress: string, 
	data: any,
	onTransactionHashFun: ((txHash: string, data: any) => void), 
	onConfirmedFunc: ((confirmationNumber: number, receipt: string, data: any) => void), 
	onReceiptFunc: ((receipt: string, data: any) => void), 
	onErrorFunc: ((error: any, data: any) => void),
	gas: number | undefined,
	gasPrice: number | undefined,
) => {
	const senderAddress = (web3.eth.accounts.privateKeyToAccount('0x' + priKey)).address;
	try {
		web3.eth.getTransactionCount(senderAddress).then((transactionNonce: number) => {
			const txData = {
				nonce: web3.utils.toHex(transactionNonce),
				gasLimit: web3.utils.toHex(gas === 0 || gas === undefined ? 300000 : gas), // If out of gas, change it according to estimateGas
				gasPrice: web3.utils.toHex(gasPrice === 0 || gasPrice === undefined ? 225000000000 : gasPrice), // Gas price for bsc mainnet is 5000000000(5GWei), and 10000000000 for testnet
				value: web3.utils.toHex(value),
				to: contractAddress,
				data: sendEncodeABI
			};
	
			sendRawTransaction(web3, chainId as number, txData, priKey)
				.on('transactionHash', txHash => {
					// console.log('transactionHash:', txHash)
					if(onTransactionHashFun !== null) onTransactionHashFun(txHash, data);
				})
				.on('receipt', (receipt: any) => {
					// console.log('receipt:', receipt)
					if(onReceiptFunc !== null) onReceiptFunc(receipt, data);
				})
				.on('confirmation', (confirmationNumber: any, receipt: any) => {
					if(confirmationNumber >=1 && confirmationNumber < 2) {
						// console.log('confirmations:', confirmationNumber);
						if(onConfirmedFunc !== null) onConfirmedFunc(confirmationNumber, receipt, data);
						// exit(0);
					}
				})
				.on('error', (error: any) => {
					console.error(error)
					if(onErrorFunc !== null) onErrorFunc(error, data);
				})
		});
	} catch (err:any) {
		onErrorFunc(err, data);
	}
}

const sendRawTransaction = (web3: Web3, chainId: number, txData: LegacyTxData, priKey: string) => {
	const common = Common.custom({ chainId });
	const tx = LegacyTransaction.fromTxData(txData, { common });
	const signedTx = tx.sign(Buffer.from(priKey, "hex"));
	const serializedTx = web3.utils.bytesToHex(Array.from(signedTx.serialize()));
	return web3.eth.sendSignedTransaction(serializedTx);
}

const sendEIP1559Transaction = (web3: Web3, chainId: number, txData: FeeMarketEIP1559TxData, priKey: string) => {
	const common = Common.custom({ chainId });
	const tx = FeeMarketEIP1559Transaction.fromTxData( txData , { common } );
	const signedTx = tx.sign(Buffer.from(priKey, "hex"));
	const serializedTx = web3.utils.bytesToHex(Array.from(signedTx.serialize()));
	return web3.eth.sendSignedTransaction( serializedTx );
}