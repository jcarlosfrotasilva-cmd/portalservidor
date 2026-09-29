import { NextResponse } from 'next/server';
import { db } from '@/db';
import { servidores } from '@/db/schema';
import { eq } from 'drizzle-orm';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const data = await db.select().from(servidores).where(eq(servidores.id, parseInt(id)));
    if (data.length === 0) {
      return NextResponse.json({ error: 'Servidor não encontrado' }, { status: 404 });
    }
    return NextResponse.json(data[0]);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const data = await db
      .update(servidores)
      .set({
        nome: body.nome,
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
        senha: body.senha || null,
        dataAdmissao: body.dataAdmissao || null,
        updatedAt: new Date(),
      })
      .where(eq(servidores.id, parseInt(id)))
      .returning();

    if (data.length === 0) {
      return NextResponse.json({ error: 'Servidor não encontrado' }, { status: 404 });
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
    await db.delete(servidores).where(eq(servidores.id, parseInt(id)));
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
