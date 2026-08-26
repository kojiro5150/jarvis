import { proposeDriveSearch, type ProposedDriveSearchOperation } from "./drive-search-authority";

const NATURAL_DRIVE_SEARCH_FORMS = Object.freeze([
  /^Search my Drive for (\S(?:[^\r\n]*\S)?)$/,
  /^Find (\S(?:[^\r\n]*\S)?) in my Drive$/,
  /^Look in my Drive for (\S(?:[^\r\n]*\S)?)$/,
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
