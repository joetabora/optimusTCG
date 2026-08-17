import type { CardDefinition } from "../types/card";

export type CardCatalog = ReadonlyMap<string, CardDefinition>;

export const DEFAULT_STARTING_INTEGRITY = 20;
export const DEFAULT_STARTING_UPLINK_SIZE = 5;
export const DEFAULT_VAULT_SIZE = 40;
export const MAX_COPIES_PER_CARD = 2;
export const MAX_FIELD_CONSTRUCTS = 6;
export const MAX_FLUX = 10;
