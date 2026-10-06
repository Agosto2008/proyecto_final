-- =====================================================================
-- FutureStar - futurestar_db (MySQL 8.0.16+)
-- Script completo: 35 tablas, relaciones, restricciones, indices,
-- vista publica, datos iniciales, datos de prueba y consultas de prueba.
-- Orden: MODULO 1..8 -> VISTAS -> SEMILLAS -> DATOS DE PRUEBA -> VERIFICACION
-- =====================================================================

-- Para reconstruir desde cero, descomenta la siguiente linea:
-- DROP DATABASE IF EXISTS futurestar_db;

CREATE DATABASE IF NOT EXISTS futurestar_db_in5bm

    CHARACTER SET utf8mb4
    COLLATE utf8mb4_0900_ai_ci;

USE futurestar_db_in5bm;

SET NAMES utf8mb4;

-- =====================================================================
-- MODULO 1: USUARIOS Y ACCESO (5 tablas)
-- =====================================================================

-- Catalogo de paises. BIGINT autoincremental porque es un catalogo.
CREATE TABLE paises (
    id              BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    nombre          VARCHAR(100) NOT NULL,
    codigo_iso      VARCHAR(3)   NOT NULL,
    codigo_telefono VARCHAR(10)  NULL,
    activo          BOOLEAN      NOT NULL DEFAULT TRUE,
    creado_en       TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY uq_paises_nombre (nombre),
    UNIQUE KEY uq_paises_codigo_iso (codigo_iso)
) ENGINE=InnoDB;

-- Usuarios. UUID como CHAR(36) generado por la propia BD.
-- password_hash: SOLO hash (bcrypt/argon2 generado por el backend).
CREATE TABLE usuarios (
    id                  CHAR(36)     NOT NULL DEFAULT (UUID()),
    nombre              VARCHAR(100) NOT NULL,
    apellido            VARCHAR(100) NOT NULL,
    email               VARCHAR(150) NOT NULL,
    password_hash       TEXT         NOT NULL,
    telefono            VARCHAR(30)  NULL,
    fecha_nacimiento    DATE         NOT NULL,
    pais_id             BIGINT UNSIGNED NOT NULL,
    ciudad              VARCHAR(100) NULL,
    estado              ENUM('PENDIENTE','ACTIVO','SUSPENDIDO','ELIMINADO') NOT NULL DEFAULT 'PENDIENTE',
    email_verificado    BOOLEAN      NOT NULL DEFAULT FALSE,
    telefono_verificado BOOLEAN      NOT NULL DEFAULT FALSE,
    ultimo_acceso       TIMESTAMP    NULL,
    creado_en           TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    actualizado_en      TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY uq_usuarios_email (email),
    KEY idx_usuarios_pais (pais_id),
    KEY idx_usuarios_estado (estado),
    CONSTRAINT fk_usuarios_pais FOREIGN KEY (pais_id) REFERENCES paises(id),
    CONSTRAINT chk_usuarios_email CHECK (email LIKE '%_@_%.__%'),
    CONSTRAINT chk_usuarios_nacimiento CHECK (fecha_nacimiento >= '1900-01-01')
) ENGINE=InnoDB;

CREATE TABLE roles (
    id          BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    nombre      VARCHAR(50) NOT NULL,
    descripcion TEXT NULL,
    PRIMARY KEY (id),
    UNIQUE KEY uq_roles_nombre (nombre)
) ENGINE=InnoDB;

-- Muchos a muchos usuarios <-> roles
CREATE TABLE usuario_roles (
    usuario_id CHAR(36) NOT NULL,
    rol_id     BIGINT UNSIGNED NOT NULL,
    PRIMARY KEY (usuario_id, rol_id),
    KEY idx_usuario_roles_rol (rol_id),
    CONSTRAINT fk_ur_usuario FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
    CONSTRAINT fk_ur_rol     FOREIGN KEY (rol_id)     REFERENCES roles(id)
) ENGINE=InnoDB;

CREATE TABLE sesiones (
    id                 CHAR(36)  NOT NULL DEFAULT (UUID()),
    usuario_id         CHAR(36)  NOT NULL,
    refresh_token_hash TEXT      NOT NULL,
    dispositivo        TEXT      NULL,
    ip_hash            TEXT      NULL,
    expira_en          TIMESTAMP NOT NULL,
    creado_en          TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    revocado_en        TIMESTAMP NULL,
    PRIMARY KEY (id),
    KEY idx_sesiones_usuario (usuario_id),
    KEY idx_sesiones_expira (expira_en),
    CONSTRAINT fk_sesiones_usuario FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- =====================================================================
-- MODULO 2: PERFILES (3 tablas)
-- organizaciones.logo_archivo_id se agrega por ALTER mas abajo
-- porque archivos depende de usuarios (evita dependencia circular).
-- =====================================================================

CREATE TABLE organizaciones (
    id               CHAR(36)     NOT NULL DEFAULT (UUID()),
    nombre           VARCHAR(150) NOT NULL,
    descripcion      TEXT         NULL,
    tipo             ENUM('CLUB','EQUIPO','ACADEMIA','FEDERACION','AGENCIA','OTRO') NOT NULL,
    pais_id          BIGINT UNSIGNED NOT NULL,
    ciudad           VARCHAR(100) NULL,
    direccion        TEXT         NULL,
    sitio_web        TEXT         NULL,
    logo_archivo_id  CHAR(36)     NULL,
    email_contacto   VARCHAR(150) NULL,
    telefono_contacto VARCHAR(30) NULL,
    estado           ENUM('PENDIENTE','ACTIVA','SUSPENDIDA') NOT NULL DEFAULT 'PENDIENTE',
    verificada       BOOLEAN      NOT NULL DEFAULT FALSE,
    creado_en        TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    actualizado_en   TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    KEY idx_org_pais (pais_id),
    KEY idx_org_tipo (tipo),
    KEY idx_org_estado (estado),
    CONSTRAINT fk_org_pais FOREIGN KEY (pais_id) REFERENCES paises(id)
) ENGINE=InnoDB;

CREATE TABLE jugadores (
    id                  CHAR(36)     NOT NULL DEFAULT (UUID()),
    usuario_id          CHAR(36)     NOT NULL,
    nombre_deportivo    VARCHAR(100) NULL,
    posicion_principal  VARCHAR(100) NULL,
    posicion_secundaria VARCHAR(100) NULL,
    categoria           VARCHAR(100) NULL,
    altura_cm           DECIMAL(5,2) NULL,
    peso_kg             DECIMAL(5,2) NULL,
    pierna_dominante    ENUM('IZQUIERDA','DERECHA','AMBAS') NULL,
    experiencia         TEXT         NULL,
    descripcion         TEXT         NULL,
    perfil_publico      BOOLEAN      NOT NULL DEFAULT FALSE,
    estado_perfil       ENUM('BORRADOR','PENDIENTE_REVISION','ACTIVO','SUSPENDIDO') NOT NULL DEFAULT 'BORRADOR',
    creado_en           TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    actualizado_en      TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY uq_jugadores_usuario (usuario_id),
    KEY idx_jugadores_posicion (posicion_principal),
    KEY idx_jugadores_publico_estado (perfil_publico, estado_perfil),
    CONSTRAINT fk_jugadores_usuario FOREIGN KEY (usuario_id) REFERENCES usuarios(id),
    CONSTRAINT chk_jugadores_altura CHECK (altura_cm IS NULL OR altura_cm BETWEEN 100 AND 260),
    CONSTRAINT chk_jugadores_peso   CHECK (peso_kg   IS NULL OR peso_kg   BETWEEN 25 AND 200)
) ENGINE=InnoDB;

CREATE TABLE cazatalentos (
    id               CHAR(36)     NOT NULL DEFAULT (UUID()),
    usuario_id       CHAR(36)     NOT NULL,
    organizacion_id  CHAR(36)     NULL,   -- NULL = cazatalentos independiente
    cargo            VARCHAR(100) NULL,
    experiencia_anios INT         NULL,
    descripcion      TEXT         NULL,
    estado           ENUM('PENDIENTE','ACTIVO','SUSPENDIDO') NOT NULL DEFAULT 'PENDIENTE',
    creado_en        TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY uq_cazatalentos_usuario (usuario_id),
    KEY idx_caza_org (organizacion_id),
    CONSTRAINT fk_caza_usuario FOREIGN KEY (usuario_id) REFERENCES usuarios(id),
    CONSTRAINT fk_caza_org     FOREIGN KEY (organizacion_id) REFERENCES organizaciones(id) ON DELETE SET NULL,
    CONSTRAINT chk_caza_exp CHECK (experiencia_anios IS NULL OR experiencia_anios >= 0)
) ENGINE=InnoDB;

-- =====================================================================
-- MODULO 3: ARCHIVOS Y VERIFICACION (4 tablas)
-- La BD guarda SOLO metadata y la clave de almacenamiento externo.
-- =====================================================================

CREATE TABLE archivos (
    id                 CHAR(36)     NOT NULL DEFAULT (UUID()),
    usuario_id         CHAR(36)     NOT NULL,
    tipo               ENUM('FOTO_PERFIL','FOTO_VERIFICACION','DOCUMENTO_IDENTIDAD',
                            'CERTIFICADO_NACIMIENTO','PASAPORTE','DOCUMENTO_DEPORTIVO',
                            'VIDEO','LOGO','OTRO') NOT NULL,
    nombre_original    VARCHAR(255) NOT NULL,
    almacenamiento_key TEXT         NOT NULL,
    mime_type          VARCHAR(100) NOT NULL,
    tamano_bytes       BIGINT UNSIGNED NOT NULL,
    publico            BOOLEAN      NOT NULL DEFAULT FALSE,
    estado             ENUM('PENDIENTE','ACTIVO','RECHAZADO','ELIMINADO') NOT NULL DEFAULT 'PENDIENTE',
    creado_en          TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    KEY idx_archivos_usuario (usuario_id),
    KEY idx_archivos_tipo (tipo),
    CONSTRAINT fk_archivos_usuario FOREIGN KEY (usuario_id) REFERENCES usuarios(id),
    -- Seguridad: los archivos sensibles NUNCA pueden ser publicos
    CONSTRAINT chk_archivos_sensibles_privados CHECK (
        NOT (publico = TRUE AND tipo IN ('FOTO_VERIFICACION','DOCUMENTO_IDENTIDAD',
                                         'CERTIFICADO_NACIMIENTO','PASAPORTE'))
    )
) ENGINE=InnoDB;

-- Cierra la dependencia circular organizaciones <-> archivos
ALTER TABLE organizaciones
    ADD CONSTRAINT fk_org_logo FOREIGN KEY (logo_archivo_id) REFERENCES archivos(id) ON DELETE SET NULL;

CREATE TABLE documentos_verificacion (
    id                    CHAR(36)    NOT NULL DEFAULT (UUID()),
    usuario_id            CHAR(36)    NOT NULL,
    archivo_id            CHAR(36)    NOT NULL,
    tipo_documento        VARCHAR(50) NOT NULL,
    numero_documento_hash TEXT        NULL,
    estado                ENUM('PENDIENTE','EN_REVISION','APROBADO','RECHAZADO','VENCIDO') NOT NULL DEFAULT 'PENDIENTE',
    fecha_emision         DATE        NULL,
    fecha_vencimiento     DATE        NULL,
    revisado_por          CHAR(36)    NULL,
    revisado_en           TIMESTAMP   NULL,
    observaciones         TEXT        NULL,
    PRIMARY KEY (id),
    KEY idx_docver_usuario (usuario_id),
    KEY idx_docver_archivo (archivo_id),
    KEY idx_docver_estado (estado),
    CONSTRAINT fk_docver_usuario  FOREIGN KEY (usuario_id)   REFERENCES usuarios(id),
    CONSTRAINT fk_docver_archivo  FOREIGN KEY (archivo_id)   REFERENCES archivos(id),
    CONSTRAINT fk_docver_revisor  FOREIGN KEY (revisado_por) REFERENCES usuarios(id),
    CONSTRAINT chk_docver_fechas  CHECK (fecha_vencimiento IS NULL OR fecha_emision IS NULL OR fecha_vencimiento >= fecha_emision)
) ENGINE=InnoDB;

CREATE TABLE verificaciones (
    id                 CHAR(36)    NOT NULL DEFAULT (UUID()),
    usuario_id         CHAR(36)    NOT NULL,
    tipo               ENUM('EMAIL','TELEFONO','IDENTIDAD','EDAD','ORGANIZACION','PERFIL') NOT NULL,
    estado             ENUM('PENDIENTE','EN_REVISION','APROBADO','RECHAZADO','VENCIDO') NOT NULL DEFAULT 'PENDIENTE',
    nivel              INT         NOT NULL DEFAULT 0,
    metodo             VARCHAR(50) NULL,
    verificado_por     CHAR(36)    NULL,
    fecha_solicitud    TIMESTAMP   NOT NULL DEFAULT CURRENT_TIMESTAMP,
    fecha_verificacion TIMESTAMP   NULL,
    observaciones      TEXT        NULL,
    PRIMARY KEY (id),
    KEY idx_verif_usuario_tipo (usuario_id, tipo),
    KEY idx_verif_estado (estado),
    CONSTRAINT fk_verif_usuario FOREIGN KEY (usuario_id)     REFERENCES usuarios(id),
    CONSTRAINT fk_verif_por     FOREIGN KEY (verificado_por) REFERENCES usuarios(id),
    CONSTRAINT chk_verif_nivel  CHECK (nivel BETWEEN 0 AND 5)
) ENGINE=InnoDB;

CREATE TABLE autorizaciones_tutor (
    id                   CHAR(36)     NOT NULL DEFAULT (UUID()),
    jugador_id           CHAR(36)     NOT NULL,
    nombre_tutor         VARCHAR(200) NOT NULL,
    relacion             VARCHAR(50)  NOT NULL,
    documento_archivo_id CHAR(36)     NULL,
    estado               ENUM('PENDIENTE','EN_REVISION','APROBADO','RECHAZADO','REVOCADO') NOT NULL DEFAULT 'PENDIENTE',
    fecha_autorizacion   TIMESTAMP    NULL,
    revisado_por         CHAR(36)     NULL,
    observaciones        TEXT         NULL,
    PRIMARY KEY (id),
    KEY idx_tutor_jugador (jugador_id),
    KEY idx_tutor_archivo (documento_archivo_id),
    CONSTRAINT fk_tutor_jugador FOREIGN KEY (jugador_id)           REFERENCES jugadores(id),
    CONSTRAINT fk_tutor_archivo FOREIGN KEY (documento_archivo_id) REFERENCES archivos(id),
    CONSTRAINT fk_tutor_revisor FOREIGN KEY (revisado_por)         REFERENCES usuarios(id)
) ENGINE=InnoDB;

-- =====================================================================
-- MODULO 4: TALENTO DEPORTIVO (4 tablas)
-- =====================================================================

CREATE TABLE habilidades (
    id          BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    nombre      VARCHAR(100) NOT NULL,
    descripcion TEXT NULL,
    categoria   VARCHAR(50) NULL,
    activa      BOOLEAN NOT NULL DEFAULT TRUE,
    PRIMARY KEY (id),
    UNIQUE KEY uq_habilidades_nombre (nombre)
) ENGINE=InnoDB;

CREATE TABLE jugador_habilidades (
    jugador_id       CHAR(36) NOT NULL,
    habilidad_id     BIGINT UNSIGNED NOT NULL,
    nivel            INT NOT NULL,
    experiencia_anios INT NULL,
    evaluado         BOOLEAN NOT NULL DEFAULT FALSE,
    PRIMARY KEY (jugador_id, habilidad_id),
    KEY idx_jh_habilidad_nivel (habilidad_id, nivel),
    CONSTRAINT fk_jh_jugador   FOREIGN KEY (jugador_id)   REFERENCES jugadores(id) ON DELETE CASCADE,
    CONSTRAINT fk_jh_habilidad FOREIGN KEY (habilidad_id) REFERENCES habilidades(id),
    CONSTRAINT chk_jh_nivel CHECK (nivel BETWEEN 0 AND 100),
    CONSTRAINT chk_jh_exp   CHECK (experiencia_anios IS NULL OR experiencia_anios >= 0)
) ENGINE=InnoDB;

CREATE TABLE videos (
    id                CHAR(36)     NOT NULL DEFAULT (UUID()),
    jugador_id        CHAR(36)     NOT NULL,
    archivo_id        CHAR(36)     NOT NULL,
    titulo            VARCHAR(150) NOT NULL,
    descripcion       TEXT         NULL,
    tipo              ENUM('PARTIDO','ENTRENAMIENTO','HABILIDAD','PORTAFOLIO','PRESENTACION') NOT NULL,
    duracion_segundos INT          NULL,
    estado            ENUM('PROCESANDO','ACTIVO','RECHAZADO','ELIMINADO') NOT NULL DEFAULT 'PROCESANDO',
    creado_en         TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY uq_videos_archivo (archivo_id),
    KEY idx_videos_jugador (jugador_id),
    KEY idx_videos_estado (estado),
    CONSTRAINT fk_videos_jugador FOREIGN KEY (jugador_id) REFERENCES jugadores(id),
    CONSTRAINT fk_videos_archivo FOREIGN KEY (archivo_id) REFERENCES archivos(id),
    CONSTRAINT chk_videos_duracion CHECK (duracion_segundos IS NULL OR duracion_segundos > 0)
) ENGINE=InnoDB;

CREATE TABLE propuestas (
    id             CHAR(36)     NOT NULL DEFAULT (UUID()),
    jugador_id     CHAR(36)     NOT NULL,
    titulo         VARCHAR(150) NOT NULL,
    descripcion    TEXT         NULL,
    objetivos      TEXT         NULL,
    experiencia    TEXT         NULL,
    estado         ENUM('BORRADOR','ENVIADA','ARCHIVADA') NOT NULL DEFAULT 'BORRADOR',
    enviada_en     TIMESTAMP    NULL,
    creada_en      TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    actualizada_en TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    KEY idx_propuestas_jugador (jugador_id),
    CONSTRAINT fk_propuestas_jugador FOREIGN KEY (jugador_id) REFERENCES jugadores(id)
) ENGINE=InnoDB;

-- =====================================================================
-- MODULO 5: PRUEBAS E INTELIGENCIA ARTIFICIAL (4 tablas)
-- =====================================================================

CREATE TABLE pruebas (
    id                CHAR(36)     NOT NULL DEFAULT (UUID()),
    nombre            VARCHAR(150) NOT NULL,
    descripcion       TEXT         NULL,
    tipo              VARCHAR(50)  NOT NULL,
    puntuacion_maxima DECIMAL(8,2) NOT NULL,
    activa            BOOLEAN      NOT NULL DEFAULT TRUE,
    version           INT          NOT NULL DEFAULT 1,
    creada_en         TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY uq_pruebas_nombre_version (nombre, version),
    CONSTRAINT chk_pruebas_max CHECK (puntuacion_maxima > 0),
    CONSTRAINT chk_pruebas_version CHECK (version >= 1)
) ENGINE=InnoDB;

CREATE TABLE resultados_pruebas (
    id           CHAR(36)     NOT NULL DEFAULT (UUID()),
    jugador_id   CHAR(36)     NOT NULL,
    prueba_id    CHAR(36)     NOT NULL,
    puntuacion   DECIMAL(8,2) NOT NULL,
    porcentaje   DECIMAL(5,2) NULL,
    aprobado     BOOLEAN      NOT NULL DEFAULT FALSE,
    intentos     INT          NOT NULL DEFAULT 1,
    realizado_en TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    KEY idx_rp_jugador (jugador_id),
    KEY idx_rp_prueba (prueba_id),
    CONSTRAINT fk_rp_jugador FOREIGN KEY (jugador_id) REFERENCES jugadores(id),
    CONSTRAINT fk_rp_prueba  FOREIGN KEY (prueba_id)  REFERENCES pruebas(id),
    CONSTRAINT chk_rp_punt CHECK (puntuacion >= 0),
    CONSTRAINT chk_rp_porc CHECK (porcentaje IS NULL OR porcentaje BETWEEN 0 AND 100),
    CONSTRAINT chk_rp_intentos CHECK (intentos >= 1)
) ENGINE=InnoDB;

-- confianza 0-100. requiere_revision es columna generada:
-- si la confianza es menor a 70, el caso pasa a revision humana.
CREATE TABLE analisis_ia (
    id                 CHAR(36)     NOT NULL DEFAULT (UUID()),
    jugador_id         CHAR(36)     NOT NULL,
    video_id           CHAR(36)     NOT NULL,
    modelo             VARCHAR(100) NOT NULL,
    version_modelo     VARCHAR(50)  NOT NULL,
    puntuacion_general DECIMAL(5,2) NULL,
    confianza          DECIMAL(5,2) NOT NULL,
    resultado          ENUM('PRESELECCIONADO','NO_PRESELECCIONADO','REQUIERE_REVISION') NOT NULL,
    observaciones      TEXT         NULL,
    datos_analizados   JSON         NULL,
    requiere_revision  BOOLEAN GENERATED ALWAYS AS (confianza < 70) STORED,
    creado_en          TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    KEY idx_ia_jugador (jugador_id),
    KEY idx_ia_video (video_id),
    KEY idx_ia_revision (requiere_revision),
    CONSTRAINT fk_ia_jugador FOREIGN KEY (jugador_id) REFERENCES jugadores(id),
    CONSTRAINT fk_ia_video   FOREIGN KEY (video_id)   REFERENCES videos(id),
    CONSTRAINT chk_ia_punt CHECK (puntuacion_general IS NULL OR puntuacion_general BETWEEN 0 AND 100),
    CONSTRAINT chk_ia_conf CHECK (confianza BETWEEN 0 AND 100),
    CONSTRAINT chk_ia_json CHECK (datos_analizados IS NULL OR JSON_VALID(datos_analizados))
) ENGINE=InnoDB;

CREATE TABLE evaluaciones_humanas (
    id            CHAR(36)     NOT NULL DEFAULT (UUID()),
    jugador_id    CHAR(36)     NOT NULL,
    video_id      CHAR(36)     NULL,
    evaluador_id  CHAR(36)     NOT NULL,
    analisis_ia_id CHAR(36)    NULL,
    puntuacion    DECIMAL(5,2) NULL,
    resultado     ENUM('APROBADO','RECHAZADO','REQUIERE_MAS_INFO') NOT NULL,
    comentarios   TEXT         NULL,
    creado_en     TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    KEY idx_eh_jugador (jugador_id),
    KEY idx_eh_video (video_id),
    KEY idx_eh_evaluador (evaluador_id),
    KEY idx_eh_ia (analisis_ia_id),
    CONSTRAINT fk_eh_jugador   FOREIGN KEY (jugador_id)     REFERENCES jugadores(id),
    CONSTRAINT fk_eh_video     FOREIGN KEY (video_id)       REFERENCES videos(id),
    CONSTRAINT fk_eh_evaluador FOREIGN KEY (evaluador_id)   REFERENCES usuarios(id),
    CONSTRAINT fk_eh_ia        FOREIGN KEY (analisis_ia_id) REFERENCES analisis_ia(id),
    CONSTRAINT chk_eh_punt CHECK (puntuacion IS NULL OR puntuacion BETWEEN 0 AND 100)
) ENGINE=InnoDB;

-- =====================================================================
-- MODULO 6: RECLUTAMIENTO (5 tablas)
-- =====================================================================

CREATE TABLE oportunidades (
    id                 CHAR(36)     NOT NULL DEFAULT (UUID()),
    organizacion_id    CHAR(36)     NOT NULL,
    creado_por         CHAR(36)     NOT NULL,
    titulo             VARCHAR(150) NOT NULL,
    descripcion        TEXT         NULL,
    posicion           VARCHAR(100) NULL,
    edad_minima        INT          NULL,
    edad_maxima        INT          NULL,
    altura_minima_cm   DECIMAL(5,2) NULL,
    altura_maxima_cm   DECIMAL(5,2) NULL,
    pierna_dominante   ENUM('IZQUIERDA','DERECHA','AMBAS') NULL,
    pais_preferido_id  BIGINT UNSIGNED NULL,
    nivel_minimo       INT          NULL,
    fecha_inicio       DATE         NULL,
    fecha_limite       DATE         NULL,
    estado             ENUM('BORRADOR','ABIERTA','PAUSADA','CERRADA','CANCELADA') NOT NULL DEFAULT 'BORRADOR',
    creada_en          TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    KEY idx_op_org (organizacion_id),
    KEY idx_op_creado_por (creado_por),
    KEY idx_op_pais (pais_preferido_id),
    KEY idx_op_estado_posicion (estado, posicion),
    CONSTRAINT fk_op_org  FOREIGN KEY (organizacion_id)  REFERENCES organizaciones(id),
    CONSTRAINT fk_op_user FOREIGN KEY (creado_por)       REFERENCES usuarios(id),
    CONSTRAINT fk_op_pais FOREIGN KEY (pais_preferido_id) REFERENCES paises(id),
    CONSTRAINT chk_op_edad   CHECK (edad_minima IS NULL OR edad_maxima IS NULL OR edad_minima <= edad_maxima),
    CONSTRAINT chk_op_altura CHECK (altura_minima_cm IS NULL OR altura_maxima_cm IS NULL OR altura_minima_cm <= altura_maxima_cm),
    CONSTRAINT chk_op_nivel  CHECK (nivel_minimo IS NULL OR nivel_minimo BETWEEN 0 AND 100),
    CONSTRAINT chk_op_fechas CHECK (fecha_inicio IS NULL OR fecha_limite IS NULL OR fecha_inicio <= fecha_limite)
) ENGINE=InnoDB;

CREATE TABLE requisitos_oportunidad (
    id             CHAR(36)     NOT NULL DEFAULT (UUID()),
    oportunidad_id CHAR(36)     NOT NULL,
    nombre         VARCHAR(150) NOT NULL,
    descripcion    TEXT         NULL,
    obligatorio    BOOLEAN      NOT NULL DEFAULT FALSE,
    peso           DECIMAL(5,2) NULL,
    PRIMARY KEY (id),
    KEY idx_req_op (oportunidad_id),
    CONSTRAINT fk_req_op FOREIGN KEY (oportunidad_id) REFERENCES oportunidades(id) ON DELETE CASCADE,
    CONSTRAINT chk_req_peso CHECK (peso IS NULL OR peso BETWEEN 0 AND 100)
) ENGINE=InnoDB;

-- peso en porcentaje (ej. Velocidad 30). La suma por oportunidad
-- deberia ser 100; eso se valida en el backend o con trigger.
CREATE TABLE oportunidad_habilidades (
    oportunidad_id CHAR(36) NOT NULL,
    habilidad_id   BIGINT UNSIGNED NOT NULL,
    nivel_minimo   INT NULL,
    peso           DECIMAL(5,2) NOT NULL,
    PRIMARY KEY (oportunidad_id, habilidad_id),
    KEY idx_oh_habilidad (habilidad_id),
    CONSTRAINT fk_oh_op  FOREIGN KEY (oportunidad_id) REFERENCES oportunidades(id) ON DELETE CASCADE,
    CONSTRAINT fk_oh_hab FOREIGN KEY (habilidad_id)   REFERENCES habilidades(id),
    CONSTRAINT chk_oh_nivel CHECK (nivel_minimo IS NULL OR nivel_minimo BETWEEN 0 AND 100),
    CONSTRAINT chk_oh_peso  CHECK (peso BETWEEN 0 AND 100)
) ENGINE=InnoDB;

CREATE TABLE postulaciones (
    id                 CHAR(36)    NOT NULL DEFAULT (UUID()),
    jugador_id         CHAR(36)    NOT NULL,
    oportunidad_id     CHAR(36)    NOT NULL,
    propuesta_id       CHAR(36)    NULL,
    mensaje            TEXT        NULL,
    estado             ENUM('ENVIADA','EN_REVISION','PRESELECCIONADO','CONTACTADO','ENTREVISTA',
                            'EVALUACION_PRESENCIAL','ACEPTADO','RECHAZADO','RETIRADO')
                       NOT NULL DEFAULT 'ENVIADA',
    fecha_postulacion  TIMESTAMP   NOT NULL DEFAULT CURRENT_TIMESTAMP,
    actualizado_en     TIMESTAMP   NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    -- Un jugador solo puede postularse una vez a la misma oportunidad
    UNIQUE KEY uq_post_jugador_op (jugador_id, oportunidad_id),
    KEY idx_post_op_estado (oportunidad_id, estado),
    KEY idx_post_propuesta (propuesta_id),
    CONSTRAINT fk_post_jugador   FOREIGN KEY (jugador_id)     REFERENCES jugadores(id),
    CONSTRAINT fk_post_op        FOREIGN KEY (oportunidad_id) REFERENCES oportunidades(id),
    CONSTRAINT fk_post_propuesta FOREIGN KEY (propuesta_id)   REFERENCES propuestas(id) ON DELETE SET NULL
) ENGINE=InnoDB;

-- puntuacion_compatibilidad = que tan compatible es el jugador con la
-- oportunidad. NO es probabilidad de fichaje.
CREATE TABLE resultados_matching (
    id                        CHAR(36)     NOT NULL DEFAULT (UUID()),
    oportunidad_id            CHAR(36)     NOT NULL,
    jugador_id                CHAR(36)     NOT NULL,
    puntuacion_compatibilidad DECIMAL(5,2) NOT NULL,
    nivel_confianza           DECIMAL(5,2) NULL,
    factores                  JSON         NULL,
    estado                    ENUM('GENERADO','VISTO','DESCARTADO','CONTACTADO') NOT NULL DEFAULT 'GENERADO',
    generado_en               TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY uq_match_op_jugador (oportunidad_id, jugador_id),
    KEY idx_match_ranking (oportunidad_id, puntuacion_compatibilidad),
    KEY idx_match_jugador (jugador_id),
    CONSTRAINT fk_match_op      FOREIGN KEY (oportunidad_id) REFERENCES oportunidades(id),
    CONSTRAINT fk_match_jugador FOREIGN KEY (jugador_id)     REFERENCES jugadores(id),
    CONSTRAINT chk_match_punt CHECK (puntuacion_compatibilidad BETWEEN 0 AND 100),
    CONSTRAINT chk_match_conf CHECK (nivel_confianza IS NULL OR nivel_confianza BETWEEN 0 AND 100),
    CONSTRAINT chk_match_json CHECK (factores IS NULL OR JSON_VALID(factores))
) ENGINE=InnoDB;

-- =====================================================================
-- MODULO 7: COMUNICACION (5 tablas)
-- =====================================================================

CREATE TABLE conversaciones (
    id             CHAR(36)  NOT NULL DEFAULT (UUID()),
    postulacion_id CHAR(36)  NOT NULL,
    creado_en      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    estado         ENUM('ACTIVA','ARCHIVADA','CERRADA') NOT NULL DEFAULT 'ACTIVA',
    PRIMARY KEY (id),
    UNIQUE KEY uq_conv_postulacion (postulacion_id),
    CONSTRAINT fk_conv_post FOREIGN KEY (postulacion_id) REFERENCES postulaciones(id)
) ENGINE=InnoDB;

CREATE TABLE participantes_conversacion (
    conversacion_id CHAR(36)  NOT NULL,
    usuario_id      CHAR(36)  NOT NULL,
    unido_en        TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    activo          BOOLEAN   NOT NULL DEFAULT TRUE,
    PRIMARY KEY (conversacion_id, usuario_id),
    KEY idx_pc_usuario (usuario_id),
    CONSTRAINT fk_pc_conv    FOREIGN KEY (conversacion_id) REFERENCES conversaciones(id) ON DELETE CASCADE,
    CONSTRAINT fk_pc_usuario FOREIGN KEY (usuario_id)      REFERENCES usuarios(id)
) ENGINE=InnoDB;

CREATE TABLE mensajes (
    id              CHAR(36)  NOT NULL DEFAULT (UUID()),
    conversacion_id CHAR(36)  NOT NULL,
    remitente_id    CHAR(36)  NOT NULL,
    mensaje         TEXT      NULL,
    archivo_id      CHAR(36)  NULL,
    leido           BOOLEAN   NOT NULL DEFAULT FALSE,
    enviado_en      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    KEY idx_msg_conv_fecha (conversacion_id, enviado_en),
    KEY idx_msg_remitente (remitente_id),
    KEY idx_msg_archivo (archivo_id),
    CONSTRAINT fk_msg_conv      FOREIGN KEY (conversacion_id) REFERENCES conversaciones(id) ON DELETE CASCADE,
    CONSTRAINT fk_msg_remitente FOREIGN KEY (remitente_id)    REFERENCES usuarios(id),
    -- Sin ON DELETE SET NULL: MySQL (error 3823) no permite una accion referencial
    -- sobre una columna usada en un CHECK. Los archivos se eliminan logicamente.
    CONSTRAINT fk_msg_archivo   FOREIGN KEY (archivo_id)      REFERENCES archivos(id),
    -- Un mensaje debe tener texto o archivo
    CONSTRAINT chk_msg_contenido CHECK (mensaje IS NOT NULL OR archivo_id IS NOT NULL)
) ENGINE=InnoDB;

CREATE TABLE entrevistas (
    id               CHAR(36)  NOT NULL DEFAULT (UUID()),
    postulacion_id   CHAR(36)  NOT NULL,
    cazatalentos_id  CHAR(36)  NOT NULL,
    fecha_programada TIMESTAMP NOT NULL,
    tipo             ENUM('VIDEO_LLAMADA','LLAMADA','PRESENCIAL') NOT NULL,
    enlace           TEXT      NULL,
    estado           ENUM('PROGRAMADA','REALIZADA','CANCELADA','REPROGRAMADA') NOT NULL DEFAULT 'PROGRAMADA',
    notas            TEXT      NULL,
    creada_en        TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    KEY idx_ent_post (postulacion_id),
    KEY idx_ent_caza_fecha (cazatalentos_id, fecha_programada),
    CONSTRAINT fk_ent_post FOREIGN KEY (postulacion_id)  REFERENCES postulaciones(id),
    CONSTRAINT fk_ent_caza FOREIGN KEY (cazatalentos_id) REFERENCES cazatalentos(id)
) ENGINE=InnoDB;

CREATE TABLE visitas (
    id              CHAR(36)     NOT NULL DEFAULT (UUID()),
    postulacion_id  CHAR(36)     NOT NULL,
    organizacion_id CHAR(36)     NOT NULL,
    jugador_id      CHAR(36)     NOT NULL,
    fecha_visita    DATE         NOT NULL,
    pais_id         BIGINT UNSIGNED NOT NULL,
    ciudad          VARCHAR(100) NULL,
    lugar           VARCHAR(200) NULL,
    observaciones   TEXT         NULL,
    resultado       ENUM('PENDIENTE','POSITIVO','NEUTRO','NEGATIVO') NOT NULL DEFAULT 'PENDIENTE',
    estado          ENUM('PROGRAMADA','REALIZADA','CANCELADA') NOT NULL DEFAULT 'PROGRAMADA',
    PRIMARY KEY (id),
    KEY idx_vis_post (postulacion_id),
    KEY idx_vis_org (organizacion_id),
    KEY idx_vis_jugador (jugador_id),
    KEY idx_vis_pais (pais_id),
    CONSTRAINT fk_vis_post    FOREIGN KEY (postulacion_id)  REFERENCES postulaciones(id),
    CONSTRAINT fk_vis_org     FOREIGN KEY (organizacion_id) REFERENCES organizaciones(id),
    CONSTRAINT fk_vis_jugador FOREIGN KEY (jugador_id)      REFERENCES jugadores(id),
    CONSTRAINT fk_vis_pais    FOREIGN KEY (pais_id)         REFERENCES paises(id)
) ENGINE=InnoDB;

-- =====================================================================
-- MODULO 8: SISTEMA Y SEGURIDAD (5 tablas)
-- =====================================================================

CREATE TABLE notificaciones (
    id            CHAR(36)     NOT NULL DEFAULT (UUID()),
    usuario_id    CHAR(36)     NOT NULL,
    titulo        VARCHAR(150) NOT NULL,
    mensaje       TEXT         NULL,
    tipo          VARCHAR(50)  NOT NULL,
    referencia_id CHAR(36)     NULL,   -- id polimorfico (sin FK a proposito)
    leida         BOOLEAN      NOT NULL DEFAULT FALSE,
    creada_en     TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    KEY idx_notif_usuario (usuario_id, leida, creada_en),
    CONSTRAINT fk_notif_usuario FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE favoritos (
    id              CHAR(36)  NOT NULL DEFAULT (UUID()),
    cazatalentos_id CHAR(36)  NOT NULL,
    jugador_id      CHAR(36)  NOT NULL,
    creado_en       TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY uq_fav_caza_jugador (cazatalentos_id, jugador_id),
    KEY idx_fav_jugador (jugador_id),
    CONSTRAINT fk_fav_caza    FOREIGN KEY (cazatalentos_id) REFERENCES cazatalentos(id) ON DELETE CASCADE,
    CONSTRAINT fk_fav_jugador FOREIGN KEY (jugador_id)      REFERENCES jugadores(id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE fichajes (
    id              CHAR(36)  NOT NULL DEFAULT (UUID()),
    jugador_id      CHAR(36)  NOT NULL,
    organizacion_id CHAR(36)  NOT NULL,
    postulacion_id  CHAR(36)  NULL,
    fecha_inicio    DATE      NULL,
    fecha_final     DATE      NULL,
    tipo            ENUM('CONTRATO','ACADEMIA','PRUEBA_DEPORTIVA','CESION','OTRO') NOT NULL,
    estado          ENUM('PROPUESTO','ACTIVO','FINALIZADO','CANCELADO') NOT NULL DEFAULT 'PROPUESTO',
    observaciones   TEXT      NULL,
    creado_en       TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    KEY idx_fich_jugador (jugador_id),
    KEY idx_fich_org (organizacion_id),
    KEY idx_fich_post (postulacion_id),
    CONSTRAINT fk_fich_jugador FOREIGN KEY (jugador_id)      REFERENCES jugadores(id),
    CONSTRAINT fk_fich_org     FOREIGN KEY (organizacion_id) REFERENCES organizaciones(id),
    CONSTRAINT fk_fich_post    FOREIGN KEY (postulacion_id)  REFERENCES postulaciones(id) ON DELETE SET NULL,
    CONSTRAINT chk_fich_fechas CHECK (fecha_inicio IS NULL OR fecha_final IS NULL OR fecha_final >= fecha_inicio)
) ENGINE=InnoDB;

-- Auditoria: si se borra el usuario, el registro se conserva (SET NULL).
CREATE TABLE auditoria (
    id         CHAR(36)     NOT NULL DEFAULT (UUID()),
    usuario_id CHAR(36)     NULL,
    accion     VARCHAR(100) NOT NULL,
    entidad    VARCHAR(100) NOT NULL,
    entidad_id CHAR(36)     NULL,
    ip_hash    TEXT         NULL,
    detalles   JSON         NULL,
    creado_en  TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    KEY idx_aud_usuario (usuario_id, creado_en),
    KEY idx_aud_entidad (entidad, entidad_id),
    KEY idx_aud_accion (accion),
    CONSTRAINT fk_aud_usuario FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE SET NULL
) ENGINE=InnoDB;

CREATE TABLE reportes (
    id                   CHAR(36)    NOT NULL DEFAULT (UUID()),
    reportante_id        CHAR(36)    NOT NULL,
    usuario_reportado_id CHAR(36)    NOT NULL,
    tipo                 ENUM('ACOSO','SUPLANTACION','CONTENIDO_INAPROPIADO','FRAUDE','OTRO') NOT NULL,
    motivo               TEXT        NOT NULL,
    evidencia_archivo_id CHAR(36)    NULL,
    estado               ENUM('ABIERTO','EN_REVISION','RESUELTO','DESESTIMADO') NOT NULL DEFAULT 'ABIERTO',
    revisado_por         CHAR(36)    NULL,
    creado_en            TIMESTAMP   NOT NULL DEFAULT CURRENT_TIMESTAMP,
    resuelto_en          TIMESTAMP   NULL,
    PRIMARY KEY (id),
    KEY idx_rep_reportante (reportante_id),
    KEY idx_rep_reportado (usuario_reportado_id),
    KEY idx_rep_estado (estado),
    KEY idx_rep_evidencia (evidencia_archivo_id),
    KEY idx_rep_revisor (revisado_por),
    CONSTRAINT fk_rep_reportante FOREIGN KEY (reportante_id)        REFERENCES usuarios(id),
    CONSTRAINT fk_rep_reportado  FOREIGN KEY (usuario_reportado_id) REFERENCES usuarios(id),
    CONSTRAINT fk_rep_evidencia  FOREIGN KEY (evidencia_archivo_id) REFERENCES archivos(id) ON DELETE SET NULL,
    CONSTRAINT fk_rep_revisor    FOREIGN KEY (revisado_por)         REFERENCES usuarios(id),
    CONSTRAINT chk_rep_distintos CHECK (reportante_id <> usuario_reportado_id)
) ENGINE=InnoDB;

-- =====================================================================
-- VISTA PUBLICA: separa informacion publica de la privada.
-- La API publica debe leer SOLO de esta vista (sin email, telefono,
-- fecha de nacimiento exacta, documentos ni archivos sensibles).
-- =====================================================================
CREATE OR REPLACE VIEW v_jugadores_publicos AS
SELECT j.id,
       COALESCE(j.nombre_deportivo, u.nombre) AS nombre_publico,
       j.posicion_principal,
       j.posicion_secundaria,
       j.categoria,
       j.altura_cm,
       j.pierna_dominante,
       j.descripcion,
       p.nombre AS pais
FROM jugadores j
JOIN usuarios u ON u.id = j.usuario_id
JOIN paises   p ON p.id = u.pais_id
WHERE j.perfil_publico = TRUE
  AND j.estado_perfil  = 'ACTIVO'
  AND u.estado         = 'ACTIVO';

-- =====================================================================
-- DATOS INICIALES
-- =====================================================================

INSERT INTO roles (nombre, descripcion) VALUES
 ('JUGADOR',      'Deportista que muestra su talento en la plataforma'),
 ('CAZATALENTOS', 'Reclutador que revisa perfiles y contacta jugadores'),
 ('ADMIN',        'Administrador de la plataforma');

INSERT INTO habilidades (nombre, descripcion, categoria) VALUES
 ('Velocidad',  'Rapidez de desplazamiento',                'FISICA'),
 ('Regate',     'Capacidad de superar rivales con el balon', 'TECNICA'),
 ('Pase',       'Precision y vision en el pase',             'TECNICA'),
 ('Tiro',       'Potencia y precision al disparar',          'TECNICA'),
 ('Resistencia','Capacidad aerobica y fisica sostenida',     'FISICA'),
 ('Fuerza',     'Fuerza fisica en duelos',                   'FISICA'),
 ('Control',    'Control y recepcion del balon',             'TECNICA'),
 ('Definicion', 'Eficacia frente al arco',                   'TECNICA');

-- Paises iniciales (muestra). Estrategia para cargar todos:
-- importar un CSV ISO 3166-1 con LOAD DATA o desde un script del backend.
INSERT INTO paises (nombre, codigo_iso, codigo_telefono) VALUES
 ('Guatemala','GTM','+502'), ('Mexico','MEX','+52'),   ('Estados Unidos','USA','+1'),
 ('Espana','ESP','+34'),     ('Argentina','ARG','+54'),('Brasil','BRA','+55'),
 ('Colombia','COL','+57'),   ('Chile','CHL','+56'),    ('Uruguay','URY','+598'),
 ('Peru','PER','+51'),       ('Ecuador','ECU','+593'), ('Costa Rica','CRI','+506'),
 ('Honduras','HND','+504'),  ('El Salvador','SLV','+503'), ('Francia','FRA','+33'),
 ('Alemania','DEU','+49'),   ('Italia','ITA','+39'),   ('Portugal','PRT','+351'),
 ('Reino Unido','GBR','+44'),('Nigeria','NGA','+234'), ('Ghana','GHA','+233'),
 ('Senegal','SEN','+221'),   ('Japon','JPN','+81');

INSERT INTO pruebas (nombre, descripcion, tipo, puntuacion_maxima) VALUES
 ('Test de velocidad 30m',  'Sprint cronometrado de 30 metros', 'FISICA',  100),
 ('Test de control de balon','Circuito de conos con balon',      'TECNICA', 100);

-- =====================================================================
-- DATOS DE PRUEBA (solo desarrollo; password_hash es FALSO a proposito)
-- =====================================================================

SET @gt        := (SELECT id FROM paises WHERE codigo_iso = 'GTM');
SET @u_admin   := UUID();
SET @u_jug     := UUID();
SET @u_caza    := UUID();
SET @org       := UUID();
SET @jug       := UUID();
SET @caza      := UUID();
SET @op        := UUID();
SET @arch_vid  := UUID();
SET @vid       := UUID();
SET @ia        := UUID();
SET @post      := UUID();

INSERT INTO usuarios (id, nombre, apellido, email, password_hash, fecha_nacimiento, pais_id, estado, email_verificado) VALUES
 (@u_admin, 'Admin',  'FutureStar', 'admin@futurestar.test',  'HASH_DE_DESARROLLO_NO_USAR', '1990-01-01', @gt, 'ACTIVO', TRUE),
 (@u_jug,   'Carlos', 'Ramirez',    'carlos@futurestar.test', 'HASH_DE_DESARROLLO_NO_USAR', '2006-05-10', @gt, 'ACTIVO', TRUE),
 (@u_caza,  'Laura',  'Mendez',     'laura@futurestar.test',  'HASH_DE_DESARROLLO_NO_USAR', '1985-03-22', @gt, 'ACTIVO', TRUE);

INSERT INTO usuario_roles (usuario_id, rol_id) VALUES
 (@u_admin, (SELECT id FROM roles WHERE nombre='ADMIN')),
 (@u_jug,   (SELECT id FROM roles WHERE nombre='JUGADOR')),
 (@u_caza,  (SELECT id FROM roles WHERE nombre='CAZATALENTOS'));

INSERT INTO organizaciones (id, nombre, tipo, pais_id, ciudad, estado, verificada) VALUES
 (@org, 'Club Demo FC', 'CLUB', @gt, 'Ciudad de Guatemala', 'ACTIVA', TRUE);

INSERT INTO cazatalentos (id, usuario_id, organizacion_id, cargo, experiencia_anios, estado) VALUES
 (@caza, @u_caza, @org, 'Director de reclutamiento', 10, 'ACTIVO');

INSERT INTO jugadores (id, usuario_id, nombre_deportivo, posicion_principal, categoria, altura_cm, peso_kg,
                       pierna_dominante, perfil_publico, estado_perfil) VALUES
 (@jug, @u_jug, 'Carlitos', 'Delantero', 'Sub-20', 178, 70, 'DERECHA', TRUE, 'ACTIVO');

INSERT INTO jugador_habilidades (jugador_id, habilidad_id, nivel, evaluado)
SELECT @jug, id, 80, TRUE FROM habilidades WHERE nombre IN ('Velocidad','Regate','Definicion','Resistencia');

INSERT INTO archivos (id, usuario_id, tipo, nombre_original, almacenamiento_key, mime_type, tamano_bytes, publico, estado) VALUES
 (@arch_vid, @u_jug, 'VIDEO', 'partido1.mp4', 'videos/demo/partido1.mp4', 'video/mp4', 52428800, FALSE, 'ACTIVO');

INSERT INTO videos (id, jugador_id, archivo_id, titulo, tipo, duracion_segundos, estado) VALUES
 (@vid, @jug, @arch_vid, 'Mejores jugadas', 'PARTIDO', 180, 'ACTIVO');

INSERT INTO analisis_ia (id, jugador_id, video_id, modelo, version_modelo, puntuacion_general, confianza, resultado, datos_analizados) VALUES
 (@ia, @jug, @vid, 'futurestar-vision', '0.1', 87.5, 62.0, 'REQUIERE_REVISION',
  JSON_OBJECT('velocidad',87,'regate',91,'pase',82,'tiro',88,'control',90));

INSERT INTO evaluaciones_humanas (jugador_id, video_id, evaluador_id, analisis_ia_id, puntuacion, resultado, comentarios) VALUES
 (@jug, @vid, @u_caza, @ia, 85, 'APROBADO', 'Buen perfil, coincide con el analisis de IA.');

INSERT INTO oportunidades (id, organizacion_id, creado_por, titulo, posicion, edad_minima, edad_maxima,
                           pierna_dominante, pais_preferido_id, nivel_minimo, estado) VALUES
 (@op, @org, @u_caza, 'Delantero Sub-20', 'Delantero', 16, 20, 'DERECHA', @gt, 60, 'ABIERTA');

INSERT INTO oportunidad_habilidades (oportunidad_id, habilidad_id, nivel_minimo, peso) VALUES
 (@op, (SELECT id FROM habilidades WHERE nombre='Velocidad'),   70, 30),
 (@op, (SELECT id FROM habilidades WHERE nombre='Regate'),      70, 30),
 (@op, (SELECT id FROM habilidades WHERE nombre='Definicion'),  70, 25),
 (@op, (SELECT id FROM habilidades WHERE nombre='Resistencia'), 60, 15);

INSERT INTO resultados_matching (oportunidad_id, jugador_id, puntuacion_compatibilidad, nivel_confianza, factores) VALUES
 (@op, @jug, 88.50, 80.00, JSON_OBJECT('velocidad',30,'regate',30,'definicion',25,'resistencia',15));

INSERT INTO postulaciones (id, jugador_id, oportunidad_id, mensaje, estado) VALUES
 (@post, @jug, @op, 'Me interesa la oportunidad.', 'ENVIADA');

-- =====================================================================
-- CONSULTAS DE PRUEBA
-- =====================================================================

-- 1) Deben existir 35 tablas (la vista no cuenta)
SELECT COUNT(*) AS total_tablas
FROM information_schema.tables
WHERE table_schema = 'futurestar_db' AND table_type = 'BASE TABLE';

-- 2) Cantidad de claves foraneas
SELECT COUNT(*) AS total_fks
FROM information_schema.table_constraints
WHERE constraint_schema = 'futurestar_db' AND constraint_type = 'FOREIGN KEY';

-- 3) Usuarios con sus roles
SELECT u.email, r.nombre AS rol
FROM usuarios u
JOIN usuario_roles ur ON ur.usuario_id = u.id
JOIN roles r ON r.id = ur.rol_id;

-- 4) Ranking de matching para una oportunidad
SELECT o.titulo, CONCAT(u.nombre,' ',u.apellido) AS jugador, m.puntuacion_compatibilidad
FROM resultados_matching m
JOIN oportunidades o ON o.id = m.oportunidad_id
JOIN jugadores j ON j.id = m.jugador_id
JOIN usuarios u ON u.id = j.usuario_id
ORDER BY m.puntuacion_compatibilidad DESC;

-- 5) Analisis de IA que requieren revision humana
SELECT id, confianza, resultado, requiere_revision FROM analisis_ia WHERE requiere_revision = TRUE;

-- 6) Lo que ve el publico
SELECT * FROM v_jugadores_publicos;

-- 7) Pruebas de restricciones (cada una DEBE dar error):
-- INSERT INTO archivos (usuario_id,tipo,nombre_original,almacenamiento_key,mime_type,tamano_bytes,publico)
--   VALUES (@u_jug,'PASAPORTE','x.jpg','k','image/jpeg',1,TRUE);   -- viola chk_archivos_sensibles_privados
-- INSERT INTO postulaciones (jugador_id,oportunidad_id) VALUES (@jug,@op);   -- viola uq_post_jugador_op
-- INSERT INTO jugadores (usuario_id,altura_cm) VALUES (@u_caza,500);          -- viola chk_jugadores_altura