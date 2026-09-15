"use client";

import { useState, type ReactNode } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { CalendarDays, Check, Clock, Heart, MapPin, X } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { assets, date, mapsEmbedSrc, time, venueName } from "@/lib/invite";

type Stage = "closed" | "open" | "expanded" | "confirmed";

const BURST = Array.from({ length: 12 }, (_, i) => {
  const angle = (i / 12) * Math.PI * 2;
  return {
    x: Math.cos(angle) * 80,
    y: Math.sin(angle) * 80 - 16,
    delay: i * 0.07,
  };
});

function EnvelopeScene({ open, onTap }: { open: boolean; onTap: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -16, scale: 0.97 }}
      transition={{ duration: 0.45, ease: "easeOut" }}
      className="flex cursor-pointer select-none flex-col items-center gap-8 py-16"
      onClick={onTap}
      role="button"
      aria-label={open ? "Open the letter" : "Open the envelope"}
    >
      <div className="relative aspect-[587/425] w-full max-w-[420px] overflow-hidden rounded-lg shadow-2xl shadow-blush-dark/25">
        <Image
          src={assets.envelopeBack}
          alt="Envelope"
          fill
          sizes="420px"
          priority
          draggable={false}
          className="z-0 object-fill"
        />

        <motion.div
          className="absolute left-[10%] top-[4%] z-10 w-[80%]"
          initial={false}
          animate={{ y: open ? "-10%" : "0%" }}
          transition={{ type: "spring", stiffness: 240, damping: 28 }}
          style={{ willChange: "transform" }}
        >
          <motion.div
            className="relative aspect-[587/425]"
            initial={false}
            animate={{
              clipPath: open ? "inset(0% 0% 0% 0%)" : "inset(0% 0% 55% 0%)",
            }}
            transition={{ duration: 0.5, ease: "easeInOut" }}
          >
            <Image
              src={assets.letter}
              alt=""
              fill
              sizes="336px"
              draggable={false}
              className="object-fill"
            />
            <motion.div
              className="absolute left-1/2 top-[15%] z-10 -ml-5 text-heart-red"
              initial={false}
              animate={open ? { y: [0, -7, 0] } : { y: 0 }}
              transition={{ duration: 2.6, repeat: Infinity, ease: "easeInOut" }}
            >
              <Heart className="h-10 w-10 fill-heart-red" />
            </motion.div>
          </motion.div>
        </motion.div>

        <motion.div
          className="absolute inset-0 z-20"
          style={{
            transformOrigin: "top center",
            backfaceVisibility: "hidden",
          }}
          initial={false}
          animate={open ? { rotateX: 180 } : { rotateX: 0 }}
          transition={{ duration: 0.7, ease: "easeInOut" }}
        >
          <Image
            src={assets.envelopeFlap}
            alt=""
            fill
            sizes="420px"
            draggable={false}
            className="object-fill"
          />
        </motion.div>

        <motion.div
          className="pointer-events-none absolute inset-0 z-30"
          style={{ transformOrigin: "50% 39.5%" }}
          initial={false}
          animate={
            open
              ? {
                  scale: [1, 1.4, 0],
                  rotate: [0, -18, 6],
                  opacity: [1, 1, 0],
                }
              : { scale: [1, 1.07, 1], opacity: 1 }
          }
          transition={
            open
              ? { duration: 0.6, ease: "easeInOut" }
              : { duration: 1.5, repeat: Infinity, ease: "easeInOut" }
          }
        >
          <Image
            src={assets.seal}
            alt="Heart wax seal"
            fill
            sizes="420px"
            draggable={false}
            className="object-fill drop-shadow"
          />
        </motion.div>
      </div>

      <motion.p
        className="font-script text-2xl text-heart-red"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.4 }}
      >
        {open ? "Tap the letter" : "Tap the heart seal to open"}
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
      <span className="mt-0.5 flex h-10 w-10 flex-none items-center justify-center rounded-full bg-blush-light text-heart-red">
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
  attending: boolean | null;
  message: string;
  submitting: boolean;
  error: string | null;
  setName: (value: string) => void;
  setAttending: (value: boolean) => void;
  setMessage: (value: string) => void;
  onSubmit: () => void;
};

function InviteCard({
  name,
  attending,
  message,
  submitting,
  error,
  setName,
  setAttending,
  setMessage,
  onSubmit,
}: InviteCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -20, scale: 0.97 }}
      transition={{ duration: 0.45, ease: "easeOut" }}
      className="rounded-3xl border border-blush-mid bg-paper p-6 shadow-xl shadow-blush-dark/25 sm:p-8"
    >
      <h1 className="text-center font-script text-5xl leading-tight text-heart-red">
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
          <span className="mb-1.5 block text-sm font-semibold text-ink">
            Your name
          </span>
          <input
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="First and last name"
            required
            className="w-full rounded-2xl border border-blush-mid bg-paper px-4 py-3 text-sm text-ink placeholder:text-blush-dark focus:border-heart-red/50 focus:outline-none focus:ring-2 focus:ring-heart-red/40"
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

        <label className="block">
          <span className="mb-1.5 block text-sm font-semibold text-ink">
            Birthday Message
          </span>
          <textarea
            value={message}
            onChange={(event) => setMessage(event.target.value)}
            rows={3}
            placeholder="A note for us…"
            className="w-full resize-none rounded-2xl border border-blush-mid bg-paper px-4 py-3 text-sm text-ink placeholder:text-blush-dark focus:border-heart-red/50 focus:outline-none focus:ring-2 focus:ring-heart-red/40"
          />
        </label>

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
          className="w-full rounded-full bg-heart-red py-3.5 text-sm font-bold text-paper shadow-lg shadow-heart-red/30 transition hover:brightness-105 focus:outline-none focus:ring-2 focus:ring-heart-red/40 focus:ring-offset-2 focus:ring-offset-paper disabled:cursor-not-allowed disabled:opacity-60"
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
        className="mt-8 font-script text-4xl text-heart-red"
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
  const [attending, setAttending] = useState<boolean | null>(null);
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (!name.trim() || attending === null) {
      setError("Please add your name and choose Yes or No.");
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      if (!supabase) {
        throw new Error("Supabase is not configured");
      }
      const { error: dbError } = await supabase.from("rsvps").insert({
        name: name.trim(),
        attending,
        message: message.trim() || null,
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
    <main className="flex min-h-dvh flex-col items-center justify-center bg-gradient-to-b from-blush-light via-paper to-blush-light px-4 py-10">
      <div className="w-full max-w-[420px]">
        <AnimatePresence mode="wait">
          {stage === "expanded" ? (
            <InviteCard
              key="invite"
              name={name}
              attending={attending}
              message={message}
              submitting={submitting}
              error={error}
              setName={setName}
              setAttending={setAttending}
              setMessage={setMessage}
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
