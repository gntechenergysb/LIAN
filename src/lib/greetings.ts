// 十二时辰问候 + 二十四节气（近似日期，用于公开主页的东方问候语）

interface ShichenInfo {
  name: string;
  greeting: string;
}

// 按 start 小时降序排列，取第一个 start <= 当前小时的条目
const SHICHEN_TABLE: { start: number; name: string; greeting: string }[] = [
  { start: 23, name: '子时', greeting: '子时夜阑，愿你好梦安眠' },
  { start: 21, name: '亥时', greeting: '亥时人定，是时候放下手机了' },
  { start: 19, name: '戌时', greeting: '戌时黄昏，晚饭吃得可好' },
  { start: 17, name: '酉时', greeting: '酉时日入，归家路上注意安全' },
  { start: 15, name: '申时', greeting: '申时哺时，偷得浮生半日闲' },
  { start: 13, name: '未时', greeting: '未时日昳，午后小憩片刻吧' },
  { start: 11, name: '午时', greeting: '午时日中，记得好好吃午饭' },
  { start: 9, name: '巳时', greeting: '巳时隅中，上午时光正好' },
  { start: 7, name: '辰时', greeting: '辰时食时，一日之计在于晨' },
  { start: 5, name: '卯时', greeting: '卯时日出，早起的鸟儿有虫吃' },
  { start: 3, name: '寅时', greeting: '寅时平旦，天快亮了' },
  { start: 1, name: '丑时', greeting: '丑时鸡鸣，还在熬夜吗' },
  { start: 0, name: '子时', greeting: '子时夜半，早点休息吧' },
];

export function getShichen(date = new Date()): ShichenInfo {
  const h = date.getHours();
  for (const t of SHICHEN_TABLE) {
    if (h >= t.start) return { name: t.name, greeting: t.greeting };
  }
  return { name: '子时', greeting: '子时夜半，早点休息吧' };
}

// [月, 日, 节气名] —— 每年该节气大致开始的日期
const SOLAR_TERMS: [number, number, string][] = [
  [1, 6, '小寒'],
  [1, 20, '大寒'],
  [2, 4, '立春'],
  [2, 19, '雨水'],
  [3, 6, '惊蛰'],
  [3, 21, '春分'],
  [4, 5, '清明'],
  [4, 20, '谷雨'],
  [5, 6, '立夏'],
  [5, 21, '小满'],
  [6, 6, '芒种'],
  [6, 22, '夏至'],
  [7, 7, '小暑'],
  [7, 23, '大暑'],
  [8, 8, '立秋'],
  [8, 23, '处暑'],
  [9, 8, '白露'],
  [9, 23, '秋分'],
  [10, 8, '寒露'],
  [10, 24, '霜降'],
  [11, 8, '立冬'],
  [11, 22, '小雪'],
  [12, 7, '大雪'],
  [12, 22, '冬至'],
];

export function getSolarTerm(date = new Date()): string {
  const m = date.getMonth() + 1;
  const d = date.getDate();
  let current = '冬至';
  for (const [tm, td, name] of SOLAR_TERMS) {
    if (m > tm || (m === tm && d >= td)) current = name;
  }
  return current;
}

export function getGreeting(date = new Date()): { shichen: string; term: string; text: string } {
  const s = getShichen(date);
  const term = getSolarTerm(date);
  return { shichen: s.name, term, text: `${s.greeting} · ${term}` };
}
