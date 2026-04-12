const PptxGenJS = require('/Users/yuka_m/.nvm/versions/node/v24.13.1/lib/node_modules/pptxgenjs');
const pptx = new PptxGenJS();

pptx.layout = 'LAYOUT_WIDE';

const C = {
  navy:    '1A237E',
  blue:    '1976D2',
  lightBl: 'E3F2FD',
  orange:  'E65100',
  lightOr: 'FBE9E7',
  green:   '2E7D32',
  lightGr: 'E8F5E9',
  gray:    '546E7A',
  lightGy: 'F5F7FA',
  white:   'FFFFFF',
  text:    '263238',
};

// ─── ヘルパー ────────────────────────────────────────
function addSlide(title, subtitle) {
  const slide = pptx.addSlide();
  // 上部帯
  slide.addShape(pptx.ShapeType.rect, { x:0, y:0, w:'100%', h:1.1, fill:{color:C.navy} });
  slide.addText(title, { x:0.4, y:0.1, w:10, h:0.7, fontSize:24, bold:true, color:C.white, fontFace:'Meiryo' });
  if (subtitle) slide.addText(subtitle, { x:0.4, y:0.75, w:10, h:0.35, fontSize:11, color:'BBDEFB', fontFace:'Meiryo' });
  // 下部ライン
  slide.addShape(pptx.ShapeType.rect, { x:0, y:6.8, w:'100%', h:0.2, fill:{color:C.blue} });
  slide.addText('人員計画管理システム　業務フロー', { x:0.4, y:6.85, w:8, h:0.15, fontSize:8, color:C.white, fontFace:'Meiryo' });
  return slide;
}

function box(slide, x, y, w, h, fill, text, opts={}) {
  slide.addShape(pptx.ShapeType.rect, { x, y, w, h, fill:{color:fill}, line:{color:'CCCCCC',pt:0.5}, rectRadius:0.05 });
  if (text) slide.addText(text, { x, y, w, h, fontSize: opts.fontSize||11, bold:opts.bold||false,
    color: opts.color||C.text, align: opts.align||'center', valign:'middle', fontFace:'Meiryo', wrap:true });
}

function arrow(slide, x, y, w, dir='right') {
  const shapes = { right:'rightArrow', down:'downArrow' };
  slide.addShape(pptx.ShapeType[shapes[dir]||'rightArrow'],
    { x, y, w, h: dir==='down'?w:0.35, fill:{color:C.blue}, line:{color:C.blue} });
}

// ─── スライド1：表紙 ────────────────────────────────
{
  const slide = pptx.addSlide();
  slide.addShape(pptx.ShapeType.rect, { x:0, y:0, w:'100%', h:'100%', fill:{color:C.navy} });
  slide.addShape(pptx.ShapeType.rect, { x:0, y:2.8, w:'100%', h:2.0, fill:{color:C.blue} });
  slide.addShape(pptx.ShapeType.rect, { x:0, y:6.8, w:'100%', h:0.2, fill:{color:C.orange} });

  slide.addText('人員計画管理システム', { x:1, y:1.0, w:11, h:0.9, fontSize:36, bold:true, color:C.white, align:'center', fontFace:'Meiryo' });
  slide.addText('業務フロー・活用ガイド', { x:1, y:2.0, w:11, h:0.6, fontSize:22, color:'BBDEFB', align:'center', fontFace:'Meiryo' });
  slide.addText('人事部門向け提案資料', { x:1, y:3.0, w:11, h:0.5, fontSize:16, bold:true, color:C.white, align:'center', fontFace:'Meiryo' });
  slide.addText('〜 計画・実績・予測を一元管理し、意思決定を加速する 〜', { x:1, y:3.55, w:11, h:0.4, fontSize:12, color:'BBDEFB', align:'center', fontFace:'Meiryo' });
  slide.addText('2026年3月', { x:1, y:5.8, w:11, h:0.4, fontSize:13, color:'90CAF9', align:'center', fontFace:'Meiryo' });
}

// ─── スライド2：システム概要 ─────────────────────────
{
  const slide = addSlide('システム概要', '何ができるのか？');

  const cards = [
    { x:0.4,  icon:'📋', title:'計画管理',    desc:'組織別の月次人員計画を\n登録・管理', color:C.lightBl },
    { x:3.1,  icon:'🔄', title:'異動計画',    desc:'異動予定を登録し\n自動で計画に反映',  color:C.lightGr },
    { x:5.8,  icon:'📸', title:'スナップショット', desc:'任意時点の計画を\n保存・比較',      color:C.lightOr },
    { x:8.5,  icon:'📊', title:'分析',        desc:'計画vs実績の差分を\nグラフで可視化',  color:'F3E5F5' },
    { x:11.2, icon:'👥', title:'将来人数登録', desc:'半期ごとの将来予測を\n登録',          color:'FFF9C4' },
  ];

  cards.forEach(c => {
    box(slide, c.x, 1.4, 2.4, 4.8, c.color, '', {});
    slide.addText(c.icon, { x:c.x, y:1.6, w:2.4, h:0.7, fontSize:28, align:'center', fontFace:'Meiryo' });
    slide.addText(c.title, { x:c.x, y:2.4, w:2.4, h:0.5, fontSize:13, bold:true, color:C.navy, align:'center', fontFace:'Meiryo' });
    slide.addShape(pptx.ShapeType.rect, { x:c.x+0.6, y:3.0, w:1.2, h:0.04, fill:{color:C.blue} });
    slide.addText(c.desc, { x:c.x+0.1, y:3.1, w:2.2, h:1.2, fontSize:10.5, color:C.text, align:'center', valign:'top', fontFace:'Meiryo', wrap:true });
  });

  slide.addText('これら5つの機能が連携し、人員計画の「計画・実行・振り返り」サイクルを支援します', {
    x:0.4, y:6.35, w:12.8, h:0.35, fontSize:11, color:C.gray, align:'center', fontFace:'Meiryo', italic:true
  });
}

// ─── スライド3：ロール別権限 ─────────────────────────
{
  const slide = addSlide('ロール別アクセス権限', '役割に応じた画面制御で情報セキュリティを確保');

  const roles = [
    { name:'人事',      color:C.blue,   bg:C.lightBl, screens:['メンバー管理','計画一覧','異動計画','分析'] },
    { name:'センター長', color:C.green,  bg:C.lightGr, screens:['メンバー確認','自組織計画','分析'] },
    { name:'企画',      color:C.orange, bg:C.lightOr, screens:['分析'] },
  ];

  const allScreens = ['メンバー管理','計画一覧','異動計画','メンバー確認','自組織計画','分析'];
  const xs = [2.2, 3.7, 5.2, 6.7, 8.2, 9.7];

  // ヘッダー行
  slide.addText('画面', { x:0.4, y:1.5, w:1.6, h:0.5, fontSize:10, bold:true, color:C.white,
    align:'center', valign:'middle', fontFace:'Meiryo' });
  slide.addShape(pptx.ShapeType.rect, { x:0.4, y:1.5, w:1.6, h:0.5, fill:{color:C.navy} });
  slide.addText('画面', { x:0.4, y:1.5, w:1.6, h:0.5, fontSize:10, bold:true, color:C.white, align:'center', valign:'middle', fontFace:'Meiryo' });

  allScreens.forEach((s, i) => {
    slide.addShape(pptx.ShapeType.rect, { x:xs[i], y:1.5, w:1.3, h:0.5, fill:{color:C.navy} });
    slide.addText(s, { x:xs[i], y:1.5, w:1.3, h:0.5, fontSize:9, bold:true, color:C.white, align:'center', valign:'middle', fontFace:'Meiryo', wrap:true });
  });

  // ロール行
  roles.forEach((r, ri) => {
    const y = 2.2 + ri * 0.9;
    slide.addShape(pptx.ShapeType.rect, { x:0.4, y, w:1.6, h:0.75, fill:{color:r.bg}, line:{color:'CCCCCC',pt:0.5} });
    slide.addText(r.name, { x:0.4, y, w:1.6, h:0.75, fontSize:12, bold:true, color:r.color, align:'center', valign:'middle', fontFace:'Meiryo' });

    allScreens.forEach((s, si) => {
      const has = r.screens.includes(s);
      slide.addShape(pptx.ShapeType.rect, { x:xs[si], y, w:1.3, h:0.75, fill:{color: has ? r.bg : 'F5F5F5'}, line:{color:'CCCCCC',pt:0.5} });
      slide.addText(has ? '✓' : '−', { x:xs[si], y, w:1.3, h:0.75, fontSize:16, color: has ? r.color : 'CCCCCC', align:'center', valign:'middle', fontFace:'Meiryo' });
    });
  });

  slide.addText('※ 将来は Azure AD 連携により、役職情報から自動でロール付与予定', {
    x:0.4, y:5.5, w:12, h:0.35, fontSize:10, color:C.gray, fontFace:'Meiryo', italic:true
  });
}

// ─── スライド4：月次業務フロー ───────────────────────
{
  const slide = addSlide('月次業務フロー', '毎月の標準的な運用サイクル');

  const steps = [
    { no:'①', title:'異動計画\n登録',    who:'人事',      color:C.lightBl, bcolor:C.blue },
    { no:'②', title:'計画への\n自動反映', who:'（自動）',   color:C.lightGr, bcolor:C.green },
    { no:'③', title:'計画内容\n確認',    who:'センター長', color:C.lightGr, bcolor:C.green },
    { no:'④', title:'スナップ\nショット保存', who:'人事',  color:C.lightOr, bcolor:C.orange },
    { no:'⑤', title:'差分\n分析',       who:'人事・企画・センター長', color:'F3E5F5', bcolor:'7B1FA2' },
  ];

  const bw = 2.0, bh = 2.4, startX = 0.4, y = 2.0;
  steps.forEach((s, i) => {
    const x = startX + i * (bw + 0.56);
    // ステップ番号
    slide.addShape(pptx.ShapeType.ellipse, { x: x+0.7, y:1.55, w:0.6, h:0.6, fill:{color:s.bcolor} });
    slide.addText(s.no, { x: x+0.7, y:1.55, w:0.6, h:0.6, fontSize:11, bold:true, color:C.white, align:'center', valign:'middle', fontFace:'Meiryo' });
    // ボックス
    slide.addShape(pptx.ShapeType.rect, { x, y, w:bw, h:bh, fill:{color:s.color}, line:{color:s.bcolor, pt:1.5}, rectRadius:0.1 });
    slide.addText(s.title, { x, y:y+0.2, w:bw, h:0.8, fontSize:13, bold:true, color:C.navy, align:'center', fontFace:'Meiryo', wrap:true });
    slide.addShape(pptx.ShapeType.rect, { x:x+0.4, y:y+1.05, w:1.2, h:0.04, fill:{color:s.bcolor} });
    slide.addText('担当: '+s.who, { x, y:y+1.15, w:bw, h:0.5, fontSize:9, color:C.gray, align:'center', fontFace:'Meiryo', wrap:true });
    // 矢印
    if (i < steps.length - 1) {
      slide.addShape(pptx.ShapeType.rightArrow, { x: x+bw+0.05, y: y+0.9, w:0.5, h:0.5, fill:{color:C.blue} });
    }
  });

  // 月次サイクル説明
  slide.addShape(pptx.ShapeType.rect, { x:0.4, y:4.65, w:12.8, h:1.0, fill:{color:C.lightBl}, line:{color:C.blue,pt:0.5}, rectRadius:0.05 });
  slide.addText('月次サイクルのポイント', { x:0.6, y:4.72, w:3, h:0.3, fontSize:10, bold:true, color:C.blue, fontFace:'Meiryo' });
  slide.addText(
    '・異動計画を登録すると該当月の計画人数に自動反映されるため、手動修正不要\n' +
    '・月末にスナップショットを保存することで「その時点の計画」を履歴として残せる\n' +
    '・分析画面で実績との差分をいつでも確認可能（全ロール共通）',
    { x:0.6, y:5.0, w:12.4, h:0.6, fontSize:9.5, color:C.text, fontFace:'Meiryo', wrap:true }
  );
}

// ─── スライド5：スナップショット機能 ────────────────
{
  const slide = addSlide('スナップショット機能', '「いつ時点の計画か」を記録・比較');

  // 左：説明
  slide.addText('スナップショットとは？', { x:0.4, y:1.3, w:5.5, h:0.4, fontSize:14, bold:true, color:C.navy, fontFace:'Meiryo' });
  const points = [
    '任意のタイミングで計画データを「保存」する機能',
    '名前・日付・コメントを付けて管理',
    '月初・月末・経営会議前など節目で保存することを推奨',
    '保存後は分析画面で「どのスナップショットと比べるか」を選択可能',
  ];
  points.forEach((p, i) => {
    slide.addShape(pptx.ShapeType.ellipse, { x:0.4, y:1.85+i*0.65, w:0.25, h:0.25, fill:{color:C.blue} });
    slide.addText(p, { x:0.75, y:1.82+i*0.65, w:5.2, h:0.3, fontSize:10.5, color:C.text, fontFace:'Meiryo' });
  });

  // 右：タイムライン図
  slide.addShape(pptx.ShapeType.rect, { x:6.3, y:1.2, w:7.0, h:5.2, fill:{color:C.lightGy}, line:{color:'DDDDDD',pt:0.5}, rectRadius:0.1 });
  slide.addText('スナップショット活用イメージ', { x:6.5, y:1.3, w:6.5, h:0.4, fontSize:11, bold:true, color:C.navy, align:'center', fontFace:'Meiryo' });

  // タイムライン横線
  slide.addShape(pptx.ShapeType.rect, { x:6.8, y:3.0, w:6.1, h:0.06, fill:{color:C.blue} });

  const snaps = [
    { x:7.0,  label:'4月初\nスナップ',  color:C.green },
    { x:9.0,  label:'4月末\nスナップ',  color:C.orange },
    { x:11.0, label:'5月初\nスナップ',  color:C.blue },
    { x:12.5, label:'現在',            color:'9C27B0' },
  ];
  snaps.forEach(s => {
    slide.addShape(pptx.ShapeType.ellipse, { x:s.x-0.15, y:2.87, w:0.35, h:0.35, fill:{color:s.color} });
    slide.addText(s.label, { x:s.x-0.6, y:3.3, w:1.3, h:0.55, fontSize:8.5, color:s.color, align:'center', fontFace:'Meiryo', wrap:true, bold:true });
  });

  // 比較矢印
  slide.addShape(pptx.ShapeType.rect, { x:7.0, y:2.1, w:4.15, h:0.06, fill:{color:'CCCCCC'} });
  slide.addShape(pptx.ShapeType.rightArrow, { x:11.0, y:1.95, w:0.4, h:0.35, fill:{color:C.orange} });
  slide.addText('比較可能', { x:7.6, y:1.85, w:2.8, h:0.3, fontSize:9, color:C.orange, align:'center', fontFace:'Meiryo', italic:true });

  slide.addShape(pptx.ShapeType.rect, { x:6.8, y:4.0, w:6.1, h:1.8, fill:{color:C.lightBl}, line:{color:C.blue,pt:0.5}, rectRadius:0.05 });
  slide.addText('活用シーン', { x:7.0, y:4.1, w:5.5, h:0.3, fontSize:10, bold:true, color:C.blue, fontFace:'Meiryo' });
  slide.addText(
    '・経営会議前後の計画変化を記録\n' +
    '・年度計画と修正計画の差分確認\n' +
    '・異動発令前後の人数変化を追跡',
    { x:7.0, y:4.45, w:5.8, h:1.2, fontSize:9.5, color:C.text, fontFace:'Meiryo', wrap:true }
  );
}

// ─── スライド6：分析画面 ────────────────────────────
{
  const slide = addSlide('分析画面の活用', 'グラフで計画・実績・将来予測を一覧');

  // 凡例
  const legends = [
    { color:'1976D2', label:'実績人数（確定値）' },
    { color:'F57C00', label:'計画予測（異動計画ベース）' },
    { color:'1976D2', label:'将来人数（半期予測）', dash:true },
    { color:'FF6F00', label:'比較マーカー' },
  ];
  legends.forEach((l, i) => {
    const x = 0.4 + i * 3.3;
    slide.addShape(pptx.ShapeType.rect, { x, y:1.35, w:0.5, h:0.15, fill:{color:l.color},
      line: l.dash ? {color:l.color, pt:1, dashType:'dash'} : {color:l.color,pt:0} });
    slide.addText(l.label, { x:x+0.6, y:1.28, w:2.6, h:0.3, fontSize:9, color:C.text, fontFace:'Meiryo' });
  });

  // グラフエリア（疑似）
  slide.addShape(pptx.ShapeType.rect, { x:0.4, y:1.7, w:8.5, h:4.0, fill:{color:C.white}, line:{color:'DDDDDD',pt:1} });

  // Y軸
  [200,175,150,125,100].forEach((v,i) => {
    const y = 5.3 - i*0.8;
    slide.addShape(pptx.ShapeType.rect, { x:1.0, y, w:7.8, h:0.01, fill:{color:'EEEEEE'} });
    slide.addText(String(v), { x:0.4, y:y-0.15, w:0.55, h:0.3, fontSize:8, color:C.gray, align:'right', fontFace:'Meiryo' });
  });
  // X軸ラベル
  const months = ['1月','2月','3月','4月','5月','6月','7月','8月'];
  months.forEach((m,i) => {
    slide.addText(m, { x:1.05+i*0.97, y:5.35, w:0.8, h:0.25, fontSize:8, color:C.gray, align:'center', fontFace:'Meiryo' });
  });

  // 実績ライン（折れ線疑似）
  const actPoints = [{x:1.2,y:5.1},{x:2.2,y:5.0},{x:3.2,y:4.85},{x:4.2,y:4.7},{x:5.2,y:4.55}];
  for(let i=0;i<actPoints.length-1;i++){
    const p=actPoints[i], n=actPoints[i+1];
    slide.addShape(pptx.ShapeType.rect, {x:p.x, y:Math.min(p.y,n.y), w:n.x-p.x, h:Math.abs(n.y-p.y)+0.04, fill:{color:'1976D2'}});
    slide.addShape(pptx.ShapeType.ellipse, {x:p.x-0.08, y:p.y-0.08, w:0.18, h:0.18, fill:{color:'1976D2'}});
  }
  // 計画ライン（破線疑似）
  const planPoints = [{x:5.2,y:4.55},{x:6.2,y:4.3},{x:7.2,y:4.1},{x:8.2,y:3.95}];
  planPoints.forEach(p => {
    slide.addShape(pptx.ShapeType.rect, {x:p.x-0.05, y:p.y-0.05, w:0.9, h:0.06, fill:{color:'F57C00'}});
    slide.addShape(pptx.ShapeType.ellipse, {x:p.x-0.08, y:p.y-0.08, w:0.18, h:0.18, fill:{color:'F57C00'}});
  });
  // スライダー縦線
  slide.addShape(pptx.ShapeType.rect, {x:7.2, y:1.8, w:0.04, h:3.5, fill:{color:'FF6F00'}});
  slide.addShape(pptx.ShapeType.ellipse, {x:7.1, y:4.05, w:0.25, h:0.25, fill:{color:'FF6F00'}});
  slide.addText('▼スライダー', {x:7.0, y:1.7, w:1.2, h:0.25, fontSize:8, color:'FF6F00', fontFace:'Meiryo'});

  // 差分バッジ
  slide.addShape(pptx.ShapeType.rect, {x:7.5, y:3.5, w:1.2, h:0.55, fill:{color:C.lightOr}, line:{color:C.orange,pt:0.8}, rectRadius:0.05});
  slide.addText('差分\n−12人', {x:7.5, y:3.5, w:1.2, h:0.55, fontSize:9, bold:true, color:C.orange, align:'center', valign:'middle', fontFace:'Meiryo'});

  // 右：読み方説明
  slide.addShape(pptx.ShapeType.rect, {x:9.1, y:1.7, w:4.2, h:4.0, fill:{color:C.lightGy}, line:{color:'DDDDDD',pt:0.5}, rectRadius:0.1});
  slide.addText('グラフの見方', {x:9.3, y:1.85, w:3.8, h:0.35, fontSize:12, bold:true, color:C.navy, fontFace:'Meiryo'});

  const howtos = [
    { icon:'🔵', text:'実線：確定した実績人数の推移' },
    { icon:'🟠', text:'破線：異動計画ベースの予測' },
    { icon:'🔷', text:'菱形マーカー：将来人数（半期予測）' },
    { icon:'🟡', text:'スライダー：見たい月に合わせて差分を確認' },
    { icon:'📍', text:'オレンジマーカー：比較対象月を固定表示' },
  ];
  howtos.forEach((h, i) => {
    slide.addText(h.icon, { x:9.3, y:2.35+i*0.6, w:0.4, h:0.4, fontSize:12, fontFace:'Meiryo' });
    slide.addText(h.text, { x:9.75, y:2.38+i*0.6, w:3.4, h:0.4, fontSize:9.5, color:C.text, fontFace:'Meiryo', wrap:true });
  });
}

// ─── スライド7：将来人数登録 ────────────────────────
{
  const slide = addSlide('将来人数の登録', '半期ごとの人数予測をシステムに登録');

  slide.addShape(pptx.ShapeType.rect, {x:0.4, y:1.3, w:5.8, h:5.3, fill:{color:C.lightBl}, line:{color:C.blue,pt:0.5}, rectRadius:0.1});
  slide.addText('登録フロー', {x:0.6, y:1.4, w:5.3, h:0.4, fontSize:13, bold:true, color:C.navy, fontFace:'Meiryo'});

  const flows = [
    { step:'Step 1', desc:'半期計画で組織別の\n将来人数を策定', color:C.blue },
    { step:'Step 2', desc:'システムに組織・月・\n人数を登録', color:C.green },
    { step:'Step 3', desc:'分析画面に青色の\n菱形マーカーで表示', color:C.blue },
    { step:'Step 4', desc:'計画との差分を\n自動計算・比較', color:C.orange },
  ];
  flows.forEach((f, i) => {
    const y = 2.0 + i * 1.1;
    slide.addShape(pptx.ShapeType.rect, {x:0.6, y, w:1.0, h:0.7, fill:{color:f.color}, rectRadius:0.05});
    slide.addText(f.step, {x:0.6, y, w:1.0, h:0.7, fontSize:9, bold:true, color:C.white, align:'center', valign:'middle', fontFace:'Meiryo'});
    slide.addText(f.desc, {x:1.75, y:y+0.05, w:4.0, h:0.6, fontSize:10, color:C.text, fontFace:'Meiryo', wrap:true});
    if(i<flows.length-1) slide.addShape(pptx.ShapeType.downArrow, {x:0.9, y:y+0.7, w:0.4, h:0.3, fill:{color:f.color}});
  });

  slide.addShape(pptx.ShapeType.rect, {x:6.5, y:1.3, w:6.8, h:5.3, fill:{color:C.lightGy}, line:{color:'DDDDDD',pt:0.5}, rectRadius:0.1});
  slide.addText('登録データのイメージ', {x:6.7, y:1.4, w:6.3, h:0.4, fontSize:13, bold:true, color:C.navy, fontFace:'Meiryo'});

  // テーブル
  const headers = ['組織', '対象月', '将来人数', '登録者'];
  const rows = [
    ['第1センター', '2026/10', '85人', '人事部'],
    ['第2センター', '2026/10', '92人', '人事部'],
    ['第1センター', '2027/4',  '90人', '人事部'],
    ['第2センター', '2027/4',  '88人', '人事部'],
  ];
  const colW = [2.0, 1.6, 1.6, 1.3];
  const colX = [6.7, 8.7, 10.3, 11.9];

  headers.forEach((h, i) => {
    slide.addShape(pptx.ShapeType.rect, {x:colX[i], y:2.0, w:colW[i], h:0.45, fill:{color:C.navy}});
    slide.addText(h, {x:colX[i], y:2.0, w:colW[i], h:0.45, fontSize:10, bold:true, color:C.white, align:'center', valign:'middle', fontFace:'Meiryo'});
  });
  rows.forEach((row, ri) => {
    row.forEach((cell, ci) => {
      const bg = ri%2===0 ? C.white : C.lightBl;
      slide.addShape(pptx.ShapeType.rect, {x:colX[ci], y:2.55+ri*0.5, w:colW[ci], h:0.5, fill:{color:bg}, line:{color:'DDDDDD',pt:0.3}});
      slide.addText(cell, {x:colX[ci], y:2.55+ri*0.5, w:colW[ci], h:0.5, fontSize:9.5, color:C.text, align:'center', valign:'middle', fontFace:'Meiryo'});
    });
  });

  slide.addText('※ 半期に一度（10月・4月）の登録を推奨', {
    x:6.7, y:5.0, w:6.3, h:0.35, fontSize:9.5, color:C.gray, fontFace:'Meiryo', italic:true
  });
}

// ─── スライド8：期待効果・まとめ ────────────────────
{
  const slide = addSlide('期待される効果', '導入によるメリット');

  const effects = [
    { icon:'⏱', title:'作業時間の削減',    desc:'Excelでの手動集計・突合が不要に\n月次作業を大幅に効率化',        color:C.lightBl, bcolor:C.blue },
    { icon:'📉', title:'計画精度の向上',    desc:'実績との差分をリアルタイムで把握\n早期に計画修正が可能',          color:C.lightGr, bcolor:C.green },
    { icon:'🔒', title:'情報管理の強化',    desc:'ロールベース制御で権限外の\n情報へのアクセスを遮断',           color:C.lightOr, bcolor:C.orange },
    { icon:'📊', title:'意思決定の加速',    desc:'グラフによる直感的な可視化で\n会議での説明時間を短縮',          color:'F3E5F5',  bcolor:'7B1FA2' },
    { icon:'🔄', title:'履歴管理',         desc:'スナップショットで過去の計画を\nいつでも参照・比較可能',         color:'FFF9C4',  bcolor:'F57F17' },
    { icon:'☁️', title:'クラウド運用',      desc:'AWSで24時間稼働・自動バックアップ\nどこからでもアクセス可能',    color:C.lightBl, bcolor:C.blue },
  ];

  effects.forEach((e, i) => {
    const col = i % 3, row = Math.floor(i / 3);
    const x = 0.4 + col * 4.4, y = 1.4 + row * 2.3;
    slide.addShape(pptx.ShapeType.rect, {x, y, w:4.1, h:2.0, fill:{color:e.color}, line:{color:e.bcolor, pt:1}, rectRadius:0.1});
    slide.addText(e.icon, {x, y:y+0.15, w:4.1, h:0.55, fontSize:22, align:'center', fontFace:'Meiryo'});
    slide.addText(e.title, {x, y:y+0.7, w:4.1, h:0.4, fontSize:12, bold:true, color:C.navy, align:'center', fontFace:'Meiryo'});
    slide.addText(e.desc, {x:x+0.15, y:y+1.1, w:3.8, h:0.75, fontSize:9.5, color:C.text, align:'center', fontFace:'Meiryo', wrap:true});
  });
}

// ─── スライド9：今後のロードマップ ──────────────────
{
  const slide = addSlide('今後のロードマップ', 'POC完了から本番運用へ');

  const phases = [
    {
      phase:'Phase 1\nPOC完了',
      period:'2026年3月',
      status:'完了',
      scolor:C.green,
      items:['AWS Amplify + RDS構築', 'Next.js SSRデプロイ', 'Prisma ORM・API実装', '基本機能の動作確認'],
      color: C.lightGr, bcolor: C.green,
    },
    {
      phase:'Phase 2\n機能拡充',
      period:'2026年4〜6月',
      status:'予定',
      scolor:C.blue,
      items:['画面データのAPI化', 'Azure AD認証連携', 'ロール自動付与', 'メンバー管理機能'],
      color: C.lightBl, bcolor: C.blue,
    },
    {
      phase:'Phase 3\n本番運用',
      period:'2026年7月〜',
      status:'予定',
      scolor:C.orange,
      items:['全部門への展開', '権限・テナント設計', '監査ログ対応', '運用マニュアル整備'],
      color: C.lightOr, bcolor: C.orange,
    },
  ];

  phases.forEach((p, i) => {
    const x = 0.4 + i * 4.4;
    // ヘッダー
    slide.addShape(pptx.ShapeType.rect, {x, y:1.3, w:4.1, h:1.0, fill:{color:p.bcolor}, rectRadius:0.1});
    slide.addText(p.phase, {x, y:1.3, w:4.1, h:0.65, fontSize:13, bold:true, color:C.white, align:'center', valign:'middle', fontFace:'Meiryo', wrap:true});
    slide.addText(p.period, {x, y:1.9, w:4.1, h:0.35, fontSize:9.5, color:'BBDEFB', align:'center', fontFace:'Meiryo'});
    // ステータスバッジ
    slide.addShape(pptx.ShapeType.rect, {x:x+1.35, y:1.4, w:1.4, h:0.3, fill:{color:C.white}, rectRadius:0.05});
    slide.addText(p.status, {x:x+1.35, y:1.4, w:1.4, h:0.3, fontSize:9, bold:true, color:p.scolor, align:'center', valign:'middle', fontFace:'Meiryo'});
    // 内容
    slide.addShape(pptx.ShapeType.rect, {x, y:2.4, w:4.1, h:3.8, fill:{color:p.color}, line:{color:p.bcolor,pt:0.5}, rectRadius:0.05});
    p.items.forEach((item, j) => {
      slide.addShape(pptx.ShapeType.ellipse, {x:x+0.25, y:2.65+j*0.75, w:0.2, h:0.2, fill:{color:p.bcolor}});
      slide.addText(item, {x:x+0.55, y:2.6+j*0.75, w:3.4, h:0.4, fontSize:10.5, color:C.text, fontFace:'Meiryo'});
    });
    // 矢印
    if(i < phases.length-1) slide.addShape(pptx.ShapeType.rightArrow, {x:x+4.15, y:2.75, w:0.35, h:0.5, fill:{color:C.gray}});
  });
}

// ─── 保存 ───────────────────────────────────────────
const outPath = '/Users/yuka_m/HRManage/docs/人員計画管理システム_業務フロー.pptx';
pptx.writeFile({ fileName: outPath }).then(() => {
  console.log('✅ 生成完了:', outPath);
}).catch(err => {
  console.error('❌ エラー:', err);
});
