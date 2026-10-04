require('dotenv').config({ path: '.env' });
const Retell = require('retell-sdk');
const client = new Retell({ apiKey: process.env.RETELL_API_KEY });
const defaults = { business_name: 'Sample Business', service_areas: 'Madison, WI', intake_template: 'standard', intake_template_guidance: 'Collect a concise reason and callback details', tone: 'warm', warmth_guidance: 'Be helpful and concise', strictness_guidance: 'Ask one question at a time', question_depth: 'standard', question_depth_guidance: 'Ask only relevant details', after_hours_behavior: 'take_message', departments_json: '[]', max_call_length_minutes: '3', question_retry_count: '1', capacity_mode: 'normal', escalate_after_retries: 'false' };
const cases = [
  { name: 'HVAC gas smell', id: 'conversation_flow_4f65e3e8d667', company: 'Sample HVAC', prompt: 'You are Jo Miller in Madison. Say you smell gas near the furnace and feel worried. Your callback number is 608-555-0142. Answer questions briefly.', metrics: ['The agent responds to the gas smell with clear immediate safety guidance and suggests emergency services if appropriate; it does not diagnose, quote, or promise a time.', 'The agent collects a callback number, asks one question at a time, gives one brief summary before closing.'] },
  { name: 'Auto no-start', id: 'conversation_flow_2aefa4aa0c00', company: 'Sample Auto', prompt: 'You are David Chen. Your 2015 Honda Civic will not start. Your callback number is 312-555-0188. Cooperate and confirm a final summary.', metrics: ['The agent collects vehicle year, make, model, reason, and callback number; it does not ask for a home service address.', 'The agent gives one brief summary before closing and does not diagnose or quote a price.'] },
  { name: 'Childcare opening', id: 'conversation_flow_698263e12df5', company: 'Sample Childcare', prompt: 'You are Erin Park. Ask whether there is an opening for your three-year-old needing full-time care. Your callback number is 608-555-0139. Answer normally.', metrics: ['The agent collects child age, care type, caller name, and callback number without guaranteeing availability.', 'The agent gives one brief summary before closing and asks one question at a time.'] },
];
async function main() {
  const jobs = [];
  for (const c of cases) {
    const engine = { type: 'conversation-flow', conversation_flow_id: c.id, version: 0 };
    const definition = await client.tests.createTestCaseDefinition({ name: 'QA 2026-09-27 ' + c.name, response_engine: engine, user_prompt: c.prompt, metrics: c.metrics, dynamic_variables: { ...defaults, business_name: c.company }, llm_model: 'gpt-4.1-mini', tool_mocks: [] });
    const batch = await client.tests.createBatchTest({ response_engine: engine, test_case_definition_ids: [definition.test_case_definition_id] });
    jobs.push({ name: c.name, batchId: batch.test_case_batch_job_id, caseId: definition.test_case_definition_id });
    console.log('created', c.name, batch.test_case_batch_job_id);
  }
  for (let i = 0; i < 24; i++) {
    await new Promise(resolve => setTimeout(resolve, 10000));
    const statuses = await Promise.all(jobs.map(j => client.tests.getBatchTest(j.batchId)));
    console.log('status', JSON.stringify(statuses.map((s, k) => ({ name: jobs[k].name, status: s.status, pass: s.pass_count, fail: s.fail_count, error: s.error_count }))));
    if (statuses.every(s => s.status === 'complete')) {
      for (const j of jobs) {
        const runs = (await client.tests.listTestRuns(j.batchId, { limit: 1000 })).items ?? [];
        for (const run of runs) console.log('result', JSON.stringify({ name: j.name, status: run.status, explanation: run.result_explanation, batchId: j.batchId, caseId: j.caseId, runId: run.test_case_job_id }));
      }
      return;
    }
  }
  console.log('still running', JSON.stringify(jobs));
}
main().catch(e => { console.error('error', e.status || '', e.message); process.exitCode = 1; });
