export function Navigation() {
  return (
    <header className="fixed top-0 left-0 right-0 z-40 flex items-start justify-between px-6 py-5 md:px-10 md:py-6">
      {/* Top left */}
      <div className="font-sans text-[10px] font-medium tracking-[0.18em] text-foreground uppercase">
        ANTONI BONAČIĆ VIČIĆ
      </div>

      {/* Top center */}
      <div className="absolute left-1/2 top-5 -translate-x-1/2 text-center md:top-6">
        <div className="font-sans text-[10px] font-medium tracking-[0.18em] text-foreground uppercase">
          ˈvɪʒəˌnɛɹi
        </div>
        <div className="mt-1 font-sans text-[9px] font-normal tracking-[0.15em] text-foreground/50 uppercase">
          NOT AVAILABLE FOR HIRE | BASED IN SPLIT, CROATIA
        </div>
      </div>

      {/* Top right */}
      <div className="flex items-start gap-6">
        <div className="hidden items-center gap-3 font-sans text-[10px] font-medium tracking-[0.18em] text-foreground/40 uppercase md:flex">
          <span className="select-none">OVERVIEW</span>
          <span className="select-none text-foreground/20">/</span>
          <span className="select-none">LIST</span>
          <span className="select-none text-foreground/20">/</span>
          <span className="select-none">INFO</span>
        </div>
        <a
          href="mailto:notavailable@abv.hr"
          className="font-sans text-[10px] font-medium tracking-[0.18em] text-foreground uppercase transition-opacity hover:opacity-60"
        >
          notavailable@abv.hr
        </a>
      </div>
    </header>
  );
}
