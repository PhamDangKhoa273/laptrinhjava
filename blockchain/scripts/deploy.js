import hre from "hardhat";

async function main() {
  const AgroTrace = await hre.ethers.getContractFactory("AgroTrace");
  const contract = await AgroTrace.deploy();
  await contract.waitForDeployment();

  const address = await contract.getAddress();
  const network = await hre.ethers.provider.getNetwork();

  console.log(JSON.stringify({
    contract: "AgroTrace",
    address,
    chainId: Number(network.chainId)
  }, null, 2));
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
