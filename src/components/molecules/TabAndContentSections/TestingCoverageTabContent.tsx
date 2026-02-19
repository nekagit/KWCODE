/** Testing Coverage Tab Content component. */
import { CoverageDashboard } from "@/components/molecules/DashboardsAndViews/CoverageDashboard.tsx";
import { getClasses } from "@/components/molecules/tailwind-molecules";
const classes = getClasses("TabAndContentSections/TestingCoverageTabContent.tsx");

export function TestingCoverageTabContent() {
  return (
    <div className={classes[0]}>
      <CoverageDashboard />
    </div>
  );
}
