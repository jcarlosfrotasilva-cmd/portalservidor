import { db } from '@/db';
import { licencaPremioCertidao, servidores } from '@/db/schema';
import { eq } from 'drizzle-orm';

/**
 * Calcula a próxima certidão de licença prêmio com base na última concedida
 * Regra: período final + 1 dia + 1824 dias = próximo período aquisitivo
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const servidorId = searchParams.get('servidorId');

  if (!servidorId) {
    return Response.json({ error: 'servidorId é obrigatório' }, { status: 400 });
  }

  try {
    // Buscar todas as certidões do servidor ordenadas por período final (desc)
    const certidoes = await db
      .select()
      .from(licencaPremioCertidao)
      .where(eq(licencaPremioCertidao.servidorId, parseInt(servidorId)))
      .orderBy(licencaPremioCertidao.anoCertidao);

    if (certidoes.length === 0) {
      return Response.json({
        temProximaCertidao: false,
        mensagem: 'Nenhuma certidão encontrada para este servidor',
      });
    }

    // Pegar a última certidão (maior ano/período final)
    const ultimaCertidao = certidoes[certidoes.length - 1];

    // Calcular próximo período aquisitivo
    // Exemplo: período final 13/10/2022 → próximo início: 14/10/2022 → próximo fim: 13/10/2027
    const periodoFinal = new Date(ultimaCertidao.periodoFinal + 'T00:00:00');
    const proximoInicio = new Date(periodoFinal);
    proximoInicio.setDate(proximoInicio.getDate() + 1); // +1 dia

    const proximoFim = new Date(proximoInicio);
    proximoFim.setDate(proximoFim.getDate() + 1824); // +1824 dias = total 1825 dias

    // Calcular dias restantes até o vencimento (proximoFim)
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);
    const diasRestantes = Math.ceil((proximoFim.getTime() - hoje.getTime()) / (1000 * 60 * 60 * 24));

    // Status do vencimento
    let statusVencimento: string;
    if (diasRestantes < 0) {
      statusVencimento = 'VENCIDO';
    } else if (diasRestantes <= 90) {
      statusVencimento = 'VENCENDO_EM_BREVE';
    } else {
      statusVencimento = 'EM_ANDAMENTO';
    }

    // Buscar informações completas do servidor
    const servidorInfoResult = await db
      .select()
      .from(servidores)
      .where(eq(servidores.id, parseInt(servidorId)))
      .limit(1);
    const servidorInfo = servidorInfoResult[0];

    return Response.json({
      elegivel: true,
      nome: servidorInfo?.nome || '',
      cargo: servidorInfo?.cargo || '',
      categoria: servidorInfo?.categoria || '',
      certidoes,
      totalCertidoes: certidoes.length,
      totalPotencial: certidoes.length * 90,
      totalUsado: certidoes.reduce((sum, c) => sum + (c.saldoUsado || 0), 0),
      totalSaldo: certidoes.reduce((sum, c) => sum + ((c.saldoTotal || 90) - (c.saldoUsado || 0)), 0),
      temProximaCertidao: true,
      ultimaCertidao: {
        numero: ultimaCertidao.numeroCertidao,
        ano: ultimaCertidao.anoCertidao,
        periodoInicial: ultimaCertidao.periodoInicial,
        periodoFinal: ultimaCertidao.periodoFinal,
      },
      proximaCertidao: {
        periodoInicial: proximoInicio.toISOString().split('T')[0],
        periodoFinal: proximoFim.toISOString().split('T')[0],
        diasRestantes,
        statusVencimento,
        numero: parseInt(ultimaCertidao.numeroCertidao) + 1,
        ano: new Date(proximoFim).getFullYear(),
      },
    });
  } catch (error) {
    console.error('Erro ao calcular próxima certidão:', error);
    return Response.json({ error: 'Erro ao calcular próxima certidão' }, { status: 500 });
  }
}
