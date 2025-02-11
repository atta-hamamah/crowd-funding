const hre = require('hardhat');

async function main() {
  console.log('Starting deployment...');

  // Deploy CrowdfundingFactory
  const CrowdfundingFactory = await hre.ethers.getContractFactory('CrowdfundingFactory');
  const crowdfundingFactory = await CrowdfundingFactory.deploy();

  // Wait for the deployment transaction to be mined
  await crowdfundingFactory.waitForDeployment();

  // Get the contract address
  const factoryAddress = await crowdfundingFactory.getAddress();
  console.log(`CrowdfundingFactory deployed to: ${factoryAddress}`);

  // For testing purposes, create a sample campaign
  const [deployer] = await hre.ethers.getSigners();

  // Create a campaign using the factory
  const createTx = await crowdfundingFactory.createCampaign(
    'Test Campaign',
    'A test campaign description',
    hre.ethers.parseEther('1.0'), // 1 ETH goal
    30 // 30 days duration
  );

  await createTx.wait();

  // Get the created campaign
  const campaigns = await crowdfundingFactory.getAllCampaigns();
  const firstCampaign = campaigns[0];

  console.log(`Sample campaign created at: ${firstCampaign.campaignAddress}`);

  // Create instance of the created campaign
  const Crowdfunding = await hre.ethers.getContractFactory('Crowdfunding');
  const crowdfunding = Crowdfunding.attach(firstCampaign.campaignAddress);

  // Add some tiers to the sample campaign
  await crowdfunding.addTier('Bronze', hre.ethers.parseEther('0.1'));
  await crowdfunding.addTier('Silver', hre.ethers.parseEther('0.3'));
  await crowdfunding.addTier('Gold', hre.ethers.parseEther('0.5'));

  console.log('Added sample tiers to the campaign');

  // Verify deployment
  console.log('\nDeployment completed!');
  console.log('-------------------');
  console.log(`CrowdfundingFactory: ${factoryAddress}`);
  console.log(`Sample Campaign: ${firstCampaign.campaignAddress}`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
