import { ArchitectureRecord, ArchitectureCategory } from "@/types/architecture";
import { MyDefinitionsCard } from "@/components/molecules/CardsAndDisplay/MyDefinitionsCard.tsx";
import { getClasses } from "@/components/molecules/tailwind-molecules";
const classes = getClasses("TabAndContentSections/MyDefinitionsTabContent.tsx");

interface MyDefinitionsTabContentProps {
  items: ArchitectureRecord[];
  loading: boolean;
  filterCategory: ArchitectureCategory | "all";
  setFilterCategory: React.Dispatch<React.SetStateAction<ArchitectureCategory | "all">>;
  ALL_CATEGORIES: ArchitectureCategory[];
  CATEGORY_LABELS: Record<ArchitectureCategory, string>;
  openView: (record: ArchitectureRecord) => void;
  openEdit: (record: ArchitectureRecord) => void;
  handleDelete: (id: string) => Promise<void>;
}

export function MyDefinitionsTabContent({
  items,
  loading,
  filterCategory,
  setFilterCategory,
  ALL_CATEGORIES,
  CATEGORY_LABELS,
  openView,
  openEdit,
  handleDelete,
}: MyDefinitionsTabContentProps) {
  return (
    <div className={classes[0]}>
      <MyDefinitionsCard
        items={items}
        loading={loading}
        filterCategory={filterCategory}
        setFilterCategory={setFilterCategory}
        ALL_CATEGORIES={ALL_CATEGORIES}
        CATEGORY_LABELS={CATEGORY_LABELS}
        openView={openView}
        openEdit={openEdit}
        handleDelete={handleDelete}
      />
    </div>
  );
}
