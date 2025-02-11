'use client';
import { useEffect, useState } from 'react';
import { getFactoryContract } from './utils/ethers';

const Campaigns = () => {
  const [campaigns, setCampaigns] = useState([]);

  useEffect(() => {
    const fetchCampaigns = async () => {
      try {
        const factory = await getFactoryContract();
        const allCampaigns = await factory.getAllCampaigns();
        setCampaigns(allCampaigns);
      } catch (error) {
        console.error('Error fetching campaigns:', error);
      }
    };

    fetchCampaigns();
  }, []);

  return (
    <div>
      <h2>All Campaigns</h2>
      <ul>
        {campaigns.map((campaign, index) => (
          <li key={index}>
            {campaign.name} - {campaign.owner}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Campaigns;
