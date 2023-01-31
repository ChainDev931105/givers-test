# Givers-test

## Assignment
Based on this project: https://github.com/nmsteve/GIVERSChain 

1. install hardhat
2. start advanced project
3. run advanced project test
4. Change the token variables as stated below.
5. Write local test for the following token and deploy it on Goerli, Sepolia or any other testnet

https://bscscan.com/address/0x741f72bc9e29f662f2eb41c5ab450a2ca33be57d#code

**Token Name** - GIVERSChain

**Symbol** - GIVERS

**Blockchain** - Binance Smart Chain (BSC)

**Total Supply** - 1,000,000,000

### Features:

- 3% fee auto add to the liquidity pool to locked forever when selling
- 3% fee auto distribute to all holders
- 3% fee auto moved to charity wallet
- 1% fee auto moved to burn wallet

### Expected tests:

1. Total supply equal to what you set.
2. Transfer to wallets that are excluded and not excluded from fee
3. Make sure adding liquidity works
4. Check that the fees are sent to appropriate wallets correctly
5. Make sure swap and liquify works

## Guide

### .env
```
INFURA_API_KEY=<Infura api key>
PRIVATE_KEY_0=<private key of PRIMARY WALLET>
PRIVATE_KEY_1=<private key of CHARITY WALLET>
PRIVATE_KEY_2=<private key of MARKETING WALLET>
```

### Script

```bash
# build
yarn build
# test
yarn test

# deploy to goerli (don't forget to set .env)
yarn deploy:goerli
```

## Address

