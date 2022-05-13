// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// When running the script with `npx hardhat run <script>` you'll find the Hardhat
// Runtime Environment's members available in the global scope.
const hre = require("hardhat");

// Returns the Ether balance of a given address
async function getBalance(address) {
  const balanceBigInt = await hre.waffle.provider.getBalance(address);
  return hre.ethers.utils.formatEther(balanceBigInt);
}

// Logs the memos stored on-chain from coffee purchase.
async function printBalances(addresses) {
  let idx = 0;
  for (const address of addresses) {
    console.log(`Address ${idx} balance: `, await getBalance(address));
    idx++;
  }
}

// Logs the memos stored on-chain from coffee purchases
async function printMemos(memos) {
  for (const memo of memos) {
    const timestamp = memo.timestamp;
    const tipper = memo.name;
    const tipperAddress = memo.from;
    const message = memo.message;
    console.log(`At ${timestamp}, ${tipper} (${tipperAddress}) said: "${message}"`);
  }
}

async function main() {
  // Get example accounts
  const [owner, tipper1, tipper2, tipper3] = await hre.ethers.getSigners();

  // Get the contract to deploy & deploy it
  const BuyMeACoffee = await hre.ethers.getContractFactory("BuyMeACoffee");
  const buyMeACoffee = await BuyMeACoffee.deploy();
  await buyMeACoffee.deployed();
  console.log("BuyMeACoffee deployed to: ", buyMeACoffee.address);

  // Check balances before the coffee purchase
  const addresses = [owner.address, tipper1.address, tipper2.address, tipper3.address, buyMeACoffee.address];
  console.log("== Checking balances before the coffee purchase ==");
  await printBalances(addresses);

  // Buy the owner a few coffees
  const tip = {value: hre.ethers.utils.parseEther("1")};
  await buyMeACoffee.connect(tipper1).buyCoffee("Rocio", "You're the best!", tip);
  await buyMeACoffee.connect(tipper2).buyCoffee("Carlos", "Amazing developer :)", tip);
  await buyMeACoffee.connect(tipper3).buyCoffee("Jose", "I love this!", tip);

  // Change contract owner
  const newOwner = tipper3;
  await buyMeACoffee.connect(owner).setNewOwner(newOwner.address);

  // Check balances after the coffee purchase
  console.log("== Checking balances after the coffee purchase ==");
  await printBalances(addresses);

  // Withdraw funds
  await buyMeACoffee.connect(owner).withdrawTips();

  // Check balance after withdraw
  console.log("== Checking balances after withdraw tips ==");
  await printBalances(addresses);

  // Read all the memos left for the owner
  console.log("== Memos ==");
  const memos = await buyMeACoffee.getMemos();
  printMemos(memos);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
