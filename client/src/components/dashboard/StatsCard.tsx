/** @format */

import { Card, CardContent } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatsCardProps {
  title: string;
  value: string | number;
  change: string;
  changeType: "positive" | "negative";
  icon: LucideIcon;
  iconColor: string;
}

export function StatsCard({
  title,
  value,
  change,
  changeType,
  icon: Icon,
  iconColor,
}: StatsCardProps) {
  return (
    <Card className="border border-gray-200">
      <CardContent className="p-5">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <div
              className={cn(
                "w-8 h-8 rounded-full flex items-center justify-center",
                iconColor,
              )}>
              <Icon className="h-5 w-5" />
            </div>
          </div>
          <div className="ml-5 w-0 flex-1">
            <dl>
              <dt className="text-sm font-medium text-gray-500 truncate">
                {title}
              </dt>
              <dd className="text-lg font-medium text-gray-900">{value}</dd>
            </dl>
          </div>
          {/* <div className={cn(
            "flex items-center text-sm",
            changeType === 'positive' ? 'text-green-600' : 'text-red-600'
          )}>
            <span className="mr-1">
              {changeType === "positive" ? "↑" : "↓"}
            </span>
            {change}
          </div> */}
        </div>
      </CardContent>
    </Card>
  );
}
