-- Migración: Crear tabla excepcion_horario_agente
-- Fecha: 18-Ago-2026
-- Descripción: Fechas puntuales no recurrentes en las que un agente humano (o todo el
--              equipo) no trabaja: feriados, aniversarios, vacaciones.

CREATE TABLE IF NOT EXISTS excepcion_horario_agente (
  id BIGSERIAL PRIMARY KEY,
  cliente_id BIGINT NOT NULL,
  agente_id BIGINT,                    -- NULL = aplica a todo el equipo humano del cliente
  fecha_inicio DATE NOT NULL,
  fecha_fin DATE NOT NULL,
  motivo VARCHAR(200) NOT NULL,
  tipo VARCHAR(20) NOT NULL DEFAULT 'otro' CHECK (tipo IN ('feriado', 'vacacion', 'aniversario', 'otro')),

  -- Auditoría
  _estado VARCHAR(30) NOT NULL DEFAULT 'ACTIVO',
  _transaccion VARCHAR(30),
  _usuario_creacion BIGINT NOT NULL,
  _fecha_creacion TIMESTAMP NOT NULL DEFAULT now(),
  _usuario_modificacion BIGINT,
  _fecha_modificacion TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_excepcion_horario_cliente_rango ON excepcion_horario_agente (cliente_id, fecha_inicio, fecha_fin);
CREATE INDEX IF NOT EXISTS idx_excepcion_horario_agente ON excepcion_horario_agente (agente_id);

COMMENT ON TABLE excepcion_horario_agente IS 'Fechas no recurrentes en las que un agente humano (o todo el equipo) no trabaja';
COMMENT ON COLUMN excepcion_horario_agente.agente_id IS 'NULL = bloquea a todo el equipo humano del cliente; con valor, solo a ese agente';
