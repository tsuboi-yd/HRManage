import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  console.log('🌱 シードデータを投入中...');

  // ── 組織 ──────────────────────────────────────────
  const h1 = await prisma.organization.upsert({
    where: { id: 'h1' },
    update: {},
    create: { id: 'h1', name: '開発本部（全体）', level: 'honbu', icon: 'business' },
  });
  const c1 = await prisma.organization.upsert({
    where: { id: 'c1' },
    update: {},
    create: { id: 'c1', name: '開発センター', level: 'center', parentId: 'h1', icon: 'corporate_fare' },
  });
  const c2 = await prisma.organization.upsert({
    where: { id: 'c2' },
    update: {},
    create: { id: 'c2', name: '品質センター', level: 'center', parentId: 'h1', icon: 'corporate_fare' },
  });
  const d1 = await prisma.organization.upsert({
    where: { id: 'd1' },
    update: {},
    create: { id: 'd1', name: '第一開発部', level: 'dept', parentId: 'c1', icon: 'group' },
  });
  const d2 = await prisma.organization.upsert({
    where: { id: 'd2' },
    update: {},
    create: { id: 'd2', name: '第二開発部', level: 'dept', parentId: 'c1', icon: 'group' },
  });
  const d3 = await prisma.organization.upsert({
    where: { id: 'd3' },
    update: {},
    create: { id: 'd3', name: '品質管理部', level: 'dept', parentId: 'c2', icon: 'group' },
  });
  const d4 = await prisma.organization.upsert({
    where: { id: 'd4' },
    update: {},
    create: { id: 'd4', name: '品質保証部', level: 'dept', parentId: 'c2', icon: 'group' },
  });
  console.log('✅ 組織');

  // ── 月次人員計画（30ヶ月: Oct 2025 → Mar 2028） ──
  const planData: Record<string, { plan: number[]; actual: (number | null)[] }> = {
    h1: { plan:[390,382,375,368,360,354,348,342,336,331,326,321,316,311,306,301,296,291,287,283,279,275,271,267,263,260,257,254,251,248], actual:[388,378,370,363,355,348,...Array(24).fill(null)] },
    c1: { plan:[102,100,99,98,97,97,96,95,94,93,92,91,90,89,88,87,86,85,84,83,82,81,80,79,78,77,76,75,74,73], actual:[101,99,98,97,96,98,...Array(24).fill(null)] },
    c2: { plan:[60,59,59,58,57,57,56,56,55,55,54,54,53,53,52,51,51,50,50,49,49,48,48,47,47,46,46,45,45,44], actual:[60,59,58,57,57,57,...Array(24).fill(null)] },
    d1: { plan:[54,53,52,52,52,52,51,51,50,50,49,49,48,48,47,47,46,46,45,44,44,43,43,42,42,41,41,40,40,39], actual:[54,52,52,51,51,52,...Array(24).fill(null)] },
    d2: { plan:[30,29,29,28,28,27,27,26,26,25,25,24,24,23,23,22,22,21,21,21,20,20,19,19,19,18,18,17,17,17], actual:[30,29,28,28,27,27,...Array(24).fill(null)] },
    d3: { plan:[37,36,36,35,35,34,34,33,33,32,32,31,31,30,30,29,29,28,28,27,27,27,26,26,25,25,25,24,24,23], actual:[37,36,35,35,34,34,...Array(24).fill(null)] },
    d4: { plan:[24,24,23,23,23,23,22,22,22,21,21,20,20,20,19,19,19,18,18,18,17,17,17,16,16,16,15,15,15,14], actual:[24,23,23,23,23,23,...Array(24).fill(null)] },
  };
  for (const [orgId, { plan, actual }] of Object.entries(planData)) {
    for (let i = 0; i < 30; i++) {
      await prisma.headcountPlan.upsert({
        where: { orgId_monthIdx: { orgId, monthIdx: i } },
        update: {},
        create: { orgId, monthIdx: i, planned: plan[i], actual: actual[i] ?? null },
      });
    }
  }
  console.log('✅ 月次人員計画（210件）');

  // ── 異動計画 ──────────────────────────────────────
  const transfers = [
    { id:'n1', orgId:'d1', empNo:'EMP-001', name:'佐藤 一郎',   type:'転出', dest:'→ 第二開発部',  date:'2026/07', diffKind:'計画のみ' },
    { id:'n2', orgId:'d1', empNo:'EMP-003', name:'高橋 健太',   type:'退職', dest:'自己都合',       date:'2026/09', diffKind:'計画のみ' },
    { id:'n3', orgId:'d1', empNo:'NEW-001', name:'（新規採用）', type:'採用', dest:'新卒配属予定',   date:'2026/04', diffKind:'計画のみ' },
    { id:'n4', orgId:'d2', empNo:'EMP-007', name:'田中 美咲',   type:'転入', dest:'← 品質管理部',   date:'2026/06', diffKind:'一致' },
    { id:'n5', orgId:'d1', empNo:'EMP-012', name:'鈴木 誠',     type:'転出', dest:'→ インフラ部',   date:'2026/05', diffKind:'実績のみ' },
    { id:'n6', orgId:'d2', empNo:'EMP-019', name:'中村 裕子',   type:'退職', dest:'定年退職',        date:'2026/07', diffKind:'一致' },
    { id:'n7', orgId:'d3', empNo:'EMP-021', name:'山本 哲也',   type:'転出', dest:'→ 開発センター', date:'2026/06', diffKind:'計画のみ' },
    { id:'n8', orgId:'d4', empNo:'EMP-024', name:'伊藤 千代',   type:'退職', dest:'定年退職',        date:'2026/08', diffKind:'一致' },
    { id:'n9', orgId:'d3', empNo:'NEW-002', name:'（新規採用）', type:'採用', dest:'中途配属予定',   date:'2026/07', diffKind:'計画のみ' },
  ];
  for (const t of transfers) {
    await prisma.transferPlan.upsert({
      where: { id: t.id },
      update: {},
      create: t,
    });
  }
  console.log('✅ 異動計画');

  // ── 定員予定（3年×4部署×3区分） ──────────────────
  // category: manager(管理職), staff(一般正社員), non_regular(非正規)
  const quotaData: { orgId: string; fiscalYear: number; category: string; q1: number; q2: number; q3: number; q4: number }[] = [
    // 第一開発部
    { orgId: 'd1', fiscalYear: 2026, category: 'manager',     q1: 8,  q2: 8,  q3: 8,  q4: 7  },
    { orgId: 'd1', fiscalYear: 2026, category: 'staff',       q1: 38, q2: 37, q3: 36, q4: 36 },
    { orgId: 'd1', fiscalYear: 2026, category: 'non_regular', q1: 6,  q2: 6,  q3: 6,  q4: 6  },
    { orgId: 'd1', fiscalYear: 2027, category: 'manager',     q1: 7,  q2: 7,  q3: 7,  q4: 7  },
    { orgId: 'd1', fiscalYear: 2027, category: 'staff',       q1: 35, q2: 34, q3: 33, q4: 32 },
    { orgId: 'd1', fiscalYear: 2027, category: 'non_regular', q1: 6,  q2: 6,  q3: 6,  q4: 6  },
    { orgId: 'd1', fiscalYear: 2028, category: 'manager',     q1: 7,  q2: 7,  q3: 6,  q4: 6  },
    { orgId: 'd1', fiscalYear: 2028, category: 'staff',       q1: 31, q2: 30, q3: 30, q4: 29 },
    { orgId: 'd1', fiscalYear: 2028, category: 'non_regular', q1: 6,  q2: 6,  q3: 6,  q4: 6  },
    // 第二開発部
    { orgId: 'd2', fiscalYear: 2026, category: 'manager',     q1: 5,  q2: 5,  q3: 4,  q4: 4  },
    { orgId: 'd2', fiscalYear: 2026, category: 'staff',       q1: 20, q2: 19, q3: 19, q4: 18 },
    { orgId: 'd2', fiscalYear: 2026, category: 'non_regular', q1: 3,  q2: 3,  q3: 3,  q4: 3  },
    { orgId: 'd2', fiscalYear: 2027, category: 'manager',     q1: 4,  q2: 4,  q3: 4,  q4: 4  },
    { orgId: 'd2', fiscalYear: 2027, category: 'staff',       q1: 17, q2: 16, q3: 15, q4: 14 },
    { orgId: 'd2', fiscalYear: 2027, category: 'non_regular', q1: 3,  q2: 3,  q3: 3,  q4: 3  },
    { orgId: 'd2', fiscalYear: 2028, category: 'manager',     q1: 4,  q2: 4,  q3: 4,  q4: 3  },
    { orgId: 'd2', fiscalYear: 2028, category: 'staff',       q1: 13, q2: 12, q3: 12, q4: 12 },
    { orgId: 'd2', fiscalYear: 2028, category: 'non_regular', q1: 3,  q2: 3,  q3: 3,  q4: 3  },
    // 品質管理部
    { orgId: 'd3', fiscalYear: 2026, category: 'manager',     q1: 5,  q2: 5,  q3: 5,  q4: 5  },
    { orgId: 'd3', fiscalYear: 2026, category: 'staff',       q1: 25, q2: 25, q3: 24, q4: 23 },
    { orgId: 'd3', fiscalYear: 2026, category: 'non_regular', q1: 4,  q2: 4,  q3: 4,  q4: 4  },
    { orgId: 'd3', fiscalYear: 2027, category: 'manager',     q1: 5,  q2: 5,  q3: 4,  q4: 4  },
    { orgId: 'd3', fiscalYear: 2027, category: 'staff',       q1: 22, q2: 21, q3: 21, q4: 20 },
    { orgId: 'd3', fiscalYear: 2027, category: 'non_regular', q1: 4,  q2: 4,  q3: 4,  q4: 4  },
    { orgId: 'd3', fiscalYear: 2028, category: 'manager',     q1: 4,  q2: 4,  q3: 4,  q4: 4  },
    { orgId: 'd3', fiscalYear: 2028, category: 'staff',       q1: 19, q2: 19, q3: 18, q4: 17 },
    { orgId: 'd3', fiscalYear: 2028, category: 'non_regular', q1: 4,  q2: 4,  q3: 4,  q4: 4  },
    // 品質保証部
    { orgId: 'd4', fiscalYear: 2026, category: 'manager',     q1: 4,  q2: 4,  q3: 4,  q4: 3  },
    { orgId: 'd4', fiscalYear: 2026, category: 'staff',       q1: 16, q2: 15, q3: 15, q4: 15 },
    { orgId: 'd4', fiscalYear: 2026, category: 'non_regular', q1: 3,  q2: 3,  q3: 3,  q4: 3  },
    { orgId: 'd4', fiscalYear: 2027, category: 'manager',     q1: 3,  q2: 3,  q3: 3,  q4: 3  },
    { orgId: 'd4', fiscalYear: 2027, category: 'staff',       q1: 15, q2: 14, q3: 14, q4: 13 },
    { orgId: 'd4', fiscalYear: 2027, category: 'non_regular', q1: 3,  q2: 3,  q3: 3,  q4: 3  },
    { orgId: 'd4', fiscalYear: 2028, category: 'manager',     q1: 3,  q2: 3,  q3: 3,  q4: 3  },
    { orgId: 'd4', fiscalYear: 2028, category: 'staff',       q1: 13, q2: 12, q3: 12, q4: 11 },
    { orgId: 'd4', fiscalYear: 2028, category: 'non_regular', q1: 3,  q2: 3,  q3: 3,  q4: 3  },
  ];
  for (const q of quotaData) {
    await prisma.headcountQuota.upsert({
      where: { orgId_fiscalYear_category: { orgId: q.orgId, fiscalYear: q.fiscalYear, category: q.category } },
      update: {},
      create: q,
    });
  }
  console.log('✅ 定員予定（36件）');

  // ── スナップショット ──────────────────────────────
  await prisma.snapshot.upsert({
    where: { id: 's1' },
    update: {},
    create: { id:'s1', label:'2026年3月1日時点',  date:'2026-03-01', comment:'3月初旬スナップショット' },
  });
  await prisma.snapshot.upsert({
    where: { id: 's2' },
    update: {},
    create: { id:'s2', label:'2026年2月1日時点',  date:'2026-02-01', comment:'2月初旬スナップショット' },
  });
  await prisma.snapshot.upsert({
    where: { id: 's3' },
    update: {},
    create: { id:'s3', label:'2026年1月6日時点',  date:'2026-01-06', comment:'年始スナップショット' },
  });
  console.log('✅ スナップショット');

  // ── メンバー（15件） ──────────────────────────────
  // 個人情報拡張: lastNameKana/firstNameKana/jobResponsibility/jobGrade/groupType/spec/birthDate/age/mandatoryRetirementDate/salaryRegion/isInactive/returnDate
  const members = [
    { id: 'm1',  empNo: 'EMP-001', name: '佐藤 一郎',   lastNameKana: 'サトウ',   firstNameKana: 'イチロウ',   orgId: 'd1', rank: '主任',   jobResponsibility: 'グループ長', jobGrade: 'A4', groupType: 'GR3',     spec: 'GR3以上',  birthDate: '1985-04-12', age: 40, mandatoryRetirementDate: '2050-04-12', salaryRegion: '東京', isInactive: false, returnDate: '', transferType: '転出（異動）', destDept: '第二開発部',  transferDate: '2026年7月', comment: 'スキル活用のため',         approvalStatus: '承認申請中', retirementDate: '2031年3月' },
    { id: 'm2',  empNo: 'EMP-002', name: '田中 花子',   lastNameKana: 'タナカ',   firstNameKana: 'ハナコ',     orgId: 'd1', rank: '一般',   jobResponsibility: '',           jobGrade: 'A2', groupType: 'GR1',     spec: 'GR1/2',    birthDate: '1995-08-20', age: 30, mandatoryRetirementDate: '2060-08-20', salaryRegion: '東京', isInactive: false, returnDate: '', transferType: '退職',         destDept: '—',           transferDate: '2026年6月', comment: '一身上の都合',             approvalStatus: '下書き保存', retirementDate: '' },
    { id: 'm3',  empNo: 'EMP-003', name: '高橋 達大',   lastNameKana: 'タカハシ', firstNameKana: 'タツヒロ',   orgId: 'd1', rank: '一般',   jobResponsibility: '',           jobGrade: 'A2', groupType: 'GR2',     spec: 'GR1/2',    birthDate: '1998-02-15', age: 27, mandatoryRetirementDate: '2063-02-15', salaryRegion: '東京', isInactive: false, returnDate: '', transferType: '',             destDept: '',            transferDate: '',          comment: '',                         approvalStatus: '',           retirementDate: '2038年3月' },
    { id: 'm4',  empNo: 'EMP-004', name: '山田 悠明',   lastNameKana: 'ヤマダ',   firstNameKana: 'ユウメイ',   orgId: 'd1', rank: '主任',   jobResponsibility: 'グループ長', jobGrade: 'A4', groupType: 'GR3',     spec: 'GR3以上',  birthDate: '1988-11-03', age: 37, mandatoryRetirementDate: '2053-11-03', salaryRegion: '東京', isInactive: false, returnDate: '', transferType: '',             destDept: '',            transferDate: '',          comment: '',                         approvalStatus: '',           retirementDate: '2029年3月' },
    { id: 'm5',  empNo: 'EMP-005', name: '中村 大樹',   lastNameKana: 'ナカムラ', firstNameKana: 'ダイキ',     orgId: 'd1', rank: '一般',   jobResponsibility: '',           jobGrade: 'A3', groupType: 'GR2',     spec: 'GR1/2',    birthDate: '1992-06-25', age: 33, mandatoryRetirementDate: '2057-06-25', salaryRegion: '神奈川', isInactive: false, returnDate: '', transferType: '',             destDept: '',            transferDate: '',          comment: '',                         approvalStatus: '',           retirementDate: '' },
    { id: 'm6',  empNo: 'EMP-006', name: '鈴木 健二',   lastNameKana: 'スズキ',   firstNameKana: 'ケンジ',     orgId: 'd1', rank: '主任',   jobResponsibility: 'グループ長', jobGrade: 'A5', groupType: 'GR3',     spec: 'GR3以上',  birthDate: '1980-09-08', age: 45, mandatoryRetirementDate: '2045-09-08', salaryRegion: '東京', isInactive: false, returnDate: '', transferType: '転出（異動）', destDept: '品質管理部',  transferDate: '2026年7月', comment: '品質部門強化のため',       approvalStatus: '下書き保存', retirementDate: '2027年3月' },
    { id: 'm7',  empNo: 'EMP-007', name: '伊藤 美咲',   lastNameKana: 'イトウ',   firstNameKana: 'ミサキ',     orgId: 'd1', rank: '一般',   jobResponsibility: '',           jobGrade: 'A2', groupType: 'GR1',     spec: 'GR1/2',    birthDate: '1996-12-01', age: 29, mandatoryRetirementDate: '2061-12-01', salaryRegion: '東京', isInactive: false, returnDate: '', transferType: '',             destDept: '',            transferDate: '',          comment: '',                         approvalStatus: '',           retirementDate: '' },
    { id: 'm8',  empNo: 'EMP-008', name: '渡辺 浩二',   lastNameKana: 'ワタナベ', firstNameKana: 'コウジ',     orgId: 'd1', rank: '課長',   jobResponsibility: '課長',       jobGrade: 'A6', groupType: '管理職',   spec: '60歳以上', birthDate: '1965-09-15', age: 60, mandatoryRetirementDate: '2026-09-15', salaryRegion: '東京', isInactive: false, returnDate: '', transferType: '退職',         destDept: '—',           transferDate: '2026年9月', comment: '定年退職',                 approvalStatus: '下書き保存', retirementDate: '2026年9月' },
    { id: 'm9',  empNo: 'EMP-009', name: '松本 真由美', lastNameKana: 'マツモト', firstNameKana: 'マユミ',     orgId: 'd1', rank: '一般',   jobResponsibility: '',           jobGrade: 'A2', groupType: 'GR1',     spec: 'GR1/2',    birthDate: '1993-03-30', age: 32, mandatoryRetirementDate: '2058-03-30', salaryRegion: '東京', isInactive: true,  returnDate: '2027年4月', transferType: '退職',         destDept: '—',           transferDate: '2026年8月', comment: '産休・退職',               approvalStatus: '承認申請中', retirementDate: '' },
    { id: 'm10', empNo: 'EMP-010', name: '小林 純',     lastNameKana: 'コバヤシ', firstNameKana: 'ジュン',     orgId: 'd1', rank: '一般',   jobResponsibility: '',           jobGrade: 'A3', groupType: 'GR2',     spec: 'GR1/2',    birthDate: '1990-07-18', age: 35, mandatoryRetirementDate: '2055-07-18', salaryRegion: '埼玉', isInactive: false, returnDate: '', transferType: '',             destDept: '',            transferDate: '',          comment: '',                         approvalStatus: '',           retirementDate: '2033年3月' },
    { id: 'm11', empNo: 'EMP-011', name: '加藤 裕',     lastNameKana: 'カトウ',   firstNameKana: 'ユタカ',     orgId: 'd1', rank: '主任',   jobResponsibility: 'グループ長', jobGrade: 'A4', groupType: 'GR3',     spec: 'GR3以上',  birthDate: '1986-01-22', age: 39, mandatoryRetirementDate: '2051-01-22', salaryRegion: '東京', isInactive: false, returnDate: '', transferType: '転出（異動）', destDept: 'インフラ部',  transferDate: '2026年9月', comment: '部門横断プロジェクト対応', approvalStatus: '差戻中',     retirementDate: '2028年3月' },
    { id: 'm12', empNo: 'EMP-012', name: '中島 由紀',   lastNameKana: 'ナカジマ', firstNameKana: 'ユキ',       orgId: 'd1', rank: '一般',   jobResponsibility: '',           jobGrade: 'A2', groupType: 'GR1',     spec: 'GR1/2',    birthDate: '1997-05-10', age: 28, mandatoryRetirementDate: '2062-05-10', salaryRegion: '東京', isInactive: false, returnDate: '', transferType: '',             destDept: '',            transferDate: '',          comment: '',                         approvalStatus: '',           retirementDate: '' },
    { id: 'm13', empNo: 'EMP-013', name: '前田 光',     lastNameKana: 'マエダ',   firstNameKana: 'ヒカル',     orgId: 'd1', rank: '一般',   jobResponsibility: '',           jobGrade: 'A2', groupType: 'GR1',     spec: 'GR1/2',    birthDate: '1999-10-05', age: 26, mandatoryRetirementDate: '2064-10-05', salaryRegion: '東京', isInactive: false, returnDate: '', transferType: '',             destDept: '',            transferDate: '',          comment: '',                         approvalStatus: '',           retirementDate: '' },
    { id: 'm14', empNo: 'EMP-014', name: '藤田 誠',     lastNameKana: 'フジタ',   firstNameKana: 'マコト',     orgId: 'd1', rank: '一般',   jobResponsibility: '',           jobGrade: 'A3', groupType: 'GR2',     spec: 'GR1/2',    birthDate: '1989-12-28', age: 36, mandatoryRetirementDate: '2054-12-28', salaryRegion: '東京', isInactive: false, returnDate: '', transferType: '',             destDept: '',            transferDate: '',          comment: '',                         approvalStatus: '',           retirementDate: '2030年3月' },
    { id: 'm15', empNo: 'EMP-015', name: '岡田 恵',     lastNameKana: 'オカダ',   firstNameKana: 'メグミ',     orgId: 'd1', rank: '副主任', jobResponsibility: '',           jobGrade: 'A3', groupType: 'GR3',     spec: 'GR3以上',  birthDate: '1987-08-14', age: 38, mandatoryRetirementDate: '2052-08-14', salaryRegion: '東京', isInactive: false, returnDate: '', transferType: '転出（異動）', destDept: '西日本地域部', transferDate: '2026年9月', comment: '地域強化施策',             approvalStatus: '下書き保存', retirementDate: '2032年3月' },
  ];
  for (const m of members) {
    await prisma.member.upsert({
      where: { id: m.id },
      update: {},
      create: m,
    });
  }
  console.log('✅ メンバー（15件・個人情報拡張）');

  // ── 採用計画（5件） ──────────────────────────────
  const hiringPlans = [
    { id: 'hp1', no: 'REC-001', position: 'ソフトウェアエンジニア', orgId: 'd1', type: '中途', count: 2, targetDate: '2026年6月', status: '承認申請中', note: 'バックエンド経験3年以上' },
    { id: 'hp2', no: 'REC-002', position: 'インフラエンジニア',     orgId: 'd2', type: '中途', count: 1, targetDate: '2026年7月', status: '下書き保存', note: 'クラウド経験必須' },
    { id: 'hp3', no: 'REC-003', position: '新卒エンジニア（26卒）', orgId: 'd1', type: '新卒', count: 3, targetDate: '2027年3月', status: '承認済み',   note: '情報系学部卒業予定' },
    { id: 'hp4', no: 'REC-004', position: '品質管理スタッフ',       orgId: 'd3', type: '中途', count: 1, targetDate: '2026年8月', status: '下書き保存', note: 'QA経験者優遇' },
    { id: 'hp5', no: 'REC-005', position: '業務委託エンジニア',     orgId: 'd1', type: '契約', count: 2, targetDate: '2026年5月', status: '承認申請中', note: '6ヶ月契約・更新あり' },
  ];
  for (const hp of hiringPlans) {
    await prisma.hiringPlan.upsert({
      where: { id: hp.id },
      update: {},
      create: hp,
    });
  }
  console.log('✅ 採用計画（5件）');

  // ── 転入計画（5件） ──────────────────────────────
  const transferInPlans = [
    { id: 'ti1', no: 'TIN-001', name: '田村 健一', sourceOrg: '東日本システム部', sourceType: '本部外', destOrgId: 'd1', targetDate: '2026年9月',  status: '承認申請中', comment: 'プロジェクトリード候補',  isInbound: false },
    { id: 'ti2', no: 'TIN-002', name: '',          sourceOrg: 'XX事業部',         sourceType: '本部外', destOrgId: 'd2', targetDate: '2026年11月', status: '下書き保存', comment: '人選調整中',           isInbound: false },
    { id: 'ti3', no: 'TIN-003', name: '鈴木 花子', sourceOrg: '品質管理部',       sourceType: '本部内', destOrgId: 'd1', targetDate: '2026年10月', status: '承認待ち',  comment: '品質管理の知見を活用', isInbound: true },
    { id: 'ti4', no: 'TIN-004', name: '山田 誠',   sourceOrg: 'インフラ部',       sourceType: '本部内', destOrgId: 'd2', targetDate: '2027年1月',  status: '承認待ち',  comment: 'インフラ兼務予定',    isInbound: true },
    { id: 'ti5', no: 'TIN-005', name: '佐々木 亮', sourceOrg: '地域管理部',       sourceType: '本部内', destOrgId: 'd1', targetDate: '2026年7月',  status: '承認済み',  comment: '異動確定',            isInbound: true },
  ];
  for (const ti of transferInPlans) {
    await prisma.transferInPlan.upsert({
      where: { id: ti.id },
      update: {},
      create: ti,
    });
  }
  console.log('✅ 転入計画（5件）');

  console.log('\n🎉 シード完了！');
}

main()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
