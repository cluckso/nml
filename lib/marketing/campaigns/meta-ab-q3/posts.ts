import type { MetaAbAdVariant } from "./types"
import { IMAGE_NEGATIVE_PROMPT } from "./config"

export const META_AB_VARIANTS: Record<string, MetaAbAdVariant> = {
  "a-voicemail": {
    id: "a-voicemail",
    adSetName: "AdSet_A_LossVoicemail",
    headline: "Stop Losing Leads to Voicemail",
    description: "14-day free trial · No card · Setup in 5 min",
    primaryText: `80% of callers won't leave voicemail — they call the next company on Google.

You're on a ladder, under a sink, or driving between jobs. The phone rings. You can't answer. They hang up — and dial the next company on Google.

How much was that job worth to you — $300? $500? $600+? Gone.

CallGrabbr answers your forwarded business line 24/7. Industry-specific intake for HVAC, plumbing, electrical, and auto repair — not a generic robot menu. You get a text and email summary in seconds when callers share their details.

Capture one job you'd have lost and CallGrabbr pays for itself for months. Plans from $99/mo.

Start your 14-day free trial — no credit card required.`,
    cta: "SIGN_UP",
    utmCampaign: "meta-ab-voicemail",
    utmContentStatic: "h1-static",
    creative: {
      format: "static-1x1",
      canvaOverlay: {
        headline: "Stop Losing Leads to Voicemail",
        badge: "14-day free trial",
      },
      imagePrompt:
        "CallGrabbr branded dark SaaS ad poster, navy blue gradient background (#0f172a to #1e3a8a), stylized smartphone left half showing voicemail inbox with cobweb dust metaphor muted gray-red tint, right half bright electric blue glow (#3b82f6) with glossy 3D wireless headset and answered call state, neon blue soundwave divider, four circular glowing blue icon badges, dramatic contrast dead voicemail vs active AI assistant, futuristic B2B marketing graphic not photorealistic contractor photos, square 1:1, large clean headline zone top left empty for Canva overlay, no watermarks, no baked-in body text",
      negativePrompt: IMAGE_NEGATIVE_PROMPT,
      assetFile: "creatives/ad-a-voicemail-1x1.png",
    },
    reels: {
      scriptName: "Your Phone Is Losing You Jobs",
      durationSeconds: 15,
      storyboard: [
        { time: "0-2s", visual: "Phone ringing, screen flash", caption: "YOUR PHONE IS LOSING YOU JOBS" },
        { time: "2-5s", visual: "Contractor on ladder, phone ringing in pocket", caption: "You can't answer every call." },
        { time: "5-7s", visual: "Phone leaks flying dollar bills", caption: "They hang up. Next shop gets the job." },
        { time: "7-10s", visual: "Competitor phone shows CallGrabbr AI answering", caption: "AI: Thanks for calling! What's the address?" },
        { time: "10-12s", visual: "Phone screen: instant lead card", caption: "Lead texted in seconds." },
        { time: "12-15s", visual: "Logo on black", caption: "Stop Losing Leads. We answer when you can't." },
      ],
      videoPrompt:
        "Vertical 9:16, 15 seconds, fast cuts 0.7s each, bold white captions with red accent on hook line, dark navy UI frames, electric blue glow on CallGrabbr moments. Scene 1: phone ringing alarm red text YOUR PHONE IS LOSING YOU JOBS. Scene 2: stylized contractor silhouette on ladder phone vibrating pocket not photorealistic. Scene 3: dollar bills flying off phone screen. Scene 4: split screen competitor phone answered with blue AI glow speech bubble Thanks for calling whats the address. Scene 5: smartphone New Lead notification card name phone urgency. Scene 6: CallGrabbr logo end card 14-day free trial no card. No watermarks.",
    },
  },

  "b-family": {
    id: "b-family",
    adSetName: "AdSet_B_FamilyTime",
    headline: "Get Your Family Time Back",
    description: "Stop being a slave to your phone",
    primaryText: `You didn't start your business to stare at your phone at dinner.

Every ring feels like money — but answering mid-job is impossible, and ignoring it feels worse. So you're stuck: work mode 24/7, or lose leads.

CallGrabbr handles forwarded calls while you're with your crew, your kids, or finally off the clock. Natural conversation. Lead summary texted in seconds. You decide when to call back.

Built for local service businesses. 14-day free trial, 40 call minutes, no credit card. About 5 minutes to set up.

Get your evenings back.`,
    cta: "SIGN_UP",
    utmCampaign: "meta-ab-family",
    utmContentStatic: "h2-static",
    creative: {
      format: "static-1x1",
      canvaOverlay: {
        headline: "Get Your Family Time Back",
        sub: "We answer. You live.",
      },
      imagePrompt:
        "CallGrabbr B2B SaaS marketing poster, dark navy background subtle dot grid, LEFT third shows muted gray smartphone with dozens of notification badges overwhelming the screen family dinner silhouette blurred in background stylized not photorealistic, RIGHT two-thirds bright electric blue glow with glossy 3D headset icon and calm smartphone showing single clean New Lead notification, neon blue soundwave, four circular glowing icons headset clipboard chat calendar, square 1:1, headline zone top empty for Canva, trustworthy futuristic tech aesthetic, no watermarks",
      negativePrompt: IMAGE_NEGATIVE_PROMPT,
      assetFile: "creatives/ad-b-family-1x1.png",
    },
    reels: {
      scriptName: "Dinner Table",
      durationSeconds: 15,
      storyboard: [
        { time: "0-3s", visual: "Family at table, phone buzzing on counter", caption: "YOU'RE AT DINNER. YOUR BUSINESS LINE ISN'T." },
        { time: "3-6s", visual: "Owner glances at phone, conflicted", caption: "Miss it = lost job. Answer it = never off." },
        { time: "6-10s", visual: "Phone forwards to CallGrabbr — blue glow, AI answers", caption: "CallGrabbr answers. Captures the lead." },
        { time: "10-13s", visual: "Owner gets text, smiles, puts phone face-down", caption: "Lead texted in seconds. You stay present." },
        { time: "13-15s", visual: "Logo + CTA", caption: "14-day free trial · callgrabbr.com" },
      ],
      videoPrompt:
        "Vertical 9:16 15 second ad, warm but stylized not photorealistic, family dinner table scene transitions to dark navy CallGrabbr UI with electric blue neon accents, smartphone shows lead notification, bold mobile captions each scene, emotional relief tone not corporate, end card CallGrabbr logo 14-day free trial no card required",
    },
  },

  "c-bathroom": {
    id: "c-bathroom",
    adSetName: "AdSet_C_BathroomHumor",
    headline: "They Called. You Were Busy.",
    description: "CallGrabbr's got you covered",
    primaryText: `They called when you were on a ladder. In the crawl space. Or yes — in the bathroom.

You can't answer every call. But your competitor can.

CallGrabbr picks up your forwarded business line 24/7 with a real, helpful conversation — HVAC, plumbing, electrical, auto repair intake built in. When callers share their info, you get a summary by text and email in seconds.

Stop losing jobs to awkward timing. Try it free for 14 days — no card, 40 minutes included.

Call the demo line on our site if you want to hear it first.`,
    cta: "SIGN_UP",
    utmCampaign: "meta-ab-bathroom",
    utmContentStatic: "h3-static",
    creative: {
      format: "static-4x5",
      canvaOverlay: {
        headline: "They called when you were... busy.",
        sub: "We've got you covered",
      },
      imagePrompt:
        "CallGrabbr humorous B2B SaaS ad poster 4:5 vertical, dark navy gradient, stylized cartoon-adjacent 3D trade worker icons in three small panels ladder crawlspace bathroom door silhouette funny but professional not crude, center large smartphone ringing with red pulse, right side electric blue glow CallGrabbr headset answering call successfully, neon soundwave, playful but trustworthy tech brand not meme style, headline area top empty, no watermarks no text baked in",
      negativePrompt: IMAGE_NEGATIVE_PROMPT,
      assetFile: "creatives/ad-c-bathroom-4x5.png",
    },
    reels: {
      scriptName: "Busy Relatability",
      durationSeconds: 15,
      storyboard: [
        { time: "0-2s", visual: "Phone ringing", caption: "RING. RING. RING." },
        { time: "2-5s", visual: "Fast cuts: ladder / under sink / bathroom door", caption: "You're busy." },
        { time: "5-7s", visual: "Missed call screen", caption: "They don't wait." },
        { time: "7-11s", visual: "CallGrabbr answers — AI bubble + lead text", caption: "CallGrabbr answers. You get the lead." },
        { time: "11-15s", visual: "Logo", caption: "14-day free trial — no card" },
      ],
      videoPrompt:
        "Vertical 9:16 15s comedy pacing fast jump cuts, stylized animated trade worker scenarios not photorealistic, bold caption RING RING RING then YOURE BUSY, missed call red X transition, CallGrabbr electric blue AI answer screen lead notification ding, humorous relatable tone for contractors, end card logo",
    },
  },

  "d-competition": {
    id: "d-competition",
    adSetName: "AdSet_D_Competition",
    headline: "They Called. You Didn't Answer.",
    description: "Your competition did.",
    primaryText: `When you miss a call, they don't leave a message. They call the next name on Google.

That emergency HVAC call. The burst pipe. The "my AC died" at 9pm. Your competitor answers. You never even knew it happened.

CallGrabbr answers your forwarded line 24/7 — captures name, phone, job details, and urgency when callers share them — and texts you a summary in seconds.

Your missed call shouldn't be their next job. Plans from $99/mo. How much is one job worth — $300? $500? $600+?

Start your 14-day free trial. No credit card required.`,
    cta: "SIGN_UP",
    utmCampaign: "meta-ab-competition",
    utmContentStatic: "h4-static",
    creative: {
      format: "static-1x1",
      canvaOverlay: {
        headline: "Your missed call = their next job",
      },
      imagePrompt:
        "CallGrabbr split-panel SaaS ad poster square 1:1, dark navy background, LEFT panel dim red-tint smartphone missed call notification money birds flying away metaphor, RIGHT panel bright electric blue glow competitor shop smartphone showing New Lead success checkmark, glossy 3D blue headset centered between panels, neon soundwave connecting panels, circular glowing blue icons, high contrast B2B marketing not photorealistic job site, headline zone blank top, no watermarks",
      negativePrompt: IMAGE_NEGATIVE_PROMPT,
      assetFile: "creatives/ad-d-competition-1x1.png",
    },
    reels: {
      scriptName: "Competitor Stealing Calls",
      durationSeconds: 15,
      storyboard: [
        { time: "0-2s", visual: "Split screen: You on job vs Competitor nearby", caption: "When you miss a call..." },
        { time: "2-5s", visual: "Your phone goes to voicemail, money birds fly out", caption: "...they don't leave a message." },
        { time: "5-8s", visual: "Money birds fly to competitor", caption: "They call the next listing." },
        { time: "8-11s", visual: "Competitor phone: AI captures the lead", caption: "Your missed call is their next job." },
        { time: "11-15s", visual: "Your phone: missed call. His: new lead.", caption: "Stop Losing Leads. CallGrabbr.com" },
      ],
      videoPrompt:
        "Vertical 9:16 15 second ad split screen competitor steal narrative, stylized not photorealistic, dark navy and electric blue CallGrabbr brand, bold captions, missed call vs new lead contrast, end card logo 14-day free trial",
    },
  },
}

export function getMetaAbVariant(id: string): MetaAbAdVariant {
  const variant = META_AB_VARIANTS[id]
  if (!variant) throw new Error(`Unknown Meta A/B variant: ${id}`)
  return variant
}

export function listMetaAbVariants(): MetaAbAdVariant[] {
  return Object.values(META_AB_VARIANTS)
}
