/**
 * Cuvinte care se rotesc, pur CSS — fără JavaScript și fără timere,
 * deci nu costă nimic la hidratare și nu produce nepotriviri server/client.
 *
 * Fiecare cuvânt primește aceeași animație, decalată cu un pas, iar cadrele
 * din globals.css sunt calculate pentru exact WORDS.length = 5 cuvinte.
 */

const WORDS = ["Perfecțiune", "Pasiune", "Tradiție", "Precizie", "Caracter"];

/** Cel mai lung cuvânt rezervă lățimea, ca linia să nu salte la fiecare schimbare. */
const WIDEST = WORDS.reduce((a, b) => (b.length > a.length ? b : a));

export function WordCycle({ className = "" }: { className?: string }) {
  return (
    <span className={`cycle ${className}`} aria-label={WORDS.join(", ")}>
      <span className="cycle__sizer" aria-hidden>
        {WIDEST}
      </span>
      {WORDS.map((word, i) => (
        <span
          key={word}
          aria-hidden
          className="cycle__word"
          style={{ animationDelay: `calc(${i} * var(--cycle-step))` }}
        >
          {/* gradientul stă pe un element separat: background-clip: text
              nu trebuie să atingă linia aurie de dedesubt */}
          <span className="cycle__text">{word}</span>
        </span>
      ))}
    </span>
  );
}
