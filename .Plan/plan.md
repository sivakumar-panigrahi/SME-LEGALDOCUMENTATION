
# LegalFlow -- Comprehensive Bug Fix and Functionality Plan

## Issues Identified

### 1. App.css Breaks Layout
The `App.css` file contains Vite boilerplate CSS that constrains the entire app layout:
- `#root { max-width: 1280px; margin: 0 auto; padding: 2rem; text-align: center; }` -- This forces a max-width, adds unwanted padding, and centers text globally, breaking the full-width sidebar layout and all page layouts.

**Fix:** Remove the Vite boilerplate CSS from `App.css`.

---

### 2. Dashboard Uses Hardcoded Data
- Greeting says "Hi John" instead of using the authenticated user's name.
- Stats (Total Documents: 24, Pending: 3, etc.) are hardcoded, not fetched from the database.
- Recent documents list is hardcoded mock data, not real documents from Supabase.
- "View" and "Edit" buttons on recent docs navigate to preview/form without passing actual document data, which would cause crashes.

**Fix:** Connect the Dashboard to Supabase, fetch real documents, display the user's actual name, and compute stats from real data.

---

### 3. MyDocuments Uses Hardcoded Mock Data
- The document list is entirely hardcoded (5 fake documents).
- "Create New Document" button doesn't navigate anywhere.
- Delete only logs to console, doesn't delete from the database.
- No actual Supabase queries are made.

**Fix:** Fetch documents from Supabase, wire up Create/Delete buttons, and display real data.

---

### 4. useSignDocument Causes Infinite Re-renders
- `getDocument` and `getDocumentByToken` from `useDocuments()` are in the `useEffect` dependency array, but they are recreated on every render (since `useDocuments` returns new function references each time).
- This causes an infinite loop of API calls.

**Fix:** Remove unstable function references from the dependency array or memoize them.

---

### 5. Document Data Structure Mismatch Between Views
- When creating a document via the form, it passes `{ template, formData, status: "Draft" }` to PDFPreview.
- When viewing from MyDocuments, it passes the mock object `{ id, title, type, status, ... }` which has completely different structure.
- The PDFPreview, DocumentViewer, and pdfGenerator expect `document.template.name`, `document.formData.employeeName`, etc. -- these crash when receiving a MyDocuments-style object.

**Fix:** When viewing a document from MyDocuments, fetch the full document from Supabase (with `form_data`) and transform it to the expected structure before passing to PDFPreview.

---

### 6. Status String Mismatch
- MyDocuments uses display strings: "Draft", "Company Signed", "Sent for Client Signature", "Fully Signed".
- Database uses snake_case: "draft", "company_signed", "sent_for_signature", "fully_signed".
- Filters won't work properly when real data is loaded because the status values don't match.

**Fix:** Normalize status handling -- store snake_case in DB, display human-readable labels in UI using a mapping function.

---

### 7. Profile Settings Not Connected to Auth
- ProfileSettings uses hardcoded values ("John", "Doe", "john@company.com").
- Save/Update just simulates with a timeout, doesn't persist to the `profiles` table.

**Fix:** Load profile data from Supabase `profiles` table and the auth user, save updates to the database.

---

### 8. Approvals and Clause Library Use Mock Data
- Both components use in-memory mock data that resets on page navigation.
- Actions (approve, reject, add clause, delete clause) don't persist.

**Fix:** Since there are no dedicated Supabase tables for approvals/clauses yet, keep them as local-state features but add a clear "demo mode" indicator. Alternatively, we can persist clauses to localStorage for now.

---

### 9. Edge Function Hardcoded App URL
- The `send-document-email` edge function has the app URL hardcoded: `const appUrl = "https://dcetsexykugrmfjixgal.lovable.app"`.
- This should use the actual deployed URL.

**Fix:** Use the request origin or an environment variable for the app URL.

---

### 10. SignDocument Header Status Display Bug
- `document.status.replace('_', ' ')` only replaces the FIRST underscore. For `sent_for_signature`, it shows "sent for_signature".

**Fix:** Use `replaceAll('_', ' ')` or a regex with global flag.

---

## Implementation Plan

### Phase 1: Critical Layout and Crash Fixes
1. **Clean up App.css** -- Remove Vite boilerplate that breaks layout.
2. **Fix useSignDocument infinite re-render** -- Remove function deps from useEffect.
3. **Fix status display bug** in SignDocument header (replace all underscores).

### Phase 2: Connect MyDocuments to Real Data
4. **Update MyDocuments** to fetch documents from Supabase using the authenticated user.
5. **Create a status mapping utility** for consistent display labels.
6. **Wire up Create New Document button** to navigate to templates.
7. **Implement real delete** functionality via Supabase.
8. **Fix document data transformation** so viewing a document from MyDocuments correctly loads it into PDFPreview.

### Phase 3: Connect Dashboard to Real Data
9. **Update Dashboard** to show the authenticated user's name.
10. **Fetch real document stats** (total, pending, sent, completed) from Supabase.
11. **Show actual recent documents** from Supabase.
12. **Fix View/Edit buttons** to load real document data.

### Phase 4: Connect Profile Settings
13. **Load profile data** from Supabase `profiles` table and auth user.
14. **Save profile updates** to the database.

### Phase 5: Minor Fixes
15. **Fix edge function app URL** to be dynamic.
16. **Persist Clause Library** to localStorage so clauses survive navigation.
17. **Add demo indicators** to Approvals (since no backend table exists for it).

---

## Technical Details

### Status Mapping Utility (new file: `src/lib/statusUtils.ts`)
```text
DB Value              -> Display Label
"draft"               -> "Draft"
"company_signed"      -> "Company Signed"
"sent_for_signature"  -> "Sent for Client Signature"
"fully_signed"        -> "Fully Signed"
```

### MyDocuments Supabase Query
Fetch documents where `user_id` matches the current authenticated user, ordered by `updated_at` descending.

### Dashboard Stats Query
Count documents by status for the current user to compute real stats.

### Files to Modify
- `src/App.css` -- Remove boilerplate
- `src/hooks/useSignDocument.ts` -- Fix infinite re-render
- `src/components/documents/MyDocuments.tsx` -- Connect to Supabase
- `src/components/documents/DocumentFilters.tsx` -- Use DB status values
- `src/components/documents/DocumentCard.tsx` -- Use status mapping
- `src/components/dashboard/Dashboard.tsx` -- Connect to Supabase, use auth user name
- `src/components/settings/ProfileSettings.tsx` -- Connect to Supabase profiles
- `src/components/signDocument/DocumentHeader.tsx` -- Fix replaceAll
- `src/pages/AuthenticatedIndex.tsx` -- Fix document data flow between views
- `supabase/functions/send-document-email/index.ts` -- Dynamic app URL

### New Files
- `src/lib/statusUtils.ts` -- Status mapping utility
