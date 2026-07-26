# **JARVIS Engineering Specification Standard (JESS)**

**Version:** 1.0  
**Status:** Accepted  
**Applies to:** All Sprint Specifications, Architectural PRs and  
Engineering RFCs

---

# **Purpose**

The JARVIS Engineering Specification Standard (JESS) defines the  
mandatory structure for every engineering specification within the  
JARVIS repository.

Its purpose is to ensure that all implementation work is driven by  
architecture rather than implementation detail, preserves repository  
consistency, and provides deterministic specifications suitable for  
implementation by both human engineers and coding agents.

The governing principle is:

> **Architecture before implementation.**

---

# **Engineering Principles**

Every specification shall reinforce the Engineering Constitution:

* Architecture before implementation  
* Deterministic before adaptive  
* Typed before dynamic  
* Validation before enforcement  
* Behaviour before orchestration  
* Backwards compatibility unless intentionally changed  
* Small, independently reviewable pull requests

---

# **Mandatory Specification Structure**

Every engineering specification SHALL contain the following sections in  
order.

## **1\. Architectural Context**

Mandatory.

Explain:

* where this PR sits  
* current architectural phase  
* completed work  
* architectural dependencies  
* architectural boundaries  
* what this PR intentionally does not implement

---

## **2\. Repository State**

Summarise:

* merged work  
* active sprint  
* relevant ADRs  
* existing public APIs  
* repository cleanliness assumptions

---

## **3\. Sprint Objective**

State the objective in one sentence.

---

## **4\. Architectural Relationships**

Document:

* consumes  
* produces  
* future consumers

Example:

Consumes  
✓ Situational Awareness Model

Produces  
✓ Projection Engine

Future Consumers  
✓ Decision Surface  
✓ Attention Engine  
✓ Behavioural Router  
---

## **5\. Architectural Integrity**

Every specification shall explicitly identify architecture that MUST NOT  
be changed.

Example:

* Behavioural Constitutions  
* Capability Matrix  
* Collaboration Graph  
* Diagnostics  
* Existing construction boundaries  
* Runtime behaviour

---

## **6\. Purpose**

Describe exactly what is introduced.

---

## **7\. Core Architectural Principles**

List the principles governing the implementation.

Examples:

* Projection Without Interpretation  
* Current Operational Truth  
* Deterministic Projection  
* Deep Immutability  
* Runtime Neutrality

---

## **8\. Scope**

Describe:

* included work  
* excluded work  
* explicit non-goals

---

## **9\. Domain Model**

Describe:

* public entities  
* domain vocabulary  
* ownership  
* lifecycle

---

## **10\. Public API**

Document every exported:

* interface  
* type  
* function  
* enum  
* union  
* identifier

---

## **11\. Processing Pipeline**

Describe the deterministic processing pipeline.

---

## **12\. Internal Architecture**

Explain:

* package structure  
* layers  
* extension points  
* boundaries

---

## **13\. Construction Boundaries**

Explain:

* constructors  
* builders  
* factories  
* projection boundaries  
* validation boundaries

---

## **14\. Source-of-Truth Boundaries**

Explicitly define:

* authoritative systems  
* projections  
* ownership  
* provenance

---

## **15\. Determinism**

Specify deterministic requirements.

No:

* randomness  
* hidden ordering  
* time-dependent behaviour  
* probabilistic outcomes

---

## **16\. Runtime Immutability**

Specify:

* readonly types  
* deep freeze  
* defensive copying  
* immutable outputs

---

## **17\. Ordering**

Document ordering guarantees.

---

## **18\. Validation**

Specify validation strategy.

---

## **19\. Invariants**

Document every invariant introduced.

---

## **20\. Failure Semantics**

Document:

* invariant failures  
* validation failures  
* conflict reporting  
* no silent repair

---

## **21\. Privacy**

State data minimisation rules.

---

## **22\. Security**

Document trust boundaries and sensitive data exclusions.

---

## **23\. Runtime Neutrality**

State explicitly that the PR does not alter existing runtime behaviour  
unless that is its stated purpose.

---

## **24\. Package Structure**

Document new package layout.

---

## **25\. Public Exports**

List every public export.

---

## **26\. Implementation Strategy**

Provide deterministic implementation steps.

---

## **27\. Testing Strategy**

List required tests:

* positive  
* negative  
* invariants  
* determinism  
* immutability  
* serialisation  
* backwards compatibility

---

## **28\. Documentation**

Specify required documentation updates.

---

## **29\. ADR**

Identify the ADR created or updated.

---

## **30\. Backwards Compatibility**

Document compatibility expectations.

---

## **31\. Quality Gates**

Mandatory verification:

Focused Tests  
Full Test Suite  
Lint  
TypeScript  
Production Build  
git diff \--check  
git status  
---

## **32\. Completion Report**

Specify mandatory implementation summary.

---

## **33\. Acceptance Criteria**

Define objective completion criteria.

---

## **34\. Definition of Done**

Provide one definitive statement describing when the PR is complete.

---

# **Mandatory Architectural Sections**

Every specification SHALL include:

* Architectural Context  
* Architectural Relationships  
* Architectural Integrity  
* Core Architectural Principles  
* Source-of-Truth Boundaries  
* Runtime Neutrality  
* Acceptance Criteria  
* Definition of Done

---

# **Writing Rules**

Specifications SHALL:

* describe architecture before implementation  
* be deterministic  
* separate current implementation from future work  
* explicitly identify non-goals  
* preserve existing architecture unless intentionally changed  
* avoid speculative implementation  
* avoid hidden behaviour

Specifications SHALL NOT:

* redesign previous work without architectural justification  
* mix implementation and future roadmap  
* omit architectural boundaries  
* assume undocumented behaviour  
* rely on conversational context

---

# **Codex Preparation**

Every specification should begin with instructions to inspect:

* Engineering Constitution  
* North Star  
* Sprint Specifications  
* ADR Registry  
* System Architecture  
* Repository conventions  
* Existing package layout  
* Public APIs  
* Deep-freeze utilities  
* Validation conventions  
* Test conventions

---

# **Engineering Review Checklist**

Every review should confirm:

* Architecture is correct.  
* Boundaries are preserved.  
* Determinism maintained.  
* Runtime immutability preserved.  
* Validation complete.  
* Tests comprehensive.  
* Documentation updated.  
* ADR complete.  
* Runtime neutrality preserved.  
* No architectural drift.

---

# **Architectural Outcome**

Every specification shall finish by describing the architectural  
capability created, rather than simply listing files or implementation  
tasks.

Example:

> After this PR, future architectural layers consume the Projection  
> Engine rather than heterogeneous operational sources directly.

---

# **Reading PR1–PR2 together, I think we should introduce four repository-wide architectural object types:**

| Object Type | Meaning | Immutable | Purpose |
| ----- | ----- | ----- | ----- |
| **Model** | **Canonical domain representation** | **✓** | **Represents architectural truth** |
| **Artifact** | **Observation produced by a subsystem** | **✓** | **Represents observational truth** |
| **Snapshot** | **Point-in-time constructed state** | **✓** | **Represents operational truth** |
| **Record** | **Output of institutional reasoning** | **✓** | **Represents governance truth** |

# 

# **Versioning**

Changes to this standard require a dedicated ADR and shall be versioned.

Current version:

**JESS v1.0**

