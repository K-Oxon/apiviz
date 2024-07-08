# APIViz

APIViz is a tool for visualizing and analyzing API data using DuckDB-wasm. It allows users to fetch data from APIs, load it into a DuckDB instance running in the browser, and perform SQL queries on the data.

## 使用例

1. APIエンドポイントのURLと必要なヘッダーを入力します。
2. "Fetch Data"をクリックしてAPIからデータを取得します。
3. データを取得したら、テーブル名を入力し、"Load Data into DuckDB "をクリックします。
4. 指定されたテキストエリアにSQLクエリを記述します。
5. Execute Query "をクリックするか、キーボードショートカット（Macの場合はCmd+Enter、Windows/Linuxの場合はCtrl+Enter）を使用してクエリを実行します。
6. クエリ入力の下にある表に結果を表示します。

## 開発

```bash
npm i
npm run dev
```
