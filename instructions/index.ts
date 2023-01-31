import { BigNumber, Signer } from "ethers";
import { artifacts, ethers } from "hardhat";
import { DEEZNUTS } from "../typechain-types";

export async function deployDEEZNUTS(charityWallet: string, marketingWallet: string) {
  const deeznutsFactory = await ethers.getContractFactory("DEEZNUTS");
  const deeznuts = await deeznutsFactory.deploy(charityWallet, marketingWallet);
  await deeznuts.deployed();
  return deeznuts;
}
