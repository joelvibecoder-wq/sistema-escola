-- Kennedy Vota: esquema inicial para desenvolvimento e testes.
-- Revisar com auditoria de segurança antes de qualquer eleição oficial.
-- Este script não é aplicado automaticamente ao banco Render.
CREATE SCHEMA IF NOT EXISTS kennedy;

CREATE TABLE IF NOT EXISTS kennedy.users (
  id UUID PRIMARY KEY,
  google_sub TEXT NOT NULL UNIQUE,
  email TEXT NOT NULL,
  full_name TEXT NOT NULL,
  requested_role TEXT NOT NULL CHECK (requested_role IN ('aluno','professor')),
  role TEXT CHECK (role IN ('aluno','professor','comissao','administrador')),
  approved BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS kennedy.elections (
  id UUID PRIMARY KEY,
  title TEXT NOT NULL,
  election_type TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  status TEXT NOT NULL DEFAULT 'planejada'
    CHECK (status IN ('planejada','aberta','pausada','encerrada')),
  starts_at TIMESTAMPTZ NOT NULL,
  ends_at TIMESTAMPTZ NOT NULL,
  created_by UUID REFERENCES kennedy.users(id) ON DELETE RESTRICT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT election_dates_valid CHECK (ends_at > starts_at)
);

CREATE TABLE IF NOT EXISTS kennedy.candidates (
  id UUID PRIMARY KEY,
  election_id UUID NOT NULL REFERENCES kennedy.elections(id) ON DELETE RESTRICT,
  candidate_number TEXT NOT NULL,
  full_name TEXT NOT NULL,
  office TEXT NOT NULL,
  proposals TEXT NOT NULL DEFAULT '',
  UNIQUE (election_id,candidate_number),
  UNIQUE (id,election_id)
);

-- Comissão autoriza cada conta aprovada para cada pleito.
CREATE TABLE IF NOT EXISTS kennedy.eligible_voters (
  election_id UUID NOT NULL REFERENCES kennedy.elections(id) ON DELETE RESTRICT,
  user_id UUID NOT NULL REFERENCES kennedy.users(id) ON DELETE RESTRICT,
  eligible BOOLEAN NOT NULL DEFAULT TRUE,
  PRIMARY KEY (election_id,user_id)
);

-- Registro de participação SEM candidato escolhido.
-- UNIQUE por eleitor+eleição deve ser aplicado no mesmo commit da cédula.
CREATE TABLE IF NOT EXISTS kennedy.participation (
  election_id UUID NOT NULL REFERENCES kennedy.elections(id) ON DELETE RESTRICT,
  user_id UUID NOT NULL REFERENCES kennedy.users(id) ON DELETE RESTRICT,
  PRIMARY KEY (election_id,user_id)
);

-- Cédulas SEM user_id ou google_sub para não ligar escolha à identidade.
-- Não guardar timestamp por voto; revisar ainda correlação por logs e padrões de acesso.
CREATE TABLE IF NOT EXISTS kennedy.ballots (
  id UUID PRIMARY KEY,
  election_id UUID NOT NULL REFERENCES kennedy.elections(id) ON DELETE RESTRICT,
  candidate_id UUID NOT NULL,
  FOREIGN KEY (candidate_id,election_id)
    REFERENCES kennedy.candidates(id,election_id) ON DELETE RESTRICT
);

CREATE INDEX IF NOT EXISTS ballots_election_candidate_idx
  ON kennedy.ballots(election_id,candidate_id);

-- A API deve em UMA transação:
-- 1. verificar ID token Google e sessão de servidor;
-- 2. consultar usuário aprovado, elegibilidade e eleição aberta no horário;
-- 3. checar candidato da eleição;
-- 4. INSERT participation (election_id,user_id) [sem ON CONFLICT ocultando falha];
-- 5. INSERT ballots (id,election_id,candidate_id);
-- 6. COMMIT (ou ROLLBACK se qualquer etapa falhar).
-- Nunca permitir escrita direta a partir do browser nem expor DB_URL.
