import type { PickerOption } from '../components/common/PickerSelect';

// Province to cities mapping for domestic cities
export const PROVINCES: Record<string, string[]> = {
  '北京': ['北京'],
  '上海': ['上海'],
  '天津': ['天津'],
  '重庆': ['重庆'],
  '广东': ['广州', '深圳', '珠海', '佛山'],
  '浙江': ['杭州', '宁波'],
  '江苏': ['南京', '苏州'],
  '四川': ['成都'],
  '湖北': ['武汉'],
  '湖南': ['长沙'],
  '陕西': ['西安'],
  '福建': ['厦门'],
  '山东': ['青岛'],
  '辽宁': ['大连'],
  '云南': ['昆明'],
  '河南': ['郑州'],
  '澳门': ['澳门'],
};

// English province/city names
export const PROVINCE_EN: Record<string, string> = {
  '北京': 'Beijing',
  '上海': 'Shanghai',
  '天津': 'Tianjin',
  '重庆': 'Chongqing',
  '广东': 'Guangdong',
  '浙江': 'Zhejiang',
  '江苏': 'Jiangsu',
  '四川': 'Sichuan',
  '湖北': 'Hubei',
  '湖南': 'Hunan',
  '陕西': 'Shaanxi',
  '福建': 'Fujian',
  '山东': 'Shandong',
  '辽宁': 'Liaoning',
  '云南': 'Yunnan',
  '河南': 'Henan',
  '澳门': 'Macau',
};

export const CITY_EN: Record<string, string> = {
  '北京': 'Beijing',
  '上海': 'Shanghai',
  '天津': 'Tianjin',
  '重庆': 'Chongqing',
  '广州': 'Guangzhou',
  '深圳': 'Shenzhen',
  '珠海': 'Zhuhai',
  '佛山': 'Foshan',
  '杭州': 'Hangzhou',
  '宁波': 'Ningbo',
  '南京': 'Nanjing',
  '苏州': 'Suzhou',
  '成都': 'Chengdu',
  '武汉': 'Wuhan',
  '长沙': 'Changsha',
  '西安': "Xi'an",
  '厦门': 'Xiamen',
  '青岛': 'Qingdao',
  '大连': 'Dalian',
  '昆明': 'Kunming',
  '郑州': 'Zhengzhou',
  '澳门': 'Macau',
  '东京': 'Tokyo',
  '大阪': 'Osaka',
  '首尔': 'Seoul',
  '曼谷': 'Bangkok',
  '新加坡': 'Singapore',
  '香港': 'Hong Kong',
  '台北': 'Taipei',
  '吉隆坡': 'Kuala Lumpur',
  '纽约': 'New York',
  '洛杉矶': 'Los Angeles',
  '伦敦': 'London',
  '巴黎': 'Paris',
  '悉尼': 'Sydney',
};

export const DOMESTIC_CITIES = Object.values(PROVINCES).flat();

export const INTERNATIONAL_CITIES = [
  '东京', '大阪', '首尔', '曼谷',
  '新加坡', '香港', '台北',
  '吉隆坡', '纽约', '洛杉矶',
  '伦敦', '巴黎', '悉尼',
];

function translateLabel(label: string, language: 'zh' | 'en'): string {
  if (language === 'en') {
    return CITY_EN[label] || label;
  }
  return label;
}

/**
 * Returns province options for the cascading picker.
 * Includes a "自行输入" option at the end.
 */
export function getProvinceOptions(language: 'zh' | 'en' = 'zh'): PickerOption[] {
  return [
    ...Object.keys(PROVINCES).map((p) => ({
      label: language === 'en' ? (PROVINCE_EN[p] || p) : p,
      value: p,
    })),
    {
      label: language === 'en' ? 'International' : '国际及港澳台',
      value: '__international__',
    },
    {
      label: language === 'en' ? 'Enter manually...' : '自行输入...',
      value: '__custom_province__',
    },
  ];
}

/**
 * Returns city options for the given province.
 * For "__international__", returns international cities.
 * For other provinces, returns cities in that province.
 */
export function getCitiesByProvince(
  province: string,
  language: 'zh' | 'en' = 'zh',
): PickerOption[] {
  if (province === '__international__') {
    const sectionLabel =
      language === 'en' ? '── International ──' : '── 国际及港澳台 ──';
    return [
      { label: sectionLabel, value: '__section_intl__', disabled: true },
      ...INTERNATIONAL_CITIES.map((c) => ({
        label: translateLabel(c, language),
        value: c,
      })),
    ];
  }
  const cities = PROVINCES[province];
  if (!cities) return [];
  return cities.map((c) => ({
    label: translateLabel(c, language),
    value: c,
  }));
}

// Legacy API - keep for backward compatibility
export function getCityPickerOptions(language: 'zh' | 'en' = 'zh'): PickerOption[] {
  const domesticLabel =
    language === 'en' ? '── Domestic ──' : '── 国内 ──';
  const internationalLabel =
    language === 'en' ? '── International ──' : '── 国际及港澳台 ──';
  const customLabel =
    language === 'en' ? 'Enter manually...' : '自行输入...';

  return [
    { label: domesticLabel, value: '__section_domestic__', disabled: true },
    ...DOMESTIC_CITIES.map((c) => ({
      label: translateLabel(c, language),
      value: c,
    })),
    {
      label: internationalLabel,
      value: '__section_international__',
      disabled: true,
    },
    ...INTERNATIONAL_CITIES.map((c) => ({
      label: translateLabel(c, language),
      value: c,
    })),
    { label: customLabel, value: '__custom_city__' },
  ];
}
