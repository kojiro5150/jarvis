import { describe,expect,it } from "vitest";
import { CAPABILITY_INVOCATION_CONTRACT_VERSION,ExecutiveCapabilityImplementationRegistry } from "../../lib/executive-operating-system/executive-capabilities";
import type { CapabilityRoutingPlan,ExecutionPolicy,ExecutiveCapabilityImplementation } from "../../lib/executive-operating-system/executive-capabilities";
import { DeterministicExecutiveOperatingSystemRuntime } from "../../lib/executive-operating-system/runtime";
import { goldenRuntimeInput } from "../fixtures/eos/golden-projection-artifact-set";

describe("EOS governed capability invocation integration",()=>{it("adds invocation after the preserved runtime without changing existing output",()=>{
 const runtime=new DeterministicExecutiveOperatingSystemRuntime(),base=runtime.run(goldenRuntimeInput);
 const routingPlan:CapabilityRoutingPlan={routingPlanId:"routing:golden-neutral",capabilityId:"test.echo",capabilityVersion:"1",routingStatus:"ROUTABLE",executiveContextId:base.context.contextId,executiveStateSnapshotId:base.context.snapshotId,routingContractVersion:"1.0",authority:{registered:true,eligible:true,permitted:true},dependencies:[]};
 const implementation:ExecutiveCapabilityImplementation={implementationId:"test.echo.local",capabilityId:"test.echo",implementationVersion:"1",implementationStatus:"AVAILABLE",executionClass:"READ_ONLY",supportedCapabilityVersions:["1"],supportedContractVersions:[CAPABILITY_INVOCATION_CONTRACT_VERSION],precedence:0,provider:"neutral-test",invoke:context=>({resultId:`echo:${context.invocationId}`,capabilityId:"test.echo",implementationId:"test.echo.local",contractVersion:CAPABILITY_INVOCATION_CONTRACT_VERSION,elapsedMilliseconds:0,metadata:{behaviour:"none"}})};
 const executionPolicy:ExecutionPolicy={policyId:"execution:golden",policyVersion:"1",executionEnabled:true,permittedExecutionClasses:["READ_ONLY"],permittedImplementationStatuses:["AVAILABLE"],timeoutMilliseconds:1,requiredInvocationContractVersion:CAPABILITY_INVOCATION_CONTRACT_VERSION,metadata:{}};
 const result=runtime.runWithCapabilityInvocation(goldenRuntimeInput,{routingPlan,executionPolicy,implementationRegistry:new ExecutiveCapabilityImplementationRegistry([implementation]),referenceTime:"2030-01-14T10:00:00Z"});
 expect(result.capabilityInvocation.ok).toBe(true);const {capabilityInvocation,...preserved}=result;expect(preserved).toEqual(base);expect(result.trace).toEqual(base.trace);expect(Object.isFrozen(result)).toBe(true);
});});
