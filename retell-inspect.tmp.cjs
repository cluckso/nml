require('dotenv').config({ path: '.env' });
const Retell = require('retell-sdk');
const client = new Retell({ apiKey: process.env.RETELL_API_KEY });
async function main() {
  for (const id of ['test_job_581b103d7118', 'test_job_6e473a92411d']) {
    const run = await client.tests.getTestRun(id);
    console.log('run', id, JSON.stringify({ status: run.status, explanation: run.result_explanation, transcript: run.transcript_snapshot?.transcript, endNode: run.transcript_snapshot?.currentNodeId, vars: run.transcript_snapshot?.dynamicVariables }));
  }
}
main().catch(e => { console.error('error', e.status || '', e.message); process.exitCode = 1; });
