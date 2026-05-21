import { config } from '../config';
import type { Itinerary, ItineraryGenerationParams } from '../types/itinerary';
import type { MemorialContent, MemorialGenerationParams } from '../types/memorial';

export class DeepSeekError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'DeepSeekError';
  }
}

export class DeepSeekApiError extends DeepSeekError {
  status: number;
  body: string;
  constructor(status: number, body: string) {
    super(`DeepSeek API error ${status}: ${body}`);
    this.name = 'DeepSeekApiError';
    this.status = status;
    this.body = body;
  }
}

interface DeepSeekMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

interface DeepSeekOptions {
  temperature?: number;
  max_tokens?: number;
  signal?: AbortSignal;
}

async function createChatCompletion(
  messages: DeepSeekMessage[],
  options: DeepSeekOptions = {},
): Promise<string> {
  const { apiKey, baseUrl, model, defaultTemperature, maxTokens } = config.deepseek;

  if (!apiKey) {
    throw new DeepSeekError('DeepSeek API key not configured. Set DEEPSEEK_API_KEY in .env');
  }

  const response = await fetch(`${baseUrl}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      messages,
      temperature: options.temperature ?? defaultTemperature,
      max_tokens: options.max_tokens ?? maxTokens,
      response_format: { type: 'json_object' },
    }),
    signal: options.signal,
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new DeepSeekApiError(response.status, errorBody);
  }

  const data = await response.json();
  const content = data.choices?.[0]?.message?.content;
  if (!content) {
    throw new DeepSeekError('Empty response from DeepSeek API');
  }
  return content;
}

const ITINERARY_SYSTEM_PROMPT = `你是专业的「演出/赛事行程规划师」，擅长演唱会、音乐节、体育赛事的跨城行程。
严格按 JSON 输出，不要任何解释、不要 markdown、不要多余文字。

输入：用户的出行需求（城市、日期、演出名称、预算、交通偏好、住宿要求、美食偏好）
输出结构：
{
  "overview": "行程总览（1句话，含天数、核心安排）",
  "days": [
    {
      "day": "第X天",
      "date": "YYYY-MM-DD",
      "schedule": [
        {
          "time": "HH:MM",
          "activity": "活动名称",
          "location": "地点",
          "details": "详情",
          "tips": "小贴士"
        }
      ]
    }
  ],
  "transport": {
    "to": "去程交通推荐",
    "local": "当地交通",
    "back": "返程交通推荐"
  },
  "hotel": [{"name":"","address":"","price":"","reason":""}],
  "food": [{"name":"","address":"","recommendation":""}],
  "venueTips": ["演出场馆注意事项"],
  "budget": {"total":"","breakdown":{}},
  "notes": ["重要提醒"]
}`;

export async function generateItinerary(
  params: ItineraryGenerationParams,
  signal?: AbortSignal,
): Promise<Itinerary> {
  const userPrompt = `请为以下演出行程生成完整规划：
- 演出名称：${params.eventName}
- 场馆：${params.venueName}
- 城市：${params.city}
- 日期：${params.startDate} 至 ${params.endDate}
- 预算：${params.budget}元
- 交通偏好：${params.transportPref}
- 住宿要求：${params.hotelPref}
- 美食偏好：${params.foodPref}`;

  const raw = await createChatCompletion(
    [
      { role: 'system', content: ITINERARY_SYSTEM_PROMPT },
      { role: 'user', content: userPrompt },
    ],
    { signal },
  );

  try {
    const parsed = JSON.parse(raw) as Itinerary;
    return parsed;
  } catch (e) {
    throw new DeepSeekError(`Failed to parse itinerary JSON: ${(e as Error).message}. Raw: ${raw.slice(0, 200)}`);
  }
}

const MEMORIAL_SYSTEM_PROMPT = `你是 StarGo 的创意文案助手，专为演唱会、音乐节、体育赛事观众生成朋友圈/社交媒体文案。
以粉丝口吻写作，年轻、热情、有感染力。
严格按 JSON 输出，不要任何解释、不要 markdown、不要多余文字。

输出结构：
{
  "captions": {
    "short": "短文案（1-2句，适合朋友圈/Instagram，不超过150字）",
    "medium": "中长文（一段话，适合微博/小红书，不超过500字）",
    "long": "长故事（详细记录，适合公众号/备忘录，不超过1500字）"
  },
  "hashtags": ["#相关话题标签", "5-10个"],
  "suggestedPosts": [
    {
      "platform": "instagram|twitter|tiktok|facebook",
      "content": "针对该平台的优化内容"
    }
  ]
}`;

export async function generateMemorialContent(
  params: MemorialGenerationParams,
  signal?: AbortSignal,
): Promise<MemorialContent> {
  const userPrompt = `请为以下演出生成纪念内容：
- 演出：${params.eventName}
- 艺人：${params.artistName || '未知'}
- 场馆：${params.venueName}
- 城市：${params.city}
- 日期：${params.date}
- 模板：${params.template}
- 心情：${params.mood || '兴奋'}
- 个人亮点：${params.personalHighlights || '无'}`;

  const raw = await createChatCompletion(
    [
      { role: 'system', content: MEMORIAL_SYSTEM_PROMPT },
      { role: 'user', content: userPrompt },
    ],
    { signal },
  );

  try {
    const parsed = JSON.parse(raw) as MemorialContent;
    return {
      ...parsed,
      eventName: params.eventName,
      template: params.template,
    };
  } catch (e) {
    throw new DeepSeekError(`Failed to parse memorial JSON: ${(e as Error).message}`);
  }
}

const ASSISTANT_SYSTEM_PROMPT = `你是 StarGo AI 助手，在粉丝聊天室中为用户提供帮助。你可以：
- 回答演出信息和场馆问题
- 推荐当地美食和交通
- 提供演出相关旅行建议
- 帮助协调粉丝聚会

保持热情、友好的语气，回答简洁（200字以内）。不要涉及票务交易。`;

export async function chatWithAssistant(
  messages: { role: 'user' | 'assistant'; content: string }[],
  signal?: AbortSignal,
): Promise<string> {
  return createChatCompletion(
    [{ role: 'system', content: ASSISTANT_SYSTEM_PROMPT }, ...messages],
    { signal, max_tokens: 1024 },
  );
}
