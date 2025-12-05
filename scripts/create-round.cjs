require('dotenv').config();
const hre = require("hardhat");

async function main() {
  const CONTRACT_ADDRESS = process.env.LOTTERY_CONTRACT || "0x1A13d8b13f11ac34d2c606d1c47117Fa9974bdAe";

  const [admin] = await hre.ethers.getSigners();
  console.log("Creating round with admin:", admin.address);

  const FHELottery = await hre.ethers.getContractFactory("FHELottery");
  const lottery = FHELottery.attach(CONTRACT_ADDRESS);

  // Create a round that ends in 7 days
  const drawTime = Math.floor(Date.now() / 1000) + (7 * 24 * 60 * 60);
  const roundName = "Week 1 Draw";

  console.log("\nCreating round:", roundName);
  console.log("Draw time:", new Date(drawTime * 1000).toLocaleString());

  const tx = await lottery.createRound(roundName, drawTime);
  const receipt = await tx.wait();

  console.log("✅ Round created successfully!");
  console.log("Transaction hash:", receipt.hash);

  // Get roundCount
  const roundCount = await lottery.roundCount();
  console.log("Total rounds:", roundCount.toString());
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
