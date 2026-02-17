export const STATUS_LABELS: Record<string, string> = {
  draft: "Draft",
  company_signed: "Company Signed",
  sent_for_signature: "Sent for Client Signature",
  fully_signed: "Fully Signed",
};

export const getStatusLabel = (status: string): string => {
  return STATUS_LABELS[status] || status.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
};

export const getStatusIcon = (status: string) => {
  switch (status) {
    case "draft": return "clock";
    case "company_signed": return "pen-tool";
    case "sent_for_signature": return "mail";
    case "fully_signed": return "check-circle";
    default: return "clock";
  }
};

export const getStatusBadgeClass = (status: string): string => {
  switch (status) {
    case "draft": return "badge-draft";
    case "company_signed": return "badge-company-signed";
    case "sent_for_signature": return "badge-sent-signature";
    case "fully_signed": return "badge-fully-signed";
    default: return "bg-gray-100 text-gray-800";
  }
};

export const getStatusColor = (status: string): string => {
  switch (status) {
    case "draft": return "bg-yellow-100 text-yellow-800";
    case "company_signed": return "bg-blue-100 text-blue-800";
    case "sent_for_signature": return "bg-orange-100 text-orange-800";
    case "fully_signed": return "bg-green-100 text-green-800";
    default: return "bg-gray-100 text-gray-800";
  }
};
