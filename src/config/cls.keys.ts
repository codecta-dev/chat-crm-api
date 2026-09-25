/**
 * Claves únicas para CLS (Continuation Local Storage).
 * Centraliza los nombres para evitar divergencias tipo 'user-id' vs 'user.id'
 * que rompían `identify()` y el aislamiento multi-tenant.
 */
export const CLS_USER_ID = 'user.id' as const;
export const CLS_COMPANY_ID = 'company.id' as const;
