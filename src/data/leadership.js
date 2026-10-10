// The five tiers of church leadership, in the order they appear on the website.
// `value` is what is stored in leaders.category (see supabase/migrations/0003_leadership_hierarchy.sql).
export const LEADER_CATEGORIES = [
  { value: "pastoral_team", label: "Pastoral Team", blurb: "Shepherding and overseeing the whole church family." },
  { value: "church_council", label: "Church Council", blurb: "Guiding the direction, governance and stewardship of the church." },
  { value: "departmental_heads", label: "Departmental Heads", blurb: "Leading the church's departments and ministries." },
  { value: "service_sector_leaders", label: "Service Sector Leaders", blurb: "Leading the teams that serve in our services and events." },
  { value: "mini_church_leaders", label: "Mini-Church Leaders", blurb: "Caring for members in the mini-church groups under each department." },
];

export const LEADER_CATEGORY_OPTIONS = LEADER_CATEGORIES.map(({ value, label }, i) => ({ value, label: `${i + 1}. ${label}` }));

export const categoryIndex = (value) => {
  const i = LEADER_CATEGORIES.findIndex((c) => c.value === value);
  return i === -1 ? 0 : i;
};
