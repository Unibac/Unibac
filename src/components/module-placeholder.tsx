import { PanelCard } from "@/components/shared/panel-card";
import { CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

type ModulePlaceholderProps = {
  title: string;
  description?: string;
};

export function ModulePlaceholder({
  title,
  description = "Estamos trabajando en esta sección. Pronto podrás gestionar el módulo desde aquí.",
}: ModulePlaceholderProps) {
  return (
    <PanelCard className="max-w-2xl">
      <CardHeader className="flex flex-col gap-2">
        <CardTitle className="text-base">{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
    </PanelCard>
  );
}
