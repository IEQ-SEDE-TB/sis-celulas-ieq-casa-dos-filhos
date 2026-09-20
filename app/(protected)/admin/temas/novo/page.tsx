import { ThemeForm } from "../ThemeForm";

export default function NovoTemaPage() {
  return (
    <div>
      <h2 className="text-xl font-semibold text-gray-900">Novo tema</h2>
      <p className="mt-1 text-sm text-gray-500">
        Cadastre um novo ciclo de estudo para as células.
      </p>

      <div className="mt-6">
        <ThemeForm />
      </div>
    </div>
  );
}
