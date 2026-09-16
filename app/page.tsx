"use client";

import { useEffect, useState, type ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { CalendarDays, Check, Clock, Heart, MapPin, X } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { date, mapsEmbedSrc, time, venueName } from "@/lib/invite";

type Stage = "closed" | "open" | "expanded" | "confirmed";

const BURST = Array.from({ length: 12 }, (_, i) => {
  const angle = (i / 12) * Math.PI * 2;
  return {
    x: Math.cos(angle) * 80,
    y: Math.sin(angle) * 80 - 16,
    delay: i * 0.07,
  };
});

const BODY_D = `M44,20
C120,12 200,10 280,12 C360,14 430,9 500,11 C540,12 562,17 561,40
C560,118 561,240 560,318 C559,368 558,398 540,402
C472,407 402,404 342,406 C282,408 212,405 152,407
C94,409 42,404 36,381 C31,330 32,180 33,100 C34,44 37,25 44,20 Z`;

const FLAP_D = `M28,9
C140,3 240,2 293.5,3 C347,2 447,3 559,9
C561,60 563,130 559,200
C469,192 381,195.5 293,195.5 C206,195.5 118,192 28,200
C24,130 26,60 28,9 Z`;

const FLAP_SHADOW_L = "M61,24 C59,84 106,158 178,181 C220,190 256,193 286,194";
const FLAP_SHADOW_R = "M526,24 C528,84 480,158 408,181 C366,190 332,193 300,194";

const POCKET_D = `M28,200 C118,192 206,195.5 293,195.5 C381,195.5 469,192 559,200
C560,230 559,300 557,360 C556,398 550,406 532,406
C468,409 406,407 346,408 C286,409 216,406 156,408
C100,410 42,406 32,388 C26,376 25,340 26,290
C27,244 27,222 28,200 Z`;

const LIP_D = "M34,203 C118,195 206,198.5 293,198.5 C380,198.5 464,195 556,203";
const LIP_SHADOW_D = "M42,207 C118,199 206,202.5 293,202.5 C380,202.5 462,199 550,207";
const CREASE_L = "M58,212 C150,268 226,338 292,390";
const CREASE_R = "M529,212 C438,268 362,338 294,390";

const LETTER_D = `M60,10
C150,5 230,8 293,7 C360,6 430,10 490,13 C510,13 516,24 514,86
C512,150 513,210 512,268 C511,296 506,304 488,302
C410,307 328,305 250,306 C170,307 104,303 84,294
C70,288 62,268 64,210 C66,150 62,70 60,10 Z`;

const LETTER_LINES = [
  "M90,150 C180,147 240,152 322,149 C404,146 440,151 490,149",
  "M90,182 C182,179 240,184 322,181 C404,178 440,183 490,181",
  "M90,214 C182,211 240,216 322,213 C404,210 440,215 490,213",
];

const LETTER_HEART =
  "M0,-6 C-3,-12 -11,-16 -17,-13 C-23,-10 -24,-3 -20,4 C-16,10 -6,18 0,22 C6,18 16,10 20,4 C24,-3 23,-10 17,-13 C11,-16 3,-12 0,-6 Z";

const SEAL_HEART =
  "M0,-10 C-3,-18 -14,-26 -24,-24 C-34,-22 -38,-12 -34,-2 C-30,8 -16,18 0,28 C16,18 30,8 34,-2 C38,-12 34,-22 24,-24 C14,-26 3,-18 0,-10 Z";

function EnvelopeScene({ open, onTap }: { open: boolean; onTap: () => void }) {
  const [flapSettled, setFlapSettled] = useState(false);

  useEffect(() => {
    if (open) {
      const timer = setTimeout(() => setFlapSettled(true), 420);
      return () => clearTimeout(timer);
    }
    setFlapSettled(false);
  }, [open]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 24, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -16, scale: 0.97 }}
      transition={{ duration: 0.45, ease: "easeOut" }}
      className={`flex cursor-pointer select-none flex-col items-center gap-8 ${
        open ? "pt-40 pb-8" : "py-16"
      }`}
      onClick={onTap}
      role="button"
      aria-label={open ? "Open the letter" : "Open the envelope"}
    >
      <div className="relative aspect-[587/425] w-full max-w-[380px] sm:max-w-[420px] md:max-w-[460px]">
        <svg
          viewBox="0 0 587 425"
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 h-full w-full [filter:drop-shadow(0_12px_18px_rgba(232,138,130,0.4))]"
        >
          <path
            d={BODY_D}
            fill="#F7B8B0"
            stroke="#3A3A3A"
            strokeWidth="2.5"
            strokeLinejoin="round"
            strokeLinecap="round"
          />
        </svg>

        <div className="pointer-events-none absolute inset-x-0 -top-[25%] bottom-[3.76%] z-[3] overflow-hidden">
          <motion.div
            className="absolute left-[15%] top-[58.4%] h-[57.6%] w-[70%]"
            initial={false}
            animate={{ y: open ? "-92%" : "0%" }}
            transition={{
              type: "spring",
              stiffness: 360,
              damping: 30,
              delay: open ? 0.45 : 0,
            }}
            style={{ willChange: "transform" }}
          >
            <motion.div
              className="relative h-full w-full"
              initial={false}
              animate={open ? { y: [0, -10, 0] } : { y: 0 }}
              transition={
                open ? { duration: 3, repeat: Infinity, ease: "easeInOut" } : { duration: 0.3 }
              }
            >
              <svg viewBox="0 0 587 425" aria-hidden="true" className="absolute inset-0 h-full w-full">
                <path
                  d={LETTER_D}
                  fill="#FFF9F6"
                  stroke="#3A3A3A"
                  strokeWidth="2.5"
                  strokeLinejoin="round"
                  strokeLinecap="round"
                />
                {LETTER_LINES.map((d, index) => (
                  <path
                    key={index}
                    d={d}
                    fill="none"
                    stroke="#3A3A3A"
                    strokeWidth="3"
                    strokeOpacity="0.3"
                    strokeLinecap="round"
                  />
                ))}
                <text
                  x="293"
                  y="108"
                  textAnchor="middle"
                  fontSize="54"
                  className="font-script fill-heart-red"
                >
                  You&rsquo;re invited!
                </text>
                <path
                  d={LETTER_HEART}
                  transform="translate(293 240)"
                  fill="#D9483F"
                  stroke="#3A3A3A"
                  strokeWidth="1.5"
                  strokeLinejoin="round"
                />
              </svg>
            </motion.div>
          </motion.div>
        </div>

        <svg viewBox="0 0 587 425" aria-hidden="true" className="pointer-events-none absolute inset-0 z-[5] h-full w-full">
          <path
            d={POCKET_D}
            fill="#F7B8B0"
            stroke="#3A3A3A"
            strokeWidth="2.5"
            strokeLinejoin="round"
            strokeLinecap="round"
          />
          <path d={LIP_D} fill="none" stroke="#3A3A3A" strokeWidth="2.5" strokeLinecap="round" />
          <path
            d={LIP_SHADOW_D}
            fill="none"
            stroke="#E88A82"
            strokeWidth="5"
            strokeOpacity="0.25"
            strokeLinecap="round"
          />
          <path
            d={CREASE_L}
            fill="none"
            stroke="#E88A82"
            strokeWidth="3"
            strokeOpacity="0.7"
            strokeLinecap="round"
          />
          <path
            d={CREASE_R}
            fill="none"
            stroke="#E88A82"
            strokeWidth="3"
            strokeOpacity="0.7"
            strokeLinecap="round"
          />
        </svg>

        <motion.svg
          viewBox="0 0 587 195.5"
          aria-hidden="true"
          className={`pointer-events-none absolute inset-x-0 top-0 h-[46%] w-full ${
            flapSettled ? "z-[2]" : "z-[30]"
          }`}
          style={{ transformOrigin: "50% 0%", transformPerspective: 900 }}
          initial={false}
          animate={open ? { rotateX: 175 } : { rotateX: 0 }}
          transition={{ duration: 0.32, ease: "easeInOut", delay: open ? 0.02 : 0 }}
        >
          <path
            d={FLAP_D}
            fill="#F7B8B0"
            stroke="#3A3A3A"
            strokeWidth="2.5"
            strokeLinejoin="round"
            strokeLinecap="round"
          />
          <path
            d={FLAP_SHADOW_L}
            fill="none"
            stroke="#E88A82"
            strokeWidth="2.5"
            strokeOpacity="0.7"
            strokeLinecap="round"
          />
          <path
            d={FLAP_SHADOW_R}
            fill="none"
            stroke="#E88A82"
            strokeWidth="2.5"
            strokeOpacity="0.7"
            strokeLinecap="round"
          />
        </motion.svg>

        <div className="pointer-events-none absolute left-1/2 top-[46%] z-[40] h-[112px] w-[120px] -translate-x-1/2 -translate-y-1/2">
          <motion.svg
            viewBox="-40 -36 80 72"
            className="h-full w-full"
            initial={false}
            style={{ transformOrigin: "50% 50%" }}
            animate={
              open
                ? { scale: [1, 1.35, 0], rotate: [-6, -16, 20], opacity: [1, 1, 0] }
                : { scale: [1, 1.07, 1], opacity: 1 }
            }
            transition={
              open
                ? { duration: 0.6, ease: "easeInOut" }
                : { duration: 1.5, repeat: Infinity, ease: "easeInOut" }
            }
          >
            <path
              d={SEAL_HEART}
              fill="#D9483F"
              stroke="#3A3A3A"
              strokeWidth="2"
              strokeLinejoin="round"
            />
          </motion.svg>
        </div>
      </div>

      <motion.p
        className="font-script text-xl sm:text-2xl md:text-3xl text-heart-red"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.4 }}
      >
        {open ? "Tap the letter to open your invite" : "Tap the heart seal to open"}
      </motion.p>
    </motion.div>
  );
}

function InfoRow({
  icon,
  label,
  value,
  sub,
}: {
  icon: ReactNode;
  label: string;
  value: string;
  sub?: string;
}) {
  return (
    <div className="flex items-start gap-4">
      <span className="mt-0.5 flex h-10 w-10 flex-none items-center justify-center rounded-full bg-blush-light text-heart-red sm:h-11 sm:w-11 md:h-12 md:w-12">
        {icon}
      </span>
      <div className="min-w-0">
        <p className="text-xs font-bold uppercase tracking-wider text-blush-dark">
          {label}
        </p>
        <p className="text-base font-semibold text-ink">{value}</p>
        {sub ? <p className="text-sm text-ink/70">{sub}</p> : null}
      </div>
    </div>
  );
}

function pillClasses(selected: boolean) {
  const base =
    "flex flex-1 items-center justify-center gap-1.5 rounded-2xl border px-3 py-2.5 text-sm font-semibold transition focus:outline-none focus:ring-2 focus:ring-heart-red/40";
  return selected
    ? `${base} border-heart-red bg-heart-red text-paper`
    : `${base} border-blush-mid bg-blush-light text-ink hover:bg-blush-mid/60`;
}

type InviteCardProps = {
  name: string;
  nameError: string | null;
  attending: boolean | null;
  submitting: boolean;
  error: string | null;
  setName: (value: string) => void;
  setNameError: (value: string | null) => void;
  setAttending: (value: boolean) => void;
  onSubmit: () => void;
};

function InviteCard({
  name,
  nameError,
  attending,
  submitting,
  error,
  setName,
  setNameError,
  setAttending,
  onSubmit,
}: InviteCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -20, scale: 0.97 }}
      transition={{ duration: 0.45, ease: "easeOut" }}
      className="rounded-3xl border border-blush-mid bg-paper p-6 shadow-xl shadow-blush-dark/25 sm:p-8 md:p-10"
    >
      <h1 className="text-center font-script text-4xl sm:text-5xl md:text-6xl leading-tight text-heart-red">
        You&rsquo;re Invited!
      </h1>

      <div className="mt-8 space-y-5">
        <InfoRow
          icon={<CalendarDays className="h-5 w-5" />}
          label="Date"
          value={date}
        />
        <InfoRow
          icon={<Clock className="h-5 w-5" />}
          label="Time"
          value={time}
        />
        <InfoRow
          icon={<MapPin className="h-5 w-5" />}
          label="Venue"
          value={venueName}
        />
      </div>

      <div className="mt-5 h-44 w-full overflow-hidden rounded-2xl border border-blush-mid">
        <iframe
          src={mapsEmbedSrc}
          title="Venue map"
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          className="h-full w-full border-0"
        />
      </div>

      <form
        onSubmit={(event) => {
          event.preventDefault();
          onSubmit();
        }}
        className="mt-8 space-y-5"
      >
        <label className="block">
          <span className="mb-1.5 flex items-center justify-between text-sm font-semibold text-ink">
            Your name
            {nameError ? (
              <motion.span
                id="name-error"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="font-medium text-heart-red"
                role="alert"
              >
                {nameError}
              </motion.span>
            ) : null}
          </span>
          <input
            value={name}
            onChange={(event) => {
              setName(event.target.value);
              setNameError(null);
            }}
            placeholder="First and last name"
            required
            aria-invalid={nameError ? true : undefined}
            aria-describedby={nameError ? "name-error" : undefined}
            className={`w-full rounded-2xl border bg-paper px-4 py-3 text-sm text-ink placeholder:text-blush-dark focus:outline-none focus:ring-2 ${
              nameError
                ? "border-heart-red ring-2 ring-heart-red/40"
                : "border-blush-mid focus:border-heart-red/50 focus:ring-heart-red/40"
            }`}
          />
        </label>

        <div>
          <span className="mb-1.5 block text-sm font-semibold text-ink">
            Can you make it?
          </span>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => setAttending(true)}
              className={pillClasses(attending === true)}
            >
              <Check className="h-4 w-4" />
              Yes, I&rsquo;ll be there
            </button>
            <button
              type="button"
              onClick={() => setAttending(false)}
              className={pillClasses(attending === false)}
            >
              <X className="h-4 w-4" />
              Sorry, can&rsquo;t make it
            </button>
          </div>
        </div>

        {error ? (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="rounded-xl bg-blush-light px-3 py-2 text-sm font-medium text-heart-red"
            role="alert"
          >
            {error}
          </motion.p>
        ) : null}

        <button
          type="submit"
          disabled={submitting}
          className="w-full rounded-full bg-heart-red py-3.5 text-sm font-bold text-paper shadow-lg shadow-heart-red/30 transition hover:brightness-105 focus:outline-none focus:ring-2 focus:ring-heart-red/40 focus:ring-offset-2 focus:ring-offset-paper disabled:cursor-not-allowed disabled:opacity-60 sm:py-4 sm:text-base"
        >
          {submitting ? "Saving your RSVP…" : "Send RSVP"}
        </button>
      </form>
    </motion.div>
  );
}

function ThankYouCard({ name }: { name: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, y: -16 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="flex flex-col items-center px-6 py-24 text-center"
    >
      <div className="relative h-40 w-40">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: [0.6, 1.15, 1] }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="absolute left-1/2 top-1/2 -ml-10 -mt-10 text-heart-red"
        >
          <Heart className="h-20 w-20 fill-heart-red" />
        </motion.div>
        {BURST.map((burst, index) => (
          <motion.span
            key={index}
            initial={{ x: 0, y: 0, scale: 0, opacity: 0 }}
            animate={{
              x: burst.x,
              y: burst.y,
              scale: [0, 1.15, 0.5],
              opacity: [0, 1, 0],
            }}
            transition={{
              delay: 0.1 + burst.delay,
              duration: 1.1,
              ease: "easeOut",
            }}
            className="absolute left-1/2 top-1/2 -ml-3 -mt-3 text-heart-red"
          >
            <Heart className="h-6 w-6 fill-heart-red" />
          </motion.span>
        ))}
      </div>
      <motion.h2
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.5 }}
        className="mt-8 font-script text-3xl sm:text-4xl md:text-5xl text-heart-red"
      >
        Thank you{name ? `, ${name}` : ""}!
      </motion.h2>
      <motion.p
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.55, duration: 0.5 }}
        className="mt-2 text-sm leading-relaxed text-ink/70"
      >
        Your RSVP is all set.
        <br />
        We can&rsquo;t wait to celebrate with you!
      </motion.p>
    </motion.div>
  );
}

export default function Invitation() {
  const [stage, setStage] = useState<Stage>("closed");
  const [name, setName] = useState("");
  const [nameError, setNameError] = useState<string | null>(null);
  const [attending, setAttending] = useState<boolean | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    const trimmedName = name.trim();
    if (!trimmedName) {
      setNameError("Please enter your name");
      setError(null);
      return;
    }
    setNameError(null);
    if (attending === null) {
      setError("Please choose Yes or No.");
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      if (!supabase) {
        throw new Error("Supabase is not configured");
      }
      const { error: dbError } = await supabase.from("rsvps").insert({
        name: trimmedName,
        attending,
      });
      if (dbError) {
        throw dbError;
      }
      setStage("confirmed");
    } catch {
      setError("We couldn't save your RSVP right now. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="flex min-h-dvh flex-col items-center justify-center bg-gradient-to-b from-blush-light via-paper to-blush-light px-4 py-10 md:py-16">
      <div className="w-full max-w-[380px] sm:max-w-[420px] md:max-w-[460px]">
        <AnimatePresence mode="wait">
          {stage === "expanded" ? (
            <InviteCard
              key="invite"
              name={name}
              nameError={nameError}
              attending={attending}
              submitting={submitting}
              error={error}
              setName={setName}
              setNameError={setNameError}
              setAttending={setAttending}
              onSubmit={handleSubmit}
            />
          ) : stage === "confirmed" ? (
            <ThankYouCard key="thanks" name={name.trim()} />
          ) : (
            <EnvelopeScene
              key="envelope"
              open={stage === "open"}
              onTap={() => setStage(stage === "closed" ? "open" : "expanded")}
            />
          )}
        </AnimatePresence>
      </div>
    </main>
  );
}