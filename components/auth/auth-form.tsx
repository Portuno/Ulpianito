"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { login, register, type AuthState } from "@/app/(auth)/actions";

type AuthFormProps = {
  mode: "login" | "register";
};

const initialState: AuthState = { error: null };

export const AuthForm = ({ mode }: AuthFormProps) => {
  const action = mode === "login" ? login : register;
  const [state, formAction, isPending] = useActionState(action, initialState);

  return (
    <form action={formAction} className="space-y-4">
      {state.error && (
        <div
          className="rounded-md bg-destructive/10 p-3 text-sm text-destructive"
          role="alert"
        >
          {state.error}
        </div>
      )}

      {state.success && (
        <div
          className="rounded-md bg-green-500/10 p-3 text-sm text-green-700 dark:text-green-400"
          role="status"
        >
          {state.success}
        </div>
      )}

      {mode === "register" && (
        <>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="nombre">Nombre</Label>
              <Input id="nombre" name="nombre" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="apellido">Apellido</Label>
              <Input id="apellido" name="apellido" required />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="nombreDespacho">Nombre del Despacho</Label>
            <Input
              id="nombreDespacho"
              name="nombreDespacho"
              placeholder="ej. Bufete García & Asociados"
              required
            />
          </div>
        </>
      )}

      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          name="email"
          type="email"
          placeholder="tu@email.com"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="password">Contraseña</Label>
        <Input
          id="password"
          name="password"
          type="password"
          required
          minLength={6}
        />
      </div>

      <Button type="submit" className="w-full" disabled={isPending}>
        {isPending
          ? "Cargando..."
          : mode === "login"
            ? "Iniciar Sesión"
            : "Crear Cuenta"}
      </Button>
    </form>
  );
};
