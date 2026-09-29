import { NextResponse } from 'next/server';
import { db } from '@/db';
import { licencaPremioCertidao, licencaPremioFruicao } from '@/db/schema';
import { eq } from 'drizzle-orm';

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const dias = parseInt(body.dias);

    // Get existing to compare saldo
    const existing = await db
      .select()
      .from(licencaPremioFruicao)
      .where(eq(licencaPremioFruicao.id, parseInt(id)));

    if (existing.length === 0) {
      return NextResponse.json({ error: 'Fruição não encontrada' }, { status: 404 });
    }

    const oldDias = existing[0].dias ?? 0;

    const data = await db
      .update(licencaPremioFruicao)
      .set({
        tipo: body.tipo,
        dias,
        dataInicio: body.dataInicio || null,
        dataFinal: body.dataFinal || null,
        dataDoeAprovacao: body.dataDoeAprovacao || null,
        anoPecunia: body.anoPecunia ? parseInt(body.anoPecunia) : null,
        observacao: body.observacao || null,
        status: body.status || 'ATIVA',
      })
      .where(eq(licencaPremioFruicao.id, parseInt(id)))
      .returning();

    // Update certidao saldo
    const certidao = await db
      .select()
      .from(licencaPremioCertidao)
      .where(eq(licencaPremioCertidao.id, existing[0].certidaoId));

    if (certidao.length > 0) {
      const diff = dias - oldDias;
      await db
        .update(licencaPremioCertidao)
        .set({
          saldoUsado: Math.max(0, (certidao[0].saldoUsado ?? 0) + diff),
          updatedAt: new Date(),
        })
        .where(eq(licencaPremioCertidao.id, existing[0].certidaoId));
    }

    return NextResponse.json(data[0]);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    // Get existing to know which certidao to update
    const existing = await db
      .select()
      .from(licencaPremioFruicao)
      .where(eq(licencaPremioFruicao.id, parseInt(id)));

    if (existing.length === 0) {
      return NextResponse.json({ error: 'Fruição não encontrada' }, { status: 404 });
    }

    await db.delete(licencaPremioFruicao).where(eq(licencaPremioFruicao.id, parseInt(id)));

    // Revert certidao saldo
    const certidao = await db
      .select()
      .from(licencaPremioCertidao)
      .where(eq(licencaPremioCertidao.id, existing[0].certidaoId));

    if (certidao.length > 0) {
      await db
        .update(licencaPremioCertidao)
        .set({
          saldoUsado: Math.max(0, (certidao[0].saldoUsado ?? 0) - (existing[0].dias ?? 0)),
          updatedAt: new Date(),
        })
        .where(eq(licencaPremioCertidao.id, existing[0].certidaoId));
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
