/** @format */

// components/ServiceManagement.tsx - Composant principal avec tabs
import React, { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tag, Settings } from "lucide-react";
import CategoriesTab from "./CategoriesTab";
import ServicesTab from "./ServicesTab";
// import CategoriesTab from "./categories/CategoriesTab";
// import ServicesTab from "./services/ServicesTab";

export default function ServiceManagement() {
  const [activeTab, setActiveTab] = useState("categories");

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="min-w-0 flex-1">
        <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:truncate sm:text-3xl sm:tracking-tight">
          Gestion des Services
        </h2>
        <p className="mt-1 text-sm text-gray-500">
          Organisez vos services par catégories et gérez leurs tarifs
        </p>
      </div>

      {/* Tabs */}
      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger
            value="categories"
            className="flex items-center gap-2">
            <Tag className="h-4 w-4" />
            Catégories
          </TabsTrigger>
          <TabsTrigger
            value="services"
            className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Services
          </TabsTrigger>
        </TabsList>

        <TabsContent
          value="categories"
          className="space-y-4">
          <CategoriesTab />
        </TabsContent>

        <TabsContent
          value="services"
          className="space-y-4">
          <ServicesTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}
