const PptxGenJS = require('/Users/yuka_m/.nvm/versions/node/v24.13.1/lib/node_modules/pptxgenjs');
const pptx = new PptxGenJS();
pptx.layout = 'LAYOUT_WIDE';

const C = {
  navy:   '1A237E', blue:   '1976D2', lightBl:'E3F2FD',
  orange: 'E65100', lightOr:'FBE9E7', green:  '2E7D32',
  lightGr:'E8F5E9', purple: '6A1B9A', lightPu:'F3E5F5',
  gray:   '546E7A', lightGy:'F5F7FA', white:  'FFFFFF',
  text:   '263238', red:    'C62828', yellow: 'F9A825',
};

// ─── ヘルパー ────────────────────────────────────────
function hdr(slide, title, sub) {
  slide.addShape(pptx.ShapeType.rect, { x:0,y:0,w:'100%',h:1.0, fill:{color:C.navy} });
  slide.addText(title, { x:0.4,y:0.08,w:12,h:0.55, fontSize:22,bold:true,color:C.white,fontFace:'Meiryo' });
  if(sub) slide.addText(sub, { x:0.4,y:0.62,w:12,h:0.3, fontSize:10,color:'BBDEFB',fontFace:'Meiryo' });
  slide.addShape(pptx.ShapeType.rect, { x:0,y:6.8,w:'100%',h:0.2, fill:{color:C.blue} });
  slide.addText('人員計画管理システム', { x:0.4,y:6.85,w:8,h:0.15, fontSize:8,color:C.white,fontFace:'Meiryo' });
}

// 矩形プロセスボックス
function proc(slide, x, y, w, h, text, fc, tc, fs) {
  slide.addShape(pptx.ShapeType.rect, { x,y,w,h, fill:{color:fc||C.lightBl}, line:{color:C.blue,pt:1}, rectRadius:0.06 });
  slide.addText(text, { x,y,w,h, fontSize:fs||9.5, bold:true, color:tc||C.navy, align:'center', valign:'middle', fontFace:'Meiryo', wrap:true });
}

// 菱形（判断）ボックス — pptxはdiamond対応
function dmd(slide, x, y, w, h, text, fc, tc) {
  slide.addShape(pptx.ShapeType.diamond, { x,y,w,h, fill:{color:fc||'FFF9C4'}, line:{color:C.yellow,pt:1.5} });
  slide.addText(text, { x,y,w,h, fontSize:8.5, bold:true, color:tc||C.text, align:'center', valign:'middle', fontFace:'Meiryo', wrap:true });
}

// 横矢印（単純ライン）
function arrowR(slide, x, y, len) {
  slide.addShape(pptx.ShapeType.rightArrow, { x,y,w:len,h:0.28, fill:{color:C.blue}, line:{color:C.blue} });
}
// 下矢印
function arrowD(slide, x, y, len) {
  slide.addShape(pptx.ShapeType.downArrow, { x,y,w:0.28,h:len, fill:{color:C.blue}, line:{color:C.blue} });
}
// ラベル付き縦線（クロスレーン接続の代用）
function vline(slide, x, y1, y2, color) {
  slide.addShape(pptx.ShapeType.rect, { x,y:y1,w:0.04,h:y2-y1, fill:{color:color||C.blue} });
}
function hline(slide, x1, x2, y, color) {
  slide.addShape(pptx.ShapeType.rect, { x:x1,y,w:x2-x1,h:0.04, fill:{color:color||C.blue} });
}

// ════════════════════════════════════════════════════
// スライド1：スイムレーン業務フロー図
// ════════════════════════════════════════════════════
{
  const slide = pptx.addSlide();
  hdr(slide, '業務フロー（スイムレーン）', '月次・半期の標準的な業務プロセスと役割分担');

  // ─ レーン定義 ─
  const LX = 0.15;   // レーンラベルのX
  const LW = 0.95;   // ラベル幅
  const CX = 1.15;   // コンテンツ開始X
  const CW = 12.1;   // コンテンツ幅

  const lanes = [
    { label:'人事',       y:1.05, h:1.75, bg:'EBF5FB', lbg:C.blue,   lc:C.white },
    { label:'センター長', y:2.80, h:1.70, bg:'E8F5E9', lbg:C.green,  lc:C.white },
    { label:'企画',       y:4.50, h:1.55, bg:'FBE9E7', lbg:C.orange, lc:C.white },
  ];

  // レーン背景＋ラベル
  lanes.forEach(l => {
    slide.addShape(pptx.ShapeType.rect, { x:LX,y:l.y,w:LW,h:l.h, fill:{color:l.lbg}, line:{color:'BBBBBB',pt:0.5} });
    slide.addText(l.label, { x:LX,y:l.y,w:LW,h:l.h, fontSize:11,bold:true,color:l.lc,align:'center',valign:'middle',fontFace:'Meiryo' });
    slide.addShape(pptx.ShapeType.rect, { x:CX,y:l.y,w:CW,h:l.h, fill:{color:l.bg}, line:{color:'BBBBBB',pt:0.5} });
  });

  // ─ 「開始」バナー ─
  slide.addShape(pptx.ShapeType.rect, { x:LX,y:1.05,w:LW+CW,h:0.0, fill:{color:'DDDDDD'} });

  // ─ スタート ─
  slide.addShape(pptx.ShapeType.ellipse, { x:1.25,y:1.18,w:0.85,h:0.55, fill:{color:C.navy} });
  slide.addText('月初\nスタート', { x:1.25,y:1.18,w:0.85,h:0.55, fontSize:7.5,bold:true,color:C.white,align:'center',valign:'middle',fontFace:'Meiryo' });

  // ─ 人事レーン ─────────────────────────────────────
  // [異動計画登録] x=2.25
  arrowR(slide, 2.12, 1.41, 0.42);
  proc(slide, 2.55, 1.13, 1.65, 0.65, '①\n異動計画登録', C.lightBl, C.navy, 9);
  // [計画自動反映]
  arrowR(slide, 4.22, 1.41, 0.38);
  proc(slide, 4.62, 1.13, 1.55, 0.65, '②\n計画へ自動反映', 'D6EAF8', C.navy, 9);
  // [スナップショット保存] — センター長承認後
  proc(slide, 8.30, 1.13, 1.75, 0.65, '④\nスナップショット\n保存', C.lightBl, C.navy, 8.5);
  // [差分分析]
  arrowR(slide, 10.07, 1.41, 0.38);
  proc(slide, 10.47, 1.13, 1.65, 0.65, '⑤\n差分分析・報告', C.lightBl, C.navy, 9);

  // 人事 [計画修正] — NO ルート受け取り
  proc(slide, 6.0, 1.13, 1.65, 0.65, '計画\n修正', 'FDECEA', C.red, 9);
  // 修正→自動反映へ戻る矢印
  hline(slide, 5.0, 5.95, 1.01, C.red);
  vline(slide, 5.0, 1.01, 1.13, C.red);
  slide.addText('修正', { x:5.0,y:0.88,w:0.9,h:0.22, fontSize:8,color:C.red,align:'center',fontFace:'Meiryo' });

  // 計画修正→自動反映（矢印）
  arrowR(slide, 4.22, 1.41, 0.38); // 既存

  // ─ センター長レーン ─────────────────────────────
  // [計画確認] — 自動反映の下
  proc(slide, 4.62, 2.95, 1.55, 0.60, '③\n計画内容確認', C.lightGr, C.green, 9);
  // 縦接続: 自動反映→計画確認
  vline(slide, 5.39, 1.78, 2.95, C.blue);
  arrowD(slide, 5.25, 1.68, 0.38);

  // 判断ダイヤモンド [承認？]
  dmd(slide, 6.42, 2.85, 1.55, 0.80, '承認\nOK?');

  arrowR(slide, 6.19, 3.24, 0.22);

  // YES → スナップショットへ（横線で接続）
  hline(slide, 7.99, 9.17, 3.24, C.green);
  slide.addText('YES', { x:8.2,y:3.05,w:0.7,h:0.22, fontSize:8.5,color:C.green,bold:true,align:'center',fontFace:'Meiryo' });
  vline(slide, 9.17, 2.55, 3.24, C.green);
  arrowD(slide, 9.03, 1.88, 0.38);

  // NO → 修正依頼
  arrowD(slide, 7.15, 3.65, 0.35);
  proc(slide, 6.42, 4.02, 1.55, 0.55, '修正依頼', 'FDECEA', C.red, 9);
  // 修正依頼 → 人事 計画修正へ
  hline(slide, 6.77, 6.83, 4.30, C.red);
  vline(slide, 6.83, 1.78, 4.30, C.red);
  arrowD(slide, 6.69, 1.68, 0.38);

  // ─ 企画レーン ─────────────────────────────────────
  slide.addText('（半期）', { x:1.18,y:4.58,w:1.65,h:0.25, fontSize:8,color:C.orange,align:'center',fontFace:'Meiryo',italic:true });
  proc(slide, 1.18, 4.85, 1.65, 0.60, '将来人数\n策定', C.lightOr, C.orange, 9);
  arrowR(slide, 2.85, 5.13, 0.38);
  proc(slide, 3.25, 4.85, 1.65, 0.60, '将来人数\n登録', C.lightOr, C.orange, 9);
  // 将来人数 → 差分分析（点線で接続）
  hline(slide, 4.92, 10.55, 5.13, C.orange);
  arrowR(slide, 10.44, 5.13, 0.28);

  // 差分分析（全員参照）の縦接続
  vline(slide, 11.29, 1.78, 5.13, C.blue);
  slide.addText('全ロール\n参照可', { x:11.3,y:3.2,w:0.9,h:0.45, fontSize:7.5,color:C.blue,italic:true,align:'center',fontFace:'Meiryo' });

  // ─ 凡例 ─
  slide.addShape(pptx.ShapeType.rect, { x:0.15,y:6.1,w:13.0,h:0.62, fill:{color:C.lightGy}, line:{color:'DDDDDD',pt:0.3} });
  slide.addText('凡例:', { x:0.25,y:6.18,w:0.6,h:0.28, fontSize:8.5,bold:true,color:C.text,fontFace:'Meiryo' });
  const legends = [
    {shape:'rect',  fc:C.lightBl, label:'プロセス（処理）'},
    {shape:'diamond',fc:'FFF9C4',  label:'判断（分岐）'},
    {shape:'ellipse',fc:C.navy,    label:'開始/終了'},
  ];
  legends.forEach((l,i) => {
    const lx = 1.0 + i*3.5;
    slide.addShape(pptx.ShapeType[l.shape]||pptx.ShapeType.rect, { x:lx,y:6.2,w:0.55,h:0.3, fill:{color:l.fc}, line:{color:'AAAAAA',pt:0.5} });
    slide.addText(l.label, { x:lx+0.65,y:6.2,w:2.5,h:0.3, fontSize:8.5,color:C.text,fontFace:'Meiryo',valign:'middle' });
  });
}

// ════════════════════════════════════════════════════
// スライド2：システムアーキテクチャ概略図
// ════════════════════════════════════════════════════
{
  const slide = pptx.addSlide();
  hdr(slide, 'システムアーキテクチャ概略図', 'AWS Amplify + RDS PostgreSQL 構成');

  // ─ ユーザー層 ─────────────────────────────────────
  slide.addShape(pptx.ShapeType.rect, { x:0.2,y:1.05,w:3.2,h:5.55, fill:{color:'F8F9FA'}, line:{color:'CCCCCC',pt:1,dashType:'dash'}, rectRadius:0.1 });
  slide.addText('ユーザー層', { x:0.2,y:1.05,w:3.2,h:0.38, fontSize:10,bold:true,color:C.gray,align:'center',fontFace:'Meiryo' });

  const users = [
    { label:'人事',       icon:'👤', color:C.blue,   y:1.55 },
    { label:'センター長', icon:'👤', color:C.green,  y:2.80 },
    { label:'企画',       icon:'👤', color:C.orange, y:4.05 },
  ];
  users.forEach(u => {
    slide.addShape(pptx.ShapeType.rect, { x:0.4,y:u.y,w:2.8,h:1.0, fill:{color:C.white}, line:{color:u.color,pt:1.5}, rectRadius:0.1 });
    slide.addText(u.icon, { x:0.4,y:u.y+0.05,w:0.7,h:0.7, fontSize:18,align:'center',fontFace:'Meiryo' });
    slide.addText(u.label, { x:1.1,y:u.y+0.1,w:1.8,h:0.4, fontSize:11,bold:true,color:u.color,fontFace:'Meiryo',valign:'middle' });
    slide.addText('PC / ブラウザ', { x:1.1,y:u.y+0.52,w:1.8,h:0.3, fontSize:8.5,color:C.gray,fontFace:'Meiryo' });
  });

  // HTTPS矢印（ユーザー→Amplify）
  slide.addShape(pptx.ShapeType.rightArrow, { x:3.5,y:3.3,w:0.65,h:0.55, fill:{color:C.blue} });
  slide.addText('HTTPS', { x:3.45,y:3.15,w:0.9,h:0.25, fontSize:8,color:C.blue,align:'center',fontFace:'Meiryo' });

  // ─ AWS Cloud 枠 ─────────────────────────────────
  slide.addShape(pptx.ShapeType.rect, { x:4.25,y:1.05,w:8.85,h:5.55, fill:{color:'FFF8E1'}, line:{color:C.yellow,pt:1.5,dashType:'dash'}, rectRadius:0.15 });
  slide.addText('☁  AWS Cloud（us-east-1）', { x:4.35,y:1.1,w:4.5,h:0.38, fontSize:10,bold:true,color:'F57F17',fontFace:'Meiryo' });

  // ─ GitHub → Amplify CI/CD ────────────────────────
  slide.addShape(pptx.ShapeType.rect, { x:4.45,y:1.58,w:2.3,h:0.85, fill:{color:'F5F5F5'}, line:{color:'AAAAAA',pt:1}, rectRadius:0.08 });
  slide.addText('🐙  GitHub\ntsuboi-yd/HRManage', { x:4.45,y:1.58,w:2.3,h:0.85, fontSize:8.5,color:C.text,align:'center',valign:'middle',fontFace:'Meiryo' });

  slide.addShape(pptx.ShapeType.rightArrow, { x:6.78,y:1.88,w:0.7,h:0.38, fill:{color:'7B1FA2'} });
  slide.addText('push →\n自動ビルド', { x:6.72,y:1.72,w:1.0,h:0.36, fontSize:7.5,color:'7B1FA2',align:'center',fontFace:'Meiryo' });

  // ─ Amplify Hosting ──────────────────────────────
  slide.addShape(pptx.ShapeType.rect, { x:7.55,y:1.45,w:5.3,h:2.35, fill:{color:C.lightBl}, line:{color:C.blue,pt:1.5}, rectRadius:0.12 });
  slide.addText('AWS Amplify Hosting', { x:7.65,y:1.52,w:5.1,h:0.38, fontSize:11,bold:true,color:C.navy,align:'center',fontFace:'Meiryo' });

  // Amplify内部構成
  const amplifyItems = [
    { label:'Next.js 14\nApp Router (SSR)', color:'D6EAF8', x:7.72, y:1.98, w:2.35 },
    { label:'API Routes\n(/api/*)',          color:'D6EAF8', x:10.18,y:1.98, w:2.45 },
  ];
  amplifyItems.forEach(a => {
    slide.addShape(pptx.ShapeType.rect, { x:a.x,y:a.y,w:a.w,h:0.75, fill:{color:a.color}, line:{color:C.blue,pt:0.7}, rectRadius:0.08 });
    slide.addText(a.label, { x:a.x,y:a.y,w:a.w,h:0.75, fontSize:8.5,color:C.navy,align:'center',valign:'middle',fontFace:'Meiryo',wrap:true });
  });
  slide.addShape(pptx.ShapeType.rightArrow, { x:10.1,y:2.27,w:0.32,h:0.25, fill:{color:C.blue} });

  // Amplify→Prisma矢印
  slide.addShape(pptx.ShapeType.downArrow, { x:9.1,y:3.83,w:0.38,h:0.42, fill:{color:C.blue} });
  slide.addText('Prisma ORM', { x:8.5,y:4.28,w:1.6,h:0.28, fontSize:8,color:C.blue,align:'center',fontFace:'Meiryo' });

  // ─ RDS ──────────────────────────────────────────
  slide.addShape(pptx.ShapeType.rect, { x:7.55,y:4.15,w:5.3,h:1.55, fill:{color:C.lightGr}, line:{color:C.green,pt:1.5}, rectRadius:0.12 });
  slide.addText('Amazon RDS', { x:7.65,y:4.22,w:5.1,h:0.38, fontSize:11,bold:true,color:C.green,align:'center',fontFace:'Meiryo' });

  const rdsItems = [
    { label:'PostgreSQL 15\n(db.t3.micro)', x:7.72, y:4.65, w:2.35 },
    { label:'スキーマ\n7テーブル',           x:10.18,y:4.65, w:2.45 },
  ];
  rdsItems.forEach(r => {
    slide.addShape(pptx.ShapeType.rect, { x:r.x,y:r.y,w:r.w,h:0.75, fill:{color:'C8E6C9'}, line:{color:C.green,pt:0.7}, rectRadius:0.08 });
    slide.addText(r.label, { x:r.x,y:r.y,w:r.w,h:0.75, fontSize:8.5,color:C.green,align:'center',valign:'middle',fontFace:'Meiryo',wrap:true });
  });

  // ─ 将来追加予定（Azure AD → Cognito）────────────
  slide.addShape(pptx.ShapeType.rect, { x:4.45,y:2.58,w:2.85,h:2.35, fill:{color:'FDECEA'}, line:{color:C.red,pt:1,dashType:'dash'}, rectRadius:0.1 });
  slide.addText('将来実装', { x:4.5,y:2.62,w:2.75,h:0.28, fontSize:8.5,bold:true,color:C.red,align:'center',fontFace:'Meiryo' });

  slide.addShape(pptx.ShapeType.rect, { x:4.6,y:2.95,w:2.6,h:0.65, fill:{color:C.white}, line:{color:'AAAAAA',pt:0.8}, rectRadius:0.07 });
  slide.addText('🏢  Azure AD\n（社内認証基盤）', { x:4.6,y:2.95,w:2.6,h:0.65, fontSize:8.5,color:C.text,align:'center',valign:'middle',fontFace:'Meiryo' });

  slide.addShape(pptx.ShapeType.downArrow, { x:5.77,y:3.63,w:0.28,h:0.28, fill:{color:C.red} });

  slide.addShape(pptx.ShapeType.rect, { x:4.6,y:3.95,w:2.6,h:0.65, fill:{color:C.white}, line:{color:'AAAAAA',pt:0.8}, rectRadius:0.07 });
  slide.addText('🔐  Amazon Cognito\n（認証・ロール管理）', { x:4.6,y:3.95,w:2.6,h:0.65, fontSize:8.5,color:C.text,align:'center',valign:'middle',fontFace:'Meiryo' });

  slide.addShape(pptx.ShapeType.rightArrow, { x:7.22,y:4.2,w:0.45,h:0.28, fill:{color:C.red} });
  slide.addText('役職情報で\n自動ロール付与', { x:4.55,y:4.63,w:2.7,h:0.3, fontSize:7.5,color:C.red,align:'center',fontFace:'Meiryo',italic:true });

  // ─ データフロー補足 ──────────────────────────────
  slide.addShape(pptx.ShapeType.rect, { x:4.45,y:5.3,w:8.55,h:1.0, fill:{color:C.lightGy}, line:{color:'DDDDDD',pt:0.5}, rectRadius:0.08 });
  slide.addText('データフロー', { x:4.6,y:5.38,w:2.0,h:0.28, fontSize:9,bold:true,color:C.navy,fontFace:'Meiryo' });
  slide.addText(
    'ユーザー操作 → Amplify (Next.js) が画面を生成・API処理 → Prisma ORM 経由で RDS に読み書き\n' +
    'GitHubへのpushで自動ビルド＆デプロイ　｜　将来: Azure ADの役職情報でCognitoが自動ロール付与',
    { x:4.6,y:5.68,w:8.1,h:0.55, fontSize:9,color:C.gray,fontFace:'Meiryo',wrap:true }
  );
}

// ─── 保存 ────────────────────────────────────────────
const out = '/Users/yuka_m/HRManage/docs/業務フロー_アーキテクチャ図.pptx';
pptx.writeFile({ fileName: out }).then(() => {
  console.log('✅ 生成完了:', out);
}).catch(e => console.error('❌', e));
