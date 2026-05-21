# StarGo 🎤✨

> AI 驱动的演出旅行规划 App — 让每一场演出都成为完美的旅程。

StarGo 是一款面向 Gen Z 和年轻粉丝群体的跨平台演出旅行 App，利用 DeepSeek AI 提供智能行程规划、粉丝社区和纪念内容生成。

## 核心功能

### 1. 🗺️ AI 智能行程规划（最高优先级）
- 自然语言输入出行需求（演出名称、场馆、城市、日期、预算、偏好）
- 调用 DeepSeek API 生成结构化 JSON 行程
- 输出内容：每日时间线、交通推荐、住宿推荐、美食推荐、场馆贴士、预算分配
- 保存、查看、管理历史行程

### 2. 💬 粉丝专属聊天室
- 按艺人/场馆/演出分组的粉丝群组
- 官方认证标识（Verified Badge）
- 反黄牛关键词过滤 + 实时警告
- 聊天内快捷调用 AI 行程规划

### 3. ✨ AI 纪念内容生成
- DeepSeek 驱动文案生成（短/中/长三种格式）
- 多种模板：演唱会回顾、音乐节日记、粉丝告白、见面会故事等
- 一键复制、分享、保存

## 技术栈

| 层 | 技术 |
|---|------|
| 框架 | React Native (Expo managed workflow) |
| 语言 | TypeScript |
| AI | DeepSeek API (`deepseek-v4-flash`) |
| 导航 | React Navigation 7 (Native Stack + Bottom Tabs) |
| 动画 | React Native Reanimated + Gesture Handler |
| 存储 | AsyncStorage + SecureStore |
| UI | expo-linear-gradient (渐变), expo-clipboard (剪贴板), expo-haptics (触感) |

## 项目结构

```
StarGo_app/
├── App.tsx                          # 入口：Provider → Navigator
├── src/
│   ├── types/                       # TypeScript 类型定义
│   │   ├── env.d.ts                 # @env 模块声明
│   │   ├── user.ts                  # 用户/认证
│   │   ├── itinerary.ts             # 行程 JSON 模型
│   │   ├── chat.ts                  # 聊天室/消息
│   │   └── memorial.ts              # 纪念内容
│   ├── config/index.ts              # DeepSeek 配置 + Storage Key
│   ├── constants/
│   │   ├── colors.ts                # 紫粉渐变主题色
│   │   ├── layout.ts                # 间距/圆角/字号/阴影
│   │   └── keywords.ts              # 反黄牛关键词过滤
│   ├── utils/
│   │   ├── validation.ts            # 表单验证
│   │   └── formatters.ts            # 日期/货币/数字格式化
│   ├── services/
│   │   ├── storage.ts               # AsyncStorage 封装
│   │   ├── deepseek.ts              # DeepSeek API 核心客户端
│   │   ├── auth.ts                  # 认证（模拟）
│   │   ├── itinerary.ts             # 行程生成 + CRUD
│   │   ├── chat.ts                  # 聊天室 + 关键词过滤
│   │   └── memorial.ts              # 纪念内容生成 + CRUD
│   ├── contexts/
│   │   ├── AuthContext.tsx           # 登录状态管理
│   │   └── ThemeContext.tsx          # 主题切换
│   ├── navigation/
│   │   ├── RootNavigator.tsx        # 根导航（认证门控）
│   │   ├── AuthStack.tsx            # 登录/注册栈
│   │   ├── MainTabs.tsx             # 底部 Tab 导航
│   │   ├── HomeStack.tsx / ItineraryStack.tsx / ChatStack.tsx / MemorialStack.tsx / ProfileStack.tsx
│   ├── screens/
│   │   ├── auth/                    # LoginScreen, RegisterScreen
│   │   ├── home/                    # HomeScreen
│   │   ├── itinerary/               # ItineraryCreateScreen, ItineraryListScreen, ItineraryDetailScreen
│   │   ├── chat/                    # ChatRoomListScreen, ChatRoomScreen
│   │   ├── memorial/                # MemorialGeneratorScreen, MemorialPreviewScreen
│   │   └── profile/                 # ProfileScreen, SettingsScreen
│   └── components/
│       ├── common/                  # Button, Input, Card, Header, LoadingSpinner, ErrorState, EmptyState
│       ├── itinerary/               # ItineraryCard, ItineraryTimeline, BudgetBreakdown
│       ├── chat/                    # ChatBubble, ChatInput, KeywordAlert
│       └── memorial/                # TemplateSelector, ContentPreview
```

## 快速开始

### 前置要求

- Node.js >= 18
- Expo CLI
- DeepSeek API Key（[platform.deepseek.com](https://platform.deepseek.com)）

### 安装

```bash
# 1. 克隆项目
cd StarGo_app

# 2. 安装依赖
npm install

# 3. 配置环境变量
cp .env.example .env
# 编辑 .env，填入你的 DeepSeek API Key

# 4. 启动
npx expo start
```

### 环境变量

| 变量 | 说明 | 默认值 |
|------|------|--------|
| `DEEPSEEK_API_KEY` | DeepSeek API Key | （必填） |
| `DEEPSEEK_BASE_URL` | API 基础地址 | `https://api.deepseek.com/v1` |
| `DEEPSEEK_MODEL` | 模型名称 | `deepseek-v4-flash` |

## DeepSeek API 配置

StarGo 使用 DeepSeek API 进行所有 AI 功能：

- **端点**: `POST /chat/completions`
- **模型**: `deepseek-v4-flash`（284B 总参数 / 13B 激活，MoE 架构）
- **认证**: Bearer Token
- **JSON 模式**: `response_format: { type: "json_object" }`
- **流式**: 支持 SSE（当前版本暂未使用）

### 行程规划 Prompt 设计

系统提示词要求 DeepSeek 以 JSON 格式输出完整的行程规划，包含：
- 行程总览
- 每日时间线（含时间、活动、地点、详情、小贴士）
- 交通推荐（去程/当地/返程）
- 住宿推荐
- 美食推荐
- 场馆贴士
- 预算分配
- 重要提醒

## 设计语言

- **主题色**: 紫色 `#7C3AED` → 粉色 `#EC4899` 渐变
- **卡片风格**: 圆角大（16-24px），毛玻璃效果，柔和阴影
- **动效**: 按钮按压缩放、加载骨架屏、列表入场动画
- **目标用户**: Gen Z（18-25）/ 年轻白领（26-35）

## 开发说明

- 当前版本使用模拟后端（AsyncStorage 持久化 + 模拟认证）
- 聊天室为本地消息，生产环境需接入 WebSocket 后端
- DeepSeek API Key 应通过后端代理保护，避免暴露在客户端
