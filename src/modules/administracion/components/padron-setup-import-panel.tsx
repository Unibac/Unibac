"use client";

import { DownloadIcon, Loader2Icon, UploadIcon } from "lucide-react";
import { useRef, useState } from "react";

import { PageCallout } from "@/components/shared/page-callout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getApiErrorMessage } from "@/lib/api/error-message";
import { useSetupImportMutation } from "@/modules/administracion/hooks/use-setup-import-mutation";
import type {
  SetupImportResultDto,
  SetupImportRowEstado,
} from "@/modules/shared/types/api-models";

const TEMPLATE_PATH = "/templates/padron-carga-masiva.xlsx";

const ESTADO_LABELS: Record<SetupImportRowEstado, string> = {
  ok: "Válida",
  error: "Error",
  duplicado: "Duplicado",
  omitido: "Omitido",
};

function estadoBadgeVariant(
  estado: SetupImportRowEstado,
): "default" | "secondary" | "destructive" | "outline" {
  switch (estado) {
    case "ok":
      return "default";
    case "duplicado":
      return "secondary";
    case "error":
      return "destructive";
    default:
      return "outline";
  }
}

export function PadronSetupImportPanel() {
  const fileRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<SetupImportResultDto | null>(null);
  const [apiError, setApiError] = useState<string | null>(null);
  const importMut = useSetupImportMutation();

  function onFileChange(file: File | null) {
    setSelectedFile(file);
    setPreview(null);
    setApiError(null);
  }

  async function runImport(dryRun: boolean) {
    if (!selectedFile) return;
    setApiError(null);
    try {
      const result = await importMut.mutateAsync({
        file: selectedFile,
        dryRun,
      });
      setPreview(result);
    } catch (err) {
      setApiError(getApiErrorMessage(err));
    }
  }

  const pending = importMut.isPending;
  const canImport = preview != null && preview.resumen.filasValidas > 0;

  return (
    <div className="flex flex-col gap-4">
      <PageCallout variant="muted" title="Carga masiva desde Excel">
        La plantilla tiene tres hojas (PROGRAMAS, ESTUDIANTES, MATRICULA) con
        solo las columnas que se guardan en el padrón. Las cuentas de acceso se
        crean cuando cada estudiante completa el registro público.
      </PageCallout>

      <div className="flex flex-wrap items-end gap-3">
        <Button type="button" variant="outline" size="sm" asChild>
          <a href={TEMPLATE_PATH} download>
            <DownloadIcon className="size-4" data-icon="inline-start" />
            Descargar plantilla
          </a>
        </Button>
        <div className="flex min-w-[220px] flex-1 flex-col gap-1.5">
          <Label htmlFor="setup-import-file" className="text-sm">
            Archivo Excel
          </Label>
          <Input
            id="setup-import-file"
            ref={fileRef}
            type="file"
            accept=".xlsx,.xls,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel"
            className="text-sm"
            onChange={(e) => onFileChange(e.target.files?.[0] ?? null)}
          />
        </div>
        <Button
          type="button"
          size="sm"
          variant="outline"
          disabled={!selectedFile || pending}
          onClick={() => void runImport(true)}
        >
          {pending ? (
            <Loader2Icon
              className="size-4 animate-spin"
              data-icon="inline-start"
            />
          ) : (
            <UploadIcon className="size-4" data-icon="inline-start" />
          )}
          Validar
        </Button>
        <Button
          type="button"
          size="sm"
          disabled={!canImport || pending}
          onClick={() => void runImport(false)}
        >
          {pending ? (
            <Loader2Icon
              className="size-4 animate-spin"
              data-icon="inline-start"
            />
          ) : null}
          Importar
        </Button>
      </div>

      {apiError ? (
        <PageCallout
          variant="destructive"
          title="No se pudo procesar el archivo"
        >
          {apiError}
        </PageCallout>
      ) : null}

      {preview ? (
        <>
          <div className="grid gap-2 text-sm sm:grid-cols-2 lg:grid-cols-4">
            <p>
              <span className="text-muted-foreground">Programas:</span>{" "}
              {preview.resumen.programasLeidos}
            </p>
            <p>
              <span className="text-muted-foreground">Estudiantes:</span>{" "}
              {preview.resumen.estudiantesLeidos}
            </p>
            <p>
              <span className="text-muted-foreground">Matrículas:</span>{" "}
              {preview.resumen.matriculasLeidas}
            </p>
            <p>
              <span className="text-muted-foreground">Válidas:</span>{" "}
              {preview.resumen.filasValidas}
            </p>
            {!preview.dryRun ? (
              <p>
                <span className="text-muted-foreground">Creadas:</span>{" "}
                {preview.resumen.creadas}
              </p>
            ) : null}
            <p>
              <span className="text-muted-foreground">Duplicadas:</span>{" "}
              {preview.resumen.duplicadas}
            </p>
            <p>
              <span className="text-muted-foreground">Errores:</span>{" "}
              {preview.resumen.errores}
            </p>
          </div>

          {preview.resumen.errores > 0 ? (
            <PageCallout variant="destructive" title="Hay filas con errores">
              Revise la tabla de detalle antes de importar.
            </PageCallout>
          ) : null}

          <div className="rounded-md border border-border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-14">Fila</TableHead>
                  <TableHead>Identificación</TableHead>
                  <TableHead>Código</TableHead>
                  <TableHead>Nombre</TableHead>
                  <TableHead>Programa</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Mensaje</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {preview.filas.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={7}
                      className="text-center text-sm text-muted-foreground"
                    >
                      No hay filas de matrícula en el archivo.
                    </TableCell>
                  </TableRow>
                ) : (
                  preview.filas.map((row) => (
                    <TableRow
                      key={`${row.fila}-${row.identificacion}-${row.codigoEstudiantil}-${row.estado}`}
                    >
                      <TableCell className="tabular-nums-mono text-sm">
                        {row.fila || "—"}
                      </TableCell>
                      <TableCell className="tabular-nums-mono text-sm">
                        {row.identificacion || "—"}
                      </TableCell>
                      <TableCell className="tabular-nums-mono text-sm">
                        {row.codigoEstudiantil || "—"}
                      </TableCell>
                      <TableCell className="text-sm">
                        {row.nombres || row.apellidos
                          ? `${row.nombres} ${row.apellidos}`.trim()
                          : "—"}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {row.programa ?? "—"}
                      </TableCell>
                      <TableCell>
                        <Badge variant={estadoBadgeVariant(row.estado)}>
                          {ESTADO_LABELS[row.estado]}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {row.mensaje ?? "—"}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </>
      ) : null}
    </div>
  );
}
