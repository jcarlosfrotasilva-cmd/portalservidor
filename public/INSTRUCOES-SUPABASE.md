# ============================================================
# INSTRUÇÕES PARA MIGRAR PARA SUPABASE
# ============================================================
# 
# O sistema NÃO está configurado para Supabase neste momento.
# Atualmente usa PostgreSQL local (127.0.0.1:5432).
#
# PARA ATIVAR O SUPABASE:
#
# 1. Acesse https://supabase.com e crie um projeto
# 2. Vá em Project Settings > API e copie a "Project URL" e "anon public key"
# 3. Vá em Database > Connection string e copie a string no formato "URI"
#
# 4. Substitua o conteúdo do arquivo .env por:
#
#    DATABASE_URL=postgresql://postgres.<SEU_PROJETO>.pooler.supabase.com:6543/postgres?user=postgres.<SEU_PROJETO>&password=SUA_SENHA_SUPABASE
#    NEXT_PUBLIC_SUPABASE_URL=https://<SEU_PROJETO>.supabase.co
#    NEXT_PUBLIC_SUPABASE_ANON_KEY=sua_chave_anon_aqui
#
# 5. No SQL Editor do Supabase, execute o arquivo:
#    public/estrutura-supabase.sql
#
# 6. Importe seus dados (via upload Excel no próprio sistema)
#
# O código já usa Drizzle ORM com PostgreSQL, funciona identicamente
# com Supabase pois ele é compatível 100% com PostgreSQL.
#
# ============================================================
