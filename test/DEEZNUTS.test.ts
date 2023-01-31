import { time, loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { anyValue } from "@nomicfoundation/hardhat-chai-matchers/withArgs";
import { expect } from "chai";
import { ethers } from "hardhat";
import { Signer } from "ethers";
import { DEEZNUTS } from "../typechain-types";
import { deployDEEZNUTS } from "../instructions";

describe("DEEZNUTS", function () {
  let admin: Signer, charityWallet: Signer, marketingWallet: Signer, userA: Signer, userB: Signer, userC: Signer;
  let deeznuts: DEEZNUTS;
  const TRANSFER_AMOUNT = ethers.utils.parseEther("10");

  before(async function () {
    [admin, charityWallet, marketingWallet, userA, userB, userC] = await ethers.getSigners();
    deeznuts = await deployDEEZNUTS(await charityWallet.getAddress(), await marketingWallet.getAddress());
  });

  it("1. Total supply equal to what you set.", async function () {
    const EXPECTED_TOTAL_SUPPLY = ethers.utils.parseEther("1000000000000"); // 1000000000000 * 10 ** 18;
    expect(await deeznuts.totalSupply()).equal(EXPECTED_TOTAL_SUPPLY);
  });

  describe("2. Transfer to wallets that are excluded and not excluded from fee", async function () {
    it("to excludeFee address", async function () {
      const userAddress = await userA.getAddress();
      await deeznuts.excludeFromFee(userAddress);
      expect(await deeznuts.isExcludedFromFee(userAddress)).equal(true);
      const tx = deeznuts.transfer(userAddress, TRANSFER_AMOUNT);
      await expect(tx).changeTokenBalances(deeznuts, [admin, userAddress], [TRANSFER_AMOUNT.mul(-1), TRANSFER_AMOUNT]);
    });
    it("to includeFee address", async function () {
      const accountFrom = await userA.getAddress();
      await deeznuts.includeInFee(accountFrom);
      expect(await deeznuts.isExcludedFromFee(accountFrom)).equal(false);

      const accountTo = await userB.getAddress();
      await deeznuts.includeInFee(accountTo);
      expect(await deeznuts.isExcludedFromFee(accountTo)).equal(false);

      const balanceBefore = await deeznuts.balanceOf(accountTo);
      const tx = deeznuts.connect(userA).transfer(accountTo, TRANSFER_AMOUNT);
      await expect(tx).not.to.rejected;
      const balanceAfter = await deeznuts.balanceOf(accountTo);

      const totalFee = TRANSFER_AMOUNT.sub(balanceAfter.sub(balanceBefore));

      // expected Fee is 12% (tax: 2%, liquidy: 3%, marketing: 3%, charity: 3%, burn: 1%)
      const expectedTotalFee = TRANSFER_AMOUNT.mul(12).div(100);
      const error = expectedTotalFee.sub(totalFee);

      // assume as okay if the error is less than 10^-12
      expect(error.abs()).lte(TRANSFER_AMOUNT.div(1_000_000_000_000));
    });
  });

  it("3. Make sure adding liquidity works", async function () {
    const uniswapRouter = await ethers.getContractAt("IUniswapV2Router02", await deeznuts.uniswapV2Router());
    const LIQUDITY_AMOUNT = ethers.utils.parseEther("100");

    await expect(deeznuts.connect(admin).approve(uniswapRouter.address, LIQUDITY_AMOUNT)).to.not.rejected;
    const timestamp = (await ethers.provider.getBlock(await ethers.provider.getBlockNumber())).timestamp;
    console.log({ balance: await ethers.provider.getBalance(await admin.getAddress()) });
    await expect(
      uniswapRouter
        .connect(admin)
        .addLiquidityETH(deeznuts.address, LIQUDITY_AMOUNT, 0, 0, await admin.getAddress(), timestamp + 60, {
          value: ethers.utils.parseEther("10"),
        }),
    ).to.not.rejected;
  });

  it("4. Check that the fees are sent to appropriate wallets correctly", async function () {
    // initialize
    const accountFrom = await userA.getAddress();
    const accountTo = await userB.getAddress();
    await expect(deeznuts.transfer(accountFrom, TRANSFER_AMOUNT)).to.not.rejected;
    await deeznuts.includeInFee(accountFrom);
    await deeznuts.includeInFee(accountTo);
    expect(await deeznuts.isExcludedFromFee(accountFrom)).equal(false);
    expect(await deeznuts.isExcludedFromFee(accountTo)).equal(false);
    const marketingAddress = await marketingWallet.getAddress();
    const charityAddress = await charityWallet.getAddress();
    const burnAddress = "0x000000000000000000000000000000000000dEaD";
    const numTokensSellToAddToLiquidity = ethers.utils.parseEther("1000000");
    await expect(deeznuts.transfer(deeznuts.address, numTokensSellToAddToLiquidity.mul(2))).to.not.rejected;

    const balanceMarketingBefore = await ethers.provider.getBalance(marketingAddress);
    const balanceCharityBefore = await ethers.provider.getBalance(charityAddress);
    const balanceBurnBefore = await deeznuts.balanceOf(burnAddress);
    const tx = deeznuts.connect(userA).transfer(accountTo, TRANSFER_AMOUNT);
    await expect(tx).to.not.rejected;
    const balanceMarketingAfter = await ethers.provider.getBalance(marketingAddress);
    const balanceCharityAfter = await ethers.provider.getBalance(charityAddress);
    const balanceBurnAfter = await deeznuts.balanceOf(burnAddress);

    console.log({ balanceMarketingAfter, balanceMarketingBefore });
    console.log({ balanceCharityAfter, balanceCharityBefore });
    console.log({ balanceBurnAfter, balanceBurnBefore });
    expect(balanceMarketingAfter).gt(balanceMarketingBefore);
    expect(balanceCharityAfter).gt(balanceCharityBefore);
    expect(balanceBurnAfter).gt(balanceBurnBefore);
  });

  it("5. Make sure swap and liquify works", async function () {
    const userAddress = await userA.getAddress();
    const tx = deeznuts.transfer(userAddress, TRANSFER_AMOUNT);
    await expect(tx).to.emit(deeznuts, "SwapAndLiquify");
  });
});
