// How a translation is laid out for reading: the chain of narrators (sanad) apart from the text (matn), and the text
// in paragraphs. Display only: every character of the source text is kept, in order; only where lines break changes,
// and the square brackets the Indonesian source puts around narrator names become styling.
//
// Measured on 2026-11-21 over our mirror: 83% of the Indonesian texts open with a sanad whose narrator names are in
// [brackets] and start the matn at the first double quote; 85% of the English ones open with "Narrated X:". Half the
// Indonesian texts are over 600 characters and 6,160 over 1,000, without a single line break (Bukhari 349: 4,832).
//
// Not for HadeethEnc texts: its terms forbid changes, so they are shown as delivered.

/** A run of text, marked when it is a narrator's name (from the [brackets] of the Indonesian source). */
export interface Segment {
  text: string;
  narrator?: boolean;
}

export interface TranslationLayout {
  /** The chain of narrators before the matn, or null when it cannot be told apart. */
  sanad: Segment[] | null;
  paragraphs: Segment[][];
}

/** Paragraphs end at a sentence end once they reach about this many characters. */
const PARAGRAPH_CHARS = 400;
/** A sanad longer than this is not a sanad: the quote that follows is somewhere in the story. */
const MAX_SANAD_CHARS = 600;

/** A narrator taking the word in the middle of a hadith ("Anas berkata", "Ibnu Syihab berkata"): a new paragraph. */
const NARRATOR_TURN: Record<string, RegExp> = {
  id: /^(?:[A-Z][\w']*(?: (?:bin|binti|Al|al|ibnu|Ibnu|[A-Z][\w']*)){0,4}) (?:berkata|melanjutkan|menyebutkan|mengabarkan|mengatakan|menuturkan)\b/,
  en: /^(?:[A-Z][\w']*(?: (?:bin|ibn|Ibn|al|Al|[A-Z][\w']*)){0,4}) (?:said|added|narrated|reported)\b/,
};

/** Split "… [Yahya bin Bukair] berkata …" into plain runs and narrator names, without the brackets. */
export function segments(text: string): Segment[] {
  const out: Segment[] = [];
  let last = 0;
  for (const match of text.matchAll(/\[([^\]\n]{1,120})\]/g)) {
    if (match.index > last) out.push({ text: text.slice(last, match.index) });
    out.push({ text: match[1], narrator: true });
    last = match.index + match[0].length;
  }
  if (last < text.length) out.push({ text: text.slice(last) });
  return out;
}

/** The sanad and the rest, or null for the sanad when the text has no recognisable one. */
function splitSanad(text: string, language: string): { sanad: string | null; matn: string } {
  if (language === "en") {
    const m = /^((?:Narrated|It was narrated from|It is narrated on the authority of) [^:"]{1,200}:)\s*/.exec(text);
    return m ? { sanad: m[1], matn: text.slice(m[0].length) } : { sanad: null, matn: text };
  }
  const quote = text.indexOf('"');
  if (quote > 0 && quote <= MAX_SANAD_CHARS && text.slice(0, quote).includes("[")) {
    return { sanad: text.slice(0, quote).trim(), matn: text.slice(quote) };
  }
  return { sanad: null, matn: text };
}

/** Sentences: a break after . ! or ? (and any closing quotes) where the next sentence starts with a capital or a quote. */
export function sentences(text: string): string[] {
  return text
    .split(/(?<=[.!?]["'”’]?)\s+(?=["'“‘]?[A-Z])/)
    .map((s) => s.trim())
    .filter(Boolean);
}

/** Group sentences into paragraphs of about PARAGRAPH_CHARS, and start one where a narrator takes the word. */
export function paragraphs(text: string, language: string): string[] {
  const turn = NARRATOR_TURN[language === "en" ? "en" : "id"];
  const out: string[] = [];
  let current: string[] = [];
  let length = 0;
  for (const sentence of sentences(text)) {
    if (current.length && (turn.test(sentence) || length + sentence.length > PARAGRAPH_CHARS)) {
      out.push(current.join(" "));
      current = [];
      length = 0;
    }
    current.push(sentence);
    length += sentence.length + 1;
  }
  if (current.length) out.push(current.join(" "));
  return out;
}

export function layoutTranslation(text: string, language: string): TranslationLayout {
  const { sanad, matn } = splitSanad(text.trim(), language);
  return {
    sanad: sanad ? segments(sanad) : null,
    paragraphs: paragraphs(matn, language).map(segments),
  };
}
