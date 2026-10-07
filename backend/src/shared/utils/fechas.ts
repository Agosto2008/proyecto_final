/** Convierte 'AAAA-MM-DD' en partes numéricas; devuelve null si la fecha no existe (ej. 2020-02-31). */
export function parseFechaISO(texto: string): { y: number; m: number; d: number } | null {
  const coincide = /^(\d{4})-(\d{2})-(\d{2})$/.exec(texto);
  if (!coincide) return null;
  const y = Number(coincide[1]);
  const m = Number(coincide[2]);
  const d = Number(coincide[3]);
  const fecha = new Date(Date.UTC(y, m - 1, d));
  const valida = fecha.getUTCFullYear() === y && fecha.getUTCMonth() === m - 1 && fecha.getUTCDate() === d;
  return valida ? { y, m, d } : null;
}

export function calcularEdad(fechaNacimiento: string, hoy: Date = new Date()): number {
  const f = parseFechaISO(fechaNacimiento);
  if (!f) return 0;
  let edad = hoy.getUTCFullYear() - f.y;
  const yaCumplio =
    hoy.getUTCMonth() + 1 > f.m || (hoy.getUTCMonth() + 1 === f.m && hoy.getUTCDate() >= f.d);
  if (!yaCumplio) edad -= 1;
  return edad;
}