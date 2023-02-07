# `ethereum-boilerplate`

# 🚀 `Quick Start`

💿 Install all dependencies:

```sh
cd ethereum-boilerplate
yarn install
```

## Setup

1. To set up infra for testing, clone [sdk repo](https://github.com/reservoir-labs/sdk)
2. In the sdk repo, run `npm run anvil`, then `npm run setupTest` to set up the provider and deploy the necessary contracts
3. `yarn dev`

✏ Rename `.env.local.example` to `.env.local` and provide required data. Get your Web3 Api Key from the [Moralis dashboard](https://admin.moralis.io/):

![image](https://user-images.githubusercontent.com/78314301/186810270-7c365d43-ebb8-4546-a383-32983fbacef9.png)

🚴‍♂️ Run your App:

```sh
yarn start
```

# 🧭 `Table of contents`
- [`ethereum-boilerplate`](#ethereum-boilerplate)
- [🚀 Quick Start](#-quick-start)
- [🧭 Table of contents](#-table-of-contents)
- [🏗 Ethereum Components](#-ethereum-components)
  - [`<NFTBalances />`](#nftbalances-)
  - [`<ERC20Balances />`](#erc20balances-)
  - [`<ERC20Transfers />`](#erc20transfers-)
  - [`<NFTTransfers />`](#nfttransfers-)
  - [`<Transactions />`](#transactions-)

# 🏗 Ethereum Components

### `<NFTBalances />`

![image](https://user-images.githubusercontent.com/78314301/186813114-2b2265a5-5177-4ab8-9076-588107d450f1.png)

location: `src/component/templates/balances/NFT/NFTBalances.tsx`

🎨 `<NFTBalances />` : displays the the user's balances. Uses Moralis Evm API (does not require an active web3 provider).

### `<ERC20Balances />`

![image](https://user-images.githubusercontent.com/78314301/186813448-a0b63106-bcba-46d2-be80-3a7d962e2302.png)

location: `src/component/templates/balances/ERC20/ERC20Balances.tsx`

💰 `<ERC20Balances />` : displays the user's ERC20 balances. Uses Moralis Evm API (does not require an active web3 provider).

### `<ERC20Transfers />`

![image](https://user-images.githubusercontent.com/78314301/186813957-69badb89-bf93-44e6-90e7-c35801c24d9a.png)

location: `src/component/templates/transfers/ERC20/ERC20Transfers.tsx`

💰 `<ERC20Transfers />` : displays the user's ERC20 transfers. Uses Moralis Evm API (does not require an active web3 provider).

### `<NFTTransfers />`

![image](https://user-images.githubusercontent.com/78314301/186814187-916851d7-703d-4e30-9b28-b66b0bea90b1.png)

location: `src/component/templates/transfers/NFT/NFTTransfers.tsx`

🎨 `<NFTTransfers />` : displays the user's NFT transfers. Uses Moralis Evm API (does not require an active web3 provider).

### `<Transactions />`

![image](https://user-images.githubusercontent.com/78314301/186812987-74d8e534-5171-4a53-83f9-3b470bc97e63.png)

location: `src/component/templates/transactions/Transactions.tsx`

💰 `<Transactions />` : displays the user's transactions. Uses Moralis Evm API (does not require an active web3 provider).

