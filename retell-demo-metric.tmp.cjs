require('dotenv').config({ path: '.env' });
const Retell = require('retell-sdk');
const client = new Retell({ apiKey: process.env.RETELL_API_KEY });
async function main() {
  const id = 'test_case_89b0da8bd1ae';
  const def = await client.tests.getTestCaseDefinition(id);
  if (def.name !== 'Auto call collects vehicle details') throw new Error('Unexpected case');
  const metrics = def.metrics.map(m => m.includes('exactly one brief summary')
    ? 'The agent gives one brief summary with one confirmation question. After the caller answers that question, it does not repeat the summary or ask another confirmation question.' : m);
  await client.tests.updateTestCaseDefinition(id, { metrics });
  console.log('demo auto test criterion clarified');
}
main().catch(e => { console.error('error', e.status || '', e.message); process.exitCode = 1; });
