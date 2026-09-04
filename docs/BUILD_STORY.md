# 构建故事：Grok Bot 双席 × Notion AI × AGY

> 日期：2026-09-04
> 可玩：https://two-minute-td.vercel.app
> 仓库：https://github.com/tizerluo/two-minute-td

## 一句话

Grok Bot 双席（幕僚长 + 研发）+ Notion AI（Fable）细排 + AGY 小块实现，一天做出可玩网页塔防并上线 Vercel。UI 丑，但流水线跑通了。

## 为什么记一笔

公开检索可见多 Agent / Antigravity / Grok Build 实践，但未见同款：Grok Bot 双席 + Notion AI Fable 当模型网关 + AGY 切片 → 可玩小游戏 + Vercel。

## 角色

- 用户：定需求、拍板、网页授权
- 幕僚长：转达、30 分钟巡检、代 push
- 研发：Fable 细排、拆块、调 AGY、验收
- Notion AI Fable：详细计划
- AGY：小块实现
- 部署：Vercel 上线与 Git 关联

## 当天产出

- M1：路径+箭塔+小兵+W1-W2（4b9d650）
- M2：炮塔溅射+冰塔减速+新敌人+W3-W6（5c3e719）
- 上线：https://two-minute-td.vercel.app
- master push 自动发版已就绪

## 流水线

用户 → 幕僚长 → 研发 → Fable 细排 → AGY 小块 → 验收 commit → 巡检代 push → Vercel。作业在飞时每 30 分钟巡检；收工暂停。

## 踩坑

1. agy 的 print 会吞下一个参数，要用 print=文件内容，超时放前面。
2. Auto-review 讨厌 heredoc；提示词写文件 + 显式工作目录。
3. 研发常 commit 不 push，幕僚长巡检代推成了粘合剂。
4. Vercel 关联 GitHub 需装 GitHub Vercel App 并授权。

## 诚实评价

成功：当天从零到可玩可分享。不够好看：HUD/美术几乎没打磨。人仍关键：授权与巡检代推说明完全无人值守还早。

---

由幕僚长在作业收工后整理。
