const fs = require("fs");

const KANJI_N5 = JSON.parse(fs.readFileSync("data/kanji_n5.json", "utf8")).kanji;
const KANJI_N3 = JSON.parse(fs.readFileSync("data/kanji_n3.json", "utf8")).kanji;

const DAKUON_MAP = {
  "か": "が", "が": "か",
  "き": "ぎ", "ぎ": "き",
  "く": "ぐ", "ぐ": "く",
  "け": "げ", "げ": "け",
  "こ": "ご", "ご": "こ",
  "さ": "ざ", "ざ": "さ",
  "し": "じ", "じ": "し",
  "す": "ず", "ず": "す",
  "せ": "ぜ", "ぜ": "せ",
  "そ": "ぞ", "ぞ": "そ",
  "た": "だ", "だ": "た",
  "ち": "ぢ", "ぢ": "ち",
  "つ": "づ", "づ": "つ",
  "て": "で", "で": "て",
  "と": "ど", "ど": "と",
  "は": "ば", "ば": "ぱ", "ぱ": "は",
  "ひ": "び", "び": "ぴ", "ぴ": "ひ",
  "ふ": "ぶ", "ぶ": "ぷ", "ぷ": "ふ",
  "へ": "べ", "べ": "ぺ", "ぺ": "へ",
  "ほ": "ぼ", "ぼ": "ぽ", "ぽ": "ほ",
};

const HIRAGANA_SIMILAR = {
  "ひ": ["ほ", "ふ", "へ"],
  "と": ["ど", "て", "つ"],
  "ね": ["れ", "わ", "ぬ"],
  "れ": ["ね", "わ", "る"],
  "わ": ["ね", "れ", "ろ"],
  "さ": ["ち", "き", "ざ"],
  "ち": ["さ", "ら", "ぢ"],
  "ろ": ["る", "ろ", "ら"],
  "る": ["ろ", "う", "え"],
  "ぬ": ["め", "ね", "あ"],
  "め": ["ぬ", "あ", "ゆ"],
  "あ": ["お", "め", "ぬ"],
  "お": ["あ", "む", "す"],
  "ま": ["ほ", "も", "は"],
  "い": ["り", "こ", "け"],
  "り": ["い", "ソ", "リ"],
  "す": ["む", "ず", "お"],
  "む": ["す", "お", "ろ"],
  "な": ["た", "ね", "は"],
  "た": ["な", "だ", "に"],
  "に": ["こ", "い", "た"],
  "か": ["が", "や", "力"],
  "し": ["じ", "つ", "レ"],
};

function cleanReading(r) {
  if (!r) return "";
  return r.replace(/[.\-]/g, "").trim();
}

function generateReadingDistractors(answer, kanji, pool) {
  const distractors = new Set();
  const ans = cleanReading(answer);
  if (!ans) return [];

  // 1. Alternative readings of the exact same kanji (Kun vs On, or multiple on/kun)
  const allReadings = [
    ...(kanji.on || (kanji.on_reading ? kanji.on_reading.split(", ") : [])),
    ...(kanji.kun || (kanji.kun_reading ? kanji.kun_reading.split(", ") : []))
  ].map(cleanReading).filter(r => r && r !== ans);

  for (const r of allReadings) {
    if (distractors.size >= 3) break;
    if (r !== ans && !distractors.has(r)) distractors.add(r);
  }

  // 2. Dakuon / Handakuon swap (Tenten / Maru)
  if (distractors.size < 3) {
    const chars = ans.split("");
    for (let i = 0; i < chars.length; i++) {
      if (DAKUON_MAP[chars[i]]) {
        const copy = [...chars];
        copy[i] = DAKUON_MAP[chars[i]];
        const candidate = copy.join("");
        if (candidate !== ans && !distractors.has(candidate)) {
          distractors.add(candidate);
          if (distractors.size >= 3) break;
        }
      }
    }
  }

  // 3. Chōon (long vowel) add/remove
  if (distractors.size < 3) {
    if (ans.includes("う") && ans.length > 2) {
      const removed = ans.replace(/う/g, "");
      if (removed && removed !== ans && !distractors.has(removed)) distractors.add(removed);
    } else if (ans.includes("い") && ans.length > 2) {
      const removed = ans.replace(/い/g, "");
      if (removed && removed !== ans && !distractors.has(removed)) distractors.add(removed);
    } else {
      // Add long vowel
      const added = ans + "う";
      if (!distractors.has(added)) distractors.add(added);
    }
  }

  // 4. Sokuon (っ) add/remove
  if (distractors.size < 3) {
    if (ans.includes("っ")) {
      const removed = ans.replace(/っ/g, "");
      if (removed !== ans && !distractors.has(removed)) distractors.add(removed);
    } else if (ans.length >= 2) {
      const added = ans[0] + "っ" + ans.slice(1);
      if (!distractors.has(added)) distractors.add(added);
    }
  }

  // 5. Look-alike Hiragana replacement (e.g., ひと -> ほと, ろ -> る, etc.)
  if (distractors.size < 3) {
    const chars = ans.split("");
    for (let i = 0; i < chars.length; i++) {
      const sim = HIRAGANA_SIMILAR[chars[i]];
      if (sim) {
        for (const replacement of sim) {
          const copy = [...chars];
          copy[i] = replacement;
          const candidate = copy.join("");
          if (candidate !== ans && !distractors.has(candidate)) {
            distractors.add(candidate);
            if (distractors.size >= 3) break;
          }
        }
      }
      if (distractors.size >= 3) break;
    }
  }

  // 6. Pool fallback from same level
  if (distractors.size < 3 && pool && pool.length) {
    for (const other of pool) {
      if (distractors.size >= 3) break;
      const otherReading = cleanReading(
        (other.kun && other.kun[0]) || (other.kun_reading && other.kun_reading.split(",")[0]) ||
        (other.on && other.on[0]) || (other.on_reading && other.on_reading.split(",")[0]) || ""
      );
      if (otherReading && otherReading !== ans && !distractors.has(otherReading)) {
        distractors.add(otherReading);
      }
    }
  }

  return Array.from(distractors).slice(0, 3);
}

// Test with a few kanji
const testKanji = [
  KANJI_N5.find(k => k.character === "人" || k.char === "人"),
  KANJI_N5.find(k => k.character === "日" || k.char === "日"),
  KANJI_N5.find(k => k.character === "山" || k.char === "山"),
  KANJI_N5.find(k => k.character === "学" || k.char === "学"),
  KANJI_N3.find(k => k.character === "政" || k.char === "政"),
];

for (const k of testKanji) {
  const ans = cleanReading((k.kun && k.kun[0]) || (k.kun_reading && k.kun_reading.split(",")[0]) || (k.on && k.on[0]) || (k.on_reading && k.on_reading.split(",")[0]));
  const dist = generateReadingDistractors(ans, k, KANJI_N5);
  console.log(`Kanji: ${k.character || k.char} | Answer: ${ans} | Distractors:`, dist);
}

const CONFUSABLE_KANJI = {
  "人": ["入", "八", "大", "今"],
  "入": ["人", "八", "内", "大"],
  "八": ["人", "入", "ハ", "六"],
  "日": ["白", "目", "田", "旧"],
  "白": ["日", "百", "自", "目"],
  "百": ["白", "日", "自", "万"],
  "目": ["日", "白", "自", "貝"],
  "月": ["日", "朋", "用", "円"],
  "木": ["本", "休", "林", "未"],
  "本": ["木", "体", "休", "大"],
  "休": ["体", "本", "保", "木"],
  "体": ["休", "本", "作", "位"],
  "大": ["太", "犬", "天", "文"],
  "太": ["大", "犬", "天", "木"],
  "犬": ["太", "大", "天", "伏"],
  "天": ["夫", "大", "太", "矢"],
  "右": ["左", "石", "若", "古"],
  "左": ["右", "在", "庄", "石"],
  "石": ["右", "左", "古", "名"],
  "名": ["石", "各", "夕", "月"],
  "夕": ["名", "多", "久", "外"],
  "多": ["夕", "名", "外", "移"],
  "外": ["多", "処", "名", "夕"],
  "上": ["下", "止", "正", "土"],
  "下": ["上", "不", "与", "卞"],
  "土": ["士", "工", "十", "生"],
  "士": ["土", "工", "十", "牛"],
  "千": ["十", "干", "于", "チ"],
  "万": ["方", "力", "切", "木"],
  "方": ["万", "力", "芳", "片"],
  "力": ["刀", "万", "方", "カ"],
  "刀": ["力", "刃", "切", "分"],
  "分": ["切", "八", "刃", "公"],
  "切": ["初", "辺", "刀", "分"],
  "牛": ["午", "半", "年", "生"],
  "午": ["牛", "半", "年", "平"],
  "半": ["羊", "平", "年", "牛"],
  "年": ["牛", "午", "半", "平"],
  "先": ["生", "失", "洗", "元"],
  "生": ["先", "牛", "性", "正"],
  "手": ["毛", "千", "年", "乎"],
  "足": ["定", "走", "是", "疋"],
  "見": ["貝", "現", "視", "規"],
  "貝": ["見", "頁", "買", "貞"],
  "聞": ["問", "間", "開", "閉"],
  "問": ["聞", "間", "開", "向"],
  "間": ["問", "聞", "開", "関"],
  "開": ["関", "閉", "問", "聞"],
  "閉": ["開", "関", "間", "問"],
  "話": ["語", "読", "認", "詩"],
  "語": ["話", "読", "誤", "論"],
  "読": ["語", "話", "続", "買"],
  "書": ["昼", "画", "事", "筆"],
  "昼": ["書", "画", "尺", "尽"],
  "画": ["昼", "書", "田", "角"],
  "時": ["持", "侍", "待", "特"],
  "待": ["持", "特", "侍", "時"],
  "持": ["待", "特", "時", "指"],
  "特": ["待", "持", "時", "物"],
  "行": ["待", "街", "術", "得"],
  "来": ["米", "未", "末", "東"],
  "東": ["来", "車", "重", "束"],
  "西": ["酉", "要", "茜", "四"],
  "南": ["男", "商", "楠", "幸"],
  "北": ["化", "比", "兆", "此"],
  "校": ["村", "枚", "枝", "検"],
  "店": ["座", "床", "広", "府"],
  "買": ["員", "頁", "貿", "貸"],
  "売": ["買", "読", "殻", "壺"],
  "飲": ["飯", "飽", "飼", "飾"],
  "飯": ["飲", "館", "飼", "飾"],
  "館": ["飯", "館", "宿", "舗"],
  "道": ["通", "追", "首", "進"],
  "通": ["道", "進", "透", "送"],
  "母": ["毎", "舟", "女", "丹"],
  "毎": ["母", "海", "毒", "敏"],
  "父": ["交", "文", "友", "支"],
  "友": ["反", "支", "抜", "灰"],
  "兄": ["祝", "況", "兒", "克"],
  "弟": ["第", "梯", "弔", "悌"],
  "姉": ["妹", "娘", "婦", "市"],
  "妹": ["姉", "娘", "味", "株"],
  "雨": ["雪", "雷", "雲", "電"],
  "雪": ["雨", "雷", "雲", "電"],
  "電": ["雷", "雪", "雲", "雨"],
  "魚": ["角", "亀", "魯", "漁"],
  "鳥": ["烏", "島", "鳴", "鶏"],
  "島": ["鳥", "烏", "嶋", "山"],
  "車": ["東", "連", "陣", "軒"],
  "長": ["張", "帳", "髪", "良"],
  "高": ["亮", "亭", "京", "豪"],
  "安": ["家", "案", "妥", "委"],
  "新": ["親", "薪", "斤", "斬"],
  "古": ["右", "吉", "舌", "台"],
  "少": ["小", "歩", "抄", "妙"],
  "小": ["少", "水", "不", "心"],
  "早": ["草", "卓", "旱", "昇"],
  "花": ["化", "草", "茶", "苛"],
  "草": ["早", "花", "苛", "菓"],
  "茶": ["草", "荼", "菓", "葉"],
  "何": ["向", "荷", "河", "伺"],
  "私": ["和", "科", "利", "秒"],
  "赤": ["青", "赫", "亦", "変"],
  "青": ["赤", "静", "晴", "精"],
  "黒": ["里", "墨", "点", "黙"],
  "金": ["銀", "鉄", "針", "全"],
  "銀": ["金", "良", "根", "眼"],
  "借": ["貸", "惜", "昔", "錯"],
  "貸": ["借", "賃", "貨", "袋"],
  "知": ["短", "和", "智", "矩"],
  "短": ["知", "矢", "矩", "矯"],
  "会": ["合", "今", "全", "命"],
  "合": ["会", "今", "台", "吉"],
  "社": ["杜", "祁", "神", "礼"],
  "神": ["社", "申", "伸", "袖"],
  "病": ["痛", "疾", "症", "療"],
  "院": ["完", "官", "宅", "客"],
  "強": ["弱", "弓", "弧", "張"],
  "弱": ["強", "羽", "習", "溺"],
  "理": ["埋", "里", "野", "重"],
  "重": ["動", "童", "車", "量"],
  "動": ["働", "重", "勲", "助"],
  "働": ["動", "体", "侍", "値"],
  "教": ["考", "散", "敬", "数"],
  "室": ["屋", "堂", "宅", "完"],
  "屋": ["室", "居", "届", "層"],
  "考": ["老", "教", "者", "孝"],
  "始": ["終", "治", "姑", "妥"],
  "終": ["始", "緒", "冬", "糸"],
  "運": ["連", "遠", "達", "進"],
  "転": ["伝", "軽", "車", "芸"],
  "起": ["超", "走", "趣", "越"],
  "寝": ["侵", "浸", "掃", "婦"],
  "歩": ["止", "少", "渉", "涉"],
  "走": ["足", "起", "越", "赴"],
  "乗": ["条", "乘", "余", "秉"],
  "降": ["隊", "階", "除", "隆"],
  "使": ["便", "任", "史", "促"],
  "作": ["昨", "詐", "休", "件"],
  "着": ["看", "差", "著", "羞"],
  "急": ["息", "悪", "忽", "恋"],
  "研": ["確", "破", "砂", "石"],
  "究": ["突", "空", "穴", "窃"],
  "答": ["合", "落", "谷", "筒"],
  "質": ["賃", "贄", "斤", "貝"],
  // N3 lookalikes
  "政": ["整", "故", "敏", "攻"],
  "治": ["始", "法", "注", "沿"],
  "経": ["軽", "径", "怪", "茎"],
  "済": ["清", "斉", "削", "渋"],
  "法": ["治", "注", "泣", "波"],
  "律": ["建", "津", "筆", "待"],
  "際": ["察", "祭", "境", "障"],
  "関": ["開", "閉", "闘", "閃"],
  "係": ["孫", "保", "信", "修"],
  "配": ["酒", "酎", "酸", "妃"],
  "増": ["僧", "贈", "憎", "層"],
  "減": ["滅", "感", "威", "戚"],
  "感": ["惑", "咸", "盛", "減"],
  "情": ["請", "清", "晴", "静"],
  "確": ["研", "礁", "磯", "穫"],
  "認": ["話", "忍", "刃", "誇"],
  "適": ["滴", "敵", "摘", "適"],
  "過": ["遇", "鍋", "禍", "邁"],
  "約": ["的", "釣", "灼", "酌"],
  "備": ["準", "奮", "徳", "具"],
  "整": ["政", "正", "束", "頼"],
  "受": ["愛", "妥", "采", "授"],
  "払": ["拡", "広", "私", "抜"],
  "渡": ["度", "波", "済", "液"],
  "返": ["反", "友", "及", "近"],
  "変": ["恋", "亦", "蛮", "赤"],
  "信": ["言", "伸", "倍", "任"],
  "直": ["真", "具", "植", "省"],
  "面": ["首", "画", "自", "百"],
  "向": ["回", "同", "局", "周"],
  "容": ["客", "谷", "溶", "空"],
  "現": ["見", "視", "規", "理"],
  "象": ["像", "家", "豪", "免"],
  "情": ["性", "清", "晴", "精"]
};

function getConfusableKanji(targetChar, targetKanji, allKanji) {
  const distractors = new Set();
  
  // 1. Curated list
  if (CONFUSABLE_KANJI[targetChar]) {
    for (const c of CONFUSABLE_KANJI[targetChar]) {
      if (c !== targetChar) distractors.add(c);
      if (distractors.size >= 3) break;
    }
  }

  // 2. Same radical fallback
  if (distractors.size < 3 && targetKanji) {
    const rad = targetKanji.radical || (targetKanji.radical_info && targetKanji.radical_info.radical_character);
    if (rad) {
      for (const other of allKanji) {
        if (distractors.size >= 3) break;
        const oChar = other.character || other.char;
        const oRad = other.radical || (other.radical_info && other.radical_info.radical_character);
        if (oChar && oChar !== targetChar && oRad === rad && !distractors.has(oChar)) {
          distractors.add(oChar);
        }
      }
    }
  }

  // 3. Similar stroke count (±1 stroke) in same level
  if (distractors.size < 3 && targetKanji) {
    for (const other of allKanji) {
      if (distractors.size >= 3) break;
      const oChar = other.character || other.char;
      if (oChar && oChar !== targetChar && Math.abs((other.strokes || 0) - (targetKanji.strokes || 0)) <= 1 && !distractors.has(oChar)) {
        distractors.add(oChar);
      }
    }
  }

  return Array.from(distractors).slice(0, 3);
}

const confTest = ["人", "右", "待", "政", "感", "受"];
for (const c of confTest) {
  const kObj = [...KANJI_N5, ...KANJI_N3].find(k => (k.character || k.char) === c);
  console.log(`Kanji: ${c} | Confusable distractors:`, getConfusableKanji(c, kObj, [...KANJI_N5, ...KANJI_N3]));
}
