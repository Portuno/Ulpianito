import { createClient } from "@/lib/supabase/server";

export const invokeEdgeFunction = async <T>(
  functionName: string,
  body: Record<string, unknown>
): Promise<T> => {
  const supabase = await createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session?.access_token) {
    throw new Error("Sesión no disponible");
  }

  const url = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/${functionName}`;
  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${session.access_token}`,
      apikey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    },
    body: JSON.stringify(body),
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
