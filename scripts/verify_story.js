const { run, ethers, network } = require("hardhat");
const fs = require("fs");
const path = require("path");
// npx hardhat run --network story_test scripts/verify_story.js
const filePath = path.join(__dirname, "../bcConfig.json");

async function main() {
  const bcConfig = JSON.parse(fs.readFileSync(filePath, "utf-8"));
  console.log(bcConfig);
  const chainId = Number(await network.provider.send("eth_chainId"));
  const config = bcConfig[chainId];

  console.log(chainId, config);

  if (!config) {
    throw new Error(`No config found for chainId ${chainId}`);
  }

  console.log("🔍 Verifying ACTStory...");
  await run("verify:verify", {
    address: config.actStory.address, // This should be ACTStory
    constructorArguments: [
      "0x77319B4031e6eF1250907aa00018B8B1c67a244b",
      "0x04fbd8a2e56dd85CFD5500A4A4DfA955B9f1dE6f",
      "0x2E896b0b2Fdb7457499B56AAaA4AE55BCB4Cd316",
      "0xBe54FB168b3c982b7AaE60dB6CF75Bd8447b390E",
      "0x9515faE61E0c0447C6AC6dEe5628A2097aFE1890",
      "0xD2f60c40fEbccf6311f8B47c4f2Ec6b040400086",
      config.rvToken.address,
    ],
    contract: "contracts/ACTStory.sol:ACTStory",
  });

  console.log("✅ ACTStory verified");

  console.log("🔍 Verifying ACTMarketplace (proxy implementation)...");
  const implAddress = await getImplementationAddress(
    config.marketplace.address
  );
  await run("verify:verify", {
    address: implAddress,
    constructorArguments: [],
    contract: "contracts/ACTMarketplace.sol:ACTMarketplace",
  });

  console.log("✅ ACTMarketplace verified");
}

// Get implementation address of upgradeable proxy
async function getImplementationAddress(proxyAddress) {
  const implStorageSlot =
    "0x360894A13BA1A3210667C828492DB98DCA3E2076CC3735A920A3CA505D382BBC"; // EIP-1967
  const implHex = await ethers.provider.getStorage(
    proxyAddress,
    implStorageSlot
  );
  return ethers.getAddress("0x" + implHex.slice(26));
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
