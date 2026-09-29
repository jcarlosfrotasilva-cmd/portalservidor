import { NextResponse } from 'next/server';
import { db } from '@/db';
import { servidores } from '@/db/schema';
import { ilike, or, and, eq } from 'drizzle-orm';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('q');
    const situacao = searchParams.get('situacao');

    const conditions: any[] = [];

    if (search) {
      conditions.push(
        or(
          ilike(servidores.nome, `%${search}%`),
          ilike(servidores.cpf, `%${search}%`),
          ilike(servidores.email, `%${search}%`),
          ilike(servidores.cargo, `%${search}%`),
          ilike(servidores.lotacao, `%${search}%`)
        )
      );
    }

    if (situacao) {
      conditions.push(eq(servidores.situacao, situacao));
    }

    const query = db.select().from(servidores).orderBy(servidores.nome);
    const data = conditions.length > 0 ? await query.where(and(...conditions)) : await query;

    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    // Senha: se não informada, tenta gerar a partir de dtnasc (DDMMAAAA), senão "123456"
    let senha = body.senha || '123456';
    if (!senha && body.dtnasc) {
      const [y, m, d] = body.dtnasc.split('-');
      senha = `${d.padStart(2, '0')}${m}${y.slice(2)}`;
    }

    const data = await db.insert(servidores).values({
      nome: body.nome,
      cpf: body.cpf,
      rgcin: body.rgcin || null,
      dtnasc: body.dtnasc || null,
      sexo: body.sexo || null,
      tel: body.tel || null,
      email: body.email || null,
      cargo: body.cargo || null,
      categoria: body.categoria || null,
      faixa: body.faixa || null,
      nivel: body.nivel || null,
      jornada: body.jornada || null,
      lotacao: body.lotacao || null,
      situacao: body.situacao || 'ATIVO',
      senha,
      dataAdmissao: body.dataAdmissao || new Date().toISOString().split('T')[0],
    }).returning();

    return NextResponse.json(data[0], { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
