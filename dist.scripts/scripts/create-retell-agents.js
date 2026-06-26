"use strict";
/**
 * Create one Retell agent + conversation flow per business type (industry).
 * Run from project root: npm run create-retell-agents
 * Requires: RETELL_API_KEY in env or in .env / .env.local
 *
 * Output: prints agent_id and flow_id per industry, and writes retell-agents-by-industry.json
 */
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = require("fs");
const path_1 = require("path");
const client_1 = require("@prisma/client");
const retell_1 = require("../lib/retell");
function loadEnv() {
    const roots = [(0, path_1.resolve)(process.cwd(), ".env.local"), (0, path_1.resolve)(process.cwd(), ".env")];
    for (const p of roots) {
        if (!(0, fs_1.existsSync)(p))
            continue;
        const content = (0, fs_1.readFileSync)(p, "utf8");
        for (const line of content.split("\n")) {
            const m = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*?)\s*$/);
            if (m) {
                const key = m[1];
                let val = m[2].replace(/^["']|["']$/g, "").trim();
                if (!process.env[key])
                    process.env[key] = val;
            }
        }
    }
}
loadEnv();
const RETELL_API_KEY = process.env.RETELL_API_KEY;
if (!RETELL_API_KEY) {
    console.error("Missing RETELL_API_KEY. Set it in .env, .env.local, or the environment.");
    process.exit(1);
}
const INDUSTRIES = Object.values(client_1.Industry);
async function main() {
    const results = {};
    for (const industry of INDUSTRIES) {
        try {
            const out = await (0, retell_1.createAgentAndFlowForIndustry)(RETELL_API_KEY, industry);
            results[industry] = out;
            console.log(`${industry}: agent_id=${out.agent_id} flow_id=${out.conversation_flow_id} version=${out.version}`);
        }
        catch (err) {
            console.error(`${industry}: failed`, err instanceof Error ? err.message : err);
        }
    }
    const outPath = (0, path_1.resolve)(process.cwd(), "retell-agents-by-industry.json");
    (0, fs_1.writeFileSync)(outPath, JSON.stringify(results, null, 2), "utf8");
    console.log("\nWrote", outPath);
}
main().catch((err) => {
    console.error(err);
    process.exit(1);
});
