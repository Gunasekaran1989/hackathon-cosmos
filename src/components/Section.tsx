import { motion } from "framer-motion";
import { HackathonCard } from "./HackathonCard";
import type { Hackathon } from "@/data/hackathons";

interface Props {
  title: string;
  subtitle?: string;
  icon?: React.ReactNode;
  items: Hackathon[];
  onHover?: (id: string | null) => void;
  activeId?: string | null;
  id?: string;
}

export const Section = ({ title, subtitle, icon, items, onHover, activeId, id }: Props) => {
  if (!items.length) return null;
  return (
    <section id={id} className="py-16 sm:py-24 container">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.6 }}
        className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10"
      >
        <div>
          <div className="flex items-center gap-2 text-sm font-semibold uppercase tracking-widest text-muted-foreground mb-3">
            {icon} <span>{subtitle}</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-bold tracking-tight">{title}</h2>
        </div>
        <button className="text-sm font-semibold text-primary hover:underline self-start sm:self-auto">
          View all →
        </button>
      </motion.div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {items.map((h, i) => (
          <motion.div
            key={h.id}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.5, delay: i * 0.05 }}
          >
            <HackathonCard h={h} onHover={onHover} active={activeId === h.id} />
          </motion.div>
        ))}
      </div>
    </section>
  );
};
