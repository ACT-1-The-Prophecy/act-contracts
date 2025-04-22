// SPDX-License-Identifier: MIT
pragma solidity ^0.8.23;

library ActMarketLib {
    enum TaskState {
        PENDING, // Initial state
        INVITED, // For manual assignment during bidding
        ASSIGNED, // Agent assigned
        COMPLETED, // normal completion by client
        DELETED,
        SUBMITTED, // agent submited task
        VALIDATED, // validator approved task
        DECLINED_BY_OWNER, // agent submited task
        DECLINED_BY_VALIDATOR, // agent submited task
        DISPUTED_BY_OWNER,
        DISPUTED_BY_AGENT,
        RESOLVED
    }

    struct Task {
        uint96 id;
        uint32 createdAtTs;
        uint32 submissionDuration;
        uint32 updatedAtTs;
        uint32 executionDuration;
        uint128 reward;
        uint128 validationReward;
        address owner;
        address assignedAgent;
        address validator;
        bytes32 topic;
        string payload;
        TaskState state;
    }

    struct TaskStory {
        uint256 childTokenId;
        address childIpId;
    }

    struct Agent {
        address id;
        string metadata; // Can include overal agent info
        bool paused;
        bytes32[] topics;
    }

    struct AgentStory {
        address ipAssetId;
        uint256 nftTokenId;
        uint256 licenseTermsId;
    }

    struct AgentTopic {
        bool enabled;
        uint128 fee; // Base fee for automatic assignments
        uint32 executionDuration;
        string metadata; // Can include price ranges for manual tasks
        bool autoAssign;
    }

    struct Validator {
        address id;
        string metadata; // Can include overal Validator info
        bool paused;
        uint32 expireAtTs;
        bytes32[] topics;
    }

    struct ValidatorTopic {
        bool enabled;
        string metadata; //
        uint128 feesEarned; //
    }

    // not used for now
    struct TaskMetrics {
        uint256 creationTime;
        uint256 assignmentTime;
        uint256 completionTime;
        uint256 timeToAssignment;
        uint256 timeToCompletion;
        uint256 rating; // 1-5 rating from requester
        string feedback;
        bool disputed;
        string disputeReason;
    }

    struct AgentStatistics {
        uint32 tasksAssigned;
        uint32 tasksCompleted;
        uint32 lastActivityTs;
        uint128 earnAmount;
    }

    struct Client {
        uint128 spent;
        uint32 tasksCreated;
        uint32 tasksAssigned;
        uint32 tasksCompleted;
        uint32 lastActivityTs;
    }

    struct MarketTotals {
        uint256 done;
        uint256 rewards;
        uint256 totalAgents;
        uint256 activeAgents;
        uint256 totalTasks;
        uint256 automaticTasks;
        uint256 manualTasks;
        uint256 averageReward;
    }
}
