# 两分钟塔防 · 执行摘要（收紧版）

来源：Fable 5 细排后按硬约束收紧（≤3 塔、少量敌人、约 2 分钟一局）。

## 定位
单路网页塔防；约 120s 一局；纯前端；本地可开，可上 Vercel。

## 技术选型
Vite + TypeScript + Canvas 2D（HUD 用 DOM）。无后端；数值进 src/data。

## 目录结构
two-minute-td/ package.json index.html vite.config.ts src/{main.ts,game/{loop,map,entity,combat,waves,economy}.ts,data/{towers,enemies,waves}.ts,render/canvas.ts,ui/{hud,buildBar,result}.ts,styles.css} public/

## 范围
- 1 条 S 形路径（约 12x7 格）
- 3 塔：箭塔(50/10伤/1.0s/2.5格)、炮塔(80/22/0.5s/溅射)、冰塔(60/4/1.0s/减速40%)
- 3 敌：小兵(30HP)、疾行者(18HP 高速)、重甲(130HP 物理-30%)
- 6 波；初始金120 生命10；清完W6胜 / 生命0败
- 不做：第4塔、飞行单位、多地图、科技树；首版塔仅1级

## 首个可玩里程碑 M1
路径渲染 + 放箭塔 + 小兵走路 + 能打死 + 漏怪扣命 + W1-W2 胜负。

## 前5个 AGY 小块
1. Vite+TS 脚手架，build 通过
2. 地图网格+S路径绘制
3. 敌人沿路径+生命
4. 箭塔放置射击+金币
5. 波次W1-W2+胜负重开 → 达 M1

## 仓库
新建公开仓 tizerluo/two-minute-td
