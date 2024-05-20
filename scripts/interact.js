const contract = require("../artifacts/contracts/HelloWorld.sol/HelloWorld.json");
const ethers = require("ethers");

const API_URL = process.env.API_URL;
const PRIVATE_KEY = process.env.PRIVATE_KEY;
const CONTRACT_ADDRESS = process.env.CONTRACT_ADDRESS;

async function main() {
  const provider = new ethers.providers.JsonRpcProvider(API_URL);
  const signer = new ethers.Wallet(PRIVATE_KEY, provider);
  const helloWorldContract = new ethers.Contract(
    CONTRACT_ADDRESS,
    contract.abi,
    signer,
  );

  const message = await helloWorldContract.message();
  console.log("message: ", message);

  console.log("Updating the message...");
  const tx = await helloWorldContract.update("this is new message");
  await tx.wait();

  const newMessage = await helloWorldContract.message();
  console.log("new message: ", newMessage);
}

main();
