/**
 * Home page "Newsletter CTA" section — presentational only. No backend
 * endpoint exists to submit to: `newsletter_subscriptions` is explicitly
 * listed as deferred to V2/V3 in `docs/31_DATABASE_TABLES.md` "Additional
 * Tables", and no `NewsletterModule`/controller exists anywhere in this
 * backend. Per Rule Zero ("Never invent endpoints"), this renders the
 * visual section the milestone asked for without pretending to submit
 * anywhere — the input/button are real form controls, but the form has no
 * `action` and submission is inert until a real subscription endpoint
 * exists (see docs/76_FRONTEND_PUBLIC_WEBSITE.md "Known Limitations").
 */
export function NewsletterCta() {
  return (
    <section className="rounded-[var(--sportingspy-border-radius)] bg-gray-900 px-6 py-12 text-center text-white sm:px-12">
      <h2 className="text-2xl font-bold tracking-tight">Stay in the loop</h2>
      <p className="mx-auto mt-2 max-w-md text-sm text-gray-300">
        Get the latest stories delivered to your inbox. No spam, unsubscribe any time.
      </p>
      <form className="mx-auto mt-6 flex max-w-sm gap-2" aria-describedby="newsletter-cta-note">
        <label htmlFor="newsletter-email" className="sr-only">
          Email address
        </label>
        <input
          id="newsletter-email"
          type="email"
          placeholder="you@example.com"
          disabled
          className="w-full rounded-[var(--sportingspy-border-radius)] border border-gray-700 bg-gray-800 px-4 py-2 text-sm text-white placeholder:text-gray-400 disabled:cursor-not-allowed"
        />
        <button
          type="submit"
          disabled
          className="rounded-[var(--sportingspy-border-radius)] bg-white px-4 py-2 text-sm font-medium text-gray-900 disabled:cursor-not-allowed disabled:opacity-60"
        >
          Subscribe
        </button>
      </form>
      <p id="newsletter-cta-note" className="mt-3 text-xs text-gray-400">
        Newsletter signup is coming soon.
      </p>
    </section>
  );
}
