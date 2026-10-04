require('dotenv').config({ path: '.env' });
const Retell = require('retell-sdk');
const client = new Retell({ apiKey: process.env.RETELL_API_KEY });
async function main() {
  const agents = (await client.agent.list({ limit: 1000 })).items ?? [];
  for (const summary of agents.filter(x => /CallGrabbr (HVAC|PLUMBING|ELECTRICIAN|HANDYMAN|AUTO_REPAIR|CHILDCARE|GENERIC)/i.test(x.agent_name || ''))) {
    const a = await client.agent.retrieve(summary.agent_id);
    const e = a.response_engine;
    const f = await client.conversationFlow.retrieve(e.conversation_flow_id, { version: e.version });
    const prompt = f.global_prompt || '';
    const vars = [...new Set([...prompt.matchAll(/\{\{([a-z_]+)\}\}/g)].map(m => m[1]))];
    console.log('template', JSON.stringify({ name: a.agent_name, agentId: a.agent_id, published: a.is_published, flowId: e.conversation_flow_id, version: e.version, flex: f.flex_mode, vars, toolTypes: [...new Set((f.nodes || []).flatMap(n => (n.tools || []).map(t => t.type)))] }));
  }
}
main().catch(e => { console.error('error', e.status || '', e.message); process.exitCode = 1; });
