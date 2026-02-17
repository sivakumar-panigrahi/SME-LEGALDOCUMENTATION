import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search } from "lucide-react";
import { getStatusLabel } from "@/lib/statusUtils";

interface DocumentFiltersProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  statusFilter: string;
  setStatusFilter: (status: string) => void;
  typeFilter: string;
  setTypeFilter: (type: string) => void;
  availableTypes?: string[];
}

const DB_STATUSES = ["draft", "company_signed", "sent_for_signature", "fully_signed"];

export const DocumentFilters = ({
  searchTerm,
  setSearchTerm,
  statusFilter,
  setStatusFilter,
  typeFilter,
  setTypeFilter,
  availableTypes = []
}: DocumentFiltersProps) => {
  return (
    <div className="flex flex-col sm:flex-row gap-4 md:gap-6">
      <div className="relative flex-1 min-w-0">
        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
        <Input
          placeholder="Search documents..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="input-modern pl-12 h-12 text-base placeholder:text-muted-foreground"
        />
      </div>
      
      <Select value={statusFilter} onValueChange={setStatusFilter}>
        <SelectTrigger className="w-full sm:w-56 h-12 bg-background/80 backdrop-blur-sm border border-border rounded-lg">
          <SelectValue placeholder="Status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Status</SelectItem>
          {DB_STATUSES.map(s => (
            <SelectItem key={s} value={s}>{getStatusLabel(s)}</SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select value={typeFilter} onValueChange={setTypeFilter}>
        <SelectTrigger className="w-full sm:w-56 h-12 bg-background/80 backdrop-blur-sm border border-border rounded-lg">
          <SelectValue placeholder="Document Type" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Types</SelectItem>
          {availableTypes.map(t => (
            <SelectItem key={t} value={t}>{t}</SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};
