import type React from "react";
import { Clock, DollarSign, Scissors } from "lucide-react";
import { formatMoney } from "@/lib/format";
import { getDashboardContext } from "@/lib/data";
import { createService, deactivateService, updateService } from "@/app/dashboard/services/actions";

export default async function ServicesPage() {
  const context = await getDashboardContext();
  if (!context) {
    return <EmptyState />;
  }
  const services = context?.services ?? [];

  return (
    <div className="grid gap-5">
      <header className="rounded bg-white p-5 shadow-soft">
        <p className="text-sm font-bold uppercase tracking-[0.18em] text-ember">Servicios editables</p>
        <h1 className="mt-1 text-3xl font-black">Precios y duraciones</h1>
        <p className="mt-2 max-w-2xl text-neutral-700">Administra lo que el cliente ve al reservar: nombre, duracion, precio y estado.</p>
      </header>

      <section className="rounded bg-white p-5 shadow-soft">
        <h2 className="text-xl font-black">Nuevo servicio</h2>
        <form action={createService} className="mt-4 grid gap-3 md:grid-cols-[1fr_140px_140px_auto_auto] md:items-end">
          <Field label="Nombre">
            <input className="focus-ring rounded border border-neutral-200 px-3 py-3" name="name" placeholder="Ej. Tinte" required />
          </Field>
          <Field label="Minutos">
            <input className="focus-ring rounded border border-neutral-200 px-3 py-3" min="5" name="durationMinutes" required type="number" />
          </Field>
          <Field label="Precio USD">
            <input className="focus-ring rounded border border-neutral-200 px-3 py-3" min="0" name="price" required step="0.01" type="number" />
          </Field>
          <label className="flex h-12 items-center gap-2 rounded bg-fog px-3 text-sm font-bold">
            <input defaultChecked name="isActive" type="checkbox" />
            Activo
          </label>
          <button className="rounded bg-ember px-4 py-3 font-black text-white" type="submit">
            Crear
          </button>
        </form>
      </section>

      <section className="grid gap-3">
        {services.map((service) => (
          <article className="rounded bg-white p-5 shadow-soft" key={service.id}>
            <form action={updateService} className="grid gap-4 lg:grid-cols-[1fr_150px_150px_auto_auto] lg:items-end">
              <input name="id" type="hidden" value={service.id} />
              <div>
                <div className="flex items-center gap-2">
                  <Scissors size={18} className="text-ember" />
                  <h2 className="text-xl font-black">{service.name}</h2>
                </div>
                <div className="mt-3 flex flex-wrap gap-3 text-sm text-neutral-700">
                  <span className="inline-flex items-center gap-1 rounded bg-fog px-3 py-1 font-bold">
                    <Clock size={15} />
                    {service.durationMinutes} min
                  </span>
                  <span className="inline-flex items-center gap-1 rounded bg-fog px-3 py-1 font-bold">
                    <DollarSign size={15} />
                    {formatMoney(service.priceCents)}
                  </span>
                </div>
              </div>
              <Field label="Nombre">
                <input className="focus-ring rounded border border-neutral-200 px-3 py-3" defaultValue={service.name} name="name" required />
              </Field>
              <Field label="Minutos">
                <input
                  className="focus-ring rounded border border-neutral-200 px-3 py-3"
                  defaultValue={service.durationMinutes}
                  min="5"
                  name="durationMinutes"
                  required
                  type="number"
                />
              </Field>
              <Field label="Precio USD">
                <input
                  className="focus-ring rounded border border-neutral-200 px-3 py-3"
                  defaultValue={(service.priceCents / 100).toFixed(2)}
                  min="0"
                  name="price"
                  required
                  step="0.01"
                  type="number"
                />
              </Field>
              <label className="flex h-12 items-center gap-2 rounded bg-fog px-3 text-sm font-bold">
                <input defaultChecked={service.isActive} name="isActive" type="checkbox" />
                Activo
              </label>
              <div className="flex gap-2">
                <button className="rounded bg-ink px-4 py-3 font-bold text-white" type="submit">
                  Guardar
                </button>
                <button className="rounded border border-neutral-200 px-4 py-3 font-bold" formAction={deactivateService} type="submit">
                  Ocultar
                </button>
              </div>
            </form>
          </article>
        ))}
      </section>
    </div>
  );
}

function Field({ children, label }: { children: React.ReactNode; label: string }) {
  return (
    <label className="grid gap-2 text-sm font-bold">
      {label}
      {children}
    </label>
  );
}

function EmptyState() {
  return (
    <section className="rounded bg-white p-5 shadow-soft">
      <h1 className="text-2xl font-black">Usuario sin barberia asignada.</h1>
      <p className="mt-2 text-neutral-700">Ejecuta db/link-admin-user.sql despues de crear el usuario en Supabase Auth.</p>
    </section>
  );
}
