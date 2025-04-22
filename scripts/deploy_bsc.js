const { ethers } = require('hardhat');
const {
	promises: { readFile, writeFile },
} = require('fs');
const path = require('path');

// npx hardhat run --network hardhat scripts/deploy_bsc.js
// npx hardhat run --network local scripts/deploy_bsc.js
// npx hardhat run --network bscTestnet scripts/deploy_bsc.js
// npx hardhat run --network bsc scripts/deploy_bsc.js

const fileName = 'bcConfig.json';
const filePath = path.join(__dirname, '../', fileName);
let bcConfig = {};

async function main() {
	const [deployer, user1, user2, user3, user4, user5] = await ethers.getSigners();

	try {
		bcConfig = JSON.parse(await readFile(filePath, 'utf-8'));
	} catch (error) {
		console.log('bcConfig', error);
	}

	const chainId = Number(await network.provider.send('eth_chainId'));
	const startBlock = await ethers.provider.getBlockNumber();

	if (!bcConfig[chainId]) bcConfig[chainId] = {};

	console.log('--------------------------------DEPLOY----------------------------------', 'CHAIN ID', chainId);

	bcConfig[chainId].chain = {
		rpcUrl: network.config.url || network.config.forking?.url,
	};

	const rvToken = await ethers.getContractAt('RevenueToken', '0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c');

	bcConfig[chainId].rvToken = {
		address: rvToken.target,
		abi: rvToken.interface.format(),
		abijson: rvToken.interface.formatJson(),
		startBlock,
	};

	// Deploy Marketplace
	const ACTMarketplace = await ethers.getContractFactory('ACTMarketplaceEVM');
	const marketplace = await upgrades.deployProxy(
		ACTMarketplace,
		[
			rvToken.target,
			100, // serviceFee 10%
			100, // serviceDelay,
			50, // validationDelay,
			10000, // validatorStakeDuration
			10000, // validatorStakeAmount
		], // Pass initialization arguments
	);
	bcConfig[chainId].marketplace = {
		address: marketplace.target,
		abi: marketplace.interface.format(),
		abijson: marketplace.interface.formatJson(),
		startBlock,
	};
	console.log('ACTMarketplace deployed:', marketplace.target);

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
		}, delay),
	);
};
