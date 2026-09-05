import { GoogleSignInButton } from "@/components/auth/GoogleSignInButton";

export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-6 py-16">
      <div className="w-full max-w-md rounded-lg border border-gray-200 bg-white p-10 text-center shadow-sm">
        <h1 className="text-2xl font-semibold tracking-tight text-gray-900">
          SIS Células IEQ Casa dos Filhos
        </h1>
        <p className="mt-2 text-sm text-gray-500">
          Igreja Quadrangular Sede &ldquo;Casa dos Filhos&rdquo; &mdash; Tubarão/SC
        </p>

        <div className="mt-8 flex justify-center">
          <GoogleSignInButton />
        </div>

        <p className="mt-8 text-xs text-gray-400">
          Sistema em desenvolvimento.
        </p>
      </div>
    </main>
  );
}
