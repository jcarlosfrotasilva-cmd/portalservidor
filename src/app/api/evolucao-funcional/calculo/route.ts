/**
 * API de cálculo inteligente de Evolução Funcional
 * Retorna a última evolução e calcula a próxima com interstício baseado no cargo.
 */
import { NextResponse } from 'next/server';
import { db } from '@/db';
import { evolucaoFuncional, servidores } from '@/db/schema';
import { eq, desc } from 'drizzle-orm';

// Regras de interstício em ANOS
const REGRAS_DOCENTE = [
  { de: 'I', para: 'II', anos: 4 },
  { de: 'II', para: 'III', anos: 4 },
  { de: 'III', para: 'IV', anos: 5 },
  { de: 'IV', para: 'V', anos: 5 },
  { de: 'V', para: 'VI', anos: 4 },
  { de: 'VI', para: 'VII', anos: 4 },
  { de: 'VII', para: 'VIII', anos: 4 },
];

const REGRAS_DIRETOR = [
  { de: 'I', para: 'II', anos: 4 },
  { de: 'II', para: 'III', anos: 5 },
  { de: 'III', para: 'IV', anos: 6 },
  { de: 'IV', para: 'V', anos: 6 },
  { de: 'V', para: 'VI', anos: 5 },
  { de: 'VI', para: 'VII', anos: 5 },
  { de: 'VII', para: 'VIII', anos: 4 },
];

const NIVEIS = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII'];
const ORDINAIS = ['1ª', '2ª', '3ª', '4ª', '5ª', '6ª', '7ª'];

function isDocente(cargo: string | null | undefined): boolean {
  if (!cargo) return false;
  const c = cargo.toUpperCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  return c.includes('PEB I') || c.includes('PEB II');
}

function isDiretor(cargo: string | null | undefined): boolean {
  if (!cargo) return false;
  const c = cargo.toUpperCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  return c.includes('DIRETOR');
}

function isElegivel(cargo: string | null | undefined, categoria: string | null | undefined): boolean {
  if (!isDocente(cargo) && !isDiretor(cargo)) return false;
  if (!categoria) return false;
  const cat = categoria.toUpperCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  return cat.includes('A-EFETIVO') || cat.includes('ACT-F') || cat.includes('AEFETIVO');
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const servidorId = searchParams.get('servidorId');

    if (!servidorId) {
      return NextResponse.json({ error: 'servidorId é obrigatório' }, { status: 400 });
    }

    // Buscar dados do servidor para verificar elegibilidade
    const servidorData = await db
      .select()
      .from(servidores)
      .where(eq(servidores.id, parseInt(servidorId)));

    if (servidorData.length === 0) {
      return NextResponse.json({ error: 'Servidor não encontrado' }, { status: 404 });
    }

    const servidor = servidorData[0];
    const elegivel = isElegivel(servidor.cargo, servidor.categoria);
    const docente = isDocente(servidor.cargo);
    const diretor = isDiretor(servidor.cargo);

    if (!elegivel) {
      return NextResponse.json({
        elegivel: false,
        motivo: `Cargo "${servidor.cargo}" ou categoria "${servidor.categoria}" não elegível. Apenas PEB I, PEB II e Diretor de Escola com categoria A-EFETIVO ou ACT-F têm direito.`,
      });
    }

    // Buscar todas as evoluções do servidor
    const allEvolucoes = await db
      .select()
      .from(evolucaoFuncional)
      .where(eq(evolucaoFuncional.servidorId, parseInt(servidorId)))
      .orderBy(desc(evolucaoFuncional.dataVigencia));

    const ultimaEvolucao = allEvolucoes[0] || null;
    const regras = docente ? REGRAS_DOCENTE : REGRAS_DIRETOR;
    const grupoLabel = docente ? 'DOCENTE (PEB I / PEB II)' : 'DIRETOR DE ESCOLA';

    // Determinar nível atual e próxima transição
    const nivelAtual = ultimaEvolucao
      ? ultimaEvolucao.nivelDestino
      : (servidor.nivel || 'I');

    const nivelIdx = NIVEIS.indexOf(nivelAtual);

    let proximoTipo = null;
    let proximaTransicao = null;
    let proximoIntersticio = null;
    let dataProximo = null;
    let descricaoProximo = null;

    if (nivelIdx >= 0 && nivelIdx < NIVEIS.length - 1) {
      // Há próxima evolução possível
      const proximaRegra = docente
        ? REGRAS_DOCENTE.find(r => r.de === nivelAtual)
        : REGRAS_DIRETOR.find(r => r.de === nivelAtual);

      if (proximaRegra) {
        const ordem = nivelIdx + 1; // 1-based: I→II = 1ª evolução
        proximoTipo = `${ORDINAIS[ordem - 1] || ordem + 'ª'} Evolução`;
        proximaTransicao = `${nivelAtual} → ${proximaRegra.para}`;
        proximoIntersticio = proximaRegra.anos;

        // Calcular data: última vigência + interstício em dias (anos * 365)
        if (ultimaEvolucao) {
          const dataVigencia = new Date(ultimaEvolucao.dataVigencia + 'T00:00:00');
          const proxima = new Date(dataVigencia);
          proxima.setDate(proxima.getDate() + (proximaRegra.anos * 365));
          dataProximo = proxima.toISOString().split('T')[0];
        }

        descricaoProximo = `${proximoTipo}: ${proximaTransicao} (interstício: ${proximaRegra.anos} anos)`;
      }
    }

    return NextResponse.json({
      elegivel: true,
      grupoLabel,
      regras,
      servidor: {
        nome: servidor.nome,
        cargo: servidor.cargo,
        categoria: servidor.categoria,
        nivelAtual,
      },
      ultimaEvolucao,
      todasEvolucoes: allEvolucoes,
      proximoTipo,
      proximaTransicao,
      proximoIntersticio,
      dataProximo,
      descricaoProximo,
      nivelAtual,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
