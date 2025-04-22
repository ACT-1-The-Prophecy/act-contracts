// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./mocks/AgentNFT.sol";
import "./mocks/RevenueToken.sol";

import "@openzeppelin/contracts/access/Ownable.sol";

import {IPAssetRegistry} from "@story-protocol/protocol-core/contracts/registries/IPAssetRegistry.sol";
import {IRoyaltyWorkflows} from "@story-protocol/protocol-periphery/contracts/interfaces/workflows/IRoyaltyWorkflows.sol";
import {ILicensingModule} from "@story-protocol/protocol-core/contracts/interfaces/modules/licensing/ILicensingModule.sol";
import {PILFlavors} from "@story-protocol/protocol-core/contracts/lib/PILFlavors.sol";
import {IPILicenseTemplate} from "@story-protocol/protocol-core/contracts/interfaces/modules/licensing/IPILicenseTemplate.sol";
import {IRoyaltyModule} from "@story-protocol/protocol-core/contracts/interfaces/modules/royalty/IRoyaltyModule.sol";
import {RoyaltyPolicyLAP} from "@story-protocol/protocol-core/contracts/modules/royalty/policies/LAP/RoyaltyPolicyLAP.sol";

import {ERC721Holder} from "@openzeppelin/contracts/token/ERC721/utils/ERC721Holder.sol";
import {ActMarketLib} from "./ACTLib.sol";

import "hardhat/console.sol";

contract ACTStory is ERC721Holder, Ownable {
    // Story Protocol contracts
    IPAssetRegistry public immutable IP_ASSET_REGISTRY;
    ILicensingModule public immutable LICENSING_MODULE;
    IPILicenseTemplate public immutable PIL_TEMPLATE;
    RoyaltyPolicyLAP public immutable ROYALTY_POLICY_LAP;
    IRoyaltyWorkflows public immutable ROYALTY_WORKFLOWS;
    IRoyaltyModule public immutable ROYALTY_MODULE;
    AgentNFT public immutable AGENT_NFT;
    RevenueToken public immutable REVENUE_TOKEN;

    mapping(address => ActMarketLib.AgentStory) public agentsStory;
    mapping(uint96 => ActMarketLib.TaskStory) public tasksStory;

    constructor(
        address ipAssetRegistry,
        address licensingModule,
        address pilTemplate,
        address royaltyPolicyLAP,
        address royaltyWorkflows,
        address royaltyModule,
        address payable _revenueToken
    ) Ownable(msg.sender) {
        REVENUE_TOKEN = RevenueToken(_revenueToken);
        IP_ASSET_REGISTRY = IPAssetRegistry(ipAssetRegistry);
        LICENSING_MODULE = ILicensingModule(licensingModule);
        PIL_TEMPLATE = IPILicenseTemplate(pilTemplate);
        ROYALTY_POLICY_LAP = RoyaltyPolicyLAP(royaltyPolicyLAP);
        ROYALTY_WORKFLOWS = IRoyaltyWorkflows(royaltyWorkflows);
        ROYALTY_MODULE = IRoyaltyModule(royaltyModule);
        AGENT_NFT = new AgentNFT("AGENT IP NFT ACT", "ACT-AGI");
    }

    // ---------------------------------- AGENT ----------------------------------
    // process story register agent
    function registerAgent(address _agent) external onlyOwner {
        //console.log(
        //    "block.chainid-----------------------------------",
        //    block.chainid
        //);
        if (block.chainid == 1315) {
            ActMarketLib.AgentStory storage agentStory = agentsStory[_agent];
            agentStory.nftTokenId = AGENT_NFT.mint(address(this));
            agentStory.ipAssetId = IP_ASSET_REGISTRY.register(
                block.chainid,
                address(AGENT_NFT),
                agentStory.nftTokenId
            );
            agentStory.licenseTermsId = PIL_TEMPLATE.registerLicenseTerms(
                PILFlavors.commercialRemix({
                    mintingFee: 0,
                    commercialRevShare: 100 * 10 ** 6,
                    royaltyPolicy: address(ROYALTY_POLICY_LAP),
                    currencyToken: address(REVENUE_TOKEN)
                })
            );
            LICENSING_MODULE.attachLicenseTerms(
                agentStory.ipAssetId,
                address(PIL_TEMPLATE),
                agentStory.licenseTermsId
            );
            AGENT_NFT.transferFrom(
                address(this),
                _agent,
                agentStory.nftTokenId
            );
        }
    }

    // process story submit
    function submitTask(uint96 _taskId, address _agent) external onlyOwner {
        if (block.chainid == 1315) {
            ActMarketLib.AgentStory storage agentStory = agentsStory[_agent];
            ActMarketLib.TaskStory storage taskStory = tasksStory[_taskId];
            taskStory.childTokenId = AGENT_NFT.mint(address(this));
            taskStory.childIpId = IP_ASSET_REGISTRY.register(
                block.chainid,
                address(AGENT_NFT),
                taskStory.childTokenId
            );
            uint256 licenseTokenId = LICENSING_MODULE.mintLicenseTokens({
                licensorIpId: agentStory.ipAssetId,
                licenseTemplate: address(PIL_TEMPLATE),
                licenseTermsId: agentStory.licenseTermsId,
                amount: 1,
                receiver: address(this),
                royaltyContext: "", // for PIL, royaltyContext is empty string
                maxMintingFee: 0,
                maxRevenueShare: 0
            });
            uint256[] memory licenseTokenIds = new uint256[](1);
            licenseTokenIds[0] = licenseTokenId;
            LICENSING_MODULE.registerDerivativeWithLicenseTokens({
                childIpId: taskStory.childIpId,
                licenseTokenIds: licenseTokenIds,
                royaltyContext: "", // empty for PIL
                maxRts: 0
            });
            AGENT_NFT.transferFrom(
                address(this),
                _agent,
                taskStory.childTokenId
            );
        }
    }

    // ----------------------------

    //function _processStoryPayout(uint96 _taskId) internal {
    //ActMarketLib.Task memory task = tasks[_taskId];
    //ActMarketLib.Client memory agent = agents[task.assignedAgent];
    //REVENUE_TOKEN.approve(address(ROYALTY_MODULE), task.reward);
    //ROYALTY_MODULE.payRoyaltyOnBehalf(
    //    task.childIpId, //task.childIpId,public
    //    address(this),
    //    address(REVENUE_TOKEN),
    //    task.reward
    //);
    //address[] memory childIpIds = new address[](1);
    //address[] memory royaltyPolicies = new address[](1);
    //address[] memory currencyTokens = new address[](1);
    //childIpIds[0] = task.childIpId;
    //royaltyPolicies[0] = address(ROYALTY_POLICY_LAP);
    //currencyTokens[0] = address(REVENUE_TOKEN);
    //ROYALTY_WORKFLOWS.claimAllRevenue(
    //    agent.ipAssetId,
    //    agent.ipAssetId,
    //    childIpIds,
    //    royaltyPolicies,
    //    currencyTokens
    //);
    //}
}
