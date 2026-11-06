function useNow() {
  const [now, setNow] = useState<number | null>(null);
  useEffect(() => {
    setNow(Date.now());
    const id = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(id);
  }, []);
  return now;
}

export default function App() {
  const now = useNow();
  const rem = now == null ? null : getRemaining(now, TARGET_MS);
  const audio = useRef<Ambient | null>(null);

  return (
    <main className="grain relative min-h-dvh overflow-hidden bg-background text-foreground">
      <div className="glow-bg pointer-events-none absolute inset-0" aria-hidden />
      <Particles />
      <MusicToggle audioRef={audio} />
      <div className="relative z-10 mx-auto flex min-h-dvh max-w-4xl flex-col items-center justify-center px-5 py-24 text-center">
        {rem == null ? (
          <div className="h-40" aria-busy="true" />
        ) : rem.done ? (
          <Reveal onOpen={() => audio.current?.chime()} />
        ) : (
          <Countdown rem={rem} />
        )}
      </div>
    </main>
  );
}

function Countdown({ rem }: { rem: Remaining }) {
  const units: [number, [string, string, string]][] = [
    [rem.days, ["день", "дня", "дней"]],
    [rem.hours, ["час", "часа", "часов"]],
    [rem.minutes, ["минута", "минуты", "минут"]],
    [rem.seconds, ["секунда", "секунды", "секунд"]],
  ];
  return (
    <section className="fade-up flex flex-col items-center" aria-labelledby="teaser">
      <p className="eyebrow">24 · XI · 2026</p>
      <h1 id="teaser" className="mt-5 max-w-xl font-display text-3xl italic leading-tight text-foreground sm:text-5xl">
        {GREETING.teaserLine}
      </h1>
      <GiftBox sealed />
      <div
        className="grid w-full max-w-2xl grid-cols-4 gap-2 sm:gap-4"
        role="timer"
        aria-label={`До сюрприза: ${rem.days} ${plural(rem.days, units[0]![1])}, ${rem.hours} ${plural(rem.hours, units[1]![1])}`}
      >
        {units.map(([v, f], i) => (
          <div key={i} className="count-cell">
            <span className="font-display text-4xl tabular-nums text-gold sm:text-6xl" aria-hidden>
              {String(v).padStart(2, "0")}
            </span>
            <span className="mt-2 text-[0.6rem] uppercase tracking-[0.25em] text-muted-foreground sm:text-xs" aria-hidden>
              {plural(v, f)}
            </span>
          </div>
        ))}
      </div>
      <p className="mt-10 text-xs tracking-widest text-muted-foreground">по московскому времени</p>
    </section>
  );
}

export function Reveal({ onOpen }: { onOpen: () => void }) {
  const [open, setOpen] = useState(false);
  const handle = () => {
    if (open) return;
    setOpen(true);
    onOpen();
  };
  return (
    <section className="fade-up flex flex-col items-center" aria-live="polite">
      {!open && (
        <>
          <p className="eyebrow">{GREETING.revealEyebrow}</p>
          <h1 className="mt-5 font-display text-3xl italic sm:text-5xl">Этот день настал</h1>
        </>
      )}
      <button
        type="button"
        onClick={handle}
        disabled={open}
        className="group mt-2 rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-4 focus-visible:ring-offset-background"
        aria-label={open ? "Подарок открыт" : "Открыть подарок"}
      >
        <GiftBox open={open} />
      </button>
      {!open && <p className="pulse-soft text-sm tracking-[0.3em] uppercase text-gold">Нажми, чтобы открыть</p>}
      {open && (
        <>
          <Confetti />
          <header className="mt-2 flex flex-col items-center">
            <p className="eyebrow">{GREETING.revealEyebrow}</p>
            <h2 className="mt-4 font-display text-4xl italic leading-tight text-gold-gradient sm:text-6xl">
              {GREETING.revealTitle}
            </h2>
            <div className="divider mx-auto my-8" aria-hidden />
          </header>
          <LetterCard />
        </>
      )}
    </section>
  );
}

function LetterCard() {
  const first = 1.2;
  const step = 0.35;
  return (
    <article className="letter-card" aria-label={`Письмо для ${GREETING.name}`}>
      <p className="letter-salutation letter-line" style={{ animationDelay: "1.1s" }}>
        {LETTER.salutation}
      </p>
      <div className="letter-body mt-6 space-y-5">
        {LETTER.paragraphs.map((p, i) => (
          <p key={i} className="letter-line" style={{ animationDelay: `${first + i * step}s` }}>
            {p}
          </p>
        ))}
      </div>
      <p
        className="letter-closing letter-line mt-8"
        style={{ animationDelay: `${first + LETTER.paragraphs.length * step}s` }}
      >
        {LETTER.closing}
      </p>
    </article>
  );
}

function GiftBox({ sealed, open }: { sealed?: boolean; open?: boolean }) {
  return (
    <div className={`gift my-12 ${open ? "gift-open" : ""} ${sealed ? "gift-float" : ""}`} aria-hidden>
      <div className="gift-halo" />
      <div className="gift-lid">
        <div className="gift-ribbon-v" />
        <div className="gift-bow"><span /><span /></div>
      </div>
      <div className="gift-body">
        <div className="gift-ribbon-v" />
        <div className="gift-ribbon-h" />
        {sealed && <div className="gift-seal">Ю</div>}
      </div>
    </div>
  );
}

function Particles() {
  const [items, setItems] = useState<{ l: number; d: number; s: number; delay: number }[]>([]);
  useEffect(() => {
    setItems(Array.from({ length: 28 }, () => ({
      l: Math.random() * 100, d: 14 + Math.random() * 16, s: 1 + Math.random() * 3, delay: -Math.random() * 30,
    })));
  }, []);
  return (
    <div className="pointer-events-none absolute inset-0 z-0" aria-hidden>
      {items.map((p, i) => (
        <span key={i} className="particle" style={{ left: `${p.l}%`, width: p.s, height: p.s, animationDuration: `${p.d}s`, animationDelay: `${p.delay}s` }} />
      ))}
    </div>
  );
}

function Confetti() {
  const pieces = useMemo(() => Array.from({ length: 70 }, (_, i) => ({
    x: (Math.random() - 0.5) * 700, y: -200 - Math.random() * 300, r: Math.random() * 720,
    d: 1.6 + Math.random() * 1.6, delay: Math.random() * 0.3, star: i % 3 === 0,
  })), []);
  return (
    <div className="pointer-events-none fixed inset-0 z-20 flex items-center justify-center" aria-hidden>
      {pieces.map((p, i) => (
        <span key={i} className={p.star ? "spark" : "confetti"}
          style={{ "--x": `${p.x}px`, "--y": `${p.y}px`, "--r": `${p.r}deg`, animationDuration: `${p.d}s`, animationDelay: `${p.delay}s` } as CSSProperties} />
      ))}
    </div>
  );
}

function MusicToggle({ audioRef }: { audioRef: React.MutableRefObject<Ambient | null> }) {
  const [on, setOn] = useState(false);
  const [unsupported, setUnsupported] = useState(false);
  useEffect(() => () => audioRef.current?.pause(), [audioRef]);
  const toggle = async () => {
    try {
      if (!Ambient.supported()) return setUnsupported(true);
      if (!audioRef.current) audioRef.current = new Ambient();
      if (on) { audioRef.current.pause(); setOn(false); }
      else { await audioRef.current.play(); setOn(true); }
    } catch { setUnsupported(true); setOn(false); }
  };
  return (
    <div className="fixed right-4 top-4 z-30 flex flex-col items-end gap-1.5 sm:right-6 sm:top-6">
      <button type="button" onClick={toggle} aria-pressed={on} disabled={unsupported}
        aria-label={on ? "Выключить музыку" : "Включить музыку"} className="music-btn">
        <span className={`eq ${on ? "eq-on" : ""}`} aria-hidden><i /><i /><i /></span>
        <span>{unsupported ? "Звук недоступен" : on ? "Пауза" : "Музыка"}</span>
      </button>
      <p className="max-w-[11rem] text-right text-[0.65rem] leading-snug text-muted-foreground">
        Звук по желанию — включится только по нажатию
      </p>
    </div>
  );
}