require('dotenv').config({ path: '.env' });
const Retell = require('retell-sdk');
const client = new Retell({ apiKey: process.env.RETELL_API_KEY });
client.tests.deleteTestCaseDefinition('test_case_96f3c6a7e77f')
  .then(() => console.log('removed unreliable correction definition'))
  .catch(e => { console.error('error', e.status || '', e.message); process.exitCode = 1; });
