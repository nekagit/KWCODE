/** Testing Practices Tab Content component. */
import { CuratedPracticesCard } from "@/components/molecules/CardsAndDisplay/CuratedPracticesCard.tsx";
import { MyTestPracticesCard } from "@/components/molecules/CardsAndDisplay/MyTestPracticesCard.tsx";
import { getClasses } from "@/components/molecules/tailwind-molecules";
const classes = getClasses("TabAndContentSections/TestingPracticesTabContent.tsx");

interface TestingPracticesTabContentProps {
  myPractices: string;
  saveMyPractices: (value: string) => void;
}

export function TestingPracticesTabContent({
  myPractices,
  saveMyPractices,
}: TestingPracticesTabContentProps) {
  return (
    <div className={classes[0]}>
      <CuratedPracticesCard />
      <MyTestPracticesCard myPractices={myPractices} saveMyPractices={saveMyPractices} />
    </div>
  );
}
