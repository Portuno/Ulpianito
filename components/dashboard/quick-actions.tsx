import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FolderPlus, FolderOpen } from "lucide-react";

export const QuickActions = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Acciones rápidas</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-3">
        <Button asChild variant="outline" className="justify-start gap-2">
          <Link href="/expedientes/nuevo">
            <FolderPlus className="h-4 w-4" aria-hidden="true" />
            Nuevo expediente
          </Link>
        </Button>
        <Button asChild variant="outline" className="justify-start gap-2">
          <Link href="/expedientes">
            <FolderOpen className="h-4 w-4" aria-hidden="true" />
            Ver expedientes
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
};
