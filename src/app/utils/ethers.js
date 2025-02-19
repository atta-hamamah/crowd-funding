import { ethers } from 'ethers';

import CrowdfundingFactory from '../../../artifacts/contracts/CrowdfundingFactory.sol/CrowdfundingFactory.json';
import Crowdfunding from '../../../artifacts/contracts/Crowdfunding.sol/Crowdfunding.json';

const FACTORY_CONTRACT_ADDRESS = '0x5FbDB2315678afecb367f032d93F642f64180aa3';

export const getProvider = () => {
  if (window !== 'undefined' && window.ethereum) {
    return new ethers.BrowserProvider(window.ethereum);
  }
  throw new Error('Please install MetaMask or another web3 wallet');
};

export const getSigner = async () => {
  const provider = getProvider();
  return await provider.getSigner();
};

export const getFactoryContract = (providerOrSigner) => {
  return new ethers.Contract(FACTORY_CONTRACT_ADDRESS, CrowdfundingFactory.abi, providerOrSigner);
};

export const getCrowdfundingContract = (contractAddress, providerOrSigner) => {
  return new ethers.Contract(contractAddress, Crowdfunding.abi, providerOrSigner);
};

export const createCampaign = async (name, description, goal, durationInDays) => {
  try {
    const signer = await getSigner();
    const factory = getFactoryContract(signer);
    const tx = await factory.createCampaign(name, description, ethers.parseEther(goal.toString()), durationInDays);
    await tx.wait();
    return tx;
  } catch (error) {
    console.error('Error creating campaign:', error);
    throw error;
  }
};

export const getAllCampaigns = async () => {
  try {
    const provider = getProvider();
    const factory = getFactoryContract(provider);
    const campaigns = await factory.getAllCampaigns();
    return campaigns;
  } catch (error) {
    console.error('Error getting campaigns:', error);
    throw error;
  }
};

export const getUserCampaigns = async (userAddress) => {
  try {
    const provider = getProvider();
    const factory = getFactoryContract(provider);
    const campaigns = await factory.getUserCampaigns(userAddress);
    return campaigns;
  } catch (error) {
    console.error('Error getting user campaigns:', error);
    throw error;
  }
};

export const fundCampaign = async (campaignAddress, tierIndex, amount) => {
  try {
    const signer = await getSigner();
    const campaign = getCrowdfundingContract(campaignAddress, signer);

    const tx = await campaign.fund(tierIndex, {
      value: ethers.parseEther(amount.toString()),
    });

    await tx.wait();
    return tx;
  } catch (error) {
    console.error('Error funding campaign:', error);
    throw error;
  }
};

export const getCampaignDetails = async (campaignAddress) => {
  try {
    const provider = getProvider();
    const campaign = getCrowdfundingContract(campaignAddress, provider);

    const [name, description, goal, deadline, owner, state, tiers] = await Promise.all([campaign.name(), campaign.description(), campaign.goal(), campaign.deadline(), campaign.owner(), campaign.getCampaignStatus(), campaign.getTiers()]);

    return {
      name,
      description,
      goal: ethers.formatEther(goal),
      deadline: new Date(Number(deadline) * 1000),
      owner,
      state,
      tiers: tiers.map((tier) => ({
        name: tier.name,
        amount: ethers.formatEther(tier.amount),
        backers: Number(tier.backers),
      })),
    };
  } catch (error) {
    console.error('Error getting campaign details:', error);
    throw error;
  }
};

export const withdrawCampaignFunds = async (campaignAddress) => {
  try {
    const signer = await getSigner();
    const campaign = getCrowdfundingContract(campaignAddress, signer);

    const tx = await campaign.withdraw();
    await tx.wait();
    return tx;
  } catch (error) {
    console.error('Error withdrawing funds:', error);
    throw error;
  }
};

export const requestRefund = async (campaignAddress) => {
  try {
    const signer = await getSigner();
    const campaign = getCrowdfundingContract(campaignAddress, signer);

    const tx = await campaign.refund();
    await tx.wait();
    return tx;
  } catch (error) {
    console.error('Error requesting refund:', error);
    throw error;
  }
};

export const addTier = async (campaignAddress, name, amount) => {
  try {
    const signer = await getSigner();
    const campaign = getCrowdfundingContract(campaignAddress, signer);

    const tx = await campaign.addTier(name, ethers.parseEther(amount.toString()));

    await tx.wait();
    return tx;
  } catch (error) {
    console.error('Error adding tier:', error);
    throw error;
  }
};
