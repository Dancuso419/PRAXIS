import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Icon from '../components/Icon';
import HeroVisual from '../components/HeroVisual';

export default function LandingPage() {
  const { user } = useAuth();

  return (
    <div className="landing-page">
      {/* Navigation */}
      <nav className="landing-nav">
        <Link to="/" className="landing-nav-brand">
          <div className="landing-nav-logo">P</div>
          <span className="landing-nav-name">Praxis</span>
        </Link>
        <div className="landing-nav-links">
          <a href="#features">Features</a>
          <a href="#how-it-works">How It Works</a>
          {user ? (
            <Link to={user.role === 'STUDENT' ? '/dashboard' : '/admin'} className="btn btn-primary">
              Go to Dashboard
            </Link>
          ) : (
            <>
              <Link to="/login" className="btn btn-ghost">Login</Link>
              <Link to="/register" className="btn btn-primary">Get Started</Link>
            </>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <section className="landing-hero">
        <div className="landing-hero-text">
          <span className="landing-hero-badge">
            <Icon name="sparkles" size={14} /> Student Union Elections
          </span>
          <h1>
            Your Voice,<br />
            Your <span>Vote</span>,<br />
            Your Future.
          </h1>
          <p>
            Praxis is a secure, transparent, and easy-to-use e-voting platform built 
            for student unions. Cast your vote from anywhere, view real-time results, 
            and trust the process.
          </p>
          <div className="landing-hero-cta">
            <Link to="/register" className="btn btn-primary">Create Account</Link>
            <a href="#features" className="btn btn-secondary">Learn More</a>
          </div>
        </div>
        <div className="landing-hero-visual">
          <HeroVisual />
        </div>
      </section>

      {/* Features Section */}
      <section className="landing-features" id="features">
        <div className="landing-features-inner">
          <div className="landing-section-title">
            <h2>Why Choose Praxis?</h2>
            <p>
              Built with integrity, transparency, and accessibility at its core.
            </p>
          </div>
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon feature-icon-blue"><Icon name="shield" size={26} /></div>
              <h3>Secure & Private</h3>
              <p>
                End-to-end encrypted votes with tamper-proof receipt hashes. 
                Your ballot remains confidential and verifiable.
              </p>
            </div>
            <div className="feature-card">
              <div className="feature-icon feature-icon-green"><Icon name="barChart" size={26} /></div>
              <h3>Real-Time Results</h3>
              <p>
                Once polls close and results are published, view accurate 
                tallies instantly — no delays, no disputes.
              </p>
            </div>
            <div className="feature-card">
              <div className="feature-icon feature-icon-yellow"><Icon name="zap" size={26} /></div>
              <h3>Easy Management</h3>
              <p>
                Election officers can create elections, manage candidates, 
                and publish results all from one dashboard.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="landing-how" id="how-it-works">
        <div className="landing-section-title">
          <h2>How It Works</h2>
          <p>Three simple steps to make your voice heard.</p>
        </div>
        <div className="how-steps">
          <div className="how-step">
            <div className="how-step-number">1</div>
            <h3>Register & Verify</h3>
            <p>
              Sign up with your institutional email and matric number. 
              Verify your account to unlock voting access.
            </p>
          </div>
          <div className="how-step">
            <div className="how-step-number">2</div>
            <h3>Browse & Choose</h3>
            <p>
              Explore active elections, read candidate manifestos, 
              and make an informed decision.
            </p>
          </div>
          <div className="how-step">
            <div className="how-step-number">3</div>
            <h3>Vote & Verify</h3>
            <p>
              Cast your vote securely and receive a unique receipt hash 
              to verify your ballot was counted.
            </p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="landing-cta">
        <h2>Ready to Make Your Vote Count?</h2>
        <p>Join thousands of students who trust Praxis for fair, transparent elections.</p>
        <Link to="/register" className="btn">Get Started — It's Free</Link>
      </section>

      {/* Footer */}
      <footer className="landing-footer">
        <p>© {new Date().getFullYear()} Praxis — Student Union E-Voting Platform. All rights reserved.</p>
      </footer>
    </div>
  );
}
