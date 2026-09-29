import { db } from '@/db';
import { licencaPremioCertidao, servidores } from '@/db/schema';
import { eq, desc } from 'drizzle-orm';

/**
 * Lista todos os servidores com status de vencimento de licença prêmio
 * Para o gestor ver quais estão vencidas ou vencendo em breve
 */
export async function GET() {
  try {
    // Buscar todas as certidões agrupadas por servidor
    const todasCertidoes = await db
      .select()
      .from(licencaPremioCertidao)
      .orderBy(licencaPremioCertidao.servidorId, licencaPremioCertidao.anoCertidao);

    // Buscar todos os servidores
    const todosServidores = await db
      .select()
      .from(servidores)
      .where(eq(servidores.situacao, 'ATIVO'));

    // Agrupar certidões por servidor
    const certidoesPorServidor = new Map<number, any[]>();
    todasCertidoes.forEach(cert => {
      if (!certidoesPorServidor.has(cert.servidorId)) {
        certidoesPorServidor.set(cert.servidorId, []);
      }
      certidoesPorServidor.get(cert.servidorId)!.push(cert);
    });

    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);

    // Calcular status para cada servidor
    const statusServidores = todosServidores.map(servidor => {
      const certidoes = certidoesPorServidor.get(servidor.id) || [];

      if (certidoes.length === 0) {
        return {
          servidorId: servidor.id,
          nome: servidor.nome,
          cargo: servidor.cargo,
          totalCertidoes: 0,
          status: 'SEM_CERTIDAO',
          mensagem: 'Sem certidões cadastradas',
          proximoVencimento: null,
          diasRestantes: null,
        };
      }

      // Pegar a última certidão
      const ultimaCertidao = certidoes[certidoes.length - 1];

      // Calcular próximo período
      const periodoFinal = new Date(ultimaCertidao.periodoFinal + 'T00:00:00');
      const proximoInicio = new Date(periodoFinal);
      proximoInicio.setDate(proximoInicio.getDate() + 1);

      const proximoFim = new Date(proximoInicio);
      proximoFim.setDate(proximoFim.getDate() + 1824);

      const diasRestantes = Math.ceil((proximoFim.getTime() - hoje.getTime()) / (1000 * 60 * 60 * 24));

      let status: string;
      let mensagem: string;

      if (diasRestantes < 0) {
        status = 'VENCIDO';
        mensagem = `Vencido há ${Math.abs(diasRestantes)} dias`;
      } else if (diasRestantes <= 90) {
        status = 'VENCENDO_EM_BREVE';
        mensagem = `Vence em ${diasRestantes} dias`;
      } else if (diasRestantes <= 365) {
        status = 'VENCENDO_ESTE_ANO';
        mensagem = `Vence em ${diasRestantes} dias`;
      } else {
        status = 'EM_ANDAMENTO';
        mensagem = `Vence em ${diasRestantes} dias`;
      }

      return {
        servidorId: servidor.id,
        nome: servidor.nome,
        cargo: servidor.cargo,
        totalCertidoes: certidoes.length,
        status,
        mensagem,
        proximoVencimento: proximoFim.toISOString().split('T')[0],
        diasRestantes,
      };
    });

    // Ordenar por status (vencidos primeiro, depois vencendo em breve, etc.)
    const ordemStatus = ['VENCIDO', 'VENCENDO_EM_BREVE', 'VENCENDO_ESTE_ANO', 'EM_ANDAMENTO', 'SEM_CERTIDAO'];
    statusServidores.sort((a, b) => {
      const idxA = ordemStatus.indexOf(a.status);
      const idxB = ordemStatus.indexOf(b.status);
      if (idxA !== idxB) return idxA - idxB;
      // Se mesmo status, ordenar por dias restantes
      if (a.diasRestantes !== null && b.diasRestantes !== null) {
        return a.diasRestantes - b.diasRestantes;
      }
      return 0;
    });

    // Calcular totais
    const totais = {
      total: statusServidores.length,
      vencidos: statusServidores.filter(s => s.status === 'VENCIDO').length,
      vencendoEmBreve: statusServidores.filter(s => s.status === 'VENCENDO_EM_BREVE').length,
      vencendoEsteAno: statusServidores.filter(s => s.status === 'VENCENDO_ESTE_ANO').length,
      emAndamento: statusServidores.filter(s => s.status === 'EM_ANDAMENTO').length,
      semCertidao: statusServidores.filter(s => s.status === 'SEM_CERTIDAO').length,
    };

    return Response.json({
      servidores: statusServidores,
      totais,
    });
  } catch (error) {
    console.error('Erro ao listar status de licença prêmio:', error);
    return Response.json({ error: 'Erro ao listar status' }, { status: 500 });
  }
}
