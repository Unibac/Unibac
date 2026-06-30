"use client";

import {
  AreaCreativaEmprendimiento,
  FeriaPeriodo,
  type PropuestaFeriaResponseDto,
  EstadoPropuestaFeria,
} from "@/modules/shared/types/api-models";
import { ListCardContent } from "@/components/shared/list-card-content";
import { ListCardFooter } from "@/components/shared/list-card-footer";
import { ListCardHeader } from "@/components/shared/list-card-header";
import { ListCardThumbnail } from "@/components/shared/list-card-thumbnail";
import { ListCardWithMedia } from "@/components/shared/list-card-with-media";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CardDescription, CardTitle } from "@/components/ui/card";
import { feriaPermitePostulacion } from "@/modules/ferias/lib/propuesta-feria-rules";

const ESTADO_LABELS: Record<EstadoPropuestaFeria, string> = {
  [EstadoPropuestaFeria.POSTULADO]: "Postulado",
  [EstadoPropuestaFeria.ACEPTADO]: "Aceptado",
  [EstadoPropuestaFeria.RECHAZADO]: "Rechazado",
};

const AREA_LABELS: Record<AreaCreativaEmprendimiento, string> = {
  [AreaCreativaEmprendimiento.ARTES_PLASTICAS]: "Artes plásticas",
  [AreaCreativaEmprendimiento.MUSICA]: "Música",
  [AreaCreativaEmprendimiento.DISENO]: "Diseño",
  [AreaCreativaEmprendimiento.AUDIOVISUAL]: "Audiovisual",
};

function propuestaEstadoBadgeVariant(
  estado: EstadoPropuestaFeria,
): "default" | "secondary" | "destructive" {
  if (estado === EstadoPropuestaFeria.RECHAZADO) return "destructive";
  if (estado === EstadoPropuestaFeria.ACEPTADO) return "default";
  return "secondary";
}

function estadoHint(
  estado: EstadoPropuestaFeria,
  feriaPeriodo: FeriaPeriodo,
): string {
  if (estado === EstadoPropuestaFeria.POSTULADO) {
    if (feriaPermitePostulacion(feriaPeriodo)) {
      if (feriaPeriodo === FeriaPeriodo.proxima) {
        return "Tu propuesta está en revisión. Puedes editarla mientras la feria esté próxima o en curso y siga en estado Postulado.";
      }
      return "Tu propuesta está en revisión. Puedes editarla mientras la feria esté en curso y siga en estado Postulado.";
    }
    return "Tu propuesta está en revisión. No puedes editarla: la feria ya finalizó.";
  }
  if (estado === EstadoPropuestaFeria.ACEPTADO) {
    return "Tu propuesta fue aceptada y puede aparecer en la vitrina pública.";
  }
  return "Tu propuesta fue rechazada. No puedes editarla ni volver a registrar otra en esta feria.";
}

type MiPropuestaEnFeriaCardProps = {
  propuesta: PropuestaFeriaResponseDto;
  feriaPeriodo: FeriaPeriodo;
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
                  propuesta.areaCreativa as AreaCreativaEmprendimiento
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
