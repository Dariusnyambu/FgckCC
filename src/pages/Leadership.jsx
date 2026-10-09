import { useEffect, useState } from "react";
import { useSeo } from "../lib/useSeo";
import SectionHeading from "../components/SectionHeading";
import LeaderCard from "../components/LeaderCard";
import { getLeaders } from "../data/content";

export default function Leadership() {
  useSeo({ title: 'Our Leadership', description: 'Meet Rev. Dr. John Kimani, Pst. Jane Kimani and the leadership team shepherding FGCK Christ Centre.' });
  const [leaders, setLeaders] = useState([]);

  useEffect(() => {
    getLeaders().then(setLeaders);
  }, []);

  return (
    <section className="mx-auto max-w-7xl px-5 py-16 lg:px-8 lg:py-24">
      <SectionHeading
        eyebrow="Servanthood Leadership"
        title="Our Leadership"
        description="Meet the pastors and leaders shepherding FGCK Christ Centre."
        align="center"
      />
      <div className="mt-14 grid gap-6 sm:grid-cols-2">
        {leaders.map((leader, i) => (
          <LeaderCard key={leader.id} leader={leader} featured={i === 0 && leaders.length % 2 === 1} />
        ))}
      </div>
    </section>
  );
}
