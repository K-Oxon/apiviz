import React, { useState } from 'react';

interface ApiKeyInputProps {
  onApiKeyChange: (headerName: string, headerValue: string) => void;
}

const ApiKeyInput: React.FC<ApiKeyInputProps> = ({ onApiKeyChange }) => {
  const [headerName, setHeaderName] = useState('X-API-KEY');
  const [headerValue, setHeaderValue] = useState('');

  const handleHeaderNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setHeaderName(e.target.value);
    onApiKeyChange(e.target.value, headerValue);
  };

  const handleHeaderValueChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setHeaderValue(e.target.value);
    onApiKeyChange(headerName, e.target.value);
  };

  return (
    <div className="mb-4">
      <div className="flex mb-2">
        <div className="flex-grow mr-2">
          <label htmlFor="headerName" className="block text-sm font-medium text-gray-700 mb-1">
            Header Name
          </label>
          <input
            id="headerName"
            type="text"
            value={headerName}
            onChange={handleHeaderNameChange}
            placeholder="e.g., X-API-KEY"
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div className="flex-grow">
          <label htmlFor="headerValue" className="block text-sm font-medium text-gray-700 mb-1">
            API Key / Token
          </label>
          <input
            id="headerValue"
            type="password"
            value={headerValue}
            onChange={handleHeaderValueChange}
            placeholder="e.g., your-api-key-here"
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>
    </div>
  );
};

export default ApiKeyInput;
