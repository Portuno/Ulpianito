# Ius v1 QA Checklist

## Roles y permisos
- [ ] Usuario `jurista` no accede a `/admin/revisiones`.
- [ ] Usuario `admin` sí puede publicar revisión de entrenamiento.
- [ ] Usuario solo ve misiones/quizzes de su despacho por RLS.

## Misiones
- [ ] Se puede crear `mission_run` desde `/misiones`.
- [ ] Paso 1 genera eventos y cambia estado a `needs_human`.
- [ ] Paso 2 HITL exige nombres reales y confirmación de riesgo.
- [ ] Paso 3 genera plan y borrador.
- [ ] Paso 4 (admin) marca `training_done`.

## IUS
- [ ] Se acredita IUS por `mission_step_extract`.
- [ ] Se acredita IUS por `mission_step_hitl`.
- [ ] Se acredita IUS por `mission_step_plan_write`.
- [ ] Se acredita IUS por `mission_training_approved`.
- [ ] No hay duplicación de recompensa (idempotencia en ledger).

## Quizzes
- [ ] Se crea quiz y se generan preguntas vía `ius-generate-quiz`.
- [ ] Se guarda intento y respuestas.
- [ ] Si score >= threshold, se acredita IUS.
- [ ] Si score < threshold, no se acredita IUS.

## UI
- [ ] Sidebar muestra accesos a Misiones/Quizzes/IUS.
- [ ] Dashboard muestra saldo IUS y actividad semanal.
- [ ] Configuración muestra saldo + últimos movimientos.
