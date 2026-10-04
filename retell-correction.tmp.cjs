require('dotenv').config({ path: '.env' });
const Retell = require('retell-sdk');
const client = new Retell({ apiKey: process.env.RETELL_API_KEY });
const engine = { type: 'conversation-flow', conversation_flow_id: 'conversation_flow_ccb83e054d91', version: 12 };
async function main() {
  const def = await client.tests.createTestCaseDefinition({
    name: 'QA 2026-09-27 Caller corrects callback number', response_engine: engine,
    user_prompt: 'You are Sarah Lin. You need help with a running toilet at 300 Elm Street, Seattle. Give callback number 206-555-0192 initially. When the agent reads a final summary, correct the callback number to 206-555-0193 regardless of whether the first number was read correctly. Then say thanks and nothing else.',
    metrics: ['The agent gives exactly one concise summary before the caller corrects the number.', 'The agent acknowledges the corrected callback number without re-reading the entire summary or asking for another confirmation.', 'The agent closes after acknowledging the correction and keeps the caller name, issue, and address.'],
    llm_model: 'gpt-4.1-mini', tool_mocks: [{ tool_name: 'store_lead_details', input_match_rule: { type: 'any' }, output: '{}' }],
  });
  const batch = await client.tests.createBatchTest({ response_engine: engine, test_case_definition_ids: [def.test_case_definition_id] });
  console.log('created', def.test_case_definition_id, batch.test_case_batch_job_id);
  for (let i = 0; i < 20; i++) {
    await new Promise(resolve => setTimeout(resolve, 10000));
    const status = await client.tests.getBatchTest(batch.test_case_batch_job_id);
    if (status.status === 'complete') {
      const runs = (await client.tests.listTestRuns(batch.test_case_batch_job_id, { limit: 1000 })).items ?? [];
      for (const run of runs) console.log('result', JSON.stringify({ status: run.status, explanation: run.result_explanation, transcript: run.transcript_snapshot?.transcript?.filter(x => x.role === 'agent' || x.role === 'user').map(x => ({ role: x.role, content: x.content })) }));
      return;
    }
  }
  console.log('still running', batch.test_case_batch_job_id);
}
main().catch(e => { console.error('error', e.status || '', e.message); process.exitCode = 1; });
