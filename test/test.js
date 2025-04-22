const { utils, toUtf8Bytes, hexlify, parseEther, MaxUint256, toUtf8String, keccak256, AbiCoder, getBytes, encodeBytes32String, decodeBytes32String } = require('ethers');
const { expect } = require('chai');
const { ethers, upgrades } = require('hardhat');
const helpers = require('@nomicfoundation/hardhat-network-helpers');
const abiCoder = new AbiCoder();

// npx hardhat test test/test.js --grep ""
let deployer, devWallet, signer, user1, user2, user3, user4, user5, agent1, agent2, agent3, agent4, validator;

describe('ACTMarketplace', async function () {
	before(async function () {
		const chainId = Number(await network.provider.send('eth_chainId'));
		console.log('--------------------------------DEPLOY----------------------------------', 'CHAIN ID', chainId);

		[deployer, devWallet, signer, user1, user2, user3, user4, user5, agent1, agent2, agent3, agent4, validator] = await ethers.getSigners();

		const MockIPGraph = await ethers.getContractFactory('MockIPGraph');

		const mockIPGraph = await MockIPGraph.deploy();

		const deployedBytecode = await ethers.provider.getCode(mockIPGraph.target);

		await network.provider.send('hardhat_setCode', [
			'0x0000000000000000000000000000000000000101',
			deployedBytecode,
			//'0x60806040526004361015610011575f80fd5b5f3560e01c80630df2b8791461010057806310487a6c146102af578063152f6be9146101a05780631c4863661461010a5780632b6d6e54146102aa5780633c71acae146102af57806340e33d5b146102aa5780635a5f66a9146101a557806365b55e26146101aa5780636ed93dd01461028c578063762eca33146101e45780638df52bc9146101c95780639d66f786146101af578063a7624eb1146101aa578063a987a48114610105578063d1335888146101a5578063d5a1fc52146101a0578063d9139f191461010f578063dae55af81461010a578063de87777d146101055763f8330f0214610100575f80fd5b610322565b610739565b6103f7565b3461019c57608036600319011261019c576101286102b4565b6101306102ca565b6064359160016044358015610171575b1461014757005b6001600160a01b039081165f90815260036020908152604080832094909316825292909252902055005b818060a01b0383165f52600260205260405f20828060a01b0385165f526020528460405f2055610140565b5f80fd5b6103a5565b61055a565b610590565b3461019c575f36600319011261019c5760206040515f8152f35b3461019c575f36600319011261019c57602060405160018152f35b3461019c57604036600319011261019c576101fd6102b4565b602435906001600160401b03821161019c573660238301121561019c5760048201356001600160401b03811161019c573660248260051b8501011161019c57906001600160a01b03165f5b8281101561028a57815f525f60205260405f209060248160051b860101359160018060a01b03831680930361019c5760019261028391610ddb565b5001610248565b005b3461019c575f36600319011261019c5760206040516305f5e1008152f35b6104de565b61036f565b600435906001600160a01b038216820361019c57565b602435906001600160a01b038216820361019c57565b60206040818301928281528451809452019201905f5b8181106103035750505090565b82516001600160a01b03168452602093840193909201916001016102f6565b3461019c57606036600319011261019c576004356001600160a01b038116810361019c575061036b604051610358602082610af1565b5f81525f368137604051918291826102e0565b0390f35b3461019c57604036600319011261019c57602061039b61038d6102b4565b6103956102ca565b90610b28565b6040519015158152f35b3461019c57604036600319011261019c57602061039b6103c36102b4565b6103cb6102ca565b6001600160a01b039182165f908152808552604080822092909316815260019091016020522054151590565b3461019c57602036600319011261019c576104296104136102b4565b61041b610bf8565b6001600160a01b0316610c70565b6008546001600160801b0380821660809290921c9190910316156104d1576001600160a01b03610457610cb0565b165f5b815f525f60205260405f20548110156104ca57600190825f525f6020526104848160405f20610d60565b905460039190911b1c60a083901b839003165f81815260076020526040902054156104b1575b500161045a565b806104be6104c492610d75565b50610c70565b5f6104aa565b5050610429565b6020600654604051908152f35b3461019c57602036600319011261019c576104f76102b4565b60018060a01b03165f525f60205260405f206040519081602082549182815201915f5260205f20905f5b8181106105445761036b8561053881870382610af1565b604051918291826102e0565b8254845260209093019260019283019201610521565b3461019c57602036600319011261019c576105736102b4565b60018060a01b03165f525f602052602060405f2054604051908152f35b3461019c57604036600319011261019c576105a96102b4565b5f6024358015610647575b6001146105c7575b604051908152602090f35b505f906001600160a01b0316815b815f525f60205260405f205483101561063c57610634600191835f525f6020526106028560405f20610d60565b848060a01b0391549060031b1c16845f52600360205260405f2090848060a01b03165f5260205260405f205490610e2e565b9201916105d5565b9050602091506105bc565b9190505f610653610bf8565b6106656001600160a01b038316610c70565b6008546001600160801b0380821660809290921c919091031615610732576001600160a01b03610693610cb0565b16915f915b835f525f60205260405f205483101561072857610708600191855f525f6020526106c58560405f20610d60565b905460039190911b1c60a084901b849003165f8181526007602052604090205415610710575b865f52600260205260405f20905f5260205260405f205490610e2e565b920191610698565b61071981610d75565b5061072381610c70565b6106eb565b9092509050610665565b90916105b4565b3461019c57606036600319011261019c576004356001600160a01b0381169081810361019c57506024356001600160a01b038116919082810361019c575f9160443580156109fe575b600114610795575b602083604051908152f35b929091505f6107a2610bf8565b6107ab84610c70565b6008546001600160801b0380821660809290921c9190910316156109f5576001600160a01b036107d9610cb0565b169382851461089257845f525f60205260405f205415610889575f5b855f525f60205260405f205481101561087a57600190865f525f60205261081f8160405f20610d60565b838060a01b0391549060031b1c16828060a01b0316805f528260205260405f2088848060a01b0319825416179055805f52600760205260405f205415610867575b50016107f5565b806104be61087492610d75565b5f610860565b50919350915b919290926107ab565b91935091610880565b92915092505b5b6001600160a01b031681811461090e57600a546001600160801b038082165f1901169060801c81146108fc57805f52600b6020528160405f205560018060801b0319600a541617600a555f52600160205260018060a01b0360405f205416610899565b634e487b715f5260416020526024601cfd5b50600a549091906001600160801b0380821660809290921c919091031661093b575b602091505f8061078a565b506001600160a01b0361094c610d11565b16905f52600360205260405f2060018060a01b0382165f5260205260405f20545b600a546001600160801b0380821660809290921c9190910316156109ec576001600160a01b0361099b610d11565b16825f52600360205260405f209060018060a01b03165f5260205260405f2054908181029181830414901517156109d8576305f5e100900461096d565b634e487b7160e01b5f52601160045260245ffd5b60209150610930565b92919050610898565b5f9350610a09610bf8565b610a1282610c70565b6008546001600160801b0380821660809290921c919091031615610aec576001600160a01b03610a40610cb0565b16925f5b845f525f60205260405f2054811015610ae457845f525f60205286610a6c8260405f20610d60565b905460039190911b1c6001600160a01b03165f8181526007602052604090205415610acc575b14610aa0575b600101610a44565b94610ac4600191865f52600260205260405f20895f5260205260405f205490610e2e565b959050610a98565b610ad581610d75565b50610adf81610c70565b610a92565b509250610a12565b610782565b601f909101601f19168101906001600160401b03821190821017610b1457604052565b634e487b7160e01b5f52604160045260245ffd5b610b349061041b610bf8565b6008546001600160801b0380821660809290921c919091031615610bf3576001600160a01b03610b62610cb0565b16905f5b825f525f60205260405f2054811015610beb57825f525f602052610b8d8160405f20610d60565b90546001600160a01b0360039290921b1c8116919083168214610be25781610bc26001935f52600760205260405f2054151590565b15610bcf575b5001610b66565b806104be610bdc92610d75565b5f610bc8565b50505050600190565b509050610b34565b505f90565b6006545f5b818110610c115750505f600a819055600855565b60065415610c5c5760065f527ff652222313e28459528d920b65115c16c04f3efc82aaedc97be59f3f377c0d3f5460019190610c55906001600160a01b0316610e3b565b5001610bfd565b634e487b7160e01b5f52603260045260245ffd5b6008546001600160801b038082165f190116919060801c82146108fc575f82815260096020526040902055600880546001600160801b0319169091179055565b6008546001600160801b038116919060801c8214610cff575f8281526009602052604081208054919055600880546001600160801b03191660019094016001600160801b031693909317909255565b634e487b715f5260316020526024601cfd5b600a546001600160801b038116919060801c8214610cff575f828152600b602052604081208054919055600a80546001600160801b03191660019094016001600160801b031693909317909255565b8054821015610c5c575f5260205f2001905f90565b805f52600760205260405f2054155f14610bf357600654600160401b811015610b1457610dc4610dae8260018594016006556006610d60565b819391549060031b91821b915f19901b19161790565b9055600654905f52600760205260405f2055600190565b5f828152600182016020526040902054610e2857805490600160401b821015610b145782610e13610dae846001809601855584610d60565b90558054925f520160205260405f2055600190565b50505f90565b919082018092116109d857565b5f818152600760205260409020548015610e28575f1981018181116109d8576006545f198101919082116109d857818103610ec2575b5050506006548015610eae575f1901610e8b816006610d60565b8154905f199060031b1b191690556006555f5260076020525f6040812055600190565b634e487b7160e01b5f52603160045260245ffd5b610ee4610ed3610dae936006610d60565b90549060031b1c9283926006610d60565b90555f52600760205260405f20555f8080610e7156fea26469706673582212207a1881a1ee765f75d99b0fab2cc437e10545210d536a9d4d756efebcf8ccde1064736f6c634300081a0033',
		]);
	});

	const ipAssetRegistry = '0x77319B4031e6eF1250907aa00018B8B1c67a244b';
	const licensingModule = '0x04fbd8a2e56dd85CFD5500A4A4DfA955B9f1dE6f';
	const pilTemplate = '0x2E896b0b2Fdb7457499B56AAaA4AE55BCB4Cd316';
	const royaltyPolicyLAP = '0xBe54FB168b3c982b7AaE60dB6CF75Bd8447b390E';
	const royaltyWorkflows = '0x9515faE61E0c0447C6AC6dEe5628A2097aFE1890';
	const royaltyModule = '0xD2f60c40fEbccf6311f8B47c4f2Ec6b040400086';
	const revenueToken = '0x1514000000000000000000000000000000000000';

	beforeEach(async function () {
		//this.rvToken = await ethers.getContractAt('RevenueToken', revenueToken);

		//this.ipAssetRegistry = await ethers.getContractAt('IPAssetRegistry', ipAssetRegistry);

		this.feeBasis = 1000;
		this.serviceFee = 100; // 10%
		this.serviceDelay = 100; // seconds
		this.validationDelay = 50; // seconds
		this.validatorStakeDuration = 10000; // seconds
		this.validatorStakeAmount = 10000; // amount

		const RevenueToken = await ethers.getContractFactory('RevenueToken');
		this.rvToken = await RevenueToken.deploy();
		await this.rvToken.waitForDeployment();

		const ACTStory = await ethers.getContractFactory('ACTStory');
		this.actStory = await ACTStory.deploy(
			ipAssetRegistry,
			licensingModule, //this.licensingModule.address,
			pilTemplate,
			royaltyPolicyLAP,
			royaltyWorkflows,
			royaltyModule,
			this.rvToken.target,
		);

		const ACTMarketplace = await ethers.getContractFactory('ACTMarketplace');
		this.marketplace = await upgrades.deployProxy(
			ACTMarketplace,
			[this.actStory.target, this.rvToken.target, this.serviceFee, this.serviceDelay, this.validationDelay, this.validatorStakeDuration, this.validatorStakeAmount], // Pass initialization arguments
		);

		await this.marketplace.waitForDeployment();
		await this.actStory.transferOwnership(this.marketplace.target);

		//await this.marketplace.setValidTopics(
		//	[encodeBytes32String('image'), encodeBytes32String('video'), encodeBytes32String('post')],
		//	true, // state
		//);

		await this.rvToken.connect(user1).deposit({ value: parseEther('100') });
		await this.rvToken.connect(user1).approve(this.marketplace.target, MaxUint256);

		await this.rvToken.connect(validator).deposit({ value: parseEther('100') });
		await this.rvToken.connect(validator).approve(this.marketplace.target, MaxUint256);
	});

	describe('Common flow', function () {
		beforeEach(async function () {});
		// npx hardhat test test/test.js --grep "client can close pending task if not assigned"
		it('client can close pending task if not assigned', async function () {
			const reward = 1000;
			const validationReward = 100;
			await expect(
				this.marketplace.connect(user1).createTasks([
					{
						state: 0, // TaskState
						reward,
						submissionDuration: 100,
						executionDuration: 100,
						topic: encodeBytes32String('image'),
						payload: 'payload',
						agents: [],
						agentSignature: '0x',
						agentSignatureExpire: 0,
						validationReward,
					},
				]),
			).to.not.be.reverted;
			await expect(this.marketplace.connect(user1).deleteTasks([1], true)).to.not.be.reverted;
		});
		// npx hardhat test test/test.js --grep "client can close invited task if not assigned"
		it('client can close invited task if not assigned', async function () {
			await expect(
				this.marketplace.connect(agent1).registerAgent(
					'agent metadata',
					[encodeBytes32String('image')],
					[
						{
							enabled: true,
							fee: 1000,
							executionDuration: 100,
							metadata: 'agent topic metadata',
							autoAssign: true,
						},
					],
				),
			).to.not.be.reverted;
			const reward = 1000;
			const validationReward = 100;
			await expect(
				this.marketplace.connect(user1).createTasks([
					{
						state: 1, // INVITED
						reward,
						submissionDuration: 100,
						executionDuration: 100,
						topic: encodeBytes32String('image'),
						payload: 'payload',
						agents: [agent1.address],
						agentSignature: '0x',
						agentSignatureExpire: 0,
						validationReward,
					},
				]),
			).to.not.be.reverted;
			await expect(this.marketplace.connect(user1).deleteTasks([1], true)).to.not.be.reverted;
		});

		// npx hardhat test test/test.js --grep "client can withdraw funds from assigned task if agent not submitted in time"
		it('client can withdraw funds from assigned task if agent not submitted in time', async function () {
			await expect(
				this.marketplace.connect(agent1).registerAgent(
					'agent metadata',
					[encodeBytes32String('image')],
					[
						{
							enabled: true,
							fee: 1000,
							executionDuration: 100,
							metadata: 'agent topic metadata',
							autoAssign: true,
						},
					],
				),
			).to.not.be.reverted;
			const reward = 1000;
			const validationReward = 100;
			await expect(
				this.marketplace.connect(user1).createTasks([
					{
						state: 2, // ASSIGNED
						reward,
						submissionDuration: 100,
						executionDuration: 100,
						topic: encodeBytes32String('image'),
						payload: 'payload',
						agents: [agent1.address],
						agentSignature: '0x',
						agentSignatureExpire: 0,
						validationReward,
					},
				]),
			).to.not.be.reverted;

			const lockedBalance1 = await this.marketplace.lockedBalance(user1.address);
			expect(lockedBalance1).to.equal(reward + validationReward);

			await helpers.time.increase(100);

			const lockedBalance2 = await this.marketplace.lockedBalance(user1.address);
			expect(lockedBalance2).to.equal(0);

			const finalBalance = await this.marketplace.balances(user1.address);
			expect(finalBalance).to.equal(reward + validationReward);
		});

		// npx hardhat test test/test.js --grep "agent can set topics and client can autoassign"
		it('agent can set topics and client can autoassign', async function () {
			await expect(
				this.marketplace.connect(agent1).registerAgent(
					'agent metadata',
					[encodeBytes32String('image')],
					[
						{
							enabled: true,
							fee: 1000,
							executionDuration: 100,
							metadata: 'agent image topic metadata',
							autoAssign: true,
						},
					],
				),
			).to.not.be.reverted;
			await expect(
				this.marketplace.connect(agent1).setAgentTopics(
					[encodeBytes32String('video'), encodeBytes32String('post')],
					[
						{
							enabled: true,
							fee: 1000,
							executionDuration: 100,
							metadata: 'agent video topic metadata',
							autoAssign: true,
						},
						{
							enabled: true,
							fee: 1000,
							executionDuration: 100,
							metadata: 'agent post topic metadata',
							autoAssign: true,
						},
					],
				),
			).to.not.be.reverted;

			await expect(
				this.marketplace.connect(agent1).setAgentTopics(
					[encodeBytes32String('video')],
					[
						{
							enabled: false,
							fee: 1000,
							executionDuration: 100,
							metadata: 'video topic metadata',
							autoAssign: true,
						},
					],
				),
			).to.not.be.reverted;

			const agentData = await this.marketplace.connect(agent1).getAgent(agent1.address);
			//console.log('agentData', agentData);
			expect(
				agentData.agent.topics.map((t) => {
					return decodeBytes32String(t);
				}),
			).to.include('post');
			expect(agentData.agent.topics.map((t) => decodeBytes32String(t))).to.not.include('video');

			const reward = 1000;
			const validationReward = 100;
			await expect(
				this.marketplace.connect(user1).createTasks([
					{
						state: 2, // ASSIGNED
						reward,
						submissionDuration: 100,
						executionDuration: 100,
						topic: encodeBytes32String('image'),
						payload: 'payload',
						agents: [agent1.address],
						agentSignature: '0x',
						agentSignatureExpire: 0,
						validationReward,
					},
				]),
			).to.not.be.reverted;

			await expect(this.marketplace.connect(agent1).submitTask(1, 'result')).to.not.be.reverted;
		});

		// npx hardhat test test/test.js --grep "funds should be unlocked when pending task expired"
		it('funds should be unlocked when pending task expired', async function () {
			const reward = 1000;
			const validationReward = 100;
			await expect(
				this.marketplace.connect(user1).createTasks([
					{
						state: 0,
						reward,
						submissionDuration: 100,
						executionDuration: 100,
						topic: encodeBytes32String('post'),
						payload: 'payload',
						agents: [],
						agentSignature: '0x',
						agentSignatureExpire: 0,
						validationReward,
					},
				]),
			).to.not.be.reverted;

			const lockedBalance1 = await this.marketplace.lockedBalance(user1.address);
			expect(lockedBalance1).to.equal(reward + validationReward);

			await helpers.time.increase(reward);

			await expect(this.marketplace.connect(agent1).submitTask(1, 'result1')).to.be.reverted;

			const lockedBalance2 = await this.marketplace.lockedBalance(user1.address);
			expect(lockedBalance2).to.equal(0);

			const finalBalance = await this.marketplace.balances(user1.address);
			expect(finalBalance).to.equal(reward + validationReward);
		});

		// npx hardhat test test/test.js --grep "client cant assign agent with wrong topic"
		it('client cant assign agent with wrong topic', async function () {
			const reward = 1000;
			const validationReward = 100;
			await expect(
				this.marketplace.connect(agent1).registerAgent(
					'agent metadata',
					[encodeBytes32String('image')],
					[
						{
							enabled: true,
							fee: 1000,
							executionDuration: 100,
							metadata: 'agent topic metadata',
							autoAssign: true,
						},
					],
				),
			).to.not.be.reverted;
			await expect(
				this.marketplace.connect(user1).createTasks([
					{
						state: 2,
						reward,
						submissionDuration: 100,
						executionDuration: 100,
						topic: encodeBytes32String('wrong'),
						payload: 'payload',
						agents: [agent1.address],
						agentSignature: '0x',
						agentSignatureExpire: 0,
						validationReward: 0,
					},
				]),
			).to.be.reverted;
		});

		// npx hardhat test test/test.js --grep "client can assign agent by signature"
		it('client can assign agent by signature', async function () {
			const reward = 1000;
			const executionDuration = 100;
			const validationReward = 100;
			await expect(
				this.marketplace.connect(agent1).registerAgent(
					'agent metadata',
					[encodeBytes32String('image')],
					[
						{
							enabled: true,
							fee: reward,
							executionDuration: 100,
							metadata: 'agent topic metadata',
							autoAssign: false,
						},
					],
				),
			).to.not.be.reverted;

			const agentSignatureExpire = (await helpers.time.latest()) + 1;
			const messageHash = keccak256(abiCoder.encode(['uint128', 'string', 'uint32', 'uint32'], [reward, 'payload', executionDuration, agentSignatureExpire]));
			const agentSignature = await agent1.signMessage(getBytes(messageHash));

			await expect(
				this.marketplace.connect(user1).createTasks([
					{
						state: 2,
						reward,
						submissionDuration: 100,
						executionDuration: 100,
						topic: encodeBytes32String('image'),
						payload: 'payload',
						agents: [agent1.address],
						agentSignature,
						agentSignatureExpire,
						validationReward,
					},
				]),
			).to.not.be.reverted;

			await expect(this.marketplace.connect(agent1).submitTask(1, 'result2')).to.not.be.reverted;

			const bal2 = await this.marketplace.balances(agent1.address);
			expect(bal2).to.equal(reward);

			await helpers.time.increase(100);

			await expect(this.marketplace.connect(agent1).withdraw(bal2)).to.not.be.reverted;

			const finalBalance = await this.rvToken.balanceOf(agent1.address);

			expect(finalBalance).to.be.equal(bal2 - BigInt((reward * this.serviceFee) / this.feeBasis));
		});

		// npx hardhat test test/test.js --grep "agent can accept invite to task"
		it('agent can accept invite to task', async function () {
			await expect(
				this.marketplace.connect(agent1).registerAgent(
					'metadata2',
					[encodeBytes32String('image')],
					[
						{
							enabled: true,
							fee: 1000,
							executionDuration: 100,
							metadata: 'topic metadata',
							autoAssign: true,
						},
					],
				),
			).to.not.be.reverted;

			const reward = 5000;
			const validationReward = 100;
			await expect(
				this.marketplace.connect(user1).createTasks([
					{
						state: 1,
						reward,
						submissionDuration: 100,
						executionDuration: 100,
						topic: encodeBytes32String('image'),
						payload: 'payload',
						agents: [agent1.address],
						agentSignature: '0x',
						agentSignatureExpire: 0,
						validationReward,
					},
				]),
			).to.not.be.reverted;

			await expect(this.marketplace.connect(agent1).assignTaskByAgent(1, reward, 100)).to.not.be.reverted;

			await expect(this.marketplace.connect(agent1).submitTask(1, 'result2')).to.not.be.reverted;

			const bal3 = await this.marketplace.balances(agent1.address);
			expect(bal3).to.equal(reward);

			await helpers.time.increase(100);

			await expect(this.marketplace.connect(agent1).withdraw(bal3)).to.not.be.reverted;

			const finalBalance = await this.rvToken.balanceOf(agent1.address);

			expect(finalBalance).to.be.equal(bal3 - BigInt((reward * this.serviceFee) / this.feeBasis));
		});

		// npx hardhat test test/test.js --grep "client can assign agent by agreement to pending task"
		it('client can assign agent by agreement to pending task', async function () {
			await expect(
				this.marketplace.connect(agent1).registerAgent(
					'metadata2',
					[encodeBytes32String('image')],
					[
						{
							enabled: true,
							fee: 1000,
							executionDuration: 100,
							metadata: 'topic metadata',
							autoAssign: true,
						},
					],
				),
			).to.not.be.reverted;

			const reward = 5000;
			const validationReward = 100;
			await expect(
				this.marketplace.connect(user1).createTasks([
					{
						state: 0,
						reward,
						submissionDuration: 100,
						executionDuration: 100,
						topic: encodeBytes32String('image'),
						payload: 'payload',
						agents: [],
						agentSignature: '0x',
						agentSignatureExpire: 0,
						validationReward,
					},
				]),
			).to.not.be.reverted;

			const messageHash = keccak256(abiCoder.encode(['uint128', 'string', 'uint32', 'uint32'], [reward + 100, 'payload', 100, (await helpers.time.latest()) + 100]));
			const agentSignature = await agent1.signMessage(getBytes(messageHash));

			await expect(this.marketplace.connect(user1).assignTaskByClient(1, agent1.address, reward + 100, 100, agentSignature, (await helpers.time.latest()) + 100, 0)).to.not.be.reverted;

			await expect(this.marketplace.connect(agent1).submitTask(1, 'result2')).to.not.be.reverted;

			const bal3 = await this.marketplace.balances(agent1.address);

			expect(bal3).to.equal(reward + 100);
		});

		// npx hardhat test test/test.js --grep "client can approve earlier"
		it('client can approve earlier', async function () {
			await expect(
				this.marketplace.connect(agent1).registerAgent(
					'metadata2',
					[encodeBytes32String('image')],
					[
						{
							enabled: true,
							fee: 1000,
							executionDuration: 100,
							metadata: 'topic metadata',
							autoAssign: true,
						},
					],
				),
			).to.not.be.reverted;

			const reward = 1000;
			const validationReward = 100;
			await expect(
				this.marketplace.connect(user1).createTasks([
					{
						state: 2,
						reward,
						submissionDuration: 100,
						executionDuration: 100,
						topic: encodeBytes32String('image'),
						payload: 'payload',
						agents: [agent1.address],
						agentSignature: '0x',
						agentSignatureExpire: 0,
						validationReward,
					},
				]),
			).to.not.be.reverted;

			await expect(this.marketplace.connect(agent1).submitTask(1, 'result')).to.not.be.reverted;

			await expect(this.marketplace.connect(agent1).withdraw(reward)).to.be.reverted;

			await expect(this.marketplace.connect(user1).validateTask(1, true, 'all good')).to.not.be.reverted;

			await expect(this.marketplace.connect(agent1).withdraw(reward)).to.not.be.reverted;
		});
	});

	// npx hardhat test test/test.js --grep "Validation"
	describe('Validation', function () {
		beforeEach(async function () {
			await expect(
				this.marketplace.connect(agent1).registerAgent(
					'agent1 metadata',
					[encodeBytes32String('image')],
					[
						{
							enabled: true,
							fee: 1000,
							executionDuration: 100,
							metadata: 'agent1 topic metadata',
							autoAssign: true,
						},
					],
				),
			).to.not.be.reverted;
			await expect(this.marketplace.connect(validator).stakeValidator('Validator metadata2')).to.not.be.reverted;
		});

		// npx hardhat test test/test.js --grep "validator can stake and withdraw all funds when expire"
		it('validator can stake and withdraw all funds when expire', async function () {
			await expect(this.marketplace.connect(validator).stakeValidator('Validator metadata2')).to.be.reverted;
			await helpers.time.increase(this.validatorStakeDuration);
			await expect(this.marketplace.connect(validator).stakeValidator('Validator metadata2')).to.not.be.reverted;
			await helpers.time.increase(this.validatorStakeDuration);
			await expect(this.marketplace.connect(validator).withdraw(0)).to.not.be.reverted;
		});

		// npx hardhat test test/test.js --grep "validator can validate task complete automatically"
		it('validator can validate task complete automatically', async function () {
			const reward = 1000;
			const validationReward = 100;
			await expect(
				this.marketplace.connect(user1).createTasks([
					{
						state: 2, // ASSIGNED
						reward,
						submissionDuration: 100,
						executionDuration: 100,
						topic: encodeBytes32String('image'),
						payload: 'payload',
						agents: [agent1.address],
						agentSignature: '0x',
						agentSignatureExpire: 0,
						validationReward,
					},
				]),
			).to.not.be.reverted;
			await expect(this.marketplace.connect(agent1).submitTask(2, 'submit result')).to.not.be.reverted;
			await helpers.time.increase(this.validationDelay);
			await expect(this.marketplace.connect(validator).validateTask(2, true, 'validation result')).to.not.be.reverted;
			expect(await this.marketplace.balances(agent1.address)).to.equal(reward);
			await helpers.time.increase(this.serviceDelay);
			const aggregate = await this.marketplace.aggregate(validator.address);
			expect(aggregate.balance).to.be.equal(BigInt(this.validatorStakeAmount) + BigInt(reward) + BigInt(validationReward));
		});

		// npx hardhat test test/test.js --grep "user can dispute validated task with resolve to validator"
		it('user can dispute validated task with resolve to validator', async function () {
			const reward = 1000;
			const validationReward = 100;
			await expect(
				this.marketplace.connect(user1).createTasks([
					{
						state: 2, // ASSIGNED
						reward,
						submissionDuration: 100,
						executionDuration: 100,
						topic: encodeBytes32String('image'),
						payload: 'payload',
						agents: [agent1.address],
						agentSignature: '0x',
						agentSignatureExpire: 0,
						validationReward,
					},
				]),
			).to.not.be.reverted;
			await expect(this.marketplace.connect(agent1).submitTask(2, 'submit result')).to.not.be.reverted;
			await helpers.time.increase(this.validationDelay);
			await expect(this.marketplace.connect(validator).validateTask(2, true, 'validation result')).to.not.be.reverted;
			await expect(this.marketplace.connect(user1).disputeTask(2, 'dispute reasone')).to.not.be.reverted;

			await expect(this.marketplace.connect(deployer).resolveTask(2, 0, 0, 1100, 'resolve result')).to.not.be.reverted;
		});

		// npx hardhat test test/test.js --grep "user can dispute validated task with resolve to client"
		it('user can dispute validated task with resolve to client', async function () {
			const reward = 1000;
			const validationReward = 100;
			await expect(
				this.marketplace.connect(user1).createTasks([
					{
						state: 2, // ASSIGNED
						reward,
						submissionDuration: 100,
						executionDuration: 100,
						topic: encodeBytes32String('image'),
						payload: 'payload',
						agents: [agent1.address],
						agentSignature: '0x',
						agentSignatureExpire: 0,
						validationReward,
					},
				]),
			).to.not.be.reverted;
			await expect(this.marketplace.connect(agent1).submitTask(2, 'submit result')).to.not.be.reverted;
			await helpers.time.increase(this.validationDelay);
			await expect(this.marketplace.connect(validator).validateTask(2, true, 'validation result')).to.not.be.reverted;
			await expect(this.marketplace.connect(user1).disputeTask(2, 'dispute reasone')).to.not.be.reverted;

			await expect(this.marketplace.connect(deployer).resolveTask(2, 1100, 0, 0, 'resolve result')).to.not.be.reverted;
		});

		// npx hardhat test test/test.js --grep "agent can dispute declined task with resolve to agent"
		it('agent can dispute declined task with resolve to agent', async function () {
			const reward = 1000;
			const validationReward = 100;
			await expect(
				this.marketplace.connect(user1).createTasks([
					{
						state: 2, // ASSIGNED
						reward,
						submissionDuration: 100,
						executionDuration: 100,
						topic: encodeBytes32String('image'),
						payload: 'payload',
						agents: [agent1.address],
						agentSignature: '0x',
						agentSignatureExpire: 0,
						validationReward,
					},
				]),
			).to.not.be.reverted;
			await expect(this.marketplace.connect(agent1).submitTask(2, 'submit result')).to.not.be.reverted;
			await helpers.time.increase(this.validationDelay);
			await expect(this.marketplace.connect(validator).validateTask(2, false, 'validation result')).to.not.be.reverted;
			await expect(this.marketplace.connect(agent1).disputeTask(2, 'dispute reasone')).to.not.be.reverted;

			await expect(this.marketplace.connect(deployer).resolveTask(2, 100, 1000, 0, 'resolve result')).to.not.be.reverted;
		});

		// npx hardhat test test/test.js --grep "user can decline task without validation and agent can dispute with resolve to agent"
		it('user can decline task without validation and agent can dispute with resolve to agent', async function () {
			const reward = 1000;
			const validationReward = 0;
			await expect(
				this.marketplace.connect(user1).createTasks([
					{
						state: 2, // ASSIGNED
						reward,
						submissionDuration: 100,
						executionDuration: 100,
						topic: encodeBytes32String('image'),
						payload: 'payload',
						agents: [agent1.address],
						agentSignature: '0x',
						agentSignatureExpire: 0,
						validationReward,
					},
				]),
			).to.not.be.reverted;
			await expect(this.marketplace.connect(agent1).submitTask(2, 'submit result')).to.not.be.reverted;
			await helpers.time.increase(this.validationDelay);
			await expect(this.marketplace.connect(user1).validateTask(2, false, 'validation result')).to.not.be.reverted;
			await expect(this.marketplace.connect(agent1).disputeTask(2, 'dispute reasone')).to.not.be.reverted;

			await expect(this.marketplace.connect(deployer).resolveTask(2, 0, 1000, 0, 'resolve result')).to.not.be.reverted;
		});

		// npx hardhat test test/test.js --grep "user can decline not validated task and agent can dispute with resolve to agent"
		it('user can decline not validated task and agent can dispute with resolve to agent', async function () {
			const reward = 1000;
			const validationReward = 100;
			await expect(
				this.marketplace.connect(user1).createTasks([
					{
						state: 2, // ASSIGNED
						reward,
						submissionDuration: 100,
						executionDuration: 100,
						topic: encodeBytes32String('image'),
						payload: 'payload',
						agents: [agent1.address],
						agentSignature: '0x',
						agentSignatureExpire: 0,
						validationReward,
					},
				]),
			).to.not.be.reverted;
			await expect(this.marketplace.connect(agent1).submitTask(2, 'submit result')).to.not.be.reverted;
			await helpers.time.increase(this.validationDelay);
			await expect(this.marketplace.connect(user1).validateTask(2, false, 'validation result')).to.not.be.reverted;
			await expect(this.marketplace.connect(agent1).disputeTask(2, 'dispute reasone')).to.not.be.reverted;

			await expect(this.marketplace.connect(deployer).resolveTask(2, 0, 1000, 0, 'resolve result')).to.not.be.reverted;
		});
	});
});