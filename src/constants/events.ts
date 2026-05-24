export type EventCategory = 'concert' | 'drama' | 'musical' | 'sports' | 'comedy';

export const CATEGORIES: { key: EventCategory; labelZh: string; labelEn: string }[] = [
  { key: 'concert', labelZh: '演唱会', labelEn: 'Concert' },
  { key: 'drama', labelZh: '话剧', labelEn: 'Drama' },
  { key: 'musical', labelZh: '音乐剧', labelEn: 'Musical' },
  { key: 'sports', labelZh: '体育赛事', labelEn: 'Sports' },
  { key: 'comedy', labelZh: '脱口秀', labelEn: 'Comedy' },
];

export interface MockEvent {
  id: string;
  eventName: string;
  eventNameEn?: string;
  artistName: string;
  artistNameEn?: string;
  venueName: string;
  venueNameEn?: string;
  city: string;
  cityEn?: string;
  date: string;
  image: string;
  description: string;
  descriptionEn?: string;
  category: EventCategory;
  priceRange: string;
  priceRangeEn?: string;
}

const EVENTS: MockEvent[] = [
  // ── 演唱会 / Concerts ──
  {
    id: 'evt_001',
    eventName: 'Taylor Swift | The Eras Tour',
    eventNameEn: 'Taylor Swift | The Eras Tour',
    artistName: 'Taylor Swift',
    artistNameEn: 'Taylor Swift',
    venueName: '东京巨蛋',
    venueNameEn: 'Tokyo Dome',
    city: '东京',
    cityEn: 'Tokyo',
    date: '2026-08-15',
    image: 'https://loremflickr.com/400/250/concert?lock=1',
    description:
      '全球流行天后 Taylor Swift 携破纪录的 The Eras Tour 登陆东京巨蛋！连续三晚带来跨越她音乐生涯全部时代的精彩演出。',
    descriptionEn:
      'Global pop superstar Taylor Swift brings her record-breaking The Eras Tour to Tokyo Dome! Three consecutive nights spanning every era of her career.',
    priceRange: '¥580-¥3,280',
    category: 'concert',
  },
  {
    id: 'evt_002',
    eventName: '周杰伦「嘉年华」世界巡回演唱会',
    eventNameEn: 'Jay Chou "Carnival" World Tour',
    artistName: '周杰伦',
    artistNameEn: 'Jay Chou',
    venueName: '国家体育场（鸟巢）',
    venueNameEn: 'National Stadium (Bird\'s Nest)',
    city: '北京',
    cityEn: 'Beijing',
    date: '2026-07-22',
    image: 'https://loremflickr.com/400/250/concert?lock=2',
    description:
      '周杰伦重返北京鸟巢，「嘉年华」巡演再度升级！全新舞台设计、经典曲目重温，从《青花瓷》到《告白气球》，带你在音乐中穿梭时光。',
    descriptionEn:
      'Jay Chou returns to Beijing\'s Bird\'s Nest! The "Carnival" tour upgrades with a brand new stage design, classic hits from "Blue and White Porcelain" to "Love Confession," taking you on a journey through time with music.',
    priceRange: '¥480-¥2,680',
    category: 'concert',
  },
  {
    id: 'evt_006',
    eventName: 'YOASOBI ASIA TOUR 2026',
    eventNameEn: 'YOASOBI ASIA TOUR 2026',
    artistName: 'YOASOBI',
    artistNameEn: 'YOASOBI',
    venueName: '梅赛德斯奔驰文化中心',
    venueNameEn: 'Mercedes-Benz Arena',
    city: '上海',
    cityEn: 'Shanghai',
    date: '2026-08-28',
    image: 'https://loremflickr.com/400/250/concert?lock=3',
    description:
      '日本现象级音乐组合 YOASOBI 再度展开亚洲巡演！以小说为灵感创作音乐的独特风格，带来《夜に駆ける》《アイドル》等热门歌曲的震撼现场。',
    descriptionEn:
      'Japanese phenomenon YOASOBI returns for another Asia tour! Their unique style of novel-inspired songwriting brings hits like "Yoru ni Kakeru" and "Idol" to life in an electrifying live show.',
    priceRange: '¥380-¥1,680',
    category: 'concert',
  },
  {
    id: 'evt_007',
    eventName: '五月天「好好好想见到你」演唱会',
    eventNameEn: 'Mayday "So Much Want to See You" Concert',
    artistName: '五月天',
    artistNameEn: 'Mayday',
    venueName: '高雄国家体育场',
    venueNameEn: 'Kaohsiung National Stadium',
    city: '高雄',
    cityEn: 'Kaohsiung',
    date: '2026-12-25',
    image: 'https://loremflickr.com/400/250/concert?lock=4',
    description:
      '五月天圣诞夜重返高雄！「好好好想见到你」巡演延续感动，用音乐陪伴大家度过最温馨的圣诞夜晚。万人大合唱，蓝色荧光海，不见不散。',
    descriptionEn:
      'Mayday returns to Kaohsiung on Christmas Eve! The "So Much Want to See You" tour brings warmth and joy, with the iconic blue glow stick ocean and tens of thousands singing together.',
    priceRange: '¥480-¥2,280',
    category: 'concert',
  },
  {
    id: 'evt_004',
    eventName: '陈奕迅 FEAR AND DREAMS 演唱会',
    eventNameEn: 'Eason Chan FEAR AND DREAMS Concert',
    artistName: '陈奕迅',
    artistNameEn: 'Eason Chan',
    venueName: '红磡体育馆',
    venueNameEn: 'Hong Kong Coliseum',
    city: '香港',
    cityEn: 'Hong Kong',
    date: '2026-09-05',
    image: 'https://loremflickr.com/400/250/concert?lock=5',
    description:
      '陈奕迅再度登上红馆！FEAR AND DREAMS 主题演唱会以音乐探讨恐惧与梦想，舞台视觉与音乐完美融合。',
    descriptionEn:
      'Eason Chan returns to the Hong Kong Coliseum! The FEAR AND DREAMS themed concert explores fear and dreams through music, with stunning visuals blending perfectly with his performance.',
    priceRange: '¥580-¥2,880',
    category: 'concert',
  },

  // ── 话剧 / Drama ──
  {
    id: 'evt_d01',
    eventName: '茶馆',
    eventNameEn: 'Teahouse',
    artistName: '北京人民艺术剧院',
    artistNameEn: 'Beijing People\'s Art Theatre',
    venueName: '首都剧场',
    venueNameEn: 'Capital Theatre',
    city: '北京',
    cityEn: 'Beijing',
    date: '2026-06-20',
    image: 'https://loremflickr.com/400/250/theatre?lock=6',
    description:
      '老舍先生经典巨作《茶馆》，北京人艺保留剧目。透过一个茶馆的兴衰，展现半个世纪的中国社会变迁，堪称中国话剧史上的巅峰之作。',
    descriptionEn:
      'Lao She\'s masterpiece "Teahouse," a signature production of the Beijing People\'s Art Theatre. Through the rise and fall of a single teahouse, it portrays half a century of Chinese social change — the pinnacle of Chinese drama.',
    priceRange: '¥180-¥880',
    category: 'drama',
  },
  {
    id: 'evt_d02',
    eventName: '雷雨',
    eventNameEn: 'Thunderstorm',
    artistName: '中国国家话剧院',
    artistNameEn: 'China National Theatre',
    venueName: '国家大剧院',
    venueNameEn: 'National Centre for the Performing Arts',
    city: '北京',
    cityEn: 'Beijing',
    date: '2026-07-10',
    image: 'https://loremflickr.com/400/250/theatre?lock=7',
    description:
      '曹禺先生代表作《雷雨》，中国话剧百年经典。一个家庭的爱恨纠葛，在雷雨之夜彻底爆发，震撼人心的悲剧力量。',
    descriptionEn:
      'Cao Yu\'s masterpiece "Thunderstorm," a century-old classic of Chinese drama. A family\'s tangled web of love and hate erupts on a stormy night — a tragedy of devastating power.',
    priceRange: '¥180-¥780',
    category: 'drama',
  },
  {
    id: 'evt_d03',
    eventName: '恋爱的犀牛',
    eventNameEn: 'Rhinoceros in Love',
    artistName: '孟京辉戏剧工作室',
    artistNameEn: 'Meng Jinghui Drama Studio',
    venueName: '上海文化广场',
    venueNameEn: 'Shanghai Cultural Square',
    city: '上海',
    cityEn: 'Shanghai',
    date: '2026-08-12',
    image: 'https://loremflickr.com/400/250/theatre?lock=8',
    description:
      '孟京辉经典先锋话剧《恋爱的犀牛》，当代中国戏剧票房奇迹。一个关于爱情、执着与疯狂的故事，永远年轻，永远热泪盈眶。',
    descriptionEn:
      'Meng Jinghui\'s classic avant-garde play "Rhinoceros in Love," a box office miracle in contemporary Chinese theatre. A story about love, obsession, and madness — forever young, forever passionate.',
    priceRange: '¥280-¥980',
    category: 'drama',
  },

  // ── 音乐剧 / Musical ──
  {
    id: 'evt_m01',
    eventName: '歌剧魅影',
    eventNameEn: 'The Phantom of the Opera',
    artistName: '真正好集团',
    artistNameEn: 'Really Useful Group',
    venueName: '上海大剧院',
    venueNameEn: 'Shanghai Grand Theatre',
    city: '上海',
    cityEn: 'Shanghai',
    date: '2026-09-15',
    image: 'https://loremflickr.com/400/250/musical?lock=9',
    description:
      '安德鲁·韦伯经典音乐剧《歌剧魅影》，全球最长演的音乐剧之一。华丽的舞台、动人的旋律，讲述巴黎歌剧院地下迷宫中的爱情传奇。',
    descriptionEn:
      'Andrew Lloyd Webber\'s "The Phantom of the Opera," one of the longest-running musicals in the world. A magnificent stage, unforgettable melodies, and a love story set in the labyrinth beneath the Paris Opera House.',
    priceRange: '¥280-¥1,280',
    category: 'musical',
  },
  {
    id: 'evt_m02',
    eventName: '悲惨世界',
    eventNameEn: 'Les Misérables',
    artistName: '伦敦西区巡演团',
    artistNameEn: 'West End Touring Company',
    venueName: '广州大剧院',
    venueNameEn: 'Guangzhou Opera House',
    city: '广州',
    cityEn: 'Guangzhou',
    date: '2026-10-08',
    image: 'https://loremflickr.com/400/250/musical?lock=10',
    description:
      '世界四大音乐剧之一《悲惨世界》再度来华！根据雨果同名小说改编，气势恢宏的舞台、感人至深的故事，唱响自由与爱的永恒赞歌。',
    descriptionEn:
      'One of the world\'s greatest musicals, "Les Misérables," returns to China! Based on Victor Hugo\'s epic novel, a grand stage and deeply moving story singing the eternal anthem of freedom and love.',
    priceRange: '¥280-¥1,280',
    category: 'musical',
  },
  {
    id: 'evt_m03',
    eventName: '猫',
    eventNameEn: 'Cats',
    artistName: '伦敦西区巡演团',
    artistNameEn: 'West End Touring Company',
    venueName: '深圳保利剧院',
    venueNameEn: 'Shenzhen Poly Theatre',
    city: '深圳',
    cityEn: 'Shenzhen',
    date: '2026-11-20',
    image: 'https://loremflickr.com/400/250/musical?lock=11',
    description:
      '安德鲁·韦伯不朽名作《猫》，亚洲巡演深圳站。杰里科猫族的年度盛会，经典名曲《Memory》响彻夜空，一部适合全家观赏的视听盛宴。',
    descriptionEn:
      'Andrew Lloyd Webber\'s timeless masterpiece "Cats," Shenzhen stop of the Asia tour. The Jellicle cats gather for their annual ball, with the classic "Memory" ringing through the night — a spectacle for all ages.',
    priceRange: '¥280-¥1,180',
    category: 'musical',
  },

  // ── 体育赛事 / Sports ──
  {
    id: 'evt_005',
    eventName: '2026 英雄联盟全球总决赛',
    eventNameEn: '2026 League of Legends World Championship',
    artistName: '—',
    artistNameEn: '—',
    venueName: '北京国家体育场',
    venueNameEn: 'Beijing National Stadium',
    city: '北京',
    cityEn: 'Beijing',
    date: '2026-11-01',
    image: 'https://loremflickr.com/400/250/esport?lock=12',
    description:
      '全球电竞盛事——英雄联盟全球总决赛！来自各大赛区的顶尖战队将在鸟巢争夺召唤师奖杯，见证新的世界冠军诞生！',
    descriptionEn:
      'The biggest event in esports — the League of Legends World Championship! Top teams from every region battle for the Summoner\'s Cup at the Bird\'s Nest. Witness the birth of a new world champion!',
    priceRange: '¥280-¥1,980',
    category: 'sports',
  },
  {
    id: 'evt_s02',
    eventName: 'NBA 中国赛：湖人 vs 勇士',
    eventNameEn: 'NBA China Games: Lakers vs Warriors',
    artistName: '—',
    artistNameEn: '—',
    venueName: '梅赛德斯奔驰文化中心',
    venueNameEn: 'Mercedes-Benz Arena',
    city: '上海',
    cityEn: 'Shanghai',
    date: '2026-10-05',
    image: 'https://loremflickr.com/400/250/basketball?lock=13',
    description:
      'NBA 中国赛重磅来袭！洛杉矶湖人 vs 金州勇士，两大豪门巅峰对决。詹姆斯、库里等超级巨星亲临现场，为球迷献上原汁原味的 NBA 篮球盛宴。',
    descriptionEn:
      'NBA China Games are back! Los Angeles Lakers vs Golden State Warriors — a clash of titans. Superstars LeBron James and Stephen Curry bring the authentic NBA experience to Shanghai.',
    priceRange: '¥480-¥3,880',
    category: 'sports',
  },
  {
    id: 'evt_s03',
    eventName: '2026 上海马拉松',
    eventNameEn: '2026 Shanghai Marathon',
    artistName: '—',
    artistNameEn: '—',
    venueName: '外滩金牛广场',
    venueNameEn: 'The Bund Golden Ox Square',
    city: '上海',
    cityEn: 'Shanghai',
    date: '2026-12-01',
    image: 'https://loremflickr.com/400/250/marathon?lock=14',
    description:
      '2026 上海国际马拉松赛，从外滩出发，跑过浦江两岸。全程马拉松、半程马拉松、健康跑等多个项目，适合不同水平的跑者参与。',
    descriptionEn:
      'The 2026 Shanghai International Marathon starts from the Bund and runs along both sides of the Huangpu River. Full marathon, half marathon, and health run categories for runners of all levels.',
    priceRange: '¥100-¥500',
    category: 'sports',
  },

  // ── 脱口秀 / Comedy ──
  {
    id: 'evt_c01',
    eventName: '笑果脱口秀 · 城市漫游',
    eventNameEn: 'Xiaoguo Comedy City Tour',
    artistName: '呼兰、庞博、何广智',
    artistNameEn: 'Hulan, Pang Bo, He Guangzhi',
    venueName: '上海文化广场',
    venueNameEn: 'Shanghai Cultural Square',
    city: '上海',
    cityEn: 'Shanghai',
    date: '2026-07-18',
    image: 'https://loremflickr.com/400/250/comedy?lock=15',
    description:
      '笑果文化明星演员集结！呼兰、庞博、何广智等人气脱口秀演员轮番登台，用最犀利的段子、最爆笑的故事，陪你度过一个欢乐的夜晚。',
    descriptionEn:
      'Xiaoguo Comedy\'s star lineup! Hulan, Pang Bo, He Guangzhi and more popular comedians take the stage, delivering the sharpest jokes and funniest stories for an unforgettable night of laughter.',
    priceRange: '¥180-¥680',
    category: 'comedy',
  },
  {
    id: 'evt_c02',
    eventName: '德云社相声专场',
    eventNameEn: 'Deyunshe Cross-talk Show',
    artistName: '郭德纲、于谦',
    artistNameEn: 'Guo Degang, Yu Qian',
    venueName: '北京展览馆剧场',
    venueNameEn: 'Beijing Exhibition Center Theatre',
    city: '北京',
    cityEn: 'Beijing',
    date: '2026-08-22',
    image: 'https://loremflickr.com/400/250/comedy?lock=16',
    description:
      '德云社最强阵容！郭德纲、于谦领衔，携德云社众弟子为您奉上原汁原味的传统相声。说学逗唱，笑料不断，感受中国曲艺的独特魅力。',
    descriptionEn:
      'Deyunshe\'s strongest lineup! Guo Degang and Yu Qian lead the troupe in authentic traditional Chinese cross-talk. Comedy, wit, and masterful storytelling — experience the unique charm of Chinese performing arts.',
    priceRange: '¥280-¥1,280',
    category: 'comedy',
  },
  {
    id: 'evt_c03',
    eventName: '黄西 Joe Wong 脱口秀',
    eventNameEn: 'Joe Wong Stand-up Comedy',
    artistName: '黄西',
    artistNameEn: 'Joe Wong',
    venueName: '广州大剧院',
    venueNameEn: 'Guangzhou Opera House',
    city: '广州',
    cityEn: 'Guangzhou',
    date: '2026-09-25',
    image: 'https://loremflickr.com/400/250/comedy?lock=17',
    description:
      '国际知名脱口秀演员黄西（Joe Wong）再度国内巡演！从白宫记者协会晚宴到 Netflix 专场，黄西用独特的幽默视角，带你笑看中西文化差异。',
    descriptionEn:
      'Internationally acclaimed comedian Joe Wong returns for a China tour! From the White House Correspondents\' Dinner to Netflix specials, Joe Wong brings his unique humor to explore cultural differences with wit and charm.',
    priceRange: '¥180-¥680',
    category: 'comedy',
  },
];

export function getAllEvents(): MockEvent[] {
  return EVENTS;
}

export function getEventById(id: string): MockEvent | undefined {
  return EVENTS.find((e) => e.id === id);
}

export function getEventsByCategory(category: EventCategory | 'all'): MockEvent[] {
  if (category === 'all') return EVENTS;
  return EVENTS.filter((e) => e.category === category);
}
