import { proposeDriveSearch, type ProposedDriveSearchOperation } from "./drive-search-authority";

const NATURAL_DRIVE_SEARCH_FORMS = Object.freeze([
  /^search my drive for (\S(?:[^\r\n]*?\S)?)[.?!]?$/i,
  /^search drive for (\S(?:[^\r\n]*?\S)?)[.?!]?$/i,
  /^find (\S(?:[^\r\n]*?\S)?) in my drive[.?!]?$/i,
  /^look in my drive for (\S(?:[^\r\n]*?\S)?)[.?!]?$/i,
]);
const ANAPHORIC_QUERY = /^(?:it|this|that|these|those|them|one|ones|the (?:file|document|folder|sheet|slide))$/i;

/**
 * Maps one deliberately narrow natural-language form to the existing
 * metadata-only operation. This proposes an operation; it grants no authority.
 */
export function proposeNaturalLanguageDriveSearch(currentUserUtterance: string): ProposedDriveSearchOperation | null {
  const match = NATURAL_DRIVE_SEARCH_FORMS.map(form => currentUserUtterance.match(form)).find(Boolean);
  return match && !ANAPHORIC_QUERY.test(match[1]) ? proposeDriveSearch(match[1]) : null;
}
