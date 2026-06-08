export function NavigationMobile() {
  return (
    <header className="fixed top-0 left-0 right-0 z-40 px-6 py-4">
      {/* Mobile: Vertical stack, centered */}
      <div className="flex flex-col items-center gap-1 font-sans text-[10px] font-medium tracking-[0.18em] text-foreground uppercase">
        {/* 1. Name - full size */}
        <div>
          ANTONI BONAČIĆ VIČIĆ
        </div>

        {/* 2. VISIONARY - reduced size */}
        <div className="text-[8px] font-normal tracking-[0.15em] text-foreground/50">
          ˈvɪʒəˌnɛɹi
        </div>

        {/* 3. NOT AVAILABLE FOR HIRE | BASED IN SPLIT, CROATIA - combined on one line */}
        <div className="text-[8px] font-normal tracking-[0.15em] text-foreground/50">
          NOT AVAILABLE FOR HIRE | BASED IN SPLIT, CROATIA
        </div>

        {/* 4. Email - reduced size */}
        <a
          href="mailto:notavailable@abv.hr"
          className="text-[8px] font-normal tracking-[0.15em] text-foreground/50 transition-opacity hover:opacity-60"
        >
          notavailable@abv.hr
        </a>
      </div>

      {/* Navigation links removed on mobile */}
    </header>
  );
}
