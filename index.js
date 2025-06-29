import { createWalletClient, createPublicClient, http, parseEther, formatEther } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import readline from "readline";

import { NETWORK } from "./config/network.js";
import { CA } from "./config/contract-address.js";
import { address } from "./config/accounts.js";
import { getTokenBalance, getAllowance, approveMax, swapExactTokensForTokens, swapExactETHForTokens, getNativeBalance } from "./utils/somnia-exchange.js";

const rl = readline.createInterface({
	input: process.stdin,
	output: process.stdout,
});

function askQuestion(query) {
	return new Promise((resolve) => rl.question(query, resolve));
}

let INTERVAL = 5000;

const account = privateKeyToAccount(address);

const walletClient = createWalletClient({
	account,
	chain: NETWORK,
	transport: http(),
});

const publicClient = createPublicClient({
	chain: NETWORK,
	transport: http(),
});

async function startSwapLoop() {
	console.log(`\n🕒 Starting infinite swap loop with interval ${INTERVAL / 60000} minutes...`);

	while (true) {
		console.log(`\n🔄 Swap Cycle at ${new Date().toLocaleTimeString()}`);

		try {
			const sttBalance = await getNativeBalance(publicClient, account.address);
			const usdtBalance = await getTokenBalance(CA.USDTSOMNEX, publicClient, account.address);

			console.log(`💰 STT Balance: ${formatEther(sttBalance)} | USDT Balance: ${formatEther(usdtBalance)}`);

			if (usdtBalance > 0) {
				const allowance = await getAllowance(CA.USDTSOMNEX, account.address, CA.ROUTERSOMNEX, publicClient);

				if (allowance < usdtBalance) {
					console.log("🔐 Approving USDT...");
					const approveHash = await approveMax(CA.USDTSOMNEX, CA.ROUTERSOMNEX, walletClient, publicClient);
					console.log("✅ Approve Tx Hash:", approveHash);
				}

				console.log("🔁 Swapping USDT → STT...");
				const swapHash = await swapExactTokensForTokens(usdtBalance, [CA.USDTSOMNEX, CA.STT], walletClient, publicClient, account.address, CA.ROUTERSOMNEX);
				console.log("💱 Swap Tx Hash (USDT→STT):", swapHash);
			} else if (sttBalance > 0) {
				console.log("🔁 Swapping STT → USDT...");

				const randomAmount = (Math.random() * (0.0005 - 0.0001) + 0.0001).toFixed(6);
				const amountToSwap = parseEther(randomAmount);

				console.log(`🎯 Random amount to swap: ${randomAmount} STT (${amountToSwap} wei)`);

				const swapHash = await swapExactETHForTokens(amountToSwap, [CA.STT, CA.USDTSOMNEX], walletClient, publicClient, account.address, CA.ROUTERSOMNEX);
				console.log("💱 Swap Tx Hash (STT→USDT):", swapHash);
			} else {
				console.log("⚠️ No tokens available to swap.");
			}
		} catch (err) {
			console.error("🔥 Error during swap:", err.message || err);
		}

		console.log(`⏳ Waiting for ${INTERVAL / 1000} seconds...\n`);
		await new Promise((r) => setTimeout(r, INTERVAL));
	}
}

async function start() {
	console.log(`🔑 Using account: ${account.address}`);

	const intervalInput = await askQuestion("⏱️ Enter interval in minutes (default 5):  ");
	INTERVAL = (parseInt(intervalInput) || 1) * 60 * 1000;

	rl.close();
	await startSwapLoop();
}

start();
