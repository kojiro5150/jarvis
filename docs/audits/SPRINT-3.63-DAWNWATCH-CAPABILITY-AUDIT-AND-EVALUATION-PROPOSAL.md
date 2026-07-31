\# Sprint 3.63 — DAWNWATCH Capability Audit and Evaluation Proposal Completion

\#\# Executive Summary

This audit inspected the executable DAWNWATCH opening-brief path, its tests, the legacy and  
canonical state models, projection/assembly evidence, and every governing artefact in Sprint  
3.63's Architectural Context. The specification exists in this repository and was read in full.  
The named Sprint 3.55 and Sprint 3.60.1 evidence is present only through later governing sprint  
records and executable evidence: no standalone \`SPRINT-3.55\` or \`SPRINT-3.60.1\` document exists in  
this snapshot. The repository nevertheless directly demonstrates the former  
\`PARTIALLY\_IMPLEMENTED\` finding and the latter runtime-comparison correction.

\`dawnwatchBrief\` is operationally present but architecturally partial. It combines legacy  
\`OperationalState\` facts, presentation fields, consumer heuristics, deterministic formatting, and  
DAWNWATCH voice. This completion supplies evidence and a \*\*proposed, non-authoritative\*\* contract;  
it does not implement, promote, or authorise that contract. No runtime, type, schema, canonical  
publication, responsibility statement, ADR, selector, route, environment variable, fixture, or  
comparison harness was changed or added.

\#\# Repository State

| Record | Evidence |  
| \--- | \--- |  
| Repository | \`/workspace/jarvis\` |  
| Branch | \`work\` |  
| Sprint specification | \`docs/SPRINT-3.63-DAWNWATCH-CAPABILITY-AUDIT-AND-EVALUATION-PROPOSAL.md\` exists in the checked-out snapshot |  
| Baseline commit | \`53fed4048eb7f086f380b200f8c066bd5cd2691e\`; the final Sprint commit is the commit containing this document |  
| Authorised change | This documentation/evidence artefact only |  
| Working tree | Clean after the Sprint commit |  
| Remote | No Git remote is configured; pushing to or opening a GitHub-hosted PR is therefore an environment limitation, not missing-repository evidence |

Relevant files inspected include the complete Sprint specification; \`docs/ENGINEERING\_CONSTITUTION.md\`;  
\`docs/architecture/NORTH\_STAR.md\`; \`docs/CONSTITUTIONAL-PUBLICATION-PRINCIPLES.md\`; every accepted  
\`docs/architecture/ADR-\*.md\`; \`docs/architecture/OPERATIONAL-COMMUNICATION-RESPONSIBILITY.md\`;  
Sprints 3.57, 3.58 (proposal and governed contract), 3.58.1, 3.60, 3.61, and 3.62; the Sprint 3.43  
communication audit; \`lib/briefing.ts\`; \`lib/operational-state.ts\`; \`lib/useOperationalState.ts\`;  
connector normalisers/types; memory schema and seed; \`ConversationDock\` and \`DashboardShell\`;  
operational-state and chat routes; canonical situational-awareness model, projection, assembly,  
and tests; Dashboard presentation and runtime comparator; and all tests identified under  
Validation Results.

\#\# Current Call Path

1\. \`app/page.tsx\` server-renders \`DashboardShell\`; the opening brief itself is a client-side  
   composition, not a server-rendered string.  
2\. \`DashboardShell\` calls \`useOperationalState()\`. Its initial value is normalized local seed data.  
   On mount it fetches \`/api/operational-state\`, retains last-good state on fetch failure, and passes  
   that one client state object to \`ConversationDock\`.  
3\. \`GET /api/operational-state\` invokes \`buildOperationalState()\`. The builder concurrently reads  
   memory and calls the selected Calendar, Gmail, and Drive connectors. Connector failure is  
   represented by status but populated local fallback data is still returned. Arrays are bounded  
   by connector calls (\`listUpcoming(5)\`, \`listRecent(5)\`), not by a declared query window.  
4\. \`ConversationDock\` executes \`getOpeningBrief(agent.id, operationalState)\` during every render.  
   \`agent.id \=== "dawnwatch"\` reaches the \`case "dawnwatch"\` switch branch and calls the private  
   \`dawnwatchBrief(state)\`.  
5\. The returned string is immediately rendered as the first \`AgentDocument\` by the client. It is  
   recomputed rather than persisted. No model or network call occurs inside the formatter and no  
   model alters this opening string.  
6\. Conversational messages do \*\*not\*\* receive the same object instance. \`/api/chat\` independently  
   calls \`buildOperationalState()\` and converts that fresh state through \`buildContextBlock\` before  
   model invocation. Thus the same shape and acquisition policy are used, but observations and  
   \`updatedAt\` can differ from the already-rendered client brief.  
7\. DAWNWATCH itself reads no clock, timezone, or locale. Hidden temporal/locale work already occurred  
   in connector normalization (\`Date\`, process-local timezone, hard-coded \`en-US\`). State acquisition  
   reads the current clock for \`updatedAt\` and missing Google temporal fields. Connector array order  
   is accepted unchanged by \`nextEvent\`.

\#\# Current Capability Inventory

Legend: \*\*provider\*\* \= provider-observed; \*\*human/local\*\* \= locally asserted memory/seed;  
\*\*derived\*\* \= downstream calculation; \*\*presentation\*\* \= prose/formatting. \`OC-RS\` means the governing  
OperationalCommunication Responsibility Statement.

| Item | Current output example | Current source field/helper | Producer | Current semantics / source type | Consumer / responsibility | Hidden inputs | Failure or ambiguity | Proposed outcome | Proposed class | Evidence |  
| \--- | \--- | \--- | \--- | \--- | \--- | \--- | \--- | \--- | \--- | \--- |  
| Priority urgent membership | item included | \`urgentPriorities\`; \`p.urgent\` truthiness | memory \`Priority\`; human/local | optional legacy Boolean | DAWNWATCH; no canonical owner found | missing means false | assertion origin/version absent | Deferred | None authorised | memory schema; canonical priority has \`level\` and \`source\`, not \`urgent\` |  
| Urgent count | \`2\` | filtered-array length | \`dawnwatchBrief\`; derived | count of legacy truthy flags | DAWNWATCH | authorised evidence prerequisite | deterministic only if membership is authorised | Deferred | None authorised | \`lib/briefing.ts\` |  
| Urgency positive grammar | \`1 urgent.\` / \`2 urgent.\` | count and fixed template | DAWNWATCH; presentation | count plus voice (noun omitted) | DAWNWATCH voice | English grammar | “urgent” asserts deferred semantics | Modified | DAWNWATCH-Specific Voice State | \`lib/briefing.ts\` |  
| Urgency empty wording | \`Nothing urgent.\` | zero filtered items | DAWNWATCH; presentation | negative operational claim | DAWNWATCH voice | assumes evidence complete | missing evidence becomes evidence of absence | Modified | DAWNWATCH-Specific Voice State | \`lib/briefing.ts\` |  
| Priority sequence | all items in current array order | \`state.priorities.map\` | memory/store preserves array | legacy asserted/accidental order | DAWNWATCH | array ordering | no canonical ordering contract | Deferred | None authorised | memory schema; canonical priority model |  
| Printed rank | \`1.\` | \`priority.rank\` | memory; human/local | legacy numeric label | DAWNWATCH | rank uniqueness/meaning | identity and ranking conflated; no canonical equivalent | Deferred | None authorised | memory schema |  
| Priority title | \`Ship evidence\` | \`priority.title\` | memory; human/local | supplied title | DAWNWATCH; canonical priority owns id/title/source | none within brief | legacy item has no stable canonical id/provenance | Modified | Canonical Operational State | canonical situational-awareness model |  
| Due wording | \`(Today)\` | \`priority.due\` | memory; human/local | free-text presentation | DAWNWATCH | hidden reference date/timezone/locale | not replayable; no canonical priority due field | Deferred | None authorised | memory and canonical schemas |  
| Rank punctuation | \`1. \` | interpolation | DAWNWATCH; presentation | compact-list styling | DAWNWATCH | none | depends on deferred rank | Modified | DAWNWATCH-Specific Voice State | \`lib/briefing.ts\` |  
| Due parentheses | \`(Today)\` | interpolation | DAWNWATCH; presentation | compact-list styling | DAWNWATCH | none | depends on deferred due | Modified | DAWNWATCH-Specific Voice State | \`lib/briefing.ts\` |  
| Priority separator | \` · \` | \`.join(" · ")\` | DAWNWATCH; presentation | list rendering | DAWNWATCH | array order | empty list produces empty segment | Accepted | DAWNWATCH-Specific Voice State | \`lib/briefing.ts\` |  
| Empty priority segment | two adjacent spaces between sentences | empty \`.map().join()\` then outer join | DAWNWATCH; presentation | blank paragraph component | DAWNWATCH | none | no explicit empty-priority semantic state | Modified | DAWNWATCH-Specific Voice State | executable branch behavior |  
| Next selection | first array element | \`nextEvent\` → \`state.calendar\[0\]\` | connector order; derived | first returned legacy item | DAWNWATCH | connector order, limit 5 | not chronological/eligible/complete authority | Rejected | None authorised | \`lib/briefing.ts\`; connector acquisition |  
| Commitment existence branch | first item truthy | \`next ? ... : ...\` | DAWNWATCH; derived | presence of index zero | DAWNWATCH | fallback arrays and source status ignored | cannot mean free or available | Rejected | None authorised | \`lib/briefing.ts\`; \`lib/operational-state.ts\` |  
| Commitment identity | not rendered | \`CalendarEvent.id\` available | provider/local connector | stable within connector shape | canonical commitment owns id | source qualification differs | legacy id need not be canonical identity | Modified | Canonical Operational State | canonical model and projection |  
| Commitment title | \`Strategy review\` | \`next.title\` via \`describeCommitment\` | provider/local connector | observed/local title | canonical commitment owns title | fallback \`(No title)\` | fallback may conceal missing evidence | Modified | Canonical Operational State | connector normalizer; canonical model |  
| Google label eligibility | label only when \`source \=== "google" && calendarName\` | \`describeCommitment\` | DAWNWATCH; derived | connector-specific display policy | DAWNWATCH | connector source naming | provider display identity is not canonical source identity | Rejected | None authorised | \`lib/briefing.ts\`; ADR-0007 |  
| Calendar display name | \`Governance Engineering calendar\` | \`calendarName\` | connector metadata; provider/local | provider/container display label | DAWNWATCH | calendar-list access/current label | canonical commitment/source does not publish it | Deferred | None authorised | CalendarEvent vs canonical model |  
| Calendar suffix/punctuation | \`, … calendar, \` | template | DAWNWATCH; presentation | attribution prose | DAWNWATCH | depends on deferred label | must not imply canonical provenance | Modified | DAWNWATCH-Specific Voice State | \`describeCommitment\` |  
| Day | \`MON\` | legacy \`day\` | connector normalizer; derived/presentation | preformatted weekday | DAWNWATCH | host timezone; hard-coded \`en-US\` | non-replayable across viewers | Rejected | None authorised | calendar normalizer |  
| Time | \`09:00\` / \`All day\` | legacy \`time\` | connector normalizer; derived/presentation | preformatted time | DAWNWATCH | host timezone; \`en-US\`; all-day parser | loses explicit derivation context | Rejected | None authorised | calendar normalizer |  
| Commitment phrase | \`First on the calendar: ….\` | fixed template | DAWNWATCH; presentation | narrative lead-in | DAWNWATCH | suggests ordering authority | false authority under index zero | Modified | DAWNWATCH-Specific Voice State | \`lib/briefing.ts\` |  
| No-event phrase | \`No scheduled commitment currently in view.\` | fixed fallback | DAWNWATCH; presentation | bounded negative claim | DAWNWATCH | source status/window omitted | fallback data can exist while source unavailable; “view” undefined | Modified | DAWNWATCH-Specific Voice State | briefing and acquisition code |  
| Communication selection—unread | item selected if \`m.unread\` | \`urgentCommunications\` | provider/local email normalizer | mutable read state | DAWNWATCH and context/specialist badge; OC-RS excludes read state | snapshot timing | already excluded, not unresolved | Rejected | None authorised | OC-RS explicit non-responsibilities |  
| Communication selection—important | item selected if \`m.important\` | \`urgentCommunications\` | provider/local email normalizer | provider importance classification | same; OC-RS excludes priority/urgency/labels | provider classifier | already excluded significance/salience proxy | Rejected | None authorised | OC-RS |  
| Communication selection—source label | exact \`sourceLabel \=== "Governance Engineering"\` | \`urgentCommunications\` | connector/consumer | connector organisation/private policy | same; OC-RS excludes labels/categories/connector organisation | spelling/display label | brittle label becomes attention claim | Rejected | None authorised | OC-RS; \`lib/briefing.ts\` |  
| Boolean OR heuristic | unread OR important OR label | \`urgentCommunications\` | consumer; derived heuristic | legacy selection, despite helper name | DAWNWATCH/context/badge | unavailable inputs treated false | neither urgency nor attention is governed | Rejected | None authorised | OC-RS; executable helper |  
| Communication count | filtered-array length | \`urgentComms.length\` | DAWNWATCH; derived | count of rejected heuristic | DAWNWATCH | source availability ignored | deterministic but unauthorised basis | Rejected | None authorised | \`lib/briefing.ts\` |  
| Communication singular/plural | \`communication(s) need(s)\` | count branches | DAWNWATCH; presentation | English agreement | DAWNWATCH | English locale | embeds rejected selection | Modified | DAWNWATCH-Specific Voice State | \`lib/briefing.ts\` |  
| Attention wording | \`need(s) attention.\` | fixed template | DAWNWATCH; presentation/judgment | attention recommendation | DAWNWATCH; OC-RS excludes required action | none | heuristic described as intrinsic need | Rejected | None authorised | OC-RS |  
| Clear wording | \`Communications clear.\` | zero selected items | DAWNWATCH; presentation | broad negative claim | DAWNWATCH | source availability/coverage ignored | zero selected ≠ clear; excluded inputs may be absent | Modified | DAWNWATCH-Specific Voice State | briefing/acquisition code |  
| Sentence order | urgency → priorities → calendar → communications | array literal | DAWNWATCH; presentation | narrative order | DAWNWATCH | implies emphasis | order can imply salience but is consumer voice only | Accepted | DAWNWATCH-Specific Voice State | \`lib/briefing.ts\` |  
| Final format | one space-joined paragraph | outer \`.join(" ")\` | DAWNWATCH; presentation | compact prose | DAWNWATCH | whitespace from empty ranked segment | semantics cannot be independently compared | Modified | DAWNWATCH-Specific Voice State | \`lib/briefing.ts\` |

The call does \*\*not\*\* consume calendar start/end/status/id, calendar source availability,  
communication source availability, \`updatedAt\`, connector status, observation time, canonical  
provenance, or observation-window evidence even though some legacy/canonical shapes contain a  
subset of those facts.

\#\# Existing Responsibility Evidence

The Engineering Constitution, North Star, Publication Principles, accepted ADRs (especially  
ADR-0006, ADR-0007, ADR-0009, ADR-0023, and ADR-0024), governed Dashboard contract, and canonical  
model establish projection-before-interpretation, descriptive canonical state, explicit context,  
stable identity/provenance, and consumer-owned presentation.

The governing OC-RS already owns only source-qualified identity, sender, recipients, sent/received  
timestamps, optional subject, and protocol reply references. It explicitly excludes priority,  
urgency, labels, categories, required action, read state, connector organisation, grouping,  
intent, and interpretation. Accordingly unread, importance, automated significance/salience,  
attention/reply need, and source-label policy are \*\*already excluded\*\*, not newly unresolved.  
There is no new evidence here to reopen that boundary. Canonical source availability is separately  
governed by \`OperationalSourceState\`; it does not authorise excluded communication properties.

Genuinely unresolved matters are a DAWNWATCH input adapter boundary; priority ordering and absolute  
due semantics; any independently justified priority-urgency responsibility; bounded calendar  
observation completeness; end-bound semantics (canonical commitment currently has \`startsAt\` and  
\`dueAt\`, not an explicit generic \`endsAt\`); all-day and zero-duration eligibility; “afternoon”;  
timezone/locale policy; calendar container display authority; and consumer attention policy over  
otherwise authorised metadata. None is authorised by this audit.

\#\# Canonical Coverage Matrix

| Current item | Coverage finding | Governing/prior status | Provenance / identity / observed time / source availability / window | Safe derivation | Governance required |  
| \--- | \--- | \--- | \--- | \--- | \--- |  
| Priority title | Equivalent fact exists, but legacy lacks canonical id/source mapping | canonical accepted | canonical yes/yes/snapshot observedAt/possible source/no window | render title after adapter validation | adapter and ordering |  
| \`urgent\` and urgent count | canonical \`level\` is semantically different; no Boolean equivalent | not accepted; urgency inference prohibited | legacy no/no/only state build time/no/no | no | independent responsibility evidence |  
| rank and array order | legacy-only | ungoverned | no stable id/provenance/order observation | no | ordering ownership/tie-break |  
| free-text due | legacy-only; canonical project target and commitment due are different responsibilities | ungoverned | no/no/no/no/no | no | absolute target owner first |  
| commitment id/title/status/start | canonical equivalents exist | accepted canonical facts | yes/yes/snapshot observedAt/source state exists/window absent | bounded filtering after explicit policy | mapping and eligibility |  
| commitment end | \`dueAt\` exists but may be semantically different from interval end | unresolved semantic gap | canonical provenance/identity/time/source; no window | not until meaning governed | end-bound contract |  
| calendar index zero | no canonical equivalent | rejected authority | connector order only | no | none; replace only after governance |  
| calendar name/source display label | legacy-only; canonical source id/kind is different | deferred/rejected for Dashboard | connector evidence partial; no publication authority | no | separate source-container responsibility |  
| preformatted day/time | canonical bounds allow a future new derivation, not field copying | legacy presentation rejected | derivation context missing | yes with explicit bounds/timezone/locale | temporal rendering policy |  
| no-event/clear claims | source state partly exists; observation window does not | semantically incomplete | source availability yes; coverage no | no honest negative without both | coverage publication/adapter |  
| communication identity/sender/recipients/timestamps/subject/references | canonical equivalents exist | OC-RS accepted | canonical yes/yes/snapshot observedAt/source state/no communication window | neutral rendering/counting within governed scope | narrow adapter/privacy |  
| unread/important/label/attention | canonical equivalent intentionally absent | OC-RS excluded | deliberately unavailable | no reconstruction permitted | only explicit constitutional reopening with new evidence |  
| grammar/order/separators/paragraph | presentation-only | consumer-owned | not applicable | yes over authorised semantic state | DAWNWATCH contract review |

Canonical state contains enough start-like evidence for some bounded commitment questions, but not  
enough to answer arbitrary windows safely: generic interval end semantics, coverage, all-day and  
zero-duration policy remain absent. \`OperationalSourceState.observedAt\` is not observation-window  
completeness.

\#\# Classification Matrix

| Current composition | Proposed outcome | Proposed class | Reasoning | Consequence of omission | Existing evidence | Evidence required for governance | Future constraint |  
| \--- | \--- | \--- | \--- | \--- | \--- | \--- | \--- |  
| priority canonical id/title consumption | Modified | Canonical Operational State | title is governed only with canonical identity/source | loses legacy unmapped items | canonical priority model | adapter mapping evidence | never synthesize ids |  
| urgent evidence/count | Deferred | None authorised | legacy Boolean has no governed responsibility | loses urgency headline | Publication Principles | independent multi-consumer owner/provenance | no fallback to \`level\` without decision |  
| urgency wording | Modified | DAWNWATCH-Specific Voice State | voice may render but not create urgency | wording changes or becomes unavailable-state text | consumer presentation boundary | approved semantic inputs | uncertainty must remain visible |  
| priority rank/order | Deferred | None authorised | rank and array order lack authority | compact ranking is lost | governed Dashboard omitted rank | asserted order owner/ties/version | stable explicit ordering only |  
| due text | Deferred | None authorised | relative free text is not replayable | due parenthetical lost | canonical model mismatch | absolute governed target | explicit clock/timezone/locale |  
| list punctuation/separator | Accepted | DAWNWATCH-Specific Voice State | pure style conditional on authorised fields | different prose only | existing deterministic formatter | voice review | compare prose separately |  
| empty priority handling | Modified | DAWNWATCH-Specific Voice State | blank segment is not semantic output | current double space lost | current branch | approved empty/unavailable vocabulary | structured state first |  
| canonical commitment facts | Modified | Canonical Operational State | id/title/bounds/status already canonical where semantically mapped | fewer legacy display fields | canonical model/ADR-0007 | end-bound mapping | preserve provenance/status |  
| index-zero selection | Rejected | None authorised | connector position has no operational authority | coincidence-based “first” lost | audit/code | none | deterministic eligible set/order |  
| temporal-window filtering/ordering | Modified | Deterministically Derived Briefing Presentation | legitimate only over complete governed inputs | no bounded answers until available | Dashboard contract method | approved window/eligibility/order rules | explicit versioned inputs |  
| calendar name and Google-only label rule | Deferred / Rejected respectively | None authorised | name ownership unresolved; source-string rule is connector policy | attribution omitted | canonical source boundary | independent container identity case | never infer provenance from label |  
| day/time fields | Rejected | None authorised | copy would preserve hidden host context | legacy exact wording lost | normalizer evidence | approved derivation policy | derive anew, never consume legacy strings |  
| calendar/no-event sentences | Modified | DAWNWATCH-Specific Voice State | voice must distinguish no match from insufficient evidence | prose differs | source state and missing coverage | approved semantic outcomes | no absence claim without coverage |  
| canonical communication metadata | Modified | Canonical Operational State | OC-RS permits bounded intrinsic facts | less rich legacy listing | OC-RS | adapter/privacy/source scope | no content beyond accepted metadata |  
| unread/important/source-label OR and count | Rejected | None authorised | inputs/responsibility excluded; count inherits invalidity | legacy attention count intentionally lost | OC-RS | explicit constitutional reopening only | never reconstruct from legacy |  
| attention statement | Rejected | None authorised | claims required action/attention | attention prose lost | OC-RS | separately governed consumer policy | must not masquerade as canonical state |  
| communications-clear sentence | Modified | DAWNWATCH-Specific Voice State | zero heuristic matches overclaims | exact fallback changes | availability evidence | approved “none observed” semantics | distinguish empty/unavailable |  
| sentence order/one-paragraph voice | Accepted / Modified | DAWNWATCH-Specific Voice State | order is valid voice; structured semantics must precede prose | compact style can remain after review | current consumer boundary | usability/governance review | semantic-before-prose evaluation |

Outcome and class are independent proposal axes. In particular, \`Deferred \+ None authorised\` means  
no implementation permission; governance review must decide whether an authoritative contract  
retains or omits a class value for deferred entries.

\#\# Acceptance Scenario — “do I have anything tomorrow afternoon”

The legacy opening brief cannot answer \*\*do I have anything tomorrow afternoon\*\*. It reads only  
\`calendar\[0\]\`, does not interpret the question, and can mention the right event only by coincidence.  
It may select a cancelled, morning, later, or fallback event; it cannot distinguish a clear window  
from an unavailable source or insufficient acquisition horizon.

A future governed evaluation requires the same explicit reference instant, viewer timezone,  
locale, governed tomorrow date, governed afternoon start/end, complete canonical commitment set,  
start and end bounds, cancellation and all-day eligibility, zero-duration policy, deterministic  
ordering/ties, source scope/availability, and observation-window coverage. It must produce one of:

\* \`Commitment present\`;  
\* \`No eligible commitment in the covered window\`;  
\* \`Insufficient or unavailable evidence\`; or  
\* \`Unsupported temporal request\`.

The candidate half-open interval rule to analyse is:

\`\`\`text  
commitmentStart \< afternoonEnd AND commitmentEnd \> afternoonStart  
\`\`\`

It would include any positive-duration commitment crossing either interior boundary and exclude a  
commitment ending exactly at afternoon start or starting exactly at afternoon end. It does not by  
itself resolve missing/malformed ends, all-day events, zero-duration commitments, cancelled status,  
timezone conversion, daylight-saving transitions, or coverage. This audit neither implements nor  
authorises the rule.

\#\# Proposed Briefing Contract

\*\*Status: Proposed — non-authoritative.\*\*

This proposal records evidence and recommendations. It does not approve implementation, expand a  
canonical publication, amend a responsibility statement, or supersede governed artefacts. A  
separate governance-review sprint is mandatory; future engineering must not implement this text as  
though approved.

\#\#\# Governing rules

1\. Canonical facts must already have accepted ownership.  
2\. DAWNWATCH need does not establish canonical publication authority.  
3\. Existing responsibility exclusions remain authoritative unless separately reopened.  
4\. Derivations declare reference time, timezone, locale, window, boundaries, eligibility, order,  
   ties, source scope/availability, coverage, rule id/version, and unavailable-input behaviour.  
5\. Voice may frame evidence but may not create facts or conceal uncertainty.  
6\. Missing canonical input must not be reconstructed from legacy state.  
7\. Deferred means not authorised.  
8\. Empty data and unavailable evidence remain distinct.  
9\. Temporal answers require sufficient observation-window evidence.  
10\. Legacy output may be intentionally lost to preserve governance.

\#\#\# Proposed smallest input boundary

Prefer a narrower, separately governed application adapter over direct unrestricted snapshot  
consumption. It would select only already-authorised canonical priority id/title/source;  
commitment id/title/start/end-equivalent/status; bounded communication metadata allowed by OC-RS;  
canonical source id/kind/status/observedAt; snapshot identity/provenance; and explicit presentation  
context (reference instant, viewer timezone, locale, requested window, rule versions). It must carry  
coverage evidence if and only if a canonical owner is later authorised. It must not expose legacy  
rank, due text, \`urgent\`, preformatted day/time, calendar/source labels, unread, important,  
\`needsReply\`, snippets, or attention state.

\#\#\# Proposed semantic output

Before prose, produce structured sections with evidence status (\`available\`, \`unavailable\`,  
\`insufficient\_coverage\`, \`unsupported\`), source/snapshot references, and only authorised content:  
priority items; eligible commitment matches plus the covered interval; bounded communication  
observations without importance/attention assertions; and explicit omissions/deferred inputs.  
Temporal states use the four outcomes above. Empty collections never alone imply evidence of  
absence.

\#\#\# Proposed derivations and voice

Potential derivations, subject to governance, are stable selection/order over canonical ids,  
counts over authorised predicates, interval overlap, and localized day/time from canonical bounds  
and explicit context. DAWNWATCH owns singular/plural grammar, compression, separators, sentence  
order, paragraph layout, and honest vocabulary for unavailable/unsupported evidence. It may retain a  
compact paragraph only as a rendering of the structured semantics. “Nothing urgent,” “first,”  
“needs attention,” and “clear” may not survive unless their semantic predicates become authorised  
and sufficiently evidenced.

\#\#\# Tomorrow-afternoon clause

The contract's principal case is \*\*do I have anything tomorrow afternoon\*\* and must follow the  
evidence requirements and four outcomes in the Acceptance Scenario. The candidate overlap rule is  
review material only.

\#\#\# Authority and next activity

Sprint 3.64 may review each pairing, settle adapter/temporal/coverage/voice questions, and publish an  
authoritative contract without implementing it. No engineering implementation follows from this  
proposal.

\#\# Deferred and Rejected Registers

\#\#\# Deferred (not authorised)

\* Priority urgency ownership and any count over it; rank, canonical ordering, and tie-breaks;  
  absolute due ownership and relative due wording.  
\* Calendar container/display-name ownership; commitment end semantics; complete bounded coverage;  
  afternoon boundaries; all-day and zero-duration policy; timezone/locale policy; malformed-input  
  behavior; privacy-safe temporal/source scope.  
\* A distinct DAWNWATCH adapter and semantic vocabulary; whether communication observations may be  
  selected by a separately governed consumer policy without asserting attention.

\#\#\# Rejected legacy carry-over

\* \`calendar\[0\]\` authority and connector-array ordering; legacy preformatted \`day\` and \`time\`;  
  Google string checks as provenance; copying free-text priority due or numeric rank into canonical  
  state.  
\* Unread, important, source-label, significance, salience, reply-need, or attention state as  
  canonical communication facts; the current OR heuristic and its count; reconstructing excluded  
  properties merely to preserve prose.  
\* Treating an empty array, fallback array, or zero heuristic matches as “free,” “nothing urgent,” or  
  “communications clear” without qualified evidence.

\#\# Gap and Boundary Register

| Boundary | Finding |  
| \--- | \--- |  
| urgency / rank / due / array order | not canonically owned; \`level\` and target dates are not automatic semantic substitutes |  
| display names and preformatted time | legacy presentation; canonical source identity/bounds differ |  
| cancellation / all-day / zero duration / overlap | status partly exists; eligibility and interval semantics require governance |  
| complete window / source availability | source status exists; bounded observation completeness does not |  
| unread / important / significance / salience / attention | already excluded by OC-RS, not newly unresolved |  
| Governance Engineering label | private brittle consumer policy, not source identity or urgency |  
| \`clear\` and absence | absence of selected evidence is not evidence of absence |  
| current time / timezone / locale | normalizers/builders hide host clock and locale; future derivation must make them explicit |  
| deterministic replay | current string is pure for a supplied legacy object, but acquisition/formatting context is not fully replayable |  
| provenance / identity | canonical snapshot supports both; legacy priority and labels do not preserve equivalent authority |  
| privacy/content | future adapter must stay within OC-RS bounded metadata and must not expose snippet/body/evidence storage |

\#\# Future Evaluation Constraints

No evaluator is implemented here. A future harness must compare (1) structured semantic briefing  
content and evidence sufficiency, then (2) rendered DAWNWATCH prose. Both paths must receive recorded  
identical acquired observations, reference instant, timezone, locale, source state, temporal window,  
coverage, and configuration. Fixtures must say they are synthetic and not authenticated operator or  
production evidence.

Following Sprint 3.60.1, behavioural classifications must be computed from \*\*actual runtime  
comparison\*\*, never scenario-supplied or hardcoded expected labels. Runtime equality/governed  
predicates yield \`Equivalent\`; observed mismatch yields \`Defect\`; \`Intentional Improvement\` is  
allowed only when tied to a separate authoritative governance artefact; explicit supported failures  
yield \`Unsupported Boundary\`; unmatched failures yield \`Undocumented Failure Mode\`. The resulting  
rows, not fixture names, derive the recommendation.

Mutation tests must prove that changing either semantic output or legacy output is detected; a row  
cannot become \`Equivalent\` from a passed label; governance-derived improvements retain authoritative  
citations; interval-boundary mutation, omitted matching commitment, and false “no commitments” under  
unavailable evidence are detected. Scenarios must cover empty state, urgency variants, multiple and  
unranked priorities, absent due semantics, eligible/multiple/cancelled/non-first/overlapping/exact-  
boundary/all-day/zero-duration commitments, morning-only and afternoon-none, unavailable source,  
insufficient window, communication heuristic variants and excluded inputs, mixed availability,  
malformed time, and deterministic replay.

Promotion is blocked by any Defect, Unsupported Boundary, or Undocumented Failure Mode. Evaluation  
cannot authorise a deferred input or convert a proposal into governance.

\#\# Evidence Boundary

This sprint provides repository evidence and a governance proposal only. It does not verify or alter the operator’s actual JARVIS runtime.

Repository tests and isolated runtime comparisons can be verified here. The operator's real  
\`.env.local\`, restarted local process, and visual/experiential behavior cannot. Any future sequence  
must separately pass repository readiness, operator configuration, actual restart, real DAWNWATCH  
verification, and an operator promotion record. This Sprint adds none of that machinery.

\#\# Validation Results

The final committed validation record is completed after authoring this document:

\* \`npm test\` — complete suite; \*\*110 test files passed, 533 tests passed, 1 test skipped\*\*.
\* Targeted DAWNWATCH and governing-boundary tests — \*\*7 test files, 44 passed, 0 skipped\*\* across the commands/files below:
  \* \`lib/connectors/\_\_tests\_\_/calendar-event.test.ts\`: \`getOpeningBrief\`, DAWNWATCH branch,  
    \`describeCommitment\`, empty calendar, populated calendar.  
  \* \`lib/connectors/\_\_tests\_\_/email-message.test.ts\`: \`urgentCommunications\`, empty and populated  
    communication briefing.  
  \* \`lib/operational-state.test.ts\`: legacy operational-state construction and availability.  
  \* \`lib/executive-operating-system/situational-awareness/assembly/assembly.test.ts\` and
    \`eos-integration.test.ts\`: canonical snapshot construction.  
  \* \`lib/executive-operating-system/situational-awareness/projection/adapters/operational-communication/operational-communication-adapter.test.ts\`:  
    communication publication invariants.  
  \* \`lib/dashboard-parallel-evaluation.test.ts\`: Sprint 3.60.1 runtime comparator and mutation  
    detection discipline.  
\* \`npm run lint\` — passed with no warnings.  
\* \`npm run typecheck\` — passed.  
\* \`git diff \--check\` — passed.  
\* Warning: npm printed its environment warning that the \`http-proxy\` config is unknown and will no  
  longer be supported in the next major npm version; it did not affect any validation result.  
\* Path/status inspection confirms this audit document is the only Sprint change: no runtime/type/  
  schema/publication/responsibility/selector/route/environment/comparator file changed or was added,  
  and current DAWNWATCH behavior is unchanged.

\#\# Outstanding Questions

1\. Govern a distinct DAWNWATCH presentation contract rather than reusing the Dashboard contract;  
   determine whether its implementation consumes a narrow adapter (recommended) or snapshot.  
2\. Decide whether urgency has independent canonical ownership, whether ordering is asserted or  
   consumer-specific, and whether an absolute priority target exists.  
3\. Decide commitment end meaning, observation-window representation, afternoon bounds, all-day and  
   zero-duration eligibility, cancellation policy, timezone/locale, and the candidate overlap rule.  
4\. Decide whether source unavailability must always be voiced and whether structured semantic  
   sections precede an optional compact paragraph.  
5\. Confirm OC-RS exclusions remain binding and whether any consumer-only selection over permitted  
   metadata is useful without becoming a significance/attention claim.  
6\. Decide which exact legacy outputs are intentionally lost, and approve the future evaluation  
   scenario/configuration and evidence gate before any implementation.

\#\# Recommendation

Audit Complete — Governance Review Required
