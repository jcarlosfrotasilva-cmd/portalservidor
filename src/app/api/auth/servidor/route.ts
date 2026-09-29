import { NextResponse } from 'next/server';
import { db } from '@/db';
import { servidores } from '@/db/schema';
import { eq } from 'drizzle-orm';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { cpf, senha } = body;

    if (!cpf || !senha) {
      return NextResponse.json({ error: 'CPF e senha são obrigatórios' }, { status: 400 });
    }

    const cpfClean = cpf.replace(/[^\d]/g, '').substring(0, 11);

    // Buscar servidor por CPF
    const servers = await db.select().from(servidores).where(eq(servidores.cpf, cpfClean));

    if (servers.length === 0) {
      return NextResponse.json({ error: 'CPF ou senha incorretos' }, { status: 401 });
    }

    const servidor = servers[0];

    // Tentar autenticação:
    // 1. Senha armazenada diretamente
    // 2. Data de nascimento formatada DDMMAAAA
    let senhaCorreta = false;

    if (servidor.senha) {
      senhaCorreta = servidor.senha === senha;
    }

    // Se não bateu com a senha e tem data de nascimento, tenta DDMMAAAA
    if (!senhaCorreta && servidor.dtnasc) {
      const [y, m, d] = servidor.dtnasc.split('-');
      const senhaDtnasc = `${d}${m}${y.slice(2)}`;
      if (senhaDtnasc === senha) {
        senhaCorreta = true;
      }
    }

    // Também tenta o formato AAAAMMDD
    if (!senhaCorreta && servidor.dtnasc) {
      const senhaISO = servidor.dtnasc.replace(/-/g, '');
      if (senhaISO === senha) {
        senhaCorreta = true;
      }
    }

    // Também tenta DDMMAAAA com zeros
    if (!senhaCorreta && servidor.dtnasc) {
      const parts = servidor.dtnasc.split('-');
      const d = parts[2].padStart(2, '0');
      const m = parts[1].padStart(2, '0');
      const y = parts[0];
      const senhaDDMMYYYY = `${d}${m}${y}`;
      if (senhaDDMMYYYY === senha) {
        senhaCorreta = true;
      }
    }

    if (!senhaCorreta) {
      return NextResponse.json({ error: 'CPF ou senha incorretos' }, { status: 401 });
    }

    return NextResponse.json({
      success: true,
      servidor: {
        id: servidor.id,
        nome: servidor.nome,
        cpf: servidor.cpf,
        cargo: servidor.cargo,
        categoria: servidor.categoria,
        situacao: servidor.situacao,
      }
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
