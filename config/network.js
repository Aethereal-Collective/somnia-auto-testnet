import { defineChain } from "viem/utils";

export const NETWORK = defineChain({
	id: 50312,
	name: "Somnia Testnet",
	nativeCurrency: {
		name: "Somnia ETH",
		symbol: "STT",
		decimals: 18,
	},
	rpcUrls: {
		default: {
			http: ["https://rpc.ankr.com/somnia_testnet/6e3fd81558cf77b928b06b38e9409b4677b637118114e83364486294d5ff4811"],
		},
	},
});
