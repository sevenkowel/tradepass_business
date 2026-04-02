"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { Search, Filter, X, ChevronDown } from "lucide-react";
import { Button } from "./PageHeader";

interface FilterOption {
  label: string;
  value: string;
}

interface FilterBarProps {
  filters: {
    key: string;
    label: string;
    type: "text" | "select" | "date" | "daterange";
    placeholder?: string;
    options?: FilterOption[];
    value?: string;
    onChange?: (value: string) => void;
  }[];
  onSearch?: (values: Record<string, string>) => void;
  onClear?: () => void;
  className?: string;
  searchable?: boolean;
  showSearch?: boolean;
  searchPlaceholder?: string;
  searchValue?: string;
  searchKeys?: string[];
  onSearchChange?: (value: string) => void;
}

export function FilterBar({
  filters,
  onSearch,
  onClear,
  className,
  searchable = false,
  showSearch = true,
  searchPlaceholder = "Search...",
  searchValue,
  searchKeys,
  onSearchChange,
}: FilterBarProps) {
  const [localSearch, setLocalSearch] = useState(searchValue || "");
  const [showFilters, setShowFilters] = useState(true);
  const [filterValues, setFilterValues] = useState<Record<string, string>>(
    () =>
      filters.reduce((acc, f) => {
        if (f.value) acc[f.key] = f.value;
        return acc;
      }, {} as Record<string, string>)
  );

  const handleSearch = () => {
    const values = { ...filterValues };
    if (localSearch) values.search = localSearch;
    onSearch?.(values);
  };

  const handleClear = () => {
    setLocalSearch("");
    setFilterValues({});
    onClear?.();
  };

  const handleFilterChange = (key: string, value: string) => {
    setFilterValues((prev) => ({ ...prev, [key]: value }));
    filters.find((f) => f.key === key)?.onChange?.(value);
  };

  const hasActiveFilters =
    localSearch || Object.values(filterValues).some(Boolean);

  return (
    <div className={cn("space-y-4", className)}>
      {/* Search and Filter Toggle */}
      <div className="flex flex-col sm:flex-row gap-3">
        {showSearch && (
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={localSearch}
              onChange={(e) => setLocalSearch(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              placeholder={searchPlaceholder}
              className="w-full h-10 pl-10 pr-4 bg-white border border-gray-200 rounded-xl text-sm placeholder-gray-400 focus:outline-none focus:border-blue-300 focus:ring-2 focus:ring-blue-100 transition-all"
            />
          </div>
        )}

        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
            className={cn(!showFilters && "text-gray-400")}
          >
            <Filter className="w-4 h-4" />
            Filters
            {hasActiveFilters && (
              <span className="ml-1 w-5 h-5 bg-blue-100 text-blue-600 rounded-full text-xs flex items-center justify-center">
                {Object.values(filterValues).filter(Boolean).length +
                  (localSearch ? 1 : 0)}
              </span>
            )}
          </Button>

          {hasActiveFilters && (
            <Button variant="ghost" size="sm" onClick={handleClear}>
              <X className="w-4 h-4" />
              Clear
            </Button>
          )}
        </div>
      </div>

      {/* Filter Options */}
      {showFilters && filters.length > 0 && (
        <div className="flex flex-wrap gap-3 p-4 bg-gray-50 rounded-xl border border-gray-100">
          {filters.map((filter) => (
            <div key={filter.key} className="min-w-[160px]">
              {filter.type === "select" && (
                <SelectFilter
                  label={filter.label}
                  options={filter.options || []}
                  value={filterValues[filter.key] || ""}
                  onChange={(v) => handleFilterChange(filter.key, v)}
                  placeholder={filter.placeholder}
                />
              )}
              {filter.type === "text" && (
                <TextFilter
                  label={filter.label}
                  value={filterValues[filter.key] || ""}
                  onChange={(v) => handleFilterChange(filter.key, v)}
                  placeholder={filter.placeholder}
                />
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// Sub-components
interface SelectFilterProps {
  label: string;
  options: FilterOption[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

function SelectFilter({
  label,
  options,
  value,
  onChange,
  placeholder = "Select...",
}: SelectFilterProps) {
  return (
    <div>
      <label className="block text-xs font-medium text-gray-500 mb-1">
        {label}
      </label>
      <div className="relative">
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full h-9 pl-3 pr-8 bg-white border border-gray-200 rounded-lg text-sm appearance-none focus:outline-none focus:border-blue-300 cursor-pointer"
        >
          <option value="">{placeholder}</option>
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
      </div>
    </div>
  );
}

interface TextFilterProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

function TextFilter({
  label,
  value,
  onChange,
  placeholder,
}: TextFilterProps) {
  return (
    <div>
      <label className="block text-xs font-medium text-gray-500 mb-1">
        {label}
      </label>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full h-9 px-3 bg-white border border-gray-200 rounded-lg text-sm placeholder-gray-400 focus:outline-none focus:border-blue-300"
      />
    </div>
  );
}
