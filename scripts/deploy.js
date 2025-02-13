const hre = require('hardhat');

async function main() {
  console.log('Starting deployment...');
  const CrowdfundingFactory = await hre.ethers.getContractFactory('CrowdfundingFactory');
  const crowdfundingFactory = await CrowdfundingFactory.deploy();
  await crowdfundingFactory.waitForDeployment();
  const factoryAddress = await crowdfundingFactory.getAddress();
  console.log(`CrowdfundingFactory deployed to: ${factoryAddress}`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
