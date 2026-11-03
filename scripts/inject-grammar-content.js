const fs = require("fs");
const path = require("path");

const viewsPath = path.join(__dirname, "..", "js", "views.js");
let views = fs.readFileSync(viewsPath, "utf8");

const newGrammarCode = `
let grammarLevel = "all";
let grammarQuery = "";
let grammarTab = "list"; // "list" | "guide" | "traps"

function renderConjugationGuide() {
  return \`
    <div class="guide-container" style="display:flex;flex-direction:column;gap:18px">
      
      <!-- Intro Banner -->
      <div style="background:linear-gradient(135deg, rgba(143,231,198,0.15) 0%, rgba(100,181,246,0.1) 100%);border:1px solid var(--border);border-radius:20px;padding:20px 22px">
        <div style="display:flex;align-items:center;gap:10px;margin-bottom:8px">
          <span style="font-size:24px">📖</span>
          <h3 style="margin:0;font-size:18px;color:var(--text);font-weight:700">রূপান্তরই জাপানি ভাষার আসল প্রাণ!</h3>
        </div>
        <p style="margin:0;font-size:13.5px;line-height:1.6;color:var(--text-2)">
          জাপানি ব্যাকরণে মুখস্থ করার চেয়ে রূপান্তরের ছন্দটা (Conjugation Pattern) একবার বুঝে নেওয়া হাজার গুণ সহজ। এই সহায়িকায় ক্রিয়াপদ, বিশেষণ ও বিশেষ্যের নিয়মগুলো গল্প, ছড়া এবং বাস্তব উদাহরণের মাধ্যমে সাজানো হয়েছে — যা আয়ত্ত করলে N5 থেকে N3-এর পথ অত্যন্ত সহজ হয়ে যাবে।
        </p>
      </div>

      <!-- Section 1: Verb Groups & 8 Imposters -->
      <article class="guide-card">
        <div class="guide-card-head">
          <div class="guide-card-icon">1</div>
          <div>
            <h3 class="guide-card-title">ক্রিয়াপদের ৩টি গ্রুপ চেনার সহজ গল্প ও রূপান্তর</h3>
            <div class="guide-card-subtitle">Verb Groups (動詞のグループ) ও ছদ্মবেশী ৮টি ফাঁদ</div>
          </div>
        </div>

        <p style="font-size:13.5px;line-height:1.6;color:var(--text-2);margin-bottom:12px">
          জাপানি ভাষার অভিধানের (Dictionary form) প্রতিটি ক্রিয়াপদ শেষ হয় <strong>'U' (উ) ধ্বনি</strong> দিয়ে। কাজের ধরন ও রূপান্তরের নিয়ম অনুযায়ী এদের তিনটি পরিবার বা গ্রুপে ভাগ করা হয়েছে:
        </p>

        <!-- Verb Groups Explanation -->
        <div style="display:grid;grid-template-columns:repeat(auto-fit, minmax(260px, 1fr));gap:12px;margin-bottom:16px">
          
          <div style="background:var(--surface-2);border:1px solid var(--border);border-radius:14px;padding:14px">
            <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:6px">
              <strong style="color:var(--primary);font-size:15px">গ্রুপ ১: গোদান (五段動詞)</strong>
              <span class="chip-pill">U-ending</span>
            </div>
            <p style="font-size:13px;line-height:1.5;color:var(--text-2);margin:0 0 8px">
              <strong>"পাঁচ সুরের দল":</strong> রূপান্তরের সময় এদের শেষ ধ্বনি ৫টি স্তরে (a, i, u, e, o) ওঠানামা করে। জাপানি বর্ণমালার ৯টি শেষ অক্ষর নিয়ে এই গ্রুপ গঠিত:
            </p>
            <div style="display:flex;flex-wrap:wrap;gap:4px;margin-bottom:8px">
              <span class="chip-pill">う (u)</span>
              <span class="chip-pill">つ (tsu)</span>
              <span class="chip-pill">る (ru)</span>
              <span class="chip-pill">む (mu)</span>
              <span class="chip-pill">ぶ (bu)</span>
              <span class="chip-pill">ぬ (nu)</span>
              <span class="chip-pill">く (ku)</span>
              <span class="chip-pill">ぐ (gu)</span>
              <span class="chip-pill">す (su)</span>
            </div>
            <div style="font-size:12px;color:var(--muted)">
              যেমন: <code>買う (kau)</code>, <code>待つ (matsu)</code>, <code>飲む (nomu)</code>, <code>書く (kaku)</code>, <code>話す (hanasu)</code>।
            </div>
          </div>

          <div style="background:var(--surface-2);border:1px solid var(--border);border-radius:14px;padding:14px">
            <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:6px">
              <strong style="color:#64b5f6;font-size:15px">গ্রুপ ২: ইচিদান (一段動詞)</strong>
              <span class="chip-pill">iru / eru</span>
            </div>
            <p style="font-size:13px;line-height:1.5;color:var(--text-2);margin:0 0 8px">
              <strong>"ভদ্র ও সহজ দল":</strong> এদের চেনার সোনার কাঠি মাত্র দুটি:
              <br>১. শেষ অক্ষরটি <strong>অবশ্যই 'る' (ru)</strong> হবে।
              <br>২. তার আগের অক্ষরের ধ্বনি <strong>'ই' (I) বা 'এ' (E)</strong> হবে!
            </p>
            <p style="font-size:12.5px;color:var(--text-2);margin:0 0 8px">
              রূপান্তর সবচেয়ে সহজ: শুধু শেষ <code>る</code> মুছে যা খুশি লাগান!
            </p>
            <div style="font-size:12px;color:var(--muted)">
              যেমন: <code>食べる (taberu)</code> [be = e sound], <code>見る (miru)</code> [mi = i sound], <code>起きる (okiru)</code>।
            </div>
          </div>

          <div style="background:var(--surface-2);border:1px solid var(--border);border-radius:14px;padding:14px">
            <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:6px">
              <strong style="color:#ffb74d;font-size:15px">গ্রুপ ৩: অনিয়মিত (不規則)</strong>
              <span class="chip-pill">মাত্র ২টি!</span>
            </div>
            <p style="font-size:13px;line-height:1.5;color:var(--text-2);margin:0 0 8px">
              <strong>"বেয়াড়া দুই বন্ধু":</strong> পুরো জাপানি ডিকশনারিতে মাত্র দুটি শব্দ এই গ্রুপে আছে। এরা কোনো সাধারণ নিয়ম মানে না, এদের সরাসরি মনে রাখতে হয়:
            </p>
            <div style="font-size:13px;line-height:1.6;color:var(--text)">
              1. <strong>する (suru)</strong> - করা ➔ <code>します</code>, <code>して</code>, <code>した</code>, <code>しない</code>
              <br>2. <strong>来る (くる - kuru)</strong> - আসা ➔ <code>きます</code>, <code>きて</code>, <code>きた</code>, <code>こない</code>
            </div>
          </div>

        </div>

        <!-- The 8 Imposters Warning -->
        <div class="guide-callout warning">
          <div style="display:flex;align-items:center;gap:8px;font-weight:700;color:#ff9800;font-size:14px;margin-bottom:6px">
            \${icon("alert", 16)} <span>সাবধান! ছদ্মবেশী ৮টি ট্র্যাপ (Group 1 Imposters)</span>
          </div>
          <p style="margin:0 0 10px;font-size:13px">
            এই ৮টি শব্দের শেষে <strong>る</strong> আছে এবং আগের ধ্বনি <strong>I বা E</strong>, দেখতে অবিকল গ্রুপ ২-এর মতো! কিন্তু রক্তের দিক থেকে এরা খাঁটি <strong>গ্রুপ ১ (Godan)</strong>! পরীক্ষায় শিক্ষার্থীদের ফাঁদে ফেলতে এগুলোই বারবার দেওয়া হয়:
          </p>
          <div class="guide-table-wrap">
            <table class="guide-table">
              <thead>
                <tr>
                  <th>ক্রিয়াপদ</th>
                  <th>অর্থ</th>
                  <th>কেন ট্র্যাপ?</th>
                  <th>মাসু ফর্ম (Masu)</th>
                  <th>তে-ফর্ম (Te)</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><strong lang="ja" style="font-size:15px">帰る</strong> (かえる)</td>
                  <td>ফেরা / Return</td>
                  <td>'e' + ru দেখে গ্রুপ ২ মনে হয়</td>
                  <td><code style="color:var(--primary)">帰ります</code> (❌ 帰ます নয়)</td>
                  <td><code style="color:var(--primary)">帰って</code> (❌ 帰て নয়)</td>
                </tr>
                <tr>
                  <td><strong lang="ja" style="font-size:15px">走る</strong> (はしる)</td>
                  <td>দৌড়ানো / Run</td>
                  <td>'i' + ru দেখে গ্রুপ ২ মনে হয়</td>
                  <td><code style="color:var(--primary)">走ります</code></td>
                  <td><code style="color:var(--primary)">走って</code></td>
                </tr>
                <tr>
                  <td><strong lang="ja" style="font-size:15px">入る</strong> (はいる)</td>
                  <td>প্রবেশ করা / Enter</td>
                  <td>'i' + ru দেখে গ্রুপ ২ মনে হয়</td>
                  <td><code style="color:var(--primary)">入ります</code></td>
                  <td><code style="color:var(--primary)">入って</code></td>
                </tr>
                <tr>
                  <td><strong lang="ja" style="font-size:15px">切る</strong> (きる)</td>
                  <td>কাটা / Cut</td>
                  <td>জামা পরা <code>着る</code> (Group 2) এর যমজ!</td>
                  <td><code style="color:var(--primary)">切ります</code> (জামা পরা: 着ます)</td>
                  <td><code style="color:var(--primary)">切って</code> (জামা পরা: 着て)</td>
                </tr>
                <tr>
                  <td><strong lang="ja" style="font-size:15px">知る</strong> (しる)</td>
                  <td>জানা / Know</td>
                  <td>'i' + ru গ্রুপ ১</td>
                  <td><code style="color:var(--primary)">知ります</code></td>
                  <td><code style="color:var(--primary)">知って</code></td>
                </tr>
                <tr>
                  <td><strong lang="ja" style="font-size:15px">喋る</strong> (しゃべる)</td>
                  <td>আড্ডা দেওয়া / Chat</td>
                  <td>'e' + ru গ্রুপ ১</td>
                  <td><code style="color:var(--primary)">喋ります</code></td>
                  <td><code style="color:var(--primary)">喋って</code></td>
                </tr>
                <tr>
                  <td><strong lang="ja" style="font-size:15px">要る</strong> (いる)</td>
                  <td>দরকার হওয়া / Need</td>
                  <td>থাকা <code>居る</code> (Group 2) এর যমজ!</td>
                  <td><code style="color:var(--primary)">要ります</code> (থাকা: 居ます)</td>
                  <td><code style="color:var(--primary)">要って</code> (থাকা: 居て)</td>
                </tr>
                <tr>
                  <td><strong lang="ja" style="font-size:15px">減る</strong> (へる)</td>
                  <td>কমে যাওয়া / Decrease</td>
                  <td>'e' + ru গ্রুপ ১</td>
                  <td><code style="color:var(--primary)">減ります</code></td>
                  <td><code style="color:var(--primary)">減って</code></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </article>

      <!-- Section 2: Te-form & Ta-form Song -->
      <article class="guide-card">
        <div class="guide-card-head">
          <div class="guide-card-icon">2</div>
          <div>
            <h3 class="guide-card-title">তে-ফর্ম (て形) ও তা-ফর্মের জাদুকরী ছড়া</h3>
            <div class="guide-card-subtitle">The Te-Form Song (て形の歌) ও অতীত রূপান্তরের গোপন রহস্য</div>
          </div>
        </div>

        <p style="font-size:13.5px;line-height:1.6;color:var(--text-2);margin-bottom:12px">
          জাপানি কিন্ডারগার্টেন এবং ভাষা শিক্ষার ক্লাসে এই ছড়াটি গেয়ে গেয়ে লাখ লাখ শিক্ষার্থী এক বসাতেই তে-ফর্ম শিখে ফেলে। এটি সুর দিয়ে মনে রাখুন:
        </p>

        <!-- Rhyme box -->
        <div class="rhyme-box">
          <div style="font-weight:700;color:var(--primary);margin-bottom:8px;font-size:15px">
            🎵 তে-ফর্মের সুরের জাদু (The Te-Form Rhyme):
          </div>
          <div style="display:grid;grid-template-columns:repeat(auto-fit, minmax(200px, 1fr));gap:10px">
            <div>🎶 <strong>う・つ・る</strong> (উ-ৎসু-রু) ➔ <code style="color:var(--primary);font-size:15px">って (tte)</code></div>
            <div>🎶 <strong>む・ぶ・ぬ</strong> (মু-বু-নু) ➔ <code style="color:var(--primary);font-size:15px">んで (nde)</code></div>
            <div>🎶 <strong>く</strong> (কু) ➔ <code style="color:var(--primary);font-size:15px">いて (ite)</code></div>
            <div>🎶 <strong>ぐ</strong> (গু) ➔ <code style="color:var(--primary);font-size:15px">いで (ide)</code></div>
            <div>🎶 <strong>す</strong> (সু) ➔ <code style="color:var(--primary);font-size:15px">して (shite)</code></div>
            <div>✨ <strong>গ্রুপ ২</strong> ➔ <code>る</code> ফেলে দিয়ে সোজা <code>て</code>!</div>
            <div>✨ <strong>গ্রুপ ৩</strong> ➔ <code>する</code> হয় <code>して</code>, <code>くる</code> হয় <code>きて</code>!</div>
          </div>
        </div>

        <!-- Super Exception Alert -->
        <div class="guide-callout danger">
          <div style="display:flex;align-items:center;gap:8px;font-weight:700;color:#f44336;font-size:14px;margin-bottom:4px">
            \${icon("alert", 16)} <span>চরম ব্যতিক্রম ফাঁদ (Super Exception Alert)</span>
          </div>
          <div style="font-size:13px;line-height:1.6">
            <strong>行く (いく - যাওয়া):</strong> শেষ অক্ষর 'く' থাকা সত্ত্বেও নিয়ম ভেঙে এটি <code>いいて</code> হবে না! এটি হবে <strong>「いって」 (itte)</strong>! JLPT N5 ও N4 পরীক্ষায় এটি নিয়মিত আসে।
          </div>
        </div>

        <!-- Ta form tip -->
        <div class="guide-callout success">
          <div style="font-weight:700;color:#4caf50;font-size:14px;margin-bottom:4px">
            💡 তা-ফর্ম (Ta-form - অতীত কাল) শেখার শর্টকাট:
          </div>
          <div style="font-size:13px;line-height:1.6">
            তে-ফর্ম যার মুখস্থ, তার তা-ফর্ম শেখা শেষ! শুধু <strong>'て'</strong> এর জায়গায় <strong>'た'</strong> এবং <strong>'で'</strong> এর জায়গায় <strong>'だ'</strong> বসিয়ে দিন!
            <br>যেমন: <code>買って (katte)</code> ➔ <code>買った (katta - কিনেছিলাম)</code>, <code>飲んで (nonde)</code> ➔ <code>飲んだ (nonda - পান করেছিলাম)</code>, <code>行って (itte)</code> ➔ <code>行った (itta - গিয়েছিলাম)</code>।
          </div>
        </div>

        <!-- Matrix Table -->
        <div class="guide-table-wrap">
          <table class="guide-table">
            <thead>
              <tr>
                <th>শেষ ধ্বনি</th>
                <th>অভিধান রূপ</th>
                <th>মাসু রূপ (Masu)</th>
                <th>তে-ফর্ম (Te)</th>
                <th>তা-ফর্ম (Ta - Past)</th>
                <th>নাই-ফর্ম (Nai - Neg)</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><strong>う</strong></td>
                <td><span lang="ja">買う</span> (কেনা)</td>
                <td>買います</td>
                <td><strong style="color:var(--primary)" lang="ja">買って</strong></td>
                <td>買った</td>
                <td>買わない</td>
              </tr>
              <tr>
                <td><strong>つ</strong></td>
                <td><span lang="ja">待つ</span> (অপেক্ষা)</td>
                <td>待ちます</td>
                <td><strong style="color:var(--primary)" lang="ja">待って</strong></td>
                <td>待った</td>
                <td>待たない</td>
              </tr>
              <tr>
                <td><strong>る</strong> (G1)</td>
                <td><span lang="ja">取る</span> (নেওয়া)</td>
                <td>取ります</td>
                <td><strong style="color:var(--primary)" lang="ja">取って</strong></td>
                <td>取った</td>
                <td>取らない</td>
              </tr>
              <tr>
                <td><strong>む</strong></td>
                <td><span lang="ja">飲む</span> (পান করা)</td>
                <td>飲みます</td>
                <td><strong style="color:var(--primary)" lang="ja">飲んで</strong></td>
                <td>飲んだ</td>
                <td>飲まない</td>
              </tr>
              <tr>
                <td><strong>ぶ</strong></td>
                <td><span lang="ja">遊ぶ</span> (খেলা)</td>
                <td>遊びます</td>
                <td><strong style="color:var(--primary)" lang="ja">遊んで</strong></td>
                <td>遊んだ</td>
                <td>遊ばない</td>
              </tr>
              <tr>
                <td><strong>ぬ</strong></td>
                <td><span lang="ja">死ぬ</span> (মারা যাওয়া)</td>
                <td>死にます</td>
                <td><strong style="color:var(--primary)" lang="ja">死んで</strong></td>
                <td>死んだ</td>
                <td>死なない</td>
              </tr>
              <tr>
                <td><strong>く</strong></td>
                <td><span lang="ja">書く</span> (লেখা)</td>
                <td>書きます</td>
                <td><strong style="color:var(--primary)" lang="ja">書いて</strong></td>
                <td>書いた</td>
                <td>書かない</td>
              </tr>
              <tr>
                <td><strong>ぐ</strong></td>
                <td><span lang="ja">泳ぐ</span> (সাঁতার)</td>
                <td>泳ぎます</td>
                <td><strong style="color:var(--primary)" lang="ja">泳いで</strong></td>
                <td>泳いだ</td>
                <td>泳がない</td>
              </tr>
              <tr>
                <td><strong>す</strong></td>
                <td><span lang="ja">話す</span> (কথা বলা)</td>
                <td>話します</td>
                <td><strong style="color:var(--primary)" lang="ja">話して</strong></td>
                <td>話した</td>
                <td>話さない</td>
              </tr>
              <tr style="background:rgba(100,181,246,0.06)">
                <td><strong>G2</strong> (iru/eru)</td>
                <td><span lang="ja">食べる</span> (খাওয়া)</td>
                <td>食べます</td>
                <td><strong style="color:#64b5f6" lang="ja">食べて</strong></td>
                <td>食べた</td>
                <td>食べない</td>
              </tr>
              <tr style="background:rgba(255,183,77,0.06)">
                <td><strong>G3</strong> (suru)</td>
                <td><span lang="ja">する</span> (করা)</td>
                <td>します</td>
                <td><strong style="color:#ffb74d" lang="ja">して</strong></td>
                <td>した</td>
                <td>しない</td>
              </tr>
              <tr style="background:rgba(255,183,77,0.06)">
                <td><strong>G3</strong> (kuru)</td>
                <td><span lang="ja">来る</span> (আসা)</td>
                <td>来ます (きます)</td>
                <td><strong style="color:#ffb74d" lang="ja">来て (きて)</strong></td>
                <td>来た (きた)</td>
                <td>来ない (こない)</td>
              </tr>
            </tbody>
          </table>
        </div>
      </article>

      <!-- Section 3: Adjective Transformations -->
      <article class="guide-card">
        <div class="guide-card-head">
          <div class="guide-card-icon">3</div>
          <div>
            <h3 class="guide-card-title">বিশেষণ রূপান্তরের নিয়মাবলি ও 'いい' ফাঁদ</h3>
            <div class="guide-card-subtitle">い-বিশেষণ (True Adjective) বনাম な-বিশেষণ (Nominal Adjective)</div>
          </div>
        </div>

        <p style="font-size:13.5px;line-height:1.6;color:var(--text-2);margin-bottom:12px">
          জাপানি ভাষায় বিশেষণ দুই জাতের। এদের রূপান্তর একদম আলাদা নিয়মে চলে:
        </p>

        <!-- Adjectives comparison -->
        <div style="display:grid;grid-template-columns:repeat(auto-fit, minmax(280px, 1fr));gap:14px;margin-bottom:14px">
          
          <!-- I-adj -->
          <div style="background:var(--surface-2);border:1px solid var(--border);border-radius:14px;padding:16px">
            <h4 style="margin:0 0 8px;color:var(--primary);font-size:16px">১. い-বিশেষণ (True Adjectives)</h4>
            <p style="font-size:13px;line-height:1.5;color:var(--text-2);margin:0 0 10px">
              শব্দের শেষ অক্ষরটি <strong>い</strong> (যেমন: 高い, 寒い, 暑い, 美味しい)। শেষ 'い' অক্ষরটি পরিবর্তন করে ৪টি রূপ তৈরি হয়:
            </p>
            <ul style="margin:0;padding-left:18px;font-size:13px;line-height:1.8;color:var(--text)">
              <li><strong>বর্তমান হ্যাঁ (+):</strong> <code>暑い</code> (গরম)</li>
              <li><strong>বর্তমান না (-):</strong> い তুলে <strong>くない</strong> ➔ <code>暑くない</code> (গরম নয়)</li>
              <li><strong>অতীত হ্যাঁ (+):</strong> い তুলে <strong>かった</strong> ➔ <code>暑かった</code> (গরম ছিল)</li>
              <li><strong>অতীত না (-):</strong> い তুলে <strong>くなかった</strong> ➔ <code>暑くなかった</code> (গরম ছিল না)</li>
              <li><strong>সংযুক্তি (এবং):</strong> い তুলে <strong>くて</strong> ➔ <code>暑くて</code> (গরম এবং...)</li>
              <li><strong>ক্রিয়া-বিশেষণ (ভাবে):</strong> い তুলে <strong>く</strong> ➔ <code>暑くなる</code> (গরম হয়ে যাওয়া)</li>
            </ul>
          </div>

          <!-- Na-adj -->
          <div style="background:var(--surface-2);border:1px solid var(--border);border-radius:14px;padding:16px">
            <h4 style="margin:0 0 8px;color:#64b5f6;font-size:16px">২. な-বিশেষণ (Nominal Adjectives)</h4>
            <p style="font-size:13px;line-height:1.5;color:var(--text-2);margin:0 0 10px">
              এরা বিশেষণের কাজ করলেও ব্যাকরণে বিশেষ্যের মতো আচরণ করে (যেমন: 静か, きれい, 元気, 親切)। বিশেষ্যের সাথে বসলে মাঝখানে <strong>な</strong> লাগে!
            </p>
            <ul style="margin:0;padding-left:18px;font-size:13px;line-height:1.8;color:var(--text)">
              <li><strong>বিশেষ্যের সাথে:</strong> <code>きれいな花</code> (সুন্দর ফুল), <code>静かな部屋</code> (শান্ত রুম)</li>
              <li><strong>বর্তমান হ্যাঁ (+):</strong> <code>静かです / だ</code> (শান্ত)</li>
              <li><strong>বর্তমান না (-):</strong> <code>静かじゃない / ではありません</code></li>
              <li><strong>অতীত হ্যাঁ (+):</strong> <code>静かでした / だった</code> (শান্ত ছিল)</li>
              <li><strong>অতীত না (-):</strong> <code>静かじゃなかった</code> (শান্ত ছিল না)</li>
              <li><strong>সংযুক্তি (এবং):</strong> <strong>で</strong> ➔ <code>静かで、きれいです</code> (শান্ত এবং সুন্দর)</li>
            </ul>
          </div>

        </div>

        <!-- The II Trap -->
        <div class="guide-callout danger">
          <div style="display:flex;align-items:center;gap:8px;font-weight:700;color:#f44336;font-size:14px;margin-bottom:6px">
            \${icon("alert", 16)} <span>শতাব্দীর সেরা ট্র্যাপ: 「いい」 (ভালো)</span>
          </div>
          <div style="font-size:13px;line-height:1.6">
            <code>いい</code> শব্দটি এসেছে প্রাচীন জাপানি শব্দ <strong>「よい」 (yoi)</strong> থেকে! তাই বর্তমান হ্যাঁ-বোধক ছাড়া আর সব রূপান্তরে <code>よい</code>-এর ওপর সূত্র প্রয়োগ করতে হবে। পরীক্ষায় <code>いくない</code> লিখলেই শূন্য!
            <div style="display:flex;flex-wrap:wrap;gap:8px;margin-top:8px">
              <span class="chip-pill" style="border-color:#4caf50;color:#4caf50">না-বোধক: よくない (❌ いくない নয়)</span>
              <span class="chip-pill" style="border-color:#4caf50;color:#4caf50">অতীত: よかった (❌ いかった নয়)</span>
              <span class="chip-pill" style="border-color:#4caf50;color:#4caf50">অতীত না: よくなかった</span>
              <span class="chip-pill" style="border-color:#4caf50;color:#4caf50">সংযুক্তি: よくて</span>
            </div>
          </div>
        </div>

      </article>

      <!-- Section 4: Nouns -->
      <article class="guide-card">
        <div class="guide-card-head">
          <div class="guide-card-icon">4</div>
          <div>
            <h3 class="guide-card-title">বিশেষ্য (Noun) রূপান্তর ও সংযুক্তি নিয়ম</h3>
            <div class="guide-card-subtitle">বিশেষ্য + বিশেষ্য এবং কালের রূপান্তর</div>
          </div>
        </div>

        <p style="font-size:13.5px;line-height:1.6;color:var(--text-2);margin-bottom:12px">
          জাপানি ভাষায় বিশেষ্যের রূপান্তর হুবহু <strong>な-বিশেষণের মতো</strong> কাজ করে:
        </p>

        <div class="guide-table-wrap">
          <table class="guide-table">
            <thead>
              <tr>
                <th>অবস্থা / কাল</th>
                <th>গঠন</th>
                <th>নম্র রূপ (Polite)</th>
                <th>সাধারণ রূপ (Plain)</th>
                <th>বাংলা অর্থ</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>বর্তমান হ্যাঁ (+)</td>
                <td>Noun + です / だ</td>
                <td>学生です</td>
                <td>学生だ</td>
                <td>ছাত্র/ছাত্রী হয়</td>
              </tr>
              <tr>
                <td>বর্তমান না (-)</td>
                <td>Noun + じゃない</td>
                <td>学生じゃありません</td>
                <td>学生じゃない</td>
                <td>ছাত্র/ছাত্রী নয়</td>
              </tr>
              <tr>
                <td>অতীত হ্যাঁ (+)</td>
                <td>Noun + でした / だった</td>
                <td>学生でした</td>
                <td>学生だった</td>
                <td>ছাত্র/ছাত্রী ছিল</td>
              </tr>
              <tr>
                <td>অতীত না (-)</td>
                <td>Noun + じゃなかった</td>
                <td>学生じゃありませんでした</td>
                <td>学生じゃなかった</td>
                <td>ছাত্র/ছাত্রী ছিল না</td>
              </tr>
              <tr>
                <td>সংযুক্তি (এবং)</td>
                <td>Noun + で</td>
                <td colspan="2">学生で、毎朝日本語を勉強しています。</td>
                <td>ছাত্র এবং প্রতিদিন সকালে জাপানি পড়ে।</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="guide-callout success">
          <strong>বিশেষ্য + বিশেষ্য সংযোগের জাদু:</strong> দুটি বিশেষ্যকে একসাথে জুড়তে সবসময় মাঝখানে <strong>「の」</strong> বসে। যেমন: <code>日本</code> (জাপান) + <code>車</code> (গাড়ি) = <code>日本の車</code> (জাপানের গাড়ি)।
        </div>

      </article>

    </div>
  \`;
}

function renderGrammarTraps() {
  return \`
    <div class="guide-container" style="display:flex;flex-direction:column;gap:18px">
      
      <!-- Intro Banner -->
      <div style="background:linear-gradient(135deg, rgba(244,67,54,0.12) 0%, rgba(255,152,0,0.1) 100%);border:1px solid rgba(244,67,54,0.25);border-radius:20px;padding:20px 22px">
        <div style="display:flex;align-items:center;gap:10px;margin-bottom:8px">
          <span style="font-size:24px">⚠️</span>
          <h3 style="margin:0;font-size:18px;color:var(--text);font-weight:700">JLPT পরীক্ষায় মানুষ যেগুলোতে সবচেয়ে বেশি ভুল করে!</h3>
        </div>
        <p style="margin:0;font-size:13.5px;line-height:1.6;color:var(--text-2)">
          JLPT N5 থেকে N3 পরীক্ষায় প্রতিবছর পরীক্ষার্থীরা যে প্রশ্নগুলোতে বিভ্রান্ত হয়ে মার্ক হারায় — সেগুলোর গভীরে গিয়ে ৭টি মারাত্মক ফাঁদ (Deadly Traps) এখানে গল্পের মতো ও তুলনামূলক উদাহরণ দিয়ে পরিষ্কার করে দেওয়া হলো।
        </p>
      </div>

      <!-- Trap 1: Wa vs Ga -->
      <article class="guide-card">
        <div class="guide-card-head">
          <div class="guide-card-icon" style="color:#f44336;background:rgba(244,67,54,0.12)">1</div>
          <div>
            <h3 class="guide-card-title">「は」 (Wa) বনাম 「が」 (Ga) — স্পটলাইট কার ওপর?</h3>
            <div class="guide-card-subtitle">জাপানি ভাষার চিরন্তন বিভ্রান্তি ও জাদুকরী সমাধান</div>
          </div>
        </div>

        <p style="font-size:13.5px;line-height:1.6;color:var(--text-2);margin-bottom:12px">
          টর্চলাইটের আলো কল্পনা করুন। বাক্যের কোন অংশে আলো ফেলছেন — সেটাই হলো は ও が এর আসল পার্থক্য:
        </p>

        <div style="display:grid;grid-template-columns:repeat(auto-fit, minmax(260px, 1fr));gap:12px;margin-bottom:14px">
          <div style="background:var(--surface-2);border:1px solid var(--border);border-radius:12px;padding:14px">
            <strong style="color:var(--primary);font-size:15px">A は B (আলো B-এর ওপর)</strong>
            <p style="font-size:12.5px;color:var(--text-2);margin:6px 0">
              "A সম্পর্কে বলছি (Topic), আসল নতুন খবরটা হলো B!" যেমন: <code>私は田中です</code> (আমি হলাম তানাকা - নামটাই আসল খবর)।
            </p>
          </div>
          <div style="background:var(--surface-2);border:1px solid var(--border);border-radius:12px;padding:14px">
            <strong style="color:#64b5f6;font-size:15px">A が B (আলো A-এর ওপর)</strong>
            <p style="font-size:12.5px;color:var(--text-2);margin:6px 0">
              "আসল নায়ক হলো A! কে কাজটা করেছে? A করেছে!" যেমন: <code>田中さんが来ました</code> (তানাকা সাহেব এসেছেন - তিনিই নায়ক!)।
            </p>
          </div>
        </div>

        <div class="wrong-right-box">
          <div class="wrong-item">
            <span class="comparison-tag-wrong">❌ ভুল (Common Mistake)</span>
            <div lang="ja" style="font-size:14px;font-weight:600">だれは来ましたか？</div>
            <div style="font-size:12px;color:var(--muted);margin-top:4px">প্রশ্নবোধক শব্দের সাথে は লাগানো কঠোরভাবে নিষিদ্ধ!</div>
          </div>
          <div class="right-item">
            <span class="comparison-tag-right">⭕ সঠিক (JLPT Standard)</span>
            <div lang="ja" style="font-size:14px;font-weight:600">だれが来ましたか？ ➔ 田中さんが来ました。</div>
            <div style="font-size:12px;color:var(--muted);margin-top:4px">প্রশ্নবোধক শব্দ ও তার উত্তরে সবসময় が বসবে!</div>
          </div>
        </div>

        <div class="guide-callout warning">
          <strong>উপবাক্যে (Subordinate Clause) は নিষিদ্ধ:</strong> কোনো নির্ভর বাক্যাংশে (যেমন: <code>〜とき</code>, <code>〜まえに</code>, <code>〜から</code>) ভেতরের কর্তা সবসময় <strong>が</strong> নেবে!
          <br>❌ <code>私は帰った時...</code> নয় ➔ ⭕ <code>私が帰った時、誰もいなかった。</code>
        </div>
      </article>

      <!-- Trap 2: Ni vs De -->
      <article class="guide-card">
        <div class="guide-card-head">
          <div class="guide-card-icon" style="color:#ff9800;background:rgba(255,152,0,0.12)">2</div>
          <div>
            <h3 class="guide-card-title">「に」 (Ni) বনাম 「で」 (De) — স্থান নির্বাচনের মারাত্মক ভুল</h3>
            <div class="guide-card-subtitle">কাজের স্থান (Action) বনাম অস্তিত্বের স্থান (Existence)</div>
          </div>
        </div>

        <p style="font-size:13.5px;line-height:1.6;color:var(--text-2);margin-bottom:12px">
          স্থান বোঝাতে এই দুটি পার্টিকেল ছাত্ররা সবচেয়ে বেশি গুলিয়ে ফেলে:
        </p>

        <div style="display:grid;grid-template-columns:repeat(auto-fit, minmax(260px, 1fr));gap:12px;margin-bottom:14px">
          <div style="background:var(--surface-2);border:1px solid var(--border);border-radius:12px;padding:14px">
            <strong style="color:var(--primary);font-size:15px">で (কাজের স্থান / Action Location)</strong>
            <p style="font-size:12.5px;color:var(--text-2);margin:6px 0">
              যেখানে মানুষ বা প্রাণী সক্রিয়ভাবে কোনো কর্ম করে।
              <br><code>図書館で勉強する</code> (লাইব্রেরিতে পড়াশোনা করা)।
            </p>
          </div>
          <div style="background:var(--surface-2);border:1px solid var(--border);border-radius:12px;padding:14px">
            <strong style="color:#64b5f6;font-size:15px">に (থাকার স্থান / Static Existence)</strong>
            <p style="font-size:12.5px;color:var(--text-2);margin:6px 0">
              যেখানে কোনো ব্যক্তি বা বস্তু কেবল অবস্থান করে বা থাকে (いる / ある / 住む)।
              <br><code>部屋に猫がいる</code> (রুমে বিড়াল আছে)।
            </p>
          </div>
        </div>

        <div class="wrong-right-box">
          <div class="wrong-item">
            <span class="comparison-tag-wrong">❌ ভুল (পার্টি বা ইভেন্ট ফাঁদ)</span>
            <div lang="ja" style="font-size:14px;font-weight:600">明日、東京にコンサートがある。</div>
            <div style="font-size:12px;color:var(--muted);margin-top:4px">ある দেখে に বসালে শূন্য পাবেন! কনসার্ট কোনো জড়বস্তু নয়!</div>
          </div>
          <div class="right-item">
            <span class="comparison-tag-right">⭕ সঠিক (JLPT Standard)</span>
            <div lang="ja" style="font-size:14px;font-weight:600">明日、東京でコンサートがある。</div>
            <div style="font-size:12px;color:var(--muted);margin-top:4px">কনসার্ট, পার্টি, মিটিং হলো ইভেন্ট বা কর্মযজ্ঞ, তাই で হবে!</div>
          </div>
        </div>
      </article>

      <!-- Trap 3: Ageru vs Kureru vs Morau -->
      <article class="guide-card">
        <div class="guide-card-head">
          <div class="guide-card-icon" style="color:#4caf50;background:rgba(76,175,80,0.12)">3</div>
          <div>
            <h3 class="guide-card-title">「あげる」 / 「くれる」 / 「もらう」 — অনুগ্রহের দিকনির্দেশক কম্পাস</h3>
            <div class="guide-card-subtitle">উপহার ও উপকার আদান-প্রদানের মানসিক মানচিত্র</div>
          </div>
        </div>

        <p style="font-size:13.5px;line-height:1.6;color:var(--text-2);margin-bottom:12px">
          জাপানি সংস্কৃতিতে সুবিধার দিক (Direction of Benefit) অত্যন্ত স্পর্শকাতর। এই কম্পাসটি মনে রাখুন:
        </p>

        <div style="background:var(--surface-2);border:1px solid var(--border);border-radius:14px;padding:16px;margin-bottom:14px">
          <div style="font-size:13.5px;line-height:1.8;color:var(--text)">
            👉 <strong>あげる (বাইরের দিকে):</strong> আমি অন্যকে দিই (বা একজন অপরজনকে দেয়)। <strong>কেউ আমাকে দিলে কখনোই あげる বলা যাবে না!</strong>
            <br>👉 <strong>くれる (ভেতরের দিকে):</strong> কেউ আমাকে বা আমার পরিবারের কাউকে দিলে বা উপকার করলে।
            <br>👉 <strong>もらう (গ্রহীতার চোখ দিয়ে):</strong> আমি বা কেউ অন্য কারও থেকে উপহার/উপকার গ্রহণ করেছি।
          </div>
        </div>

        <div class="wrong-right-box">
          <div class="wrong-item">
            <span class="comparison-tag-wrong">❌ মারাত্মক ভুল (পরীক্ষায় নিয়মিত আসে)</span>
            <div lang="ja" style="font-size:14px;font-weight:600">田中さんが私に本をあげました。</div>
            <div style="font-size:12px;color:var(--muted);margin-top:4px">আমাকে কেউ দিলে あげる বলা জাপানি ব্যাকরণে চরম ভুল!</div>
          </div>
          <div class="right-item">
            <span class="comparison-tag-right">⭕ সঠিক (JLPT Standard)</span>
            <div lang="ja" style="font-size:14px;font-weight:600">田中さんが私に本をくれました。</div>
            <div style="font-size:12px;color:var(--muted);margin-top:4px">আমাকে দিলে সবসময় くれる (kureru) হবে! অথবা もらいました।</div>
          </div>
        </div>

        <div class="guide-callout success">
          <strong>উপকারের রূপান্তর:</strong> কোনো কাজ করে দেওয়ার ক্ষেত্রেও একই নিয়ম খাটে: <code>教えてあげる</code> (আমি শিখিয়ে দেব), <code>教えてくれる</code> (আমাকে শিখিয়ে দেয়), <code>教えてもらう</code> (কারও কাছ থেকে শিখে নেওয়া)।
        </div>
      </article>

      <!-- Trap 4: Transitive vs Intransitive -->
      <article class="guide-card">
        <div class="guide-card-head">
          <div class="guide-card-icon" style="color:#ab47bc;background:rgba(171,71,188,0.12)">4</div>
          <div>
            <h3 class="guide-card-title">「自動詞」 (অকর্মক) বনাম 「他動詞」 (সকর্মক) — কে কাজ করছে?</h3>
            <div class="guide-card-subtitle">স্বয়ংক্রিয় অবস্থা বনাম মানুষের ইচ্ছাকৃত কর্ম</div>
          </div>
        </div>

        <p style="font-size:13.5px;line-height:1.6;color:var(--text-2);margin-bottom:12px">
          জাপানি ভাষায় একই কাজের দুটি আলাদা রূপ থাকে। কে কাজটা করছে তার ওপর ভিত্তি করে পার্টিকেল ও ক্রিয়া বদলে যায়:
        </p>

        <div style="display:grid;grid-template-columns:repeat(auto-fit, minmax(260px, 1fr));gap:12px;margin-bottom:14px">
          <div style="background:var(--surface-2);border:1px solid var(--border);border-radius:12px;padding:14px">
            <strong style="color:var(--primary);font-size:15px">他動詞 (Tadoushi - সকর্মক): を</strong>
            <p style="font-size:12.5px;color:var(--text-2);margin:6px 0">
              মানুষ ইচ্ছাকৃতভাবে কোনো বস্তুর ওপর কাজটা করে। সাথে <strong>を</strong> বসে।
              <br><code>私がドアを開ける (akeru)</code> ➔ আমি দরজা খুলি।
            </p>
          </div>
          <div style="background:var(--surface-2);border:1px solid var(--border);border-radius:12px;padding:14px">
            <strong style="color:#64b5f6;font-size:15px">自動詞 (Jidoushi - অকর্মক): が</strong>
            <p style="font-size:12.5px;color:var(--text-2);margin:6px 0">
              স্বয়ংক্রিয়ভাবে বা প্রাকৃতিকভাবে কোনো অবস্থা তৈরি হওয়া। সাথে <strong>が</strong> বসে।
              <br><code>ドアが開く (aku)</code> ➔ দরজা খোলে / খোলা আছে।
            </p>
          </div>
        </div>

        <!-- 7 pairs table -->
        <div class="guide-table-wrap">
          <table class="guide-table">
            <thead>
              <tr>
                <th>অর্থ</th>
                <th>自動詞 (অকর্মক: が)</th>
                <th>他動詞 (সকর্মক: を)</th>
                <th>মনে রাখার ট্রিক</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>খোলা (Open)</td>
                <td><strong lang="ja" style="color:#64b5f6">開く</strong> (あく)</td>
                <td><strong lang="ja" style="color:var(--primary)">開ける</strong> (あける)</td>
                <td>~eru থাকলে সচরাচর সকর্মক হয়</td>
              </tr>
              <tr>
                <td>বন্ধ হওয়া (Close)</td>
                <td><strong lang="ja" style="color:#64b5f6">閉まる</strong> (しまる)</td>
                <td><strong lang="ja" style="color:var(--primary)">閉める</strong> (しめる)</td>
                <td>-aru অকর্মক, -eru সকর্মক</td>
              </tr>
              <tr>
                <td>নিভে যাওয়া (Turn off)</td>
                <td><strong lang="ja" style="color:#64b5f6">消える</strong> (きえる)</td>
                <td><strong lang="ja" style="color:var(--primary)">消す</strong> (けす)</td>
                <td>-su থাকলে সবসময় সকর্মক!</td>
              </tr>
              <tr>
                <td>জ্বলা (Turn on)</td>
                <td><strong lang="ja" style="color:#64b5f6">つく</strong> (付く)</td>
                <td><strong lang="ja" style="color:var(--primary)">つける</strong> (付ける)</td>
                <td>বাত্তি নিজে জ্বললে つく, মানুষ জ্বালালে つける</td>
              </tr>
              <tr>
                <td>পড়া (Drop / Fall)</td>
                <td><strong lang="ja" style="color:#64b5f6">落ちる</strong> (おちる)</td>
                <td><strong lang="ja" style="color:var(--primary)">落とす</strong> (おとす)</td>
                <td>-su সকর্মক (মানুষ হাত থেকে ফেলল)</td>
              </tr>
              <tr>
                <td>বের হওয়া (Exit)</td>
                <td><strong lang="ja" style="color:#64b5f6">出る</strong> (でる)</td>
                <td><strong lang="ja" style="color:var(--primary)">出す</strong> (だす)</td>
                <td>আমি বের হই 出る, চিঠি ড্রপবক্সে ফেলি 出す</td>
              </tr>
              <tr>
                <td>ঢোকা (Enter)</td>
                <td><strong lang="ja" style="color:#64b5f6">入る</strong> (はいる)</td>
                <td><strong lang="ja" style="color:var(--primary)">入れる</strong> (いれる)</td>
                <td>চিনি কাপে ঢালি 入れる, রুমে ঢুকি 入る</td>
              </tr>
            </tbody>
          </table>
        </div>
      </article>

      <!-- Trap 5: Potential / Tai Particle Trap -->
      <article class="guide-card">
        <div class="guide-card-head">
          <div class="guide-card-icon" style="color:#00acc1;background:rgba(0,172,193,0.12)">5</div>
          <div>
            <h3 class="guide-card-title">সক্ষমতা ও ইচ্ছার পার্টিকেল ট্র্যাপ — 「を」 নাকি 「が」?</h3>
            <div class="guide-card-subtitle">Potential Form (〜できる / 〜話せる) ও 〜たい এর ব্যাকরণ নিয়ম</div>
          </div>
        </div>

        <p style="font-size:13.5px;line-height:1.6;color:var(--text-2);margin-bottom:12px">
          সাধারণ বাক্যে <code>日本語を話す</code> (জাপানি ভাষায় কথা বলা - を বসে)। কিন্তু যখনই আপনি বলবেন "আমি জাপানি ভাষায় কথা বলতে <strong>পারি</strong>" (সক্ষমতা) — তখন JLPT-র স্ট্যান্ডার্ড ব্যাকরণে <strong>が</strong> বসাতে হবে!
        </p>

        <div class="wrong-right-box">
          <div class="wrong-item">
            <span class="comparison-tag-wrong">❌ JLPT পরীক্ষায় নম্বর কাটা যায়</span>
            <div lang="ja" style="font-size:14px;font-weight:600">私は日本語を話せます。</div>
            <div style="font-size:12px;color:var(--muted);margin-top:4px">কথ্য ভাষায় চললেও JLPT পরীক্ষার অপশনে を ভুল ধরা হয়!</div>
          </div>
          <div class="right-item">
            <span class="comparison-tag-right">⭕ সঠিক (JLPT Standard)</span>
            <div lang="ja" style="font-size:14px;font-weight:600">私は日本語が話せます。</div>
            <div style="font-size:12px;color:var(--muted);margin-top:4px">সক্ষমতার বিষয়বস্তু নির্দেশ করতে সবসময় が বসে!</div>
          </div>
        </div>

        <div class="guide-callout success">
          <strong>〜たい (ইচ্ছা) এর ক্ষেত্রে:</strong> <code>水が飲みたい</code> এবং <code>水を飲みたい</code> — দুটিই শুদ্ধ। তবে <code>が</code> দিলে তৃষ্ণার তীব্রতা বা বস্তুটির প্রতি গভীর ফোকাস বোঝায়!
        </div>
      </article>

      <!-- Trap 6: Plain form in subordinate clauses -->
      <article class="guide-card">
        <div class="guide-card-head">
          <div class="guide-card-icon" style="color:#e91e63;background:rgba(233,30,99,0.12)">6</div>
          <div>
            <h3 class="guide-card-title">উপবাক্যে (Subordinate Clauses) সাধারণ রূপের (Plain Form) বাধ্যবাধকতা</h3>
            <div class="guide-card-subtitle">〜とき, 〜まえに, 〜あとで, 〜から এর আগে মাসু ফর্মের ভুল</div>
          </div>
        </div>

        <p style="font-size:13.5px;line-height:1.6;color:var(--text-2);margin-bottom:12px">
          জাপানি ভাষার লোহার মতো শক্ত নিয়ম: কোনো বাক্যাংশের ভেতরে যখন <code>〜とき (যখন)</code>, <code>〜まえに (আগে)</code>, <code>〜あとで (পরে)</code>, <code>〜から (যেহেতু)</code> ইত্যাদি বসে — তার আগের ক্রিয়াপদটি <strong>অবশ্যই সাধারণ রূপ (Plain Form / 辞書形 / た形 / ない形)</strong> হতে হবে! ভেতরে কখনোই <code>〜ます</code> বা <code>〜です</code> বসবে না! নম্রতা প্রকাশ পাবে কেবল পুরো বাক্যের শেষ ক্রিয়াপদে।
        </p>

        <div class="wrong-right-box">
          <div class="wrong-item">
            <span class="comparison-tag-wrong">❌ ভুল (অতি-নম্রতার ফাঁদ)</span>
            <div lang="ja" style="font-size:14px;font-weight:600">学校へ行きます前に、朝ご飯を食べます。</div>
            <div style="font-size:12px;color:var(--muted);margin-top:4px">উপবাক্যে 行きます বসানো সম্পূর্ণ ব্যাকরণবিরুদ্ধ!</div>
          </div>
          <div class="right-item">
            <span class="comparison-tag-right">⭕ সঠিক (JLPT Standard)</span>
            <div lang="ja" style="font-size:14px;font-weight:600">学校へ行く前に、朝ご飯を食べます。</div>
            <div style="font-size:12px;color:var(--muted);margin-top:4px">ভেতরে অভিধান রূপ 行く বসবে, নম্রতা শেষে 食べます-এ হবে!</div>
          </div>
        </div>
      </article>

      <!-- Trap 7: Causative-Passive -->
      <article class="guide-card">
        <div class="guide-card-head">
          <div class="guide-card-icon" style="color:#d32f2f;background:rgba(211,47,47,0.12)">7</div>
          <div>
            <h3 class="guide-card-title">使役受身 (Causative-Passive) — "অনিচ্ছা সত্ত্বেও বাধ্য হওয়া"</h3>
            <div class="guide-card-subtitle">〜させられる / 〜される (N4 ও N3-র সবচেয়ে ভীতিকর প্যাটার্ন)</div>
          </div>
        </div>

        <p style="font-size:13.5px;line-height:1.6;color:var(--text-2);margin-bottom:12px">
          N4 ও N3 এর পরীক্ষার্থীদের সবচেয়ে বেশি রাতের ঘুম হারাম করে এই রূপান্তরটি। কিন্তু এর মূল ভাবটি বুঝলে পানির মতো পরিষ্কার:
        </p>

        <div class="guide-callout danger">
          <div style="font-size:14px;font-weight:700;color:#f44336;margin-bottom:6px">
            💡 মূল ভাব: "নিজের বিন্দুমাত্র ইচ্ছা ছিল না, কিন্তু কারও চাপে বা নির্দেশে বাধ্য হয়ে করতে হয়েছে!"
          </div>
          <div style="font-size:13px;line-height:1.6">
            উদাহরণ:
            <br>• <strong>母に野菜を食べさせられた。</strong> (মায়ের নির্দেশে বাধ্য হয়ে সবজি খেতে হয়েছে - আমার খেতে একদম মন ছিল না)।
            <br>• <strong>部長に歌を歌わされた。</strong> (ম্যানেজারের চাপে বাধ্য হয়ে পার্টিতে গান গাইতে হয়েছে)।
          </div>
        </div>

        <div class="guide-table-wrap">
          <table class="guide-table">
            <thead>
              <tr>
                <th>গ্রুপ</th>
                <th>অভিধান রূপ</th>
                <th>使役受身 (বাধ্য হয়ে করা)</th>
                <th>সংক্ষিপ্ত রূপ (কথ্য ও JLPT)</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>গ্রুপ ১ (Godan)</td>
                <td>飲む (পান করা)</td>
                <td>飲ませられる</td>
                <td><strong style="color:var(--primary)">飲まされる</strong></td>
              </tr>
              <tr>
                <td>গ্রুপ ১ (Godan)</td>
                <td>待つ (অপেক্ষা)</td>
                <td>待たせられる</td>
                <td><strong style="color:var(--primary)">待たされる</strong></td>
              </tr>
              <tr>
                <td>গ্রুপ ২ (Ichidan)</td>
                <td>食べる (খাওয়া)</td>
                <td><strong style="color:#64b5f6">食べさせられる</strong></td>
                <td>—</td>
              </tr>
              <tr>
                <td>গ্রুপ ৩ (Irregular)</td>
                <td>する (করা)</td>
                <td><strong style="color:#ffb74d">させられる</strong></td>
                <td>—</td>
              </tr>
            </tbody>
          </table>
        </div>
      </article>

    </div>
  \`;
}

function renderGrammar() {
  const all = (typeof GRAMMAR !== "undefined" ? GRAMMAR : []);
  const filtered = all.filter((g) => {
    if (grammarLevel !== "all" && g.level !== grammarLevel) return false;
    if (grammarQuery.trim()) {
      const q = grammarQuery.toLowerCase().trim();
      return (
        g.pattern.toLowerCase().includes(q) ||
        g.romaji.toLowerCase().includes(q) ||
        g.meaningBn.toLowerCase().includes(q) ||
        g.meaningEn.toLowerCase().includes(q) ||
        (g.explanationBn && g.explanationBn.toLowerCase().includes(q))
      );
    }
    return true;
  });

  return \`
    <button class="back-link" data-action="open-browse">\${icon("arrowLeft", 15)} Kanji library</button>

    <div class="view-head">
      <span class="eyebrow">Reference · ব্যাকরণ ও রূপান্তর মাস্টারক্লাস</span>
      <h2>Grammar & Mastery (文法と活用)</h2>
      <p>JLPT N5, N4 ও N3-এর জন্য প্রয়োজনীয় ব্যাকরণ প্যাটার্ন, রূপান্তরের জাদুকরী নিয়ম ও পরীক্ষার সবচেয়ে বিভ্রান্তিকর ফাঁদসমূহ।</p>
    </div>

    <!-- Navigation Tabs -->
    <div class="chips soft-chips grammar-nav-tabs" role="tablist" style="margin-bottom:18px;display:flex;gap:8px;flex-wrap:wrap">
      <button class="chip \${grammarTab === "list" ? "active" : ""}" data-action="grammar-tab" data-tab="list">
        \${icon("book", 15)} ব্যাকরণ প্যাটার্ন তালিকা (\${all.length})
      </button>
      <button class="chip \${grammarTab === "guide" ? "active" : ""}" data-action="grammar-tab" data-tab="guide">
        \${icon("refresh", 15)} রূপান্তর সহায়িকা ও গল্প
      </button>
      <button class="chip \${grammarTab === "traps" ? "active" : ""}" data-action="grammar-tab" data-tab="traps">
        \${icon("target", 15)} সাধারণ ভুলের ৭টি ফাঁদ (Traps)
      </button>
    </div>

    \${grammarTab === "guide" ? renderConjugationGuide() :
      grammarTab === "traps" ? renderGrammarTraps() : \`
      
      <!-- Pattern List Mode -->
      <div class="search-field">
        \${icon("search", 20)}
        <input id="grammar-search" type="search" value="\${escapeHtml(grammarQuery)}" placeholder="প্যাটার্ন বা অর্থ দিয়ে খুঁজুন (যেমন: tara, হতে পারে, কারণ)…" autocomplete="off" spellcheck="false" aria-label="Search grammar" />
        <button class="search-clear \${grammarQuery ? "" : "hidden"}" data-action="clear-grammar-search" aria-label="Clear search">\${icon("x", 16)}</button>
      </div>

      <div class="chips soft-chips" role="group" aria-label="Filter grammar by level" style="margin-bottom:14px">
        <button class="chip \${grammarLevel === "all" ? "active" : ""}" data-action="grammar-level" data-level="all">All (\${all.length})</button>
        \${["N5", "N4", "N3"].map((lvl) => {
          const count = all.filter((g) => g.level === lvl).length;
          return \`<button class="chip \${grammarLevel === lvl ? "active" : ""}" data-action="grammar-level" data-level="\${lvl}">\${lvl} (\${count})</button>\`;
        }).join("")}
      </div>

      <div class="grammar-list" style="display:flex;flex-direction:column;gap:12px;margin-top:14px">
        \${filtered.length ? filtered.map((g) => \`
          <article class="grammar-card" style="background:var(--surface);border:1px solid var(--border);border-radius:20px;padding:16px 18px">
            <div style="display:flex;align-items:flex-start;justify-content:space-between;gap:10px;margin-bottom:6px">
              <div>
                <h3 style="font-family:var(--font-jp);font-size:20px;font-weight:700;color:var(--text);margin:0">\${escapeHtml(g.pattern)}</h3>
                <span style="font-size:12px;color:var(--muted);font-family:monospace">\${escapeHtml(g.romaji)}</span>
              </div>
              <span class="level-badge \${g.level}">JLPT \${g.level}</span>
            </div>

            <div style="font-size:14px;font-weight:600;color:var(--primary);margin-bottom:8px">
              \${escapeHtml(g.meaningBn)} <span style="font-size:12px;font-weight:400;color:var(--text-2)">(\${escapeHtml(g.meaningEn)})</span>
            </div>

            <div style="background:var(--surface-2);border-radius:10px;padding:8px 12px;font-size:12.5px;color:var(--text);margin-bottom:10px;border-left:3px solid var(--primary)">
              <strong>গঠন (Formation):</strong> <code style="font-family:inherit;color:var(--text)">\${escapeHtml(g.formation)}</code>
            </div>

            <p style="font-size:13px;line-height:1.5;color:var(--text-2);margin:0 0 12px">\${escapeHtml(g.explanationBn)}</p>

            \${g.examples && g.examples.length ? \`
              <div style="border-top:1px dashed var(--border);padding-top:10px;display:flex;flex-direction:column;gap:8px">
                \${g.examples.map((ex) => \`
                  <div style="background:rgba(255,255,255,0.02);border-radius:12px;padding:8px 12px">
                    <div style="display:flex;align-items:center;justify-content:space-between;gap:8px">
                      <div style="font-family:var(--font-jp);font-size:15px;line-height:1.5" lang="ja">\${ex.ruby || escapeHtml(ex.japanese)}</div>
                      <button class="speak-btn" data-action="speak" data-text="\${escapeHtml(ex.japanese)}" aria-label="Listen">\${icon("volume", 13)}</button>
                    </div>
                    <div style="font-size:12.5px;color:var(--muted);margin-top:2px">\${escapeHtml(ex.meaningBn)}</div>
                  </div>
                \`).join("")}
              </div>
            \` : ""}
          </article>
        \`).join("") : \`
          <div class="empty">
            <strong>কোনো ব্যাকরণ পাওয়া যায়নি</strong>
            <p>অন্য কোনো অনুসন্ধান বা লেভেল দিয়ে দেখুন।</p>
          </div>
        \`}
      </div>
    \`}
  \`;
}
`;

// Find where renderGrammar is defined in views.js and replace it
const startTarget = "let grammarLevel = \"all\";";
const endTarget = "let readerInputText = \"\";";

const startIndex = views.indexOf(startTarget);
const endIndex = views.indexOf(endTarget);

if (startIndex === -1 || endIndex === -1) {
  console.error("Could not find targets in views.js", { startIndex, endIndex });
  process.exit(1);
}

const updatedViews = views.slice(0, startIndex) + newGrammarCode.trim() + "\n\n" + views.slice(endIndex);
fs.writeFileSync(viewsPath, updatedViews, "utf8");
console.log("Successfully injected renderConjugationGuide, renderGrammarTraps, and enhanced renderGrammar into js/views.js");
