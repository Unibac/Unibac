"use client";

import {
  CreatePropuestaFeriaDtoAreaCreativa,
  FeriaResponseDtoPeriodo,
  type PropuestaFeriaResponseDto,
  PropuestaFeriaResponseDtoEstado,
} from "@/api/generated/models";
import { ListCardThumbnail } from "@/components/shared/list-card-thumbnail";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const ESTADO_LABELS: Record<PropuestaFeriaResponseDtoEstado, string> = {
  [PropuestaFeriaResponseDtoEstado.POSTULADO]: "Postulado",
  [PropuestaFeriaResponseDtoEstado.ACEPTADO]: "Aceptado",
  [PropuestaFeriaResponseDtoEstado.RECHAZADO]: "Rechazado",
};

const AREA_LABELS: Record<CreatePropuestaFeriaDtoAreaCreativa, string> = {
  [CreatePropuestaFeriaDtoAreaCreativa.ARTES_PLASTICAS]: "Artes plásticas",
  [CreatePropuestaFeriaDtoAreaCreativa.MUSICA]: "Música",
  [CreatePropuestaFeriaDtoAreaCreativa.DISENO]: "Diseño",
  [CreatePropuestaFeriaDtoAreaCreativa.AUDIOVISUAL]: "Audiovisual",
};

function estadoHint(
  estado: PropuestaFeriaResponseDtoEstado,
  feriaPeriodo: FeriaResponseDtoPeriodo,
): string {
  if (estado === PropuestaFeriaResponseDtoEstado.POSTULADO) {
    if (feriaPeriodo === FeriaResponseDtoPeriodo.activa) {
      return "Tu propuesta está en revisión. Podés editarla mientras la feria esté en curso y siga en estado Postulado.";
    }
    return "Tu propuesta está en revisión. No podés editarla fuera del período activo de la feria.";
  }
  if (estado === PropuestaFeriaResponseDtoEstado.ACEPTADO) {
    return "Tu propuesta fue aceptada y puede aparecer en la vitrina pública.";
  }
  return "Tu propuesta fue rechazada. No podés editarla ni volver a registrar otra en esta feria.";
}

type MiPropuestaEnFeriaCardProps = {
  propuesta: PropuestaFeriaResponseDto;
  feriaPeriodo: FeriaResponseDtoPeriodo;
  canEdit: boolean;
  onEdit: () => void;
};

export function MiPropuestaEnFeriaCard({
  propuesta,
  feriaPeriodo,
  canEdit,
  onEdit,
}: MiPropuestaEnFeriaCardProps) {
  return (
    <section
      className="flex flex-col gap-2"
      aria-labelledby="mi-propuesta-feria-title"
    >
      <h3 id="mi-propuesta-feria-title" className="text-sm font-medium">
        Mi propuesta en esta feria
      </h3>
      <Card className="gap-0 py-0">
        <ListCardThumbnail
          src={propuesta.imagenUrl}
          alt={propuesta.nombreEmprendimiento}
        />
        <CardHeader className="gap-2 border-b border-border pb-4">
          <CardTitle className="text-base leading-snug">
            {propuesta.nombreEmprendimiento}
          </CardTitle>
          <p className="text-xs text-muted-foreground">
            Estado: {ESTADO_LABELS[propuesta.estado]}
            {" · "}
            {
              AREA_LABELS[
                propuesta.areaCreativa as CreatePropuestaFeriaDtoAreaCreativa
              ]
            }
          </p>
        </CardHeader>
        <CardContent className="pt-4 pb-4 text-sm text-muted-foreground">
          <p className="line-clamp-3">{propuesta.descripcionCorta}</p>
          <p className="mt-2 text-xs">
            {estadoHint(propuesta.estado, feriaPeriodo)}
          </p>
        </CardContent>
        {canEdit ? (
          <CardFooter className="border-t border-border pt-4 pb-6">
            <Button type="button" size="sm" variant="outline" onClick={onEdit}>
              Editar mi propuesta
            </Button>
          </CardFooter>
        ) : null}
      </Card>
    </section>
  );
}
