import { useEffect, useState } from "react";
import SectionHeading from "../components/SectionHeading";
import { Smartphone, Landmark, Gift } from "lucide-react";
import { getGivingSettings } from "../data/content";

function Row({ label, value }) {
  if (!value) return null;
  return (
    <div className="flex justify-between gap-4 border-t border-ink/10 py-2.5 text-sm first:border-0">
      <span className="text-ink/55">{label}</span>
      <span className="text-right font-semibold text-ink">{value}</span>
    </div>
  );
}

export default function Giving() {
  const [g, setG] = useState(null);
  useEffect(() => { getGivingSettings().then(setG); }, []);
  if (!g) return null;

  const hasMobile = g.mpesa_paybill || g.mpesa_till;
  const hasBank = g.bank_name || g.bank_account_number;

  return (
    <section className="mx-auto max-w-5xl px-5 py-16 lg:px-8 lg:py-24">
      <SectionHeading eyebrow="Partner With Us" title="Give Online" description={g.message} align="center" />

      <div className="mt-14 grid gap-6 sm:grid-cols-2">
        <div className="rounded-2xl bg-white p-7 shadow-sm ring-1 ring-ink/5">
          <Smartphone className="text-crimson" size={26} />
          <p className="mt-4 font-display text-xl font-extrabold text-ink">Mobile Money</p>
          {hasMobile ? (
            <div className="mt-3">
              <Row label="M-Pesa Paybill" value={g.mpesa_paybill} />
              <Row label="Account" value={g.mpesa_account} />
              <Row label="Buy Goods Till" value={g.mpesa_till} />
            </div>
          ) : (
            <p className="mt-2 text-sm text-ink/60">Mobile money details will be shared here soon. Please contact the church office.</p>
          )}
        </div>
        <div className="rounded-2xl bg-white p-7 shadow-sm ring-1 ring-ink/5">
          <Landmark className="text-crimson" size={26} />
          <p className="mt-4 font-display text-xl font-extrabold text-ink">Bank Transfer</p>
          {hasBank ? (
            <div className="mt-3">
              <Row label="Bank" value={g.bank_name} />
              <Row label="Account Name" value={g.bank_account_name} />
              <Row label="Account Number" value={g.bank_account_number} />
              <Row label="Branch" value={g.bank_branch} />
            </div>
          ) : (
            <p className="mt-2 text-sm text-ink/60">Bank details will be shared here soon. Please contact the church office.</p>
          )}
        </div>
      </div>

      {g.instructions && (
        <p className="mt-6 whitespace-pre-line rounded-2xl bg-gold/10 p-6 text-sm leading-relaxed text-ink/80">{g.instructions}</p>
      )}

      <div className="mt-6 rounded-2xl bg-crimson p-8 text-center text-cream">
        <Gift className="mx-auto text-gold" size={28} />
        <p className="mt-4 font-display text-2xl font-extrabold">Every gift makes a difference</p>
        <p className="mx-auto mt-2 max-w-md text-sm text-cream/80">Whether it's tithe, offering or a special campaign gift, thank you for partnering with FGCK Christ Centre.</p>
      </div>
    </section>
  );
}
