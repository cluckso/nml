require('dotenv').config({ path: '.env' });
const Retell = require('retell-sdk');
const client = new Retell({ apiKey: process.env.RETELL_API_KEY });
async function main() {
  const engine = { type: 'conversation-flow', conversation_flow_id: 'conversation_flow_4f65e3e8d667', version: 0 };
  const batch = await client.tests.createBatchTest({ response_engine: engine, test_case_definition_ids: ['test_case_ad5eaf5bdbf1'] });
  console.log('created', batch.test_case_batch_job_id);
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
