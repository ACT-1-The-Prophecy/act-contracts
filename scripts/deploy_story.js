const { utils } = require("ethers");
const { ethers } = require("hardhat");
const {
  promises: { readFile, writeFile },
} = require("fs");
const path = require("path");
const {
  time,
  setBalance,
} = require("@nomicfoundation/hardhat-network-helpers");
const { encodeBytes32String } = require("ethers");
// npx hardhat run --network hardhat scripts/deploy_story.js
// npx hardhat run --network local scripts/deploy_story.js
// npx hardhat run --network story_test scripts/deploy_story.js

const fileName = "bcConfig.json";
const filePath = path.join(__dirname, "../", fileName);
let bcConfig = {};

async function main() {
  const [deployer, user1, user2, user3, user4, user5] =
    await ethers.getSigners();

  try {
    bcConfig = JSON.parse(await readFile(filePath, "utf-8"));
  } catch (error) {
    console.log("bcConfig", error);
  }

  const chainId = Number(await network.provider.send("eth_chainId"));
  const startBlock = await ethers.provider.getBlockNumber();

  if (!bcConfig[chainId]) bcConfig[chainId] = {};

  console.log(
    "--------------------------------DEPLOY----------------------------------",
    "CHAIN ID",
    chainId
  );

  bcConfig[chainId].chain = {
    rpcUrl: network.config.url || network.config.forking?.url,
  };

  const rvToken = await ethers.getContractAt(
    "RevenueToken",
    "0x1514000000000000000000000000000000000000"
  );

  bcConfig[chainId].rvToken = {
    address: rvToken.target,
    abi: rvToken.interface.format(),
    abijson: rvToken.interface.formatJson(),
    startBlock,
  };
  const ACTStory = await ethers.getContractFactory("ACTStory");
  const actStory = await ACTStory.deploy(
    "0x77319B4031e6eF1250907aa00018B8B1c67a244b", // ipAssetRegistry
    "0x04fbd8a2e56dd85CFD5500A4A4DfA955B9f1dE6f", // licensingModule
    "0x2E896b0b2Fdb7457499B56AAaA4AE55BCB4Cd316", // pilTemplate
    "0xBe54FB168b3c982b7AaE60dB6CF75Bd8447b390E", // royaltyPolicyLAP
    "0x9515faE61E0c0447C6AC6dEe5628A2097aFE1890", // royaltyWorkflows
    "0xD2f60c40fEbccf6311f8B47c4f2Ec6b040400086", // royaltyModule
    rvToken.target
  );
  console.log("ACTStory deployed:", actStory.target);
  bcConfig[chainId].actStory = {
    address: actStory.target,
    abi: actStory.interface.format(),
    abijson: actStory.interface.formatJson(),
    startBlock,
  };

  // Deploy Marketplace
  const ACTMarketplace = await ethers.getContractFactory("ACTMarketplace");
  const marketplace = await upgrades.deployProxy(
    ACTMarketplace,
    [
      actStory.target,
      rvToken.target,
      100, // serviceFee 10%
      100, // serviceDelay,
      50, // validationDelay,
      10000, // validatorStakeDuration
      10000, // validatorStakeAmount
    ] // Pass initialization arguments
  );
  bcConfig[chainId].marketplace = {
    address: marketplace.target,
    abi: marketplace.interface.format(),
    abijson: marketplace.interface.formatJson(),
    startBlock,
  };
  console.log("ACTMarketplace deployed:", marketplace.target);
  await actStory.transferOwnership(marketplace.target);

  // await marketplace.setValidTopics(
  //   [
  //     encodeBytes32String("social_twitter"),
  //     encodeBytes32String("social_telegram"),
  //     encodeBytes32String("social_instagram"),
  //     encodeBytes32String("social_tiktok"),
  //     encodeBytes32String("social_youtube"),
  //     encodeBytes32String("social_linkedin"),
  //     encodeBytes32String("social_reddit"),
  //     encodeBytes32String("image_generation"),
  //   ],
  //   true,
  //   {
  //     gasLimit: 10000000,
  //   }
  // );

  await writeFile(`./${fileName}`, JSON.stringify(bcConfig, null, 4));
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

const wait = function (delay = 500) {
  return new Promise((resolve) =>
    setTimeout(() => {
      resolve();
    }, delay)
  );
};
