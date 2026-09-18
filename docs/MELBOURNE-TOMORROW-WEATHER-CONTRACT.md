# Melbourne Tomorrow Weather — Acquisition and Rendering Contract

**Status:** Acquisition prerequisite **RESOLVED / FROZEN** on 18 September 2026. The Melbourne production capability remains unimplemented.

## Decision

JARVIS may implement one additional deterministic public-information capability:

> Report the current Bureau of Meteorology forecast for **Melbourne tomorrow**.

V1 is limited to Melbourne location identifier `VIC_PT042`, the next Melbourne calendar day, and the Bureau's Victorian Precis Forecast XML product `IDV10753` acquired through the Bureau's Anonymous FTP service.

This freeze extends neither Geelong's proof nor Melbourne's proof to arbitrary locations. It does not authorise current-day temperature completeness, hourly forecasts, historical weather, climate reporting, severe-weather interpretation, model-written weather synthesis, or a generic location router.

## Relationship to the Geelong contract

The acquisition product, transport, freshness fields, timezone policy, XML security boundary, field names, and deterministic rendering rules are already frozen in [the Geelong contract](./GEELONG-TOMORROW-WEATHER-CONTRACT.md). Melbourne was nevertheless inspected independently within the same three raw Bureau issues before this location was admitted.

Reusing the proven acquisition and parsing mechanism does not transfer Geelong's location proof. Melbourne's exact identifier, cardinality, period structure, field presence, and revision behavior are evidenced below.

## Acquisition source

The selected source remains:

```text
ftp://ftp.bom.gov.au/anon/gen/fwo/IDV10753.xml
```

JARVIS must not replace this path with browser automation, scraping of rendered Bureau pages, search snippets, undocumented endpoints, or third-party forecasts. A registered Bureau service remains a separate future decision.

## Evidence identity

Three independent Bureau issues were inspected. A fourth local file was a byte-identical repeat retrieval of issue 1 and is not counted independently.

| Issue | Local issue time | Issue UTC | Expiry UTC | SHA-256 |
| --- | --- | --- | --- | --- |
| 1 | `2026-09-17T21:45:48+10:00` | `2026-09-17T11:45:48Z` | `2026-09-18T11:45:48Z` | `9c113370075f09c88a5dc9b934a42da3e53bb5675e0ae2295f8fe2d5da34b090` |
| 2 | `2026-09-18T09:45:37+10:00` | `2026-09-17T23:45:37Z` | `2026-09-18T23:45:37Z` | `2585e58d8cc64e2aa2240bf0bbe1524c7706a5efec75eb8ff27f1c7e88e5aace` |
| 3 | `2026-09-18T16:05:00+10:00` | `2026-09-18T06:05:00Z` | `2026-09-19T06:05:00Z` | `226122a4854ac6858b5193b54889e623b562d96f7a31b2d1cde840fc9dc5cb67` |

Every independent issue contained a parseable `expiry-time` exactly 24 hours after `issue-time-utc`. Raw Bureau XML is intentionally excluded from Git. This record preserves only the evidence identity, verified structure, and cryptographic digests.

## Observed Melbourne structure

Across all three independent issues:

- exactly one area matched description `Melbourne` and type `location`;
- that area remained server-owned identifier `VIC_PT042`, with parent `VIC_PW007`;
- full future calendar-day periods exposed `air_temperature_minimum`, `air_temperature_maximum`, `precis`, and `probability_of_precipitation` in every measured tomorrow case;
- `precipitation_range` was legitimately absent from every measured tomorrow case;
- current-day partial periods varied with issue time and legitimately omitted one or both temperature extrema;
- local and UTC period boundaries were explicit;
- forecast-period indices shifted as the product advanced; and
- later issues legitimately revised forecast wording.

The measured tomorrow periods were:

| Issue | Target local date | Period index | Minimum | Maximum | Precis | Rain probability |
| --- | --- | ---: | ---: | ---: | --- | ---: |
| 1 | 18 September 2026 | 1 | 7°C | 23°C | Mostly sunny. | 0% |
| 2 | 19 September 2026 | 1 | 13°C | 25°C | Mostly sunny. | 10% |
| 3 | 19 September 2026 | 1 | 13°C | 25°C | Sunny. | 10% |

Index `1` is not itself authoritative. The same 19 September full-day period appeared at index `2` in issue 1, before it became the next-day period in issues 2 and 3. Selection must continue to use exact local timestamp boundaries.

## Frozen V1 contract

### 1. Request scope

V1 accepts only deterministic forecast or temperature requests for Melbourne tomorrow. Other locations, dates, date ranges, current conditions, historical conditions, warnings, hourly detail, and general weather research remain outside this contract.

### 2. Time and product authority

Resolve `tomorrow` as the next calendar date in `Australia/Melbourne`. Acquire `IDV10753.xml` through the frozen Anonymous FTP path and require a parseable `issue-time-utc` and `expiry-time`.

The product is admissible only when evaluation occurs on or after `issue-time-utc` and strictly before `expiry-time`. `next-routine-issue-time-utc` remains operational metadata, not a hard expiry boundary.

### 3. Location binding

Select exactly one location area whose server-owned identifier is `VIC_PT042` and whose type is `location`. Do not bind by display-name similarity, array position, a metropolitan aggregate, or model interpretation. Zero or multiple matches fail closed.

### 4. Date binding

Select exactly one period whose local boundaries cover the complete requested Melbourne calendar date, from local midnight through the following local midnight. Do not select by array position, forecast-period index, weekday label, proximity, or sequence inference.

### 5. Field admission

Read independently from the selected period:

- `air_temperature_minimum` in Celsius;
- `air_temperature_maximum` in Celsius;
- `precis`;
- `probability_of_precipitation`; and
- `precipitation_range`, when present.

Never borrow missing data from the partial current-day period, another date, another issue, a third-party source, search results, climate averages, prior answers, or model knowledge. A missing rainfall range is valid. Any other missing requested field must be reported unavailable rather than inferred.

### 6. Rendering and failure behavior

Render admitted fields through deterministic server-owned code, lead with the result, and include compact Bureau and issue-time provenance. The model must not select or rewrite the source, location, date, fields, freshness status, or factual answer.

Acquisition, parsing, freshness, location, date, field, or ambiguity failure must return bounded unavailability. It must not fall through to public-web search.

## Required implementation proof

Implementation remains separate from this freeze. It must include deterministic tests for at least:

- exact Melbourne request recognition without widening to arbitrary locations;
- exact `VIC_PT042` and `location` binding;
- rejection of a Melbourne metropolitan aggregate or display-name-only match;
- index changes and misleading period ordering;
- partial current-day periods preceding tomorrow;
- Melbourne-local daylight-saving boundaries;
- optional missing rainfall range;
- independently missing minimum, maximum, precis, and probability fields;
- malformed XML and external-entity input;
- future-issued and expired products;
- zero and multiple location or date matches;
- acquisition failure with no web or model fallback; and
- deterministic forecast and temperature rendering with issue-time provenance.

Promotion additionally requires a live comparison with the contemporaneous Bureau Melbourne presentation. Product Gap records must not be resolved solely because Geelong passed.

## Revalidation triggers

Revalidate before continuing reliance when the Bureau product, schema, transport, field names, timestamp semantics, location identifier, timezone policy, freshness rule, output fields, or access terms change materially.

Any additional location, state product, temporal class, or weather capability requires its own evidence. Reuse the architecture; never inherit the proof.
