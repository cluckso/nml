require('dotenv').config({ path: '.env' });
const Retell = require('retell-sdk');
const client = new Retell({ apiKey: process.env.RETELL_API_KEY });
async function main() {
  const id = 'test_case_ad55a8098e0e';
  const def = await client.tests.getTestCaseDefinition(id);
  if (def.name !== 'Refuses callback number') throw new Error('Unexpected test definition');
  const metric = 'If no usable contact method is collected, the agent does not promise a callback or claim it can email without collecting an email address.';
  if (!def.metrics.includes(metric)) await client.tests.updateTestCaseDefinition(id, { metrics: [...def.metrics, metric] });
  console.log('refusal test now checks truthful contact promise');
}
main().catch(e => { console.error('error', e.status || '', e.message); process.exitCode = 1; });
