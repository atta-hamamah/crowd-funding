'use client';

import { useState, useEffect } from 'react';
import { getAllCampaigns, getCampaignDetails } from './utils/ethers';
import CreateCampaign from './Components/CreateCampaign';
import CampaignCard from './Components/CampaignCard ';

export default function Home() {
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isWalletConnected, setIsWalletConnected] = useState(false);
  const [connectedAccount, setConnectedAccount] = useState('');

  useEffect(() => {
    if (window.ethereum) {
      checkConnectedAccount();
      window.ethereum.on('accountsChanged', (accounts) => {
        if (accounts.length > 0) {
          setConnectedAccount(accounts[0]);
          setIsWalletConnected(true);
        } else {
          setConnectedAccount('');
          setIsWalletConnected(false);
        }
      });
      return () => {
        window.ethereum.removeListener('accountsChanged', () => {});
      };
    }
  }, []);

  const checkConnectedAccount = async () => {
    try {
      if (window.ethereum) {
        const accounts = await window.ethereum.request({ method: 'eth_accounts' });
        if (accounts.length > 0) {
          setConnectedAccount(accounts[0]);
          setIsWalletConnected(true);
        }
      }
    } catch (err) {
      console.error('Error checking connected account:', err);
    }
  };

  const connectWallet = async () => {
    try {
      if (window.ethereum) {
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        setConnectedAccount(accounts[0]);
        setIsWalletConnected(true);
      } else {
        setError('Please install MetaMask to use this application');
      }
    } catch (err) {
      setError('Failed to connect wallet');
      console.error(err);
    }
  };
  const fetchCampaigns = async () => {
    try {
      setLoading(true);
      setError(null);
      const campaignList = await getAllCampaigns();
      if (campaignList.length === 0) {
        setCampaigns([]);
        return;
      }
      const campaignDetails = await Promise.all(
        campaignList.map(async (campaign) => {
          const details = await getCampaignDetails(campaign.campaignAddress);
          return {
            ...details,
            address: campaign.campaignAddress,
            creationTime: new Date(Number(campaign.creationTime) * 1000),
          };
        })
      );

      setCampaigns(campaignDetails);
    } catch (err) {
      setError('Failed to fetch campaigns');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };
  // Add this function in your Home component (paste-2.txt)
  const refreshCampaign = async (campaignAddress) => {
    try {
      const updatedDetails = await getCampaignDetails(campaignAddress);
      setCampaigns((prevCampaigns) =>
        prevCampaigns.map((camp) =>
          camp.address === campaignAddress
            ? {
                ...updatedDetails,
                address: campaignAddress,
                creationTime: camp.creationTime,
              }
            : camp
        )
      );
    } catch (err) {
      console.error('Failed to refresh campaign:', err);
    }
  };

  return (
    <div className=" py-4 px-8 bg-gray-100">
      <div className="bg-white rounded-lg shadow-lg p-8 mb-4">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Decentralized Crowdfunding</h1>
        <p className="text-xl text-gray-600 mb-6">Support innovative projects and ideas through blockchain technology</p>

        {!isWalletConnected ? (
          <button
            onClick={connectWallet}
            className="bg-purple-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-purple-700 transition-colors">
            Connect Wallet
          </button>
        ) : (
          <button
            onClick={fetchCampaigns}
            disabled={loading}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:bg-blue-300">
            {loading ? 'Loading...' : 'Show All Campaigns'}
          </button>
        )}
        {error && <div className="mt-4 p-4 bg-red-100 text-red-700 rounded-lg">{error}</div>}
      </div>
      <section className=" grid grid-cols-2">
        {campaigns.length > 0 ? (
          campaigns.map((camp) => (
            <CampaignCard
              connectedAccount={connectedAccount}
              key={camp.address}
              camp={camp}
              refreshCampaign={refreshCampaign}
            />
          ))
        ) : (
          <p className=" col-span-2">no camps created</p>
        )}
      </section>
      <CreateCampaign isWalletConnected={isWalletConnected} />
    </div>
  );
}
