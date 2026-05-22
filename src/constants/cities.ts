import type { PickerOption } from '../components/common/PickerSelect';

export const DOMESTIC_CITIES = [
  '北京', '上海', '广州', '深圳',
  '成都', '杭州', '武汉', '南京',
  '重庆', '长沙', '天津', '西安',
  '苏州', '厦门', '青岛', '大连',
  '昆明', '郑州', '沈阳', '宁波',
  '珠海', '佛山', '澳门',
];

export const INTERNATIONAL_CITIES = [
  '东京', '大阪', '首尔', '曼谷',
  '新加坡', '香港', '台北',
  '吉隆坡', '纽约', '洛杉矶',
  '伦敦', '巴黎', '悉尼',
];

/**
 * Returns picker options grouped by domestic/international,
 * plus a "自行输入" option at the end.
 */
export function getCityPickerOptions(): PickerOption[] {
  return [
    { label: '── 国内 ──', value: '__section_domestic__', disabled: true },
    ...DOMESTIC_CITIES.map((c) => ({ label: c, value: c })),
    { label: '── 国际及港澳台 ──', value: '__section_international__', disabled: true },
    ...INTERNATIONAL_CITIES.map((c) => ({ label: c, value: c })),
    { label: '自行输入...', value: '__custom_city__' },
  ];
}
