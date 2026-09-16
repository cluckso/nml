/**
 * Founder details for /about and footer trust. Leave fields null until real
 * name, photo, and LinkedIn are supplied — do not invent them.
 */
export const FOUNDER = {
  name: null as string | null,
  photoSrc: null as string | null,
  linkedInUrl: null as string | null,
  /** e.g. "a one-truck plumber" — only set when true */
  background: null as string | null,
} as const

export function founderByline(): string | null {
  if (!FOUNDER.name) return null
  if (FOUNDER.background) return `Built by ${FOUNDER.name}, ${FOUNDER.background}`
  return `Built by ${FOUNDER.name}`
}

/** First-person founding story — tradesperson voice, no invented biography. */
export const WHY_I_BUILT_THIS = `I built CallGrabbr because I kept watching the same scene: you're on a job, the phone rings, you can't pick up. They hang up and call the next guy on the list. You finish the install, check your phone, and see three missed calls with no voicemails. Those homeowners already booked someone who answered.

Voicemail does not save those jobs. A $235-a-month receptionist is more than most one-truck shops want to spend just to catch overflow and nights. Cheaper tools pick up and send a transcript. That is not what you need when you are under a sink. You need the name, the address, the job, and how urgent it is — in a text you can tap to call back.

I did not want another dashboard to learn. I wanted missed-call lead capture that works with the number customers already dial. Forward your line. We pick up when you can't. You get the lead in seconds.

If you run HVAC, plumbing, electrical, or auto repair, you already know this pain. CallGrabbr is the AI answering service built around that scene — protect the jobs that pay your bills, and be the shop that actually picks up.`
