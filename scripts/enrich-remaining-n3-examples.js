const fs = require("fs");

const n3Path = "data/kanji_n3.json";
const n3 = JSON.parse(fs.readFileSync(n3Path, "utf8"));

// High quality sentences for the 58 kanji
const SENTENCES_FOR_58 = {
  "米": {
    japanese: "日本人は米をよく食べます。",
    reading: "にほんじん は こめ を よく たべます",
    romaji: "Nihonjin wa kome o yoku tabemasu.",
    meaningBn: "জাপানিরা প্রায়শই চাল/ভাত খায়।",
    meaningEn: "Japanese people often eat rice.",
    ruby: "<ruby>日本人<rt>にほんじん</rt></ruby>は<ruby>米<rt>こめ</rt></ruby>をよく<ruby>食<rt>た</rt></ruby>べます。",
    tts: "にほんじんはこめをよくたべます",
    situationBn: "খাবার ও খাদ্যাভ্যাস"
  },
  "治": {
    japanese: "病気がすっかり治りました。",
    reading: "びょうき が すっかり なおりました",
    romaji: "Byouki ga sukkari naorimashita.",
    meaningBn: "অসুখটি সম্পূর্ণ সেরে গেছে।",
    meaningEn: "The illness has completely healed.",
    ruby: "<ruby>病気<rt>びょうき</rt></ruby>がすっかり<ruby>治<rt>なお</rt></ruby>りました。",
    tts: "びょうきがすっかりなおりました",
    situationBn: "স্বাস্থ্য ও আরোগ্য"
  },
  "初": {
    japanese: "初めて日本へ行きました。",
    reading: "はじめて にほん え いきました",
    romaji: "Hajimete Nihon e ikimashita.",
    meaningBn: "প্রথমবারের মতো জাপানে গিয়েছিলাম।",
    meaningEn: "I went to Japan for the first time.",
    ruby: "<ruby>初<rt>はじ</rt></ruby>めて<ruby>日本<rt>にほん</rt></ruby>へ<ruby>行<rt>い</rt></ruby>きました。",
    tts: "はじめてにほんへいきました",
    situationBn: "ভ্রমণ ও প্রথম অভিজ্ঞতা"
  },
  "側": {
    japanese: "道の右側を歩いてください。",
    reading: "みち の みぎがわ を あるいて ください",
    romaji: "Michi no migigawa o aruite kudasai.",
    meaningBn: "রাস্তার ডান পাশ দিয়ে হাঁটুন।",
    meaningEn: "Please walk on the right side of the road.",
    ruby: "<ruby>道<rt>みち</rt></ruby>の<ruby>右側<rt>みぎがわ</rt></ruby>を<ruby>歩<rt>ある</rt></ruby>いてください。",
    tts: "みちのみぎがわをあるいてください",
    situationBn: "পথনির্দেশ"
  },
  "官": {
    japanese: "彼は裁判官になりました。",
    reading: "かれ は さいばんかん に なりました",
    romaji: "Kare wa saibankan ni narimashita.",
    meaningBn: "তিনি বিচারক হয়েছিলেন।",
    meaningEn: "He became a judge.",
    ruby: "<ruby>彼<rt>かれ</rt></ruby>は<ruby>裁判官<rt>さいばんかん</rt></ruby>になりました。",
    tts: "かれはさいばんかんになりました",
    situationBn: "পেশা ও আইন"
  },
  "歳": {
    japanese: "妹は今年二十歳になります。",
    reading: "いもうと は ことし はたち に なります",
    romaji: "Imouto wa kotoshi hatachi ni narimasu.",
    meaningBn: "আমার ছোট বোন এই বছর বিশ বছর পূর্ণ করবে।",
    meaningEn: "My younger sister turns twenty this year.",
    ruby: "<ruby>妹<rt>いもうと</rt></ruby>は<ruby>今年<rt>ことし</rt></ruby><ruby>二十歳<rt>はたち</rt></ruby>になります。",
    tts: "いもうとはことしはたちになります",
    situationBn: "বয়স ও পরিবার"
  },
  "規": {
    japanese: "学校の規則を守らなければなりません。",
    reading: "がっこう の きそく を まもらなければ なりません",
    romaji: "Gakkou no kisoku o mamoranakereba narimasen.",
    meaningBn: "স্কুলের নিয়মকানুন মেনে চলতে হবে।",
    meaningEn: "You must follow school rules.",
    ruby: "<ruby>学校<rt>がっこう</rt></ruby>の<ruby>規則<rt>きそく</rt></ruby>を<ruby>守<rt>まも</rt></ruby>らなければなりません。",
    tts: "がっこうのきそくをまもらなければなりません",
    situationBn: "স্কুল ও নিয়ম"
  },
  "声": {
    japanese: "大きな声で話してください。",
    reading: "おおきな こえ で はなして ください",
    romaji: "Ookina koe de hanashite kudasai.",
    meaningBn: "উঁচু গলায় কথা বলুন।",
    meaningEn: "Please speak in a loud voice.",
    ruby: "<ruby>大<rt>おお</rt></ruby>きな<ruby>声<rt>こえ</rt></ruby>で<ruby>話<rt>はな</rt></ruby>してください。",
    tts: "おおきなこえではなしてください",
    situationBn: "কথোপকথন"
  },
  "葉": {
    japanese: "秋になると木の葉が赤くなります。",
    reading: "あき に なると き の は が あかく なります",
    romaji: "Aki ni naruto ki no ha ga akaku narimasu.",
    meaningBn: "শরৎকাল এলে গাছের পাতা লাল হয়ে যায়।",
    meaningEn: "In autumn, the leaves turn red.",
    ruby: "<ruby>秋<rt>あき</rt></ruby>になると<ruby>木<rt>き</rt></ruby>の<ruby>葉<rt>は</rt></ruby>が<ruby>赤<rt>あか</rt></ruby>くなります。",
    tts: "あきになるときのはがあかくなります",
    situationBn: "প্রকৃতি ও ঋতু"
  },
  "形": {
    japanese: "この雲は魚の形をしています。",
    reading: "この くも は さかな の かたち を して います",
    romaji: "Kono kumo wa sakana no katachi o shite imasu.",
    meaningBn: "এই মেঘটি দেখতে মাছের আকারের মতো।",
    meaningEn: "This cloud is shaped like a fish.",
    ruby: "この<ruby>雲<rt>くも</rt></ruby>は<ruby>魚<rt>さかな</rt></ruby>の<ruby>形<rt>かたち</rt></ruby>をしています。",
    tts: "このくもはさなのかたちをしています",
    situationBn: "আকৃতি ও পর্যবেক্ষণ"
  },
  "落": {
    japanese: "財布を道に落としてしまいました。",
    reading: "さいふ を みち に おとして しまいました",
    romaji: "Saifu o michi ni otoshite shimaimashita.",
    meaningBn: "রাস্তায় মানিব্যাগটি ফেলে ফেলেছিলাম।",
    meaningEn: "I accidentally dropped my wallet on the street.",
    ruby: "<ruby>財布<rt>さいふ</rt></ruby>を<ruby>道<rt>みち</rt></ruby>に<ruby>落<rt>お</rt></ruby>としてしまいました。",
    tts: "さいふをみちにおとしてしまいました",
    situationBn: "ভুল ও দুর্ঘটনা"
  },
  "渡": {
    japanese: "信号が青になったら横断歩道を渡りましょう。",
    reading: "しんごう が あお に なったら おうだんほどう を わたりましょう",
    romaji: "Shingou ga ao ni nattara oudanhodou o watarimashou.",
    meaningBn: "সিগন্যাল সবুজ হলে জেব্রা ক্রসিং দিয়ে রাস্তা পার হই।",
    meaningEn: "Let's cross the pedestrian crossing when the signal turns green.",
    ruby: "<ruby>信号<rt>しんごう</rt></ruby>が<ruby>青<rt>あお</rt></ruby>になったら<ruby>横断歩道<rt>おうだんほどう</rt></ruby>を<ruby>渡<rt>わた</rt></ruby>りましょう。",
    tts: "しんごうがあおになったらおうだんほどうをわたりましょう",
    situationBn: "রাস্তা পারাপার"
  },
  "若": {
    japanese: "彼女はとても若く見えます。",
    reading: "かのじょ は とても わかく みえます",
    romaji: "Kanojo wa totemo wakaku miemasu.",
    meaningBn: "তাকে দেখতে খুব তরুণ লাগে।",
    meaningEn: "She looks very young.",
    ruby: "<ruby>彼女<rt>かのじょ</rt></ruby>はとても<ruby>若<rt>わか</rt></ruby>く<ruby>見<rt>み</rt></ruby>えます。",
    tts: "かのじょはとてもわかくみえます",
    situationBn: "চেহারা ও বয়স"
  },
  "港": {
    japanese: "港に大きな船が泊まっています。",
    reading: "みなと に おおきな ふね が とまって います",
    romaji: "Minato ni ookina fune ga tomatte imasu.",
    meaningBn: "বন্দরে একটি বড় জাহাজ নোঙর করা আছে।",
    meaningEn: "A large ship is docked at the harbor.",
    ruby: "<ruby>港<rt>みなと</rt></ruby>に<ruby>大<rt>おお</rt></ruby>きな<ruby>船<rt>ふね</rt></ruby>が<ruby>泊<rt>と</rt></ruby>まっています。",
    tts: "みなとにおおきなふねがとまっています",
    situationBn: "বন্দর ও যাতায়াত"
  },
  "良": {
    japanese: "今日は天気がとても良いです。",
    reading: "きょう は てんき が とても よい です",
    romaji: "Kyou wa tenki ga totemo yoi desu.",
    meaningBn: "আজ আবহাওয়া খুব ভালো।",
    meaningEn: "The weather is very good today.",
    ruby: "<ruby>今日<rt>きょう</rt></ruby>は<ruby>天気<rt>てんき</rt></ruby>がとても<ruby>良<rt>よ</rt></ruby>いです。",
    tts: "きょうはてんきがとてもよいです",
    situationBn: "আবহাওয়া"
  },
  "敗": {
    japanese: "私たちのチームは試合に敗れました。",
    reading: "わたしたち の ちーむ は しあい に やぶれました",
    romaji: "Watashitachi no chiimu wa shiai ni yaburemashita.",
    meaningBn: "আমাদের দল খেলায় পরাজিত হয়েছিল।",
    meaningEn: "Our team was defeated in the match.",
    ruby: "<ruby>私<rt>わたし</rt></ruby>たちのチームは<ruby>試合<rt>しあい</rt></ruby>に<ruby>敗<rt>やぶ</rt></ruby>れました。",
    tts: "わたしたちのちーむはしあいにやぶれました",
    situationBn: "খেলাধুলা"
  },
  "危": {
    japanese: "道路で遊ぶのは危険です。",
    reading: "どうろ で あそぶ の は きけん です",
    romaji: "Douro de asobu no wa kiken desu.",
    meaningBn: "রাস্তায় খেলাধুলা করা বিপজ্জনক।",
    meaningEn: "It is dangerous to play on the street.",
    ruby: "<ruby>道路<rt>どうろ</rt></ruby>で<ruby>遊<rt>あそ</rt></ruby>ぶのは<ruby>危険<rt>きけん</rt></ruby>です。",
    tts: "どうろであそぶのはきけんです",
    situationBn: "নিরাপত্তা"
  },
  "園": {
    japanese: "週末に動物園へ行きました。",
    reading: "しゅうまつ に どうぶつえん え いきました",
    romaji: "Shuumatsu ni doubutsuen e ikimashita.",
    meaningBn: "সপ্তাহান্তে চিড়িয়াখানায় গিয়েছিলাম।",
    meaningEn: "I went to the zoo on the weekend.",
    ruby: "<ruby>週末<rt>しゅうまつ</rt></ruby>に<ruby>動物園<rt>どうぶつえん</rt></ruby>へ<ruby>行<rt>い</rt></ruby>きました。",
    tts: "しゅうまつにどうぶつえんへいきました",
    situationBn: "ছুটি ও বিনোদন"
  },
  "因": {
    japanese: "事故の原因を調べています。",
    reading: "じこ の げんいん を しらべて います",
    romaji: "Jiko no gen'in o shirabete imasu.",
    meaningBn: "দুর্ঘটনার কারণ অনুসন্ধান করা হচ্ছে।",
    meaningEn: "They are investigating the cause of the accident.",
    ruby: "<ruby>事故<rt>じこ</rt></ruby>の<ruby>原因<rt>げんいん</rt></ruby>を<ruby>調<rt>しら</rt></ruby>べています。",
    tts: "じこのげんいんをしらべています",
    situationBn: "তদন্ত ও কারণ"
  },
  "彼": {
    japanese: "彼は毎朝走っています。",
    reading: "かれ は まいあさ はしって います",
    romaji: "Kare wa maiasa hashitte imasu.",
    meaningBn: "সে প্রতিদিন সকালে দৌড়ায়।",
    meaningEn: "He runs every morning.",
    ruby: "<ruby>彼<rt>かれ</rt></ruby>は<ruby>毎朝<rt>まいあさ</rt></ruby><ruby>走<rt>はし</rt></ruby>っています。",
    tts: "かれはまいあさはしっています",
    situationBn: "দৈনন্দিন অভ্যাস"
  },
  "妻": {
    japanese: "妻と一緒にスーパーへ行きました。",
    reading: "つま と いっしょ に すーぱー え いきました",
    romaji: "Tsuma to issho ni suupaa e ikimashita.",
    meaningBn: "স্ত্রীর সাথে সুপারমার্কেটে গিয়েছিলাম।",
    meaningEn: "I went to the supermarket with my wife.",
    ruby: "<ruby>妻<rt>つま</rt></ruby>と<ruby>一緒<rt>いっしょ</rt></ruby>にスーパーへ<ruby>行<rt>い</rt></ruby>きました。",
    tts: "つまとしょにすーぱーへいきました",
    situationBn: "পরিবার ও কেনাকাটা"
  },
  "背": {
    japanese: "弟は背が高いです。",
    reading: "おとうと は せ が たかい です",
    romaji: "Otouto wa se ga takai desu.",
    meaningBn: "আমার ছোট ভাই লম্বা।",
    meaningEn: "My younger brother is tall.",
    ruby: "<ruby>弟<rt>おとうと</rt></ruby>は<ruby>背<rt>せ</rt></ruby>が<ruby>高<rt>たか</rt></ruby>いです。",
    tts: "おとうとはせがたかいです",
    situationBn: "শারীরিক বর্ণনা"
  },
  "薬": {
    japanese: "食後にこの薬を飲んでください。",
    reading: "しょくご に この くすり を のんで ください",
    romaji: "Shokugo ni kono kusuri o nonde kudasai.",
    meaningBn: "খাবারের পরে এই ওষুধটি সেবন করুন।",
    meaningEn: "Please take this medicine after meals.",
    ruby: "<ruby>食後<rt>しょくご</rt></ruby>にこの<ruby>薬<rt>くすり</rt></ruby>を<ruby>飲<rt>の</rt></ruby>んでください。",
    tts: "しょくごにこのくすりをのんでください",
    situationBn: "ওষুধ ও চিকিৎসা"
  },
  "散": {
    japanese: "夕方に公園を散歩します。",
    reading: "ゆうがた に こうえん を さんぽ します",
    romaji: "Yuugata ni kouen o sanpo shimasu.",
    meaningBn: "বিকালে পার্কে হাঁটাহাঁটি করি।",
    meaningEn: "I take a walk in the park in the evening.",
    ruby: "<ruby>夕方<rt>ゆうがた</rt></ruby>に<ruby>公園<rt>こうえん</rt></ruby>を<ruby>散歩<rt>さんぽ</rt></ruby>します。",
    tts: "ゆうがたにこうえんをさんぽします",
    situationBn: "হাঁটাহাঁটি"
  },
  "浮": {
    japanese: "水の上に木の葉が浮かんでいます。",
    reading: "みず の うえ に き の は が うかんで います",
    romaji: "Mizu no ue ni ki no ha ga ukande imasu.",
    meaningBn: "পানির ওপর গাছের পাতা ভাসছে।",
    meaningEn: "Leaves are floating on the water.",
    ruby: "<ruby>水<rt>みず</rt></ruby>の<ruby>上<rt>うえ</rt></ruby>に<ruby>木<rt>き</rt></ruby>の<ruby>葉<rt>は</rt></ruby>が<ruby>浮<rt>う</rt></ruby>かんでいます。",
    tts: "みずのうえにきのはがうかんでいます",
    situationBn: "প্রকৃতি"
  },
  "押": {
    japanese: "このボタンを押すとドアが開きます。",
    reading: "この ぼたん を おす と どあ が あきます",
    romaji: "Kono botan o osu to doa ga akimasu.",
    meaningBn: "এই বোতাম চাপলে দরজা খোলে।",
    meaningEn: "Press this button to open the door.",
    ruby: "このボタンを<ruby>押<rt>お</rt></ruby>すとドアが<ruby>開<rt>あ</rt></ruby>きます。",
    tts: "このぼたんをおすとどあがあきます",
    situationBn: "যন্ত্রপাতি পরিচালনা"
  },
  "庭": {
    japanese: "庭にきれいな花が咲いています。",
    reading: "にわ に きれいな はな が さいて います",
    romaji: "Niwa ni kireina hana ga saite imasu.",
    meaningBn: "বাগানে সুন্দর ফুল ফুটে আছে।",
    meaningEn: "Beautiful flowers are blooming in the garden.",
    ruby: "<ruby>庭<rt>にわ</rt></ruby>にきれいな<ruby>花<rt>はな</rt></ruby>が<ruby>咲<rt>さ</rt></ruby>いています。",
    tts: "にわにきれいなはながさいています",
    situationBn: "বাগান ও ফুল"
  },
  "徒": {
    japanese: "先生が生徒に日本語を教えています。",
    reading: "せんせい が せいと に にほんご を おしえて います",
    romaji: "Sensei ga seito ni Nihongo o oshiete imasu.",
    meaningBn: "শিক্ষক শিক্ষার্থীদের জাপানি ভাষা শেখাচ্ছেন।",
    meaningEn: "The teacher is teaching Japanese to students.",
    ruby: "<ruby>先生<rt>せんせい</rt></ruby>が<ruby>生徒<rt>せいと</rt></ruby>に<ruby>日本語<rt>にほんご</rt></ruby>を<ruby>教<rt>おし</rt></ruby>えています。",
    tts: "せんせいがせいとににほんごをおしえています",
    situationBn: "শ্রেণিকক্ষ"
  },
  "探": {
    japanese: "なくした鍵を探しています。",
    reading: "なくした かぎ を さがして います",
    romaji: "Nakushita kagi o sagashite imasu.",
    meaningBn: "হারিয়ে যাওয়া চাবি খুঁজছি।",
    meaningEn: "I am looking for the lost key.",
    ruby: "なくした<ruby>鍵<rt>かぎ</rt></ruby>を<ruby>探<rt>さが</rt></ruby>しています。",
    tts: "なくしたかぎをさがしています",
    situationBn: "খোঁজাখুঁজি"
  },
  "逃": {
    japanese: "鳥が空へ逃げました。",
    reading: "とり が そら え にげました",
    romaji: "Tori ga sora e nigemashita.",
    meaningBn: "পাখিটি আকাশে উড়ে পালিয়ে গেল।",
    meaningEn: "The bird fled into the sky.",
    ruby: "<ruby>鳥<rt>とり</rt></ruby>が<ruby>空<rt>そら</rt></ruby>へ<ruby>逃<rt>に</rt></ruby>げました。",
    tts: "とりがそらへにげました",
    situationBn: "পশুপাখি"
  },
  "遊": {
    japanese: "公園で子供たちが遊んでいます。",
    reading: "こうえん で こどもたち が あそんで います",
    romaji: "Kouen de kodomotachi ga asonde imasu.",
    meaningBn: "পার্কে শিশুরা খেলা করছে।",
    meaningEn: "Children are playing in the park.",
    ruby: "<ruby>公園<rt>こうえん</rt></ruby>で<ruby>子供<rt>こども</rt></ruby>たちが<ruby>遊<rt>あそ</rt></ruby>んでいます。",
    tts: "こうえんでこどもたちがあそんでいます",
    situationBn: "খেলাধুলা"
  },
  "君": {
    japanese: "君の名前は何ですか。",
    reading: "きみ の なまえ は なん です か",
    romaji: "Kimi no namae wa nan desu ka.",
    meaningBn: "তোমার নাম কী?",
    meaningEn: "What is your name?",
    ruby: "<ruby>君<rt>きみ</rt></ruby>の<ruby>名前<rt>なまえ</rt></ruby>は<ruby>何<rt>なん</rt></ruby>ですか。",
    tts: "きみのなまえはなんですか",
    situationBn: "পরিচয়"
  },
  "緒": {
    japanese: "一緒に昼ご飯を食べましょう。",
    reading: "いっしょ に ひるごはん を たべましょう",
    romaji: "Issho ni hirugohan o tabemashou.",
    meaningBn: "একসাথে দুপুরের খাবার খাই চলো।",
    meaningEn: "Let's eat lunch together.",
    ruby: "<ruby>一緒<rt>いっしょ</rt></ruby>に<ruby>昼ご飯<rt>ひるごはん</rt></ruby>を<ruby>食<rt>た</rt></ruby>べましょう。",
    tts: "いっしょにひるごはんをたべましょう",
    situationBn: "খাবার ও আমন্ত্রণ"
  },
  "草": {
    japanese: "庭の草を抜きました。",
    reading: "にわ の くさ を ぬきました",
    romaji: "Niwa no kusa o nukimashita.",
    meaningBn: "বাগানের ঘাস তুলে ফেলেছিলাম।",
    meaningEn: "I pulled the weeds in the garden.",
    ruby: "<ruby>庭<rt>にわ</rt></ruby>の<ruby>草<rt>くさ</rt></ruby>を<ruby>抜<rt>ぬ</rt></ruby>きました。",
    tts: "にわのくさをぬきました",
    situationBn: "বাগান পরিচর্যা"
  },
  "晴": {
    japanese: "明日は晴れるでしょう。",
    reading: "あした は はれる でしょう",
    romaji: "Ashita wa hareru deshou.",
    meaningBn: "আগামীকাল রোদ উঠবে বোধহয়।",
    meaningEn: "It will probably be sunny tomorrow.",
    ruby: "<ruby>明日<rt>あした</rt></ruby>は<ruby>晴<rt>は</rt></ruby>れるでしょう。",
    tts: "あしたははれるでしょう",
    situationBn: "আবহাওয়া পূর্বাভাস"
  },
  "寝": {
    japanese: "毎晩十一時に寝ます。",
    reading: "まいばん じゅういちじ に ねます",
    romaji: "Maiban juuichiji ni nemasu.",
    meaningBn: "প্রতি রাতে এগারোটায় ঘুমাতে যাই।",
    meaningEn: "I go to bed at eleven every night.",
    ruby: "<ruby>毎晩<rt>まいばん</rt></ruby><ruby>十一時<rt>じゅういちじ</rt></ruby>に<ruby>寝<rt>ね</rt></ruby>ます。",
    tts: "まいばんじゅういちじにねます",
    situationBn: "দৈনন্দিন রুটিন"
  },
  "忘": {
    japanese: "宿題を忘れました。",
    reading: "しゅくだい を わすれました",
    romaji: "Shukudai o wasuremashita.",
    meaningBn: "হোমওয়ার্ক ভুলে ফেলে এসেছি।",
    meaningEn: "I forgot my homework.",
    ruby: "<ruby>宿題<rt>しゅくだい</rt></ruby>を<ruby>忘<rt>わす</rt></ruby>れました。",
    tts: "しゅくだいをわすれました",
    situationBn: "স্কুল"
  },
  "雪": {
    japanese: "冬にはたくさんの雪が降ります。",
    reading: "ふゆ に は たくさん の ゆき が ふります",
    romaji: "Fuyu ni wa takusan no yuki ga furimasu.",
    meaningBn: "শীতকালে প্রচুর বরফ পড়ে।",
    meaningEn: "A lot of snow falls in winter.",
    ruby: "<ruby>冬<rt>ふゆ</rt></ruby>にはたくさんの<ruby>雪<rt>ゆき</rt></ruby>が<ruby>降<rt>ふ</rt></ruby>ります。",
    tts: "ふゆにはたくさんのゆきがふります",
    situationBn: "শীতকাল ও বরফ"
  },
  "吹": {
    japanese: "冷たい風が吹いています。",
    reading: "つめたい かぜ が ふいて います",
    romaji: "Tsumetai kaze ga fuite imasu.",
    meaningBn: "ঠান্ডা বাতাস বইছে।",
    meaningEn: "A cold wind is blowing.",
    ruby: "<ruby>冷<rt>つめ</rt></ruby>たい<ruby>風<rt>かぜ</rt></ruby>が<ruby>吹<rt>ふ</rt></ruby>いています。",
    tts: "つめたいかぜがふいています",
    situationBn: "আবহাওয়া ও বাতাস"
  },
  "娘": {
    japanese: "娘はピアノを練習しています。",
    reading: "むすめ は ぴあの を れんしゅう して います",
    romaji: "Musume wa piano o renshuu shite imasu.",
    meaningBn: "আমার মেয়ে পিয়ানো অনুশীলন করছে।",
    meaningEn: "My daughter is practicing the piano.",
    ruby: "<ruby>娘<rt>むすめ</rt></ruby>はピアノを<ruby>練習<rt>れんしゅう</rt></ruby>しています。",
    tts: "むすめはぴあのをれんしゅうしています",
    situationBn: "পরিবার ও শখ"
  },
  "洗": {
    japanese: "ご飯を食べる前に手を洗いましょう。",
    reading: "ごはん を たべる まえ に て を あらいましょう",
    romaji: "Gohan o taberu mae ni te o araimashou.",
    meaningBn: "খাবার খাওয়ার আগে হাত ধোওয়া যাক।",
    meaningEn: "Let's wash our hands before eating.",
    ruby: "ご飯を<ruby>食<rt>た</rt></ruby>べる<ruby>前<rt>まえ</rt></ruby>に<ruby>手<rt>て</rt></ruby>を<ruby>洗<rt>あら</rt></ruby>いましょう。",
    tts: "ごはんをたべるまえにてをあらいましょう",
    situationBn: "পরিচ্ছন্নতা"
  },
  "慣": {
    japanese: "日本の生活に慣れました。",
    reading: "にほん の せいかつ に なれました",
    romaji: "Nihon no seikatsu ni naremashita.",
    meaningBn: "জাপানের জীবনে অভ্যস্ত হয়ে গেছি।",
    meaningEn: "I have gotten used to life in Japan.",
    ruby: "<ruby>日本<rt>にほん</rt></ruby>の<ruby>生活<rt>せいかつ</rt></ruby>に<ruby>慣<rt>な</rt></ruby>れました。",
    tts: "にほんのせいかつになれました",
    situationBn: "জীবন ও অভিজ্ঞতা"
  },
  "窓": {
    japanese: "窓を開けて涼しい風を入れましょう。",
    reading: "まど を あけて すずしい かぜ を いれましょう",
    romaji: "Mado o akete suzushii kaze o iremashou.",
    meaningBn: "জানালা খুলে শীতল বাতাস আসতে দিই।",
    meaningEn: "Let's open the window and let in the cool breeze.",
    ruby: "<ruby>窓<rt>まど</rt></ruby>を<ruby>開<rt>あ</rt></ruby>けて<ruby>涼<rt>すず</rt></ruby>しい<ruby>風<rt>かぜ</rt></ruby>を<ruby>入<rt>い</rt></ruby>れましょう。",
    tts: "まどをあけてすずしいかぜをいれましょう",
    situationBn: "ঘর ও বাতাস"
  },
  "昔": {
    japanese: "昔この町は静かでした。",
    reading: "むかし この まち は しずか でした",
    romaji: "Mukashi kono machi wa shizuka deshita.",
    meaningBn: "অতীতে এই শহরটি শান্ত ছিল।",
    meaningEn: "In the past, this town was quiet.",
    ruby: "<ruby>昔<rt>むかし</rt></ruby>この<ruby>町<rt>まち</rt></ruby>は<ruby>静<rt>しず</rt></ruby>かでした。",
    tts: "むかしこのまちはしずかでした",
    situationBn: "অতীত স্মৃতি"
  },
  "怒": {
    japanese: "父はとても怒っていました。",
    reading: "ちち は とても おこって いました",
    romaji: "Chichi wa totemo okotte imashita.",
    meaningBn: "বাবা খুব রেগে গিয়েছিলেন।",
    meaningEn: "My father was very angry.",
    ruby: "<ruby>父<rt>ちち</rt></ruby>はとても<ruby>怒<rt>おこ</rt></ruby>っていました。",
    tts: "ちちはとてもおこっていました",
    situationBn: "আবেগ ও অনুভূতি"
  },
  "祖": {
    japanese: "祖父は毎朝散歩をします。",
    reading: "そふ は まいあさ さんぽ を します",
    romaji: "Sofu wa maiasa sanpo o shimasu.",
    meaningBn: "আমার দাদা প্রতি সকালে হাঁটাহাঁটি করেন।",
    meaningEn: "My grandfather takes a walk every morning.",
    ruby: "<ruby>祖父<rt>そふ</rt></ruby>は<ruby>毎朝<rt>まいあさ</rt></ruby><ruby>散歩<rt>さんぽ</rt></ruby>をします。",
    tts: "そふはまいあささんぽをします",
    situationBn: "পরিবার ও প্রবীণ"
  },
  "杯": {
    japanese: "お茶をもう一杯いかがですか。",
    reading: "おちゃ を もう いっぱい いかが です か",
    romaji: "Ocha o mou ippai ikaga desu ka.",
    meaningBn: "আরেক কাপ চা নেবেন কি?",
    meaningEn: "Would you like another cup of tea?",
    ruby: "お<ruby>茶<rt>ちゃ</rt></ruby>をもう<ruby>一杯<rt>いっぱい</rt></ruby>いかがですか。",
    tts: "おちゃをもういっぱいかがですか",
    situationBn: "আতিথেয়তা"
  },
  "皆": {
    japanese: "皆さん、おはようございます。",
    reading: "みなさん おはよう ございます",
    romaji: "Minasan, ohayou gozaimasu.",
    meaningBn: "সবাইকে শুভ সকাল।",
    meaningEn: "Good morning, everyone.",
    ruby: "<ruby>皆<rt>みな</rt></ruby>さん、おはようございます。",
    tts: "みなさんおはようございます",
    situationBn: "অভিবাদন"
  },
  "鳴": {
    japanese: "朝早く小鳥が鳴いています。",
    reading: "あさ はやく ことり が ないて います",
    romaji: "Asa hayaku kotori ga naite imasu.",
    meaningBn: "সকাল সকাল ছোট পাখি ডাকছে।",
    meaningEn: "Little birds are singing early in the morning.",
    ruby: "<ruby>朝<rt>あさ</rt></ruby><ruby>早<rt>はや</rt></ruby>く<ruby>小鳥<rt>ことり</rt></ruby>が<ruby>鳴<rt>な</rt></ruby>いています。",
    tts: "あさはやくことりがないています",
    situationBn: "প্রকৃতি ও সকাল"
  },
  "耳": {
    japanese: "耳を澄まして音楽を聴きました。",
    reading: "みみ を すまして おんがく を ききました",
    romaji: "Mimi o sumashite ongaku o kikimashita.",
    meaningBn: "মনোযোগ দিয়ে গান শুনলাম।",
    meaningEn: "I listened carefully to the music.",
    ruby: "<ruby>耳<rt>みみ</rt></ruby>を<ruby>澄<rt>す</rt></ruby>まして<ruby>音楽<rt>おんがく</rt></ruby>を<ruby>聴<rt>き</rt></ruby>きました。",
    tts: "みみをすましておんがくをききました",
    situationBn: "শ্রবণ ও গান"
  },
  "箱": {
    japanese: "この箱の中にプレゼントが入っています。",
    reading: "この はこ の なか に ぷれぜんと が はいって います",
    romaji: "Kono hako no naka ni purezento ga haitte imasu.",
    meaningBn: "এই বাক্সের মধ্যে উপহার আছে।",
    meaningEn: "There is a present inside this box.",
    ruby: "この<ruby>箱<rt>はこ</rt></ruby>の<ruby>中<rt>なか</rt></ruby>にプレゼントが<ruby>入<rt>はい</rt></ruby>っています。",
    tts: "このはこのなかにぷれぜんとがはいっています",
    situationBn: "উপহার ও বাক্স"
  },
  "晩": {
    japanese: "今晩おいしい料理を作ります。",
    reading: "こんばん おいしい りょうり を つくります",
    romaji: "Konban oishii ryouri o tsukurimasu.",
    meaningBn: "আজ রাতে সুস্বাদু খাবার রান্না করব।",
    meaningEn: "I will make delicious food tonight.",
    ruby: "<ruby>今晩<rt>こんばん</rt></ruby>おいしい<ruby>料理<rt>りょうり</rt></ruby>を<ruby>作<rt>つく</rt></ruby>ります。",
    tts: "こんばんおいしいりょうりをつくります",
    situationBn: "রান্না ও রাত"
  },
  "寒": {
    japanese: "今日はとても寒いですね。",
    reading: "きょう は とても さむい です ね",
    romaji: "Kyou wa totemo samui desu ne.",
    meaningBn: "আজ খুব ঠান্ডা, তাই না?",
    meaningEn: "It is very cold today, isn't it?",
    ruby: "<ruby>今日<rt>きょう</rt></ruby>はとても<ruby>寒<rt>さむ</rt></ruby>いですね。",
    tts: "きょうはとてもさむいですね",
    situationBn: "আবহাওয়া ও কথোপকথন"
  },
  "忙": {
    japanese: "今週は仕事で忙しいです。",
    reading: "こんしゅう は しごと で いそがしい です",
    romaji: "Konshuu wa shigoto de isogashii desu.",
    meaningBn: "এই সপ্তাহে কাজের কারণে ব্যস্ত আছি।",
    meaningEn: "I am busy with work this week.",
    ruby: "<ruby>今週<rt>こんしゅう</rt></ruby>は<ruby>仕事<rt>しごと</rt></ruby>で<ruby>忙<rt>いそが</rt></ruby>しいです。",
    tts: "こんしゅうはしごとでいそがしいです",
    situationBn: "কাজ ও ব্যস্ততা"
  },
  "靴": {
    japanese: "玄関で靴を脱いでください。",
    reading: "げんかん で くつ を ぬいで ください",
    romaji: "Genkan de kutsu o nuide kudasai.",
    meaningBn: "প্রবেশদ্বারে জুতো খুলে রাখুন।",
    meaningEn: "Please take off your shoes at the entrance.",
    ruby: "<ruby>玄関<rt>げんかん</rt></ruby>で<ruby>靴<rt>くつ</rt></ruby>を<ruby>脱<rt>ぬ</rt></ruby>いでください。",
    tts: "げんかんでくつをぬいでください",
    situationBn: "জাপানি শিষ্টাচার"
  },
  "恥": {
    japanese: "道で転んでとても恥ずかしかったです。",
    reading: "みち で ころんで とても はずかしかった です",
    romaji: "Michi de koronde totemo hazukashikatta desu.",
    meaningBn: "রাস্তায় পড়ে গিয়ে খুব লজ্জা পেয়ে গিয়েছিলাম।",
    meaningEn: "I was very embarrassed when I fell on the street.",
    ruby: "<ruby>道<rt>みち</rt></ruby>で<ruby>転<rt>ころ</rt></ruby>んでとても<ruby>恥<rt>は</rt></ruby>ずかしかったです。",
    tts: "みちでころんでとてもはずかしかったです",
    situationBn: "অনুভূতি ও ঘটনা"
  },
  "猫": {
    japanese: "庭でかわいい猫が寝ています。",
    reading: "にわ で かわいい ねこ が ねて います",
    romaji: "Niwa de kawaii neko ga nete imasu.",
    meaningBn: "বাগানে একটি সুন্দর বিড়াল ঘুমাচ্ছে।",
    meaningEn: "A cute cat is sleeping in the garden.",
    ruby: "<ruby>庭<rt>にわ</rt></ruby>でかわいい<ruby>猫<rt>ねこ</rt></ruby>が<ruby>寝<rt>ね</rt></ruby>ています。",
    tts: "にわでかわいいねこがねています",
    situationBn: "পোষা প্রাণী"
  },
  "幾": {
    japanese: "このペンは幾らですか。",
    reading: "この ぺん は いくら です か",
    romaji: "Kono pen wa ikura desu ka.",
    meaningBn: "এই কলমটির দাম কত?",
    meaningEn: "How much is this pen?",
    ruby: "このペンは<ruby>幾<rt>いく</rt></ruby>らですか。",
    tts: "このぺんはいくらですか",
    situationBn: "কেনাকাটা ও দাম"
  }
};

let enriched = 0;
for (const k of n3.kanji) {
  if (!k.examples || !k.examples.length) {
    const s = SENTENCES_FOR_58[k.character];
    if (s) {
      k.examples = [s];
      enriched++;
    }
  }
}

fs.writeFileSync(n3Path, JSON.stringify(n3, null, 2), "utf8");
console.log(`Enriched ${enriched} N3 kanji with full sentences!`);
