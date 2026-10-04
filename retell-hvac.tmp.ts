import dotenv from 'dotenv'
dotenv.config({ path: '.env' })
import Retell from 'retell-sdk'
import { Industry } from '@prisma/client'
import { buildTemplateGlobalPrompt } from './lib/receptionist-prompt'
const client = new Retell({ apiKey: process.env.RETELL_API_KEY })
async function main() {
  const id = 'conversation_flow_4f65e3e8d667'
  const flow = await client.conversationFlow.retrieve(id, { version: 0 })
  const current = flow.global_prompt || ''
  const candidate = buildTemplateGlobalPrompt(Industry.HVAC)
  const before = current.split('\n'), after = candidate.split('\n')
  const removed = before.filter(x => !after.includes(x))
  const added = after.filter(x => !before.includes(x))
  console.log('old/new lengths', current.length, candidate.length)
  console.log('removed lines', JSON.stringify(removed))
  console.log('added lines', JSON.stringify(added))
  if (process.argv.includes('--apply')) {
    if (removed.length !== 3 || added.length !== 5) throw new Error('Unexpected draft changes; review first')
    const updated = await client.conversationFlow.update(id, { version: 0, global_prompt: candidate })
    console.log('updated HVAC draft', updated.version, updated.global_prompt?.length)
  }
}
main().catch(e => { console.error('error', e.status || '', e.message); process.exitCode = 1 })
