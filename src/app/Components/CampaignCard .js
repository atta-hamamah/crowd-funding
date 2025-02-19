import React, { useState } from 'react';
import { fundCampaign } from '../utils/ethers';

const CampaignCard = ({ camp }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Calculate progress percentage using the current balance
  const currentAmount = Number(camp.currentAmount);
  const goalAmount = Number(camp.goal);
  const progress = (currentAmount / goalAmount) * 100;
  const formattedProgress = Math.min(progress, 100).toFixed(1);

  // Calculate days remaining
  const daysRemaining = Math.max(0, Math.ceil((new Date(camp.deadline) - new Date()) / (1000 * 60 * 60 * 24)));

  // Format wallet address to be more readable
  const formatAddress = (address) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const handleFund = async (tierIndex = 0) => {
    try {
      setLoading(true);
      setError('');
      // If there are no tiers, use the minimum amount (0.01 ETH)
      const amount = camp.tiers.length > 0 ? camp.tiers[tierIndex].amount : '0.01';
      await fundCampaign(camp.address, tierIndex, amount);
      // You might want to add a callback here to refresh the campaign data
    } catch (err) {
      setError(err.message || 'Failed to fund campaign');
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
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
      <div className="p-6">
        <div className="flex justify-between items-start mb-4">
          <h3 className="text-xl font-semibold text-gray-900 mb-2">{camp.name}</h3>
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStateColor(Number(camp.state))}`}>{getStateText(Number(camp.state))}</span>
        </div>

        <p className="text-gray-600 mb-4 line-clamp-2">{camp.description}</p>

        <div className="mb-4">
          <div className="flex justify-between mb-1">
            <span className="text-sm font-medium text-gray-700">Progress</span>
            <span className="text-sm font-medium text-gray-700">{formattedProgress}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2.5">
            <div
              className="bg-blue-600 h-2.5 rounded-full transition-all duration-300"
              style={{ width: `${formattedProgress}%` }}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <p className="text-sm text-gray-500">Raised</p>
            <p className="text-lg font-semibold text-gray-900">{currentAmount.toFixed(2)} ETH</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Goal</p>
            <p className="text-lg font-semibold text-gray-900">{goalAmount.toFixed(2)} ETH</p>
          </div>
        </div>

        {camp.tiers.length > 0 && (
          <div className="mb-4">
            <p className="text-sm font-medium text-gray-700 mb-2">Funding Tiers</p>
            <div className="space-y-2">
              {camp.tiers.map((tier, index) => (
                <div
                  key={index}
                  className="flex justify-between items-center p-2 bg-gray-50 rounded">
                  <div>
                    <p className="font-medium">{tier.name}</p>
                    <p className="text-sm text-gray-500">{tier.amount} ETH</p>
                  </div>
                  <button
                    onClick={() => handleFund(index)}
                    disabled={loading || Number(camp.state) !== 0}
                    className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-300">
                    Fund
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {error && <div className="mb-4 p-2 bg-red-100 text-red-700 rounded text-sm">{error}</div>}

        <div className="flex flex-col gap-2 text-sm text-gray-500">
          <div className="flex justify-between items-center">
            <span>Created: {new Date(camp.creationTime).toLocaleDateString()}</span>
            <span>{daysRemaining} days left</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-xs">Owner: {formatAddress(camp.owner)}</span>
            <span className="text-xs">ID: {formatAddress(camp.address)}</span>
          </div>
        </div>

        {camp.tiers.length === 0 && (
          <button
            onClick={() => handleFund()}
            disabled={loading || Number(camp.state) !== 0}
            className="w-full mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-300">
            {loading ? 'Processing...' : 'Fund Campaign (0.01 ETH)'}
          </button>
        )}
      </div>
    </div>
  );
};

export default CampaignCard;
