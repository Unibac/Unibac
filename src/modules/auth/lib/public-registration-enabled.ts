/** Si es `"false"`, ocultar registro público en UI. Por defecto habilitado (no coincide con flag del servidor). */
export function isPublicRegistrationEnabled(): boolean {
  return process.env.NEXT_PUBLIC_PUBLIC_REGISTRATION_ENABLED !== "false";
}
