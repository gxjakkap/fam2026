import { integer, pgTable, uniqueIndex, uuid } from "drizzle-orm/pg-core";

export const reservationQuotaSelection = pgTable("reservation_quota_selection", {
    id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
    reservationId: uuid("reservation_id").notNull(),
    quotaDrinkId: integer("quota_drink_id").notNull(),
    slot: integer("slot").notNull()
}, (table) => ({
    rqs_reservation_id_slot_idx: uniqueIndex("rqs_reservation_id_slot_idx").on(
        table.reservationId,
        table.slot
    )
}))