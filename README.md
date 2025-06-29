# 🔁 Somnia Auto Swap Bot

A fully automated **swap bot** on the **Somnia Testnet**, built with Node.js and Viem.

## ⚙️ Features

- 🔄 **Auto Back-and-Forth Swapping:**  
  Automatically swaps between STT (native token) and USDT (ERC20) in both directions.

- 🎯 **Randomized Swap Amounts:**  
  Randomly swaps between `0.0001` and `0.0005` STT per cycle for added variability.

- ⏱️ **Interactive Swap Interval:**  
  Prompts the user to set the interval in **minutes** on startup:
  
- ♻️ **Infinite 24/7 Loop:**  
  Runs continuously with no maximum cycle limit — perfect for test automation.


---

## 🚀 How to Use

### 1. Clone the Repository
```bash
git clone https://github.com/your-username/somnia-auto-swap.git
cd somnia-auto-swap
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Setup Environment Variable
Create a `.env` file and add your private key:
```
PRIVATE_KEY=0xabc123yourprivatekeyhere
```

### 4. Start the Bot
```bash
node index.js
```

---

## 🔧 Configuration

- Token & router addresses are stored in `./config/contract-address.js`
- You can change the network RPC or chain config in `./config/network.js`
- Native token is **STT** (Somnia’s native coin), USDT is an **ERC20** test token

---

## 🛠️ Tech Stack

- [Viem](https://viem.sh/) (for RPC & contract interaction)
- Node.js
- Somnia Testnet
- Uniswap V2-style Router ABI

---

## ⚠️ Disclaimer

- This project is for **educational/testnet use only**.
- Do **NOT** use on mainnet without proper auditing and safeguards.
- Use at your own risk.

---

