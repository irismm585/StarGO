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

export const DOMESTIC_CITIES = Object.values(PROVINCES).flat();

export const INTERNATIONAL_CITIES = [
  '东京', '大阪', '首尔', '曼谷',
  '新加坡', '香港', '台北',
  '吉隆坡', '纽约', '洛杉矶',
  '伦敦', '巴黎', '悉尼',
];

/**
 * Returns province options for the cascading picker.
 * Includes a "自行输入" option at the end.
 */
export function getProvinceOptions(): PickerOption[] {
  return [
    ...Object.keys(PROVINCES).map((p) => ({ label: p, value: p })),
    { label: '国际及港澳台', value: '__international__' },
    { label: '自行输入...', value: '__custom_province__' },
  ];
}

/**
 * Returns city options for the given province.
 * For "__international__", returns international cities.
 * For other provinces, returns cities in that province.
 */
export function getCitiesByProvince(province: string): PickerOption[] {
  if (province === '__international__') {
    return [
      { label: '── 国际及港澳台 ──', value: '__section_intl__', disabled: true },
      ...INTERNATIONAL_CITIES.map((c) => ({ label: c, value: c })),
    ];
  }
  const cities = PROVINCES[province];
  if (!cities) return [];
  return cities.map((c) => ({ label: c, value: c }));
}

// Legacy API - keep for backward compatibility
export function getCityPickerOptions(): PickerOption[] {
  return [
    { label: '── 国内 ──', value: '__section_domestic__', disabled: true },
    ...DOMESTIC_CITIES.map((c) => ({ label: c, value: c })),
    { label: '── 国际及港澳台 ──', value: '__section_international__', disabled: true },
    ...INTERNATIONAL_CITIES.map((c) => ({ label: c, value: c })),
    { label: '自行输入...', value: '__custom_city__' },
  ];
}
