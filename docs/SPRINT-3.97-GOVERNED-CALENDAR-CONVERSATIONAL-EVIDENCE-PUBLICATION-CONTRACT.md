# **Sprint 3.97 — Governed Calendar Conversational Evidence Publication Contract**

**Status:** Specification

**Sprint Type:** Governance Decision / Publication Contract

**Implementation Authority:** None

**Production Integration:** Prohibited

**Governing Trigger:** Sprint 3.88 — Governed Conversational Production Evidence Audit

**Direct Structural Precedent:** Sprint 3.96 — Governed Gmail Conversational Evidence Publication Contract

**Output Path:** `docs/SPRINT-3.97-GOVERNED-CALENDAR-CONVERSATIONAL-EVIDENCE-PUBLICATION-CONTRACT.md`

## **1\. Recommendation**

**Decision:** Approve this governed Calendar conversational evidence publication contract.

This contract resolves the bounded publication contract required to transform real production Google Calendar acquisition into `GovernedCalendarEvidenceInput`.

The repository is less mature for Calendar than for Gmail at Sprint 3.96:

Gmail at Sprint 3.96  
real acquisition  
    ↓  
canonical production normalizer  
    ↓  
ProductionGmailRecipientEvidence  
    ↓  
missing conversational publisher

Calendar at Sprint 3.97  
real acquisition  
    ↓  
CalendarEvent\[\]  
    ↓  
legacy OperationalState only  
    ↓  
no governed production evidence normalizer  
    ↓  
no conversational publisher

Calendar therefore has a genuine production publication/wiring gap, but the missing boundary begins one stage earlier than Gmail.

Real Google Calendar acquisition exists. `CalendarEvent` is the connector-normalized application shape used by the legacy production path. No production code currently publishes Calendar evidence in a governed shape.

This contract governs the minimum source semantics required for a future Calendar evidence normalizer and the exact downstream mapping into `GovernedCalendarEvidenceInput`.

It does not implement either.

It does not redesign Calendar acquisition.

It does not modify production.

It does not authorize implementation.

---

## **2\. Repository Precondition**

Before completing this governance sprint:

| Record | Required result |
| ----- | ----- |
| Repository | Intended JARVIS repository confirmed |
| Branch | Recorded |
| Starting commit | Recorded |
| Starting working tree | Clean |
| Sprint 3.96 | Present and merged |
| Required governing artefacts | Present |
| `GovernedCalendarEvidenceInput` | Current nine-field definition confirmed |
| Production Calendar governed evidence producer | None |
| `/api/chat` | Unchanged by this sprint |

Read completely before finalising this contract:

1. `docs/SPRINT-3.96-GOVERNED-GMAIL-CONVERSATIONAL-EVIDENCE-PUBLICATION-CONTRACT.md`;  
2. `docs/audits/SPRINT-3.88-GOVERNED-CONVERSATIONAL-PRODUCTION-EVIDENCE-AUDIT.md`, with specific attention to the Calendar Finding;  
3. `docs/SPRINT-3.69-GOVERNED-GMAIL-RECIPIENT-CONTRACT.md`;  
4. `docs/CONSTITUTIONAL-PUBLICATION-PRINCIPLES.md`;  
5. the constitutional and architectural authorities required by Sprint 3.96;  
6. `lib/governed-conversation/projection-composer.ts`;  
7. `lib/connectors/calendar-event.ts`;  
8. `lib/connectors/google/calendar.ts`;  
9. the Calendar connector-selection path;  
10. `lib/operational-state.ts`; and  
11. current tests and fixtures that construct `GovernedCalendarEvidenceInput`.

Confirm by repository-wide search that:

* no production `calendarEvidence` publisher exists outside governed-conversation fixtures/tests;  
* no production Calendar governed evidence normalizer exists under `lib/executive-context/`;  
* no other production package already owns the nine-field mapping governed here; and  
* fixture values do not constitute production authority.

If repository evidence contradicts these premises, stop.

Return:

> **Governance Review Incomplete**

---

## **3\. Governing Artefacts Reviewed**

The completed sprint record shall list every governing artefact read completely.

At minimum, governing authority shall be applied in this order:

1. Engineering Constitution;  
2. North Star;  
3. JARVIS Engineering Specification Standard;  
4. Constitutional Publication Principles;  
5. Roadmap;  
6. Sprint 3.69 — Governed Gmail Recipient Contract, as an acquisition-adjacent evidence precedent;  
7. Sprint 3.88 — Governed Conversational Production Evidence Audit, as evidence;  
8. Sprint 3.96 — Governed Gmail Conversational Evidence Publication Contract, as the direct structural precedent;  
9. current Calendar connector and normalization source;  
10. current governed-conversation types and composer; and  
11. this contract.

Sprint 3.96 establishes the structural pattern:

inspect real production evidence  
    ↓  
separate mechanical facts from governance decisions  
    ↓  
define exact source references  
    ↓  
define bounded provenance  
    ↓  
define fixed versioned policy  
    ↓  
preserve Identity Integrity  
    ↓  
authorize no implementation

Sprint 3.97 applies that pattern to Calendar without pretending Calendar already has Gmail's production evidence maturity.

---

## **4\. Sprint 3.88 Finding Reconfirmed**

**Confirmed:**

* real Google Calendar acquisition exists;  
* `GoogleCalendarConnector.listUpcoming()` returns normalized `CalendarEvent[]`;  
* those events reach production through `loadCalendar()` and `OperationalState.calendar`;  
* local Calendar records may occupy the same legacy `OperationalState.calendar` slot when Google is unavailable;  
* no governed Calendar production evidence publication exists;  
* no production publisher maps Calendar data into `GovernedCalendarEvidenceInput`; and  
* the legacy application path does not provide sufficient provenance, coverage, timezone, or policy semantics to be copied directly into the governed conversational projection.

The Calendar gap is a genuine production publication/wiring gap.

It is not equivalent to the earlier claims design problem: real source acquisition already exists and much of the target data is mechanically observable.

It is nevertheless **less mature than Gmail at Sprint 3.96** because Gmail already had `projectProductionGmailEvidence` and `ProductionGmailRecipientEvidence`, whereas Calendar currently has no equivalent governed production evidence boundary.

Therefore Sprint 3.97 must govern both:

1. the minimum source facts that a future Calendar production evidence normalizer must preserve; and  
2. the exact mapping from that governed source observation into `GovernedCalendarEvidenceInput`.

It shall not implement either boundary.

---

## **5\. Existing Calendar Acquisition and Normalization Facts**

The current `CalendarEvent` shape contains:

id  
title  
start  
end  
day  
time  
source  
calendarId  
calendarName  
calendarColor?  
status?  
recurringEventId?  
selfAttendeeResponse?

For real Google events:

* `id` normally comes from the Google event identifier;  
* `start` contains the provider `dateTime` or bare `date`;  
* `end` contains the provider `dateTime` or bare `date`;  
* `source` is `google`;  
* `calendarId` identifies the Google Calendar queried;  
* `calendarName` is display metadata;  
* `status` may preserve provider event status;  
* recurrence identity may be preserved;  
* the authenticated user's attendee response may be preserved.

The existing Google acquisition queries every visible, non-hidden, non-deleted calendar, requests events from:

acquisition time  
    →  
acquisition time \+ 7 days

with:

singleEvents \= true  
orderBy \= startTime  
maxResults \= requested limit

for each calendar.

The results are merged, sorted, and then globally sliced to the requested limit.

The production `OperationalState` caller currently invokes:

listUpcoming(5)

Therefore the legacy production request is bounded to:

next 7 days  
\+  
maximum 5 merged returned events

but the current `CalendarEvent[]` output does **not** itself preserve the query's exact observation time, coverage boundary, per-calendar retrieval success, or whether the global five-event cap truncated additional matching events.

That distinction is binding.

---

## **6\. Existing `CalendarEvent` Is Not Yet Governed Calendar Evidence**

`CalendarEvent` is a useful normalized application shape.

It is not, by itself, sufficient `GovernedCalendarEvidenceInput`.

In particular, the current shape does not contain:

retrievedAt / observedAt  
explicit acquisition window  
explicit result-limit provenance  
explicit coverage completeness  
explicit timezone  
governed provenance reference  
governed disclosure policy

The current Google normalizer also contains compatibility behaviour that is unsuitable as governed evidence when source fields are absent:

event.id ?? synthetic index-based ID  
missing start/end ?? current clock

Those behaviours may preserve legacy UI continuity.

They shall not establish governed Calendar evidence.

Accordingly, a future governed Calendar evidence normalizer must fail closed rather than promote synthetic identity or synthetic event time into canonical evidence.

---

## **7\. Acquisition-Layer Non-Reopening Decision**

Unlike Gmail, Calendar has no Sprint 3.69-equivalent acquisition governance contract.

The question is therefore whether Sprint 3.97 must govern Calendar acquisition itself.

### **Decision**

**Sprint 3.97 does not redesign or comprehensively govern Calendar acquisition.**

It does, however, establish the **minimum acquisition evidence requirements** necessary for truthful downstream publication.

That distinction is mandatory.

This contract does not change:

* OAuth scope;  
* calendar discovery;  
* visible-calendar selection;  
* hidden/deleted-calendar filtering;  
* Google endpoint selection;  
* `singleEvents=true`;  
* chronological ordering;  
* the current seven-day query horizon;  
* the current production request limit of five;  
* local fallback behaviour in legacy `OperationalState`;  
* event display normalization;  
* Calendar UI behaviour.

Those remain existing acquisition/application behaviour.

This contract governs only which facts from that acquisition must be explicitly preserved before the resulting observation may become governed conversational evidence.

A future comprehensive Calendar acquisition contract is not required merely to implement this bounded publisher.

If a future sprint proposes changing acquisition scope, query horizon, calendar inclusion rules, cancellation handling, recurrence semantics, or provider error handling, that change requires separate governance.

---

## **8\. Minimum Governed Acquisition Evidence**

A future governed Calendar production evidence boundary shall preserve, for each acquisition:

sourceId  
retrievedAt  
windowStart  
windowEnd  
requestedLimit  
resultTruncated / coverage state  
source availability

and, for each eligible event:

provider event ID  
calendar ID  
provider start  
provider end  
event status when supplied  
recurrence identity when supplied

The governed path shall not reconstruct these values later from:

* `OperationalState.updatedAt`;  
* conversation time;  
* projection time;  
* UI display strings;  
* `day`;  
* `time`;  
* local fallback;  
* `Date.now()` after acquisition;  
* array length alone.

This is not a redesign of acquisition.

It is the minimum evidence preservation required to make the existing acquisition truthfully publishable.

---

## **9\. Constitutional Responsibility and Architecture Decision**

The Calendar mapping has exactly one responsibility:

> **Produce bounded, referential Calendar commitment evidence for governed conversational projection from an explicitly observed production Calendar acquisition under a fixed disclosure policy and explicit coverage contract.**

It does not own:

* calendar acquisition strategy;  
* calendar discovery policy;  
* scheduling;  
* commitment interpretation beyond the observed event;  
* priority;  
* urgency;  
* meeting importance;  
* attendee identity;  
* participant obligations;  
* claim classification;  
* conflict adjudication;  
* model reasoning.

### **Options**

**Option A — Map current `CalendarEvent[]` directly.**

Rejected.

The current array does not preserve sufficient observation time, timezone, or coverage provenance, and may contain local fallback or synthetically normalized values.

**Option B — Introduce a comprehensive Calendar acquisition redesign before conversational evidence.**

Rejected.

Real production acquisition already exists. A full redesign is unnecessary to govern the narrow evidence boundary.

**Option C — Govern a narrow production Calendar evidence normalizer over the existing acquisition, followed by deterministic conversational mapping under a fixed versioned Calendar disclosure policy.**

**Selected.**

**Option D — Treat legacy `OperationalState.calendar` as the governed source publication.**

Rejected.

`OperationalState.calendar` can contain local fallback, lacks sufficient acquisition provenance, and is an application/compatibility state rather than a governed source publication.

### **Architecture Decision**

> **Option C — Govern a narrow production Calendar evidence normalizer over existing acquisition, followed by deterministic conversational mapping under a fixed versioned Calendar disclosure policy.**

The future normalizer/publisher shall be deterministic relative to its explicit acquisition inputs and reference times.

No hidden clock may influence governed identity, event time, timezone, provenance, or coverage.

---

## **10\. Identity Integrity Decision**

The governed Calendar evidence path shall not create competing authority over the same underlying Google Calendar event.

The source-qualified event reference namespace is:

google-calendar:calendar:\<calendarId\>:event:\<eventId\>

where:

calendarId \= CalendarEvent.calendarId  
eventId    \= provider-supplied CalendarEvent.id

for an eligible real Google event.

This is a source-qualified resource reference.

It is not a new immutable publication identity.

The future governed normalizer may create its own immutable acquisition/publication identity if required by its separately defined publication contract, but that identity shall represent the bounded acquisition evidence object, not replace the Google event's source-qualified identity.

The conversational projection shall reference the underlying event.

It shall not claim to own it.

---

## **11\. Legacy `OperationalState` and Future Governance**

`OperationalState.calendar` currently consumes the same underlying Calendar acquisition for legacy application purposes.

That does not make it a competing canonical publication.

If `OperationalState.calendar` is governed later, it shall remain either:

* a compatibility/application projection; or  
* a separately governed publication with a distinct constitutional responsibility.

It shall not acquire the same source-publication authority as the Calendar evidence boundary governed here.

One underlying Google Calendar event shall not acquire two competing canonical source identities merely because two application paths consume it.

The rule is:

one source observation  
    ↓  
one source-qualified event identity  
    ↓  
multiple bounded downstream references permitted  
    ↓  
no duplicate source authority

---

## **12\. Binding Nine-Field Mapping**

`GovernedCalendarEvidenceInput` requires exactly:

commitmentReference  
sourceReference  
start  
end  
timezone  
provenanceReference  
available  
coverageLimit  
policyReference

The binding mapping is:

| Field | Exact binding | Decision |
| ----- | ----- | ----- |
| `commitmentReference` | `"google-calendar:calendar:" + calendarId + ":event:" + eventId` | Deterministic |
| `sourceReference` | exact source-qualified event/time observation described below | Deterministic |
| `start` | provider-observed event start preserved by governed normalizer | Deterministic |
| `end` | provider-observed event end preserved by governed normalizer | Deterministic |
| `timezone` | explicit governed timezone semantics described below | Deterministic but requires normalizer preservation |
| `provenanceReference` | `commitmentReference + "#provenance"` | Deterministic subordinate reference |
| `available` | `true` only for an eligible live Google Calendar observation from an available governed acquisition | Deterministic |
| `coverageLimit` | exact governed acquisition coverage expression | Deterministic |
| `policyReference` | `governed-calendar-conversational-metadata-disclosure.v1` | Fixed governed policy |

No field remains unresolved.

---

## **13\. `commitmentReference`**

**Decision:**

commitmentReference \=  
"google-calendar:calendar:"  
\+ calendarId  
\+ ":event:"  
\+ eventId

Example:

google-calendar:calendar:primary:event:abc123

Both `calendarId` and `eventId` are required.

A bare event ID is insufficient because the source request is calendar-qualified.

A synthetic fallback ID such as:

google-\<calendarId\>-\<index\>

shall not qualify as governed identity.

A local ID such as:

local-\<index\>

shall not qualify.

The term `commitmentReference` means the governed conversational Calendar schema's reference to the observed scheduled event.

It does not independently assert that:

* attendance is mandatory;  
* the operator accepted the event;  
* the event is important;  
* the event is a task;  
* the event is a promise;  
* the event will occur.

Those interpretations remain outside this source publication.

---

## **14\. `sourceReference`**

**Decision:**

sourceReference \= {  
  sourceId: "google-calendar",  
  resourceId:  
    "calendar:" \+ calendarId \+ ":event:" \+ eventId,  
  field: "schedule\_interval",  
  observedAt: acquisition.retrievedAt  
}

### **`sourceId`**

Always:

google-calendar

under this contract.

### **`resourceId`**

Always:

calendar:\<calendarId\>:event:\<eventId\>

### **`field`**

Always:

schedule\_interval

This field identifies the bounded source assertion represented by `start` and `end`.

It does not claim that the full event body, title, attendee list, description, conferencing details, location, or organizer metadata has been published.

### **`observedAt`**

Always the explicit acquisition observation time preserved by the governed Calendar production evidence boundary.

It shall not be:

event start  
event end  
OperationalState.updatedAt  
projection time  
conversation time  
Date.now() during mapping

---

## **15\. `start`**

**Decision:**

`start` shall equal the source-observed Calendar event start preserved by the governed production evidence normalizer.

For timed Google events, the existing `CalendarEvent.start` preserves the provider `dateTime`.

For all-day events, it preserves the provider bare ISO date:

YYYY-MM-DD

A future governed normalizer shall preserve that distinction.

It shall not convert an all-day date into a synthetic midnight instant merely to satisfy the conversational shape.

If Google supplies no valid start, the event is not eligible for governed publication.

The current legacy fallback to the current clock is prohibited for governed evidence.

---

## **16\. `end`**

**Decision:**

`end` shall equal the source-observed Calendar event end preserved by the governed production evidence normalizer.

For timed events, preserve the provider-observed `dateTime`.

For all-day events, preserve the provider-observed date boundary.

The publisher shall not invent an end.

The current legacy normalization behaviour:

missing end → start  
missing start/end → current clock

does not establish governed evidence.

If the source observation lacks a valid end, the event shall fail the governed publication eligibility check.

---

## **17\. `timezone`**

The existing `CalendarEvent` shape does **not** contain an explicit timezone field.

Therefore timezone is not mechanically available as a standalone field from the current application object.

This contract must govern it.

### **Decision**

For a timed event:

timezone \=  
the explicit UTC offset contained in the provider-observed start dateTime

represented in canonical offset form:

Z

or:

±HH:MM

The future governed normalizer shall extract and preserve this value directly from the provider-observed `start.dateTime`.

It shall not derive timezone from:

* server locale;  
* browser locale;  
* operator profile;  
* `Intl` defaults;  
* calendar display name;  
* acquisition location.

For an all-day event:

timezone \= "floating-date"

`floating-date` means:

> the source assertion is a calendar date rather than a timezone-qualified instant.

It shall not be converted to UTC midnight or a machine-local timezone.

If a timed provider `dateTime` lacks a valid explicit offset, the event is not eligible for this v1 governed publication.

A future contract may govern provider timezone identifiers separately if Calendar acquisition begins preserving them.

---

## **18\. `provenanceReference`**

**Decision:**

provenanceReference \=  
commitmentReference \+ "\#provenance"

Example:

google-calendar:calendar:primary:event:abc123\#provenance

This is a subordinate reference to the governed Calendar acquisition evidence associated with the source event.

It is not a second event publication.

The future governed normalizer shall preserve enough provenance to resolve this reference to:

source \= google-calendar  
calendarId  
eventId  
retrievedAt  
windowStart  
windowEnd  
requestedLimit  
coverage state

plus source-observed event status/recurrence facts where preserved.

The conversational projection shall reference that provenance.

It shall not reconstruct it from `OperationalState`.

---

## **19\. `available`**

**Decision:**

For an individual Calendar event:

available \= true

only when:

1. the source is real Google Calendar;  
2. the acquisition succeeded sufficiently to establish the event observation;  
3. the event has provider-supplied source-qualified identity;  
4. valid source-observed start and end exist;  
5. required timezone semantics are deterministically available;  
6. acquisition observation time exists; and  
7. no local/mock fallback supplied the event.

`available = true` means:

> this specific source-qualified Calendar schedule observation is available as governed evidence.

It does not mean:

* the entire Calendar account was completely observed;  
* every visible calendar succeeded;  
* no additional events exist;  
* the event is confirmed;  
* the operator accepted it;  
* the event will occur.

Coverage is represented separately.

---

## **20\. `coverageLimit`**

Sprint 3.88 correctly identified coverage as a governance decision.

The current production acquisition is bounded by both:

time horizon

and:

result count

A truthful `coverageLimit` must preserve both.

### **Decision**

The v1 governed coverage expression is:

window=\<windowStart\>/\<windowEnd\>;max\_events=\<requestedLimit\>;scope=visible\_non\_hidden\_calendars;completeness=bounded

For the current production request this normally represents:

window=\<retrieval-time\>/\<retrieval-time-plus-7-days\>;  
max\_events=5;  
scope=visible\_non\_hidden\_calendars;  
completeness=bounded

The actual values shall come from the governed acquisition evidence.

They shall not be reconstructed from the returned event array.

### **Meaning**

This coverage statement means:

> The acquisition requested upcoming events inside this explicit time window across the visible, non-hidden calendars selected by the existing connector, subject to the explicit result limit and any recorded source-level partial failures.

It does **not** mean:

> These are all Calendar commitments in the next seven days.

---

## **21\. Coverage and the Five-Event Limit**

The current connector:

1. requests up to the limit from each visible calendar;  
2. merges the returned events;  
3. sorts them;  
4. globally slices to the same limit.

Therefore a five-event output does not prove that only five matching events exist.

Accordingly:

max\_events=5

is a coverage ceiling, not a completeness assertion.

`coverageLimit` shall never be:

complete  
unbounded  
all\_upcoming\_events  
full\_calendar

under the current acquisition.

---

## **22\. Partial Calendar Failures**

The existing Google connector may skip an individual calendar after a non-401 fetch failure while returning events from other calendars.

That behaviour means a successful returned array does not necessarily prove complete coverage across every targeted calendar.

The future governed Calendar evidence normalizer shall preserve whether acquisition coverage was:

bounded\_complete\_request

or:

bounded\_partial\_request

relative to the calendars actually targeted by the acquisition.

Until the acquisition path preserves that distinction explicitly, the governed publisher shall use:

completeness=bounded

and shall not claim complete cross-calendar coverage.

A later implementation sprint shall not infer success merely from a non-empty event array.

---

## **23\. Local Fallback**

Local Calendar records are compatibility/application data.

They are not authoritative Google Calendar evidence.

When Google acquisition is unavailable and `loadCalendar()` substitutes `LocalCalendarConnector` events, those events shall not become governed Calendar evidence.

They shall not receive:

sourceId \= google-calendar

They shall not receive Google commitment references.

Their synthesized dates and IDs shall not become source provenance.

Connector unavailability belongs to the separately governed connector-availability category.

---

## **24\. Calendar Disclosure-Policy Question**

`GovernedCalendarEvidenceInput` has no field named:

compatibilityBoundary

Unlike `GovernedCommunicationEvidenceInput`, therefore, Calendar cannot carry a separate compatibility-boundary identifier.

That does **not** remove the underlying disclosure-policy question.

Calendar source data can contain sensitive or private information including:

* event titles;  
* descriptions;  
* attendee identities;  
* organizer identity;  
* meeting locations;  
* conferencing links;  
* private calendar names;  
* attendee response information.

Therefore Sprint 3.97 must resolve the equivalent boundary through:

policyReference

rather than inventing a new `compatibilityBoundary` field.

### **Decision**

No `compatibilityBoundary` field shall be added to `GovernedCalendarEvidenceInput` in Sprint 3.97.

The equivalent minimisation and non-authority rules are governed by the Calendar disclosure policy below.

---

## **25\. Policy Reference**

**Decision:**

policyReference \=  
"governed-calendar-conversational-metadata-disclosure.v1"

This is a fixed, versioned governed policy constant.

It is not:

* a publication identity;  
* runtime configuration;  
* a user preference;  
* a model-selected policy.

No mutable policy registry is required.

---

## **26\. Governed Calendar Conversational Metadata Disclosure Policy v1**

The policy:

governed-calendar-conversational-metadata-disclosure.v1

authorizes the minimum source-qualified Calendar schedule evidence required for governed conversational reasoning.

It contains five binding rules.

### **Rule 1 — Schedule evidence before descriptive content**

The v1 Calendar evidence publication authorizes:

event reference  
start  
end  
timezone semantics  
source provenance  
coverage boundary  
availability

It does not automatically authorize descriptive event content.

### **Rule 2 — Event title is not part of `GovernedCalendarEvidenceInput`**

Although `CalendarEvent.title` exists mechanically, the target governed shape does not require it.

Therefore the Calendar evidence publisher shall not copy event titles into this evidence object.

A title required for a separately governed claim must enter through an independently governed source-evidence publication.

### **Rule 3 — Attendees are not published**

Attendee lists, attendee email addresses, organizer identities, and participant details are not part of this v1 publication.

`selfAttendeeResponse` shall not be copied into `GovernedCalendarEvidenceInput`.

It may remain upstream source metadata pending a separately governed use.

### **Rule 4 — No private descriptive fields**

This policy does not authorize publication of:

event description  
meeting location  
conference URL  
meeting join credentials  
attendee list  
organizer details  
calendar color  
raw Calendar API object

### **Rule 5 — Schedule presence grants no interpretive authority**

An observed event does not establish:

* priority;  
* urgency;  
* attendance obligation;  
* acceptance;  
* importance;  
* project membership;  
* decision authority;  
* event occurrence;  
* completion.

Those require separately governed reasoning or evidence.

---

## **27\. Calendar Name and Calendar ID**

`calendarId` is required for source-qualified identity.

It may therefore participate in references and provenance.

`calendarName` is descriptive UI metadata.

It is not required by `GovernedCalendarEvidenceInput`.

The v1 publisher shall not copy `calendarName` into the governed Calendar evidence object.

This prevents descriptive or potentially private calendar labels from being disclosed merely because source identity is required.

---

## **28\. Event Status**

Provider status:

confirmed  
tentative  
cancelled

exists in `CalendarEvent`.

`GovernedCalendarEvidenceInput` has no status field.

The publisher shall not silently encode status into `available`.

In particular:

status \= tentative

does not mean:

available \= false

and:

status \= cancelled

does not mean the event never existed.

A future implementation shall preserve source status in the upstream governed Calendar observation if required for provenance, but Sprint 3.97 does not add a new conversational status field.

Any claim that an event is an active commitment must respect source status through separately governed claim/evidence rules.

---

## **29\. Recurrence**

The current connector uses:

singleEvents=true

and may preserve:

recurringEventId

for an observed recurring instance.

The governed event reference shall use the provider event ID of the returned instance.

It shall not collapse every recurrence into the series identity.

`recurringEventId` may remain upstream provenance.

It shall not replace the event's source-qualified identity.

---

## **30\. Dependency Decision**

The Calendar case differs from Gmail Sprint 3.96.

Gmail's mapper could consume an already governed production evidence object plus fixed policy constants.

Calendar has no equivalent object yet.

Therefore the future conversational mapping cannot truthfully be a pure function of today's `CalendarEvent` alone.

### **Decision**

The complete future mapping requires:

GovernedProductionCalendarEvidence  
\+  
contained governed Calendar observation  
\+  
fixed Sprint 3.97 policy constants

where `GovernedProductionCalendarEvidence` is a future narrow production evidence boundary that preserves the minimum acquisition evidence defined in this contract.

The exact implementation type name is not governed here.

It must contain sufficient data to establish:

source authority  
provider event identity  
calendar identity  
source-observed start/end  
timezone semantics  
retrievedAt  
windowStart  
windowEnd  
requestedLimit  
coverage state  
availability

No mutable external policy registry is required.

---

## **31\. Fixed Policy Constants**

The future publisher shall use:

sourceId \=  
google-calendar

source field \=  
schedule\_interval

policyReference \=  
governed-calendar-conversational-metadata-disclosure.v1

The source-qualified reference namespace is:

google-calendar:calendar:\<calendarId\>:event:\<eventId\>

No runtime policy selection is authorized.

---

## **32\. Canonical Mapping**

For eligible governed observation:

O \= governed Calendar event observation  
A \= governed production Calendar acquisition evidence

the conversational mapping is:

commitmentReference  
    \= "google-calendar:calendar:"  
      \+ O.calendarId  
      \+ ":event:"  
      \+ O.eventId

sourceReference.sourceId  
    \= "google-calendar"

sourceReference.resourceId  
    \= "calendar:"  
      \+ O.calendarId  
      \+ ":event:"  
      \+ O.eventId

sourceReference.field  
    \= "schedule\_interval"

sourceReference.observedAt  
    \= A.retrievedAt

start  
    \= O.start

end  
    \= O.end

timezone  
    \= O.explicitOffset  
      OR "floating-date" for all-day events

provenanceReference  
    \= commitmentReference \+ "\#provenance"

available  
    \= true for an eligible observation from an available acquisition

coverageLimit  
    \= exact governed coverage expression from A

policyReference  
    \= "governed-calendar-conversational-metadata-disclosure.v1"

No hidden clock participates in this mapping.

No model judgment participates.

---

## **33\. Fail-Closed Eligibility**

A future publisher shall fail closed unless:

A.sourceId \=== "google-calendar"  
A.availability \=== "available"  
O belongs to A  
O.calendarId is present  
O.eventId is provider-supplied  
O.start is source-observed and valid  
O.end is source-observed and valid  
A.retrievedAt is present  
A.windowStart is present  
A.windowEnd is present  
A.requestedLimit is present  
timezone semantics are valid under this contract

A synthetic ID fails.

A synthetic event time fails.

A local event fails.

A reconstructed observation time fails.

An unqualified event detached from its acquisition provenance fails.

---

## **34\. Claims Boundary**

The Calendar publisher does not decide that an observed event is:

* important;  
* urgent;  
* accepted;  
* mandatory;  
* relevant to the operator's question;  
* evidence of a project;  
* evidence of a deadline;  
* evidence of intent.

It publishes bounded schedule evidence.

Claim classification remains downstream governance.

---

## **35\. Source Evidence Linkage**

When a governed claim uses the Calendar schedule observation, the source reference shall match the exact published source key:

google-calendar  
\+  
calendar:\<calendarId\>:event:\<eventId\>  
\+  
schedule\_interval  
\+  
retrievedAt

The claim engine shall not reconstruct Calendar provenance from:

commitmentReference  
start/end alone  
OperationalState  
prompt text  
calendar title

---

## **36\. Conflicts**

Calendar receives no source precedence.

If Calendar evidence conflicts with:

* Gmail;  
* memory;  
* another Calendar observation;  
* another governed source;

the existing conflict architecture controls.

Sprint 3.97 does not adjudicate.

The binding rule remains:

> **restrict, do not adjudicate**

---

## **37\. Publication Responsibility Audit**

| Question | Binding answer |
| ----- | ----- |
| Has Calendar acquisition strategy changed? | No |
| Does this contract establish minimum evidence-preservation requirements? | Yes |
| Is that necessary for truthful governed publication? | Yes |
| Does current `CalendarEvent` alone satisfy the governed target? | No |
| Is a narrow production evidence normalizer required first? | Yes |
| Does this require a comprehensive acquisition redesign? | No |
| Does the mapping create another source authority for the event? | No |
| Does it reconstruct legacy `OperationalState` as canonical evidence? | No |
| Does it preserve source-qualified event identity? | Yes |
| Does it introduce a disclosure policy? | Yes, narrowly and explicitly |
| Does the disclosure policy authorize event titles by default? | No |
| Does it authorize attendee lists? | No |
| Does it require a new compatibility field? | No |
| Does it require mutable runtime policy state? | No |
| Does it acquire claim classification? | No |
| Does it acquire conflict derivation? | No |
| Does it preserve deterministic replay? | Yes, provided acquisition time and coverage are explicit inputs |
| Does it preserve Identity Integrity? | Yes |

**Decision:** Publication Responsibility Audit passes.

The new responsibility is limited to making existing real Calendar acquisition truthfully referenceable by governed conversation.

---

## **38\. Future Implementation Sequence**

Because Calendar begins one stage earlier than Gmail did at Sprint 3.96, implementation shall occur in two distinct steps.

### **Step 1 — Narrow Calendar production evidence normalizer**

A future implementation sprint shall construct the governed production evidence boundary required by this contract.

Its job is only:

existing Google Calendar acquisition  
    ↓  
explicit acquisition evidence  
    \+  
eligible source-qualified event observations

It shall not wire conversation.

### **Step 2 — Calendar conversational evidence publisher**

A subsequent sprint shall map that governed production evidence into:

GovernedCalendarEvidenceInput\[\]

using the exact nine-field contract above.

### **Production integration**

Wiring into the governed conversational runtime remains a separate integration gate.

Sprint 3.97 authorizes none of these implementations.

---

## **39\. Future Normalizer Requirements**

The future production Calendar evidence normalizer shall:

* accept real Google Calendar acquisition only;  
* preserve provider event IDs;  
* preserve calendar IDs;  
* preserve source-observed start/end;  
* reject synthetic identity for governed evidence;  
* reject synthetic current-time event boundaries;  
* preserve acquisition retrieval time;  
* preserve explicit query window;  
* preserve requested result limit;  
* preserve sufficient partial-failure information to avoid false completeness;  
* preserve timezone semantics;  
* separate Google evidence from local fallback;  
* remain independent of `/api/chat`;  
* remain independent of model reasoning.

It shall not:

* change Calendar query scope;  
* add new OAuth scopes;  
* infer commitments;  
* infer priority;  
* infer attendance;  
* expose private descriptive fields merely because they are available upstream.

---

## **40\. Required Future Tests — Production Evidence Boundary**

Tests shall prove:

1. real provider event ID is preserved;  
2. synthetic fallback ID is rejected for governed evidence;  
3. real start is preserved;  
4. missing start is rejected rather than replaced by current time;  
5. real end is preserved;  
6. missing end is rejected rather than replaced by start/current time;  
7. timed-event UTC offset is preserved;  
8. all-day events produce `floating-date`;  
9. acquisition retrieval time is explicit;  
10. seven-day window boundaries are explicit;  
11. requested limit is explicit;  
12. local fallback cannot become Google evidence;  
13. partial calendar failure cannot become an unbounded completeness claim;  
14. deterministic replay with identical explicit inputs is structurally identical.

---

## **41\. Required Future Tests — Conversational Publisher**

Tests shall prove all nine fields exactly.

Required cases:

1. exact `commitmentReference`;  
2. exact source ID;  
3. exact resource ID;  
4. exact `schedule_interval` field;  
5. exact acquisition observation time;  
6. exact source start;  
7. exact source end;  
8. exact timed-event offset timezone;  
9. exact `floating-date` all-day timezone;  
10. exact subordinate provenance reference;  
11. truthful availability;  
12. exact coverage expression;  
13. exact policy reference;  
14. no title copied;  
15. no attendee list copied;  
16. no calendar name copied;  
17. no private descriptive content copied;  
18. no synthetic event;  
19. no local event;  
20. no hidden clock.

---

## **42\. Identity Integrity Tests**

Future implementation shall prove:

* different calendar IDs cannot alias the same event reference merely because event IDs match;  
* different provider event IDs cannot alias;  
* a conversational reference does not create a second source event identity;  
* provenance references remain subordinate;  
* legacy `OperationalState.calendar` does not become the source authority;  
* deterministic replay produces structurally identical conversational mappings.

---

## **43\. Prohibited Hedge Language**

The final contract and future implementation specifications shall not use unresolved governance language such as:

could  
might  
perhaps  
potentially  
ideally  
where appropriate  
as needed  
if useful  
TBD  
to be decided  
implementation may determine  
some timezone  
some coverage  
some provenance reference  
appropriate policy  
probably  
likely

for any decision governed by Sprint 3.97.

Use:

shall  
shall not  
must  
must not  
is  
is not  
Decision  
Selected  
Rejected  
Required  
Prohibited

All nine fields have a governed answer.

Implementation convenience shall not reopen those answers.

---

## **44\. Explicit Non-Decisions**

Sprint 3.97 does not decide:

* new Calendar OAuth scopes;  
* calendar write capability;  
* scheduling actions;  
* event creation;  
* event modification;  
* event deletion;  
* calendar filtering product policy;  
* a new query horizon;  
* a new event count limit;  
* event-title source-evidence publication;  
* attendee source-evidence publication;  
* organizer publication;  
* event-description publication;  
* location publication;  
* conferencing-link publication;  
* claim relevance;  
* project inference;  
* urgency inference;  
* source precedence;  
* conflict adjudication;  
* generic cross-source evidence admission;  
* production `/api/chat` wiring;  
* production promotion.

Those require separately governed work where applicable.

---

## **45\. No-Implementation Statement**

> **Sprint 3.97 authorizes no code change, production wiring, or `/api/chat` modification.**

This is a governance-decision sprint only.

It authorizes neither:

* the production Calendar evidence normalizer;  
* the conversational publisher;  
* the runtime integration.

Those remain future implementation work.

---

## **46\. Validation**

Full repository validation is required.

No exception applies because this sprint changes documentation only.

Run:

npm test  
npm run build  
npm run lint  
npm run typecheck  
git diff \--check

All must pass.

Repository-wide searches shall additionally confirm:

1. no production governed Calendar evidence publisher exists;  
2. no Calendar governed evidence normalizer already owns the source boundary defined here;  
3. no existing policy identifier conflicts with:  
   `governed-calendar-conversational-metadata-disclosure.v1`;  
4. no existing publication identity collides with:  
   `google-calendar:calendar:<calendarId>:event:<eventId>`;  
5. `calendarEvidence` production construction remains absent;  
6. local fallback remains distinguishable from Google acquisition;  
7. `/api/chat` is unchanged; and  
8. only this Sprint 3.97 document changed.

If any validation contradicts this contract, do not reinterpret the repository to fit the specification.

Return:

> **Governance Review Incomplete**

---

## **47\. Files Changed**

Expected:

docs/SPRINT-3.97-GOVERNED-CALENDAR-CONVERSATIONAL-EVIDENCE-PUBLICATION-CONTRACT.md

only.

---

## **48\. Required Completion Record**

The completed Sprint 3.97 record shall report:

### **Repository Precondition**

* repository;  
* branch;  
* starting commit;  
* working-tree state;  
* Sprint 3.96 presence;  
* required artefact presence.

### **Governing Artefacts Reviewed**

List every artefact read completely.

### **Sprint 3.88 Finding Reconfirmed**

State explicitly:

> Real production Calendar acquisition exists, but no governed production Calendar evidence normalizer or conversational publisher exists.

### **Maturity Distinction**

State explicitly:

> Calendar begins one stage earlier than Gmail at Sprint 3.96 because Gmail already possessed a production canonical evidence normalizer.

### **Acquisition Decision**

State:

> Sprint 3.97 does not redesign Calendar acquisition. It governs only the minimum acquisition evidence that must be preserved for truthful downstream publication.

### **Architecture Decision**

Report:

> **Option C — Govern a narrow production Calendar evidence normalizer over existing acquisition, followed by deterministic conversational mapping under a fixed versioned Calendar disclosure policy.**

### **Nine-Field Mapping**

Report the exact binding for every field.

### **Timezone Decision**

Report:

> Timed events use the explicit provider-observed UTC offset; all-day events use `floating-date`.

### **Coverage Decision**

Report the exact bounded coverage expression.

### **Provenance Decision**

Report the subordinate reference rule.

### **Disclosure Policy**

Report:

governed-calendar-conversational-metadata-disclosure.v1

### **Compatibility-Equivalent Decision**

State:

> No new `compatibilityBoundary` field is introduced. Equivalent minimisation and non-authority rules are carried by the Calendar disclosure policy.

### **Identity Integrity Decision**

Confirm no competing source publication is created.

### **Dependency Decision**

State:

> Current `CalendarEvent` alone is insufficient. A narrow governed production Calendar evidence boundary is required before conversational mapping. No mutable policy registry is required.

### **Publication Responsibility Audit**

Report every audit answer.

### **No-Implementation Statement**

State:

> Sprint 3.97 authorizes no code change, production wiring, or `/api/chat` modification.

### **Validation**

Report exact results for:

npm test  
npm run build  
npm run lint  
npm run typecheck  
git diff \--check

### **Files Changed**

Expected:

docs/SPRINT-3.97-GOVERNED-CALENDAR-CONVERSATIONAL-EVIDENCE-PUBLICATION-CONTRACT.md

only.

### **Recommendation Gate**

Final line exactly one of:

> **Governed Contract Complete**

or:

> **Governance Review Incomplete**

---

## **49\. Binding Summary**

The governed Calendar architecture is:

Google Calendar API  
    ↓  
existing acquisition  
    ↓  
provider events  
    ↓  
existing CalendarEvent normalization  
    │  
    │  useful application shape,  
    │  not sufficient governed evidence  
    ↓  
future narrow governed production Calendar evidence normalizer  
    ├── source-qualified provider identity  
    ├── source-observed start/end  
    ├── timezone semantics  
    ├── retrieval observation time  
    ├── query window  
    ├── requested limit  
    ├── coverage state  
    └── source availability  
    ↓  
future deterministic Sprint 3.97 conversational mapper  
    ├── commitmentReference  
    ├── sourceReference  
    ├── start  
    ├── end  
    ├── timezone  
    ├── provenanceReference  
    ├── available  
    ├── coverageLimit  
    └── policyReference  
    ↓  
GovernedCalendarEvidenceInput  
    ↓  
GovernedConversationalProjection

The binding mapping is:

commitmentReference  
\= "google-calendar:calendar:"  
  \+ calendarId  
  \+ ":event:"  
  \+ eventId

sourceReference.sourceId  
\= "google-calendar"

sourceReference.resourceId  
\= "calendar:"  
  \+ calendarId  
  \+ ":event:"  
  \+ eventId

sourceReference.field  
\= "schedule\_interval"

sourceReference.observedAt  
\= acquisition.retrievedAt

start  
\= source-observed event start

end  
\= source-observed event end

timezone  
\= explicit provider UTC offset  
  OR "floating-date" for all-day events

provenanceReference  
\= commitmentReference \+ "\#provenance"

available  
\= true only for an eligible event from an available governed Google Calendar acquisition

coverageLimit  
\= "window=\<windowStart\>/\<windowEnd\>;max\_events=\<requestedLimit\>;scope=visible\_non\_hidden\_calendars;completeness=bounded"

policyReference  
\= "governed-calendar-conversational-metadata-disclosure.v1"

The existing acquisition is not repeated.

Legacy `OperationalState` is not promoted into source authority.

Local fallback is not promoted into Google evidence.

Synthetic event identity is prohibited.

Synthetic event time is prohibited.

All-day dates remain dates.

Timed events preserve source offset semantics.

Coverage remains explicitly bounded.

Event titles are not disclosed by this publication.

Attendee lists are not disclosed.

No second Calendar source authority is created.

No source is adjudicated.

No implementation is authorized.

The governing pattern is:

acquire once  
preserve source facts explicitly  
normalize without invention  
publish source authority once  
reference downstream  
state coverage honestly  
disclose minimally  
reason only under governed boundaries

**Governed Contract Complete**

