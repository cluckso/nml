require('dotenv').config({ path: '.env' });
const Retell = require('retell-sdk');
const client = new Retell({ apiKey: process.env.RETELL_API_KEY });
const engine = { type: 'conversation-flow', conversation_flow_id: 'conversation_flow_ccb83e054d91', version: 12 };
async function main() {
  const flow = await client.conversationFlow.retrieve(engine.conversation_flow_id, { version: 12 });
  const nodes = (flow.nodes || []).map(n => ({ id: n.id, type: n.type, toolNames: (n.tools || []).map(t => t.name), keys: Object.keys(n).filter(k => /tool|function|webhook|transfer/i.test(k)) }));
  console.log('flow', JSON.stringify({ version: flow.version, flex_mode: flow.flex_mode, nodes, globalTools: (flow.tools || []).map(t => t.name), flowToolKeys: Object.keys(flow).filter(k => /tool|function|webhook/i.test(k)) }));
  const agent = await client.agent.retrieve('agent_a44e62c554838d1ef3e8ee9cac');
  console.log('agent', JSON.stringify({ version: agent.version, published: agent.is_published, response_engine: agent.response_engine, name: agent.agent_name }));
  const tool = flow.nodes.find(n => n.id === 'confirm-details').tools[0];
  console.log('tool', JSON.stringify({ name: tool.name, type: tool.type, keys: Object.keys(tool), parameters: tool.parameters, urlPath: tool.url ? new URL(tool.url).pathname : null }));
  const defs = (await client.tests.listTestCaseDefinitions({ type: engine.type, conversation_flow_id: engine.conversation_flow_id, limit: 1000 })).items ?? [];
  console.log('definitions', JSON.stringify(defs.map(t => ({ name: t.name, id: t.test_case_definition_id, version: t.response_engine.version, user_prompt: t.user_prompt, metrics: t.metrics, mocks: t.tool_mocks?.map(m => m.tool_name) }))));
  const batches = (await client.tests.listBatchTests({ type: engine.type, conversation_flow_id: engine.conversation_flow_id, limit: 1000 })).items ?? [];
  console.log('batches', JSON.stringify(batches.slice(0, 8).map(b => ({ id: b.test_case_batch_job_id, version: b.response_engine.version, status: b.status, counts: [b.pass_count,b.fail_count,b.error_count,b.total_count], at: new Date(b.creation_timestamp).toISOString() }))));
}
main().catch(e => { console.error('error', e.status || '', e.message); process.exitCode = 1; });
