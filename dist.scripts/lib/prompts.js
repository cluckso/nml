"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generatePrompt = generatePrompt;
const agent_prompt_1 = require("../config/agent-prompt");
/**
 * Builds the agent global prompt from owner-editable config (config/agent-prompt.ts)
 * plus business data. Users never edit the prompt text — only you (owner) edit config/agent-prompt.ts.
 */
function generatePrompt(businessName, industry, serviceAreas, options) {
    const cfg = agent_prompt_1.AGENT_PROMPT_CONFIG;
    const basePrompt = cfg.basePromptTemplate
        .replace(/\{\{BUSINESS_NAME\}\}/g, businessName)
        .replace(/\{\{SERVICE_AREAS\}\}/g, serviceAreas.join(", "));
    const businessHoursBlock = formatBusinessHoursBlock(options?.businessHours, options?.afterHoursEmergencyPhone);
    const departmentsBlock = options?.departments?.length
        ? cfg.departmentsBlockTemplate.replace(/\{\{DEPARTMENTS\}\}/g, options.departments.join(", "))
        : "";
    const appointmentBlock = options?.includeAppointmentCapture ? cfg.appointmentBlockTemplate : "";
    const tagBlock = cfg.tagBlockTemplate;
    const industrySpecific = getIndustrySpecificPrompt(industry);
    return `${basePrompt}${businessHoursBlock}${departmentsBlock}${appointmentBlock}${tagBlock}\n\n${industrySpecific}`;
}
function formatBusinessHoursBlock(businessHours, afterHoursEmergencyPhone) {
    const cfg = agent_prompt_1.AGENT_PROMPT_CONFIG;
    if (!businessHours?.open || !businessHours?.close || !businessHours?.days?.length) {
        return cfg.businessHoursNotSet;
    }
    const emergencyNote = afterHoursEmergencyPhone ? cfg.emergencyNoteWhenClosed : "";
    return cfg.businessHoursTemplate
        .replace(/\{\{DAYS\}\}/g, businessHours.days.join(", "))
        .replace(/\{\{OPEN\}\}/g, businessHours.open)
        .replace(/\{\{CLOSE\}\}/g, businessHours.close)
        .replace(/\{\{EMERGENCY_NOTE\}\}/g, emergencyNote);
}
function getIndustrySpecificPrompt(industry) {
    const cfg = agent_prompt_1.AGENT_PROMPT_CONFIG;
    return cfg.industryPrompts[industry] ?? cfg.industryPrompts.GENERIC;
}
