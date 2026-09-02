import { ArrowUpRight, CheckCircle2, CircleDashed, Sparkles } from 'lucide-react'
import BackButton from '../components/ui/BackButton'

function WorkspacePage({ description, eyebrow, highlights, title }) {
  return (
    <div className="min-h-screen bg-[#0d2646] p-4 sm:p-6 lg:p-8">
      <div className="mb-6">
        <BackButton variant="dark" fallbackUrl="/dashboard" label="Back to Dashboard" />
      </div>
      <section className="rounded-[28px] bg-white p-6 shadow-[0_24px_60px_rgba(3,10,24,0.14)] sm:p-8">
        <div className="flex flex-wrap items-start justify-between gap-6">
          <div className="max-w-2xl">
            <p className="text-sm font-medium uppercase tracking-[0.3em] text-sky-700">
              {eyebrow}
            </p>
            <h1 className="mt-3 text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">
              {title}
            </h1>
            <p className="mt-4 text-sm leading-7 text-slate-500 sm:text-base">
              {description}
            </p>
          </div>

          <button
            type="button"
            className="inline-flex items-center gap-2 rounded-full bg-[#0B2C4D] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#12395f]"
          >
            Open report
            <ArrowUpRight size={16} />
          </button>
        </div>

        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {highlights.map((item) => (
            <div
              key={item}
              className="rounded-[24px] border border-slate-100 bg-slate-50 p-5"
            >
              <div className="flex items-center gap-3 text-slate-900">
                <div className="rounded-2xl bg-white p-2 shadow-sm shadow-slate-200/80">
                  <CheckCircle2 size={18} className="text-emerald-500" />
                </div>
                <p className="font-medium">{item}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-6 grid gap-4 xl:grid-cols-[1.1fr_0.9fr]">
        <article className="rounded-[28px] bg-white p-6 shadow-[0_16px_40px_rgba(15,23,42,0.08)]">
          <div className="flex items-center gap-2 text-sky-700">
            <Sparkles size={16} />
            <p className="text-sm font-medium">Suggested next move</p>
          </div>
          <h2 className="mt-4 text-2xl font-semibold text-slate-900">
            Turn this page into a live module next.
          </h2>
          <p className="mt-4 text-sm leading-7 text-slate-500">
            The dashboard route keeps the reference design. This module page is
            intentionally simpler so each section can evolve with its own data
            and controls.
          </p>
        </article>

        <article className="rounded-[28px] bg-[#17365d] p-6 text-white shadow-[0_16px_40px_rgba(2,12,27,0.18)]">
          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-white/10 p-2">
              <CircleDashed size={18} />
            </div>
            <div>
              <p className="text-sm text-slate-200">Status</p>
              <p className="font-semibold">Ready for API integration</p>
            </div>
          </div>
          <p className="mt-5 text-sm leading-7 text-slate-200">
            Routing and navigation are wired up, so this area is ready for the
            real tables, charts, and forms for the selected module.
          </p>
        </article>
      </section>
    </div>
  )
}

export default WorkspacePage
