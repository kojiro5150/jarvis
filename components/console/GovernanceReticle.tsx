import type { CSSProperties } from "react";

type ReticleState = "idle" | "invoked" | "error" | "unknown";

export type ReticleSpecialist = { id: string; name: string; state: ReticleState };

export default function GovernanceReticle({ specialists }: { specialists: ReticleSpecialist[] }) {
  if (specialists.length === 0) return <div className="governance-reticle is-unknown" aria-label="Specialist states unavailable" />;

  const step = 360 / specialists.length;
  return (
    <div className="governance-reticle" role="img" aria-label={`Specialist states: ${specialists.map(({ name, state }) => `${name} ${state}`).join(", ")}`}>
      {specialists.map((specialist, index) => (
        <i className={`reticle-segment is-${specialist.state}`} data-specialist-id={specialist.id} data-state={specialist.state} key={specialist.id}
          style={{ "--segment-angle": `${index * step}deg` } as CSSProperties} />
      ))}
      <b aria-hidden="true" />
    </div>
  );
}
