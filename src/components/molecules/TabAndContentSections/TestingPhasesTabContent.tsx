/** Testing Phases Tab Content component. */
import { TestingPhasesCard } from "@/components/molecules/CardsAndDisplay/TestingPhasesCard.tsx";
import { getClasses } from "@/components/molecules/tailwind-molecules";
const classes = getClasses("TabAndContentSections/TestingPhasesTabContent.tsx");

export function TestingPhasesTabContent() {
  return (
    <div className={classes[0]}>
      <TestingPhasesCard />
    </div>
  );
}
