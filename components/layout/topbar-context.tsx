"use client";

import { usePathname } from "next/navigation";

type HeaderContent = {
  title: string;
  description?: string;
};

const routeHeaderMap: Record<string, HeaderContent> = {
  "/dashboard": {
    title: "Bienvenido",
    description: "Panel de eficiencia de tu despacho",
  },
  "/expedientes": {
    title: "Expedientes",
    description: "Gestiona tus expedientes y casos",
  },
  "/ingesta": {
    title: "Ingesta de Datos",
    description: "Centralizá expedientes y documentos para alimentar los flujos de IA.",
  },
  "/validacion": {
    title: "Validación (HITL)",
    description: "Revisión humana de resultados y control de calidad operativo.",
  },
  "/directorio": {
    title: "Directorio",
    description: "Gestiona contactos y datos clave del estudio.",
  },
  "/agentes": {
    title: "Flujos IA",
    description: "Orquesta automatizaciones para cada etapa del caso.",
  },
  "/misiones": {
    title: "Misiones Ius",
    description: "Completa objetivos y gana IUS por actividad.",
  },
  "/quizzes": {
    title: "Quizzes IA",
    description: "Entrena criterio legal y técnico con evaluaciones rápidas.",
  },
  "/academia": {
    title: "Academia Ulpianito",
    description: "Contenidos para acelerar adopción y productividad.",
  },
  "/documentacion": {
    title: "Documentación",
    description: "Guías, referencias y buenas prácticas del producto.",
  },
  "/configuracion": {
    title: "Configuración",
    description: "Ajustes de perfil, despacho y preferencias.",
  },
};

const getHeaderContent = (pathname: string): HeaderContent => {
  if (pathname.startsWith("/expedientes/nuevo")) {
    return {
      title: "Nuevo Expediente",
      description: "Crea un expediente y define su información base.",
    };
  }

  if (/^\/expedientes\/[^/]+\/documentos\/[^/]+$/.test(pathname)) {
    return {
      title: "Detalle de documento",
      description: "Visor del archivo y datos extraídos para validación.",
    };
  }

  if (/^\/expedientes\/[^/]+$/.test(pathname)) {
    return {
      title: "Detalle de Expediente",
      description: "Revisa estado, documentos y actividad del caso.",
    };
  }

  if (pathname.startsWith("/admin/revisiones")) {
    return {
      title: "Revisiones de entrenamiento",
      description: "Controla calidad y feedback de validaciones IA.",
    };
  }

  return (
    routeHeaderMap[pathname] ?? {
      title: "Ulpianito",
      description: "Panel operativo",
    }
  );
};

export const TopbarContext = () => {
  const pathname = usePathname();
  const { title, description } = getHeaderContent(pathname);

  return (
    <div className="min-w-0">
      <h1 className="truncate text-base font-bold tracking-tight md:text-lg">{title}</h1>
      {description ? (
        <p className="hidden truncate text-xs text-muted-foreground md:block">
          {description}
        </p>
      ) : null}
    </div>
  );
};
