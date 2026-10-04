import dotenv from 'dotenv'
dotenv.config({ path: '.env' })
import Retell from 'retell-sdk'
import { buildDemoGlobalPrompt } from './lib/receptionist-prompt'
const client = new Retell({ apiKey: process.env.RETELL_API_KEY })
async function main() {
  const flow = await client.conversationFlow.retrieve('conversation_flow_ccb83e054d91', { version: 12 })
  const current = flow.global_prompt || ''
  const candidate = buildDemoGlobalPrompt()
  const before = current.split('\n')
  const after = candidate.split('\n')
  console.log('old/new lengths', current.length, candidate.length)
  console.log('removed lines', JSON.stringify(before.filter(x => !after.includes(x))))
  console.log('added lines', JSON.stringify(after.filter(x => !before.includes(x))))
  if (process.argv.includes('--apply')) {
    if (current.length !== 4779 || before.filter(x => !after.includes(x)).length !== 2) throw new Error('Draft changed; review before updating')
    const updated = await client.conversationFlow.update(flow.conversation_flow_id, { version: 12, global_prompt: candidate })
    console.log('updated draft flow', updated.conversation_flow_id, updated.version, updated.global_prompt?.length)
  }
}
main().catch(e => { console.error('error', e.status || '', e.message); process.exitCode = 1 })
