/**
 * @deprecated Renamed to lib/operational-state.ts (Sprint 2.4). Nothing
 * in this app imports from this file anymore — kept only so an old
 * import doesn't hard-fail. `OperationalPicture` and `OperationalState`
 * were the same concept under two names, which is exactly the kind of
 * duplicate state this refactor eliminated; use OperationalState.
 */
export type { OperationalState as OperationalPicture } from "./operational-state";
