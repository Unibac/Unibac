"use client";

import {
  CreatePropuestaFeriaDtoAreaCreativa,
  FeriaResponseDtoPeriodo,
  type PropuestaFeriaResponseDto,
  PropuestaFeriaResponseDtoEstado,
} from "@/api/generated/models";
import { ListCardContent } from "@/components/shared/list-card-content";
import { ListCardFooter } from "@/components/shared/list-card-footer";
import { ListCardHeader } from "@/components/shared/list-card-header";
import { ListCardThumbnail } from "@/components/shared/list-card-thumbnail";
import { ListCardWithMedia } from "@/components/shared/list-card-with-media";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CardDescription, CardTitle } from "@/components/ui/card";
import { feriaPermitePostulacion } from "@/modules/ferias/lib/propuesta-feria-rules";

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

function propuestaEstadoBadgeVariant(
  estado: PropuestaFeriaResponseDtoEstado,
): "default" | "secondary" | "destructive" {
  if (estado === PropuestaFeriaResponseDtoEstado.RECHAZADO) return "destructive";
  if (estado === PropuestaFeriaResponseDtoEstado.ACEPTADO) return "default";
  return "secondary";
}

function estadoHint(
  estado: PropuestaFeriaResponseDtoEstado,
  feriaPeriodo: FeriaResponseDtoPeriodo,
): string {
  if (estado === PropuestaFeriaResponseDtoEstado.POSTULADO) {
    if (feriaPermitePostulacion(feriaPeriodo)) {
      if (feriaPeriodo === FeriaResponseDtoPeriodo.proxima) {
        return "Tu propuesta está en revisión. Podés editarla mientras la feria esté próxima o en curso y siga en estado Postulado.";
      }
      return "Tu propuesta está en revisión. Podés editarla mientras la feria esté en curso y siga en estado Postulado.";
    }
    return "Tu propuesta está en revisión. No podés editarla: la feria ya finalizó.";
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
      <ListCardWithMedia>
        <ListCardThumbnail
          src={propuesta.imagenUrl}
          alt={propuesta.nombreEmprendimiento}
        />
        <ListCardHeader className="gap-2">
          <CardTitle className="text-base leading-snug">
            {propuesta.nombreEmprendimiento}
          </CardTitle>
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant={propuestaEstadoBadgeVariant(propuesta.estado)}>
              {ESTADO_LABELS[propuesta.estado]}
            </Badge>
            <CardDescription className="text-xs">
              {
                AREA_LABELS[
                  propuesta.areaCreativa as CreatePropuestaFeriaDtoAreaCreativa
                ]
              }
            </CardDescription>
          </div>
        </ListCardHeader>
        <ListCardContent className="pb-4 text-muted-foreground">
          <p className="line-clamp-3 text-sm">{propuesta.descripcionCorta}</p>
          <CardDescription className="text-xs">
            {estadoHint(propuesta.estado, feriaPeriodo)}
          </CardDescription>
        </ListCardContent>
        {canEdit ? (
          <ListCardFooter>
            <Button type="button" size="sm" variant="outline" onClick={onEdit}>
              Editar mi propuesta
            </Button>
          </ListCardFooter>
        ) : null}
      </ListCardWithMedia>
    </section>
  );
}
