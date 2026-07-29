import { z } from "zod";

import { CONTACT_MESSAGE_STATUS_VALUES } from "./constants";

function normalizeOptionalValue(value: unknown): unknown {
  if (typeof value === "string" && value.trim() === "") {
    return undefined;
  }

  return value;
}

export const updateContactMessageSchema = z.object({
  messageId: z.string().uuid("ID pesan tidak valid."),

  status: z.enum(CONTACT_MESSAGE_STATUS_VALUES),

  assignedToId: z.preprocess(
    normalizeOptionalValue,
    z.string().uuid("Penanggung jawab tidak valid.").optional(),
  ),
});
