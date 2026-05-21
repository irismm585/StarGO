export const SCALPER_KEYWORDS: string[] = [
  'selling',
  'selling ticket',
  'buying ticket',
  'ticket transfer',
  'resale',
  'scalp',
  'above face value',
  'markup',
  'dm me',
  'paypal',
  'venmo',
  'cash app',
  'wire transfer',
  'extra ticket',
  'ticket for sale',
  'selling my ticket',
  'face value',
  'negotiate',
  'best offer',
  'ticketmaster transfer',
  'pdf ticket',
  'screenshot ticket',
  '转票',
  '出票',
  '转让',
  '加价',
  '黄牛',
  '溢价',
  '私信',
  '联系我',
  '微信',
  '支付宝',
];

export function checkForScalping(content: string): {
  isBlocked: boolean;
  matchedKeywords: string[];
  sanitizedContent: string;
} {
  const lower = content.toLowerCase();
  const matched = SCALPER_KEYWORDS.filter((kw) => lower.includes(kw));
  if (matched.length > 0) {
    return {
      isBlocked: true,
      matchedKeywords: matched,
      sanitizedContent:
        '[该消息因可能包含违规内容已被屏蔽]',
    };
  }
  return {
    isBlocked: false,
    matchedKeywords: [],
    sanitizedContent: content,
  };
}
