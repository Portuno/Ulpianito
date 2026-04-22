# Ulpianito v0.9 - Indice maestro

## Objetivo de esta carpeta

Consolidar el estado real del producto en una sola base documental, con trazabilidad a codigo, SQL, documentacion previa y decisiones de chats.

## Mapa de documentos

- `01_estado_general_producto.md`: estado actual, alcance, fortalezas y brechas.
- `02_expedientes.md`: modulo de expedientes y flujo documental.
- `03_misiones_ia.md`: pipeline de misiones IA y entrenamiento.
- `04_hitl_validacion.md`: operacion HITL y cola de validacion.
- `05_ius_economia.md`: wallet, ledger, recompensas y reglas.
- `06_quizzes.md`: generacion, resolucion y recompensa por quizzes.
- `07_seguridad_roles_rls.md`: matriz de acceso, roles y hardening.
- `08_edge_functions_y_contratos.md`: funciones edge, contratos y resiliencia.
- `09_analytics_eventos_kpis.md`: tracking de eventos y KPIs operativos.
- `10_user_stories.md`: historias de usuario priorizadas por rol.
- `11_modulos_y_funciones_actuales.md`: inventario funcional completo.
- `12_roadmap.md`: plan 30/60/90 con prioridades P0/P1/P2.
- `13_analisis_de_mercado.md`: benchmark competitivo y posicionamiento.

## Fuentes base utilizadas

- Codigo app: `app/(dashboard)`, `components`, `lib`.
- Backend y datos: `supabase/*.sql`, `supabase/functions`.
- Documentos existentes en `docs/`.
- Chats parent relevantes: [Plan integral solicitado](4e0d0b5d-b24c-4e09-86d3-c28eb0c6880f), [Docs v0.9 solicitados](0320dd44-3827-4382-8870-d36506efaf69).

## Convenciones de lectura

- Estado por capacidad:
  - `Operativo`: funciona y tiene evidencia en codigo/SQL.
  - `Parcial`: existe pero falta cierre funcional.
  - `Pendiente`: disenado pero no implementado.
- Prioridad:
  - `P0`: bloqueante de operacion o riesgo de datos.
  - `P1`: impacto alto en calidad/escala.
  - `P2`: mejora incremental.
