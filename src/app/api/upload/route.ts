import { NextResponse } from 'next/server';
import { db } from '@/db';
import { servidores } from '@/db/schema';
import * as XLSX from 'xlsx';
import { eq } from 'drizzle-orm';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: 'Nenhum arquivo enviado' }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const workbook = XLSX.read(Buffer.from(arrayBuffer), { type: 'buffer', cellDates: true });
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const rawData = XLSX.utils.sheet_to_json<any>(sheet, { defval: '' });

    if (rawData.length === 0) {
      return NextResponse.json({ error: 'Planilha vazia' }, { status: 400 });
    }

    const normalize = (name: string): string => {
      return name.toString().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]/g, '');
    };

    const rowResults: Array<{ success: boolean; row: number; message: string }> = [];
    const created = [];
    const updated = [];
    const errors = [];

    for (let i = 0; i < rawData.length; i++) {
      const row = rawData[i];
      const rowNum = i + 2;

      try {
        const colMap: Record<string, string> = {};
        for (const key of Object.keys(row)) {
          colMap[normalize(key)] = key;
        }

        const getVal = (keys: string[]): string | null => {
          for (const k of keys) {
            const mappedKey = colMap[k];
            if (mappedKey && row[mappedKey] !== undefined && row[mappedKey] !== '' && row[mappedKey] !== null) {
              let val = String(row[mappedKey]).trim();
              if (val) return val;
            }
          }
          return null;
        };

        const nome = getVal(['nome', 'nomeservidor', 'servidor', 'nomecompleto']);
        const cpf = getVal(['cpf', 'cpfcnpj', 'cpfdo']);
        const rgcin = getVal(['rgcin', 'rgcinrj', 'rgc']);
        const dtnascRaw = getVal(['dtnasc', 'datadenascimento', 'nascimento', 'datanascimento']);
        const sexo = getVal(['sexo', 'genero']);
        const tel = getVal(['tel', 'telefone', 'contato', 'fone']);
        const email = getVal(['email', 'e-mail', 'e mail', 'correoeletronico']);
        const cargo = getVal(['cargo', 'funcao', 'cargofuncao']);
        const categoria = getVal(['categoria', 'cat', 'classe']);
        const faixa = getVal(['faixa', 'f']);
        const nivel = getVal(['nivel', 'niv']);
        const jornada = getVal(['jornada', 'horas', 'carga horaria']);
        const lotacao = getVal(['lotacao', 'unidade', 'escola', 'unidade escolar']);
        const situacaoRaw = getVal(['situacao', 'status', 'condicao']);
        const senhaRaw = getVal(['senha', 'password', 'senhado servidor']);

        if (!nome || !cpf) {
          rowResults.push({ success: false, row: rowNum, message: 'Campos obrigatórios: nome e CPF' });
          errors.push(rowNum);
          continue;
        }

        // Smart date parsing
        const parseDate = (raw: string | null): string | null => {
          if (!raw) return null;
          if (!isNaN(Number(raw))) {
            const date = XLSX.SSF.parse_date_code(Number(raw));
            if (date) return `${date.y}-${String(date.m).padStart(2, '0')}-${String(date.d).padStart(2, '0')}`;
          }
          const parts = raw.split(/[\/\-\.]/);
          if (parts.length === 3) {
            const d = parts[0].padStart(2, '0');
            const m = parts[1].padStart(2, '0');
            const y = parts[2].length === 2 ? `20${parts[2]}` : parts[2];
            return `${y}-${m}-${d}`;
          }
          if (raw.match(/^\d{4}-\d{2}-\d{2}/)) return raw.substring(0, 10);
          return null;
        };

        const dtnasc = parseDate(dtnascRaw);

        // CPF normalization
        const cpfClean = cpf.replace(/[^\d]/g, '').substring(0, 11);

        // Senha: usar dtnasc formatada DDMMAAAA se disponível, senão usar a senhaRaw, senão "123456"
        let senha: string = '123456';
        if (senhaRaw) {
          senha = senhaRaw;
        } else if (dtnasc) {
          const [y, m, d] = dtnasc.split('-');
          senha = `${d}${m}${y.slice(2)}`; // DDMMAAAA
        }

        const situacao = situacaoRaw
          ? situacaoRaw.toUpperCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').substring(0, 20)
          : 'ATIVO';
        const sexoNorm = sexo ? sexo.toUpperCase().substring(0, 1) : null;

        const serverData = {
          nome, cpf: cpfClean, rgcin, dtnasc, sexo: sexoNorm, tel, email,
          cargo, categoria, faixa, nivel, jornada, lotacao, situacao, senha,
        };

        const existing = await db.select({ id: servidores.id }).from(servidores).where(eq(servidores.cpf, cpfClean));

        if (existing.length > 0) {
          await db.update(servidores).set({ ...serverData, updatedAt: new Date() }).where(eq(servidores.id, existing[0].id));
          rowResults.push({ success: true, row: rowNum, message: 'Atualizado' });
          updated.push(rowNum);
        } else {
          await db.insert(servidores).values({
            ...serverData, dataAdmissao: new Date().toISOString().split('T')[0],
          });
          rowResults.push({ success: true, row: rowNum, message: 'Criado' });
          created.push(rowNum);
        }
      } catch (err: any) {
        rowResults.push({ success: false, row: rowNum, message: err.message });
        errors.push(rowNum);
      }
    }

    return NextResponse.json({
      total: rawData.length,
      created: created.length,
      updated: updated.length,
      errors: errors.length,
      details: rowResults,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
