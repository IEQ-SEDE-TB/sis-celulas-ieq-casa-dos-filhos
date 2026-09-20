"use client";

import { useTransition } from "react";
import { Button } from "@/components/ui/Button";
import { toggleMemberActive } from "./actions";

export function ToggleMemberActiveButton({
  cellId,
  memberId,
  active,
}: {
  cellId: string;
  memberId: string;
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
          toggleMemberActive(cellId, memberId, !active);
        });
      }}
    >
      {active ? "Desativar" : "Ativar"}
    </Button>
  );
}
