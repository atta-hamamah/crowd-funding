import { useState } from 'react';
import { createCampaign } from '../utils/ethers';

export default function CreateCampaign({ isWalletConnected, onCampaignCreated }) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    goal: '',
    duration: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isWalletConnected) {
      setLoading(true);
      setError('');
      setSuccess(false);
      try {
        if (!formData.name || !formData.description || !formData.goal || !formData.duration) {
          throw new Error('Please fill in all fields');
        }

        if (isNaN(formData.goal) || formData.goal <= 0) {
          throw new Error('Please enter a valid goal amount');
        }

        if (isNaN(formData.duration) || formData.duration <= 0) {
          throw new Error('Please enter a valid duration in days');
        }

        const tx = await createCampaign(formData.name, formData.description, formData.goal, parseInt(formData.duration));

        setSuccess(true);
        setFormData({
          name: '',
          description: '',
          goal: '',
          duration: '',
        });
        if (onCampaignCreated) {
          onCampaignCreated();
        }
      } catch (err) {
        setError(err.message || 'Failed to create campaign');
      } finally {
        setLoading(false);
      }
    } else {
      window.alert('Connect a wallet first');
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-lg border">
      <h1 className="text-3xl font-bold mb-6">Create New Campaign</h1>

      {error && (
        <div className="mb-4 p-4 bg-red-100 text-red-700 rounded-lg">
          <p>{error}</p>
        </div>
      )}

      {success && (
        <div className="mb-4 p-4 bg-green-100 text-green-700 rounded-lg">
          <p>Campaign created successfully!</p>
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className="space-y-6">
        <div>
          <label
            htmlFor="name"
            className="block text-sm font-medium mb-2">
            Campaign Name
          </label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Enter campaign name"
            disabled={loading}
          />
        </div>

        <div>
          <label
            htmlFor="description"
            className="block text-sm font-medium mb-2">
            Description
          </label>
          <input
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Describe your campaign"
            disabled={loading}
          />
        </div>
        <div className=" col-span-2 flex items-center justify-center gap-4 w-full">
          <div className=" w-full">
            <label
              htmlFor="goal"
              className="block text-sm font-medium mb-2">
              Funding Goal (ETH)
            </label>
            <input
              type="number"
              id="goal"
              name="goal"
              value={formData.goal}
              onChange={handleChange}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter funding goal in ETH"
              step="0.01"
              min="0"
              disabled={loading}
            />
          </div>

          <div className=" w-full">
            <label
              htmlFor="duration"
              className="block text-sm font-medium mb-2">
              Duration (Days)
            </label>
            <input
              type="number"
              id="duration"
              name="duration"
              value={formData.duration}
              onChange={handleChange}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter campaign duration in days"
              min="1"
              disabled={loading}
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-500 text-white py-3 px-6 rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center">
          {loading ? <>Creating Campaign...</> : 'Create Campaign'}
        </button>
      </form>
    </div>
  );
}
