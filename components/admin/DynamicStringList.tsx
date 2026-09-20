"use client";

import { useId, useState } from "react";
import { Button } from "@/components/ui/Button";

/**
 * Lista dinâmica de campos de texto (ex: checklist, versículos,
 * perguntas-chave). Todos os inputs compartilham o mesmo `name`, então no
 * server action basta usar `formData.getAll(name)` para recuperar o
 * array completo — sem precisar serializar/parsear JSON manualmente.
 */
export function DynamicStringList({
  name,
  label,
  placeholder,
  initialValues,
}: {
  name: string;
  label: string;
  placeholder?: string;
  initialValues?: string[];
}) {
  const [values, setValues] = useState<string[]>(
    initialValues && initialValues.length > 0 ? initialValues : [""]
  );
  const baseId = useId();

  function updateValue(index: number, value: string) {
    setValues((prev) => prev.map((v, i) => (i === index ? value : v)));
  }

  function removeValue(index: number) {
    setValues((prev) =>
      prev.length === 1 ? [""] : prev.filter((_, i) => i !== index)
    );
  }

  function addValue() {
    setValues((prev) => [...prev, ""]);
  }

  return (
    <div>
      <span className="block text-sm font-medium text-gray-700">{label}</span>
      <div className="mt-2 space-y-2">
        {values.map((value, index) => (
          <div key={`${baseId}-${index}`} className="flex gap-2">
            <input
              type="text"
              name={name}
              value={value}
              placeholder={placeholder}
              onChange={(event) => updateValue(index, event.target.value)}
              className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-gray-500 focus:outline-none"
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => removeValue(index)}
            >
              Remover
            </Button>
          </div>
        ))}
      </div>
      <Button type="button" variant="ghost" size="sm" onClick={addValue} className="mt-2">
        + Adicionar item
      </Button>
    </div>
  );
}
