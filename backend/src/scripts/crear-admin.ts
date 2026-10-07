/**
 * Crea una cuenta ADMIN. El rol ADMIN nunca se puede pedir desde el registro público,
 * así que se crea con este script, ejecutado a mano por quien administra el servidor.
 *
 * Uso:  pnpm crear-admin correo@dominio.com "UnaClaveLarga#2026"
 */
import { randomUUID } from 'node:crypto';
import type { RowDataPacket } from 'mysql2/promise';
import { z } from 'zod';
import { pool } from '../database/pool.js';
import { withTransaction } from '../database/transaction.js';
import { asignarRol, insertarUsuario } from '../modules/auth/auth.repository.js';
import { hashPassword } from '../shared/utils/password.js';

const argumentos = z.object({
  email: z.string().trim().toLowerCase().pipe(z.email()),
  password: z.string().min(12, 'La contraseña de un administrador debe tener al menos 12 caracteres'),
});

async function main(): Promise<void> {
  const [email, password] = process.argv.slice(2);
  const datos = argumentos.safeParse({ email, password });
  if (!datos.success) {
    console.error('Uso: pnpm crear-admin correo@dominio.com "UnaClaveLarga#2026"');
    for (const problema of datos.error.issues) console.error(`  - ${problema.path.join('.')}: ${problema.message}`);
    process.exitCode = 1;
    return;
  }

  const [paises] = await pool.execute<(RowDataPacket & { id: number })[]>(
    'SELECT id FROM paises ORDER BY id LIMIT 1',
  );
  if (!paises[0]) throw new Error('La tabla paises está vacía');

  const id = randomUUID();
  const passwordHash = await hashPassword(datos.data.password);

  await withTransaction(async (conn) => {
    await insertarUsuario(conn, {
      id,
      nombre: 'Administrador',
      apellido: 'FutureStar',
      email: datos.data.email,
      passwordHash,
      telefono: null,
      fechaNacimiento: '1990-01-01', // dato de relleno: no es una persona real
      paisId: paises[0]!.id,
      ciudad: null,
    });
    await asignarRol(conn, id, 'ADMIN');
    await conn.execute(
      "UPDATE usuarios SET estado = 'ACTIVO', email_verificado = TRUE WHERE id = :id",
      { id },
    );
  });

  console.log(`Administrador creado: ${datos.data.email} (id ${id})`);
}

main()
  .catch((error: unknown) => {
    const errno = (error as { errno?: number }).errno;
    console.error(errno === 1062 ? 'Ese correo ya existe.' : 'No se pudo crear el administrador:');
    if (errno !== 1062) console.error(error);
    process.exitCode = 1;
  })
  .finally(() => pool.end());