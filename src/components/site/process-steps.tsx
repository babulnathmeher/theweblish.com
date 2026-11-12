export function ProcessSteps({ website = false }: { website?: boolean }) {
  const steps = website ? [
    ["Consultation", "Tell us about your website, audience, and requirements."],
    ["Proposal", "Review the proposed scope, exclusions, and schedule before work begins."],
    ["Design", "Review the page structure and visual direction."],
    ["Development", "Build and review the agreed website."],
    ["Launch", "Check the finished site and agree on the launch steps."],
  ] : [
    ["Discover", "Start with your goals, audience, and current challenges."],
    ["Plan", "Agree on a scope and a practical path forward."],
    ["Design", "Shape the experience around the agreed direction."],
    ["Build", "Put the approved work together and review it."],
    ["Launch", "Complete final checks and plan the next steps."],
  ];
  return <ol className="steps">{steps.map(([title, description], index) => <li className="step" key={title}><span className="step-number">{String(index + 1).padStart(2, "0")}</span><h3>{title}</h3><p>{description}</p></li>)}</ol>;
}
