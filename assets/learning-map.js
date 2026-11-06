'use strict';

const learningBranches = [
  ['力學', '#8ee0c0', [
    ['1.1', '運動學', '運動學 天文', [['運動圖表與參考系', 'acceleration pursuit river relative-motion'], ['拋體運動', 'projectile stairs inclined-projectile vertical airplane-drop safe-parabola shoot-monkey optimal-projectile'], ['天體運動與觀察', 'celestial-sphere sun-earth moon-earth sun-earth-moon']]],
    ['1.2', '動力學', '牛頓定律 動力學 圓周與轉動 振動 萬有引力', [['受力與摩擦', 'drag friction incline elevator bicycle-friction conveyor-friction atwood table-pulley'], ['動量與碰撞', 'collision collision-2d ballistic-pendulum projectile-explosion center-of-mass ball-rod rough-bounce rocket ring-ball'], ['圓周、轉動與引力', 'circular banked conical torque rolling orbit binary-stars angular-momentum'], ['振動與共振', 'spring damped driven pendulum shm-projection resonance-bank coupled-oscillators bungee']]],
    ['1.3', '靜力學', '靜力學', [['平衡與力矩', 'lever block-stack slip-or-tip self-pull'], ['靜水壓與浮力', 'hydrostatic-buoyancy']]],
    ['1.4', '能量', '能量與動量', [['作功與能量守恆', 'work energy-track vertical-circle vertical-spring joule-experiment']]],
    ['1.5', '熱力學', '熱學', [['氣體狀態與熱過程', 'ideal-gas pv-path adiabatic-pistons'], ['微觀熱運動', 'thermal-lattice maxwell-distribution equipartition'], ['熱機循環與效率', 'carnot-engine']]]
  ]],
  ['波動與光學', '#9acaff', [
    ['2.1', '波動的性質', '波動 聲音', [['波形與傳播', 'basic-waves wave-function string-interface string-wave-energy wave-polarization'], ['疊加與駐波', 'standing-waves longitudinal-tube two-source-interference resonance-column'], ['聲音與頻譜', 'doppler echo sound-speed vacuum-bell sound-elements violin-fourier fourier-square']]],
    ['2.2', '幾何光學', '幾何光學', [['反射與折射', 'plane-mirror layered-refraction straw-cup apparent-depth rainbow sphere-lens'], ['成像與光學儀器', 'image-drawing half-lens eye-lens optical-parallax optical-instruments dolly-zoom']]],
    ['2.3', '物理光學', '波動光學', [['干涉與繞射', 'double-slit aperture-pattern optical-grating diffraction-amplitudes thin-film'], ['偏振與色彩', 'fresnel rgb-lights optical-polarizers']]]
  ]],
  ['電與磁', '#ffc183', [
    ['3.1', '靜電學', '電磁學', [['電荷、電場與電位', 'two-charges'], ['感應與接地', 'electroscope'], ['通量與高斯定律', 'gauss-surface'], ['電容與介電質', 'parallel-capacitor']]],
    ['3.2', '電流磁效應', '', [['通電導線與磁場', 'wire-magnetic-field'], ['磁力與帶電粒子', 'charged-particle']]],
    ['3.3', '電磁感應', '', [['磁通量與楞次定律', 'magnetic-induction'], ['渦電流與磁阻尼', 'eddy-current'], ['發電與變壓', 'generator-transformer']]],
    ['3.4', '電路學', '', [['串並聯與 RC 暫態', 'circuit-rc'], ['交流與 RLC 共振', 'rlc-resonance']]]
  ]],
  ['近代物理', '#d4b9ff', [
    ['4.1', '黑體輻射', '', [['溫度與熱輻射光譜', 'blackbody-radiation']]],
    ['4.2', '光電效應', '近代物理', [['光子、逸出功與遏止電壓', 'photoelectric']]],
    ['4.3', '物質波', '', [['德布羅意波與電子繞射', 'matter-wave']]],
    ['4.4', '原子模型的發展和波爾氫原子模型與能階', '', [['散射與原子模型', 'rutherford-scattering'], ['氫原子能階與譜線', 'hydrogen-spectrum']]],
    ['4.5', '量子力學、波函數、軌域', '', [['機率密度、定態與軌域', 'quantum-well hydrogen-orbitals']]],
    ['4.6', '半導體物理', '', [['能帶、載子與 PN 接面', 'pn-junction']]],
    ['4.7', '核物理', '', [['核種與半衰期', 'radioactive-decay'], ['結合能與反應能量', 'nuclear-binding']]]
  ]]
];

// Chapter-to-chapter routes only display while inspecting a chapter.
const prerequisites = {
  '1.2': ['1.1'], '1.3': ['1.2'], '1.4': ['1.2'], '1.5': ['1.4'],
  '2.1': ['1.2'], '2.3': ['2.1'], '3.2': ['1.2', '3.4'], '3.3': ['3.2', '3.4'],
  '4.1': ['1.5', '2.3'], '4.2': ['3.1', '3.4'], '4.3': ['2.1', '2.3'],
  '4.4': ['3.1', '4.3'], '4.5': ['4.3'], '4.6': ['4.4', '4.5', '3.4']
};

// These are entry points for each chapter, not labels for every experiment it contains.
const learningFocus = {
  '1.1': ['高中深化', '從等加速與拋體讀取位置、速度及加速度。'],
  '1.2': ['高中入門', '先辨認合力與加速度，再比較摩擦、碰撞和轉動。'],
  '1.3': ['高中深化', '用力矩與受力平衡解釋槓桿與堆疊。'],
  '1.4': ['高中入門', '比較動能與位能，留意外力作功與能量耗散。'],
  '1.5': ['高中深化', '先讀理想氣體狀態與溫度，熱機循環適合大一延伸。'],
  '2.1': ['高中入門', '從波速、波長與頻率開始，再操作疊加與駐波。'],
  '2.2': ['高中入門', '從反射與折射開始，薄透鏡成像為高中深化。'],
  '2.3': ['高中入門', '先觀察亮暗紋，再以相位差解釋干涉與繞射。'],
  '3.1': ['高中入門', '先建立電荷與電場概念，高斯面與介電質適合大一延伸。'],
  '3.2': ['高中深化', '先看直導線磁場，再比較帶電粒子受力與軌跡。'],
  '3.3': ['高中入門', '先觀察磁通變化引發感應，再用楞次定律解釋方向。'],
  '3.4': ['高中深化', '先讀簡單串並聯電路，RC 暫態與 RLC 為大一延伸。'],
  '4.1': ['高中深化', '比較溫度與光譜分布。公式的定量積分適合大一延伸。'],
  '4.2': ['高中入門', '分開調整光頻率與強度，觀察動能和電流。'],
  '4.3': ['高中入門', '先觀察電子雙縫落點，德布羅意波長的定量關係為高中深化。'],
  '4.4': ['高中深化', '用氫原子譜線連結能階差與光子能量。'],
  '4.5': ['進階', '從定態機率分布進入方井疊加與氫原子軌域。'],
  '4.6': ['進階', '先確認電位差與載子，再比較 PN 接面偏壓。'],
  '4.7': ['高中深化', '以多次放射性衰變取樣區分單次結果與統計期望。']
};
const aliases = {
  elevator: '電梯變重 視重', 'bicycle-friction': '腳踏車煞車', 'half-lens': '鏡頭遮一半',
  'eye-lens': '眼鏡', doppler: '救護車', 'pv-path': '打氣筒 PV圖',
  'magnetic-induction': '磁鐵穿過線圈 手搖發電', 'circuit-rc': '燈泡 電容充放電',
  photoelectric: '光電管 光電子 光電流'
};

const experimentPrerequisites = {
  'charged-particle': [['circular', '先讀向心加速度，再辨認磁力提供的向心分量。']],
  'eddy-current': [['magnetic-induction', '先辨認磁通變化率與感應電壓，再觀察閉合導體的電流。']],
  'generator-transformer': [['magnetic-induction', '先用磁鐵穿線圈理解法拉第定律，再看週期性磁通。']],
  'rlc-resonance': [['circuit-rc', '先讀取電阻和電容的端電壓，再比較交流相位。']],
  'carnot-engine': [['pv-path', '先用 P–V 圖面積理解作功，再比較封閉循環。']],
  'matter-wave': [['diffraction-amplitudes', '先比較相干的雙縫分布，再觀察逐次探測事件。']],
  'hydrogen-orbitals': [['quantum-well', '先區分波函數和機率密度，再觀察三維點雲。']],
  'pn-junction': [['two-charges', '先區分電場、電位和電位能，再讀接面的能帶障壁。']],
  'nuclear-binding': [['radioactive-decay', '先辨認核種和反應前後的變化，再比較質量差。']]
};

const learningActivities = {
  'optical-polarizers': [
    '首末兩片互相垂直時，插入第三片會更暗嗎？',
    '固定非偏振入射與末片 90°，比較移除中間片及放入 45° 中間片時的輸出。',
    '交叉兩片時輸出近零。中間片讓偏振方向先轉至 45°，再通過末片，理想輸出為入射強度的 12.5%。',
    '將入射改成沿首片的線偏振光，解釋同一組偏振片的輸出為何變成 25%。'
  ],
  'hydrostatic-buoyancy': [
    '方塊完全浸沒後，繼續向下壓會增加浮力嗎？',
    '保留 0.5 m 高方塊，手持底面深度先設 0.8 m，再設 1.2 m。比較頂底表壓及浮力。',
    '上下表壓一起增加，壓差不變，因此浮力不變。',
    '切換浮力平衡，將方塊密度設為液體的 70%，預測浸沒比例。'
  ],
  acceleration: [
    '車輛正在向前減速時，位置圖還會上升嗎？',
    '把初速設為 4 m/s、加速度設為 −2 m/s²。暫停在第 1 秒，依序切換位置、速度與加速度圖，讓三次讀值共用同一時刻。',
    '第 1 秒仍向前移動。位置圖斜率為正，速度圖斜率為負。第 2 秒速度過零，位置圖在此轉折。',
    '把初速反向，再從速度圖的有號面積解釋前兩秒的位移。'
  ],
  lever: [
    '較輕的重物能平衡另一端較重的重物嗎？',
    '用左側 2 kg、3 m，右側 3 kg、2 m，比較左右力矩。把左側力臂縮短至 2 m，觀察合力矩。',
    '兩側質量與力臂的乘積相等時力矩平衡。縮短左側力臂後，右側力矩較大。',
    '把兩側質量同時加倍，說明合力矩與支點支持力各如何改變。'
  ],
  'conveyor-friction': [
    '馬達經輸送帶作的功，會全部變成箱子的動能嗎？',
    '選等加速模式，把帶初速設 2 m/s、箱子初速和帶加速度設零。切換圖表中的動能、摩擦熱和驅動功，記下同一時刻的讀值。',
    '箱子滑動時，接觸傳入的功分成箱子動能增加與摩擦熱。開始同速後，這組設定下摩擦熱停止累積。',
    '把箱子初速改成與帶速相同，預測這次是否有摩擦熱。'
  ],
  'basic-waves': [
    '橫波波峰向右移動時，標記的質點會一起往右嗎？',
    '用模式 1 橫波，查看標記點與波峰，開啟追蹤點位移圖。保持波長不變並調高波速。',
    '波峰沿繩向前，標記點留在原來的橫向位置並上下振動。波速變大時，固定波長下的週期縮短。',
    '換成模式 2 縱波，說明粒子的振動方向與整體傳播方向。'
  ],
  "pv-path": [
    "同一起點和終點，作功一定相同嗎？",
    "保留預設起終點，播放兩條路徑並開啟 P–V 圖。比較面積與末端內能。",
    "淨作功依路徑而異，內能變化只取決於起終狀態。",
    "切換成循環，解釋內能變化歸零後，淨吸熱與淨作功為何相等。"
  ],
  "magnetic-induction": [
    "磁鐵到線圈中心時，電壓會最大嗎？",
    "先看磁通圖，再用同一播放位置查看感應電壓。",
    "中心磁通達極值，變化率為零，感應電壓也過零。",
    "把速度設零，說明有磁通時為何仍可沒有電壓。"
  ],
  "circuit-rc": [
    "電容加倍，充電到同一比例要多久？",
    "選 RC 充電，閉合開關，固定電阻並把電容加倍。以電容電壓圖找 63% 時刻。",
    "電壓到達約 63% 的時間為 RC，電容加倍後時間加倍。",
    "改成放電，說明相同時間常數後剩餘的電壓比例。"
  ],
  "photoelectric": [
    "低於截止頻率時，提高光強能打出電子嗎？",
    "把頻率設為 400 THz、逸出功設為 2.3 eV，遏止電壓設零。提高固定光子流率。",
    "每顆光子能量仍低於逸出功，模型中的發射率維持零。",
    "換成較低逸出功的材料，預測同一頻率能否放出電子。"
  ],
  "blackbody-radiation": [
    "溫度加倍時，峰值與總出射度會怎麼變？",
    "把比較溫度設為 3000 K，主溫度從 3000 K 調到 6000 K。開啟光譜圖。",
    "波長光譜峰值縮短為一半，總出射度變成 16 倍。",
    "把兩溫度設為 4000 K 和 8000 K，解釋比例為何相同。"
  ],
  "hydrogen-spectrum": [
    "同一對能階，吸收和發射會用不同波長嗎？",
    "固定兩個能階，切換吸收及發射。比較躍遷方向和波長。",
    "方向相反，能量差的絕對值與波長相同。",
    "換更大的能階差，預測對應波長會變長或變短。"
  ],
  "radioactive-decay": [
    "過一個半衰期，每次都剛好剩一半嗎？",
    "在一個半衰期對應的時間讀值，換三個不同種子。",
    "理論期望是初始數的一半，單次取樣會波動。",
    "增加樣本數，再比較相對偏差的典型大小。"
  ],
  "thin-film": [
    "膜厚設零後，薄膜折射率還影響反射嗎？",
    "把膜厚設零，在固定基底下改薄膜折射率並比較光譜。",
    "兩界面在零膜厚時合併為空氣與基底的界面。",
    "把膜厚調回非零，解釋反射為何開始依波長變化。"
  ],
  "matter-wave": [
    "逐一到達的電子能累積出干涉條紋嗎？",
    "固定種子播放至終點。切換路徑資訊並比較兩種落點與機率密度圖。",
    "相干時可逐漸看見條紋，完整路徑資訊時兩路機率相加。",
    "提高加速電壓，預測相干條紋間距。"
  ],
  "parallel-capacitor": [
    "插入介電質時，固定電壓和固定電荷會有何不同？",
    "維持板距 4 mm，把介電常數設為 4，分別播放兩種接線模式。",
    "兩者電容都增至四倍。接電源時電荷增加，斷開時電壓下降。",
    "改為只縮小板距，說明哪兩個量受接線條件限制。"
  ],
  "gauss-surface": [
    "球內電荷偏離中心，總通量會改變嗎？",
    "播放點電荷從球心穿出，對照場箭頭與精確淨通量。",
    "局部法向場會改變，球內淨通量固定。電荷出界後淨通量為零。",
    "反轉電荷，說明內部淨通量與場方向如何變化。"
  ],
  "quantum-well": [
    "定態與疊加的機率密度都會變嗎？",
    "將較高能階的機率權重從 0 調到 0.5，分別播放並觀察機率密度。",
    "單一定態的密度固定，兩個能階疊加的交叉項會隨相位改變。",
    "把井寬加倍，從讀值確認能階差及相位週期的改變。"
  ],
  "hydrogen-orbitals": [
    "2s 和 2p_z 都有相同的節面嗎？",
    "固定種子與點數，旋轉比較兩種點雲，再開啟徑向機率圖。",
    "2s 在特定半徑有球形節面，2p_z 有平面節點。",
    "切換 1s，說明為何中心附近的空間機率密度與徑向機率不是同一量。"
  ],
  "pn-junction": [
    "哪一側耗盡區較寬？",
    "固定反偏壓，先把 P 側濃度設低於 N 側，再互換濃度。",
    "摻雜較低的一側耗盡區較寬，兩側固定電荷量仍相抵。",
    "改為正偏壓，預測總耗盡寬度和障壁如何改變。"
  ],
  "rlc-resonance": [
    "電流峰值與相位過零會同時出現嗎？",
    "開啟共振曲線，將頻率滑到最接近共振讀值的位置，比較兩側相位。",
    "電抗在共振處互相抵消，電流達峰值，電壓與電流同相。",
    "提高電阻後，說明峰值變小與共振頻率是否改變。"
  ],
  "eddy-current": [
    "導電管會讓磁鐵更快落下嗎？",
    "使用同一磁鐵，分別播放絕緣管和導電管。讀取底端的實際模型時間與焦耳熱。",
    "導電時感應電流產生阻尼，下落較久，部分機械能轉成焦耳熱。",
    "增加等效環電阻，說明下落時間如何接近絕緣管結果。"
  ],
  "carnot-engine": [
    "調大膨脹比，熱機效率會提高嗎？",
    "固定兩熱源溫度，對照兩個膨脹比的 P–V 面積、淨作功和效率。",
    "膨脹比增大時，淨作功和吸熱一起增加，效率仍由兩溫度決定。",
    "降低冷源溫度並保持熱源不變，預測效率變化。"
  ],
  "wire-magnetic-field": [
    "把電流反向，磁針必定掉頭 180° 嗎？",
    "固定探針位置，在有背景場及背景場為零時各反轉一次電流。",
    "導線磁場一定反向，有背景場時磁針指向兩者的合場。",
    "在無背景場時把距離加倍，預測磁場大小和方向。"
  ],
  "charged-particle": [
    "電荷反向會讓速度變慢嗎？",
    "固定夾角與速率，切換電荷正負，比較軌跡和速率讀值。",
    "繞轉方向反向，速率不變，因為磁力與速度垂直。",
    "將夾角設為 0° 和 90°，說明兩種極限軌跡。"
  ],
  "generator-transformer": [
    "二次側匝數加倍，輸出電壓會加倍嗎？",
    "切換變壓器模式，保持一次側設定與電阻，改二次側匝數並比較電壓峰值。",
    "理想變壓器電壓比等於匝數比，固定負載電阻時功率隨電壓平方增加。",
    "切換發電機，說明磁通過零時為何電壓可達極值。"
  ],
  "rutherford-scattering": [
    "正電荷散開或集中，哪種更容易造成背向散射？",
    "用 12 MeV、碰撞參數 0 fm、擴散半徑 140 fm 比較兩條軌跡。",
    "集中電荷使粒子折返，擴散電荷使粒子穿過。",
    "略增碰撞參數，檢查大角偏轉會如何改變。"
  ],
  "nuclear-binding": [
    "融合與分裂都放能時，產物和反應物的質量有何差異？",
    "分別播放氘氚融合與鈾分裂，查看兩組產物的 Q 值。",
    "兩組 Q 值均為正，產物總質量較小，差值轉成反應能量。",
    "用反向反應解釋為何須供應同等能量。"
  ],
  'bicycle-friction': [
    '踩踏加速時，兩輪摩擦力會指向同一方向嗎？',
    '保留後輪驅動，把兩輪煞車力矩設為零。記錄兩個輪下箭頭和摩擦力讀值，再把驅動力矩設為零重做。',
    '後輪受向前摩擦力，前輪受向後摩擦力。前輪靠接觸力矩增加轉速。兩個力矩控制都歸零後，理想等速滑行時兩輪摩擦力為零。'
  ],
  bungee: [
    '繩索剛拉直後，跳躍者的下落速率還會增加嗎？',
    '把阻尼設為零並保留預設的其他參數。開啟鉛直速度時間圖，依序查看首次拉直、合力為零和最低點的標記。',
    '繩索剛拉直時伸長量為零，合力仍向下。彈力等於重力時，向下速率達極值。最低點的速度才首次回到零。'
  ],
  'half-lens': [
    '遮住一半透鏡，屏幕上的像會少一半嗎？',
    '保持屏距／理想像距為 1，開啟抽樣光線，把遮擋高度從 0% 調到 50%。比較十字像和相對光量讀值。',
    '像點的位置維持不變，開孔面積與相對光量都減半。試把屏幕移離焦平面，再觀察光斑形狀。'
  ],
  'diffraction-amplitudes': [
    '單縫只有一個開口，暗紋從哪裡來？',
    '選模式 2 單縫，將波長設為 400 nm、縫寬設為 100 μm、屏距設為 3 m。開啟分量顯示，從屏幕中央掃到約 12 mm 的第一條暗紋。',
    '中央各分量同相，合向量較長。暗紋處，各區間的場向量相消。換成模式 3 雙縫，仍可用先加場、再取模平方解釋亮暗。'
  ]
};

function buildLearningMap(catalogue) {
  const assignments = new Map();
  const chapters = learningBranches.flatMap(([branch, color, rows]) =>
    rows.map(([id, title, groups, topics]) => ({
      branch, color, id, title, groups: groups.split(' '),
      topics: topics.map(([name, ids]) => ({ name, ids: ids.split(' ').filter(Boolean), labs: [] }))
    })));
  for (const chapter of chapters) {
    for (const topic of chapter.topics) {
      for (const id of topic.ids) {
        if (assignments.has(id)) throw new Error('重複的實驗歸屬 ' + id);
        assignments.set(id, { chapter, topic });
      }
    }
  }
  for (const lab of catalogue) {
    let placement = assignments.get(lab.id);
    if (!placement) {
      const chapter = chapters.find(item => item.groups.includes(lab.group));
      if (!chapter) throw new Error('實驗缺少地圖歸屬 ' + lab.id);
      let topic = chapter.topics.find(item => item.name === lab.group);
      if (!topic) {
        topic = { name: lab.group, labs: [] };
        chapter.topics.push(topic);
      }
      placement = { chapter, topic };
    }
    placement.topic.labs.push(lab);
  }
  return chapters;
}

if (typeof module !== 'undefined' && module.exports) module.exports = { buildLearningMap, prerequisites };

function mountLearningMap(catalogue) {
  const chapters = buildLearningMap(catalogue);
  const board = document.getElementById('map-board');
  const detail = document.getElementById('map-detail');
  const search = document.getElementById('map-search');
  const viewport = document.getElementById('map-viewport');
  const selection = document.getElementById('map-selection');
  const points = new Map();
  const edges = [];
  const home = {yaw: .24, pitch: -.12};
  let scale = 1, yaw = home.yaw, pitch = home.pitch;

  function node(tag, content, className) {
    const element = document.createElement(tag);
    if (content) element.textContent = content;
    if (className) element.className = className;
    return element;
  }

  function rememberView() {
    const mapView = {scale, yaw, pitch, left: viewport.scrollLeft || 0, top: viewport.scrollTop || 0};
    history.replaceState({...history.state, mapView}, '');
    return mapView;
  }

  function applyScale() {
    board.style.width = scale === 1 ? '' : scale * 100 + '%';
    board.style.fontSize = scale + 'em';
    board.style.setProperty('--map-scale', scale);
  }

  function restoreView() {
    const view = history.state?.mapView;
    scale = view?.scale ?? 1;
    yaw = view?.yaw ?? home.yaw;
    pitch = view?.pitch ?? home.pitch;
    projectGraph();
    applyScale();
    viewport.scrollLeft = view?.left ?? 0;
    viewport.scrollTop = view?.top ?? 0;
  }

  function choose(chapter, lab, scroll = true) {
    const hash = '#map-' + chapter.id + (lab ? '/' + lab.id : '');
    if (location.hash !== hash) history.pushState({mapView: rememberView()}, '', hash);
    renderChapter();
    if (scroll) requestAnimationFrame(() => detail.scrollIntoView({ block: 'nearest' }));
    else if (window.matchMedia?.('(max-width: 760px)')?.matches) {
      requestAnimationFrame(() => selection.scrollIntoView({ block: 'nearest' }));
    }
  }

  function renderSelection(active) {
    const adjacent = new Map();
    for (const edge of edges) {
      const neighbor = edge.from === active ? edge.to : edge.to === active ? edge.from : null;
      if (neighbor) adjacent.set(neighbor, edge.kind === 'cross' ? (edge.to === active ? '建議先備' : '可接續') : '');
      edge.line.setAttribute('data-active', String(Boolean(neighbor)));
    }
    board.setAttribute('data-selection', String(Boolean(active)));
    for (const point of points.values()) {
      point.button.setAttribute('aria-pressed', String(point === active));
      point.button.setAttribute('data-state', point === active ? 'selected' : adjacent.has(point) ? 'neighbor' : active ? 'quiet' : 'idle');
    }
    selection.replaceChildren();
    if (!active) {
      selection.append(node('p', '四條學習路徑', 'map-selection-kicker'));
      selection.append(node('h3', '從任意一點開始'));
      selection.append(node('p', '大點是章節，小點是實驗。點一下，就能查看附近的節點。拖曳旋轉，或聚焦圖面後使用方向鍵。'));
      return;
    }
    selection.style.setProperty('--branch', active.chapter.color);
    selection.append(node('p', active.chapter.branch + ' / ' + active.chapter.id, 'map-selection-kicker'));
    selection.append(node('h3', active.title));
    if (active.lab) {
      const open = node('a', '開啟實驗 ↗', 'map-open');
      open.href = active.lab.href;
      open.addEventListener('click', rememberView);
      selection.append(open);
    } else {
      const [level, guidance] = learningFocus[active.chapter.id];
      selection.append(node('p', level + ' · ' + guidance));
    }
    selection.append(node('h4', '相鄰節點 · ' + adjacent.size));
    for (const [neighbor, relationship] of adjacent) {
      const button = node('button', neighbor.title + (relationship ? ' · ' + relationship : ''), 'map-neighbor');
      button.type = 'button';
      button.style.setProperty('--branch', neighbor.chapter.color);
      button.addEventListener('click', () => {
        choose(neighbor.chapter, neighbor.lab, false);
        neighbor.button.focus();
      });
      selection.append(button);
    }
  }

  function renderChapter() {
    const [chapterHash, labId] = (location.hash || '').split('/');
    const chapter = chapters.find(item => chapterHash === '#map-' + item.id);
    renderSelection(chapter ? points.get(labId) || points.get(chapter.id) : null);
    detail.replaceChildren();
    if (!chapter) {
      detail.append(node('p', '選擇章節，展開概念、實驗和建議先備路線。'));
      return;
    }
    detail.style.setProperty('--branch', chapter.color);
    detail.append(node('p', chapter.branch + ' / ' + chapter.id, 'map-path'));
    const heading = node('h3', chapter.title);
    heading.tabIndex = -1;
    detail.append(heading);
    const [level, guidance] = learningFocus[chapter.id];
    detail.append(node('p', level + ' · ' + guidance, 'map-guidance'));
    const routes = node('div', '', 'map-routes');
    const previous = prerequisites[chapter.id] || [];
    const next = chapters.filter(item => prerequisites[item.id]?.includes(chapter.id));
    for (const [label, ids] of [['建議先備', previous], ['可接續', next.map(item => item.id)]]) {
      if (!ids.length) continue;
      const row = node('div', label + ' ');
      for (const id of ids) {
        const target = chapters.find(item => item.id === id);
        const link = node('a', id + ' ' + target.title);
        link.href = '#map-' + id;
        link.addEventListener('click', event => {
          if (event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
          event.preventDefault();
          choose(target);
          detail.children[1].focus();
        });
        row.append(link);
      }
      routes.append(row);
    }
    detail.append(routes);
    const concepts = node('div', '', 'map-concepts');
    for (const topic of chapter.topics) {
      const section = node('section');
      section.append(node('h4', topic.name));
      if (!topic.labs.length) section.append(node('p', '規劃中'));
      for (const lab of topic.labs) {
        const link = node('a', lab.title + ' ↗');
        link.id = 'map-lab-' + lab.id;
        link.href = lab.href;
        if (lab.id === labId) link.setAttribute('aria-current', 'location');
        link.addEventListener('click', rememberView);
        section.append(link);
        for (const [parent, reason] of experimentPrerequisites[lab.id] || []) {
          const target = chapters.find(item => item.topics.some(group => group.labs.some(entry => entry.id === parent)));
          if (!target) continue;
          const parentLab = catalogue.find(entry => entry.id === parent);
          const route = node('a', '先看 → ' + parentLab.title, 'map-experiment-route');
          route.href = '#map-' + target.id + '/' + parent;
          route.title = reason;
          route.addEventListener('click', event => {
            if (event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
            event.preventDefault();
            choose(target, parentLab);
            document.getElementById('map-lab-' + parent)?.focus();
          });
          section.append(route);
        }
        const activity = learningActivities[lab.id];
        if (activity) {
          const [prompt, procedure, result, transfer] = activity;
          const guide = node('details', '', 'map-activity');
          guide.append(node('summary', '探究活動'), node('p', prompt), node('p', procedure));
          const answer = node('details');
          answer.append(node('summary', '核對觀察'), node('p', result));
          guide.append(answer);
          if (transfer) guide.append(node('p', '換個情境 · ' + transfer));
          section.append(guide);
        }
      }
      concepts.append(section);
    }
    detail.append(concepts);
  }

  const graphWidth = 1000, graphHeight = 780;
  const columns = learningBranches.map(([name]) => chapters.filter(chapter => chapter.branch === name));
  const ink = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  ink.setAttribute('class', 'map-edges');
  ink.setAttribute('viewBox', '0 0 ' + graphWidth + ' ' + graphHeight);
  ink.setAttribute('preserveAspectRatio', 'none');
  ink.setAttribute('aria-hidden', 'true');
  const graph = [ink];
  const edgeKeys = new Set();

  function addPoint(chapter, lab, x, y, z) {
    const id = lab?.id || chapter.id;
    const title = lab?.title || chapter.title;
    const button = node('button', '', lab ? 'map-point' : 'map-point map-hub');
    button.type = 'button';
    button.id = 'map-point-' + id;
    button.title = title;
    button.setAttribute('aria-label', chapter.branch + ' · ' + title);
    button.setAttribute('aria-controls', 'map-selection');
    button.style.setProperty('--branch', chapter.color);
    if (!lab) button.append(node('span', chapter.id + ' ' + title, 'map-hub-label'));
    button.addEventListener('click', () => choose(chapter, lab, false));
    const point = {id, title, chapter, lab, x, y, z, button};
    points.set(id, point);
    graph.push(button);
    return point;
  }

  function connect(from, to, kind) {
    const key = [from.id, to.id].sort().join('/');
    if (edgeKeys.has(key)) return;
    edgeKeys.add(key);
    const line = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    line.setAttribute('class', 'map-edge map-edge-' + kind);
    line.setAttribute('stroke', from.chapter.color);
    ink.append(line);
    edges.push({from, to, kind, line});
  }

  const legend = node('div', '', 'map-legend');
  graph.push(legend);
  function route(branch, progress) {
    const angle = [-1.56,-2.99,-.04,1.60][branch] + progress * .64;
    const radius = 39 + 290 * progress ** .82;
    return [Math.sin(angle)*radius, 287 - 585*progress, Math.cos(angle)*radius];
  }
  for (const [branch, items] of columns.entries()) {
    const label = node('h3', items[0].branch, 'map-route-name');
    label.style.setProperty('--branch', items[0].color);
    legend.append(label);
    let previous;
    for (const [index, chapter] of items.entries()) {
      const start = (index + .25) / items.length;
      const hub = addPoint(chapter, null, ...route(branch, start));
      if (previous) connect(previous, hub, 'trunk');
      previous = hub;
      const count = chapter.topics.reduce((sum, topic) => sum + topic.labs.length, 0);
      let cell = 0;
      for (const topic of chapter.topics) {
        let last = hub;
        for (const lab of topic.labs) {
          const progress = (index + .3 + .67 * (++cell / (count + 1))) / items.length;
          const [x,y,z] = route(branch, progress);
          const azimuth = cell * 2.399963 + index;
          const spread = 15 + Math.min(49, count * 2.5) * Math.sqrt((cell % 7 + 1)/8);
          const point = addPoint(chapter, lab, x+spread*Math.cos(azimuth), y, z+spread*Math.sin(azimuth));
          connect(last, point, 'local');
          last = point;
        }
      }
    }
  }

  function projectGraph() {
    const cy = Math.cos(yaw), sy = Math.sin(yaw), cx = Math.cos(pitch), sx = Math.sin(pitch);
    for (const point of points.values()) {
      const x = point.x*cy - point.z*sy;
      const z = point.x*sy + point.z*cy;
      const y = point.y*cx - z*sx;
      const depth = point.y*sx + z*cx;
      const factor = 1380/(1380-depth);
      point.screenX = graphWidth/2 + x*factor*.90;
      point.screenY = graphHeight/2 + y*factor*.90;
      point.button.style.left = point.screenX/graphWidth*100+'%';
      point.button.style.top = point.screenY/graphHeight*100+'%';
      point.button.style.zIndex = String(500+Math.round(depth));
      point.button.style.setProperty('--point-scale', factor);
    }
    for (const {from,to,line} of edges) {
      line.setAttribute('d', 'M '+from.screenX+' '+from.screenY+' L '+to.screenX+' '+to.screenY);
    }
  }

  for (const [id, parents] of Object.entries(prerequisites)) {
    for (const parent of parents) connect(points.get(parent), points.get(id), 'cross');
  }
  for (const [id, parents] of Object.entries(experimentPrerequisites)) {
    for (const [parent] of parents) connect(points.get(parent), points.get(id), 'cross');
  }

  const results = document.getElementById('map-results');
  search.addEventListener('input', () => {
    results.replaceChildren();
    const query = search.value.trim().toLowerCase();
    if (!query) return;
    const matches = [];
    for (const chapter of chapters) {
      const path = chapter.branch + ' / ' + chapter.title;
      if (path.toLowerCase().includes(query) || chapter.id === query) matches.push({ chapter, title: path });
      for (const topic of chapter.topics) {
        if (topic.name.toLowerCase().includes(query)) matches.push({ chapter, title: path + ' / ' + topic.name });
        for (const lab of topic.labs) {
          if ([lab.title, lab.id, lab.formula, aliases[lab.id]].join(' ').toLowerCase().includes(query)) {
            matches.push({ chapter, lab, title: path + ' / ' + topic.name + ' / ' + lab.title });
          }
        }
      }
    }
    results.append(node('p', matches.length ? '找到 ' + matches.length + ' 個結果' : '找不到符合的概念或實驗'));
    for (const { chapter, lab, title } of matches) {
      const link = node('a', title);
      link.href = '#map-' + chapter.id + (lab ? '/' + lab.id : '');
      link.addEventListener('click', event => {
        if (event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
        event.preventDefault();
        choose(chapter, lab, false);
        points.get(lab?.id || chapter.id)?.button.focus();
      });
      results.append(link);
    }
  });
  for (const [id, step] of [['out', -.2], ['in', .2], ['reset', 0]]) {
    const button = document.getElementById('map-zoom-' + id);
    button.addEventListener('click', () => {
      scale = step ? Math.min(1.8, Math.max(1, scale + step)) : 1;
      applyScale();
      if (!step) {
        yaw = home.yaw;
        pitch = home.pitch;
        projectGraph();
        viewport.scrollLeft = 0;
        viewport.scrollTop = 0;
      }
      rememberView();
    });
  }
  let gesture, moved = false;
  function rotate(dx, dy) {
    yaw += dx;
    pitch = Math.max(-1.15, Math.min(1.15, pitch + dy));
    projectGraph();
  }
  board.addEventListener('pointerdown', event => {
    if (event.button !== 0 || !event.isPrimary) return;
    gesture = {id: event.pointerId, x: event.clientX, y: event.clientY};
    moved = false;
  });
  board.addEventListener('pointermove', event => {
    if (gesture?.id !== event.pointerId) return;
    const dx = event.clientX - gesture.x, dy = event.clientY - gesture.y;
    if (!moved && Math.hypot(dx,dy) < 5) return;
    if (!moved) {
      moved = true;
      board.setPointerCapture(event.pointerId);
    }
    rotate(dx*.009, dy*.007);
    gesture.x = event.clientX;
    gesture.y = event.clientY;
  });
  function finishRotation(event) {
    if (gesture?.id !== event.pointerId) return;
    if (moved) rememberView();
    gesture = null;
  }
  board.addEventListener('pointerup', finishRotation);
  board.addEventListener('pointercancel', finishRotation);
  board.addEventListener('click', event => {
    if (moved && event.detail) {
      event.stopPropagation();
      event.preventDefault();
      moved = false;
    }
  }, true);
  viewport.addEventListener('keydown', event => {
    if (event.target !== viewport) return;
    const direction = {ArrowLeft:[-.13,0],ArrowRight:[.13,0],ArrowUp:[0,-.13],ArrowDown:[0,.13]}[event.key];
    if (!direction) return;
    event.preventDefault();
    rotate(...direction);
    rememberView();
  });

  window.addEventListener('hashchange', () => {
    renderChapter();
    restoreView();
  });
  window.addEventListener('pagehide', rememberView);
  board.classList.add('map-graph');
  board.style.setProperty('--graph-ratio', graphWidth + ' / ' + graphHeight);
  board.replaceChildren(...graph);
  document.getElementById('map-stage').classList.add('map-stage-active');
  selection.hidden = false;
  renderChapter();
  restoreView();
  document.getElementById('map-tools').hidden = false;
  document.getElementById('map-fallback-hint').hidden = true;
}
