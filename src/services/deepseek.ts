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

const ITINERARY_BILINGUAL_SYSTEM_PROMPT = `你是专业的「演出/赛事行程规划师」，擅长演唱会、音乐节、体育赛事的跨城行程。
严格按 JSON 输出，不要任何解释、不要 markdown、不要多余文字。

输入：用户的出行需求（出发城市、目的地城市、演出日期、出行日期、预算、交通偏好、住宿要求、美食偏好）
注意：演唱会日期可能和用户的抵达/离开日期不同。请确保演唱会当天的行程空出足够时间给演出，并在演出前安排进场时间。

请同时输出中文和英文两个版本。输出结构：
{
  "zh": {
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
  },
  "en": {
    "overview": "Trip overview (1 sentence, including number of days and key activities)",
    "days": [
      {
        "day": "Day X",
        "date": "YYYY-MM-DD",
        "schedule": [
          {
            "time": "HH:MM",
            "activity": "Activity name",
            "location": "Location",
            "details": "Details",
            "tips": "Tips"
          }
        ]
      }
    ],
    "transport": {
      "to": "Departure transport recommendation",
      "local": "Local transport",
      "back": "Return transport recommendation"
    },
    "hotel": [{"name":"","address":"","price":"","reason":""}],
    "food": [{"name":"","address":"","recommendation":""}],
    "venueTips": ["Venue tips"],
    "budget": {"total":"","breakdown":{}},
    "notes": ["Important reminders"]
  }
}`;

export async function generateItinerary(
  params: ItineraryGenerationParams,
  _language?: 'zh' | 'en',
  signal?: AbortSignal,
): Promise<{ zh: Itinerary; en: Itinerary }> {
  const userPrompt = `请为以下演出行程生成完整规划（中英文双语）：
- 演出名称：${params.eventName}
- 场馆：${params.venueName}
- 出发城市：${params.departureCity}
- 目的地城市：${params.city}
- 演出日期：${params.eventDate}
- 出行日期：${params.startDate} 至 ${params.endDate}
- 预算：${params.budget}元
- 交通偏好：${params.transportPref}
- 住宿要求：${params.hotelPref}
- 美食偏好：${params.foodPref}

Please generate a complete bilingual (Chinese & English) trip plan for the following event:
- Event: ${params.eventName}
- Venue: ${params.venueName}
- Departure city: ${params.departureCity}
- Destination city: ${params.city}
- Event date: ${params.eventDate}
- Travel dates: ${params.startDate} to ${params.endDate}
- Budget: ${params.budget} CNY
- Transport preference: ${params.transportPref}
- Hotel requirement: ${params.hotelPref}
- Food preference: ${params.foodPref}`;

  const raw = await createChatCompletion(
    [
      { role: 'system', content: ITINERARY_BILINGUAL_SYSTEM_PROMPT },
      { role: 'user', content: userPrompt },
    ],
    { signal },
  );

  const sanitized = raw.replace(/#"/g, '"');

  try {
    const parsed = JSON.parse(sanitized) as { zh: Itinerary; en: Itinerary };
    if (!parsed.zh || !parsed.en) {
      throw new DeepSeekError('Missing zh or en in bilingual itinerary response');
    }
    return parsed;
  } catch (e) {
    if (e instanceof DeepSeekError) throw e;
    throw new DeepSeekError(`Failed to parse itinerary JSON: ${(e as Error).message}. Raw: ${raw.slice(0, 200)}`);
  }
}

const MEMORIAL_BILINGUAL_SYSTEM_PROMPT = `你是 StarGo 的创意文案助手，专为演唱会、音乐节、体育赛事观众生成朋友圈/社交媒体文案。
以粉丝口吻写作，年轻、热情、有感染力。
严格按 JSON 输出，不要任何解释、不要 markdown、不要多余文字。

请同时输出中文和英文两个版本。输出结构：
{
  "zh": {
    "captions": {
      "short": "短文案（1-2句，适合朋友圈/Instagram，不超过150字）",
      "medium": "中长文（一段话，适合微博/小红书，不超过500字）",
      "long": "长故事（详细记录，适合公众号/备忘录，不超过1500字）"
    },
    "hashtags": ["标签1", "标签2", "标签3"],
    "suggestedPosts": [
      {
        "platform": "instagram|twitter|tiktok|facebook",
        "content": "针对该平台的优化内容"
      }
    ]
  },
  "en": {
    "captions": {
      "short": "Short caption (1-2 sentences, for Instagram/WeChat Moments, max 150 chars)",
      "medium": "Medium-length post (for Twitter/Weibo/Xiaohongshu, max 500 chars)",
      "long": "Long story (detailed, for blog/memo, max 1500 chars)"
    },
    "hashtags": ["tag1", "tag2", "tag3"],
    "suggestedPosts": [
      {
        "platform": "instagram|twitter|tiktok|facebook",
        "content": "Platform-optimized content in English"
      }
    ]
  }
}`;

export async function generateMemorialContent(
  params: MemorialGenerationParams,
  signal?: AbortSignal,
): Promise<{ zh: MemorialContent; en: MemorialContent }> {
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
      { role: 'system', content: MEMORIAL_BILINGUAL_SYSTEM_PROMPT },
      { role: 'user', content: userPrompt },
    ],
    { signal },
  );

  // Remove bare # before strings that breaks JSON (model often adds # to hashtags)
  const sanitized = raw.replace(/#"/g, '"');

  try {
    const parsed = JSON.parse(sanitized) as { zh: MemorialContent; en: MemorialContent };
    if (!parsed.zh || !parsed.en) {
      throw new DeepSeekError('Missing zh or en in bilingual memorial response');
    }
    return {
      zh: {
        ...parsed.zh,
        eventName: params.eventName,
        template: params.template,
      },
      en: {
        ...parsed.en,
        eventName: params.eventName,
        template: params.template,
      },
    };
  } catch (e) {
    if (e instanceof DeepSeekError) throw e;
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
