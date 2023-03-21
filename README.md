# demo-frontend for reservoir finance's AMM

## 🚀 Quick Start

💿 Install all dependencies:

```sh
yarn install
```

## Setup

1. To set up infra for testing, clone [sdk repo](https://github.com/reservoir-labs/sdk)
2. In the sdk repo, run the following commands to set up the provider and deploy the necessary contracts: 
```
npm run anvil:avax 
npm run setupTest
npm run deployStablePair
```
3. `yarn dev`
4. Setup browser metamask to use local anvil as the RPC  

🚴‍♂️ Run your App:

```sh
yarn [start | dev] 
```

## Notes to the frontend team: 

1. This repo demonstrates the use of the `@reservoir-labs/sdk` required to build a functioning frontend for the AMM. It is a minimal demo of the functional requirements stated in the scope of work.
2. This is **NOT** an endorsement of:
   - the frontend frameworks to use 
   - the web3 frameworks to use 
   - the visual style to adopt
   - the way to use the react hooks and other react components
   - the way to update the state
   - the coding styles of js / ts / tsx to adopt in the actual project
      - this frontend repo is done by an engineer who's not familiar with react at all XD  
3. There may be bugs in the sdk implementation as well so please highlight / discuss with the team if anything feels wrong. 
4. User interaction scenarios 
    - Swap 
      - Input is a native token
      - Output is a native token
      - Wrapping / unwrapping native token?
        - E.g. AVAX <=> WAVAX
    - Add Liq
      - Add liq to a pair that already exists
        - Involves a native token
        - Does not involve a native token
      - Add liq to a pair that doesn't already exist, creates the pair in the process
        - Involves a native token
        - Does not involve a native token
    - Remove Liq
      - Removes liq from an existing pair 
        - Involves a native token
        - Does not involve a native token

## Known issues / things that may go wrong  

- Signed tx doesn't get mined:  
  - reset your account on metamask as the nonce on metamask might be different from what anvil has

- Errors thrown in the console
  - sometimes it is due to two states being updated at the same time, but the hook runs first. If data is valid, there should be no error shown in the "on-chain simulation error returns"
  - so that should be the basis for your observation 

- price impact 
  - function not working at the moment, will provide an update once it's resolved
