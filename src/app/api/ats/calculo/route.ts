/**
 * API de cálculo inteligente de ATS
 * Regra: data da vigência + 1 dia + 1824 dias = próximo ATS
 * Exemplo: vigência 11/04/2020 → começa contar em 12/04/2020 → +1824 dias → 10/04/2025
 */
import { NextResponse } from 'next/server';
import { db } from '@/db';
import { ats } from '@/db/schema';
import { eq, desc } from 'drizzle-orm';

function calcularProximaVigencia(dataVigencia: string): string {
  const data = new Date(dataVigencia + 'T00:00:00');
  data.setDate(data.getDate() + 1); // 1 dia após
  data.setDate(data.getDate() + 1824); // +1824 dias = total 1825 dias
  return data.toISOString().split('T')[0];
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const servidorId = searchParams.get('servidorId');

    if (!servidorId) {
      return NextResponse.json({ error: 'servidorId é obrigatório' }, { status: 400 });
    }

    const allAts = await db
      .select()
      .from(ats)
      .where(eq(ats.servidorId, parseInt(servidorId)))
      .orderBy(desc(ats.numeroQuinquenio));

    const ultimoAts = allAts[0] || null;

    let proximoQuinquenio = null;
    let dataProximoAts = null;
    let descricaoProximo = null;

    if (ultimoAts) {
      const proxQuinNum = ultimoAts.numeroQuinquenio + 1;
      if (proxQuinNum <= 10) {
        proximoQuinquenio = proxQuinNum;
        dataProximoAts = calcularProximaVigencia(ultimoAts.dataVigencia);
        const ordinais = ['', '1º', '2º', '3º', '4º', '5º', '6º', '7º', '8º', '9º', '10º'];
        descricaoProximo = `${ordinais[proxQuinNum]} Quinquênio`;
      }
    } else {
      proximoQuinquenio = 1;
      descricaoProximo = '1º Quinquênio';
    }

    return NextResponse.json({
      ultimoAts,
      proximoQuinquenio,
      dataProximoAts,
      descricaoProximo,
      todosAts: allAts,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
