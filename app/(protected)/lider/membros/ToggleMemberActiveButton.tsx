"use client";

import { useTransition } from "react";
import { Button } from "@/components/ui/Button";
import { toggleMemberActive } from "./actions";

export function ToggleMemberActiveButton({
  memberId,
  active,
}: {
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
          toggleMemberActive(memberId, !active);
        });
      }}
    >
      {active ? "Desativar" : "Ativar"}
    </Button>
  );
}
