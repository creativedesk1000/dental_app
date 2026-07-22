import { ReactNode } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface AdminPageShellProps {
  title: string;
  description: string;
  actions?: ReactNode;
  children: ReactNode;
}

export function AdminPageShell({
  title,
  description,
  actions,
  children,
}: AdminPageShellProps) {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">{title}</h1>
          <p className="mt-1 text-sm text-gray-500">{description}</p>
        </div>
        {actions ? <div>{actions}</div> : null}
      </div>

      <Card className="border-none shadow-sm shadow-gray-200">
        <CardHeader>
          <CardTitle className="text-lg">Overview</CardTitle>
        </CardHeader>
        <CardContent>{children}</CardContent>
      </Card>
    </div>
  );
}

export default AdminPageShell;
