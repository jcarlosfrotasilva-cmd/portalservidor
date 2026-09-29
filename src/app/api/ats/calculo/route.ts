/**
 * API de cálculo inteligente de ATS
 * Retorna o último ATS do servidor e calcula o próximo quinquênio
 * Fórmula: Último ATS data da vigência + 1825 dias = próximo ATS
 */
import { NextResponse } from 'next/server';
import { db } from '@/db';
import { ats } from '@/db/schema';
import { eq, desc } from 'drizzle-orm';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const servidorId = searchParams.get('servidorId');

    if (!servidorId) {
      return NextResponse.json({ error: 'servidorId é obrigatório' }, { status: 400 });
    }

    // Buscar todos os ATS do servidor ordenados por número
    const allAts = await db
      .select()
      .from(ats)
      .where(eq(ats.servidorId, parseInt(servidorId)))
      .orderBy(desc(ats.numeroQuinquenio));

    const ultimoAts = allAts[0] || null;

    // Calcular próximo quinquênio
    let proximoQuinquenio = null;
    let dataProximoAts = null;
    let descricaoProximo = null;

    if (ultimoAts) {
      const proxQuinNum = ultimoAts.numeroQuinquenio + 1;

      if (proxQuinNum <= 10) {
        proximoQuinquenio = proxQuinNum;

        // Calcular data: dataVigencia + 1825 dias
        const dataVigencia = new Date(ultimoAts.dataVigencia + 'T00:00:00');
        const proximaData = new Date(dataVigencia);
        proximaData.setDate(proximaData.getDate() + 1825);
        dataProximoAts = proximaData.toISOString().split('T')[0];

        const ordinais = ['', '1º', '2º', '3º', '4º', '5º', '6º', '7º', '8º', '9º', '10º'];
        descricaoProximo = `${ordinais[proxQuinNum]} Quinquênio`;
      }
    } else {
      // Sem ATS cadastrado - próximo seria o 1º
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
