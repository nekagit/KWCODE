import { CuratedPracticesCard } from "@/components/molecules/CardsAndDisplay/CuratedPracticesCard.tsx";
import { MyTestPracticesCard } from "@/components/molecules/CardsAndDisplay/MyTestPracticesCard.tsx";

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
