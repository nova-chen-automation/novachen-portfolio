/**
 * demo/lead_pipeline_demo.js — 给 vaultedceo 那类需求的"可跑证明"
 *
 * 场景（对应 n8n 社区 vaultedceo 的真实需求）：
 *   Tally 表单 → Airtable 线索池 → 2 个人工审批卡点 → 付款逾期自动暂停工作流
 *
 * 为什么做这个：
 *   投递信里我承诺"可以先给你看一个能跑的 demo 再决定"。
 *   这个脚本就是那个 demo —— 客户不用装 n8n 就能看懂流程逻辑。
 *
 * 用法：
 *   node demo/lead_pipeline_demo.js            # 跑全流程（含审批卡点 + 逾期暂停）
 *   DEMO_CMD=selftest node demo/lead_pipeline_demo.js   # 自检
 */
'use strict';

// ── 模拟 Airtable 表 ─────────────────────────────
// 字段：id / client / email / source / status / approved_1 / approved_2 / payment_status / days_overdue
function makeLead(o) {
  return {
    approved_1: false,
    approved_2: false,
    payment_status: 'paid',   // paid | unpaid
    days_overdue: 0,
    status: 'new',
    ...o,
  };
}

const LEADS = [
  makeLead({ id: 'L001', client: 'Neon Records', email: 'a@neon.example', source: 'tally' }),
  makeLead({ id: 'L002', client: 'Bassline Ltd', email: 'b@bass.example', source: 'tally', payment_status: 'unpaid', days_overdue: 21 }),
  makeLead({ id: 'L003', client: 'Mono Studio', email: 'c@mono.example', source: 'tally', approved_1: true, approved_2: true }),
];

// ── 规则（写死，可被审）─────────────────────────
const RULES = {
  OVERDUE_DAYS: 14,          // 逾期超过 14 天 → 暂停该客户工作流
  needApprovals: 2,          // 2 个人工审批卡点
};

// ── 核心逻辑 ────────────────────────────────────
function isPaused(lead) {
  return lead.payment_status === 'unpaid' && lead.days_overdue > RULES.OVERDUE_DAYS;
}

function approvalsDone(lead) {
  return lead.approved_1 && lead.approved_2;
}

/** 模拟 n8n 一次运行：对每个线索决定"能否推进" */
function runPipeline(leads) {
  return leads.map((l) => {
    if (isPaused(l)) {
      return { id: l.id, client: l.client, action: 'PAUSED', reason: `逾期 ${l.days_overdue} 天 > ${RULES.OVERDUE_DAYS}` };
    }
    if (!approvalsDone(l)) {
      const done = [l.approved_1, l.approved_2].filter(Boolean).length;
      return { id: l.id, client: l.client, action: 'WAITING_APPROVAL', reason: `审批 ${done}/${RULES.needApprovals}` };
    }
    return { id: l.id, client: l.client, action: 'FIRED', reason: '审批齐全且未逾期' };
  });
}

// ── 自检 ────────────────────────────────────────
function selftest() {
  let pass = 0, fail = 0;
  const t = (n, c) => { c ? (pass++, console.log(`PASS | ${n}`)) : (fail++, console.log(`FAIL | ${n}`)); };

  const byId = (r, id) => r.find((x) => x.id === id);

  const r = runPipeline(LEADS);
  t('审批齐全+已付款 → FIRED', byId(r, 'L003').action === 'FIRED');
  t('未审批 → WAITING_APPROVAL', byId(r, 'L001').action === 'WAITING_APPROVAL');
  t('逾期未付款 → PAUSED', byId(r, 'L002').action === 'PAUSED');
  t('逾期判据=天数>阈值', isPaused({ payment_status: 'unpaid', days_overdue: 15 }) === true);
  t('未逾期不暂停', isPaused({ payment_status: 'unpaid', days_overdue: 3 }) === false);
  t('已付款不暂停', isPaused({ payment_status: 'paid', days_overdue: 99 }) === false);
  t('单点审批不算通过', approvalsDone({ approved_1: true, approved_2: false }) === false);
  t('两点审批算通过', approvalsDone({ approved_1: true, approved_2: true }) === true);
  t('批量处理全部线索', r.length === LEADS.length);
  t('每条都有动作', r.every((x) => !!x.action));

  console.log(`\nLEAD PIPELINE SELFTEST: ${pass} passed, ${fail} failed`);
  return fail === 0;
}

// ── 入口 ────────────────────────────────────────
const ARGV = Array.isArray(process.argv) ? process.argv : [];
const CMD = process.env.DEMO_CMD || ARGV[2] || 'run';

if (CMD === 'selftest') {
  process.exit(selftest() ? 0 : 1);
}

const results = runPipeline(LEADS);
console.log('=== n8n 工作流运行结果（Tally → Airtable → 审批 → 付款校验）===');
for (const x of results) console.log(`[${x.action.padEnd(16)}] ${x.id} ${x.client.padEnd(14)} — ${x.reason}`);
console.log('\n（现实中这三步分别对应 n8n 的 Airtable 节点 / Wait 节点 / IF 节点）');
