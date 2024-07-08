import React, { useState } from 'react';
import ApiInput from './components/ApiInput';
import ApiKeyInput from './components/ApiKeyInput';
import DuckDBComponent from './components/DuckDBComponent';
import JsonDisplay from './components/JsonDisplay';

const App: React.FC = () => {
  const [jsonData, setJsonData] = useState<any>(null);
  const [filteredData, setFilteredData] = useState<any>(null);
  const [apiHeader, setApiHeader] = useState({ name: 'X-API-KEY', value: '' });

  const handleApiKeyChange = (name: string, value: string) => {
    setApiHeader({ name, value });
  };
  const handleFilteredData = (data: any) => {
    setFilteredData(data);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">API Viz</h1>
      <ApiKeyInput onApiKeyChange={handleApiKeyChange} />
      <ApiInput onDataFetched={setJsonData} apiHeader={apiHeader} />
      {jsonData && (
        <>
          <JsonDisplay data={jsonData} onFilteredData={handleFilteredData} />
          {filteredData && <DuckDBComponent jsonData={filteredData} />}
        </>
      )}
    </div>
  );
};

export default App;
