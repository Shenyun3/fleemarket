// backend/prisma/seed-data/categories.ts
export type CategorySeed = {
  name: string;
  children?: CategorySeed[];
};

export const categories = [
  {
    name: "レディース",
    children: [
      { name: "トップス" },
      { name: "パンツ" },
      { name: "ワンピース" },
      { name: "バッグ" },
      { name: "靴" },
      { name: "アクセサリー" },
    ],
  },

  {
    name: "メンズ",
    children: [
      { name: "トップス" },
      { name: "パンツ" },
      { name: "ジャケット・アウター" },
      { name: "靴" },
      { name: "バッグ" },
      { name: "時計" },
    ],
  },

  {
    name: "ベビー・キッズ",
    children: [
      { name: "ベビー服" },
      { name: "キッズ服" },
      { name: "キッズ靴" },
      { name: "おもちゃ" },
      { name: "外出用品" },
    ],
  },

  {
    name: "家電・スマホ・カメラ",
    children: [
      { name: "スマートフォン" },
      { name: "PC・周辺機器" },
      { name: "カメラ" },
      { name: "テレビ" },
      { name: "オーディオ機器" },
      { name: "生活家電" },
    ],
  },

  {
    name: "本・音楽・ゲーム",
    children: [
      { name: "本" },
      { name: "漫画" },
      { name: "雑誌" },
      { name: "CD" },
      { name: "DVD・ブルーレイ" },
      { name: "テレビゲーム" },
    ],
  },

  {
    name: "スポーツ・レジャー",
    children: [
      { name: "ゴルフ" },
      { name: "野球" },
      { name: "サッカー" },
      { name: "自転車" },
      { name: "アウトドア" },
      { name: "フィッシング" },
    ],
  },

  {
    name: "コスメ・香水・美容",
    children: [
      { name: "スキンケア" },
      { name: "メイクアップ" },
      { name: "香水" },
      { name: "ヘアケア" },
      { name: "美容家電" },
    ],
  },

  {
    name: "インテリア・住まい・小物",
    children: [
      { name: "家具" },
      { name: "収納家具" },
      { name: "照明" },
      { name: "寝具" },
      { name: "キッチン用品" },
      { name: "インテリア小物" },
    ],
  },
];
