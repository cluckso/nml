"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OVERAGE_RATE_PER_MIN = exports.MONTHLY_PRICES = exports.TRIAL_DAYS = exports.FREE_TRIAL_MINUTES = exports.SETUP_FEES = exports.INCLUDED_MINUTES = void 0;
exports.getIncludedMinutes = getIncludedMinutes;
exports.getOverageMinutes = getOverageMinutes;
exports.hasIndustryOptimizedAgents = hasIndustryOptimizedAgents;
exports.hasAppointmentCapture = hasAppointmentCapture;
exports.hasSmsToCallers = hasSmsToCallers;
exports.hasCrmForwarding = hasCrmForwarding;
exports.hasLeadTagging = hasLeadTagging;
exports.hasMultiDepartment = hasMultiDepartment;
exports.hasWeeklyReports = hasWeeklyReports;
exports.hasBrandedVoice = hasBrandedVoice;
exports.hasUrgencyFlags = hasUrgencyFlags;
exports.hasPrioritySupport = hasPrioritySupport;
exports.getEffectivePlanType = getEffectivePlanType;
const client_1 = require("@prisma/client");
/** Included call minutes per plan per month */
exports.INCLUDED_MINUTES = {
    [client_1.PlanType.STARTER]: 300,
    [client_1.PlanType.PRO]: 900,
    [client_1.PlanType.LOCAL_PLUS]: 1800,
};
/** One-time setup fee per plan (USD) — no setup fees */
exports.SETUP_FEES = {
    [client_1.PlanType.STARTER]: 0,
    [client_1.PlanType.PRO]: 0,
    [client_1.PlanType.LOCAL_PLUS]: 0,
};
/** Free trial: call minutes cap before first paid subscription */
exports.FREE_TRIAL_MINUTES = 50;
/** Free trial: validity window in days */
exports.TRIAL_DAYS = 14;
/** Monthly price per plan (USD) */
exports.MONTHLY_PRICES = {
    [client_1.PlanType.STARTER]: 99,
    [client_1.PlanType.PRO]: 229,
    [client_1.PlanType.LOCAL_PLUS]: 349,
};
/** Overage rate per minute (USD) */
exports.OVERAGE_RATE_PER_MIN = 0.2;
function getIncludedMinutes(planType) {
    return exports.INCLUDED_MINUTES[planType] ?? 0;
}
function getOverageMinutes(planType, minutesUsed) {
    return Math.max(0, minutesUsed - getIncludedMinutes(planType));
}
/** Whether plan has industry-optimized / prebuilt agents (Pro+); user selects business type, system links prebuilt intake flow */
function hasIndustryOptimizedAgents(planType) {
    return planType === client_1.PlanType.PRO || planType === client_1.PlanType.LOCAL_PLUS;
}
/** Whether plan has appointment request capture (Pro+) */
function hasAppointmentCapture(planType) {
    return planType === client_1.PlanType.PRO || planType === client_1.PlanType.LOCAL_PLUS;
}
/** Whether plan sends SMS confirmation to callers (Pro+) */
function hasSmsToCallers(planType) {
    return planType === client_1.PlanType.PRO || planType === client_1.PlanType.LOCAL_PLUS;
}
/** Whether plan has email/CRM forwarding (Pro+) */
function hasCrmForwarding(planType) {
    return planType === client_1.PlanType.PRO || planType === client_1.PlanType.LOCAL_PLUS;
}
/** Whether plan has lead tagging: emergency, estimate, follow-up (Pro+) */
function hasLeadTagging(planType) {
    return planType === client_1.PlanType.PRO || planType === client_1.PlanType.LOCAL_PLUS;
}
/** Whether plan has multi-department logic (removed from Local Plus; reserved for future) */
function hasMultiDepartment(planType) {
    return false;
}
/** Whether plan gets weekly usage & lead reports (Local Plus) */
function hasWeeklyReports(planType) {
    return planType === client_1.PlanType.LOCAL_PLUS;
}
/** Whether plan has fully branded AI voice + voice sliders (Local Plus) */
function hasBrandedVoice(planType) {
    return planType === client_1.PlanType.LOCAL_PLUS;
}
/** Whether plan shows urgency/emergency flags in dashboard (Pro+) */
function hasUrgencyFlags(planType) {
    return planType === client_1.PlanType.PRO || planType === client_1.PlanType.LOCAL_PLUS;
}
/** Whether plan has priority support (Local Plus; replaces multi-department & after-hours) */
function hasPrioritySupport(planType) {
    return planType === client_1.PlanType.LOCAL_PLUS;
}
/**
 * In development, returns LOCAL_PLUS so all features are enabled for testing.
 * In production, returns the actual plan (or STARTER if none).
 */
function getEffectivePlanType(planType) {
    if (process.env.NODE_ENV === "development") {
        return client_1.PlanType.LOCAL_PLUS;
    }
    return planType ?? client_1.PlanType.STARTER;
}
