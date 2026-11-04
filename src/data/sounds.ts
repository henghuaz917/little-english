// A practical reference for common American-English sounds, using the same broad
// IPA conventions as curriculum.ts. Inventories vary by accent and analysis;
// these 41 entries are teaching items, not a claim that every accent has 41 phonemes.
// /r/ represents the American approximant (often written [ɹ] in narrow notation).
// Always send `word` to speech synthesis, never `symbol` or `ipa`.
export const soundGroups: {
  title: string;
  sounds: { symbol: string; word: string; ipa: string; tip: string }[];
}[] = [
  {
    title: '单元音 · 留意舌位和嘴形',
    sounds: [
      { symbol: '/i/', word: 'see', ipa: '/si/', tip: '舌头向前抬高，嘴唇稍向两边展开，声音保持清晰。' },
      { symbol: '/ɪ/', word: 'sit', ipa: '/sɪt/', tip: '舌头向前，位置比 /i/ 稍低，嘴唇和舌头放松。' },
      { symbol: '/ɛ/', word: 'red', ipa: '/rɛd/', tip: '嘴巴自然张开，舌头向前，位置比 /ɪ/ 更低一些。' },
      { symbol: '/æ/', word: 'cat', ipa: '/kæt/', tip: '嘴巴张开，舌头放低并稍向前，嘴唇保持放松。' },
      { symbol: '/ɑ/', word: 'hot', ipa: '/hɑt/', tip: '嘴巴张开，舌头放低并稍向后，嘴唇不拢圆。' },
      { symbol: '/ɔ/', word: 'ball', ipa: '/bɔl/', tip: '舌头稍向后，嘴唇轻轻拢圆；部分美式口音会与 /ɑ/ 合流。' },
      { symbol: '/ʊ/', word: 'book', ipa: '/bʊk/', tip: '舌头稍向后抬起，嘴唇轻轻拢圆，保持放松。' },
      { symbol: '/u/', word: 'food', ipa: '/fud/', tip: '舌头抬高，嘴唇拢圆，留意与 /ʊ/ 的舌位和紧张程度差别。' },
      { symbol: '/ʌ/', word: 'cup', ipa: '/kʌp/', tip: '嘴巴自然张开，舌头在中部附近，嘴唇不拢圆。' },
      { symbol: '/ə/', word: 'about', ipa: '/əˈbaʊt/', tip: '嘴和舌头放松，轻轻发出这个非重读音节里的元音。' },
    ],
  },
  {
    title: '双元音 · 让声音平滑移动',
    sounds: [
      { symbol: '/eɪ/', word: 'day', ipa: '/deɪ/', tip: '声音从 /e/ 附近滑向 /ɪ/，嘴巴逐渐收小。' },
      { symbol: '/aɪ/', word: 'bike', ipa: '/baɪk/', tip: '先张开嘴，再把舌头向前抬高，平滑地滑向 /ɪ/。' },
      { symbol: '/ɔɪ/', word: 'boy', ipa: '/bɔɪ/', tip: '先轻轻拢圆嘴唇，再逐渐展开，舌头向 /ɪ/ 的位置移动。' },
      { symbol: '/aʊ/', word: 'now', ipa: '/naʊ/', tip: '先张开嘴，再逐渐收拢嘴唇，舌头向 /ʊ/ 的位置移动。' },
      { symbol: '/oʊ/', word: 'home', ipa: '/hoʊm/', tip: '嘴唇由略圆逐渐收拢，声音从 /o/ 附近滑向 /ʊ/。' },
    ],
  },
  {
    title: '卷舌元音 · 注意重读与轻读',
    sounds: [
      { symbol: '/ɝ/', word: 'bird', ipa: '/bɝd/', tip: '舌头形成美式 r 的形状且不碰上腭，在重读音节里发声。' },
      { symbol: '/ɚ/', word: 'teacher', ipa: '/ˈtitʃɚ/', tip: '保持美式 r 的舌形，在非重读音节中轻轻发声。' },
    ],
  },
  {
    title: '爆破音 · 先挡住，再释放',
    sounds: [
      { symbol: '/p/', word: 'pen', ipa: '/pɛn/', tip: '双唇闭合后放开，让气流冲出，声带不振动。' },
      { symbol: '/b/', word: 'bag', ipa: '/bæɡ/', tip: '双唇闭合后放开，发音时声带振动。' },
      { symbol: '/t/', word: 'ten', ipa: '/tɛn/', tip: '舌尖抵住上齿龈后放开，声带不振动。' },
      { symbol: '/d/', word: 'desk', ipa: '/dɛsk/', tip: '舌尖抵住上齿龈后放开，发音时声带振动。' },
      { symbol: '/k/', word: 'cat', ipa: '/kæt/', tip: '舌头后部抵住软腭后放开，声带不振动。' },
      { symbol: '/ɡ/', word: 'go', ipa: '/ɡoʊ/', tip: '舌头后部抵住软腭后放开，发音时声带振动。' },
    ],
  },
  {
    title: '摩擦音 · 让气流通过窄缝',
    sounds: [
      { symbol: '/f/', word: 'fish', ipa: '/fɪʃ/', tip: '上齿轻触下唇，让气流从缝隙通过，声带不振动。' },
      { symbol: '/v/', word: 'very', ipa: '/ˈvɛri/', tip: '上齿轻触下唇，让气流通过，同时让声带振动。' },
      { symbol: '/θ/', word: 'thin', ipa: '/θɪn/', tip: '舌尖轻靠上下牙之间，让气流通过，声带不振动。' },
      { symbol: '/ð/', word: 'this', ipa: '/ðɪs/', tip: '舌尖轻靠上下牙之间，让气流通过，同时让声带振动。' },
      { symbol: '/s/', word: 'sun', ipa: '/sʌn/', tip: '舌头前部靠近上齿龈而不堵住气流，声带不振动。' },
      { symbol: '/z/', word: 'zoo', ipa: '/zu/', tip: '保持 /s/ 的舌形并让气流通过，同时让声带振动。' },
      { symbol: '/ʃ/', word: 'ship', ipa: '/ʃɪp/', tip: '嘴唇稍向前，舌头前部靠近上齿龈后方，让气流持续通过。' },
      { symbol: '/ʒ/', word: 'vision', ipa: '/ˈvɪʒən/', tip: '保持 /ʃ/ 的舌形和气流，同时让声带振动。' },
      { symbol: '/h/', word: 'hot', ipa: '/hɑt/', tip: '嘴巴准备好后面元音的形状，轻轻呼出气流。' },
    ],
  },
  {
    title: '破擦音 · 短暂阻挡后摩擦',
    sounds: [
      { symbol: '/tʃ/', word: 'chat', ipa: '/tʃæt/', tip: '舌头前部先挡住气流，再释放成摩擦音，声带不振动。' },
      { symbol: '/dʒ/', word: 'job', ipa: '/dʒɑb/', tip: '舌头前部先挡住气流，再释放成摩擦音，同时声带振动。' },
    ],
  },
  {
    title: '鼻音 · 让气流从鼻腔通过',
    sounds: [
      { symbol: '/m/', word: 'map', ipa: '/mæp/', tip: '双唇闭合，声带振动，让气流从鼻腔通过。' },
      { symbol: '/n/', word: 'name', ipa: '/neɪm/', tip: '舌尖抵住上齿龈，声带振动，让气流从鼻腔通过。' },
      { symbol: '/ŋ/', word: 'sing', ipa: '/sɪŋ/', tip: '舌头后部抵住软腭，让气流从鼻腔通过，sing 末尾不再加 /ɡ/。' },
    ],
  },
  {
    title: '近音 · 舌头与嘴唇的配合',
    sounds: [
      { symbol: '/l/', word: 'late', ipa: '/leɪt/', tip: '词首发音时舌尖轻抵上齿龈，让气流从舌头两侧通过。' },
      { symbol: '/r/', word: 'red', ipa: '/rɛd/', tip: '舌尖可稍卷起或舌身聚拢，舌头不碰上腭，也不用颤动舌尖。' },
      { symbol: '/w/', word: 'we', ipa: '/wi/', tip: '先拢圆嘴唇，再迅速过渡到后面的元音。' },
      { symbol: '/j/', word: 'yes', ipa: '/jɛs/', tip: '舌头前部向上腭抬起但不接触，迅速滑向后面的元音。' },
    ],
  },
];
