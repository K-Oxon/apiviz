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
  const [queryResult, setQueryResult] = useState<any[] | null>(null);
  const [error, setError] = useState<string>('');
  const [isDataLoaded, setIsDataLoaded] = useState<boolean>(false);
  const [sqlQuery, setSqlQuery] = useState<string>('SUMMARIZE json_data');
  const [loadSuccess, setLoadSuccess] = useState<boolean>(false);

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
      console.log('Loading JSON data:', jsonData);
      // Ensure the data is in row-major format
      const rowMajorData = Array.isArray(jsonData) ? jsonData : [jsonData];
      if (rowMajorData.length === 0) {
        throw new Error('JSON data is empty');
      }
      await db.registerFileText('data.json', JSON.stringify(rowMajorData));
      console.log('File registered successfully');
      // Create table and insert data
      await conn.insertJSONFromPath('data.json', { name: 'json_data', schema: 'main' });
      console.log('Data inserted successfully');
      setIsDataLoaded(true);
      setLoadSuccess(true);
      setError('');
    } catch (err) {
      console.error('Error in loadJSONData:', err);
      setError('Error loading JSON data: ' + (err as Error).message);
      setLoadSuccess(false);
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
      const arrowResult = await conn.query(sqlQuery);
      const result = arrowResult.toArray().map((row) => {
        const jsonRow: Record<string, any> = {};
        for (const [key, value] of Object.entries(row)) {
          jsonRow[key] = value instanceof BigInt ? value.toString() : value;
        }
        return jsonRow;
      });
      setQueryResult(result);
      setError('');
    } catch (err) {
      setError('Error executing query: ' + (err as Error).message);
      setQueryResult(null);
    }
  };

  const renderCellValue = (value: any) => {
    if (value === null || value === undefined) {
      return 'NULL';
    }
    if (typeof value === 'object') {
      return JSON.stringify(value);
    }
    return String(value);
  };

  return (
    <div className="mt-6">
      <h2 className="text-xl font-bold mb-4">DuckDB Operations</h2>
      {error && <p className="text-red-500 mb-4">{error}</p>}
      <div className="flex items-center mb-4">
        <button
          onClick={loadJSONData}
          className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500 mr-4"
        >
          Load Data into DuckDB
        </button>
        {loadSuccess && (
          <span className="text-green-600 font-semibold">Data loaded successfully!</span>
        )}
      </div>

      {isDataLoaded && (
        <>
          <div className="mt-4">
            <label htmlFor="sqlQuery" className="block text-sm font-medium text-gray-700 mb-1">
              SQL Query
            </label>
            <textarea
              id="sqlQuery"
              value={sqlQuery}
              onChange={(e) => setSqlQuery(e.target.value)}
              className="w-full px-3 py-2 text-gray-700 border rounded-lg focus:outline-none focus:border-blue-500"
              rows={4}
            />
          </div>

          <button
            onClick={executeQuery}
            className="mt-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            Execute Query
          </button>

          {queryResult && (
            <div className="mt-4">
              <h3 className="text-lg font-semibold mb-2">Query Result:</h3>
              <div className="overflow-x-auto">
                <table className="min-w-full bg-white border border-gray-300">
                  <thead>
                    <tr>
                      {Object.keys(queryResult[0] || {}).map((key, index) => (
                        <th key={index} className="py-2 px-4 border-b text-left">
                          {key}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {queryResult.map((row, rowIndex) => (
                      <tr key={rowIndex}>
                        {Object.values(row).map((value, cellIndex) => (
                          <td key={cellIndex} className="py-2 px-4 border-b">
                            {renderCellValue(value)}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default DuckDBComponent;
