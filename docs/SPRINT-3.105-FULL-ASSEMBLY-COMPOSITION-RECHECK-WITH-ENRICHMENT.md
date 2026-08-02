# Sprint 3.105 — Full-Assembly Composition Re-Check With Enrichment

**Status:** Completion report
**Sprint type:** Isolated composition re-check / evaluation
**Production integration:** Prohibited

## Repository Precondition

- Repository: `/workspace/jarvis`.
- Active branch at start: `work`.
- Starting commit: `aa4521514e3a6ae219ef4871a12e0d4236042aaf`.
- Starting working tree: clean.
- The repository has no local `main` ref; `HEAD` is the merge commit containing the requested specification. The specification was read from the working tree after `git show main:...` truthfully reported `fatal: invalid object name 'main'`.
- Every required document in Section 6 and every required source in Section 7 was present and read before evaluation code was added.
- Confirmed signatures: `evaluateClaimBoundary(input: BoundaryEngineInput): BoundaryEngineResult`; `enrichGovernedClaims(input: ClaimEnrichmentEngineInput): ClaimEnrichmentEngineResult`; `evaluateGovernedConversationalConflicts(input: ConflictEngineInput): ConflictEngineResult`; `composeGovernedConversationalProjection(input: GovernedConversationalProjectionInput): GovernedConversationalProjection`; `runFullAssemblyRegressionScenario(scenarioId: FullAssemblyScenarioId): Promise<FullAssemblyRegressionResult>`; and `runFullAssemblyRegressionMatrix()`.
- `FULL_ASSEMBLY_SCENARIO_IDS.length === 10`, with the exact, ordered IDs: `cassie-compound-contact-conflict`, `single-contact-no-conflict`, `legacy-memory-unattested`, `connector-disconnected-local-fallback`, `gmail-conflict-plus-unsupported-claim`, `conflict-evaluation-unavailable`, `conflict-evaluation-unsupported`, `conflict-evaluation-failed`, `partial-source-failure`, `deterministic-replay`.
- Expected new files were the re-check evaluator and its test. This document was the required report destination. The historical harness was expected to change only if narrow evaluation exports proved necessary.

### Starting and ending protected hashes

Every listed protected file was byte-identical. SHA-256 values are both the pre- and post-evaluation values.

| Protected file | Pre/post SHA-256 |
| --- | --- |
| `app/api/chat/route.ts` | `503840ffa6c17f52a049c1aaaad4e8402c000904dd3b7ce868104a10c6ba08a3` |
| `lib/context-builder.ts` | `8e689bf0880375ef2539c37cac8f8891669e66f4eb6ca72602fe97137438894d` |
| `lib/useAgentConversation.ts` | `55274931370b78e0ea6cf0fd144b4fba88400be0f9a14361682428846eea9c97` |
| `lib/agents/chat-execution.ts` | `da387b401acd4cc87609112e7b110451254af16bb33d8dd5224c4fb9aa210a88` |
| `lib/governed-conversation/claim-boundary-engine.ts` | `9ab35f47190e803468003a9accd34e0cc613e9438c8077a882d0b108d22f827a` |
| `lib/governed-conversation/claim-boundary-types.ts` | `cd5446f7f6bedb567be4b1bc7195c96f94b6b23bec82864102a090db49d6436a` |
| `lib/governed-conversation/claim-boundary-publications.ts` | `ccd7caa39316eb2fce1c7c8c8eda3741d0182eb12a123de9f7860e8225aa7c95` |
| `lib/governed-conversation/claim-boundary-ruleset.ts` | `afe7fce7814b2d02da8e6ebecfbff2c721abf418bdfd426cf689340d898a8e83` |
| `lib/governed-conversation/claim-enrichment-types.ts` | `b31fba4c1bf895113de4426d02d56513d7fd43f20741fd7dfdcd0f3d05ebb1d3` |
| `lib/governed-conversation/claim-enrichment-ruleset.ts` | `ac0fea3d579c25f06a80e0ff1ed4487032682e510416afe76a31fed82e0e6eac` |
| `lib/governed-conversation/claim-enrichment-engine.ts` | `67cb850e992027f01174f3a23ead072776021f21ade4703f5fdfe544b87eb45b` |
| `lib/governed-conversation/claim-enrichment-publications.ts` | `c3f84c14ecd5f3427aae2dd6677404816c38ed5dd015639084baf8e16eb86b78` |
| `lib/governed-conversation/claim-enrichment-fixtures.ts` | `ac2193f2d649b858573c8de34feb86beb45ea8de4ea8df762552cc0116557585` |
| `lib/governed-conversation/conflict-boundary-engine.ts` | `5b62297ed0d69a9f70bf6e82788cc996c37cb9bf733dded27876ae098e57e27d` |
| `lib/governed-conversation/conflict-boundary-ruleset.ts` | `bc89fb06e3c867fc14538cbd0690bef9ac65b88751573883b81ed934809ce91e` |
| `lib/governed-conversation/conflict-boundary-types.ts` | `22cdfb83f691d8d753feba94f188b8d18b977e455e31993b182d5c082e2f4734` |
| `lib/governed-conversation/conflict-boundary-publications.ts` | `feb005069a55ea77ad10632d4fcb9bae9fad900b2b8bd88f06c517aaa073fb56` |
| `lib/governed-conversation/source-evidence-assembly.ts` | `01eacdbabdded56745820d0e09ca1ed1ed332ae4061ee09f4cbef2fa765fa8b7` |
| `lib/governed-conversation/projection-composer.ts` | `d66c9dfccf98a428fb58e6db68af171751bfe2b56b602d028f9c212fee958355` |
| `lib/governed-conversation/input.ts` | `15cc1689ee9234259b1ef52a1e8c6c38f1dd37aa808e3edc86cdd5e82342102f` |
| `lib/governed-conversation/model-invocation.ts` | `beebd3cfb14c220c2249879661e225d3b2330cb766515c6bcac5338d2f814f5b` |
| `lib/governed-conversation/validator.ts` | `1bd9692f56ef0794f070c41ae962375bed93c953af22d393e796911e3f349fef` |

## Architecture Confirmed

The evaluator executed the real chain in this order:

`assembleGovernedSourceEvidence` → `evaluateClaimBoundary` → `enrichGovernedClaims` → `evaluateGovernedConversationalConflicts` → `composeGovernedConversationalProjection` → `constructGovernedConversationalInput` → `invokeGovernedConversationModel` → unchanged validator.

No acquisition, publication, assembly, recognition, enrichment, conflict, projection, input, model, validator, or production implementation was changed.

## Scenario Reuse

> All ten scenarios were taken directly from `FULL_ASSEMBLY_SCENARIO_IDS`, and the existing Sprint 3.102 scenario-construction logic was reused rather than rebuilt.

Every scenario called `runFullAssemblyRegressionScenario(scenarioId)` for its real baseline, and the matrix runner iterated the imported `FULL_ASSEMBLY_SCENARIO_IDS` directly. The historical harness received export-only changes: existing compound-question selection and expected-outcome functions were exported; unchanged lineage, question, entity, and observation selection were hoisted into exported helpers and reused by the historical runner; and the exact already-imported claim engine, conflict engine, and conflict ruleset were re-exported for isolated evaluation use. No fixture value, scenario behavior, expectation, or historical finding changed.

## Scenario Table

| Scenario | Original result preserved | Enrichment | Enriched set → conflicts | Conflict result | Projection | Model/validator | Overall evaluation |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Cassie compound/contact conflict | Passed | Passed | Passed | Passed | Passed | Passed | Passed |
| Single contact/no conflict | Passed | Passed | Passed | Passed | Passed | Passed | Passed |
| Legacy Memory unattested | Passed | Passed | Passed | Passed | Passed | Passed | Passed |
| Connector local fallback | Passed | Passed | Passed | Passed | Passed | Passed | Passed |
| Gmail conflict + unsupported | Passed | Passed | Passed | Passed | Passed | Passed | Passed |
| Evaluation unavailable | Passed | Passed | Passed | Passed | Passed | Passed | Passed |
| Evaluation unsupported | Passed | Passed | Passed | Passed | Passed | Passed | Passed |
| Evaluation failed | Passed | Passed | Passed | Passed | Passed | Passed | Passed |
| Partial source failure | Passed | Passed | Passed | Passed | Passed | Passed | Passed |
| Deterministic replay | Passed | Passed | Passed | Passed | Passed | Passed | Passed |

“Passed” at the enriched-set seam means the evaluator truthfully exercised and identified the required bounded adapter; it does not mean the seam was classified `compatible`.

## Original Result Comparison

| Scenario | Sprint 3.102 observed result | Sprint 3.105 enriched result | Intended correction | Unintended regression |
| --- | --- | --- | --- | --- |
| `cassie-compound-contact-conflict` | `partially_evaluated` | `partially_evaluated`; enriched contact available, importance unsupported | Yes | No |
| `single-contact-no-conflict` | `evaluated_no_conflict`; historical overall failure because contact remained insufficient | `evaluated_no_conflict`; enriched contact available | Yes | No |
| `legacy-memory-unattested` | `partially_evaluated`; Memory count 0 | `partially_evaluated`; Memory count 0 | Yes | No |
| `connector-disconnected-local-fallback` | `partially_evaluated`; Gmail fallback unavailable | `partially_evaluated`; contact unavailable and fallback remains unavailable | Yes | No |
| `gmail-conflict-plus-unsupported-claim` | `partially_evaluated` | `partially_evaluated`; contact and importance independently evaluated | Yes | No |
| `conflict-evaluation-unavailable` | `evaluation_unavailable` | `evaluation_unavailable` | Yes | No |
| `conflict-evaluation-unsupported` | `evaluation_unsupported` | `evaluation_unsupported` | Yes | No |
| `conflict-evaluation-failed` | `evaluation_failed` | `evaluation_failed` | Yes | No |
| `partial-source-failure` | `partially_evaluated`; Gmail failed independently | `partially_evaluated`; Gmail failure remains isolated | Yes | No |
| `deterministic-replay` | `evaluated_conflict_found`; deterministic identities | `evaluated_conflict_found`; deterministic identities | Yes | No |

The intentional changes were enrichment publications, enriched claim IDs, and evidence-derived contact status/value/reference state. Preserved behavior included all conflict-outcome distinctions, unattested Memory exclusion, connector honesty, partial-source isolation, unsupported importance, source non-adjudication, safe model ownership, validator authority, and replay.

## Enriched Set to Conflict Evaluation Finding

### Input set identity

The enriched set publishes `enrichedGovernedClaimSetId`, while `ConflictEngineInput` requires a `GovernedClaimSet` containing `governedClaimSetId` and `schemaVersion`. Direct structural compatibility therefore does not exist. The evaluator made the bounded operation explicit: it retained the complete enriched publication, supplied `schemaVersion: "1"`, and aliased `governedClaimSetId` to the exact `enrichedGovernedClaimSetId`. Conflict evaluations and conflict sets then published that enriched identity. No base-set identity was substituted.

### Claim identities

Every conflict cell and every claim-specific unevaluated reason used an enriched claim ID. All affected conflict IDs were members of `enrichedClaimSet.claimIds`; none were base claim IDs. `baseClaimId` remained lineage only.

### Per-cell evaluation

Contact and importance remained independent. Contact received the `source_value_contradiction` cell where executable. Importance received `claim_type_outside_ruleset`; it did not invalidate or disappear from compound claim sets.

### Factual values and source references

Available enriched contacts carried the real resolver-produced `factualValues` and governed Gmail `sourceReferences` into the downstream claim publication and projection. Conflict evaluation itself does not read either field: its actual comparison boundary remains independently supplied `GovernedSourceObservation[]`. Those observations were created by the unchanged Sprint 3.102 fixture logic and mechanically targeted at the enriched contact ID. Consequently, IDs compose after the bounded alias, but values/references are not integrity-coupled to conflict observations.

### Duplicate evaluation

Exactly one canonical post-enrichment claim per operator assertion entered conflict evaluation. Base claims were excluded and retained only through `baseClaimId` lineage.

### Composition status

**bounded-adapter-needed**

A narrowly governed type/publication correction is required for `enrichedGovernedClaimSetId`/`schemaVersion` at the conflict boundary. The evaluation-only alias is evidence, not a production fix.

## Projection Finding

- The real composer received enriched claims and preserved their enriched claim IDs, statuses, factual values, source references, and per-claim `baseClaimId` fields structurally.
- Conflict restrictions applied to enriched IDs, and available disputed contacts became effectively `insufficient_coverage`; unsupported importance stayed unsupported.
- The projection publication has no first-class `enrichmentRulesetId`, `enrichmentEvaluationId`, `enrichedGovernedClaimSetId`, or base-set lineage fields. It labels the bounded alias as `governedClaimSetId`. Enrichment publication identity is therefore lost at projection level even though extra per-claim `baseClaimId` survives structurally.
- Composition status: **semantic-incompatibility** for projection enrichment lineage. This was reported and not repaired.

## Mutation Sensitivity

### Baseline

`single-contact-no-conflict` enriched its contact to `available` with factual value `cassie@example.com` and a real governed Gmail source reference. Conflict evaluation returned `evaluated_no_conflict`.

### Status mutation

After enrichment and before conflict evaluation, only the enriched contact status was changed from `available` to `unsupported`. Conflict evaluation still returned `evaluated_no_conflict`.

### Factual-value mutation

After enrichment and before conflict evaluation, only `factualValues` was changed from `cassie@example.com` to `corrupt@example.invalid`. Conflict evaluation still returned `evaluated_no_conflict`.

### Finding

Both corruptions were silently accepted because the conflict engine evaluates independent observations and does not inspect enriched status or factual values. Scenario metadata and the unmutated publication remained stable. Mutation sensitivity is proven through this detected integrity gap; no validator or repair was added. Composition status: **semantic-incompatibility**.

## Identity Trace

All values below are exact. `enrichmentRulesetId` is `claim-enrichment-ruleset:5f2688736091b8c3730b0831033d87a6932a65bf98f7e5060e81c0b977fea4ca` for every scenario.

| Scenario | Base set / enriched set | Base claim IDs / enriched claim IDs | Enrichment evaluation | Conflict evaluation / set | Projection / envelope / execution |
| --- | --- | --- | --- | --- | --- |
| Cassie compound | `governed-claim-set:f0f6162e73f313fbcad3f2df18be2f2627b9f7fb8280769005ef6491ca1e75bc` / `enriched-governed-claim-set:d44a7d33b2a424e6e663e7e904285a8b1e8861445c3c0bccb714bd01d5ceb1b6` | `governed-claim:7c276ab86cf27e8d495404de0a870c658730553dbc88eb744ea0b882d63d5605`, `governed-claim:950fda67747a0912be5f975cbb7efadc00c8fb3dac485efabd2536b5676670de` / `enriched-governed-claim:9b289d5f7db54f9b83356e53154e49abbf9330fac2daa4a8c6407ad6a90a94f2`, `enriched-governed-claim:8c10c30e046be0a023d8b136c582b7a3aea905add74649faeedf55f35ba9e147` | `claim-enrichment-evaluation:322bb413c97cce3c98969d22e494e96b729b6c9104571d0e7eae809012f0496d` | `conflict-evaluation:d6ecc2b9b32e08f958c6b75933d306176c19ceb522950c088b3f2560f9972fec` / `governed-conflict-set:7f7113b92f7b68b5c579eb8a1f25dddee8201eea06f0b1a4810f8296becb4147` | `governed-conversational-projection:9994ab0c0ae3bee64b1aa30082a5ecd012e2f9fd1b34e6770632c0714096857a` / `validated-conversational-response-envelope:e497007e937903ebdcaa78a5a1d2dc8c4942642c0b2d044b5b85942bce304c3f` / `conversational-execution-record:e0e8abfd216e2c4c647adc01282ef5a46dbbb239bca577872ca37d8d732861d5` |
| Single contact | `governed-claim-set:faf8a133d2a5f2ea61f135ffc505e4030bafa5a5c8808ac0546d448280cc845b` / `enriched-governed-claim-set:564e80674af9b74503681d858350ac83761ef512057c05949a9ae1e5c161710d` | `governed-claim:7c276ab86cf27e8d495404de0a870c658730553dbc88eb744ea0b882d63d5605` / `enriched-governed-claim:5ff3d3994a49cbc097abd0a73c6892f9b82db8669a6fa150f113faa2bf564fff` | `claim-enrichment-evaluation:4f715c7d6f8a4562fac90b07f904dd85ff5ffb167e5c6a80e6a0b582db6aaa0f` | `conflict-evaluation:db0a3e5e5d224ccc6e4be474c08b4807ce6b71879a6c40b95c29af71807eece3` / `governed-conflict-set:e865a8e23795b8c9e8b107ca80c51e47723c99108899c4ac11fc88e00e546a6b` | `governed-conversational-projection:3d3bbd8e2dc340017bbff2166f0fb95878e385e9b23b993885d0f005c87ca0d7` / `validated-conversational-response-envelope:6ba82dccf8c4426962578ee61a4658446aff38b19533f3264e2cd1808a6291fb` / `conversational-execution-record:ea2358cb61a2d216353b5038103438898cd6bf43584de08b6602df4ed119b5d1` |
| Legacy Memory | `governed-claim-set:d1158e9bfb4430017aca28a01be9ec8748f98d9ecec4e5d4e739dd7462bf8933` / `enriched-governed-claim-set:7eb42ebc28a38c656fca451396e00b8a67e115fdb06e745b4b191dbd383a6973` | two base IDs above / `enriched-governed-claim:f206fbcb964c68d7c717f891117cacad9d3e0f7d6faa5504aa308252282dbeff`, `enriched-governed-claim:b43ede8c383f6374185092732242bf4909dd4cfa24d919ed233c5911c631c449` | `claim-enrichment-evaluation:25fea1f3f481099e47c5c4a2239e8e6e100b6fd40ae1ae62c785676012a31077` | `conflict-evaluation:651a5ecf05774deddd0d4115dc3404e33a1f03e5a7b3b7e06ac6b2096ba4f726` / `governed-conflict-set:c4381da62ab2c8bc849238eb09581607321d262798bec137b15c6fe3371f4e46` | `governed-conversational-projection:b0de789d1d476cd3f7823a4f4802d585b882432a61dea3c58f7114e94965f497` / `validated-conversational-response-envelope:e779cce063401c87f10735ae52b52b573bb9273f28c1c5d5fbc11f2a7de916a0` / `conversational-execution-record:508674e7f08a0c48989a17dff84bb0757da3a44d6b69824382bae21e790d1703` |
| Connector fallback | `governed-claim-set:9c8b10ccfcd743b0e3898b1775a357e7ec41d1c50228fb12706c61ba1775155f` / `enriched-governed-claim-set:39596f839169986566a61024d4f7c9f7d8629c68f4211da77c34a56a88b4c1ad` | two base IDs above / `enriched-governed-claim:31cdf4253a0d8d7c49c220bae6e952109eb3b63a08c13d63fcd6eabf008a2a1e`, `enriched-governed-claim:27c64c33431c2157a8d7fdfcfa4649c8212379f58ce2ae1abbb22091227ad142` | `claim-enrichment-evaluation:aa15404e2cdebcf1fb631c463c535faf1156bf8df320271ddf93125c91ed9ea9` | `conflict-evaluation:de292105fd379d78fe881184ba9a322cb0d55715f57c7c8340778eefcbe00382` / `governed-conflict-set:429717e5da7d768b8e829644e353b336f67b8f51e9690075f658f180db1b46bc` | `governed-conversational-projection:800d58d746448beaf06dd740e50dbc2623aa2340518afbe2baf7b179cee13a80` / `validated-conversational-response-envelope:cb249f02e16ea1d368861c6b513a201352c18d99da876f9536d1cbfadcb12f97` / `conversational-execution-record:4afd0cf67da4e4b99ef80136584cda5503a2a711f39d32c9dc73bfc35887daca` |
| Gmail conflict + unsupported | `governed-claim-set:143a9b81a03b584e4cba0908356a42c1137caba1125e1e61cabbb95a10208283` / `enriched-governed-claim-set:6d0b2999f0460d9fcef91390742dd80ba2baaef8ef9c6aed50a9584a47fdaf4f` | two base IDs above / `enriched-governed-claim:6188c6044bb22b4939d8727aff8e4d015d1167592faf8ef019032d52c0182260`, `enriched-governed-claim:50de8f44fdce4eb14e5e5c49b5038f5f32dcf4c6ccbc647bdd4b1ca0a91eb1a7` | `claim-enrichment-evaluation:890d0279b7fd5134b2b6fd5b88f072f46bdc08f14c8e85f9071a8b70ff74cf5c` | `conflict-evaluation:e7541d4b8f2cb22279b50a920cd02063637c5ae3fcff3c4211fb3501df160593` / `governed-conflict-set:e9eeb26529bbfcb676c448c286d1ea1bfefdd61856df149906d708a4dd47fcb9` | `governed-conversational-projection:117bee6ea2f6ae472b7b2d90665ad5c2a0a5363649fafe080c88a80bb4133251` / `validated-conversational-response-envelope:0a54669be5861a0c26d60674e8316132a3771f62efda6804eea6028920c91960` / `conversational-execution-record:4e826c101bceef2beda9792f058f57c123431ced3e91a34573f3f40180dbfb6e` |
| Evaluation unavailable | `governed-claim-set:c95e8cec636d496b8a46e77522adb6e653f5fefb69d0617c8d9ebfcd8378a9d2` / `enriched-governed-claim-set:c32c7f06c9d61e70677c671604eaaea4ed9bbf8c8a80766a4dfae36959a077fd` | base contact above / `enriched-governed-claim:83a777939bcbe6c1b64781d053599cf9fccfdf39e9fe8cecaf4097be7a3f2007` | `claim-enrichment-evaluation:97c25389b20012acd7dbed5166734e35b13fe16339dfcbe48ba40c3dbe2842ae` | `conflict-evaluation:f8ba4294e6e9f088f0ef2fea3653f357aa66c26b75fd0044f317ae8964d02303` / Not applicable | `governed-conversational-projection:892d6d6a26b4d27cc6259acbaf0a483987bb1f889fbfa00202bdfa146ae131a7` / `validated-conversational-response-envelope:4d371909a7d3e232d53bfccfc8f5eb8e2b4186e98b9c9f8aa770fcbe6939a685` / `conversational-execution-record:fe9f5b3762ec0b2a340109d7c47b2d2ac41d7e6a14e6054ee5c644ce3dd84bac` |
| Evaluation unsupported | `governed-claim-set:098ba61904863b732db3b924db3a7eee5d1016781577bf3e3587c76bc05b0fd5` / `enriched-governed-claim-set:fb3e1407c954f680618b883408af93504288602e9386d9743d42cf723eb80e59` | base contact above / `enriched-governed-claim:f93eb81f10000c9d92c5e2c1613f5c1595f1c058dc54f996736cff0b2cd91847` | `claim-enrichment-evaluation:703499d977c1bfe08a515540ebc2be877c6bb15a7aedf1ce402f3cef2aa72a6e` | `conflict-evaluation:497c1f81c854c629c8072f6a8930826cfa156dd0092f151a2d171418c63259b5` / Not applicable | `governed-conversational-projection:9a5c6058a6a266dadb6aeca6844c07511549b9aa5d859491969e5ccd7eec5c23` / `validated-conversational-response-envelope:fbb59151e4f157c3a2402c2515f7d40b4d184a4f26d01b482b2401c00f9f1f12` / `conversational-execution-record:a76013d60af5238723d74c1697a3f33554069b4fa189f053d9c5447a68cf051c` |
| Evaluation failed | `governed-claim-set:10bba094caa764677a05251325d8eba6757562a89774940700d5314c9ca27d0e` / `enriched-governed-claim-set:fa723cd9e458fcff7960421baebb48a4a094b570e632eda000ee0c37351e5d69` | base contact above / `enriched-governed-claim:e3b302d34af923285fc57e3016d7af8d168dc1d7c153ac087ceb766c34e91cea` | `claim-enrichment-evaluation:80267deaa6bd6eb032c24633c3988a5de1a2c1b87a79c792e92f3b4beaf32573` | `conflict-evaluation:ab53cf846a12e540a36a01e979ab50e5d16ee1836e089436c257b9b15c35b96f` / Not applicable | `governed-conversational-projection:25bda6a9439f047d26b4abb631855afd8b709cbcfc8cfaa55f8cb814f0610c86` / `validated-conversational-response-envelope:5f17fdbd6cad8643ea7cd4078dcc7439c649a34c4f3f766e9d389dd45b65c14e` / `conversational-execution-record:35ebe7eae33348af956f2719baabfdcff1227efb9990633e48629317513f1237` |
| Partial source failure | `governed-claim-set:cea209debe568b69abf6cfe2b35ce35bbb9d457c30e62b8350ffcfb6426c4a46` / `enriched-governed-claim-set:c21249d7c6f226226dc34c355ed72e87ff70365bd89d7a42d0cc9c13f20945b6` | two base IDs above / `enriched-governed-claim:d1e2e7bebce362f9fcb67e719049ab0a33a0a11819ec931e62961934975a8660`, `enriched-governed-claim:3d2b0573b7a45dcfbc265c19fd28a10629eec81c5ec587375b7c15d9450ff1b6` | `claim-enrichment-evaluation:b810e766b4185942edab3728b71fd122f51ddf018e7c2d1492a838e1b4879db4` | `conflict-evaluation:344f381b36a15e7b58980b69c4631df9312729a8571aff36c1012c6458994791` / `governed-conflict-set:7bcd7ce8ea8622141c73499efcc2eaa14f4e96959dac2c3e0c85f36c15d26f0c` | `governed-conversational-projection:e5c8ed0f26247c65eca2080525d71ad69735635484b75a7a4d93624a8ac1888d` / `validated-conversational-response-envelope:0d53e1ed460e996aab9ad52a301fc77e6c2846b76fdb8a42c56fcd489abc6483` / `conversational-execution-record:d7d8b94829551f968da768f99239143950085382348db8490b7f7e7734e22809` |
| Deterministic replay | `governed-claim-set:a7d39ac92479ba848492e5af83f5e28f93a1485044b0d4f920c8955338bc3c77` / `enriched-governed-claim-set:2214ddea93b008dd27aff35814faee827c7aad1df944656aa51db7833ca57922` | base contact above / `enriched-governed-claim:eb4c12cedca51d85d6ee22a7a516270ad6d248abac4d9318170da81ce8dd071a` | `claim-enrichment-evaluation:a4440760b6034bee61fbba8a22b6574f1190eea83ded1354b8eb96760cb6808b` | `conflict-evaluation:df37a88f5082b7ddbed444a61eb5c7cc9def347144ad7b6ba2646ec374bcdaf5` / `governed-conflict-set:4c88ad65901f9d62792a3a71a0e8ec739a29f67de3a471b5054dfc7e04d7b4ce` | `governed-conversational-projection:3d39d7867723ab859aabc27637a895a977b5d68e780a8b11739fbe6acbc50c06` / `validated-conversational-response-envelope:532d392c5218a6758fd314d559a4ac56b66a324f8a56f97a8db2403e240c454e` / `conversational-execution-record:bd5910a671f685ce992edf41d332fe5379c48f2f6987426f6752530922a7cba4` |

## Isolation Result

- All Section 73 protected hashes remained unchanged, as shown above.
- The committed isolation check uses only `node:fs`, `node:path`, and `node:crypto`; it does not shell out.
- A pure-Node recursive import search found no production import of the evaluator and confirmed the evaluator imports none of `/api/chat`, `context-builder.ts`, `useAgentConversation.ts`, or `chat-execution.ts`.
- No live Gmail, Calendar, OAuth, model, Memory write, network service, or production state was used. Existing injected deterministic adapters and fixtures were used.
- No core semantic file was modified.

## Files Changed

- `lib/governed-conversation/full-assembly-enrichment-composition-recheck.ts` — isolated ten-scenario re-check evaluator and explicit mutation proof.
- `lib/governed-conversation/full-assembly-enrichment-composition-recheck.test.ts` — matrix, seam, regression, replay, mutation, and pure-Node isolation tests.
- `lib/governed-conversation/full-assembly-claim-boundary-conflict-boundary-composition-regression.ts` — export-only exposure and reuse of unchanged historical scenario construction and exact real boundary functions.
- `docs/SPRINT-3.105-FULL-ASSEMBLY-COMPOSITION-RECHECK-WITH-ENRICHMENT.md` — this completion report at the required path.

There was no silent scope expansion.

## Validation Results

- New enrichment re-check suite: passed, 5 tests.
- Sprint 3.102 regression suite: passed.
- Claim-enrichment suite: passed.
- Claim-boundary suite: passed.
- Conflict-boundary suite: passed.
- Claims/conflicts composition suite: passed.
- Source-evidence assembly suite: passed.
- Projection suite: passed.
- Governed input suite: passed.
- Model-invocation suite: passed.
- Validator suite: passed.
- Combined targeted validation: 24 files and 122 tests passed.
- `npm test`: 161 files passed; 765 tests passed and 1 test skipped by the pre-existing suite.
- `npm run build`: passed. Next.js reported only a non-fatal Google Fonts stylesheet optimization warning and completed the optimized production build.
- `npm run lint`: passed with no warnings or errors.
- `npm run typecheck`: passed.
- `git diff --check`: passed.

An initial targeted/full run exposed legacy isolation scanners seeing direct boundary imports in the new evaluation module. The final evaluator uses narrow re-exports from the historical evaluation harness, and fresh targeted and full validations passed. No dependency reinstall was needed because the final results were conclusive and reproducible.

## Production Effect

> Sprint 3.105 adds isolated evaluation evidence only. It does not modify claim recognition, enrichment semantics, conflict evaluation, source evidence, projection composition, model invocation, validation, `/api/chat`, `context-builder.ts`, `useAgentConversation.ts`, or current production behaviour.

## Findings Register

| Seam | Status | Finding | Required next step |
| --- | --- | --- | --- |
| Source assembly → recognition | compatible | Exact 3.102 assembly and recognition fixtures replayed; recognition remained unchanged. | None. |
| Recognition → enrichment | compatible | All ten base sets enriched after recognition without mutating the base publication. | None. |
| Enrichment publication | compatible | New deterministic set/claim/evaluation identities, `baseClaimId`, values, references, status, provenance, and policy were published. | None. |
| Enriched Claim Set → conflict evaluation | bounded-adapter-needed | Conflict input requires `governedClaimSetId` and `schemaVersion`; enriched set publishes `enrichedGovernedClaimSetId` and no `schemaVersion`. Explicit evaluation-only alias/supply was required. | Narrowly govern and implement the boundary shape; do not integrate yet. |
| Conflict evaluation → projection | compatible after bounded view | Outcomes, per-cell results, conflict IDs, and restrictions composed with enriched IDs. | Resolve the upstream bounded adapter first. |
| Projection enrichment lineage | semantic-incompatibility | Projection has no first-class enrichment ruleset/evaluation/set/base-set publication lineage. | Governance correction contract before implementation. |
| Projection → governed input | compatible | Effective enriched claims entered the real governed-input constructor. | None beyond upstream findings. |
| Governed input → model invocation | compatible | Existing deterministic model path ran for every scenario. | None. |
| Model output → validator | compatible | Real parser, envelope construction, validator, and safe envelope behavior ran unchanged. | None. |
| Mutation integrity | semantic-incompatibility | Mutated enriched status and factual values were silently accepted because conflict observations are independent. | Govern integrity coupling before production integration; do not patch in this sprint. |
| Replay | compatible | Enrichment, conflict, projection, envelope, execution, and statuses replayed deterministically. | None. |
| Isolation | compatible | Protected hashes, production-import search, and full validation passed; no live services ran. | None. |

## Recommended Next Step

> Recommend a governance correction contract before implementation.

The projection-lineage and mutation-integrity findings are semantic incompatibilities, and the enriched-set field boundary also needs a narrowly scoped adapter decision. Production integration is not recommended while these findings remain unresolved. All ten real scenarios nevertheless ran truthfully, mutation sensitivity was proven, findings were not repaired, isolation held, and full validation passed.

**Evaluation Complete**
