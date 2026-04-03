"use client";

import { PageHeader } from "@/components/portal/widgets/PageHeader";
import { Clock, TrendingUp, TrendingDown, Minus } from "lucide-react";
import { useState } from "react";

export default function EconomicCalendarPage() {
  const [selectedDate, setSelectedDate] = useState("Today");

  const events = [
    {
      time: "08:30",
      currency: "USD",
      event: "Non-Farm Payrolls",
      actual: "275K",
      forecast: "200K",
      previous: "229K",
      impact: "high",
      status: "better",
    },
    {
      time: "08:30",
      currency: "USD",
      event: "Unemployment Rate",
      actual: "3.9%",
      forecast: "3.7%",
      previous: "3.7%",
      impact: "high",
      status: "worse",
    },
    {
      time: "10:00",
      currency: "EUR",
      event: "ECB President Speech",
      actual: "-",
      forecast: "-",
      previous: "-",
      impact: "medium",
      status: "neutral",
    },
    {
      time: "14:00",
      currency: "USD",
      event: "ISM Manufacturing PMI",
      actual: "-",
      forecast: "49.5",
      previous: "49.1",
      impact: "medium",
      status: "pending",
    },
    {
      time: "16:30",
      currency: "GBP",
      event: "BOE Interest Rate Decision",
      actual: "-",
      forecast: "5.25%",
      previous: "5.25%",
      impact: "high",
      status: "pending",
    },
    {
      time: "20:00",
      currency: "USD",
      event: "FOMC Meeting Minutes",
      actual: "-",
      forecast: "-",
      previous: "-",
      impact: "high",
      status: "pending",
    },
  ];

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case "high":
        return "bg-red-50 text-red-700 border-red-200";
      case "medium":
        return "bg-amber-50 text-amber-700 border-amber-200";
      default:
        return "bg-gray-50 text-gray-700 border-gray-200";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "better":
        return <TrendingUp className="w-4 h-4 text-green-600" />;
      case "worse":
        return <TrendingDown className="w-4 h-4 text-red-600" />;
      case "neutral":
        return <Minus className="w-4 h-4 text-gray-500" />;
      default:
        return <Clock className="w-4 h-4 text-gray-400" />;
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Economic Calendar"
        description="Track important economic events and indicators"
      />

      {/* Date Filter */}
      <div className="flex items-center gap-2">
        {["Yesterday", "Today", "Tomorrow", "This Week"].map((date) => (
          <button
            key={date}
            onClick={() => setSelectedDate(date)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
              selectedDate === date
                ? "bg-blue-600 text-white shadow-sm"
                : "bg-white border-2 border-gray-200 text-gray-700 hover:border-blue-300"
            }`}
          >
            {date}
          </button>
        ))}
      </div>

      {/* Events Table */}
      <div className="bg-white border-2 border-gray-200 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">Time</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">Currency</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">Event</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">Impact</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600">Actual</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600">Forecast</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600">Previous</th>
              </tr>
            </thead>
            <tbody>
              {events.map((event, index) => (
                <tr
                  key={index}
                  className="border-b border-gray-100 last:border-0 hover:bg-blue-50/30 transition-colors"
                >
                  <td className="px-4 py-3 text-sm text-gray-600">{event.time}</td>
                  <td className="px-4 py-3">
                    <span className="inline-flex items-center justify-center w-10 h-6 bg-gray-100 rounded text-xs font-semibold text-gray-700">
                      {event.currency}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-gray-900">{event.event}</span>
                      {getStatusIcon(event.status)}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-block px-2 py-0.5 text-xs font-medium rounded border ${getImpactColor(
                        event.impact
                      )}`}
                    >
                      {event.impact.charAt(0).toUpperCase() + event.impact.slice(1)}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right text-sm font-medium text-gray-900">
                    {event.actual}
                  </td>
                  <td className="px-4 py-3 text-right text-sm text-gray-600">{event.forecast}</td>
                  <td className="px-4 py-3 text-right text-sm text-gray-600">{event.previous}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 text-xs text-gray-600">
        <span className="flex items-center gap-1">
          <TrendingUp className="w-3 h-3 text-green-600" />
          Better than expected
        </span>
        <span className="flex items-center gap-1">
          <TrendingDown className="w-3 h-3 text-red-600" />
          Worse than expected
        </span>
        <span className="flex items-center gap-1">
          <Clock className="w-3 h-3 text-gray-400" />
          Pending
        </span>
      </div>
    </div>
  );
}
