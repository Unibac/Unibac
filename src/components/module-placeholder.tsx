import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

type ModulePlaceholderProps = {
  title: string;
  description?: string;
};

export function ModulePlaceholder({
  title,
  description = "Estamos trabajando en esta sección. Pronto podrás gestionar el módulo desde aquí.",
}: ModulePlaceholderProps) {
  return (
    <Card>
      <CardHeader className="flex flex-col gap-2">
        <CardTitle className="text-xl">{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
    </Card>
  );
}
