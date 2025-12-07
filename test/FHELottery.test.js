const { expect } = require("chai");
const { ethers, fhevm } = require("hardhat");

describe("FHELottery - Basic Functionality Tests", function () {
  let contract;
  let admin, user1, user2, user3;

  beforeEach(async function () {
    if (!fhevm.isMock) {
      throw new Error("This test must run in FHEVM mock environment");
    }

    await fhevm.initializeCLIApi();
    [admin, user1, user2, user3] = await ethers.getSigners();

    const Factory = await ethers.getContractFactory("FHELottery");
    const deployed = await Factory.deploy();
    await deployed.waitForDeployment();
    contract = deployed;
  });

  it("should deploy contract successfully", async function () {
    expect(await contract.getAddress()).to.be.properAddress;
    console.log("  Contract deployed at:", await contract.getAddress());
  });

  it("should have correct initial values", async function () {
    const contractAdmin = await contract.admin();
    const roundCount = await contract.roundCount();

    expect(contractAdmin).to.equal(admin.address);
    expect(roundCount).to.equal(0);
    console.log("  Initial values correct");
  });

  it("should create a lottery round", async function () {
    const drawTime = Math.floor(Date.now() / 1000) + 3600; // 1 hour from now
    const roundName = "Test Round 1";

    const tx = await contract.connect(admin).createRound(roundName, drawTime);
    const receipt = await tx.wait();

    // Check event
    const roundCreatedEvent = receipt.logs.find((log) => {
      try {
        const decoded = contract.interface.parseLog(log);
        return decoded.name === "RoundCreated";
      } catch {
        return false;
      }
    });

    expect(roundCreatedEvent).to.not.be.undefined;

    const roundCount = await contract.roundCount();
    expect(roundCount).to.equal(1);

    const roundInfo = await contract.getRound(0);
    expect(roundInfo.name).to.equal(roundName);
    expect(roundInfo.drawn).to.equal(false);
    expect(roundInfo.ticketCount).to.equal(0);

    console.log("  Lottery round created successfully");
  });

  it("should prevent non-admin from creating rounds", async function () {
    const drawTime = Math.floor(Date.now() / 1000) + 3600;

    await expect(
      contract.connect(user1).createRound("Unauthorized Round", drawTime)
    ).to.be.revertedWith("Only admin");

    console.log("  Non-admin round creation prevented");
  });

  it("should prevent creating round with past draw time", async function () {
    const pastTime = Math.floor(Date.now() / 1000) - 3600;

    await expect(
      contract.connect(admin).createRound("Past Round", pastTime)
    ).to.be.revertedWith("Draw time must be in future");

    console.log("  Past draw time validation works");
  });

  it("should buy a ticket with encrypted number", async function () {
    // Create round
    const drawTime = Math.floor(Date.now() / 1000) + 3600;
    await contract.connect(admin).createRound("Test Round", drawTime);

    // Create encrypted ticket number
    const ticketNumber = 42;
    const encrypted = await fhevm
      .createEncryptedInput(await contract.getAddress(), user1.address)
      .add32(BigInt(ticketNumber))
      .encrypt();

    // Buy ticket
    const tx = await contract
      .connect(user1)
      .buyTicket(0, encrypted.handles[0], encrypted.inputProof);
    const receipt = await tx.wait();

    // Check event
    const ticketBoughtEvent = receipt.logs.find((log) => {
      try {
        const decoded = contract.interface.parseLog(log);
        return decoded.name === "TicketBought";
      } catch {
        return false;
      }
    });

    expect(ticketBoughtEvent).to.not.be.undefined;
    expect(ticketBoughtEvent.args.buyer).to.equal(user1.address);
    expect(ticketBoughtEvent.args.ticketId).to.equal(0);

    // Check ticket info
    const ticketInfo = await contract.getTicketInfo(0, 0);
    expect(ticketInfo.buyer).to.equal(user1.address);
    expect(ticketInfo.claimed).to.equal(false);

    console.log("  Ticket bought successfully with encrypted number");
  });

  it("should allow multiple users to buy tickets", async function () {
    // Create round
    const drawTime = Math.floor(Date.now() / 1000) + 3600;
    await contract.connect(admin).createRound("Multi-user Round", drawTime);

    const users = [user1, user2, user3];
    const ticketNumbers = [10, 20, 30];

    for (let i = 0; i < users.length; i++) {
      const encrypted = await fhevm
        .createEncryptedInput(await contract.getAddress(), users[i].address)
        .add32(BigInt(ticketNumbers[i]))
        .encrypt();

      await contract
        .connect(users[i])
        .buyTicket(0, encrypted.handles[0], encrypted.inputProof);
    }

    // Check round ticket count
    const roundInfo = await contract.getRound(0);
    expect(roundInfo.ticketCount).to.equal(3);

    // Check each user's tickets
    for (let i = 0; i < users.length; i++) {
      const userTickets = await contract.connect(users[i]).getMyTickets(0);
      expect(userTickets.length).to.equal(1);
      expect(userTickets[0]).to.equal(i);
    }

    console.log("  Multiple users can buy tickets");
  });

  it("should allow same user to buy multiple tickets", async function () {
    // Create round
    const drawTime = Math.floor(Date.now() / 1000) + 3600;
    await contract.connect(admin).createRound("Multi-ticket Round", drawTime);

    // User buys 3 tickets
    for (let i = 0; i < 3; i++) {
      const encrypted = await fhevm
        .createEncryptedInput(await contract.getAddress(), user1.address)
        .add32(BigInt(i * 10))
        .encrypt();

      await contract
        .connect(user1)
        .buyTicket(0, encrypted.handles[0], encrypted.inputProof);
    }

    const userTickets = await contract.connect(user1).getMyTickets(0);
    expect(userTickets.length).to.equal(3);

    console.log("  Same user can buy multiple tickets");
  });

  it("should prevent buying ticket for non-existent round", async function () {
    const encrypted = await fhevm
      .createEncryptedInput(await contract.getAddress(), user1.address)
      .add32(42n)
      .encrypt();

    await expect(
      contract
        .connect(user1)
        .buyTicket(999, encrypted.handles[0], encrypted.inputProof)
    ).to.be.revertedWith("Round not exist");

    console.log("  Non-existent round validation works");
  });

  it("should draw winning number", async function () {
    // Create round with short duration
    const drawTime = Math.floor(Date.now() / 1000) + 10;
    await contract.connect(admin).createRound("Draw Test Round", drawTime);

    // Buy a ticket
    const encrypted = await fhevm
      .createEncryptedInput(await contract.getAddress(), user1.address)
      .add32(42n)
      .encrypt();

    await contract
      .connect(user1)
      .buyTicket(0, encrypted.handles[0], encrypted.inputProof);

    // Advance time
    await ethers.provider.send("evm_increaseTime", [11]);
    await ethers.provider.send("evm_mine", []);

    // Draw winning number
    const winningNumber = 42;
    const tx = await contract.connect(admin).draw(0, winningNumber);
    const receipt = await tx.wait();

    // Check event
    const roundDrawnEvent = receipt.logs.find((log) => {
      try {
        const decoded = contract.interface.parseLog(log);
        return decoded.name === "RoundDrawn";
      } catch {
        return false;
      }
    });

    expect(roundDrawnEvent).to.not.be.undefined;
    expect(roundDrawnEvent.args.winningNumber).to.equal(winningNumber);

    // Check round state
    const roundInfo = await contract.getRound(0);
    expect(roundInfo.drawn).to.equal(true);
    expect(roundInfo.winningNumber).to.equal(winningNumber);

    console.log("  Winning number drawn successfully");
  });

  it("should prevent drawing before draw time", async function () {
    const drawTime = Math.floor(Date.now() / 1000) + 3600;
    await contract.connect(admin).createRound("Early Draw Round", drawTime);

    await expect(contract.connect(admin).draw(0, 42)).to.be.revertedWith(
      "Cannot draw before draw time"
    );

    console.log("  Early draw prevention works");
  });

  it("should prevent double drawing", async function () {
    const drawTime = Math.floor(Date.now() / 1000) + 10;
    await contract.connect(admin).createRound("Double Draw Round", drawTime);

    await ethers.provider.send("evm_increaseTime", [11]);
    await ethers.provider.send("evm_mine", []);

    await contract.connect(admin).draw(0, 42);

    await expect(contract.connect(admin).draw(0, 100)).to.be.revertedWith(
      "Already drawn"
    );

    console.log("  Double draw prevention works");
  });

  it("should prevent non-admin from drawing", async function () {
    const drawTime = Math.floor(Date.now() / 1000) + 10;
    await contract.connect(admin).createRound("Non-admin Draw Round", drawTime);

    await ethers.provider.send("evm_increaseTime", [11]);
    await ethers.provider.send("evm_mine", []);

    await expect(contract.connect(user1).draw(0, 42)).to.be.revertedWith(
      "Only admin"
    );

    console.log("  Non-admin draw prevention works");
  });

  it("should prevent buying ticket after round is closed", async function () {
    const drawTime = Math.floor(Date.now() / 1000) + 10;
    await contract.connect(admin).createRound("Closed Round", drawTime);

    await ethers.provider.send("evm_increaseTime", [11]);
    await ethers.provider.send("evm_mine", []);

    const encrypted = await fhevm
      .createEncryptedInput(await contract.getAddress(), user1.address)
      .add32(42n)
      .encrypt();

    await expect(
      contract
        .connect(user1)
        .buyTicket(0, encrypted.handles[0], encrypted.inputProof)
    ).to.be.revertedWith("Round closed");

    console.log("  Closed round ticket purchase prevention works");
  });

  it("should claim prize successfully", async function () {
    // Create round
    const drawTime = Math.floor(Date.now() / 1000) + 10;
    await contract.connect(admin).createRound("Claim Prize Round", drawTime);

    // Buy ticket with winning number
    const winningNumber = 42;
    const encrypted = await fhevm
      .createEncryptedInput(await contract.getAddress(), user1.address)
      .add32(BigInt(winningNumber))
      .encrypt();

    await contract
      .connect(user1)
      .buyTicket(0, encrypted.handles[0], encrypted.inputProof);

    // Advance time and draw
    await ethers.provider.send("evm_increaseTime", [11]);
    await ethers.provider.send("evm_mine", []);

    await contract.connect(admin).draw(0, winningNumber);

    // Claim prize
    const tx = await contract.connect(user1).claimPrize(0, 0);
    const receipt = await tx.wait();

    // Check event
    const prizeClaimedEvent = receipt.logs.find((log) => {
      try {
        const decoded = contract.interface.parseLog(log);
        return decoded.name === "PrizeClaimed";
      } catch {
        return false;
      }
    });

    expect(prizeClaimedEvent).to.not.be.undefined;
    expect(prizeClaimedEvent.args.winner).to.equal(user1.address);

    // Check ticket claimed state
    const ticketInfo = await contract.getTicketInfo(0, 0);
    expect(ticketInfo.claimed).to.equal(true);

    console.log("  Prize claimed successfully");
  });

  it("should prevent claiming prize before draw", async function () {
    const drawTime = Math.floor(Date.now() / 1000) + 3600;
    await contract.connect(admin).createRound("Pre-draw Claim Round", drawTime);

    const encrypted = await fhevm
      .createEncryptedInput(await contract.getAddress(), user1.address)
      .add32(42n)
      .encrypt();

    await contract
      .connect(user1)
      .buyTicket(0, encrypted.handles[0], encrypted.inputProof);

    await expect(contract.connect(user1).claimPrize(0, 0)).to.be.revertedWith(
      "Not drawn yet"
    );

    console.log("  Pre-draw claim prevention works");
  });

  it("should prevent double claiming", async function () {
    const drawTime = Math.floor(Date.now() / 1000) + 10;
    await contract.connect(admin).createRound("Double Claim Round", drawTime);

    const encrypted = await fhevm
      .createEncryptedInput(await contract.getAddress(), user1.address)
      .add32(42n)
      .encrypt();

    await contract
      .connect(user1)
      .buyTicket(0, encrypted.handles[0], encrypted.inputProof);

    await ethers.provider.send("evm_increaseTime", [11]);
    await ethers.provider.send("evm_mine", []);

    await contract.connect(admin).draw(0, 42);
    await contract.connect(user1).claimPrize(0, 0);

    await expect(contract.connect(user1).claimPrize(0, 0)).to.be.revertedWith(
      "Already claimed"
    );

    console.log("  Double claim prevention works");
  });

  it("should prevent non-owner from claiming ticket", async function () {
    const drawTime = Math.floor(Date.now() / 1000) + 10;
    await contract
      .connect(admin)
      .createRound("Non-owner Claim Round", drawTime);

    const encrypted = await fhevm
      .createEncryptedInput(await contract.getAddress(), user1.address)
      .add32(42n)
      .encrypt();

    await contract
      .connect(user1)
      .buyTicket(0, encrypted.handles[0], encrypted.inputProof);

    await ethers.provider.send("evm_increaseTime", [11]);
    await ethers.provider.send("evm_mine", []);

    await contract.connect(admin).draw(0, 42);

    await expect(contract.connect(user2).claimPrize(0, 0)).to.be.revertedWith(
      "Not ticket owner"
    );

    console.log("  Non-owner claim prevention works");
  });

  it("should return encrypted ticket number to owner", async function () {
    const drawTime = Math.floor(Date.now() / 1000) + 3600;
    await contract.connect(admin).createRound("Get Number Round", drawTime);

    const encrypted = await fhevm
      .createEncryptedInput(await contract.getAddress(), user1.address)
      .add32(42n)
      .encrypt();

    await contract
      .connect(user1)
      .buyTicket(0, encrypted.handles[0], encrypted.inputProof);

    // Owner can get their encrypted number
    const ticketNumber = await contract.connect(user1).getMyTicketNumber(0, 0);
    expect(ticketNumber).to.not.be.undefined;

    console.log("  Encrypted ticket number retrieval works");
  });

  it("should prevent non-owner from getting ticket number", async function () {
    const drawTime = Math.floor(Date.now() / 1000) + 3600;
    await contract
      .connect(admin)
      .createRound("Non-owner Get Number Round", drawTime);

    const encrypted = await fhevm
      .createEncryptedInput(await contract.getAddress(), user1.address)
      .add32(42n)
      .encrypt();

    await contract
      .connect(user1)
      .buyTicket(0, encrypted.handles[0], encrypted.inputProof);

    await expect(
      contract.connect(user2).getMyTicketNumber(0, 0)
    ).to.be.revertedWith("Not ticket owner");

    console.log("  Non-owner ticket number access prevention works");
  });
});
