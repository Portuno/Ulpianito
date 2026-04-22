# Ulpianito v0.9 - IUS economia

## Alcance

Sistema de incentivos para conductas deseadas (validacion, aprendizaje, cierre de flujo) mediante wallet y ledger.

## Estado actual

- `Operativo`:
  - Wallet por perfil.
  - Ledger inmutable.
  - Reglas por `action_key`.
  - Claims idempotentes para recompensas.
  - Visualizacion de saldo en topbar y configuracion.
- `Parcial`:
  - Panel analitico de economia y anti-abuso aun basico.

## Evidencia en codigo

- UI:
  - `app/(dashboard)/ius/page.tsx`
  - `components/layout/ius-topbar-balance.tsx`
  - `app/(dashboard)/configuracion/page.tsx`
- Integracion de rewards:
  - `app/(dashboard)/misiones/actions.ts`
  - `app/(dashboard)/quizzes/actions.ts`

## Evidencia SQL

- `supabase/005_ius_gamification.sql`
  - `ius_wallets`
  - `ius_ledger`
  - `ius_reward_rules`
  - RPCs `claim_*`

## Riesgos y prioridades

- `P1`: definir topes/frecuencia por accion para prevenir gaming.
- `P1`: visibilidad de metricas de salud economica (emision, burn, saldo medio, fraude).
- `P2`: vincular IUS a rutas de progresion por rol.
