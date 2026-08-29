# Sprint 3.185.9 — Gmail Sender Disambiguation Lifecycle Correction

**Status:** Final post-live GS002A follow-up containment correction  
**Trigger:** Repeated misspelling live test

## Live defect

After an authorised sender search produced two real candidates, the user entered the same misspelled refinement twice:

> `Georgia MacDonald.`

Both turns correctly failed to match either real sender. However, the second miss exhausted the server-owned disambiguation reference.

A later exact refinement:

> `Georgia McDonald.`

therefore had no governed sender state left to resolve against and fell out of the governed path.

## Invariant

> **Ambiguous sender disambiguation remains active until it is uniquely resolved, expires by TTL, or is superseded by a fresh governed Gmail request. Failed refinements do not create authority and do not consume the reference.**

## Correction

The disambiguation reference no longer counts or exhausts failed refinements.

Repeated non-matching or still-ambiguous refinements return the same opaque reference and the same real candidate set.

A later exact candidate can therefore resolve deterministically without:

- reacquiring sender identities;
- asking for Gmail search authority again;
- invoking the ordinary model;
- invoking a specialist handoff;
- fuzzy matching.

Successful unique resolution still consumes the reference. TTL expiry still closes it. Fresh governed Gmail requests may still supersede it through the existing path.

## Scope

This changes only sender-disambiguation reference lifetime. It does not broaden sender matching, Gmail read authority, topic search, body access, drafting, sending, or mailbox mutation.
