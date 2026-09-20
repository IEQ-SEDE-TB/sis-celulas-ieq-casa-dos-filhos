"use client";

import { useTransition } from "react";
import { Button } from "@/components/ui/Button";
import { toggleCellActive } from "./actions";

export function ToggleCellActiveButton({
  cellId,
  active,
}: {
  cellId: string;
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
          toggleCellActive(cellId, !active);
        });
      }}
    >
      {active ? "Desativar" : "Ativar"}
    </Button>
  );
}
