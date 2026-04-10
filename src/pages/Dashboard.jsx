import { motion } from 'framer-motion'
import { Lightbulb, Target, Heart, ArrowRight } from 'lucide-react'
import Header from '../components/Header'
import './Dashboard.css'

export default function Dashboard() {
  const userData = JSON.parse(localStorage.getItem('ct_user') || '{}');
  const userName = userData.name?.split(' ')[0] || 'User';
  const onboarding = userData.onboardingData || {};
  
  const greeting = `Good ${new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 18 ? 'afternoon' : 'evening'}, ${userName}`

  // Derive REAL insights based on their onboarding choices
  const getProblemSolvingInsight = () => {
    const approach = onboarding.answers?.problemSolving;
    if (approach === 'analytical') return "You prefer breaking problems into logical steps. This structural clarity is a major strength.";
    if (approach === 'intuitive') return "You trust your gut and iterate quickly. This speed-of-thought allows for faster discovery.";
    if (approach === 'collaborative') return "You leverage the wisdom of the group. Collective intelligence is your primary feedback loop.";
    return "You have a balanced approach to complex challenges. Continue refining your mental framework.";
  };

  const getLearningInsight = () => {
    const style = onboarding.answers?.learningStyle;
    if (style === 'visual') return "Visual clarity matters most. Use your twin to diagram complex thoughts.";
    if (style === 'reading') return "Reading and documentation are your pillars. Your twin will prioritize deep references.";
    if (style === 'hands-on') return "Learning by building is your edge. Your twin will focus on practical implementation.";
    return "You are adaptable in how you acquire new knowledge.";
  };

  const insights = [
    {
      title: "Problem Solving Strategy",
      description: getProblemSolvingInsight(),
      icon: Lightbulb
    },
    {
      title: "Your Learning Edge",
      description: getLearningInsight(),
      icon: Heart
    },
    {
      title: "Immediate Vision",
      description: onboarding.aboutMe ? `Based on your goal: "${onboarding.aboutMe.substring(0, 100)}..." continue mapping your milestones.` : "Complete your vision mapping to see deeper neural insights.",
      icon: Target
    }
  ]

  // Convert REAL communication samples into "Memories"
  const recentMemories = (onboarding.samples || []).slice(0, 3).map((s, i) => ({
    title: `Communication Fragment ${i + 1}`,
    snippet: `"${s}"`,
    when: "Saved during onboarding"
  }));

  // Fallback if no samples
  if (recentMemories.length === 0) {
    recentMemories.push({
      title: "Mental Model Initialization",
      snippet: onboarding.aboutMe ? "Your core background has been ingested into the memory bank." : "Start chatting to build your first cognitive memories.",
      when: "Just now"
    });
  }

  return (
    <div className="page dashboard-page">
      <Header
        title="Your Space"
        subtitle={`${new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })} — Thinking clearly`}
      />

      <div className="dashboard-body">
        {/* Welcome Section */}
        <motion.section
          className="welcome-section"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h2>{greeting}.</h2>
          <p>
            You've been consistent with your reflections. Keep thinking, keep learning, keep building.
            Here's what stands out from our conversations.
          </p>
        </motion.section>

        {/* Insights Grid */}
        <section className="insights-section">
          {insights.map((insight, idx) => {
            const Icon = insight.icon
            return (
              <motion.div
                key={idx}
                className="insight-card"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
              >
                <div className="insight-icon">
                  <Icon size={20} />
                </div>
                <h3>{insight.title}</h3>
                <p>{insight.description}</p>
              </motion.div>
            )
          })}
        </section>

        {/* Recent Learnings */}
        <section className="memories-section">
          <h3>Things I've learned about you</h3>
          <div className="memories-list">
            {recentMemories.map((mem, idx) => (
              <motion.div
                key={idx}
                className="memory-item"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4, delay: idx * 0.08 }}
              >
                <div className="memory-dot"></div>
                <div className="memory-content">
                  <h4>{mem.title}</h4>
                  <p>{mem.snippet}</p>
                  <span className="memory-when">{mem.when}</span>
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Call to Action */}
        <motion.section
          className="cta-section"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <div className="cta-card">
            <h3>Ready to think?</h3>
            <p>Let's talk through what's on your mind. No judgment, just thinking out loud together.</p>
            <a href="/chat" className="cta-button">
              Open Chat
              <ArrowRight size={16} />
            </a>
          </div>
        </motion.section>
      </div>
      
      <footer className="neural-footer">
        <span>Note: This twin is a digital reflection of your cognitive patterns. It provides insights for reflection and brainstorming, but cannot make real-world decisions on your behalf.</span>
      </footer>
    </div>
  )
}
