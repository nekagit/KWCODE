"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Loader2, FileText, Pencil, Trash2 } from "lucide-react";
import type { ArchitectureRecord, ArchitectureCategory } from "@/types/architecture";

interface MyDefinitionsCardProps {
  items: ArchitectureRecord[];
  loading: boolean;
  filterCategory: ArchitectureCategory | "all";
  setFilterCategory: (category: ArchitectureCategory | "all") => void;
  ALL_CATEGORIES: ArchitectureCategory[];
  CATEGORY_LABELS: Record<ArchitectureCategory, string>;
  openView: (record: ArchitectureRecord) => void;
  openEdit: (record: ArchitectureRecord) => void;
  handleDelete: (id: string) => Promise<void>;
}

export function MyDefinitionsCard({
  items,
  loading,
  filterCategory,
  setFilterCategory,
  ALL_CATEGORIES,
  CATEGORY_LABELS,
  openView,
  openEdit,
  handleDelete,
}: MyDefinitionsCardProps) {
  const filteredItems =
    filterCategory === "all"
      ? items
      : items.filter((a) => a.category === filterCategory);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>My definitions</CardTitle>
          <CardDescription>
            Definitions you added from templates or AI. Edit to add more inputs (references, anti-patterns, examples, custom fields).
          </CardDescription>
        </div>
        <Select value={filterCategory} onValueChange={(v) => setFilterCategory(v as ArchitectureCategory | "all")}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All categories</SelectItem>
            {ALL_CATEGORIES.map((cat) => (
              <SelectItem key={cat} value={cat}>
                {CATEGORY_LABELS[cat]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="py-12 text-center text-muted-foreground">
            <p>
              {filterCategory === "all"
                ? "No definitions yet."
                : `No definitions in ${CATEGORY_LABELS[filterCategory as ArchitectureCategory]}.`}
            </p>
            <p className="text-sm mt-1">Add from Templates or generate with AI, then edit here.</p>
          </div>
        ) : (
          <ScrollArea className="h-[calc(100vh-20rem)] pr-4">
            <ul className="space-y-3">
              {filteredItems.map((record) => (
                <li key={record.id}>
                  <Card className="bg-muted/30">
                    <CardContent className="pt-4">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0 flex-1">
                          <h3 className="font-medium">{record.name}</h3>
                          <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                            {record.description || "—"}
                          </p>
                          <div className="flex items-center gap-2 mt-2 flex-wrap">
                            <Badge variant="secondary">{CATEGORY_LABELS[record.category]}</Badge>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-7 text-xs"
                              onClick={() => openView(record)}
                            >
                              <FileText className="h-3.5 w-3.5 mr-1" />
                              View details
                            </Button>
                          </div>
                        </div>
                        <div className="flex shrink-0 gap-1">
                          <Button size="sm" variant="ghost" className="h-8 w-8 p-0" onClick={() => openView(record)}>
                            <FileText className="h-4 w-4" />
                          </Button>
                          <Button size="sm" variant="ghost" className="h-8 w-8 p-0" onClick={() => openEdit(record)}>
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                            onClick={() => handleDelete(record.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </li>
              ))}
            </ul>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
}
