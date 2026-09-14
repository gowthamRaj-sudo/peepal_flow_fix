import type { QuoteItemKind, PhotoStage } from "@prisma/client";

export const QUOTE_ITEM_KINDS: QuoteItemKind[] = ["MATERIALS", "LABOUR", "OTHER"];

export const PHOTO_STAGES: PhotoStage[] = ["BEFORE", "DURING", "AFTER"];
