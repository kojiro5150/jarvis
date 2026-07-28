import { describe,expect,it } from "vitest";
import { ExecutiveContextEngine } from "../../lib/executive-context";
import { executiveContextFixture,executiveContextReferenceTime } from "../../lib/executive-context/fixtures";
import { CAPABILITY_INVOCATION_CONTRACT_VERSION,ExecutiveCapabilityImplementationRegistry,ExecutiveCapabilityRegistry,ExecutiveCapabilityRouter } from "../../lib/executive-operating-system/executive-capabilities";
import type { ExecutionPolicy,ExecutiveCapabilityImplementation } from "../../lib/executive-operating-system/executive-capabilities";
import { DeterministicExecutiveOperatingSystemRuntime } from "../../lib/executive-operating-system/runtime";
import { goldenRuntimeInput } from "../fixtures/eos/golden-projection-artifact-set";

describe("EOS canonical routing-to-invocation integration",()=>{it("runs context → router → handoff → invoker without changing existing output",()=>{
 const runtime=new DeterministicExecutiveOperatingSystemRuntime(),base=runtime.run(goldenRuntimeInput);
 const derived=new ExecutiveContextEngine().derive({sourceSnapshot:executiveContextFixture,referenceTime:executiveContextReferenceTime});expect(derived.outcome).toBe("success");if(derived.outcome!=="success")return;
 const executiveContext=derived.snapshot,condition=executiveContext.deterministicConditions[0];expect(condition).toBeDefined();
 const capability={capabilityId:"test.echo",capabilityVersion:"1",status:"active" as const,dependencyCapabilityIds:[]},scenario={scenarioId:"golden",capabilityIds:[capability.capabilityId]},routingPolicy={policyId:"routing:golden",eligibleCapabilityIds:[capability.capabilityId]};
 const routingPlan=new ExecutiveCapabilityRouter(new ExecutiveCapabilityRegistry([capability],[scenario],[routingPolicy],[{routingRuleId:"rule:golden",capabilityId:capability.capabilityId,conditionTypes:[condition.type]}])).route({executiveContext,scenario,policy:routingPolicy});
 const implementation:ExecutiveCapabilityImplementation={implementationId:"test.echo.local",capabilityId:"test.echo",implementationVersion:"1",implementationStatus:"AVAILABLE",executionClass:"READ_ONLY",supportedCapabilityVersions:["1"],supportedContractVersions:[CAPABILITY_INVOCATION_CONTRACT_VERSION],precedence:0,provider:"neutral-test",invoke:context=>({resultId:`echo:${context.invocationId}`,capabilityId:"test.echo",implementationId:"test.echo.local",contractVersion:CAPABILITY_INVOCATION_CONTRACT_VERSION,elapsedMilliseconds:0,metadata:{behaviour:"none"}})};
 const executionPolicy:ExecutionPolicy={policyId:"execution:golden",policyVersion:"1",executionEnabled:true,permittedExecutionClasses:["READ_ONLY"],permittedImplementationStatuses:["AVAILABLE"],timeoutMilliseconds:1,requiredInvocationContractVersion:CAPABILITY_INVOCATION_CONTRACT_VERSION,metadata:{}};
 const result=runtime.runWithCapabilityInvocation(goldenRuntimeInput,{routingPlan,executiveContext,capabilityId:"test.echo",executionPolicy,implementationRegistry:new ExecutiveCapabilityImplementationRegistry([implementation]),referenceTime:"2030-01-14T10:00:00Z"});
 expect(result.capabilityInvocation.ok).toBe(true);if(result.capabilityInvocation.ok)expect(result.capabilityInvocation.record.provenance.supportingConditionIds).toEqual([condition.conditionId]);const {capabilityInvocation,...preserved}=result;expect(preserved).toEqual(base);expect(result.trace).toEqual(base.trace);expect(Object.isFrozen(result)).toBe(true);
});});
