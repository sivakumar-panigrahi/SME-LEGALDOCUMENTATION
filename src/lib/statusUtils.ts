/**
 * Maps database snake_case status values to human-readable display labels.
 *
 */
export const getStatusLabel = (status: string): string => {
  const statusMap: Record<string, string> = {
    'draft': 'Draft',
    'company_signed': 'Company Signed',
    'sent_for_signature': 'Sent for Client Signature',
    'fully_signed': 'Fully Signed',
  };

  return statusMap[status] || status.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
};

/**
 * Returns the appropriate shadcn badge variant based on the document status.
 *
 */
export const getStatusVariant = (status: string): "secondary" | "default" | "outline" | "destructive" => {
  switch (status) {
    case 'draft':
      return 'secondary';
    case 'company_signed':
      return 'default';
    case 'sent_for_signature':
      return 'outline';
    case 'fully_signed':
      return 'default';
    default:
      return 'secondary';
  }
};
/**
 * Returns the appropriate tailwind classes for the status badge.
 *
 */
export const getStatusBadgeClass = (status: string): string => {
  switch (status) {
    case 'draft':
      return 'bg-amber-100 text-amber-800 border-amber-200';
    case 'company_signed':
      return 'bg-blue-100 text-blue-800 border-blue-200';
    case 'sent_for_signature':
      return 'bg-orange-100 text-orange-800 border-orange-200';
    case 'fully_signed':
      return 'bg-emerald-100 text-emerald-800 border-emerald-200';
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200';
  }
};
