require('dotenv').config({ path: '.env' });
const Retell = require('retell-sdk');
const client = new Retell({ apiKey: process.env.RETELL_API_KEY });
async function main() {
  const a = await client.conversationFlow.retrieve('conversation_flow_ccb83e054d91', { version: 11 });
  const b = await client.conversationFlow.retrieve('conversation_flow_ccb83e054d91', { version: 12 });
  for (const k of ['flex_mode', 'model_choice', 'global_prompt', 'nodes', 'start_node_id']) {
    console.log('diff', k, JSON.stringify(a[k]) === JSON.stringify(b[k]) ? 'same' : 'changed');
    if (k === 'global_prompt' && a[k] !== b[k]) {
      console.log('v11 global prompt:', a[k]);
    }
  }
}
main().catch(e => { console.error('error', e.status || '', e.message); process.exitCode = 1; });
