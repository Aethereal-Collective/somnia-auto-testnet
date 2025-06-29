import { createWalletClient, createPublicClient, http, parseEther } from "viem";
import { privateKeyToAccount } from "viem/accounts";

import { NETWORK } from "./config/network.js";
import { CA } from "./config/contract-address.js";
import { address } from "./config/accounts.js";
import { getTokenBalance, getAllowance, approveMax, swapExactTokensForTokens, swapExactETHForTokens, getNativeBalance } from "./utils/somnia-exchange.js";

// ⚙️ Konfigurasi awal
const MAX_CYCLE = 20;
const INTERVAL = 5000; // 💡 5 detik untuk testing (1000 * 5)

const account = privateKeyToAccount(address);

console.log(`🔑 Menggunakan akun: ${account.address}`);

const walletClient = createWalletClient({
	account,
	chain: NETWORK,
	transport: http(),
});

const publicClient = createPublicClient({
	chain: NETWORK,
	transport: http(),
});

// 🔁 Main Loop Swap
let cycle = 0;

async function cycleSwap() {
	console.log(`\n🔄 [Cycle ${cycle + 1}/${MAX_CYCLE}]`);

	try {
		const sttBalance = await getNativeBalance(publicClient, account.address);
		const usdtBalance = await getTokenBalance(CA.USDTSOMNEX, publicClient, account.address);

		console.log(`💰 STT Balance: ${sttBalance} | USDT Balance: ${usdtBalance}`);

		if (usdtBalance > 0n) {
			const allowance = await getAllowance(CA.USDTSOMNEX, account.address, CA.ROUTERSOMNEX, publicClient);

			if (allowance < usdtBalance) {
				console.log("🔐 Approving USDT first...");
				const approveHash = await approveMax(CA.USDTSOMNEX, CA.ROUTERSOMNEX, walletClient, publicClient);
				console.log("✅ Approve Tx Hash:", approveHash);
			}

			console.log("🔁 Swapping USDT → STT...");
			const swapHash = await swapExactTokensForTokens(usdtBalance, [CA.USDTSOMNEX, CA.STT], walletClient, publicClient, account.address, CA.ROUTERSOMNEX);
			console.log("💱 Swap Tx Hash (USDT→STT):", swapHash);
		} else if (sttBalance > 0n) {
			console.log("🔁 Swapping STT → USDT...");

			const randomAmount = (Math.random() * (0.0005 - 0.0001) + 0.0001).toFixed(6);
			const amountToSwap = parseEther(randomAmount);

			console.log(`🎯 Random amount to swap: ${randomAmount} STT (${amountToSwap} wei)`);

			const swapHash = await swapExactETHForTokens(amountToSwap, [CA.STT, CA.USDTSOMNEX], walletClient, publicClient, account.address, CA.ROUTERSOMNEX);
			console.log("💱 Swap Tx Hash (STT→USDT):", swapHash);
		} else {
			console.log("⚠️ Tidak ada token untuk diswap.");
		}
	} catch (err) {
		console.error("🔥 Error during swap:", err.message || err);
	}

	cycle++;
	if (cycle < MAX_CYCLE) {
		console.log(`⏳ Cooldown ${INTERVAL / 1000} detik sebelum cycle selanjutnya...`);
		setTimeout(cycleSwap, INTERVAL);
	} else {
		console.log("🎉 Semua cycle selesai.");
	}
}

cycleSwap();
