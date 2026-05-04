import { Scissors } from "lucide-react";
import { login } from "@/app/login/actions";

type PageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

function readParam(params: Record<string, string | string[] | undefined>, key: string) {
  const value = params[key];
  return Array.isArray(value) ? value[0] : value ?? "";
}

export default async function LoginPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const error = readParam(params, "error");
  const next = readParam(params, "next") || "/dashboard";

  return (
    <main className="grid min-h-screen place-items-center bg-fog px-6 py-10 text-ink">
      <section className="w-full max-w-md rounded bg-white p-6 shadow-soft">
        <div className="mb-6 flex items-center gap-3">
          <div className="grid h-11 w-11 place-items-center rounded bg-ink text-white">
            <Scissors size={21} />
          </div>
          <div>
            <p className="font-black">BarberFlow</p>
            <p className="text-sm text-neutral-600">Acceso dashboard</p>
          </div>
        </div>

        <h1 className="text-3xl font-black">Iniciar sesion</h1>
        <p className="mt-2 text-neutral-700">Entra para gestionar citas, servicios y disponibilidad.</p>

        <form action={login} className="mt-6 grid gap-4">
          <input name="next" type="hidden" value={next} />
          <label className="grid gap-2 text-sm font-bold">
            Email
            <input className="focus-ring rounded border border-neutral-200 px-3 py-3" name="email" required type="email" />
          </label>
          <label className="grid gap-2 text-sm font-bold">
            Password
            <input className="focus-ring rounded border border-neutral-200 px-3 py-3" name="password" required type="password" />
          </label>
          {error ? <p className="rounded bg-red-50 p-3 text-sm font-bold text-red-700">{error}</p> : null}
          <button className="focus-ring rounded bg-ember px-4 py-3 font-black text-white" type="submit">
            Entrar
          </button>
        </form>
      </section>
    </main>
  );
}
