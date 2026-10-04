require('dotenv').config({ path: '.env' });
const Retell = require('retell-sdk');
const client = new Retell({ apiKey: process.env.RETELL_API_KEY });
async function main() {
  const id = 'conversation_flow_ccb83e054d91';
  const flow = await client.conversationFlow.retrieve(id, { version: 12 });
  const target = process.argv[2] === 'nodes' ? false : true;
  if (flow.flex_mode === target) { console.log('already', target); return; }
  if (flow.global_prompt?.length !== 4779) throw new Error('Unexpected prompt; review first');
  const updated = await client.conversationFlow.update(id, { version: 12, flex_mode: target });
  console.log('draft mode', updated.version, updated.flex_mode);
}
main().catch(e => { console.error('error', e.status || '', e.message); process.exitCode = 1; });
