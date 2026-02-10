import { CuratedPracticesCard } from "@/components/molecules/CardsAndDisplay/CuratedPracticesCard/CuratedPracticesCard";
import { MyTestPracticesCard } from "@/components/molecules/CardsAndDisplay/MyTestPracticesCard/MyTestPracticesCard";

interface TestingPracticesTabContentProps {
  myPractices: string;
  saveMyPractices: (value: string) => void;
}

export function TestingPracticesTabContent({
  myPractices,
  saveMyPractices,
}: TestingPracticesTabContentProps) {
  return (
    <div className="mt-6 space-y-6">
      <CuratedPracticesCard />
      <MyTestPracticesCard myPractices={myPractices} saveMyPractices={saveMyPractices} />
    </div>
  );
}
