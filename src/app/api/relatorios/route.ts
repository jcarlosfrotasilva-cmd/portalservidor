import { NextResponse } from 'next/server';
import { db } from '@/db';
import { servidores, orientacaoEausencia } from '@/db/schema';
import { asc, eq, or } from 'drizzle-orm';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const tipo = searchParams.get('tipo') || 'geral';

    switch (tipo) {
      case 'geral': {
        const data = await db.select().from(servidores).orderBy(asc(servidores.nome));
        return NextResponse.json(data);
      }
      case 'por-cargo': {
        const data = await db.select().from(servidores).orderBy(asc(servidores.cargo), asc(servidores.nome));
        return NextResponse.json(data);
      }
      case 'por-categoria': {
        const data = await db.select().from(servidores).orderBy(asc(servidores.categoria), asc(servidores.nome));
        return NextResponse.json(data);
      }
      case 'efetivo-act': {
        const all = await db.select().from(servidores).orderBy(asc(servidores.nome));
        const data = all.filter(s => {
          const cat = (s.categoria || '').toUpperCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
          return cat.includes('A-EFETIVO') || cat.includes('ACT-F') || cat.includes('AEFETIVO');
        });
        return NextResponse.json(data);
      }
      case 'ot-ausencia-mensal': {
        const mes = searchParams.get('mes') || new Date().toISOString().slice(0, 7); // YYYY-MM

        const allRegistros = await db.select().from(orientacaoEausencia).orderBy(asc(orientacaoEausencia.data));
        const mesRegistros = allRegistros.filter(r => {
          if (!r.data) return false;
          return r.data.startsWith(mes);
        });

        // Get all unique servidor IDs
        const servidorIds = [...new Set(mesRegistros.map(r => r.servidorId))];
        let servidoresData: any[] = [];
        if (servidorIds.length > 0) {
          servidoresData = await db
            .select({ id: servidores.id, nome: servidores.nome, cargo: servidores.cargo, categoria: servidores.categoria })
            .from(servidores)
            .where(or(...servidorIds.map(id => eq(servidores.id, id))));
        }
        const servidorMap: Record<number, any> = {};
        servidoresData.forEach(s => { servidorMap[s.id] = s; });

        // Agrupar por servidor com resumo + detalhes
        const porServidor: Record<string, any> = {};
        for (const reg of mesRegistros) {
          const key = reg.servidorId;
          if (!porServidor[key]) {
            porServidor[key] = {
              servidorId: reg.servidorId,
              nomeServidor: servidorMap[reg.servidorId]?.nome || 'Desconhecido',
              cargo: servidorMap[reg.servidorId]?.cargo || '',
              categoria: servidorMap[reg.servidorId]?.categoria || '',
              ot: 0,
              ausencia: 0,
              registros: [],
            };
          }
          // Verifica se é O.T. (compatível com registros antigos tipo='OT' e novos subtipo='ORIENTACAO_TECNICA')
          if (reg.tipo === 'OT' || reg.subtipo === 'ORIENTACAO_TECNICA') porServidor[key].ot++;
          else porServidor[key].ausencia++;
          porServidor[key].registros.push(reg);
        }

        // Ordenar servidores alfabeticamente
        const porServidorArray = Object.values(porServidor)
          .sort((a, b) => a.nomeServidor.localeCompare(b.nomeServidor))
          .map(s => ({ ...s, total: s.ot + s.ausencia }));

        const totalGeral = mesRegistros.length;

        return NextResponse.json({
          mes,
          total: totalGeral,
          porServidor: porServidorArray,
        });
      }
      default:
        return NextResponse.json({ error: 'Tipo inválido' }, { status: 400 });
    }
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
