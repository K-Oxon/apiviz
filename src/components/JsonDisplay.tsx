import React, { useEffect, useState } from 'react';

interface JsonDisplayProps {
  data: any;
  onFilteredData: (date: any) => void;
}

const JsonDisplay: React.FC<JsonDisplayProps> = ({ data, onFilteredData }) => {
  const [filter, setFilter] = useState('');
  const [filteredData, setFilteredData] = useState(data);

  const filterJson = (obj: any, query: string): any => {
    if (!query) return obj;

    const keys = query
      .split('.')
      .map((key) => {
        const match = key.match(/^(\w+)(?:\[(\d+)\])?$/);
        return match
          ? { name: match[1], index: match[2] ? parseInt(match[2], 10) : undefined }
          : null;
      })
      .filter(Boolean);

    return keys.reduce((acc: any, key: any) => {
      if (acc === undefined) return undefined;

      if (key.index !== undefined) {
        return Array.isArray(acc[key.name]) ? acc[key.name][key.index] : undefined;
      }

      return acc[key.name];
    }, obj);
  };

  useEffect(() => {
    const filtered = filterJson(data, filter);
    setFilteredData(filtered);
    onFilteredData(filtered);
  }, [data, filter, onFilteredData]);

  return (
    <div className="mb-6">
      <div className="mb-4">
        <label htmlFor="jsonFilter" className="block text-sm font-medium text-gray-700 mb-1">
          Filter JSON
        </label>
        <input
          id="jsonFilter"
          type="text"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          placeholder="e.g., data.items[0].name"
          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
      <div className="bg-gray-100 p-4 rounded-md overflow-auto max-h-96">
        <pre className="text-sm">{JSON.stringify(filteredData, null, 2)}</pre>
      </div>
    </div>
  );
};

export default JsonDisplay;
