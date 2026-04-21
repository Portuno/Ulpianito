# Edge Functions de Ius v1

Funciones incluidas:
- `extractor-ius-basic`
- `validator-ius-entities`
- `planner-ius`
- `writer-ius-document`
- `ius-generate-quiz`
- `document-extract-gemini` (extracción estructurada por documento del expediente)

## Deploy sugerido (manual)
1. `supabase functions deploy extractor-ius-basic`
2. `supabase functions deploy validator-ius-entities`
3. `supabase functions deploy planner-ius`
4. `supabase functions deploy writer-ius-document`
5. `supabase functions deploy ius-generate-quiz`
6. `supabase functions deploy document-extract-gemini`

## Variables
- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`

Opcional para próxima iteración (LLM real):
- `OPENAI_API_KEY`

Extracción de documentos (Gemini):
- `GEMINI_API_KEY` (requerida en `document-extract-gemini`)
- `GEMINI_MODEL` (opcional, por defecto `gemini-2.0-flash`)
