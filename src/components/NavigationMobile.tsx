export function NavigationMobile() {
  return (
    <header className="fixed top-0 left-0 right-0 z-40 px-6 py-4">
      {/* Mobile: Vertical stack, centered or left-aligned */}
      <div className="flex flex-col items-start gap-1 font-sans text-[10px] font-medium tracking-[0.18em] text-foreground uppercase">
        {/* 1. Name */}
        <div>
          ANTONI BONAČIĆ VIČIĆ
        </div>

        {/* 2. VISIONARY - same font style as status lines */}
        <div className="font-normal tracking-[0.15em] text-foreground/50">
          ˈvɪʒəˌnɛɹi
        </div>

        {/* 3. NOT AVAILABLE FOR HIRE */}
        <div className="font-normal tracking-[0.15em] text-foreground/50">
          NOT AVAILABLE FOR HIRE
        </div>

        {/* 4. BASED IN SPLIT, CROATIA */}
        <div className="font-normal tracking-[0.15em] text-foreground/50">
          BASED IN SPLIT, CROATIA
        </div>

        {/* 5. Email */}
        <a
          href="mailto:notavailable@abv.hr"
          className="font-normal tracking-[0.15em] text-foreground/50 transition-opacity hover:opacity-60"
        >
          notavailable@abv.hr
        </a>
      </div>

      {/* Navigation links removed on mobile */}
    </header>
  );
}
