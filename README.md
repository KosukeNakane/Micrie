# Micrie
音声録音・波形表示・リアルタイムビジュアライズを備えた録音アプリです。  
React + TypeScript + Python (Flask) を使用して構築されています。

## 技術スタック
- Frontend: React / TypeScript / Vite
- UI構成: Chakra UI（または任意）
- Audio API: Web Audio API / AudioContext
- Visualization: HTML Canvas / AnalyserNode
- Backend: Python / Flask
- パッケージ管理: npm

## 主な機能
- マイク入力を録音
- 波形をリアルタイムで表示
- 録音データの再生
- 一部ボタンやUI要素は再利用可能なコンポーネント構成で設計

## 起動方法（ローカル開発）
### フロントエンド
```bash
cd client
npm install
npm run dev
```
### バックエンド
```bash
cd server
python app.py
```
