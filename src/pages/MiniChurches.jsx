import { useEffect, useState } from "react";
import { Clock, Users, UsersRound } from "lucide-react";
import SectionHeading from "../components/SectionHeading";
import { getDepartments, getMiniChurchGroups } from "../data/content";
import { formatTime } from "../lib/db";
import { useSeo } from "../lib/useSeo";

const meetingText = (g) => {
  if (g.meeting_day) return `${g.meeting_day}s${g.meeting_time ? `, ${formatTime(g.meeting_time)}` : ""}`;
  return g.meeting || "";
};

function GroupCard({ group }) {
  const leaders = (group.leaders || []).map((l) => l.full_name).filter(Boolean);
  const when = meetingText(group);
  return (
    <article className="flex gap-3.5 rounded-xl bg-white p-4 shadow-sm ring-1 ring-ink/5">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-crimson/10 text-crimson">
        <UsersRound size={19} />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
          <h3 className="font-display text-base font-extrabold text-ink">{group.name}</h3>
          {group.group_label && group.group_label !== group.name && (
            <span className="rounded-full bg-gold/20 px-2 py-0.5 text-[11px] font-bold text-clay">{group.group_label}</span>
          )}
        </div>
        {group.description && <p className="mt-0.5 line-clamp-2 text-sm text-ink/65">{group.description}</p>}
        <dl className="mt-2 space-y-1 text-xs text-ink/65">
          {leaders.length > 0 && (
            <div className="flex gap-1.5"><dt className="font-bold text-ink/80">{leaders.length > 1 ? "Leaders:" : "Leader:"}</dt><dd>{leaders.join(", ")}</dd></div>
          )}
          {when && <div className="flex items-center gap-1.5"><Clock size={12} className="shrink-0 text-clay" /><dd>{when}</dd></div>}
          {group.member_count > 0 && <div className="flex items-center gap-1.5"><Users size={12} className="shrink-0 text-clay" /><dd>{group.member_count} members</dd></div>}
        </dl>
      </div>
    </article>
  );
}

export default function MiniChurches() {
  useSeo({ title: "Mini-Churches", description: "Mini-churches are small groups of members organised under each department of FGCK Christ Centre, meeting regularly for prayer, the Word and fellowship." });
  const [departments, setDepartments] = useState(null);
  const [groups, setGroups] = useState(null);

  useEffect(() => {
    getDepartments().then(setDepartments);
    getMiniChurchGroups().then(setGroups);
  }, []);

  const loading = departments === null || groups === null;
  const blocks = loading
    ? []
    : [
        ...departments.map((d) => ({ key: d.id, title: d.name, blurb: d.description, groups: groups.filter((g) => g.department_id === d.id) })),
        { key: "none", title: "Other groups", blurb: "Groups not yet assigned to a department.", groups: groups.filter((g) => !departments.some((d) => d.id === g.department_id)) },
      ].filter((b) => b.groups.length);

  return (
    <section className="mx-auto max-w-6xl px-5 py-12 lg:px-8 lg:py-16">
      <SectionHeading
        eyebrow="Small Groups"
        title="Mini-Churches"
        description="Mini-churches are small groups of members who meet regularly under each department, to pray, study the Word and care for one another."
        align="center"
      />

      <div className="mt-10 space-y-8">
        {blocks.map((b) => (
          <div key={b.key} data-reveal>
            <div className="mb-3 flex flex-wrap items-baseline gap-x-3">
              <h2 className="font-display text-xl font-extrabold text-ink">{b.title}</h2>
              <span className="text-xs font-bold uppercase tracking-wide text-clay">{b.groups.length} {b.groups.length === 1 ? "group" : "groups"}</span>
            </div>
            {b.blurb && <p className="-mt-2 mb-3 text-sm text-ink/60">{b.blurb}</p>}
            <div className="grid gap-3 border-l-2 border-gold/60 pl-4 sm:grid-cols-2 lg:grid-cols-3">
              {b.groups.map((g) => <GroupCard key={g.id} group={g} />)}
            </div>
          </div>
        ))}
        {!loading && blocks.length === 0 && <p className="text-center text-ink/50">Mini-church groups will be listed here soon.</p>}
      </div>
    </section>
  );
}
