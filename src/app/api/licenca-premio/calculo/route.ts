import { NextResponse } from 'next/server';
import { db } from '@/db';
import { licencaPremioCertidao, servidores } from '@/db/schema';
import { eq } from 'drizzle-orm';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const servidorId = searchParams.get('servidorId');

    if (!servidorId) {
      return NextResponse.json({ error: 'servidorId é obrigatório' }, { status: 400 });
    }

    // Check elegibilidade
    const servidorData = await db
      .select()
      .from(servidores)
      .where(eq(servidores.id, parseInt(servidorId)));

    if (servidorData.length === 0) {
      return NextResponse.json({ error: 'Servidor não encontrado' }, { status: 404 });
    }

    const categoria = (servidorData[0].categoria || '').toUpperCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    const elegivel = categoria.includes('A-EFETIVO') || categoria.includes('ACT-F') || categoria.includes('AEFETIVO');

    const certidoes = await db
      .select()
      .from(licencaPremioCertidao)
      .where(eq(licencaPremioCertidao.servidorId, parseInt(servidorId)))
      .orderBy(licencaPremioCertidao.anoCertidao);

    const totalCertidoes = certidoes.length;
    const totalSaldo = certidoes.reduce((acc, c) => acc + ((c.saldoTotal ?? 90) - (c.saldoUsado ?? 0)), 0);
    const totalUsado = certidoes.reduce((acc, c) => acc + (c.saldoUsado ?? 0), 0);
    const totalPotencial = totalCertidoes * 90;

    return NextResponse.json({
      elegivel,
      nome: servidorData[0].nome,
      cargo: servidorData[0].cargo,
      categoria: servidorData[0].categoria,
      certidoes,
      totalCertidoes,
      totalPotencial,
      totalUsado,
      totalSaldo,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
