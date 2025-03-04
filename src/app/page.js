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
  const [tab, setTab] = useState('');

  useEffect(() => {
    if (window.ethereum) {
      checkConnectedAccount();
      window.ethereum.on('accountsChanged', (accounts) => {
        if (accounts.length > 0) {
          setConnectedAccount(accounts[0]);
          setIsWalletConnected(true);
          fetchCampaigns();
        } else {
          setConnectedAccount('');
          setIsWalletConnected(false);
          setCampaigns([]);
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
          fetchCampaigns();
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
        fetchCampaigns();
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
        setLoading(false);
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

  const onCampaignCreated = () => {
    fetchCampaigns();
  };

  return (
    <div className="py-4 px-8 bg-gray-100">
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
          <div className="text-green-600 font-semibold">
            Wallet Connected: {connectedAccount.substring(0, 6)}...{connectedAccount.substring(connectedAccount.length - 4)}
          </div>
        )}
        {error && <div className="mt-4 p-4 bg-red-100 text-red-700 rounded-lg">{error}</div>}
        <div>
          <button
            className={` ${tab === 'all' ? ' text-blue-600 border-blue-600' : ' text-gray-400'} border-b-2 `}
            onClick={() => setTab('all')}>
            All campaigns
          </button>
          <button
            className={` ${tab === 'user' ? ' text-blue-600 border-blue-600' : ' text-gray-400'} border-b-2 `}
            onClick={() => setTab('user')}>
            User Campaign
          </button>
          <button
            className={` ${tab === 'create' ? ' text-blue-600 border-blue-600' : ' text-gray-400'} border-b-2 `}
            onClick={() => setTab('create')}>
            Create Campaign
          </button>
        </div>
      </div>

      {isWalletConnected && (
        <div>
          {tab === 'all' && (
            <section>
              {loading ? (
                <div className="text-center py-8">Loading campaigns...</div>
              ) : (
                <section className="grid grid-cols-2 gap-4 mb-8">
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
                    <div className="col-span-2 text-center py-8 bg-white rounded-lg shadow-md">
                      <p className="text-gray-600">No campaigns created yet. Be the first to start one!</p>
                    </div>
                  )}
                </section>
              )}
            </section>
          )}

          {tab === 'create' && (
            <section>
              <CreateCampaign
                isWalletConnected={isWalletConnected}
                onCampaignCreated={onCampaignCreated}
              />
            </section>
          )}
          {tab === 'user' && <section>user Campaign</section>}
        </div>
      )}
    </div>
  );
}
