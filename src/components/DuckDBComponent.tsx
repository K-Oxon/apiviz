// src/components/DuckDBComponent.tsx
import * as duckdb from '@duckdb/duckdb-wasm';
import eh_worker from '@duckdb/duckdb-wasm/dist/duckdb-browser-eh.worker.js?url';
import mvp_worker from '@duckdb/duckdb-wasm/dist/duckdb-browser-mvp.worker.js?url';
import duckdb_wasm_eh from '@duckdb/duckdb-wasm/dist/duckdb-eh.wasm?url';
import duckdb_wasm from '@duckdb/duckdb-wasm/dist/duckdb-mvp.wasm?url';
import React, { useEffect, useState } from 'react';

interface DuckDBComponentProps {
  jsonData: any;
}

const DuckDBComponent: React.FC<DuckDBComponentProps> = ({ jsonData }) => {
  const [db, setDB] = useState<duckdb.AsyncDuckDB | null>(null);
  const [conn, setConn] = useState<duckdb.AsyncDuckDBConnection | null>(null);
  const [queryResult, setQueryResult] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [isDataLoaded, setIsDataLoaded] = useState<boolean>(false);

  useEffect(() => {
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
        setError('Error initializing DuckDB: ' + (err as Error).message);
      }
    };

    initializeDuckDB();

    return () => {
      // Cleanup
      if (conn) {
        conn.close();
      }
    };
  }, []);

  const loadJSONData = async () => {
    if (!db || !conn) {
      setError('Database not initialized');
      return;
    }

    try {
      // Ensure the data is in row-major format
      const rowMajorData = Array.isArray(jsonData) ? jsonData : [jsonData];
      if (rowMajorData.length === 0) {
        throw new Error('JSON data is empty');
      }

      console.log('Processed JSON data:', rowMajorData);

      await db.registerFileText('data.json', JSON.stringify(rowMajorData));
      console.log('File registered successfully');

      // Create table and insert data
      await conn.insertJSONFromPath('data.json', { name: 'json_data', schema: 'main' });
      setIsDataLoaded(true);
      setQueryResult('Data loaded successfully');
    } catch (err) {
      setError('Error loading JSON data: ' + (err as Error).message);
    }
  };

  const executeQuery = async () => {
    if (!conn) {
      setError('Database connection not established');
      return;
    }

    if (!isDataLoaded) {
      setError('Please load the data first');
      return;
    }

    try {
      const result = await conn.query(`SELECT * FROM json_data LIMIT 10`);
      setQueryResult(JSON.stringify(result, null, 2));
    } catch (err) {
      setError('Error executing query: ' + (err as Error).message);
    }
  };

  return (
    <div className="mt-6">
      <h2 className="text-xl font-bold mb-4">DuckDB Operations</h2>
      {error && <p className="text-red-500 mb-4">{error}</p>}
      <button
        onClick={loadJSONData}
        className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500 mr-4"
      >
        Load Data into DuckDB
      </button>
      <button
        onClick={executeQuery}
        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
        disabled={!isDataLoaded}
      >
        Execute Sample Query
      </button>
      {queryResult && (
        <div className="mt-4">
          <h3 className="text-lg font-semibold mb-2">Query Result:</h3>
          <pre className="bg-gray-100 p-4 rounded-md overflow-auto max-h-96">{queryResult}</pre>
        </div>
      )}
    </div>
  );
};

export default DuckDBComponent;
