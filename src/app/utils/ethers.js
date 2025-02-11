import { ethers } from 'ethers';
import factoryABI from '../../../artifacts/contracts/CrowdfundingFactory.sol/CrowdfundingFactory.json';
import campaignABI from '../../../artifacts/contracts/Crowdfunding.sol/Crowdfunding.json';

const factoryAddress = '0x610178dA211FEF7D417bC0e6FeD39F05609AD788';

export const getEthereumContract = async (contractAddress, abi) => {
  if (typeof window === 'undefined') return; // Ensure it's running in the browser
  if (!window.ethereum) throw new Error('No crypto wallet found. Install MetaMask.');

  const provider = new ethers.BrowserProvider(window.ethereum);
  const signer = await provider.getSigner();
  return new ethers.Contract(contractAddress, abi, signer);
};

export const getFactoryContract = async () => {
  return getEthereumContract(factoryAddress, factoryABI.abi);
};

export const getCampaignContract = async (campaignAddress) => {
  return getEthereumContract(campaignAddress, campaignABI.abi);
};
