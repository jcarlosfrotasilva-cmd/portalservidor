import { NextResponse } from 'next/server';
import { db } from '@/db';
import { orientacaoEausencia } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { count } from 'drizzle-orm';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const servidorId = searchParams.get('servidorId');

    if (!servidorId) {
      return NextResponse.json({ error: 'servidorId é obrigatório' }, { status: 400 });
    }

    const ots = await db.select({ count: count() }).from(orientacaoEausencia)
      .where(eq(orientacaoEausencia.servidorId, parseInt(servidorId)));
    const ausencias = await db.select({ count: count() }).from(orientacaoEausencia)
      .where(eq(orientacaoEausencia.servidorId, parseInt(servidorId)));

    return NextResponse.json({
      totalOT: ots[0]?.count || 0,
      totalAusencias: ausencias[0]?.count || 0,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
