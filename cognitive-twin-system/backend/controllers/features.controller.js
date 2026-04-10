// ── GET /api/features ────────────────────────────────────────────────────────
exports.getFeatures = async (req, res) => {
  const features = [
    {
      id: 1,
      key: 'cognitive-profile',
      title: 'Cognitive Profile',
      subtitle: 'Your mental fingerprint',
      icon: '🧠',
      description: 'A personalized cognitive fingerprint built from your thinking patterns, preferences, and behaviour — a living model of how your mind works.',
      metrics: [
        { label: 'Analytical',    value: 87, color: '#6366f1' },
        { label: 'Creativity',    value: 74, color: '#8b5cf6' },
        { label: 'Focus',         value: 91, color: '#06b6d4' },
        { label: 'Adaptability',  value: 68, color: '#10b981' },
      ],
    },
    {
      id: 2,
      key: 'twin-chat',
      title: 'Twin Chat Interface',
      subtitle: 'Chat with your second self',
      icon: '💬',
      description: 'Converse with an AI that mirrors your cognitive style, communication patterns, and decision-making tendencies — your digital alter ego.',
      sample: [
        { role: 'user',  text: 'How would I approach this system design problem?' },
        { role: 'twin',  text: 'Given your preference for microservices, I\'d start by breaking the domain into bounded contexts...' },
      ],
    },
    {
      id: 3,
      key: 'visualization',
      title: 'Cognitive Visualization',
      subtitle: 'See your mind mapped',
      icon: '📊',
      description: 'A living visual map of your mind. Includes radar charts across 6 thinking dimensions, word clouds of mental models, and decision pattern timelines.',
      tags: ['Radar Chart', 'Word Cloud', 'Pattern Map', 'Blind Spots'],
    },
    {
      id: 4,
      key: 'decision-shadow',
      title: 'Decision Shadow',
      subtitle: 'Predict your next move',
      icon: '🔮',
      description: 'Feed a dilemma or scenario and receive a prediction of how your cognitive twin would reason through it, step by step.',
      placeholder: 'Describe a decision you\'re facing...',
    },
    {
      id: 5,
      key: 'blind-spot',
      title: 'Blind Spot Detector',
      subtitle: 'Know your cognitive gaps',
      icon: '🎯',
      description: 'Analyses your patterns to surface hidden biases, overconfidence areas, and logical gaps you consistently miss.',
      blindspots: [
        { label: 'Confirmation Bias',   level: 'Moderate', color: '#f59e0b' },
        { label: 'Recency Bias',        level: 'Low',      color: '#10b981' },
        { label: 'Availability Heuristic', level: 'High',  color: '#ef4444' },
        { label: 'Anchoring Effect',    level: 'Moderate', color: '#f59e0b' },
      ],
    },
    {
      id: 6,
      key: 'twin-to-twin',
      title: 'Twin-to-Twin Simulation',
      subtitle: 'Simulate reality before living it',
      icon: '👥',
      description: 'Feed two different cognitive profiles and a scenario. Watch how their conversation, debate, or collaboration would unfold before it happens.',
    },
    {
      id: 7,
      key: 'persona-clones',
      title: 'Titan Clones',
      subtitle: 'Consult with legendary minds',
      icon: '🏛️',
      description: 'Interact with high-fidelity cognitive clones of legendary leaders, scientists, and visionaries. Bounce ideas off Elon Musk, Steve Jobs, Dr. APJ Abdul Kalam, and more.',
    },
    {
      id: 8,
      key: 'cognitive-will',
      title: 'Cognitive Will',
      subtitle: 'A sacred legacy',
      icon: '📜',
      description: 'Deliberately record your most important mental models, life lessons, and values. Packaged as a permanent legacy document your twin carries forever.',
    },
    {
      id: 9,
      key: 'collective-intelligence',
      title: 'Collective Intelligence',
      subtitle: 'Group mind simulation',
      icon: '🌐',
      description: 'Combine cognitive twins from a team to identify collective blind spots, unified reasoning outputs, and organizational thinking patterns.',
    },
  ]

  res.json({ success: true, features })
}
