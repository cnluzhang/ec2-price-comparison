export interface Region {
  code: string;
  name: string;
  continent: string;
}

export interface RegionGroup {
  name: string;
  regions: Region[];
}

export const regionGroups: RegionGroup[] = [
  {
    name: '北美',
    regions: [
      { code: 'us-east-1', name: '美国东部 (弗吉尼亚北部)', continent: '北美' },
      { code: 'us-east-2', name: '美国东部 (俄亥俄)', continent: '北美' },
      { code: 'us-west-1', name: '美国西部 (加利福尼亚)', continent: '北美' },
      { code: 'us-west-2', name: '美国西部 (俄勒冈)', continent: '北美' },
      { code: 'ca-central-1', name: '加拿大 (中部)', continent: '北美' },
      { code: 'ca-west-1', name: '加拿大西部 (卡尔加里)', continent: '北美' },
      { code: 'mx-central-1', name: '墨西哥 (中部)', continent: '北美' }
    ]
  },
  {
    name: '南美',
    regions: [
      { code: 'sa-east-1', name: '巴西 (圣保罗)', continent: '南美' }
    ]
  },
  {
    name: '欧洲',
    regions: [
      { code: 'eu-west-1', name: '爱尔兰', continent: '欧洲' },
      { code: 'eu-west-2', name: '伦敦', continent: '欧洲' },
      { code: 'eu-west-3', name: '巴黎', continent: '欧洲' },
      { code: 'eu-central-1', name: '法兰克福', continent: '欧洲' },
      { code: 'eu-central-2', name: '苏黎世', continent: '欧洲' },
      { code: 'eu-north-1', name: '斯德哥尔摩', continent: '欧洲' },
      { code: 'eu-south-1', name: '米兰', continent: '欧洲' },
      { code: 'eu-south-2', name: '西班牙', continent: '欧洲' }
    ]
  },
  {
    name: '亚太',
    regions: [
      { code: 'ap-northeast-1', name: '东京', continent: '亚太' },
      { code: 'ap-northeast-2', name: '首尔', continent: '亚太' },
      { code: 'ap-northeast-3', name: '大阪', continent: '亚太' },
      { code: 'ap-southeast-1', name: '新加坡', continent: '亚太' },
      { code: 'ap-southeast-2', name: '悉尼', continent: '亚太' },
      { code: 'ap-southeast-3', name: '雅加达', continent: '亚太' },
      { code: 'ap-southeast-4', name: '墨尔本', continent: '亚太' },
      { code: 'ap-southeast-5', name: '马来西亚', continent: '亚太' },
      { code: 'ap-southeast-7', name: '泰国', continent: '亚太' },
      { code: 'ap-south-1', name: '孟买', continent: '亚太' },
      { code: 'ap-south-2', name: '海得拉巴', continent: '亚太' },
      { code: 'ap-east-1', name: '香港', continent: '亚太' }
    ]
  },
  {
    name: '中东',
    regions: [
      { code: 'me-central-1', name: '阿联酋 (迪拜)', continent: '中东' },
      { code: 'me-south-1', name: '巴林', continent: '中东' },
      { code: 'il-central-1', name: '以色列 (特拉维夫)', continent: '中东' }
    ]
  },
  {
    name: '非洲',
    regions: [
      { code: 'af-south-1', name: '开普敦', continent: '非洲' }
    ]
  },
  {
    name: '中国',
    regions: [
      { code: 'cn-north-1', name: '中国 (北京)', continent: '中国' },
      { code: 'cn-northwest-1', name: '中国 (宁夏)', continent: '中国' }
    ]
  }
];

export const allRegions: Region[] = regionGroups.flatMap(group => group.regions); 