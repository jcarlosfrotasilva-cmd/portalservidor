import { NextResponse } from 'next/server';
import { db } from '@/db';
import { licencaPremioCertidao, licencaPremioFruicao } from '@/db/schema';
import { eq } from 'drizzle-orm';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const certidaoId = searchParams.get('certidaoId');
    const servidorId = searchParams.get('servidorId');

    if (certidaoId) {
      const data = await db
        .select()
        .from(licencaPremioFruicao)
        .where(eq(licencaPremioFruicao.certidaoId, parseInt(certidaoId)))
        .orderBy(licencaPremioFruicao.createdAt);
      return NextResponse.json(data);
    }

    if (servidorId) {
      // Get all certidao IDs for this servidor, then get all fruiçoes
      const certidoes = await db
        .select()
        .from(licencaPremioCertidao)
        .where(eq(licencaPremioCertidao.servidorId, parseInt(servidorId)));
      const certidaoIds = certidoes.map(c => c.id);
      const allFruiçoes = await db.select().from(licencaPremioFruicao).orderBy(licencaPremioFruicao.createdAt);
      const data = allFruiçoes.filter(f => certidaoIds.includes(f.certidaoId));
      return NextResponse.json(data);
    }

    const data = await db.select().from(licencaPremioFruicao).orderBy(licencaPremioFruicao.createdAt);
    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const certidaoId = parseInt(body.certidaoId);
    const dias = parseInt(body.dias);

    // Validate dias
    if (isNaN(dias) || dias <= 0) {
      return NextResponse.json({ error: 'Dias inválidos' }, { status: 400 });
    }

    if (body.tipo === 'GOZO' && ![15, 30, 45, 60, 75, 90].includes(dias)) {
      return NextResponse.json({ error: 'Gozo deve ser: 15, 30, 45, 60, 75 ou 90 dias' }, { status: 400 });
    }

    if (body.tipo === 'PECUNIA' && dias !== 30) {
      return NextResponse.json({ error: 'Pecúnia deve ser 30 dias' }, { status: 400 });
    }

    // Check certidao balance
    const certidaoData = await db
      .select()
      .from(licencaPremioCertidao)
      .where(eq(licencaPremioCertidao.id, certidaoId));

    if (certidaoData.length === 0) {
      return NextResponse.json({ error: 'Certidão não encontrada' }, { status: 404 });
    }

    const certidao = certidaoData[0];
    const saldoDisponivel = (certidao.saldoTotal ?? 90) - (certidao.saldoUsado ?? 0);

    if (dias > saldoDisponivel) {
      return NextResponse.json({
        error: `Saldo insuficiente. Certidão possui ${saldoDisponivel} dias disponíveis e você solicitou ${dias} dias.`,
        saldoDisponivel,
        diasSolicitados: dias,
      }, { status: 400 });
    }

    // Create fruição and update saldo
    const data = await db
      .insert(licencaPremioFruicao)
      .values({
        certidaoId,
        tipo: body.tipo,
        dias,
        dataInicio: body.dataInicio || null,
        dataFinal: body.dataFinal || null,
        dataDoeAprovacao: body.dataDoeAprovacao || null,
        anoPecunia: body.anoPecunia ? parseInt(body.anoPecunia) : null,
        observacao: body.observacao || null,
        status: 'ATIVA',
      })
      .returning();

    // Update certidao saldo
    await db
      .update(licencaPremioCertidao)
      .set({
        saldoUsado: (certidao.saldoUsado ?? 0) + dias,
        updatedAt: new Date(),
      })
      .where(eq(licencaPremioCertidao.id, certidaoId));

    return NextResponse.json(data[0], { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
