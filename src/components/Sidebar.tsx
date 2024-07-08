import React from 'react';

interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onToggle }) => {
  return (
    <div
      className={`fixed top-0 right-0 h-full bg-white shadow-lg transition-all duration-300 ${
        isOpen ? 'w-80' : 'w-0'
      }`}
    >
      <button
        onClick={onToggle}
        className="absolute top-4 left-0 transform -translate-x-full bg-white p-2 rounded-l-md shadow-md"
      >
        {isOpen ? '>>>' : '<<<'}
      </button>
      {isOpen && (
        <div className="p-4 h-full overflow-auto">
          <h2 className="text-2xl font-bold mb-4">使用方法</h2>
          <ol className="list-decimal list-inside space-y-2 text-sm">
            <li>
              APIエンドポイントのURLを入力します。APIキーなどが必要であればヘッダーに必要な項目を入力します。
            </li>
            <li>"Fetch"をクリックしてAPIからデータを取得します。</li>
            <li>
              データを取得したら、表示されたJSONを見ながら必要に応じてクエリを入力し、テーブルに格納したい場所までフィルターします。（配列になっている場所を推奨）
            </li>
            <li>テーブル名を入力し、"Load Data into DuckDB"をクリックします。</li>
            <li>指定されたテキストエリアにSQLクエリを記述します。</li>
            <li>
              "Execute Query"をクリックするか、Cmd+Enter (Mac) / Ctrl+Enter
              (Windows/Linux)を使用してクエリを実行します。
            </li>
            <li>クエリ入力の下にある表に結果を表示します。</li>
          </ol>
          <h2 className="text-2xl font-bold mt-4 mb-4">注意点</h2>
          <p className="text-sm">
            データはクライアント(ブラウザ上)で処理されます。データ量によっては重くなる可能性があります。またリロードによってデータはリセットされます。
          </p>
        </div>
      )}
    </div>
  );
};

export default Sidebar;
