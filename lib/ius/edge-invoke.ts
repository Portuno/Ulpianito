import { createClient } from "@/lib/supabase/server";

export const invokeEdgeFunction = async <T>(
  functionName: string,
  body: Record<string, unknown>
): Promise<T> => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error("Configuración de Supabase incompleta para Edge Functions");
  }

  const supabase = await createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session?.access_token) {
    throw new Error("Sesión no disponible");
  }

  const url = `${supabaseUrl}/functions/v1/${functionName}`;
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 30_000);
  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${session.access_token}`,
      apikey: supabaseAnonKey,
      "x-client-info": "ulpianito-web",
    },
    body: JSON.stringify(body),
    signal: controller.signal,
  }).finally(() => {
    clearTimeout(timeoutId);
  });

  const json = (await res.json()) as T & { error?: string };

  if (!res.ok) {
    const msg =
      typeof json === "object" && json && "error" in json && json.error
        ? String(json.error)
        : res.statusText;
    throw new Error(msg);
  }

  return json as T;
};
