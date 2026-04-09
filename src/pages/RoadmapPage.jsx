import React from 'react';
import './RoadmapPage.css';

const phases = [
  {
    num: '01',
    label: 'Core Product',
    status: 'LIVE',
    done: true,
    items: [
      'Live signal engine, scoring, and historical storage',
      'Multi chain feed with Base already included',
      'Telegram workflow and investor demo proof pages',
      'Public app, API groundwork, and wallet ready UX',
    ],
  },
  {
    num: '02',
    label: 'Proof Stack',
    status: 'LIVE',
    done: true,
    items: [
      'Frontend compiles for production',
      'Contract suite passes local tests',
      'Signal accuracy and proof views are wired into the app',
      'Founder list and referral mechanics are already implemented',
    ],
  },
  {
    num: '03',
    label: 'Base Positioning',
    status: 'LIVE',
    done: true,
    items: [
      'Base selected as the launch chain',
      'Contracts configured for Base mainnet and Base Sepolia',
      'Messaging updated around grants, pilots, and a later token launch',
      'Open beta mode enabled while contracts remain undeployed',
    ],
  },
  {
    num: '04',
    label: 'Founder List And Pilots',
    status: 'IN PROGRESS',
    done: false,
    current: true,
    items: [
      'Turn the old whitelist into a founder list funnel',
      'Use referrals to measure organic demand, not hype a sale',
      'Onboard 3 to 5 pilot users for paid feedback',
      'Package monitoring, alerts, and API access as paid pilots',
    ],
  },
  {
    num: '05',
    label: 'Base Grants And Mentorship',
    status: 'UPCOMING',
    done: false,
    items: [
      'Apply for Builder Rewards and Builder Grants',
      'Use Base ecosystem intros instead of paid KOLs first',
      'Tighten README, project brief, and demo flow for applications',
      'Collect usage proof that makes a grant reviewer care',
    ],
  },
  {
    num: '06',
    label: 'Audit And Deploy',
    status: 'UPCOMING',
    done: false,
    items: [
      'External contract audit',
      'Base Sepolia verification and deployment runbook',
      'Mainnet deployment only after traction and review',
      'Replace placeholder addresses across the app',
    ],
  },
  {
    num: '07',
    label: 'Strategic Round',
    status: 'UPCOMING',
    done: false,
    items: [
      'Small founder focused round instead of a rushed public sale',
      'Target grants, angels, and pilot backed capital first',
      'Use capital for audit, runway, and Base go to market',
      'Keep the raise small enough to match zero community reality',
    ],
  },
  {
    num: '08',
    label: 'Token Access Launch',
    status: 'UPCOMING',
    done: false,
    items: [
      'Deploy NYT and connect onchain access controls',
      'Switch beta users into real token access tiers',
      'Open founder allocation or strategic launch path if justified',
      'Only consider public trading after product demand is proven',
    ],
  },
  {
    num: '09',
    label: 'Staking And Governance',
    status: 'UPCOMING',
    done: false,
    items: [
      'Enable staking only after the token is live and reviewed',
      'Fund rewards from real revenue, not promises',
      'Introduce governance once there is an actual user base to govern',
      'Treat token utility as product infrastructure, not the whole story',
    ],
  },
  {
    num: '10',
    label: 'Expansion',
    status: 'UPCOMING',
    done: false,
    items: [
      'Go deeper on Base native wallet and contract intelligence',
      'Add enterprise API and monitoring packages',
      'Expand chain coverage only after Base distribution is working',
      'Earn the right to a bigger raise with product proof',
    ],
  },
];

export default function RoadmapPage() {
  const liveCount    = phases.filter(p => p.done).length;
  const currentPhase = phases.find(p => p.current);

  return (
    <div className="roadmap-page">

      <div className="rm-hero">
        <div className="rm-hero-tag">BASE FIRST ROLLOUT</div>
        <h1>Roadmap</h1>
        <p>Ten phases, paced for a real raise: working beta first, grants and pilots next, token infrastructure only after the story is credible.</p>
        <div className="rm-hero-stats">
          <div className="rm-hero-stat">
            <span className="rm-hero-num rm-green">{liveCount}</span>
            <span className="rm-hero-label">Phases Live</span>
          </div>
          <div className="rm-hero-stat">
            <span className="rm-hero-num rm-yellow">1</span>
            <span className="rm-hero-label">In Progress</span>
          </div>
          <div className="rm-hero-stat">
            <span className="rm-hero-num rm-muted">{phases.length - liveCount - 1}</span>
            <span className="rm-hero-label">Upcoming</span>
          </div>
        </div>
      </div>

      {currentPhase && (
        <div className="rm-current-banner">
          <div className="rm-current-dot" />
          <div>
            <span className="rm-current-label">CURRENTLY IN PHASE {currentPhase.num}:</span>
            <span className="rm-current-name"> {currentPhase.label}</span>
          </div>
        </div>
      )}

      <div className="rm-timeline">
        {phases.map((phase, idx) => (
          <div
            key={phase.num}
            className={`rm-item ${phase.done ? 'rm-done' : ''} ${phase.current ? 'rm-current' : ''}`}
          >
            {/* Connector line */}
            {idx < phases.length - 1 && (
              <div className={`rm-connector ${phase.done ? 'rm-connector-done' : ''}`} />
            )}

            <div className="rm-node">
              {phase.done ? (
                <div className="rm-dot rm-dot-done">✓</div>
              ) : phase.current ? (
                <div className="rm-dot rm-dot-current">
                  <div className="rm-pulse" />
                </div>
              ) : (
                <div className="rm-dot rm-dot-upcoming">{phase.num}</div>
              )}
            </div>

            <div className="rm-body">
              <div className="rm-head">
                <div className="rm-phase-num">PHASE {phase.num}</div>
                <div className="rm-phase-label">{phase.label}</div>
                <div className={`rm-status rm-status-${phase.done ? 'live' : phase.current ? 'progress' : 'upcoming'}`}>
                  {phase.status}
                </div>
              </div>
              <ul className="rm-items">
                {phase.items.map((item, i) => (
                  <li key={i}>
                    <span className={`rm-item-dot ${phase.done ? 'rm-item-dot-done' : phase.current ? 'rm-item-dot-current' : ''}`} />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ))}
      </div>

      <div className="rm-footer-note">
        Roadmap is subject to revision based on community feedback and market conditions.
        Completed phases are verifiable in the codebase and product, even before token deployment.
        Join @NythosAI on Telegram for live updates.
      </div>

    </div>
  );
}
