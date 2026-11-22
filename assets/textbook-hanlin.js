'use strict';
// 翰林版 108 課綱高中物理章節對照。
// 來源：三貝德 go100「108 課綱版本對照表」中翰林版欄位（必修、選修 I–IV）；
// 選修 V 取自翰林出版之互動式講義目錄（三民書局、效果書局商品頁），可能與課本節名略有出入。
// 每個實驗列 1–3 個節次，第一個為主要對應章節；X- 開頭為課本外的延伸標籤。
(function (root) {
  const books = [
    {
      key: 'B',
      name: '必修物理',
      short: '必修',
      chapters: [
        ['1', '科學的態度與方法', ['科學的態度', '科學的方法', '物理學簡介']],
        ['2', '物質的組成與交互作用', ['物質的組成', '原子的尺度與結構', '物質間的基本交互作用']],
        ['3', '物體的運動', ['對物體運動的研究歷程', '牛頓運動定律', '天體運動']],
        ['4', '電與磁的統一', ['光', '電流的磁效應', '電磁感應', '電與磁的整合']],
        ['5', '能量', ['能量的形式', '微觀尺度下的能量', '能量間的轉換與能量守恆', '質能互換與核能']],
        ['6', '量子現象', ['光電效應', '波粒二象性', '原子光譜']]
      ]
    },
    {
      key: 'I',
      name: '選修物理Ⅰ 力學一',
      short: '選修Ⅰ',
      chapters: [
        ['1', '測量與不確定度', ['不確定度與有效數字', '不確定度的組合', '因次與因次分析']],
        [
          '2',
          '運動學－直線運動',
          ['位置、路徑長與位移', '速度與速率', '加速度', '等加速運動', '自由落體運動', '相對運動']
        ],
        ['3', '運動學－平面運動', ['向量的意義、分解與合成', '平面運動的位移', '水平拋射', '斜向拋射']],
        [
          '4',
          '牛頓運動定律',
          [
            '力的向量性質',
            '牛頓第一運動定律',
            '牛頓第二運動定律',
            '牛頓第三運動定律',
            '等速圓周運動與向心力',
            '簡諧運動'
          ]
        ],
        [
          '5',
          '萬有引力定律',
          ['萬有引力定律', '地球表面的重力與重力加速度', '行星與人造衛星的運動', '克卜勒定律與萬有引力定律']
        ]
      ]
    },
    {
      key: 'II',
      name: '選修物理Ⅱ 力學二與熱學',
      short: '選修Ⅱ',
      chapters: [
        ['1', '動量與角動量', ['動量與衝量', '系統質心運動', '動量守恆律', '角動量與力矩', '質點的角動量守恆律']],
        ['2', '牛頓運動定律的應用', ['靜力學與應用實例', '摩擦力']],
        ['3', '功與動能', ['定力所作的功', '變力所作的功', '動能與功能定理', '功率']],
        ['4', '位能與力學能守恆定律', ['重力位能', '重力位能的一般表示式', '彈性位能', '力學能守恆定律', '一維碰撞']],
        ['5', '熱學', ['絕對溫度與理想氣體方程式', '氣體運動論', '氣體分子的速率分布']]
      ]
    },
    {
      key: 'III',
      name: '選修物理Ⅲ 波動、光及聲音',
      short: '選修Ⅲ',
      chapters: [
        [
          '1',
          '波動',
          ['波的傳播', '振動與週期波', '繩波的反射與透射', '波的疊加原理', '駐波', '惠更斯原理', '水波的干涉']
        ],
        ['2', '聲波', ['聲波的傳播', '空氣柱的駐波', '共振與共鳴']],
        ['3', '光的折射及其應用', ['光的折射與司乃耳定律', '光的全反射', '光的色散與彩虹成因', '薄透鏡成像與應用']],
        ['4', '光的干涉與繞射', ['光的干涉', '光的繞射']]
      ]
    },
    {
      key: 'IV',
      name: '選修物理Ⅳ 電磁現象一',
      short: '選修Ⅳ',
      chapters: [
        ['1', '靜電學', ['庫侖定律', '電場與電力線', '電位能', '電位與電位差']],
        ['2', '電流的磁效應', ['電生磁', '載流導線的磁場', '載流導線在磁場中所受的磁力', '帶電質點在磁場中的運動']],
        ['3', '電磁感應', ['電磁感應與應電流', '冷次定律', '法拉第電磁感應定律', '電磁感應的應用', '電磁波']]
      ]
    },
    {
      key: 'V',
      name: '選修物理Ⅴ 電磁現象二與量子現象',
      short: '選修Ⅴ',
      chapters: [
        [
          '1',
          '電流與電路',
          ['電動勢與電流', '歐姆定律與電阻', '電阻的串聯與並聯', '電路中之電荷守恆與能量守恆', '電功率與電流的熱效應']
        ],
        ['2', '近代物理的重大發現', ['電子的發現', '密立坎油滴實驗', 'X射線', '黑體輻射', '光電效應']],
        [
          '3',
          '原子結構與原子核',
          [
            '拉塞福原子模型與原子光譜',
            '波耳的氫原子模型',
            '物質波與波粒二象性',
            '原子核的組成',
            '原子核衰變',
            '交互作用與守恆律'
          ]
        ]
      ]
    }
  ];
  const extensions = {
    'X-jh': ['國中銜接', '國中自然已學、高中課本未另立章節'],
    'X-uni': ['大一延伸', '超出高中課本，屬大一普通物理或進階內容'],
    'X-sci': ['課外延伸', '地球科學、攝影或生活應用，非物理課本章節']
  };
  const tags = {
    // 原有拋體頁
    projectile: ['I3-4', 'I3-3'],
    stairs: ['I3-4', 'II4-5'],
    'inclined-projectile': ['I3-4', 'I3-1'],
    // 運動學
    acceleration: ['I2-4', 'I2-3', 'B3-1'],
    vertical: ['I2-5', 'B3-1'],
    river: ['I2-6', 'I3-1'],
    pursuit: ['I2-4', 'I2-6'],
    'airplane-drop': ['I3-3', 'I2-6'],
    'safe-parabola': ['I3-4'],
    'relative-motion': ['I2-6', 'I3-2'],
    'shoot-monkey': ['I3-4', 'I2-5'],
    'incline-shadow': ['I3-2', 'I3-1'],
    'optimal-projectile': ['I3-4'],
    // 牛頓定律與摩擦
    drag: ['I4-3', 'B3-2'],
    friction: ['II2-2', 'I4-3'],
    incline: ['II2-2', 'I4-1', 'I4-3'],
    atwood: ['I4-3', 'I4-4'],
    'table-pulley': ['I4-3', 'II2-2'],
    elevator: ['I4-3', 'I4-4', 'B3-2'],
    'bicycle-friction': ['II2-2', 'II1-4'],
    'moving-atwood': ['I4-3', 'I4-4'],
    'conveyor-friction': ['II2-2', 'II3-1'],
    'spring-wire-cut': ['I4-3', 'II4-3'],
    'spring-atwood': ['I4-3', 'I4-6'],
    noninertial: ['I4-5', 'I2-6', 'X-uni'],
    // 功、能量、動量
    work: ['II3-2', 'II3-3'],
    'power-hoist': ['II3-4', 'II3-1', 'B5-3'],
    'gravitation-g': ['I5-1', 'I5-2'],
    'measurement-uncertainty': ['I1-1', 'I1-2'],
    'dimensional-analysis': ['I1-3'],
    'energy-track': ['II4-4', 'II4-1', 'B5-3'],
    collision: ['II4-5', 'II1-3'],
    'ballistic-pendulum': ['II1-3', 'II4-5', 'II4-4'],
    rocket: ['II1-1', 'II1-3'],
    'collision-2d': ['II4-5', 'II1-3', 'II1-4'],
    'center-of-mass': ['II1-2'],
    'projectile-explosion': ['II1-2', 'II1-3'],
    'recoiling-wedge': ['II1-3', 'I4-4'],
    'person-boat': ['II1-2', 'II1-3'],
    'ring-ball': ['II4-5', 'II1-3'],
    'wall-spring-pair': ['II1-2', 'II4-3'],
    'falling-spring': ['II4-3', 'II4-4'],
    'vertical-spring-pair': ['II4-3', 'I4-4'],
    'ball-rod': ['II1-5', 'II4-5'],
    'rough-bounce': ['II4-5', 'II1-4'],
    bungee: ['II4-3', 'II4-4'],
    // 圓周與轉動
    circular: ['I4-5'],
    banked: ['I4-5', 'II2-2'],
    conical: ['I4-5', 'II1-4'],
    'vertical-circle': ['I4-5', 'II4-4'],
    torque: ['II1-4', 'II2-1'],
    rolling: ['II1-4', 'II4-4'],
    'angular-momentum': ['II1-5', 'II1-4'],
    'massive-pulley': ['II1-4', 'I4-3'],
    'belt-wheels': ['I4-5', 'II1-4'],
    'bike-turn': ['I4-5', 'II2-2', 'II1-4'],
    'half-circle': ['I4-5', 'II4-4'],
    'pulled-spool': ['II1-4', 'II2-2'],
    'hole-table': ['II1-5', 'I4-5'],
    // 靜力學
    lever: ['II2-1', 'II1-4'],
    'slip-or-tip': ['II2-1', 'II2-2'],
    'block-stack': ['II2-1', 'II1-2'],
    'self-pull': ['II2-1', 'I4-4'],
    'hydrostatic-buoyancy': ['X-jh', 'II2-1'],
    // 振動
    spring: ['I4-6', 'II4-3'],
    pendulum: ['I4-6'],
    damped: ['I4-6', 'X-uni'],
    driven: ['I4-6', 'III2-3'],
    'pendulum-angle-comparison': ['I4-6'],
    'massive-spring': ['I4-6', 'II4-3'],
    'shm-projection': ['I4-6', 'I4-5'],
    'vertical-spring': ['I4-6', 'II4-3', 'II4-1'],
    'resonance-bank': ['III2-3', 'I4-6'],
    'coupled-oscillators': ['I4-6', 'X-uni'],
    'floating-block-shm': ['I4-6', 'X-jh'],
    // 萬有引力與天文
    orbit: ['I5-3', 'I5-4', 'II4-2'],
    'binary-stars': ['I5-3', 'II1-2', 'II4-2'],
    intercontinental: ['I5-3', 'II4-2'],
    'projectile-cone': ['I5-4', 'I3-3'],
    'moon-earth': ['B3-3', 'I5-3'],
    'sun-earth-moon': ['B3-3', 'X-sci'],
    'sun-earth': ['B3-3', 'X-sci'],
    'celestial-sphere': ['B3-3', 'X-sci'],
    // 熱學
    'joule-experiment': ['B5-3', 'II3-1'],
    'thermal-lattice': ['B5-2', 'II5-2'],
    'ideal-gas': ['II5-1', 'II5-2'],
    'maxwell-distribution': ['II5-3'],
    equipartition: ['II5-2', 'B5-2'],
    'adiabatic-pistons': ['II5-1', 'X-uni'],
    'pv-path': ['II5-1', 'B5-3', 'X-uni'],
    'carnot-engine': ['B5-3', 'X-uni'],
    // 波動與聲音
    'basic-waves': ['III1-1', 'III1-3', 'III1-2'],
    'standing-waves': ['III1-5', 'III1-4'],
    'longitudinal-tube': ['III2-2', 'III1-1'],
    'string-interface': ['III1-3'],
    'wave-polarization': ['III1-1', 'III1-2'],
    'wave-function': ['III1-2', 'III1-1'],
    'string-wave-energy': ['III1-2', 'X-uni'],
    'two-source-interference': ['III1-7', 'III1-4'],
    'resonance-column': ['III2-2', 'III2-3'],
    'vacuum-bell': ['III2-1'],
    'sound-speed': ['III2-1'],
    echo: ['III2-1'],
    doppler: ['B4-1', 'III2-1'],
    'sound-elements': ['III2-1', 'III1-2'],
    'violin-fourier': ['III2-2', 'III1-4'],
    'fourier-square': ['III1-4', 'X-uni'],
    // 幾何光學
    'plane-mirror': ['X-jh', 'B4-1'],
    'shared-mirror': ['X-jh'],
    'double-mirror': ['X-jh'],
    'conic-mirror': ['X-jh', 'X-uni'],
    'image-drawing': ['III3-4', 'X-jh'],
    'refraction-cart': ['III3-1', 'III1-6'],
    'layered-refraction': ['III3-1', 'III3-2'],
    'straw-cup': ['III3-1'],
    'apparent-depth': ['III3-1'],
    'sphere-lens': ['III3-2', 'III3-4'],
    rainbow: ['III3-3', 'III3-2'],
    'eye-lens': ['III3-4'],
    'dancing-image': ['III3-4'],
    'half-lens': ['III3-4'],
    'optical-parallax': ['III3-4'],
    'optical-instruments': ['III3-4'],
    'dolly-zoom': ['III3-4', 'X-sci'],
    // 物理光學
    'double-slit': ['III4-1', 'III4-2'],
    'aperture-pattern': ['III4-2', 'III4-1'],
    'diffraction-amplitudes': ['III4-2', 'III4-1'],
    'optical-grating': ['III4-1', 'III4-2'],
    'thin-film': ['III4-1', 'X-uni'],
    fresnel: ['III3-1', 'X-uni'],
    'optical-polarizers': ['IV3-5', 'X-uni'],
    'rgb-lights': ['B4-1', 'X-sci'],
    // 電與磁
    electroscope: ['IV1-1', 'B2-3'],
    'two-charges': ['IV1-2', 'IV1-4'],
    'gauss-surface': ['IV1-2', 'X-uni'],
    'parallel-capacitor': ['IV1-4', 'X-uni'],
    'wire-magnetic-field': ['IV2-2', 'IV2-1', 'B4-2'],
    'charged-particle': ['IV2-4'],
    'cathode-ray': ['IV1-3', 'V2-1'],
    'current-balance': ['IV2-3', 'B4-2'],
    'magnetic-induction': ['IV3-3', 'IV3-2', 'B4-3'],
    'eddy-current': ['IV3-2', 'IV3-4'],
    'generator-transformer': ['IV3-4', 'B4-3'],
    'circuit-rc': ['V1-3', 'V1-4', 'X-uni'],
    'rlc-resonance': ['IV3-4', 'X-uni'],
    'emf-power': ['V1-1', 'V1-2', 'V1-5'],
    // 近代物理
    photoelectric: ['V2-5', 'B6-1'],
    'blackbody-radiation': ['V2-4'],
    'hydrogen-spectrum': ['V3-2', 'V3-1', 'B6-3'],
    'radioactive-decay': ['V3-5', 'B5-4'],
    'matter-wave': ['V3-3', 'B6-2'],
    'quantum-well': ['V3-3', 'X-uni'],
    'hydrogen-orbitals': ['V3-2', 'X-uni'],
    'pn-junction': ['X-uni'],
    'rutherford-scattering': ['V3-1'],
    'nuclear-binding': ['V3-4', 'B5-4']
  };

  const sections = new Map();
  for (const book of books)
    for (const [chapter, chapterName, names] of book.chapters)
      names.forEach((name, index) => {
        const code = book.key + chapter + '-' + (index + 1);
        sections.set(code, {
          code,
          book: book.key,
          bookName: book.name,
          short: book.short,
          chapter: book.key + chapter,
          chapterName,
          number: chapter + '-' + (index + 1),
          name,
          label: book.short + ' ' + chapter + '-' + (index + 1),
          full: book.name + ' 第' + chapter + '章 ' + chapterName + '｜' + chapter + '-' + (index + 1) + ' ' + name
        });
      });
  for (const [code, [label, note]] of Object.entries(extensions))
    sections.set(code, {
      code,
      book: 'X',
      bookName: '課本外延伸',
      short: label,
      chapter: code,
      chapterName: label,
      number: '',
      name: note,
      label,
      full: label + '｜' + note,
      extension: true
    });

  function lookup(id) {
    return (tags[id] || []).map(code => sections.get(code)).filter(Boolean);
  }
  function chapterOptions() {
    const groups = books.map(book => ({
      label: book.name,
      options: book.chapters.map(([chapter, name]) => ({
        value: book.key + chapter,
        label: book.short + ' 第' + chapter + '章 ' + name
      }))
    }));
    groups.push({
      label: '課本外延伸',
      options: Object.entries(extensions).map(([code, [label]]) => ({ value: code, label }))
    });
    return groups;
  }
  function inChapter(id, chapter) {
    return lookup(id).some(section => section.chapter === chapter);
  }
  function searchText(id) {
    return lookup(id)
      .map(section => [section.label, section.chapterName, section.name, section.bookName].join(' '))
      .join(' ');
  }
  function render(element, id, doc) {
    if (!element) return;
    doc = doc || element.ownerDocument || root.document;
    const list = lookup(id);
    element.replaceChildren();
    element.hidden = !list.length;
    if (!list.length) return;
    const heading = doc.createElement('span');
    heading.className = 'textbook-heading';
    heading.textContent = '翰林版課本';
    element.append(heading);
    list.forEach((section, index) => {
      const chip = doc.createElement('span');
      chip.className = 'textbook-chip' + (index === 0 ? ' primary' : '') + (section.extension ? ' extension' : '');
      chip.textContent = section.extension ? section.label : section.label + ' ' + section.name;
      chip.title = section.full;
      element.append(chip);
    });
  }

  const api = {
    books,
    extensions,
    tags,
    sections,
    lookup,
    chapterOptions,
    inChapter,
    searchText,
    render,
    source: '翰林版 108 課綱：必修、選修Ⅰ–Ⅳ依 go100 版本對照表；選修Ⅴ依翰林互動式講義目錄'
  };
  if (typeof module === 'object' && module.exports) module.exports = api;
  root.Textbook = api;
  globalThis.Textbook = api;
})(typeof window !== 'undefined' ? window : globalThis);
