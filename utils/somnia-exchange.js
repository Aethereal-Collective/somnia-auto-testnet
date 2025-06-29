// 🔍 Get ERC20 balance
export async function getTokenBalance(token, publicClient, userAddress) {
	return await publicClient.readContract({
		address: token,
		abi: [
			{
				name: "balanceOf",
				type: "function",
				stateMutability: "view",
				inputs: [{ name: "owner", type: "address" }],
				outputs: [{ type: "uint256" }],
			},
		],
		functionName: "balanceOf",
		args: [userAddress],
	});
}

// 🔍 Get native token balance (STT)
export async function getNativeBalance(publicClient, userAddress) {
	return await publicClient.getBalance({ address: userAddress });
}

// 🔍 Get ERC20 allowance
export async function getAllowance(token, owner, spender, publicClient) {
	return await publicClient.readContract({
		address: token,
		abi: [
			{
				name: "allowance",
				type: "function",
				stateMutability: "view",
				inputs: [
					{ name: "owner", type: "address" },
					{ name: "spender", type: "address" },
				],
				outputs: [{ type: "uint256" }],
			},
		],
		functionName: "allowance",
		args: [owner, spender],
	});
}

// ✅ Approve max amount for spender
export async function approveMax(token, spender, walletClient, publicClient) {
	const txHash = await walletClient.writeContract({
		address: token,
		abi: [
			{
				name: "approve",
				type: "function",
				stateMutability: "nonpayable",
				inputs: [
					{ name: "spender", type: "address" },
					{ name: "amount", type: "uint256" },
				],
				outputs: [{ type: "bool" }],
			},
		],
		functionName: "approve",
		args: [spender, 2n ** 256n - 1n],
	});

	console.log("⏳ Waiting for approve to be confirmed...");
	const receipt = await publicClient.waitForTransactionReceipt({ hash: txHash });
	console.log("✅ Approve confirmed in block:", receipt.blockNumber);

	return txHash;
}

// 🔁 Swap ERC20 token → token (e.g. USDT → STT)
export async function swapExactTokensForTokens(amountIn, path, walletClient, publicClient, userAddress, routerAddress) {
	const deadline = BigInt(Math.floor(Date.now() / 1000) + 60 * 20);

	const txHash = await walletClient.writeContract({
		address: routerAddress,
		abi: [
			{
				name: "swapExactTokensForTokens",
				type: "function",
				stateMutability: "nonpayable",
				inputs: [
					{ name: "amountIn", type: "uint256" },
					{ name: "amountOutMin", type: "uint256" },
					{ name: "path", type: "address[]" },
					{ name: "to", type: "address" },
					{ name: "deadline", type: "uint256" },
				],
				outputs: [{ name: "amounts", type: "uint256[]" }],
			},
		],
		functionName: "swapExactTokensForTokens",
		args: [
			amountIn,
			1n, // Minimum output (slippage tolerance)
			path,
			userAddress,
			deadline,
		],
	});

	console.log("⏳ Waiting for token→token swap confirmation...");
	const receipt = await publicClient.waitForTransactionReceipt({ hash: txHash });
	console.log("✅ Token→Token swap confirmed in block:", receipt.blockNumber);

	return txHash;
}

// 🔁 Swap native token (STT) → ERC20 token (USDT)
export async function swapExactETHForTokens(amountInWei, path, walletClient, publicClient, userAddress, routerAddress) {
	const deadline = BigInt(Math.floor(Date.now() / 1000) + 60 * 20);

	const txHash = await walletClient.writeContract({
		address: routerAddress,
		abi: [
			{
				name: "swapExactETHForTokens",
				type: "function",
				stateMutability: "payable",
				inputs: [
					{ name: "amountOutMin", type: "uint256" },
					{ name: "path", type: "address[]" },
					{ name: "to", type: "address" },
					{ name: "deadline", type: "uint256" },
				],
				outputs: [{ name: "amounts", type: "uint256[]" }],
			},
		],
		functionName: "swapExactETHForTokens",
		args: [1n, path, userAddress, deadline],
		value: amountInWei,
	});

	console.log("⏳ Waiting for STT→USDT swap confirmation...");
	const receipt = await publicClient.waitForTransactionReceipt({ hash: txHash });
	console.log("✅ Native→Token swap confirmed in block:", receipt.blockNumber);

	return txHash;
}
