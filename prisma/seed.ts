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

  console.log('\n🎉 シード完了！');
}

main()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
