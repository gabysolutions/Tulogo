import { useState } from "react";
import { PageHeader } from "../../components/ui/page-header";
import { CategoryTab } from "../../components/inventory/CategoryTab";
import { FabricTypeTab } from "../../components/inventory/FabricTypeTab";
import { ArticleTab } from "../../components/inventory/ArticleTab";

type InventoryTab = "articles" | "categories" | "fabric-types";

const TABS: { id: InventoryTab; label: string }[] = [
  { id: "articles", label: "Artículos" },
  { id: "categories", label: "Categorías" },
  { id: "fabric-types", label: "Tipos de tela" },
];

const Inventory = () => {
  const [activeTab, setActiveTab] = useState<InventoryTab>("articles");

  return (
    <main className="mx-auto w-full px-6 py-8">
      <div className="flex flex-col gap-4 bg-gray-50">
        <PageHeader title="Inventario" description="Administra categorías, tipos de tela y artículos." />

        <div className="flex gap-2 border-b border-gray-200">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? "border-b-2 border-blue-600 text-blue-600"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {activeTab === "articles" && <ArticleTab />}
        {activeTab === "categories" && <CategoryTab />}
        {activeTab === "fabric-types" && <FabricTypeTab />}
      </div>
    </main>
  );
};

export default Inventory;