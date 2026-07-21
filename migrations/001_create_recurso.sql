-- Migración: Crear tabla recurso
-- Fecha: 17-Jul-2026
-- Descripción: Soporte para recursos multimedia (PDF, imágenes, audio, video)

CREATE TABLE IF NOT EXISTS recurso (
  id BIGSERIAL PRIMARY KEY,
  cliente_id BIGINT NOT NULL REFERENCES cliente(id) ON DELETE CASCADE,
  agente_id BIGINT REFERENCES agente(id) ON DELETE SET NULL,
  nombre VARCHAR(200) NOT NULL,
  tipo VARCHAR(50) NOT NULL CHECK (tipo IN ('PDF', 'IMAGEN', 'AUDIO', 'VIDEO')),
  categoria VARCHAR(100),
  keywords TEXT[] DEFAULT '{}',
  descripcion TEXT,
  archivo_local VARCHAR(255),
  url_externa VARCHAR(500),
  tamano_bytes INTEGER,
  mime_type VARCHAR(50),
  activo BOOLEAN DEFAULT true,

  -- Auditoría
  _estado VARCHAR(50) DEFAULT 'ACTIVO' NOT NULL,
  _transaccion VARCHAR(50),
  _usuario_creacion BIGINT,
  _fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  _usuario_modificacion BIGINT,
  _fecha_modificacion TIMESTAMP
);

-- Postgres no admite INDEX inline dentro de CREATE TABLE (eso es sintaxis MySQL);
-- se crean aparte.
CREATE INDEX IF NOT EXISTS idx_recurso_cliente_categoria ON recurso (cliente_id, categoria);
CREATE INDEX IF NOT EXISTS idx_recurso_agente ON recurso (agente_id);
CREATE INDEX IF NOT EXISTS idx_recurso_activo ON recurso (activo);

COMMENT ON TABLE recurso IS 'Recursos multimedia (PDF, imágenes, audio, video) para agentes IA';
COMMENT ON COLUMN recurso.keywords IS 'Array de palabras clave para búsqueda (ej: [''catálogo'', ''precios''])';
COMMENT ON COLUMN recurso.archivo_local IS 'Ruta relativa dentro de uploads/recursos/';
COMMENT ON COLUMN recurso.url_externa IS 'URL completa si el recurso está hosteado externamente (ej: S3)';
