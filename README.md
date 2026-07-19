---
title: 高铁旅行规划
emoji: 🚄
colorFrom: blue
colorTo: green
sdk: docker
pinned: false
---

# 高铁旅行规划系统

基于高铁出行的智能旅行规划平台，提供票务查询、行程规划、AI推荐等功能。

## 技术栈
- 前端：React 18 + Ant Design 5 + Vite
- 后端：Python 3.11 + FastAPI
- 部署：Docker + Hugging Face Spaces

## 本地开发
```bash
# 后端
cd backend
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000

# 前端
npm install
npm run dev
```
