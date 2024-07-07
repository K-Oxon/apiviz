import axios from 'axios';
import React, { useState } from 'react';

interface ApiInputProps {
  onDataFetched: (data: any) => void;
  apiHeader: { name: string; value: string };
}

const ApiInput: React.FC<ApiInputProps> = ({ onDataFetched, apiHeader }) => {
  const [apiUrl, setApiUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const headers = {
        [apiHeader.name]: apiHeader.value,
      };
      const response = await axios.get(apiUrl, { headers });
      onDataFetched(response.data);
    } catch (err) {
      setError('Failed to fetch data. Please check the URL and API key, then try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="mb-6">
      <label htmlFor="apiUrl" className="block text-sm font-medium text-gray-700 mb-1">
        API URL
      </label>
      <form onSubmit={handleSubmit} className="flex items-center">
        <input
          id="apiUrl"
          type="text"
          value={apiUrl}
          onChange={(e) => setApiUrl(e.target.value)}
          placeholder="e.g., https://api.example.com/data"
          className="flex-grow px-4 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          type="submit"
          className="px-4 py-2 bg-blue-500 text-white rounded-r-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
          disabled={isLoading}
        >
          {isLoading ? 'Loading...' : 'Fetch'}
        </button>
      </form>
      {error && <p className="mt-2 text-red-500">{error}</p>}
    </div>
  );
};

export default ApiInput;
