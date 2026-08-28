/**
 * Constante de programare, fără dependențe de server.
 * Se importă și din componente client — de aceea nu atinge baza de date.
 */

/** Granularitatea grilei de sloturi, în minute (programările încep la :00 și :30). */
export const SLOT_STEP = 30;

/** Cel mai devreme slot rezervabil, față de ora curentă. */
export const MIN_LEAD_MIN = 45;

/** Câte zile în avans se poate rezerva. */
export const BOOKING_HORIZON_DAYS = 21;
