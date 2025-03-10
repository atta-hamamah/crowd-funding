import CampaignCard from './CampaignCard ';

export default function UserCampaigns({ connectedAccount, campaigns, loading, refreshCampaign }) {
  const userCampaigns = campaigns.filter((campaign) => connectedAccount.toLowerCase() === campaign.owner.toLowerCase());

  return (
    <main>
      {loading ? (
        <div className="text-center py-8">Loading campaigns...</div>
      ) : (
        <section className="grid grid-cols-2 gap-4 mb-8">
          {userCampaigns.length > 0 ? (
            userCampaigns.map((camp) => (
              <CampaignCard
                connectedAccount={connectedAccount}
                key={camp.address}
                camp={camp}
                refreshCampaign={refreshCampaign}
              />
            ))
          ) : (
            <div className="col-span-2 text-center py-8 bg-white rounded-lg shadow-md">
              <p className="text-gray-600">Connected User has No Campaigns Created</p>
            </div>
          )}
        </section>
      )}
    </main>
  );
}
