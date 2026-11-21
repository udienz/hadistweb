import type { Locale } from "../config";
import { ar } from "./ar";
import { bn } from "./bn";
import { en } from "./en";
import { fa } from "./fa";
import { fr } from "./fr";
import { id } from "./id";
import { ms } from "./ms";
import { ru } from "./ru";
import { tr } from "./tr";
import { ur } from "./ur";
import type { Messages } from "./types";

export type { Messages, PluralKey, StringKey } from "./types";

export const MESSAGES: Record<Locale, Messages> = { en, id, tr, ms, bn, fr, ru, ur, ar, fa };
