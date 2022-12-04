import { ethers } from "hardhat";

async function main() {

  const FundMe = await ethers.getContractFactory("FundMe");
  const fund = await FundMe.deploy();
  await fund.deployed();

  console.log("FundMe contract deployed to:", fund.address);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});