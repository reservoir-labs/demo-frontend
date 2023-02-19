# `demo-frontend for reservoir finance's AMM`

# 🚀 `Quick Start`

💿 Install all dependencies:

```sh
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
yarn [start | dev] 
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

Notes to the frontend team: 

1. This repo demonstrates the use of the `@reservoir-labs/sdk` required to build a functioning frontend for the AMM. It is a minimal demo of the functional requirements stated in the scope of work.
2. This is **NOT** an endorsement of:
   - the frontend frameworks to use 
   - the web3 frameworks to use 
   - the visual style to adopt
   - the way to use the react hooks and other react components
   - the coding styles of js / ts / tsx to adopt in the actual project
      - this frontend repo is done by an engineer who's not familiar with react at all XD  
3. There may be bugs in the sdk implementation as well so please highlight / discuss with the team if anything feels wrong. 


## Things that may go wrong

- if your transaction doesn't sign:  
  - reset your account on metamask as the nonce on metamask might be different from what anvil has
