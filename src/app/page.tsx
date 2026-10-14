
import Link from "next/link";

const steps = [
  {
    number: "01",
    title: "Restaurants share food",
    description:
      "Restaurants list surplus meals and fresh ingredients that are still good to eat.",
  },
  {
    number: "02",
    title: "NGOs collect donations",
    description:
      "Verified NGOs find available donations, accept them, and arrange collection.",
  },
  {
    number: "03",
    title: "Food reaches people",
    description:
      "Donated food gets a second chance to make a difference in the community.",
  },
];

export default function HomePage() {
  return (
<main className="min-h-screen overflow-x-hidden bg-[#faf9f6] text-[#173c2b]">
  {/* Navigation */}
  <header className="relative z-10 bg-[#faf9f6]">
    <nav className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-x-3 gap-y-4 px-4 py-4 sm:px-6 sm:py-5 lg:flex-nowrap lg:px-10">
      <Link href="/" className="flex min-w-0 items-center gap-2 sm:gap-3">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#246b45] text-xl text-white sm:h-10 sm:w-10 sm:text-2xl">
          ♧
        </span>
        <span className="text-lg font-bold tracking-tight sm:text-2xl">
          Share<span className="text-[#246b45]">APlate</span>
        </span>
      </Link>

      <div className="hidden items-center gap-8 text-sm font-medium md:flex">
        <Link href="/" className="text-[#246b45]">
          Home
        </Link>
        <Link href="#mission" className="text-gray-600 hover:text-[#246b45]">
          About
        </Link>
        <Link
          href="#how-it-works"
          className="text-gray-600 hover:text-[#246b45]"
        >
          How It Works
        </Link>
      </div>

      <div className="flex shrink-0 items-center gap-2 sm:gap-3">
        <Link
          href="/login"
          className="rounded-full border border-[#246b45] px-3 py-2 text-xs font-semibold transition hover:bg-green-50 sm:px-5 sm:py-2.5 sm:text-sm"
        >
          Login
        </Link>
        <Link
          href="/register"
          className="rounded-full border border-[#246b45] px-3 py-2 text-xs font-semibold transition hover:bg-green-50 sm:px-5 sm:py-2.5 sm:text-sm"
        >
          Register
        </Link>
      </div>
    </nav>
  </header>

  {/* Hero with full-width photograph */}
  <section className="relative flex min-h-[480px] items-center overflow-hidden bg-[#20372a] sm:min-h-[560px] lg:min-h-[620px]">
    <div
      className="absolute inset-0 bg-cover bg-center"
      style={{
        backgroundImage:
          'url("https://images.unsplash.com/photo-1593113598332-cd288d649433?auto=format&fit=crop&w=2200&q=85")',
      }}
      role="img"
      aria-label="People working together to support their community"
    />

    <div className="absolute inset-0 bg-black/55" />

    <div className="relative z-[1] mx-auto w-full max-w-7xl px-4 py-14 sm:px-6 sm:py-20 lg:px-10">
      <div className="max-w-2xl text-white">
        <p className="mb-5 inline-flex max-w-full rounded-full border border-white/50 px-3 py-2 text-xs font-medium sm:mb-6 sm:px-4 sm:text-sm">
          Reduce food waste&nbsp; · &nbsp;Feed communities
        </p>

        <h1 className="text-4xl font-bold leading-[1.08] tracking-tight sm:text-5xl md:text-6xl lg:text-7xl">
          Every Meal Deserves a{" "}
          <span className="text-[#8ed5a1]">Second Chance.</span>
        </h1>

        <p className="mt-5 max-w-xl text-sm leading-6 text-white/90 sm:mt-6 sm:text-base sm:leading-7 lg:text-lg">
          We connect restaurants with NGOs to turn surplus food into
          meaningful meals for people who need them.
        </p>

        <div className="mt-7 flex flex-col gap-3 min-[400px]:flex-row min-[400px]:flex-wrap sm:mt-8 sm:gap-4">
          <Link
            href="/register"
            className="inline-flex min-h-12 items-center justify-center rounded-full bg-[#278451] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#1f7044] sm:px-7 sm:py-3.5 sm:text-base"
          >
            Donate Food <span className="ml-2" aria-hidden="true">→</span>
          </Link>
          <Link
            href="#how-it-works"
            className="inline-flex min-h-12 items-center justify-center rounded-full border border-white px-6 py-3 text-sm font-semibold text-white transition hover:bg-white hover:text-[#173c2b] sm:px-7 sm:py-3.5 sm:text-base"
          >
            Learn More
          </Link>
        </div>
      </div>
    </div>
  </section>

  {/* Three open columns */}
  <section className="border-b border-[#e5e8df] bg-[#f1f3eb]">
    <div className="mx-auto grid max-w-7xl gap-7 px-4 py-9 sm:grid-cols-2 sm:px-6 sm:py-12 md:grid-cols-3 lg:px-10">
      <div className="flex items-start gap-3 sm:gap-4">
        <span className="shrink-0 text-3xl text-[#246b45]" aria-hidden="true">
          ♧
        </span>
        <div className="min-w-0">
          <h2 className="text-base font-bold sm:text-lg">
            Restaurants Share Food
          </h2>
          <p className="mt-2 text-sm leading-6 text-gray-600">
            Surplus meals and fresh ingredients get another chance to be
            useful.
          </p>
        </div>
      </div>

      <div className="flex items-start gap-3 sm:gap-4">
        <span className="shrink-0 text-3xl text-[#246b45]" aria-hidden="true">
          ♧
        </span>
        <div className="min-w-0">
          <h2 className="text-base font-bold sm:text-lg">
            NGOs Accept Donations
          </h2>
          <p className="mt-2 text-sm leading-6 text-gray-600">
            Verified organizations find food and arrange collection.
          </p>
        </div>
      </div>

      <div className="flex items-start gap-3 sm:gap-4">
        <span className="shrink-0 text-3xl text-[#246b45]" aria-hidden="true">
          ♡
        </span>
        <div className="min-w-0">
          <h2 className="text-base font-bold sm:text-lg">
            Food Reaches People
          </h2>
          <p className="mt-2 text-sm leading-6 text-gray-600">
            Donations help support people and communities in need.
          </p>
        </div>
      </div>
    </div>
  </section>

  {/* Mission */}
  <section
    id="mission"
    className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16 md:py-20 lg:px-10"
  >
    <div className="grid items-center gap-8 sm:gap-12 md:grid-cols-2 md:gap-16">
      <div className="min-w-0">
        <p className="text-xs font-bold uppercase tracking-widest text-[#246b45] sm:text-sm">
          Our Mission
        </p>
        <h2 className="mt-3 text-3xl font-bold leading-tight tracking-tight sm:mt-4 sm:text-4xl md:text-5xl">
          Less Waste.
          <br />
          More Hope.
        </h2>
        <p className="mt-5 max-w-lg text-sm leading-7 text-gray-600 sm:mt-6 sm:text-base">
          Good food should nourish people, not go to waste. We make it
          easier for restaurants and NGOs to work together and build a
          stronger, more caring community.
        </p>
        <Link
          href="/register"
          className="mt-6 inline-flex min-h-11 items-center justify-center rounded-full bg-[#246b45] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#174b30] sm:mt-7 sm:px-6 sm:text-base"
        >
          Join the Movement →
        </Link>
      </div>

      <div className="min-w-0 overflow-hidden rounded-2xl">
        <img
          src="https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?auto=format&fit=crop&w=1200&q=85"
          alt="Community members helping people in need"
          className="h-60 w-full object-cover sm:h-[350px] md:h-[400px]"
        />
      </div>
    </div>
  </section>

  {/* How it works */}
  <section id="how-it-works" className="bg-white">
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16 md:py-20 lg:px-10 lg:py-24">
      <div className="max-w-2xl">
        <p className="text-xs font-bold uppercase tracking-widest text-[#246b45] sm:text-sm">
          How It Works
        </p>
        <h2 className="mt-3 text-3xl font-bold tracking-tight sm:mt-4 sm:text-4xl md:text-5xl">
          Simple steps. Meaningful impact.
        </h2>
        <p className="mt-4 text-sm leading-7 text-gray-600 sm:mt-5 sm:text-base">
          A straightforward process helps surplus food get to organizations
          that can put it to good use.
        </p>
      </div>

      <div className="mt-10 grid gap-8 sm:mt-14 sm:grid-cols-2 sm:gap-10 md:grid-cols-3 md:gap-12">
        {steps.map((step) => (
          <article
            key={step.number}
            className="min-w-0 border-t-2 border-[#246b45] pt-5"
          >
            <p className="text-sm font-bold tracking-widest text-[#246b45]">
              {step.number}
            </p>
            <h3 className="mt-4 text-lg font-bold sm:mt-5 sm:text-xl">
              {step.title}
            </h3>
            <p className="mt-3 text-sm leading-7 text-gray-600 sm:text-base">
              {step.description}
            </p>
          </article>
        ))}
      </div>
    </div>
  </section>

  {/* Closing call to action */}
  <section className="bg-[#e9eee4] px-4 py-12 text-center sm:px-6 sm:py-16">
    <div className="mx-auto max-w-3xl">
      <h2 className="text-2xl font-bold sm:text-3xl md:text-4xl">
        Have food to share?
      </h2>
      <p className="mx-auto mt-4 max-w-xl text-sm leading-7 text-gray-600 sm:text-base">
        Help turn surplus food into an opportunity to care for your
        community.
      </p>
      <Link
        href="/register"
        className="mt-6 inline-flex min-h-12 items-center justify-center rounded-full bg-[#174b30] px-7 py-3 text-sm font-semibold text-white transition hover:bg-[#246b45] sm:mt-7 sm:py-3.5 sm:text-base"
      >
        Get Started
      </Link>
    </div>
  </section>

  {/* Footer */}
  <footer className="bg-[#173c2b] px-4 py-6 text-white sm:px-6 sm:py-7">
    <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 text-center text-sm sm:flex-row sm:text-left">
      <p className="font-semibold">ShareAPlate</p>
      <p className="text-xs text-white/70 sm:text-sm">
        Food shared. Communities strengthened.
      </p>
    </div>
  </footer>
</main>
  );
}
