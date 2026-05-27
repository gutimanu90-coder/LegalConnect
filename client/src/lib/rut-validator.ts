export function cleanRut(rut: string): string {
  return rut.replace(/[.\-\s]/g, "").toUpperCase();
}

export function formatRut(rut: string): string {
  const cleaned = cleanRut(rut);
  if (cleaned.length < 2) return cleaned;

  const dv = cleaned.slice(-1);
  const body = cleaned.slice(0, -1);

  if (body.length === 0) return cleaned;

  const formatted = body.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  return `${formatted}-${dv}`;
}

export function validateRut(rut: string): boolean {
  const cleaned = cleanRut(rut);

  if (!/^\d{7,8}[0-9K]$/.test(cleaned)) return false;

  const body = cleaned.slice(0, -1);
  const dv = cleaned.slice(-1);

  let sum = 0;
  let mul = 2;

  for (let i = body.length - 1; i >= 0; i--) {
    sum += parseInt(body[i]) * mul;
    mul = mul === 7 ? 2 : mul + 1;
  }

  const remainder = sum % 11;
  const expected = 11 - remainder;

  if (expected === 11) return dv === "0";
  if (expected === 10) return dv === "K";
  return dv === String(expected);
}

export function getRutError(rut: string): string | null {
  const cleaned = cleanRut(rut);
  if (cleaned.length === 0) return "El RUT es requerido";
  if (cleaned.length < 8) return "RUT demasiado corto";
  if (!/^\d{7,8}[0-9K]$/.test(cleaned)) return "Formato de RUT inválido";
  if (!validateRut(rut)) return "RUT inválido (dígito verificador incorrecto)";
  return null;
}
