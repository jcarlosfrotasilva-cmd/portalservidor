import { pgTable, serial, varchar, date, timestamp, text, integer, decimal, boolean } from "drizzle-orm/pg-core";

// ========== SERVIDORES ==========
export const servidores = pgTable("servidores", {
  id: serial("id").primaryKey().notNull(),
  nome: varchar("nome", { length: 200 }).notNull(),
  cpf: varchar("cpf", { length: 14 }).notNull().unique(),
  rgcin: varchar("rgcin", { length: 50 }),
  dtnasc: date("dtnasc"),
  sexo: varchar("sexo", { length: 1 }),
  tel: varchar("tel", { length: 20 }),
  email: varchar("email", { length: 150 }),
  cargo: varchar("cargo", { length: 100 }),
  categoria: varchar("categoria", { length: 100 }),
  faixa: varchar("faixa", { length: 50 }),
  nivel: varchar("nivel", { length: 50 }),
  jornada: varchar("jornada", { length: 50 }),
  lotacao: varchar("lotacao", { length: 200 }),
  situacao: varchar("situacao", { length: 50 }).default("ATIVO"),
  senha: varchar("senha", { length: 255 }),
  dataAdmissao: date("data_admissao"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// ========== VANTAGENS (Registros Funcionais) ==========
export const vantagens = pgTable("vantagens", {
  id: serial("id").primaryKey().notNull(),
  servidorId: integer("servidor_id").notNull(),
  tipo: varchar("tipo", { length: 100 }).notNull(),
  descricao: text("descricao"),
  valor: decimal("valor", { precision: 10, scale: 2 }),
  dataAquisicao: date("data_aquisicao"),
  dataVencimento: date("data_vencimento"),
  observacao: text("observacao"),
  status: varchar("status", { length: 20 }).default("ATIVO"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// ========== ATS - ADICIONAL POR TEMPO DE SERVIÇO ==========
export const ats = pgTable("ats", {
  id: serial("id").primaryKey().notNull(),
  servidorId: integer("servidor_id").notNull(),
  numeroQuinquenio: integer("numero_quinquenio").notNull(),
  tipoDescricao: varchar("tipo_descricao", { length: 100 }).notNull(),
  dataVigencia: date("data_vigencia").notNull(),
  dataDoe: date("data_doe"),
  valor: decimal("valor", { precision: 10, scale: 2 }),
  proximaVigencia: date("proxima_vigencia"),
  observacao: text("observacao"),
  status: varchar("status", { length: 20 }).default("ATIVO"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// ========== HISTÓRICO FUNCIONAL ==========
export const historicoFuncional = pgTable("historico_funcional", {
  id: serial("id").primaryKey().notNull(),
  servidorId: integer("servidor_id").notNull(),
  categoria: varchar("categoria", { length: 50 }).notNull(), // POSSE, PROGRESSAO, LICENCA, AFASTAMENTO, EVOLUCAO, ATS, LOTACAO, CAPACITACAO, FALTAS, OT, OUTROS
  tipo: varchar("tipo", { length: 100 }).notNull(),
  descricao: text("descricao").notNull(),
  data: date("data").notNull(),
  dataFim: date("data_fim"),
  numeroDocumento: varchar("numero_documento", { length: 100 }),
  dataDocumento: date("data_documento"),
  observacoes: text("observacoes"),
  registradoPor: varchar("registrado_por", { length: 100 }),
  dataRegistro: timestamp("data_registro").defaultNow(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// ========== EXPORT TYPES ==========
export type Servidor = typeof servidores.$inferSelect;
export type NovoServidor = typeof servidores.$inferInsert;
export type Vantagem = typeof vantagens.$inferSelect;
export type NovaVantagem = typeof vantagens.$inferInsert;
export type HistoricoFuncional = typeof historicoFuncional.$inferSelect;
export type NovoHistoricoFuncional = typeof historicoFuncional.$inferInsert;
export type Ats = typeof ats.$inferSelect;
export type NovaAts = typeof ats.$inferInsert;

// ========== EVOLUÇÃO FUNCIONAL ==========
export const evolucaoFuncional = pgTable("evolucao_funcional", {
  id: serial("id").primaryKey().notNull(),
  servidorId: integer("servidor_id").notNull(),
  tipo: varchar("tipo", { length: 100 }).notNull(),
  transicao: varchar("transicao", { length: 20 }).notNull(), // ex: "I → II"
  nivelOrigem: varchar("nivel_origem", { length: 5 }).notNull(),
  nivelDestino: varchar("nivel_destino", { length: 5 }).notNull(),
  intersticioAnos: integer("intersticio_anos").notNull(),
  dataVigencia: date("data_vigencia").notNull(),
  dataDoe: date("data_doe"),
  observacao: text("observacao"),
  status: varchar("status", { length: 20 }).default("ATIVO"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export type EvolucaoFuncional = typeof evolucaoFuncional.$inferSelect;
export type NovaEvolucaoFuncional = typeof evolucaoFuncional.$inferInsert;

// ========== LICENÇA PRÊMIO - CERTIDÕES ==========
export const licencaPremioCertidao = pgTable("licenca_premio_certidao", {
  id: serial("id").primaryKey().notNull(),
  servidorId: integer("servidor_id").notNull(),
  numeroCertidao: varchar("numero_certidao", { length: 50 }).notNull(),
  anoCertidao: integer("ano_certidao").notNull(),
  periodoInicial: date("periodo_inicial").notNull(),
  periodoFinal: date("periodo_final").notNull(),
  dataDoe: date("data_doe"),
  saldoTotal: integer("saldo_total").default(90),
  saldoUsado: integer("saldo_usado").default(0),
  status: varchar("status", { length: 20 }).default("ATIVA"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// ========== LICENÇA PRÊMIO - FRUIÇÕES ==========
export const licencaPremioFruicao = pgTable("licenca_premio_fruicao", {
  id: serial("id").primaryKey().notNull(),
  certidaoId: integer("certidao_id").notNull(),
  tipo: varchar("tipo", { length: 20 }).notNull(), // GOZO or PECUNIA
  dias: integer("dias").notNull(),
  dataInicio: date("data_inicio"),
  dataFinal: date("data_final"),
  dataDoeAprovacao: date("data_doe_aprovacao"),
  anoPecunia: integer("ano_pecunia"),
  observacao: text("observacao"),
  status: varchar("status", { length: 20 }).default("ATIVA"),
  createdAt: timestamp("created_at").defaultNow(),
});

export type LicencaPremioCertidao = typeof licencaPremioCertidao.$inferSelect;
export type NovaLicencaPremioCertidao = typeof licencaPremioCertidao.$inferInsert;
export type LicencaPremioFruicao = typeof licencaPremioFruicao.$inferSelect;
export type NovaLicencaPremioFruicao = typeof licencaPremioFruicao.$inferInsert;

// ========== ORIENTAÇÃO TÉCNICA E AUSÊNCIA ==========
export const orientacaoEausencia = pgTable("orientacao_ausencia", {
  id: serial("id").primaryKey().notNull(),
  servidorId: integer("servidor_id").notNull(),
  tipo: varchar("tipo", { length: 20 }).notNull(), // OT or AUSENCIA
  subtipo: varchar("subtipo", { length: 50 }), // tipo de ausência
  data: date("data").notNull(),
  dataInicio: date("data_inicio"), // para licença/auxílio
  dataFim: date("data_fim"), // para licença/auxílio
  quantidadeDias: integer("quantidade_dias"), // calculado para licença/auxílio
  quantidadeHoras: integer("quantidade_horas"), // para falta de aula
  assunto: varchar("assunto", { length: 300 }),
  local: varchar("local", { length: 200 }),
  horaInicio: varchar("hora_inicio", { length: 5 }),
  horaTermino: varchar("hora_termino", { length: 5 }),
  dataDoeOuEmail: varchar("data_doe_ou_email", { length: 100 }),
  observacao: text("observacao"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export type OrientacaoEausencia = typeof orientacaoEausencia.$inferSelect;
export type NovaOrientacaoEausencia = typeof orientacaoEausencia.$inferInsert;

// ========== REQUERIMENTOS ==========
export const requerimentos = pgTable("requerimentos", {
  id: serial("id").primaryKey().notNull(),
  protocolo: varchar("protocolo", { length: 50 }).notNull().unique(),
  servidorId: integer("servidor_id").notNull(),
  tipo: varchar("tipo", { length: 100 }).notNull(),
  objeto: text("objeto").notNull(),
  fundamentacao: text("fundamentacao"),
  dataProtocolo: timestamp("data_protocolo").defaultNow().notNull(),
  prazoResposta: date("prazo_resposta"),
  status: varchar("status", { length: 30 }).default("RECEBIDO").notNull(),
  decisao: varchar("decisao", { length: 20 }), // DEFERIDO, INDEFERIDO, PARCIAL, EM_ANALISE
  fundamentacaoDecisao: text("fundamentacao_decisao"),
  dataDecisao: timestamp("data_decisao"),
  gestorId: integer("gestor_id"), // quem decidiu
  cienciaServidor: boolean("ciencia_servidor").default(false),
  dataCienciaServidor: timestamp("data_ciencia_servidor"),
  observacoes: text("observacoes"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Histórico de tramitação do requerimento
export const requerimentoTramitacoes = pgTable("requerimento_tramitacoes", {
  id: serial("id").primaryKey().notNull(),
  requerimentoId: integer("requerimento_id").notNull(),
  statusAnterior: varchar("status_anterior", { length: 30 }),
  statusNovo: varchar("status_novo", { length: 30 }).notNull(),
  observacao: text("observacao"),
  responsavel: varchar("responsavel", { length: 100 }), // nome de quem fez a tramitação
  tipoResponsavel: varchar("tipo_responsavel", { length: 20 }), // SERVIDOR ou GESTOR
  dataTramitacao: timestamp("data_tramitacao").defaultNow().notNull(),
});

export type Requerimento = typeof requerimentos.$inferSelect;
export type NovoRequerimento = typeof requerimentos.$inferInsert;
export type RequerimentoTramitacao = typeof requerimentoTramitacoes.$inferSelect;
export type NovaRequerimentoTramitacao = typeof requerimentoTramitacoes.$inferInsert;
