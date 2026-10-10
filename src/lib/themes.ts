export interface Theme {
  id: string;
  name: string;
  desc: string;
}

export const THEMES: Theme[] = [
  { id: 'xuanzhi', name: '宣纸', desc: '米色纸纹，温润东方' },
  { id: 'shuimo', name: '水墨', desc: '黑白之间，意境悠远' },
  { id: 'ying', name: '樱', desc: '粉白樱色，温柔细腻' },
  { id: 'qingci', name: '青瓷', desc: '雨过天青，含蓄内敛' },
  { id: 'zhusha', name: '朱砂', desc: '一抹朱红，热烈张扬' },
  { id: 'yueye', name: '月夜', desc: '深蓝夜色，静谧深邃' },
];

export function themeName(id: string): string {
  return THEMES.find((t) => t.id === id)?.name ?? '宣纸';
}
