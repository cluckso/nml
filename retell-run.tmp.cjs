require('dotenv').config({ path: '.env' });
const Retell = require('retell-sdk');
const client = new Retell({ apiKey: process.env.RETELL_API_KEY });
const engine = { type: 'conversation-flow', conversation_flow_id: 'conversation_flow_ccb83e054d91', version: 12 };
const ids = ['test_case_cf6a8b0cc636', 'test_case_5a9e8bcff349', 'test_case_89b0da8bd1ae', 'test_case_0c3cebcc62b0'];
async function main() {
  const batch = await client.tests.createBatchTest({ response_engine: engine, test_case_definition_ids: ids });
  console.log('created', batch.test_case_batch_job_id, JSON.stringify(batch.response_engine));
  for (let i = 0; i < 24; i++) {
    await new Promise(resolve => setTimeout(resolve, 10000));
    const current = await client.tests.getBatchTest(batch.test_case_batch_job_id);
    console.log('status', current.status, current.pass_count, current.fail_count, current.error_count, current.total_count);
    if (current.status === 'complete') {
      const runs = (await client.tests.listTestRuns(batch.test_case_batch_job_id, { limit: 1000 })).items ?? [];
      for (const run of runs) {
        console.log('result', JSON.stringify({ name: run.test_case_definition_snapshot?.name, status: run.status, explanation: run.result_explanation, id: run.test_case_job_id, transcriptKeys: Object.keys(run.transcript_snapshot || {}) }));
      }
      return;
    }
  }
  console.log('still running', batch.test_case_batch_job_id);
}
main().catch(e => { console.error('error', e.status || '', e.message); process.exitCode = 1; });
