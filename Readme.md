# ACT Marketplace - Hardhat Tests

## Overview

This repository contains automated tests for the `ACTMarketplace` smart contract using Hardhat, Chai, and Ethers.js.

## Prerequisites

Ensure you have the following installed:

-   **Node.js** (v14+ recommended)
-   **Hardhat**
-   **Ethers.js**
-   **Chai**

### Install Dependencies

Run the following command to install required dependencies:

```sh
npm install
```

## Running Tests

To execute all test cases:

```sh
npx hardhat test test/test.js
```

To run a specific test case, use `--grep` with part of the test name:

```sh
npx hardhat test test/test.js --grep "client can close task if not assigned"
```

## Test Cases

### 1️⃣ Client Can Close Task If Not Assigned

**Description:** Verifies that a client can close an unassigned task and refunds the balance correctly.

```sh
npx hardhat test test/test.js --grep "client can close task if not assigned"
```

### 2️⃣ Client Can Withdraw Funds If Agent Fails to Submit on Time

**Description:** Ensures funds are returned to the client if the assigned agent does not submit the task in time.

```sh
npx hardhat test test/test.js --grep "client can withdraw funds from assigned task if agent not submitted in time"
```

### 3️⃣ Client Can Assign Auto-Agent

**Description:** Confirms that an auto-assign-enabled agent is correctly assigned to a task.

```sh
npx hardhat test test/test.js --grep "client can assign auto agent"
```

### 4️⃣ Funds Unlock When Task Expires

**Description:** Checks that funds are unlocked if a pending task expires.

```sh
npx hardhat test test/test.js --grep "funds should be unlocked when pending task expired"
```

### 5️⃣ Client Cannot Assign Agent with Incorrect Topic

**Description:** Ensures that a client cannot assign an agent who does not support the task’s topic.

```sh
npx hardhat test test/test.js --grep "client cant assign agent with wrong topic"
```

### 6️⃣ Client Can Assign Agent by Signature

**Description:** Validates that an agent can be assigned via signature authentication.

```sh
npx hardhat test test/test.js --grep "client can assign agent by signature"
```

### 7️⃣ Agent Can Accept Invite to Task

**Description:** Tests that an invited agent can accept and complete a task.

```sh
npx hardhat test test/test.js --grep "agent can accept invite to task"
```

### 8️⃣ Client Can Assign Agent by Agreement to Pending Task

**Description:** Ensures a client can assign an agent to a pending task via an agreement.

```sh
npx hardhat test test/test.js --grep "client can assign agent by agreement to pending task"
```
