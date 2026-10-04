require('dotenv').config({ path: '.env' });
const Retell = require('retell-sdk');
const client = new Retell({ apiKey: process.env.RETELL_API_KEY });
async function main() {
  const id = 'test_case_d97ca9bfa3df';
  const def = await client.tests.getTestCaseDefinition(id);
  if (def.name !== 'QA 2026-09-27 Auto no-start') throw new Error('Unexpected test definition');
  const metrics = [
    'The agent collects vehicle year, make, model, reason, and callback number; it may ask where a disabled vehicle is parked but does not ask for a street service address.',
    'The agent gives one brief summary before closing and does not diagnose or quote a price.'
  ];
  await client.tests.updateTestCaseDefinition(id, { metrics });
  const batch = await client.tests.createBatchTest({ response_engine: { type: 'conversation-flow', conversation_flow_id: 'conversation_flow_2aefa4aa0c00', version: 0 }, test_case_definition_ids: [id] });
  console.log('created', batch.test_case_batch_job_id);
  for (let i = 0; i < 20; i++) {
    await new Promise(resolve => setTimeout(resolve, 10000));
    const status = await client.tests.getBatchTest(batch.test_case_batch_job_id);
    if (status.status === 'complete') {
      const runs = (await client.tests.listTestRuns(batch.test_case_batch_job_id, { limit: 1000 })).items ?? [];
      for (const run of runs) console.log('result', JSON.stringify({ status: run.status, explanation: run.result_explanation }));
      return;
    }
  }
  console.log('still running', batch.test_case_batch_job_id);
}
main().catch(e => { console.error('error', e.status || '', e.message); process.exitCode = 1; });
