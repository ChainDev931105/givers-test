import { ethers } from "hardhat";
import { deployDEEZNUTS } from "../instructions";

async function main() {
  const [admin, charityWallet, marketingWallet] = await ethers.getSigners();

  const deeznuts = await deployDEEZNUTS(await charityWallet.getAddress(), await marketingWallet.getAddress());

  console.log("DEEZNUTS deployed to", deeznuts.address);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
