import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { login, senha } = body;

    if (!login || !senha) {
      return NextResponse.json({ error: 'Login e senha são obrigatórios' }, { status: 400 });
    }

    // Credentials fixas para gestor
    if (login === 'GESTOR' && senha === 'gestor123') {
      return NextResponse.json({
        success: true,
        usuario: { login: 'GESTOR', nome: 'Administrador', perfil: 'gestor' }
      });
    }

    return NextResponse.json({ error: 'Login ou senha incorretos' }, { status: 401 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
