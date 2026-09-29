import { NextResponse } from 'next/server';
import { db } from '@/db';
import { servidores } from '@/db/schema';
import { count, eq, and } from 'drizzle-orm';

export async function GET() {
  try {
    const totalServidores = await db.select({ count: count() }).from(servidores);
    const ativos = await db.select({ count: count() }).from(servidores)
      .where(eq(servidores.situacao, 'ATIVO'));

    // Totais por cargo (apenas ativos)
    const porCargoRaw = await db
      .select({ cargo: servidores.cargo, count: count() })
      .from(servidores)
      .where(eq(servidores.situacao, 'ATIVO'))
      .groupBy(servidores.cargo);

    const porCargo = porCargoRaw
      .filter(r => r.cargo)
      .sort((a, b) => (a.cargo || '').localeCompare(b.cargo || ''));

    // Totais por categoria (apenas ativos)
    const porCategoriaRaw = await db
      .select({ categoria: servidores.categoria, count: count() })
      .from(servidores)
      .where(eq(servidores.situacao, 'ATIVO'))
      .groupBy(servidores.categoria);

    const porCategoria = porCategoriaRaw
      .filter(r => r.categoria)
      .sort((a, b) => (a.categoria || '').localeCompare(b.categoria || ''));

    // A-Efetivo e ACT-F (apenas ativos)
    const aEfetivoRaw = await db
      .select({ count: count() })
      .from(servidores)
      .where(and(
        eq(servidores.situacao, 'ATIVO'),
        eq(servidores.categoria, 'A-EFETIVO')
      ));

    const actFRaw = await db
      .select({ count: count() })
      .from(servidores)
      .where(and(
        eq(servidores.situacao, 'ATIVO'),
        eq(servidores.categoria, 'ACT-F')
      ));

    const totalAts = await db.select({ count: count() }).from(servidores);

    return NextResponse.json({
      totalServidores: totalServidores[0].count,
      servidoresAtivos: ativos[0].count,
      porCargo,
      porCategoria,
      aEfetivo: aEfetivoRaw[0].count,
      actF: actFRaw[0].count,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
