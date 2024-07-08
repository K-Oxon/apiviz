import React, { useEffect, useState } from 'react';
import ApiInput from './components/ApiInput';
import ApiKeyInput from './components/ApiKeyInput';
import DuckDBComponent from './components/DuckDBComponent';
import JsonDisplay from './components/JsonDisplay';
import Sidebar from './components/Sidebar';

const App: React.FC = () => {
  const [jsonData, setJsonData] = useState<any>(null);
  const [filteredData, setFilteredData] = useState<any>(null);
  const [apiHeader, setApiHeader] = useState({ name: 'X-API-KEY', value: '' });
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const handleApiKeyChange = (name: string, value: string) => {
    setApiHeader({ name, value });
  };
  const handleFilteredData = (data: any) => {
    setFilteredData(data);
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setIsSidebarOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    handleResize();
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div className="flex h-screen overflow-hidden">
      <div
        className={`flex-grow overflow-auto transition-all duration-300 ${isSidebarOpen ? 'mr-80' : ''}`}
      >
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
      </div>
      <Sidebar isOpen={isSidebarOpen} onToggle={toggleSidebar} />
    </div>
  );
};

export default App;
