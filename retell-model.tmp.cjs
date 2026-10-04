require('dotenv').config({ path: '.env' });
const Retell = require('retell-sdk');
const client = new Retell({ apiKey: process.env.RETELL_API_KEY });
async function main() {
  const id = 'conversation_flow_ccb83e054d91';
  const flow = await client.conversationFlow.retrieve(id, { version: 12 });
  const model = process.argv[2] || 'gemini-3.0-flash';
  if (flow.global_prompt?.length !== 5065 || flow.flex_mode !== true) throw new Error('Unexpected draft state');
  const updated = await client.conversationFlow.update(id, { version: 12, model_choice: { type: 'cascading', model } });
  console.log('draft model', updated.version, updated.model_choice?.model);
}
main().catch(e => { console.error('error', e.status || '', e.message); process.exitCode = 1; });
