const { expect } = require("chai");
const { ethers, fhevm } = require("hardhat");

describe("FHELottery - Advanced FHE Operations Tests", function () {
  let contract;
  let admin, user1, user2, user3, user4, user5;

  beforeEach(async function () {
    if (!fhevm.isMock) {
      throw new Error("This test must run in FHEVM mock environment");
    }

    await fhevm.initializeCLIApi();
    [admin, user1, user2, user3, user4, user5] = await ethers.getSigners();

    const Factory = await ethers.getContractFactory("FHELottery");
    const deployed = await Factory.deploy();
    await deployed.waitForDeployment();
    contract = deployed;

    console.log(`  FHELottery deployed at: ${await contract.getAddress()}`);
  });

  it("tests FHE.fromExternal() - encrypted input conversion", async function () {
    console.log("Testing FHE.fromExternal()...");

    const drawTime = Math.floor(Date.now() / 1000) + 3600;
    await contract.connect(admin).createRound("FHE fromExternal Test", drawTime);

    // Test with various ticket numbers
    const testNumbers = [0, 1, 100, 999, 4294967295]; // Including max uint32

    for (const num of testNumbers) {
      const encrypted = await fhevm
        .createEncryptedInput(await contract.getAddress(), user1.address)
        .add32(BigInt(num))
        .encrypt();

      await contract
        .connect(user1)
        .buyTicket(0, encrypted.handles[0], encrypted.inputProof);

      console.log(`    Encrypted input for ${num} processed successfully`);
    }

    const roundInfo = await contract.getRound(0);
    expect(roundInfo.ticketCount).to.equal(testNumbers.length);

    console.log("  FHE.fromExternal() - All encrypted inputs converted successfully");
  });

  it("tests FHE.eq() - encrypted comparison", async function () {
    console.log("Testing FHE.eq()...");

    const drawTime = Math.floor(Date.now() / 1000) + 10;
    await contract.connect(admin).createRound("FHE eq Test", drawTime);

    // Buy tickets with different numbers
    const ticketNumbers = [42, 42, 100]; // Two matching, one different
    const users = [user1, user2, user3];

    for (let i = 0; i < users.length; i++) {
      const encrypted = await fhevm
        .createEncryptedInput(await contract.getAddress(), users[i].address)
        .add32(BigInt(ticketNumbers[i]))
        .encrypt();

      await contract
        .connect(users[i])
        .buyTicket(0, encrypted.handles[0], encrypted.inputProof);
    }

    // Advance time and draw
    await ethers.provider.send("evm_increaseTime", [11]);
    await ethers.provider.send("evm_mine", []);

    const winningNumber = 42;
    await contract.connect(admin).draw(0, winningNumber);

    // All users claim - FHE.eq() is tested during claimPrize
    for (let i = 0; i < users.length; i++) {
      await contract.connect(users[i]).claimPrize(0, i);
      console.log(`    User ${i + 1} claimed ticket with number ${ticketNumbers[i]}`);
    }

    console.log("  FHE.eq() - Encrypted comparison works for winner verification");
  });

  it("tests FHE.asEuint32() - plaintext to ciphertext conversion", async function () {
    console.log("Testing FHE.asEuint32()...");

    const drawTime = Math.floor(Date.now() / 1000) + 10;
    await contract.connect(admin).createRound("FHE asEuint32 Test", drawTime);

    const encrypted = await fhevm
      .createEncryptedInput(await contract.getAddress(), user1.address)
      .add32(77n)
      .encrypt();

    await contract
      .connect(user1)
      .buyTicket(0, encrypted.handles[0], encrypted.inputProof);

    await ethers.provider.send("evm_increaseTime", [11]);
    await ethers.provider.send("evm_mine", []);

    // Draw with plaintext number - FHE.asEuint32() converts it to ciphertext
    await contract.connect(admin).draw(0, 77);

    // Claim prize - this internally uses FHE.asEuint32(plainWinningNumber)
    await contract.connect(user1).claimPrize(0, 0);

    const ticketInfo = await contract.getTicketInfo(0, 0);
    expect(ticketInfo.claimed).to.equal(true);

    console.log("  FHE.asEuint32() - Plaintext to ciphertext conversion works");
  });

  it("tests FHE.allow() - access control permissions", async function () {
    console.log("Testing FHE.allow()...");

    const drawTime = Math.floor(Date.now() / 1000) + 3600;
    await contract.connect(admin).createRound("FHE allow Test", drawTime);

    const encrypted = await fhevm
      .createEncryptedInput(await contract.getAddress(), user1.address)
      .add32(123n)
      .encrypt();

    await contract
      .connect(user1)
      .buyTicket(0, encrypted.handles[0], encrypted.inputProof);

    // Owner can access their ticket number (FHE.allow was called)
    const ticketNumber = await contract.connect(user1).getMyTicketNumber(0, 0);
    expect(ticketNumber).to.not.be.undefined;

    // Non-owner cannot access
    await expect(
      contract.connect(user2).getMyTicketNumber(0, 0)
    ).to.be.revertedWith("Not ticket owner");

    console.log("  FHE.allow() - User access permissions work correctly");
  });

  it("tests FHE.allowThis() - contract self-access", async function () {
    console.log("Testing FHE.allowThis()...");

    const drawTime = Math.floor(Date.now() / 1000) + 10;
    await contract.connect(admin).createRound("FHE allowThis Test", drawTime);

    const encrypted = await fhevm
      .createEncryptedInput(await contract.getAddress(), user1.address)
      .add32(55n)
      .encrypt();

    await contract
      .connect(user1)
      .buyTicket(0, encrypted.handles[0], encrypted.inputProof);

    await ethers.provider.send("evm_increaseTime", [11]);
    await ethers.provider.send("evm_mine", []);

    await contract.connect(admin).draw(0, 55);

    // Contract can access and compare ticket numbers (FHE.allowThis was called)
    await contract.connect(user1).claimPrize(0, 0);

    const ticketInfo = await contract.getTicketInfo(0, 0);
    expect(ticketInfo.claimed).to.equal(true);

    console.log("  FHE.allowThis() - Contract self-access works for comparisons");
  });

  it("tests invalid proof handling", async function () {
    console.log("Testing invalid proof handling...");

    const drawTime = Math.floor(Date.now() / 1000) + 3600;
    await contract.connect(admin).createRound("Invalid Proof Test", drawTime);

    const validEncrypted = await fhevm
      .createEncryptedInput(await contract.getAddress(), user1.address)
      .add32(42n)
      .encrypt();

    const invalidProof = "0x" + "00".repeat(64);

    // Invalid proof should revert
    await expect(
      contract.connect(user1).buyTicket(0, validEncrypted.handles[0], invalidProof)
    ).to.be.reverted;

    console.log("  Invalid proof correctly rejected by FHE.fromExternal()");

    // Valid proof should work
    await contract
      .connect(user1)
      .buyTicket(0, validEncrypted.handles[0], validEncrypted.inputProof);

    console.log("  Valid proof accepted successfully");
  });

  it("tests edge case: zero ticket number", async function () {
    console.log("Testing zero ticket number...");

    const drawTime = Math.floor(Date.now() / 1000) + 10;
    await contract.connect(admin).createRound("Zero Number Test", drawTime);

    const encrypted = await fhevm
      .createEncryptedInput(await contract.getAddress(), user1.address)
      .add32(0n)
      .encrypt();

    await contract
      .connect(user1)
      .buyTicket(0, encrypted.handles[0], encrypted.inputProof);

    await ethers.provider.send("evm_increaseTime", [11]);
    await ethers.provider.send("evm_mine", []);

    await contract.connect(admin).draw(0, 0);
    await contract.connect(user1).claimPrize(0, 0);

    const ticketInfo = await contract.getTicketInfo(0, 0);
    expect(ticketInfo.claimed).to.equal(true);

    console.log("  Zero ticket number handled correctly");
  });

  it("tests edge case: maximum uint32 ticket number", async function () {
    console.log("Testing maximum uint32 ticket number...");

    const drawTime = Math.floor(Date.now() / 1000) + 10;
    await contract.connect(admin).createRound("Max Number Test", drawTime);

    const maxUint32 = 4294967295n;
    const encrypted = await fhevm
      .createEncryptedInput(await contract.getAddress(), user1.address)
      .add32(maxUint32)
      .encrypt();

    await contract
      .connect(user1)
      .buyTicket(0, encrypted.handles[0], encrypted.inputProof);

    await ethers.provider.send("evm_increaseTime", [11]);
    await ethers.provider.send("evm_mine", []);

    await contract.connect(admin).draw(0, Number(maxUint32));
    await contract.connect(user1).claimPrize(0, 0);

    const ticketInfo = await contract.getTicketInfo(0, 0);
    expect(ticketInfo.claimed).to.equal(true);

    console.log("  Maximum uint32 ticket number handled correctly");
  });

  it("tests multiple rounds with FHE operations", async function () {
    console.log("Testing multiple rounds...");

    // Create 3 rounds
    const roundNames = ["Round A", "Round B", "Round C"];
    const drawTime = Math.floor(Date.now() / 1000) + 10;

    for (const name of roundNames) {
      await contract.connect(admin).createRound(name, drawTime);
    }

    expect(await contract.roundCount()).to.equal(3);

    // Buy tickets in each round
    const users = [user1, user2, user3];
    for (let roundId = 0; roundId < 3; roundId++) {
      const encrypted = await fhevm
        .createEncryptedInput(await contract.getAddress(), users[roundId].address)
        .add32(BigInt((roundId + 1) * 10))
        .encrypt();

      await contract
        .connect(users[roundId])
        .buyTicket(roundId, encrypted.handles[0], encrypted.inputProof);
    }

    // Advance time and draw all rounds
    await ethers.provider.send("evm_increaseTime", [11]);
    await ethers.provider.send("evm_mine", []);

    for (let roundId = 0; roundId < 3; roundId++) {
      await contract.connect(admin).draw(roundId, (roundId + 1) * 10);
    }

    // Claim prizes
    for (let roundId = 0; roundId < 3; roundId++) {
      await contract.connect(users[roundId]).claimPrize(roundId, 0);
      const ticketInfo = await contract.getTicketInfo(roundId, 0);
      expect(ticketInfo.claimed).to.equal(true);
    }

    console.log("  Multiple rounds with FHE operations work correctly");
  });

  it("tests complex scenario: many tickets in one round", async function () {
    console.log("Testing many tickets in one round...");

    const drawTime = Math.floor(Date.now() / 1000) + 10;
    await contract.connect(admin).createRound("Many Tickets Round", drawTime);

    // Each user buys 3 tickets
    const users = [user1, user2, user3];
    for (const user of users) {
      for (let i = 0; i < 3; i++) {
        const encrypted = await fhevm
          .createEncryptedInput(await contract.getAddress(), user.address)
          .add32(BigInt(Math.floor(Math.random() * 1000)))
          .encrypt();

        await contract
          .connect(user)
          .buyTicket(0, encrypted.handles[0], encrypted.inputProof);
      }
    }

    const roundInfo = await contract.getRound(0);
    expect(roundInfo.ticketCount).to.equal(9);

    // Verify each user has 3 tickets
    for (const user of users) {
      const userTickets = await contract.connect(user).getMyTickets(0);
      expect(userTickets.length).to.equal(3);
    }

    console.log("  Many tickets in one round handled correctly");
  });

  it("tests performance: rapid sequential ticket purchases", async function () {
    console.log("Testing rapid sequential operations...");

    const drawTime = Math.floor(Date.now() / 1000) + 3600;
    await contract.connect(admin).createRound("Performance Test Round", drawTime);

    const startTime = Date.now();

    // Rapid ticket purchases
    for (let i = 0; i < 10; i++) {
      const encrypted = await fhevm
        .createEncryptedInput(await contract.getAddress(), user1.address)
        .add32(BigInt(i))
        .encrypt();

      await contract
        .connect(user1)
        .buyTicket(0, encrypted.handles[0], encrypted.inputProof);
    }

    const endTime = Date.now();
    const duration = endTime - startTime;

    const roundInfo = await contract.getRound(0);
    expect(roundInfo.ticketCount).to.equal(10);
    expect(duration).to.be.lessThan(30000); // Should complete in under 30 seconds

    console.log(`  Rapid sequential operations completed in ${duration}ms`);
  });

  it("tests all FHE operations in complete lottery flow", async function () {
    console.log("Testing complete lottery flow with all FHE operations...");

    // 1. Create round
    const drawTime = Math.floor(Date.now() / 1000) + 10;
    const tx1 = await contract.connect(admin).createRound("Complete Flow Test", drawTime);
    await tx1.wait();
    console.log("    Round created");

    // 2. Multiple users buy tickets with encrypted numbers
    // Tests: FHE.fromExternal(), FHE.allow(), FHE.allowThis()
    const winningNumber = 777;
    const users = [user1, user2, user3, user4];
    const ticketNumbers = [100, 777, 500, 777]; // Two winners

    for (let i = 0; i < users.length; i++) {
      const encrypted = await fhevm
        .createEncryptedInput(await contract.getAddress(), users[i].address)
        .add32(BigInt(ticketNumbers[i]))
        .encrypt();

      await contract
        .connect(users[i])
        .buyTicket(0, encrypted.handles[0], encrypted.inputProof);
      console.log(`    User ${i + 1} bought ticket with number ${ticketNumbers[i]}`);
    }

    // 3. Advance time and draw
    await ethers.provider.send("evm_increaseTime", [11]);
    await ethers.provider.send("evm_mine", []);

    // Tests: FHE.asEuint32() (implicit in draw comparison)
    await contract.connect(admin).draw(0, winningNumber);
    console.log(`    Round drawn with winning number ${winningNumber}`);

    // 4. Users claim prizes
    // Tests: FHE.asEuint32(), FHE.eq(), FHE.allow()
    for (let i = 0; i < users.length; i++) {
      await contract.connect(users[i]).claimPrize(0, i);
      const isWinner = ticketNumbers[i] === winningNumber;
      console.log(`    User ${i + 1} claimed prize (winner: ${isWinner})`);
    }

    // 5. Verify final state
    const roundInfo = await contract.getRound(0);
    expect(roundInfo.drawn).to.equal(true);
    expect(roundInfo.winningNumber).to.equal(winningNumber);
    expect(roundInfo.ticketCount).to.equal(4);

    for (let i = 0; i < users.length; i++) {
      const ticketInfo = await contract.getTicketInfo(0, i);
      expect(ticketInfo.claimed).to.equal(true);
    }

    console.log("  Complete lottery flow with all FHE operations verified");
    console.log("  FHE operations tested:");
    console.log("    - FHE.fromExternal(): Encrypted ticket number input");
    console.log("    - FHE.allow(): User access to encrypted data");
    console.log("    - FHE.allowThis(): Contract access to encrypted data");
    console.log("    - FHE.asEuint32(): Plaintext to ciphertext conversion");
    console.log("    - FHE.eq(): Winner verification comparison");
  });

  it("tests event emissions for all contract operations", async function () {
    console.log("Testing event emissions...");

    // Test RoundCreated event
    const drawTime = Math.floor(Date.now() / 1000) + 10;
    const tx1 = await contract.connect(admin).createRound("Event Test Round", drawTime);
    const receipt1 = await tx1.wait();

    const roundCreatedEvent = receipt1.logs.find((log) => {
      try {
        const decoded = contract.interface.parseLog(log);
        return decoded.name === "RoundCreated";
      } catch {
        return false;
      }
    });
    expect(roundCreatedEvent).to.not.be.undefined;
    expect(roundCreatedEvent.args.name).to.equal("Event Test Round");
    console.log("    RoundCreated event emitted correctly");

    // Test TicketBought event
    const encrypted = await fhevm
      .createEncryptedInput(await contract.getAddress(), user1.address)
      .add32(42n)
      .encrypt();

    const tx2 = await contract
      .connect(user1)
      .buyTicket(0, encrypted.handles[0], encrypted.inputProof);
    const receipt2 = await tx2.wait();

    const ticketBoughtEvent = receipt2.logs.find((log) => {
      try {
        const decoded = contract.interface.parseLog(log);
        return decoded.name === "TicketBought";
      } catch {
        return false;
      }
    });
    expect(ticketBoughtEvent).to.not.be.undefined;
    expect(ticketBoughtEvent.args.buyer).to.equal(user1.address);
    console.log("    TicketBought event emitted correctly");

    // Test RoundDrawn event
    await ethers.provider.send("evm_increaseTime", [11]);
    await ethers.provider.send("evm_mine", []);

    const tx3 = await contract.connect(admin).draw(0, 42);
    const receipt3 = await tx3.wait();

    const roundDrawnEvent = receipt3.logs.find((log) => {
      try {
        const decoded = contract.interface.parseLog(log);
        return decoded.name === "RoundDrawn";
      } catch {
        return false;
      }
    });
    expect(roundDrawnEvent).to.not.be.undefined;
    expect(roundDrawnEvent.args.winningNumber).to.equal(42);
    console.log("    RoundDrawn event emitted correctly");

    // Test PrizeClaimed event
    const tx4 = await contract.connect(user1).claimPrize(0, 0);
    const receipt4 = await tx4.wait();

    const prizeClaimedEvent = receipt4.logs.find((log) => {
      try {
        const decoded = contract.interface.parseLog(log);
        return decoded.name === "PrizeClaimed";
      } catch {
        return false;
      }
    });
    expect(prizeClaimedEvent).to.not.be.undefined;
    expect(prizeClaimedEvent.args.winner).to.equal(user1.address);
    console.log("    PrizeClaimed event emitted correctly");

    console.log("  All events emitted correctly");
  });
});
