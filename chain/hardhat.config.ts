import { HardhatUserConfig } from "hardhat/config";
import { task } from "hardhat/config"
import "@nomicfoundation/hardhat-toolbox";
require("dotenv").config();

const { API_URL, PRIVATE_KEY } = process.env 

const hex = utf8ToHex(PRIVATE_KEY ?? '');

const config: HardhatUserConfig = {
  solidity: "0.8.17",
  networks: {
    mumbai: {
      url: "https://polygon-mumbai.g.alchemy.com/v2/uk-JtxXjQ_uu1okGUfwkg-gHRcUG9GKW",
      accounts: [`${process.env.PRIVATE_KEY}`]
    }
  }
};

task("accounts", "Prints the list of accounts", async () => {
  const accounts = await ethers.getSigners();

  for (const account of accounts) {
    console.log(account.address);
  }
});

function utf8ToHex(str: string) {
  return Array.from(str).map(c =>
      c.charCodeAt(0) < 128 ? c.charCodeAt(0).toString(16) :
          encodeURIComponent(c).replace(/\%/g,'').toLowerCase()
  ).join('');
}

export default config;
