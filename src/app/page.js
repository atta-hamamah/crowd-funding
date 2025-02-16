'use client';

import { useState, useEffect } from 'react';
import { getAllCampaigns, getCampaignDetails } from './utils/ethers';
import CreateCampaignForm from './Components/CreateCamp';

export default function Home() {
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isWalletConnected, setIsWalletConnected] = useState(false);

  const connectWallet = async () => {
    try {
      if (typeof window.ethereum !== 'undefined') {
        await window.ethereum.request({ method: 'eth_requestAccounts' });
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

      // Get all campaign addresses from factory
      const campaignList = await getAllCampaigns();

      // If no campaigns are found, set campaigns to an empty array and return
      if (campaignList.length === 0) {
        setCampaigns([]);
        return;
      }

      // Fetch details for each campaign
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

  const getStateColor = (state) => {
    switch (state) {
      case 0:
        return 'bg-blue-100 text-blue-800'; // Active
      case 1:
        return 'bg-green-100 text-green-800'; // Successful
      case 2:
        return 'bg-red-100 text-red-800'; // Failed
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStateText = (state) => {
    switch (state) {
      case 0:
        return 'Active';
      case 1:
        return 'Successful';
      case 2:
        return 'Failed';
      default:
        return 'Unknown';
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-xl p-8 mb-8">
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
        {campaigns.length === 0 && !loading && (
          <div className="text-center text-gray-600 py-8">
            <p>No campaigns created yet.</p>
          </div>
        )}
        <CreateCampaignForm isWalletConnected={isWalletConnected} />
        {campaigns.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {campaigns.map((campaign) => (
              <div
                key={campaign.address}
                className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <h2 className="text-xl font-semibold text-gray-900">{campaign.name}</h2>
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-medium
                       ${getStateColor(campaign.state)}`}>
                      {getStateText(campaign.state)}
                    </span>
                  </div>

                  <p className="text-gray-600 mb-4 line-clamp-3">{campaign.description}</p>

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Goal</span>
                      <span className="font-medium">{campaign.goal} ETH</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Deadline</span>
                      <span className="font-medium">{campaign.deadline.toLocaleDateString()}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Created</span>
                      <span className="font-medium">{campaign.creationTime.toLocaleDateString()}</span>
                    </div>
                  </div>

                  {campaign.tiers.length > 0 && (
                    <div className="mt-4">
                      <h3 className="text-sm font-medium text-gray-900 mb-2">Available Tiers</h3>
                      <div className="space-y-2">
                        {campaign.tiers.map((tier, index) => (
                          <div
                            key={index}
                            className="flex justify-between items-center bg-gray-50 p-2 rounded">
                            <span className="text-sm font-medium">{tier.name}</span>
                            <div className="text-sm">
                              <span className="font-medium">{tier.amount} ETH</span>
                              <span className="text-gray-500 ml-2">({tier.backers} backers)</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
