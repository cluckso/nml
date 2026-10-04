require('dotenv').config({ path: '.env' });
const Retell = require('retell-sdk');
const client = new Retell({ apiKey: process.env.RETELL_API_KEY });
async function main() {
  const versions = (await client.agent.listVersions('agent_a44e62c554838d1ef3e8ee9cac')).items ?? [];
  console.log('versions', JSON.stringify(versions.map(a => ({ version: a.version, published: a.is_published, base_version: a.base_version, title: a.version_title }))));
  const number = await client.phoneNumber.retrieve('+12029526890');
  console.log('phone', JSON.stringify({ inbound_agents: number.inbound_agents, webhookPath: number.inbound_webhook_url ? new URL(number.inbound_webhook_url).pathname : null, keys: Object.keys(number).filter(k => /agent|version|webhook/i.test(k)) }));
}
main().catch(e => { console.error('error', e.status || '', e.message); process.exitCode = 1; });
