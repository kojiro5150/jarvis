# Geelong Tomorrow Weather — Acquisition and Rendering Contract

**Status:** Acquisition prerequisite **RESOLVED / FROZEN** on 18 September 2026. The production capability remains unimplemented.

## Decision

JARVIS may implement one deterministic public-information capability:

> Report the current Bureau of Meteorology forecast for **Geelong tomorrow**.

V1 is limited to Geelong location identifier `VIC_PT025`, the next Melbourne calendar day, and the Bureau's Victorian Precis Forecast XML product `IDV10753` acquired through the Bureau's Anonymous FTP service.

This freeze does not authorise arbitrary-location weather, current-day temperature completeness, hourly forecasts, historical weather, climate reporting, severe-weather interpretation, or model-written weather synthesis.

## Acquisition decision

The rendered Bureau location pages are client-rendered and do not expose the forecast in a plain JavaScript-free HTTP response. The apparent per-location HTTPS XML path was also tested directly and returned HTTP `403` with the Bureau's automated-access notice. That notice states that the website does not support scraping and directs automated acquisition to Anonymous FTP or a registered service.

The selected V1 source is therefore:

```text
ftp://ftp.bom.gov.au/anon/gen/fwo/IDV10753.xml
```

JARVIS must not evade the HTTPS restriction through browser automation, user-agent substitution, undocumented endpoints, or other scraping behavior. A registered Bureau service remains a separate future option if operational, licensing, support, redistribution, or commercial requirements exceed the Anonymous FTP boundary.

## Evidence identity

Three independent Bureau issues were retrieved successfully as valid XML. A fourth local file was a byte-identical repeat retrieval of issue 1 and is not counted as an independent issue.

| Issue | Local issue time | Issue UTC | Expiry UTC | Next routine issue UTC | SHA-256 |
| --- | --- | --- | --- | --- | --- |
| 1 | `2026-09-17T21:45:48+10:00` | `2026-09-17T11:45:48Z` | `2026-09-18T11:45:48Z` | `2026-09-17T18:00:00Z` | `9c113370075f09c88a5dc9b934a42da3e53bb5675e0ae2295f8fe2d5da34b090` |
| 2 | `2026-09-18T09:45:37+10:00` | `2026-09-17T23:45:37Z` | `2026-09-18T23:45:37Z` | `2026-09-18T06:05:00Z` | `2585e58d8cc64e2aa2240bf0bbe1524c7706a5efec75eb8ff27f1c7e88e5aace` |
| 3 | `2026-09-18T16:05:00+10:00` | `2026-09-18T06:05:00Z` | `2026-09-19T06:05:00Z` | `2026-09-18T18:00:00Z` | `226122a4854ac6858b5193b54889e623b562d96f7a31b2d1cde840fc9dc5cb67` |

Every independent issue contained a present and parseable `expiry-time` exactly 24 hours after `issue-time-utc`. `next-routine-issue-time-utc` was independently present and is not treated as an expiry boundary.

Raw Bureau XML is intentionally excluded from Git. This record preserves the product identity, timestamps, structural findings, and cryptographic digests needed to identify the measured evidence without redistributing the source product.

## Observed Geelong structure

Across all three independent issues:

- Geelong remained `VIC_PT025`, description `Geelong`, type `location`;
- forecast periods exposed explicit local and UTC start and end timestamps;
- full future calendar-day periods exposed `air_temperature_minimum`, `air_temperature_maximum`, `precis`, and `probability_of_precipitation` in the measured tomorrow cases;
- `precipitation_range` was legitimately absent when no range was published;
- current-day partial periods varied with issue time and legitimately omitted one or both temperature extrema;
- the number and index positions of periods varied; and
- later issues legitimately revised forecast content, including Geelong's 19 September maximum changing from 23°C to 24°C.

The three measured tomorrow periods were:

| Issue | Target local date | Minimum | Maximum | Precis | Rain probability |
| --- | --- | ---: | ---: | --- | ---: |
| 1 | 18 September 2026 | 4°C | 22°C | Mostly sunny. | 5% |
| 2 | 19 September 2026 | 13°C | 23°C | Sunny. | 10% |
| 3 | 19 September 2026 | 13°C | 24°C | Sunny. | 10% |

## Frozen V1 contract

### 1. Request scope

V1 accepts only a deterministic request for the forecast or temperature in Geelong tomorrow. Other locations, relative dates, date ranges, current conditions, historical conditions, warnings, hourly detail, and general weather research remain outside this contract.

### 2. Time authority

Resolve `tomorrow` as the next calendar date in `Australia/Melbourne`. Do not use server-local UTC day arithmetic. Daylight-saving transitions must be handled as local calendar boundaries, not assumed 24-hour durations.

### 3. Source acquisition

Acquire the current `IDV10753.xml` product from the frozen Anonymous FTP path. Treat the response as untrusted input: enforce a bounded download, parse XML without external-entity or external-resource resolution, and fail closed on transport or parsing failure.

V1 must not use public web search as a fallback. Search snippets, rendered-page sequences, adjacent forecast periods, climate averages, remembered values, ordinary conversation history, and model inference are inadmissible substitutes.

### 4. Product freshness

Require `issue-time-utc` and `expiry-time` to be present and parseable.

The product is admissible only when the evaluation instant is:

- on or after `issue-time-utc`; and
- strictly before `expiry-time`.

`next-routine-issue-time-utc` is provenance and operational metadata only. Passing that timestamp does not independently invalidate an otherwise unexpired product.

### 5. Location binding

Select exactly one location area whose server-owned identifier is `VIC_PT025`. Do not bind by display-name similarity or model interpretation. Zero or multiple identifier matches fail closed.

### 6. Date binding

Select exactly one forecast period whose local timestamp boundaries describe the complete requested Melbourne calendar date: local midnight at the start of the target date through local midnight at the start of the following date.

Do not select by array position, forecast-period `index`, English weekday label, proximity, or sequence inference. Zero or multiple matching periods fail closed.

### 7. Field admission

Read these fields independently from the selected period:

- `air_temperature_minimum` in Celsius;
- `air_temperature_maximum` in Celsius;
- `precis`;
- `probability_of_precipitation`; and
- `precipitation_range`, when present.

Never borrow a missing field from another period or product issue. Never manufacture it from climate averages, model knowledge, adjacent days, prior answers, or cached prose. A missing optional rainfall range is not a failure. Any other missing requested field must be reported as unavailable rather than inferred.

### 8. Deterministic rendering

Render admitted fields through server-owned deterministic code. The answer must lead with the requested date and result, remain concise, and include compact provenance naming the Bureau of Meteorology and the product issue time.

The model must not select the source, date, location, fields, freshness status, or factual wording.

### 9. Failure behavior

On acquisition, parsing, freshness, location, date-binding, ambiguity, or required-field failure, return an honest bounded unavailability response. Do not continue into the ordinary public-web research path and do not provide a partial guess disguised as a forecast.

## Required implementation proof

Implementation must remain separate from this freeze and must include deterministic tests for at least:

- exact Melbourne tomorrow calculation;
- a daylight-saving boundary;
- exact `VIC_PT025` binding;
- reordered or misleading forecast-period indices;
- current-day partial periods preceding the requested full-day period;
- a legitimately absent precipitation range;
- independently missing minimum, maximum, precis, and probability fields;
- malformed XML and external-entity input;
- future-issued and expired products;
- zero and multiple location matches;
- zero and multiple date-period matches;
- transport failure with no web-search fallback; and
- deterministic output with compact source and issue-time provenance.

Promotion additionally requires a live comparison against the contemporaneous Bureau Geelong presentation. The answer must match the exact requested date and currently published structured fields. Product Gap records must not be resolved before that live pass.

## Revalidation triggers

Revalidate this contract before widening or continuing reliance when any of these change materially:

- Bureau product identifier, schema, field names, or timestamp semantics;
- Anonymous FTP path, availability model, access terms, or licensing boundary;
- Geelong location identifier;
- timezone or requested-date policy;
- freshness or caching behavior;
- output fields or deterministic renderer;
- supported location or temporal scope; or
- acquisition transport.

Reuse of the architectural pattern does not transfer this proof to another location, product, date class, or weather capability.
