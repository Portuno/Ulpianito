import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { AuthForm } from "@/components/auth/auth-form";

const LoginPage = () => {
  return (
    <div className="grid min-h-screen grid-cols-1 bg-background lg:grid-cols-2">
      <section className="relative hidden overflow-hidden border-r border-zinc-800 bg-zinc-950 p-8 lg:flex lg:flex-col lg:justify-between">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(161,161,170,0.18)_0,_transparent_50%)]" />
          <div className="absolute left-8 top-24 h-40 w-40 rounded-full border border-zinc-800/70" />
          <div className="absolute right-14 top-14 h-28 w-28 rounded-md border border-zinc-800/70" />
          <div className="absolute bottom-16 left-16 h-52 w-[70%] rounded-2xl border border-zinc-800/80 bg-zinc-900/30 backdrop-blur-sm" />
        </div>

        <div className="relative z-10 space-y-6">
          <div className="inline-flex items-center rounded-full border border-zinc-700 px-3 py-1 text-xs text-zinc-300">
            Ulpianito Console v1.0
          </div>
          <h1 className="max-w-sm text-4xl font-semibold tracking-tight text-zinc-100">
            Un nuevo Derecho es posible
          </h1>
          <p className="max-w-md text-sm leading-relaxed text-zinc-400">
            Analiza, valida y estructura argumentos juridicos con una interfaz
            pensada para ampliar el juicio profesional de tu despacho.
          </p>
        </div>

        <div className="relative z-10 rounded-xl border border-zinc-800 bg-zinc-900/60 p-4 text-xs text-zinc-300">
          <div className="mb-3 flex items-center justify-between">
            <span className="text-zinc-400">Panel de contexto</span>
            <span className="rounded-full border border-zinc-700 px-2 py-0.5">
              Online
            </span>
          </div>
          <div className="space-y-2 font-mono">
            <p className="text-zinc-500">$ sistema.estado</p>
            <p>
              <span className="text-emerald-400">EXPEDIENTES:</span> 24 activos
            </p>
            <p>
              <span className="text-cyan-300">RIESGO:</span> 2 alertas de
              validacion
            </p>
            <p>
              <span className="text-fuchsia-300">FOCO:</span> audiencia y
              estrategia probatoria
            </p>
          </div>
        </div>
      </section>

      <section className="flex items-center justify-center px-6 py-10 sm:px-8">
        <Card className="w-full max-w-md border-border/80 shadow-sm">
          <CardHeader className="space-y-2 text-center">
            <CardTitle className="text-2xl font-semibold">Iniciar sesion</CardTitle>
            <CardDescription>
              Accede a tu exoesqueleto cognitivo juridico.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <AuthForm mode="login" />
            <div className="flex items-center justify-between text-sm">
              <Link
                href="/recuperar-password"
                className="text-muted-foreground transition-colors hover:text-primary"
              >
                Recuperar contrasena
              </Link>
              <Link
                href="/register"
                className="text-muted-foreground transition-colors hover:text-primary"
              >
                Crear cuenta
              </Link>
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  );
};

export default LoginPage;
