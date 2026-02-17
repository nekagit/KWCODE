import { DashboardOverview } from "@/components/molecules/DashboardsAndViews/DashboardOverview";
import { getClasses } from "@/components/molecules/tailwind-molecules";

const classes = getClasses("TabAndContentSections/DashboardTabContent.tsx");

export function DashboardTabContent() {
  return (
    <div className={classes[0]}>
      <section className="mb-6">
        <DashboardOverview />
      </section>
    </div>
  );
}
