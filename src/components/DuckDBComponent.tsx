import * as duckdb from '@duckdb/duckdb-wasm';
import React, { useState } from 'react';

interface DuckDBComponentProps {
  jsonData: any;
  db: duckdb.AsyncDuckDB | null;
  conn: duckdb.AsyncDuckDBConnection | null;
}

const DuckDBComponent: React.FC<DuckDBComponentProps> = ({ jsonData, db, conn }) => {
  const [queryResult, setQueryResult] = useState<any[] | null>(null);
  const [error, setError] = useState<string>('');
  const [isDataLoaded, setIsDataLoaded] = useState<boolean>(false);
  const [sqlQuery, setSqlQuery] = useState<string>('SUMMARIZE json_data');
  const [loadSuccess, setLoadSuccess] = useState<boolean>(false);
  const [tableName, setTableName] = useState<string>('');
  const [tableNameError, setTableNameError] = useState<string>('');

  const validateTableName = (name: string): boolean => {
    const regex = /^[a-zA-Z_][a-zA-Z0-9_]*$/;
    return regex.test(name);
  };

  const handleTableNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTableName = e.target.value;
    setTableName(newTableName);
    if (newTableName && !validateTableName(newTableName)) {
      setTableNameError(
        'Invalid table name. Use only letters, numbers, and underscores. Must start with a letter or underscore.'
      );
    } else {
      setTableNameError('');
    }
  };

  const loadJSONData = async () => {
    if (!db || !conn) {
      setError('Database not initialized');
      return;
    }
    if (!validateTableName(tableName)) {
      setError('Invalid table name');
      return;
    }

    try {
      console.log('Loading JSON data:', jsonData);
      // Ensure the data is in row-major format
      // const rowMajorData = Array.isArray(jsonData) ? jsonData : [jsonData];
      if (jsonData.length === 0) {
        throw new Error('JSON data is empty');
      }
      await db.registerFileText('data.json', JSON.stringify(jsonData));
      console.log('File registered successfully');
      // Create table and insert data
      await conn.insertJSONFromPath('data.json', { name: tableName, schema: 'main' });
      console.log('Data inserted successfully into table:', tableName);

      setIsDataLoaded(true);
      setLoadSuccess(true);
      setSqlQuery(`SUMMARIZE ${tableName}`);
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

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
      e.preventDefault();
      executeQuery();
    }
  };

  return (
    <div className="mt-6">
      <h2 className="text-xl font-bold mb-4">DuckDB Operations</h2>
      {error && <p className="text-red-500 mb-4">{error}</p>}
      <div className="mb-4">
        <label htmlFor="tableName" className="block text-sm font-medium text-gray-700 mb-1">
          Table Name
        </label>
        <div className="flex items-center">
          <input
            id="tableName"
            type="text"
            value={tableName}
            onChange={handleTableNameChange}
            placeholder="json_data"
            className="px-3 py-2 border rounded-l-md focus:outline-none focus:ring-2 focus:ring-blue-500 flex-grow"
          />
          <button
            onClick={loadJSONData}
            disabled={!validateTableName(tableName) || tableName === ''}
            className={`px-4 py-2 text-white rounded-r-md focus:outline-none focus:ring-2 focus:ring-green-500 ${
              validateTableName(tableName) && tableName !== ''
                ? 'bg-green-500 hover:bg-green-600'
                : 'bg-gray-400 cursor-not-allowed'
            }`}
          >
            Load Data into DuckDB
          </button>
        </div>
        {tableNameError && <p className="text-red-500 text-sm mt-1">{tableNameError}</p>}
      </div>
      {loadSuccess && (
        <p className="text-green-600 font-semibold mb-4">Data loaded successfully!</p>
      )}
      {/* </div> */}

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
              className="w-full px-3 py-2 text-gray-700 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={4}
              onKeyDown={handleKeyDown}
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
