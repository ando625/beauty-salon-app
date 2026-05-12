# frontend/Dockerfile
# Next.jsをDockerで動かすための設計書

FROM node:20-alpine
# ↑ backendと同じNode.js 20を使う

WORKDIR /app
# ↑「/appフォルダで作業してね」

COPY package*.json ./
# ↑ package.jsonを先にコピー（キャッシュ効率化のため）

RUN npm install
# ↑ ライブラリをインストール

COPY . .
# ↑ 残りのファイルを全部コピー

EXPOSE 3000
# ↑「このコンテナは3000番ポートを使いますよ」
# Next.jsはデフォルトで3000番

CMD ["npm", "run", "dev"]
# ↑「開発モードで起動して」