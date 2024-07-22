import * as duckdb from '@duckdb/duckdb-wasm';
import eh_worker from '@duckdb/duckdb-wasm/dist/duckdb-browser-eh.worker.js?url';
import mvp_worker from '@duckdb/duckdb-wasm/dist/duckdb-browser-mvp.worker.js?url';
import duckdb_wasm_eh from '@duckdb/duckdb-wasm/dist/duckdb-eh.wasm?url';
import duckdb_wasm from '@duckdb/duckdb-wasm/dist/duckdb-mvp.wasm?url';
import React, { useEffect, useState } from 'react';
import ReactGA from 'react-ga4';

import ApiInput from './components/ApiInput';
import ApiKeyInput from './components/ApiKeyInput';
import DuckDBComponent from './components/DuckDBComponent';
import JsonDisplay from './components/JsonDisplay';
import Sidebar from './components/Sidebar';

const GA4_MEASUREMENT_ID = process.env.REACT_APP_GA4_MEASUREMENT_ID;

if (GA4_MEASUREMENT_ID) {
  ReactGA.initialize(GA4_MEASUREMENT_ID);
} else {
  console.warn('GA4 Measurement ID not found. Analytics will not be tracked.');
}

const App: React.FC = () => {
  const [jsonData, setJsonData] = useState<any>(null);
  const [filteredData, setFilteredData] = useState<any>(null);
  const [apiHeader, setApiHeader] = useState({ name: 'X-API-KEY', value: '' });
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [db, setDB] = useState<duckdb.AsyncDuckDB | null>(null);
  const [conn, setConn] = useState<duckdb.AsyncDuckDBConnection | null>(null);

  useEffect(() => {
    if (GA4_MEASUREMENT_ID) {
      ReactGA.send({ hitType: 'pageview', page: '/home' });
    }

    const initializeDuckDB = async () => {
      try {
        const MANUAL_BUNDLES: duckdb.DuckDBBundles = {
          mvp: {
            mainModule: duckdb_wasm,
            mainWorker: mvp_worker,
          },
          eh: {
            mainModule: duckdb_wasm_eh,
            mainWorker: eh_worker,
          },
        };

        const bundle = await duckdb.selectBundle(MANUAL_BUNDLES);
        const worker = new Worker(bundle.mainWorker!);
        const logger = new duckdb.ConsoleLogger();
        const newDB = new duckdb.AsyncDuckDB(logger, worker);
        await newDB.instantiate(bundle.mainModule, bundle.pthreadWorker);
        setDB(newDB);

        const newConn = await newDB.connect();
        setConn(newConn);
      } catch (err) {
        console.error('Error initializing DuckDB:', err);
      }
    };

    initializeDuckDB();

    return () => {
      if (conn) {
        conn.close();
      }
    };
  }, []);

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
              {filteredData && db && conn && (
                <DuckDBComponent jsonData={filteredData} db={db} conn={conn} />
              )}
            </>
          )}
        </div>
      </div>
      <Sidebar isOpen={isSidebarOpen} onToggle={toggleSidebar} />
    </div>
  );
};

export default App;
