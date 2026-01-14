

import React, { useEffect, useMemo, useState } from "react";
import bg from "./assets/mc-bg.png";

// --- Apurit ---
function shuffled(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export default function App() {
  // Vaiheet: start -> quiz -> end
  const [phase, setPhase] = useState("start");

  const [order, setOrder] = useState(() => QUESTIONS.map((_, i) => i));
  const [idx, setIdx] = useState(0);

  const [selected, setSelected] = useState(null); // "A" | "B" | null
  const [revealed, setRevealed] = useState(false);
  const [answeredThis, setAnsweredThis] = useState(false);


  // tulos (CrazyGames tykkää “selkeästä pelisilmukasta”)
  const [correctCount, setCorrectCount] = useState(0);
  const [answeredCount, setAnsweredCount] = useState(0);

  // Ajastin (valinnainen edelleen)
  const [timerOn, setTimerOn] = useState(false);
  const [duration, setDuration] = useState(20);
  const [timeLeft, setTimeLeft] = useState(duration);

  const q = useMemo(() => QUESTIONS[order[idx]], [order, idx]);

  // Näppäimistö toimii edelleen koneella (mutta ei pakollinen)
  useEffect(() => {
    if (phase !== "quiz") return;
    const onKey = (e) => {
      if (e.key.toLowerCase() === "a") setSelected("A");
      if (e.key.toLowerCase() === "b") setSelected("B");
      if (e.key === " ") setRevealed((r) => !r);
      if (e.key === "ArrowRight") next();
      if (e.key === "ArrowLeft") prev();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, idx]);

  // Ajastin
  useEffect(() => {
    if (phase !== "quiz") return;
    if (!timerOn) return;
    setTimeLeft(duration);
    const id = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          clearInterval(id);
          setRevealed(true);
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [phase, idx, timerOn, duration]);

  function startGame() {
    setPhase("quiz");
    setIdx(0);
    setSelected(null);
    setRevealed(false);
    setCorrectCount(0);
    setAnsweredCount(0);
    setTimeLeft(duration);
    setAnsweredThis(false);

  }

  function finishGame() {
    setPhase("end");
  }

  function reshuffle() {
    setOrder(shuffled(QUESTIONS.map((_, i) => i)));
    setIdx(0);
    setSelected(null);
    setRevealed(false);
    setCorrectCount(0);
    setAnsweredCount(0);
    setAnsweredThis(false);

  }

  function resetOrdered() {
    setOrder(QUESTIONS.map((_, i) => i));
    setIdx(0);
    setSelected(null);
    setRevealed(false);
    setCorrectCount(0);
    setAnsweredCount(0);
    setAnsweredThis(false);

  }

  function next() {
    // jos viimeinen -> lopetusruutu
    if (idx >= order.length - 1) {
      finishGame();
      return;
    }
    setIdx((i) => Math.min(order.length - 1, i + 1));
    setRevealed(false);
    setSelected(null);
    setAnsweredThis(false);

  }

  function prev() {
    setIdx((i) => Math.max(0, i - 1));
    setRevealed(false);
    setSelected(null);
    setAnsweredThis(false);

  }

function reveal() {
  if (!selected) return;

  // Lasketaan vain eka kerta, kun tämä kysymys "paljastetaan"
  if (!answeredThis && !revealed) {
    setAnsweredThis(true);
    setAnsweredCount((n) => n + 1);
    if (selected === q.correct) setCorrectCount((n) => n + 1);
  }

  // Näytä/piilota selitys
  setRevealed((r) => !r);
}



  function toggleFullscreen() {
    const el = document.documentElement;
    if (!document.fullscreenElement) el.requestFullscreen?.();
    else document.exitFullscreen?.();
  }

  const isCorrect = (opt) => revealed && q.correct === opt;
  const isWrong =
    (opt) => revealed && selected && selected === opt && q.correct !== opt;

  // --- UI ---
  return (
    <div
      className="min-h-screen bg-cover bg-center text-white relative"
      style={{ backgroundImage: `url(${bg})` }}
    >
      {/* tumma overlay että tekstit näkyvät */}
      <div className="absolute inset-0 bg-black/65" />

      {/* sisältö */}
      <div className="relative z-10 max-w-5xl mx-auto p-4 sm:p-6">
        {/* START */}
        {phase === "start" && (
          <div className="min-h-[80vh] flex items-center justify-center">
            <div className="w-full max-w-xl bg-slate-900/70 border border-slate-700 rounded-2xl p-6 sm:p-8 shadow-xl">
              <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight">
                Minecraft A/B -tietovisa
              </h1>
              <p className="mt-3 opacity-90 leading-relaxed">
                Valitse vastaus napauttamalla A- tai B-vaihtoehtoa. Paljasta
                vastaus ja selitys, sitten siirry seuraavaan.
              </p>

              <div className="mt-5 grid grid-cols-1 gap-3">
                <button
                  onClick={startGame}
                  className="w-full px-4 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 transition text-lg font-semibold"
                >
                  Aloita
                </button>
                <button
                  onClick={reshuffle}
                  className="w-full px-4 py-3 rounded-xl bg-sky-600 hover:bg-sky-500 transition"
                >
                  Sekoita kysymykset
                </button>
              </div>

              <div className="mt-5 text-sm opacity-80">
                
              </div>
            </div>
          </div>
        )}

        {/* QUIZ */}
        {phase === "quiz" && (
          <>
            <header className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <h2 className="text-xl sm:text-2xl font-semibold tracking-tight">
                Minecraft A/B -tietovisa
              </h2>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={reshuffle}
                  className="px-3 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 transition"
                >
                  Sekoita
                </button>
                <button
                  onClick={resetOrdered}
                  className="px-3 py-2 rounded-xl bg-slate-700 hover:bg-slate-600 transition"
                >
                  Järjestys
                </button>
                <button
                  onClick={() => setTimerOn((t) => !t)}
                  className={`px-3 py-2 rounded-xl transition ${
                    timerOn
                      ? "bg-emerald-600 hover:bg-emerald-500"
                      : "bg-slate-700 hover:bg-slate-600"
                  }`}
                >
                  {timerOn ? "Ajastin: Päällä" : "Ajastin: Pois"}
                </button>
                <button
                  onClick={toggleFullscreen}
                  className="px-3 py-2 rounded-xl bg-slate-700 hover:bg-slate-600 transition"
                >
                  Koko näyttö
                </button>
              </div>
            </header>

            {/* progress */}
            <div className="mt-4 flex items-center gap-3">
              <div className="flex-1 h-2 bg-slate-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-emerald-500"
                  style={{
                    width: `${((idx + 1) / QUESTIONS.length) * 100}%`,
                  }}
                />
              </div>
              <div className="text-xs sm:text-sm opacity-80 tabular-nums">
                {idx + 1}/{QUESTIONS.length}
              </div>
            </div>

            {/* timer */}
            {timerOn && (
              <div className="mt-3 flex items-center gap-3 flex-wrap">
                <div className="text-xs opacity-80">Aika/kysymys</div>
                <input
                  type="range"
                  min={10}
                  max={60}
                  step={5}
                  value={duration}
                  onChange={(e) => setDuration(parseInt(e.target.value, 10))}
                  className="w-48"
                />
                <div className="text-sm tabular-nums w-12">{duration}s</div>
                <div className="ml-auto text-lg font-semibold tabular-nums">
                  {timeLeft}s
                </div>
              </div>
            )}

            {/* question card */}
            <div className="mt-5 bg-slate-900/70 border border-slate-700 rounded-2xl shadow-xl p-5 sm:p-6">
              <div className="text-lg sm:text-2xl font-medium leading-snug">
                {q.q}
              </div>

              {/* options: mobiiliystävälliset (iso kosketuspinta) */}
              <div className="mt-5 grid grid-cols-1 md:grid-cols-2 gap-4">
                {["A", "B"].map((opt) => {
                  const label = opt === "A" ? q.A : q.B;
                  const base =
                    "relative p-5 rounded-2xl border transition select-none cursor-pointer touch-manipulation";
                  const chosen =
                    selected === opt && !revealed
                      ? "border-sky-400 bg-sky-400/10"
                      : "border-slate-700 bg-slate-800/60";
                  const correct = isCorrect(opt)
                    ? "border-emerald-500 bg-emerald-500/10"
                    : "";
                  const wrong = isWrong(opt)
                    ? "border-rose-500 bg-rose-500/10"
                    : "";
                  return (
                    <div
                      key={opt}
                      
                      onClick={() => {
                        // ÄLÄ anna vaihtaa vastausta paljastuksen jälkeen
                        if (revealed) return;

                        setSelected(opt);

                        // Lasketaan vastaus vain kerran / kysymys
                        if (!answeredThis) {
                          setAnsweredThis(true);
                          setAnsweredCount((n) => n + 1);
                          if (opt === q.correct) setCorrectCount((n) => n + 1);
                        }
                      }}


                      className={[base, chosen, correct, wrong].join(" ")}
                    >
                      <div className="flex items-start gap-3">
                        <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-slate-700/70 flex items-center justify-center text-lg font-bold">
                          {opt}
                        </div>
                        <div className="text-base sm:text-lg leading-snug">
                          {label}
                        </div>
                      </div>
                      {revealed && q.correct === opt && (
                        <div className="absolute right-4 top-4 text-emerald-400 text-xl">
                          ✓
                        </div>
                      )}
                      {revealed &&
                        selected === opt &&
                        q.correct !== opt && (
                          <div className="absolute right-4 top-4 text-rose-400 text-xl">
                            ✗
                          </div>
                        )}
                    </div>
                  );
                })}
              </div>

              {/* controls: toimii myös kännykällä */}
              <div className="mt-5 grid grid-cols-1 sm:grid-cols-3 gap-2">
                <button
                  onClick={prev}
                  disabled={idx === 0}
                  className="px-4 py-3 rounded-xl bg-slate-700 hover:bg-slate-600 disabled:opacity-40 transition"
                >
                  Edellinen
                </button>

                <button
                  onClick={reveal}
                  disabled={!selected}
                  className={`px-4 py-3 rounded-xl font-semibold transition disabled:opacity-40 ${
                    revealed
                      ? "bg-amber-600 hover:bg-amber-500"
                      : "bg-emerald-600 hover:bg-emerald-500"
                  }`}
                >
                  {revealed ? "Piilota" : "Paljasta"}
                </button>

                <button
                  onClick={next}
                  className="px-4 py-3 rounded-xl bg-slate-700 hover:bg-slate-600 transition"
                >
                  {idx >= order.length - 1 ? "Lopeta" : "Seuraava"}
                </button>
              </div>

              {/* explanation */}
              {revealed && (
                <div className="mt-4 p-4 rounded-xl bg-slate-800/70 border border-slate-700">
                  <div className="text-sm uppercase tracking-wide text-emerald-300 mb-1">
                    Selitys
                  </div>
                  <p className="text-base leading-relaxed">{q.explain}</p>
                </div>
              )}

              <div className="mt-4 text-xs sm:text-sm opacity-80">
                Tulos: {correctCount}/{answeredCount} (oikein/vastattu)
              </div>
            </div>

            <div className="mt-4 text-sm opacity-80">
              
            </div>
          </>
        )}

        {/* END */}
        {phase === "end" && (
          <div className="min-h-[80vh] flex items-center justify-center">
            <div className="w-full max-w-xl bg-slate-900/70 border border-slate-700 rounded-2xl p-6 sm:p-8 shadow-xl">
              <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight">
                Peli päättyi!
              </h1>
              <p className="mt-3 text-lg">
                Oikein: <span className="font-semibold">{correctCount}</span> /{" "}
                {answeredCount}
              </p>

              <div className="mt-5 grid grid-cols-1 gap-3">
                <button
                  onClick={startGame}
                  className="w-full px-4 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 transition text-lg font-semibold"
                >
                  Pelaa uudestaan
                </button>
                <button
                  onClick={() => setPhase("start")}
                  className="w-full px-4 py-3 rounded-xl bg-slate-700 hover:bg-slate-600 transition"
                >
                  Takaisin aloitukseen
                </button>
              </div>

              <div className="mt-5 text-sm opacity-80">
                
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// --- KYSYMYKSET ---
// (pidä omat kysymyksesi tässä; alla vain muistutus rakenteesta)


const QUESTIONS = [
  {
    q: "Kuinka monta lohikäärmeen munaa voi saada ilman komentoja samassa maailmassa?",
    A: "Vain yhden",
    B: "Useampia",
    correct: "A",
    explain:
      "Ender Dragon tiputtaa munan vain ensimmäisen kukistamisen jälkeen. Myöhemmät uudelleensyntymiset eivät tuota uutta munaa."
  },
  {
    q: "Mikä bossi tiputtaa Nether Star -esineen?",
    A: "Wither",
    B: "Ender Dragon",
    correct: "A",
    explain:
      "Wither pudottaa Nether Starin, jota käytetään majakan (Beacon) luomiseen. Ender Dragon ei pudota sitä."
  },
  {
    q: "Minkä näistä voi lumota vain JOUSELLE (ei varsijouselle)?",
    A: "Infinity",
    B: "Multishot",
    correct: "A",
    explain:
      "Infinity toimii vain jousessa. Varsijouselle on omia lumouksia kuten Multishot ja Piercing."
  },
  {
    q: "Kuka osaa avata puuovia?",
    A: "Villagerit (kyläläiset)",
    B: "Zombit",
    correct: "A",
    explain:
      "Villagerit voivat avata puuoven reitinhakua varten. Zombit eivät avaa ovia, mutta voivat rikkoa niitä Hard-vaikeustasolla."
  },
  {
    q: "Mikä näistä EI pala eikä tuhoudu laavassa?",
    A: "Netherite-esine",
    B: "Timanttiesine",
    correct: "A",
    explain:
      "Netherite-esineet kelluvat ja eivät pala laavassa. Timanttiesine voi palaa ja tuhoutua."
  },
  {
    q: "Kuinka monta erilaista musiikkilevyä on Java Editionissa (1.21)?",
    A: "16",
    B: "15",
    correct: "A",
    explain:
      "Levyjä ovat mm. 13, cat, blocks, otherside, pigstep, 5 ja relic – yhteensä 16."
  },
  {
    q: "Mitä Channeling-lumous tekee ukkosmyrskyssä, kun kolmikärki osuu kohteeseen?",
    A: "Iskee salaman kohteeseen",
    B: "Tappaa kohteen aina yhdellä iskulla",
    correct: "A",
    explain:
      "Channeling kutsuu salaman ukkosella, jos osumakohta on avoimen taivaan alla. Se ei takaa instant‑killia."
  },
  {
    q: "Mikä oli Minecraftin varhaisin nimi?",
    A: "Cave Game",
    B: "Mine World",
    correct: "A",
    explain:
      "Notch kutsui prototyyppiä aluksi nimellä Cave Game."
  },
  {
    q: "Kumpi täyttää NÄLKÄÄ enemmän kypsennettynä?",
    A: "Pihvi ja possunliha täyttävät yhtä paljon",
    B: "Pihvi täyttää enemmän kuin possu",
    correct: "A",
    explain:
      "Kypsä pihvi ja kypsä possunliha palauttavat saman verran nälkää ja kylläisyyttä (8 nälkäpistettä, 12.8 kylläisyys)."
  },
  {
    q: "Kumpi kaivaa obsidiania nopeammin?",
    A: "Netherite-pickaxe ilman lumouksia",
    B: "Timantti-pickaxe Efficiency V -lumouksella",
    correct: "B",
    explain:
      "Efficiency V kasvattaa kaivunopeutta niin paljon, että timanttipiikka E5 on nopeampi kuin lumoutumaton netherite."
  },
  {
    q: "Kumpi antaa korkeamman valotason?",
    A: "Soihtu (Torch)",
    B: "Jack o'Lantern",
    correct: "B",
    explain:
      "Jack o'Lanternin valotaso on 15, kun taas soihdulla se on 14."
  },
  {
    q: "Näkyvätkö Ender Chestin tavarat kaikille vai vain sinulle?",
    A: "Vain minulle",
    B: "Kaikille samalla arkulla",
    correct: "A",
    explain:
      "Ender Chestin sisältö on pelaajakohtainen ja jakautuu instansseittain."
  },
  {
    q: "Kumman mäntä (piston) voi työntää?",
    A: "Obsidianin",
    B: "Hunajablokin (Honey Block)",
    correct: "B",
    explain:
      "Obsidian on työntymätön. Hunajablokkia voi siirtää männällä ja se tartuttaa liikettä lähellä oleviin entiteetteihin."
  },
  {
    q: "Sattuuko vesi Endermeniin?",
    A: "Kyllä, vesi/räntä vahingoittaa ja karkottaa",
    B: "Ei vahingoita",
    correct: "A",
    explain:
      "Endermenit ottavat vahinkoa vedestä ja sateesta ja teleporttaavat pois."
  },
  {
    q: "Voiko villager muuttua zombie villageriksi zombin hyökätessä?",
    A: "Kyllä",
    B: "Ei",
    correct: "A",
    explain:
      "Zombit voivat tartuttaa kyläläisiä. Zombie villager voidaan parantaa heikennys-juomalla ja kultaisella omenalla."
  },
  {
    q: "Kumpi näistä voi rikkoa obsidianin?",
    A: "Witherin räjähdykset",
    B: "Ender Dragon",
    correct: "A",
    explain:
      "Witherin räjähdys (erityisesti syntyessään) voi rikkoa obsidiania. Ender Dragon ei riko obsidiania."
  },
  {
    q: "Mikä antaa täydellisen suojan tulesta ja laavasta?",
    A: "Potion of Fire Resistance",
    B: "Fire Protection -lumous kypärässä",
    correct: "A",
    explain:
      "Fire Resistance -juoma tekee palovahingoista olemattomia vaikutusaikana. Fire Protection ainoastaan vähentää vahinkoa."
  },
  {
    q: "Mistä Elytra löytyy?",
    A: "End Cityn aluksesta (End Ship)",
    B: "Sen voi valmistaa nahasta ja höyhenistä",
    correct: "A",
    explain:
      "Elytra löytyy vain End Shipin item frame -kehyksestä. Valmistusreseptiä ei ole."
  },
  {
    q: "Missä on enemmän biomeja?",
    A: "Overworldissa",
    B: "Netherissä",
    correct: "A",
    explain:
      "Overworldissa on runsaasti erilaisia biomeja (vuoret, tundrat, viidakot jne.). Netherissä tyypillisesti 5 pääbiomia."
  },
  {
    q: "Kumpi kelpaa majakan (Beacon) aktivointiin käyttöliittymässä?",
    A: "Lapis Lazuli",
    B: "Emerald",
    correct: "B",
    explain:
      "Majakan aktivointiin käyvät rauta-, kulta-, timantti- ja smaragdiharkot sekä netherite‑ingotti. Lapis ei kelpaa."
  },
  {
    q: "Mikä on maksimikorkeus (Y-taso), jolle pelaaja voi rakentaa vuonna 1.20+?",
    A: "320",
    B: "256",
    correct: "A",
    explain: "Rakennuskorkeus nousi päivityksessä 1.18. Nykyisin rakennusraja on Y=320."
  },
  {
    q: "Mikä eläin voi HYÖDYNTÄÄ veneitä kulkuvälineenä?",
    A: "Kissa",
    B: "Panda",
   correct: "B",
    explain: "Pandat voivat kiivetä veneisiin ja istua niissä, mikä on hauska yksityiskohta."
  },
  {
    q: "Mikä loitsu estää työkalua hajoamasta kokonaan?",
    A: "Unbreaking",
    B: "Mending",
    correct: "B",
    explain: "Mending käyttää XP:tä työkalun korjaamiseen. Unbreaking vain vähentää kulumisen todennäköisyyttä."
  },
  {
    q: "Mikä näistä kasvaa nopeammin ilman valoa?",
    A: "Sieni",
    B: "Kaktus",
    correct: "A",
    explain: "Sienet kasvavat parhaiten pimeässä tai hämärässä. Kaktus vaatii valoa."
  },
  {
    q: "Kuinka monta obsidian-palikkaa tarvitaan vähintään toimivaan Nether-porttiin?",
    A: "10",
    B: "14",
    correct: "A",
    explain: "Kehyksen kulmat voi jättää pois, joten vähimmäismäärä on 10 obsidiania."
  }
];

