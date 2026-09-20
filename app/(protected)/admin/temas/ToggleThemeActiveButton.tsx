"use client";

import { useTransition } from "react";
import { Button } from "@/components/ui/Button";
import { toggleThemeActive } from "./actions";

export function ToggleThemeActiveButton({
  themeId,
  active,
}: {
  themeId: string;
  active: boolean;
}) {
  const [isPending, startTransition] = useTransition();

  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      disabled={isPending}
      onClick={() => {
        startTransition(() => {
          toggleThemeActive(themeId, !active);
        });
      }}
    >
      {active ? "Desativar" : "Ativar"}
    </Button>
  );
}
