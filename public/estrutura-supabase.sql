-- ============================================================
-- PORTAL DO SERVIDOR - EE PROFª MARLENE FRATTINI
-- Estrutura SQL para Supabase (PostgreSQL)
-- ============================================================

-- Tabela: Servidores
CREATE TABLE IF NOT EXISTS servidores (
  id SERIAL PRIMARY KEY,
  nome VARCHAR(200) NOT NULL,
  cpf VARCHAR(14) NOT NULL UNIQUE,
  rgcin VARCHAR(50),
  dtnasc DATE,
  sexo VARCHAR(1),
  tel VARCHAR(20),
  email VARCHAR(150),
  cargo VARCHAR(100),
  categoria VARCHAR(100),
  faixa VARCHAR(50),
  nivel VARCHAR(50),
  jornada VARCHAR(50),
  lotacao VARCHAR(200),
  situacao VARCHAR(50) DEFAULT 'ATIVO',
  senha VARCHAR(255),
  data_admissao DATE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Tabela: ATS (Adicional por Tempo de Serviço)
CREATE TABLE IF NOT EXISTS ats (
  id SERIAL PRIMARY KEY,
  servidor_id INTEGER NOT NULL REFERENCES servidores(id) ON DELETE CASCADE,
  numero_quinquenio INTEGER NOT NULL,
  tipo_descricao VARCHAR(100) NOT NULL,
  data_vigencia DATE NOT NULL,
  data_doe DATE,
  valor DECIMAL(10, 2),
  proxima_vigencia DATE,
  observacao TEXT,
  status VARCHAR(20) DEFAULT 'ATIVO',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Tabela: Evolução Funcional
CREATE TABLE IF NOT EXISTS evolucao_funcional (
  id SERIAL PRIMARY KEY,
  servidor_id INTEGER NOT NULL REFERENCES servidores(id) ON DELETE CASCADE,
  tipo VARCHAR(100) NOT NULL,
  transicao VARCHAR(20) NOT NULL,
  nivel_origem VARCHAR(5) NOT NULL,
  nivel_destino VARCHAR(5) NOT NULL,
  intersticio_anos INTEGER NOT NULL,
  data_vigencia DATE NOT NULL,
  data_doe DATE,
  observacao TEXT,
  status VARCHAR(20) DEFAULT 'ATIVO',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Tabela: Licença Prêmio - Certidões
CREATE TABLE IF NOT EXISTS licenca_premio_certidao (
  id SERIAL PRIMARY KEY,
  servidor_id INTEGER NOT NULL REFERENCES servidores(id) ON DELETE CASCADE,
  numero_certidao VARCHAR(50) NOT NULL,
  ano_certidao INTEGER NOT NULL,
  periodo_inicial DATE NOT NULL,
  periodo_final DATE NOT NULL,
  data_doe DATE,
  saldo_total INTEGER DEFAULT 90,
  saldo_usado INTEGER DEFAULT 0,
  status VARCHAR(20) DEFAULT 'ATIVA',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Tabela: Licença Prêmio - Fruições
CREATE TABLE IF NOT EXISTS licenca_premio_fruicao (
  id SERIAL PRIMARY KEY,
  certidao_id INTEGER NOT NULL REFERENCES licenca_premio_certidao(id) ON DELETE CASCADE,
  tipo VARCHAR(20) NOT NULL,
  dias INTEGER NOT NULL,
  data_inicio DATE,
  data_final DATE,
  data_doe_aprovacao DATE,
  ano_pecunia INTEGER,
  observacao TEXT,
  status VARCHAR(20) DEFAULT 'ATIVA',
  created_at TIMESTAMP DEFAULT NOW()
);

-- Tabela: Orientação Técnica e Ausência
CREATE TABLE IF NOT EXISTS orientacao_ausencia (
  id SERIAL PRIMARY KEY,
  servidor_id INTEGER NOT NULL REFERENCES servidores(id) ON DELETE CASCADE,
  tipo VARCHAR(20) NOT NULL,
  subtipo VARCHAR(50),
  data DATE NOT NULL,
  data_inicio DATE,
  data_fim DATE,
  quantidade_dias INTEGER,
  quantidade_horas INTEGER,
  assunto VARCHAR(300),
  local VARCHAR(200),
  hora_inicio VARCHAR(5),
  hora_termino VARCHAR(5),
  data_doe_ou_email VARCHAR(100),
  observacao TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Tabela: Histórico Funcional
CREATE TABLE IF NOT EXISTS historico_funcional (
  id SERIAL PRIMARY KEY,
  servidor_id INTEGER NOT NULL REFERENCES servidores(id) ON DELETE CASCADE,
  tipo VARCHAR(100) NOT NULL,
  descricao TEXT NOT NULL,
  data DATE NOT NULL,
  documento_referencia VARCHAR(100),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Tabela: Vantagens
CREATE TABLE IF NOT EXISTS vantagens (
  id SERIAL PRIMARY KEY,
  servidor_id INTEGER NOT NULL REFERENCES servidores(id) ON DELETE CASCADE,
  tipo VARCHAR(100) NOT NULL,
  descricao TEXT,
  valor DECIMAL(10, 2),
  data_aquisicao DATE,
  data_vencimento DATE,
  observacao TEXT,
  status VARCHAR(20) DEFAULT 'ATIVO',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Indexes para performance
CREATE INDEX IF NOT EXISTS idx_servidores_cpf ON servidores(cpf);
CREATE INDEX IF NOT EXISTS idx_servidores_situacao ON servidores(situacao);
CREATE INDEX IF NOT EXISTS idx_servidores_cargo ON servidores(cargo);
CREATE INDEX IF NOT EXISTS idx_servidores_categoria ON servidores(categoria);
CREATE INDEX IF NOT EXISTS idx_ats_servidor_id ON ats(servidor_id);
CREATE INDEX IF NOT EXISTS idx_evolucao_servidor_id ON evolucao_funcional(servidor_id);
CREATE INDEX IF NOT EXISTS idx_certidao_servidor_id ON licenca_premio_certidao(servidor_id);
CREATE INDEX IF NOT EXISTS idx_fruicao_certidao_id ON licenca_premio_fruicao(certidao_id);
CREATE INDEX IF NOT EXISTS idx_orientacao_servidor_id ON orientacao_ausencia(servidor_id);
CREATE INDEX IF NOT EXISTS idx_orientacao_data ON orientacao_ausencia(data);
CREATE INDEX IF NOT EXISTS idx_orientacao_tipo ON orientacao_ausencia(tipo);

-- Habilitar Row Level Security (RLS) no Supabase
ALTER TABLE servidores ENABLE ROW LEVEL SECURITY;
ALTER TABLE ats ENABLE ROW LEVEL SECURITY;
ALTER TABLE evolucao_funcional ENABLE ROW LEVEL SECURITY;
ALTER TABLE licenca_premio_certidao ENABLE ROW LEVEL SECURITY;
ALTER TABLE licenca_premio_fruicao ENABLE ROW LEVEL SECURITY;
ALTER TABLE orientacao_ausencia ENABLE ROW LEVEL SECURITY;
ALTER TABLE historico_funcional ENABLE ROW LEVEL SECURITY;
ALTER TABLE vantagens ENABLE ROW LEVEL SECURITY;

-- Políticas RLS - Permitir acesso para autenticados
CREATE POLICY "Permitir acesso autenticado a servidores" ON servidores FOR ALL TO authenticated USING (true);
CREATE POLICY "Permitir acesso autenticado a ats" ON ats FOR ALL TO authenticated USING (true);
CREATE POLICY "Permitir acesso autenticado a evolucao" ON evolucao_funcional FOR ALL TO authenticated USING (true);
CREATE POLICY "Permitir acesso autenticado a certidoes" ON licenca_premio_certidao FOR ALL TO authenticated USING (true);
CREATE POLICY "Permitir acesso autenticado a fruiçoes" ON licenca_premio_fruicao FOR ALL TO authenticated USING (true);
CREATE POLICY "Permitir acesso autenticado a orientacao" ON orientacao_ausencia FOR ALL TO authenticated USING (true);
CREATE POLICY "Permitir acesso autenticado a historico" ON historico_funcional FOR ALL TO authenticated USING (true);
CREATE POLICY "Permitir acesso autenticado a vantagens" ON vantagens FOR ALL TO authenticated USING (true);

-- Função para atualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers para updated_at
CREATE TRIGGER update_servidores_updated_at BEFORE UPDATE ON servidores FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_ats_updated_at BEFORE UPDATE ON ats FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_evolucao_updated_at BEFORE UPDATE ON evolucao_funcional FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_certidao_updated_at BEFORE UPDATE ON licenca_premio_certidao FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_vantagens_updated_at BEFORE UPDATE ON vantagens FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_orientacao_updated_at BEFORE UPDATE ON orientacao_ausencia FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
