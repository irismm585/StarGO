import { storage } from './storage';
import { secureStorage } from '../utils/secureStorage';
import { STORAGE_KEYS } from '../config';
import type { User, LoginCredentials, RegisterData } from '../types/user';

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function createMockUser(data: RegisterData): User {
  return {
    id: generateId(),
    username: data.username,
    email: data.email,
    displayName: data.displayName,
    avatarUrl: undefined,
    bio: '',
    isVerified: false,
    favoriteArtists: [],
    createdAt: new Date().toISOString(),
  };
}

export async function loginWithEmail(credentials: LoginCredentials): Promise<User> {
  // Simulated login — checks if user exists in storage
  const users = (await storage.get<Record<string, User>>('stargo_users')) || {};

  const foundUser = Object.values(users).find(
    (u) => u.email === credentials.email,
  );

  if (!foundUser) {
    throw new Error('邮箱或密码不正确');
  }

  // In a real app, verify password hash — here we just check it exists
  await secureStorage.setItemAsync(STORAGE_KEYS.AUTH_TOKEN, `mock-token-${foundUser.id}`);
  await storage.set(STORAGE_KEYS.USER_DATA, foundUser);

  return foundUser;
}

export async function registerWithEmail(data: RegisterData): Promise<User> {
  const users = (await storage.get<Record<string, User>>('stargo_users')) || {};

  const exists = Object.values(users).some((u) => u.email === data.email);
  if (exists) {
    throw new Error('该邮箱已被注册');
  }

  const newUser = createMockUser(data);
  users[newUser.id] = newUser;

  await storage.set('stargo_users', users);
  await secureStorage.setItemAsync(STORAGE_KEYS.AUTH_TOKEN, `mock-token-${newUser.id}`);
  await storage.set(STORAGE_KEYS.USER_DATA, newUser);

  return newUser;
}

export async function logout(): Promise<void> {
  await secureStorage.deleteItemAsync(STORAGE_KEYS.AUTH_TOKEN);
  await storage.remove(STORAGE_KEYS.USER_DATA);
}

const TEST_USER_EMAIL = 'test@stargo.com';
const TEST_USER_PASSWORD = 'test123';

export async function seedTestUser(): Promise<void> {
  const users = (await storage.get<Record<string, User>>('stargo_users')) || {};
  const exists = Object.values(users).some((u) => u.email === TEST_USER_EMAIL);
  if (!exists) {
    const testUser: User = {
      id: 'test-user-id',
      username: 'StarGo测试用户',
      email: TEST_USER_EMAIL,
      displayName: 'StarGo 测试用户',
      bio: '热爱演出的测试用户 🎵',
      isVerified: true,
      favoriteArtists: ['Taylor Swift', '周杰伦', 'Coldplay', '林俊杰'],
      createdAt: '2025-01-01T00:00:00Z',
    };
    users[testUser.id] = testUser;
    await storage.set('stargo_users', users);
  }

  // Also seed some test itineraries for the test user
  // so the home screen and itinerary list have content
  const existingItins = await storage.get<any[]>('stargo_itineraries');
  if (!existingItins || existingItins.length === 0) {
    const mockItineraries = [
      {
        id: 'mock-itin-1',
        userId: 'test-user-id',
        title: 'Taylor Swift Eras Tour · 东京',
        eventName: 'Taylor Swift Eras Tour',
        city: '东京',
        venueName: '东京巨蛋',
        startDate: '2025-08-15',
        endDate: '2025-08-17',
        itineraryData: {
          overview: '为期3天的东京观演之旅，包含Taylor Swift演唱会、东京美食和城市观光，总预算约5000元。',
          days: [
            {
              day: '第1天',
              date: '2025-08-15',
              schedule: [
                { time: '10:00', activity: '抵达东京', location: '成田机场', details: '乘坐飞机抵达东京成田机场，搭乘成田特快前往市区', tips: '提前在Klook购买Suica卡方便乘坐公共交通' },
                { time: '13:00', activity: '酒店入住', location: '新宿区域酒店', details: '入住新宿附近的酒店，放置行李稍作休息', tips: '选择新宿站附近的酒店，交通便利' },
                { time: '15:00', activity: '新宿探索', location: '新宿', details: '逛新宿商圈，品尝当地美食', tips: '推荐一兰拉面和新宿思い出横丁' },
                { time: '19:00', activity: '演唱会', location: '东京巨蛋', details: 'Taylor Swift Eras Tour 东京站', tips: '提前1小时到场，东京巨蛋周边有官方周边售卖' },
              ],
            },
            {
              day: '第2天',
              date: '2025-08-16',
              schedule: [
                { time: '09:00', activity: '浅草寺游览', location: '浅草', details: '参观浅草寺和仲见世商店街', tips: '建议早上去，人少体验好' },
                { time: '12:00', activity: '午餐', location: '浅草附近', details: '品尝天妇罗或寿喜烧', tips: '推荐浅草今半寿喜烧' },
                { time: '14:00', activity: '秋叶原', location: '秋叶原', details: '动漫和电子产品购物', tips: 'Radio会馆是二次元天堂' },
                { time: '18:00', activity: '涩谷晚餐', location: '涩谷', details: '在涩谷品尝烤肉或居酒屋', tips: '涩谷SKY观景台看夜景很美' },
              ],
            },
            {
              day: '第3天',
              date: '2025-08-17',
              schedule: [
                { time: '10:00', activity: '筑地市场', location: '筑地', details: '筑地市场早餐，品尝新鲜寿司', tips: '推荐大和寿司或寿司大' },
                { time: '13:00', activity: '返程准备', location: '酒店', details: '回酒店收拾行李，前往机场', tips: '预留至少3小时到机场' },
                { time: '17:00', activity: '返程', location: '成田机场', details: '乘坐飞机返回', tips: '成田机场免税店可以购买伴手礼' },
              ],
            },
          ],
          transport: { to: '北京→东京 飞机（约3小时）', local: 'Suica卡+东京地铁/JR', back: '东京→北京 飞机（约3小时）' },
          hotel: [{ name: '新宿华盛顿酒店', address: '东京都新宿区', price: '约600元/晚', reason: '交通便利，距离东京巨蛋地铁15分钟' }],
          food: [{ name: '一兰拉面', address: '新宿店', recommendation: '经典豚骨拉面' }],
          venueTips: ['东京巨蛋不允许携带专业相机', '场内禁止饮食（瓶装水可以）', '周边商品建议开场前购买，热门款很快售罄'],
          budget: { total: '5000元', breakdown: { '交通': '2000元', '住宿': '1800元', '美食': '800元', '门票': '400元' } },
          notes: ['提前兑换日元现金', '下载Google Maps离线地图', '购买旅游保险'],
        },
        createdAt: '2025-06-01T00:00:00Z',
        updatedAt: '2025-06-01T00:00:00Z',
      },
      {
        id: 'mock-itin-2',
        userId: 'test-user-id',
        title: '周杰伦嘉年华演唱会 · 上海',
        eventName: '周杰伦嘉年华世界巡回演唱会',
        city: '上海',
        venueName: '上海体育场',
        startDate: '2025-09-20',
        endDate: '2025-09-21',
        itineraryData: {
          overview: '2天上海之旅，看周杰伦演唱会，感受魔都魅力。',
          days: [
            {
              day: '第1天',
              date: '2025-09-20',
              schedule: [
                { time: '12:00', activity: '抵达上海', location: '上海虹桥站', details: '高铁抵达上海虹桥站', tips: '虹桥站直接换乘地铁1号线' },
                { time: '14:00', activity: '酒店入住', location: '徐家汇区域', details: '入住徐家汇附近酒店', tips: '选择地铁沿线的酒店' },
                { time: '16:00', activity: '演唱会', location: '上海体育场', details: '周杰伦嘉年华演唱会', tips: '带上荧光棒和雨衣' },
              ],
            },
            {
              day: '第2天',
              date: '2025-09-21',
              schedule: [
                { time: '09:00', activity: '外滩游览', location: '外滩', details: '外滩观景+拍照', tips: '早上去人少' },
                { time: '11:00', activity: '城隍庙', location: '豫园', details: '逛城隍庙小吃', tips: '南翔小笼包必吃' },
                { time: '15:00', activity: '返程', location: '虹桥站', details: '高铁返回', tips: '提前买好点心带上车' },
              ],
            },
          ],
          transport: { to: '高铁（约4.5小时）', local: '上海地铁+打车', back: '高铁（约4.5小时）' },
          hotel: [{ name: '上海徐家汇亚朵酒店', address: '徐汇区', price: '约500元/晚', reason: '距离上海体育场地铁2站' }],
          food: [{ name: '南翔馒头店', address: '城隍庙', recommendation: '鲜肉小笼包' }],
          venueTips: ['上海体育场8号线直达', '可携带小型应援物', '结束后疏散较慢建议耐心等待'],
          budget: { total: '3000元', breakdown: { '交通': '1200元', '住宿': '1000元', '美食': '500元', '门票': '300元' } },
          notes: ['上海9月可能有雨，带伞', '演唱会结束后地铁人多'],
        },
        createdAt: '2025-06-05T00:00:00Z',
        updatedAt: '2025-06-05T00:00:00Z',
      },
    ];
    await storage.set('stargo_itineraries', mockItineraries);
  }
}

export async function restoreSession(): Promise<User | null> {
  try {
    const token = await secureStorage.getItemAsync(STORAGE_KEYS.AUTH_TOKEN);
    if (!token) return null;

    const user = await storage.get<User>(STORAGE_KEYS.USER_DATA);
    return user;
  } catch {
    return null;
  }
}
