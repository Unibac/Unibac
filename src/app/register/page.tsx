import { RegisterPublicFlow } from "@/modules/auth/components/register-public-flow";

export default function RegisterPage() {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center bg-background p-6">
      <RegisterPublicFlow />
    </div>
  );
}
