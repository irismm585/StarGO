export interface MockEvent {
  id: string;
  eventName: string;
  artistName: string;
  venueName: string;
  city: string;
  date: string;
  image: string;
  description: string;
}

const EVENTS: MockEvent[] = [
  {
    id: 'evt_001',
    eventName: 'Taylor Swift | The Eras Tour',
    artistName: 'Taylor Swift',
    venueName: '东京巨蛋',
    city: '东京',
    date: '2026-08-15',
    image: '🎤',
    description:
      '全球流行天后 Taylor Swift 携破纪录的 The Eras Tour 登陆东京巨蛋！连续三晚带来跨越她音乐生涯全部时代的精彩演出，从《Fearless》到《Midnights》，每一首歌都是经典。',
  },
  {
    id: 'evt_002',
    eventName: '周杰伦「嘉年华」世界巡回演唱会',
    artistName: '周杰伦',
    venueName: '国家体育场（鸟巢）',
    city: '北京',
    date: '2026-07-22',
    image: '🎵',
    description:
      '周杰伦重返北京鸟巢，「嘉年华」巡演再度升级！全新舞台设计、经典曲目重温，从《青花瓷》到《告白气球》，带你在音乐中穿梭时光。',
  },
  {
    id: 'evt_003',
    eventName: 'Coachella 音乐节 2026',
    artistName: 'Multiple Artists',
    venueName: '科切拉谷',
    city: '洛杉矶',
    date: '2026-10-10',
    image: '🎪',
    description:
      '全球最瞩目的音乐节 Coachella 再度来袭！为期三天的音乐盛宴，汇集全球顶级音乐人、先锋艺术家和潮流品牌。沙漠中的音乐乌托邦，一生必去一次。',
  },
  {
    id: 'evt_004',
    eventName: '陈奕迅 FEAR AND DREAMS 演唱会',
    artistName: '陈奕迅',
    venueName: '红磡体育馆',
    city: '香港',
    date: '2026-09-05',
    image: '🎙️',
    description:
      '陈奕迅再度登上红馆！FEAR AND DREAMS 主题演唱会以音乐探讨恐惧与梦想，舞台视觉与音乐完美融合，Eason 的嗓音将带您走进一场心灵之旅。',
  },
  {
    id: 'evt_005',
    eventName: '2026 英雄联盟全球总决赛',
    artistName: '—',
    venueName: '北京国家体育场',
    city: '北京',
    date: '2026-11-01',
    image: '🏆',
    description:
      '全球电竞盛事——英雄联盟全球总决赛首次连续两年在中国举办！来自各大赛区的顶尖战队将在鸟巢争夺召唤师奖杯，见证新的世界冠军诞生！',
  },
  {
    id: 'evt_006',
    eventName: 'YOASOBI ASIA TOUR 2026',
    artistName: 'YOASOBI',
    venueName: '上海梅赛德斯奔驰文化中心',
    city: '上海',
    date: '2026-08-28',
    image: '🎶',
    description:
      '日本现象级音乐组合 YOASOBI 再度展开亚洲巡演！以小说为灵感创作音乐的独特风格，搭配 Ayase 的旋律与 ikura 的歌声，带来《夜に駆ける》《アイドル》等热门歌曲的震撼现场。',
  },
  {
    id: 'evt_007',
    eventName: '五月天「好好好想见到你」演唱会',
    artistName: '五月天',
    venueName: '高雄国家体育场',
    city: '高雄',
    date: '2026-12-25',
    image: '✨',
    description:
      '五月天圣诞夜重返高雄！「好好好想见到你」巡演延续感动，用音乐陪伴大家度过最温馨的圣诞夜晚。万人大合唱，蓝色荧光海，不见不散。',
  },
  {
    id: 'evt_008',
    eventName: 'Glass Animals Live in Singapore',
    artistName: 'Glass Animals',
    venueName: '新加坡室内体育馆',
    city: '新加坡',
    date: '2026-09-18',
    image: '🌴',
    description:
      '英国独立乐队 Glass Animals 携最新专辑展开亚洲巡演。迷幻的节拍、梦幻的声场，加上《Heat Waves》等大热单曲，在城市花园新加坡打造一场难忘的独立之夜。',
  },
];

export function getAllEvents(): MockEvent[] {
  return EVENTS;
}

export function getEventById(id: string): MockEvent | undefined {
  return EVENTS.find((e) => e.id === id);
}
