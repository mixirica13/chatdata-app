import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Logo } from '@/components/Logo';
import { useAuth } from '@/hooks/useAuth';
import {
  Bot,
  BarChart3,
  Zap,
  Shield,
  MessageSquare,
  TrendingUp,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  LayoutDashboard,
  Database,
  Globe
} from 'lucide-react';
import { useTracking } from '@/hooks/useTracking';

// Header Section
const Header = () => {
  const { isAuthenticated } = useAuth();

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
      <div className="w-full max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
        <div className="flex-1">
          <Link to="/">
            <Logo className="h-12 w-auto" />
          </Link>
        </div>

        <nav className="hidden md:flex items-center justify-center gap-6 flex-1">
          <a href="#features" className="text-muted-foreground hover:text-foreground transition-colors">Features</a>
          <a href="#how-it-works" className="text-muted-foreground hover:text-foreground transition-colors">How It Works</a>
          <a href="#pricing" className="text-muted-foreground hover:text-foreground transition-colors">Pricing</a>
          <a href="#faq" className="text-muted-foreground hover:text-foreground transition-colors">FAQ</a>
        </nav>

        <div className="flex-1 flex justify-end">
          {isAuthenticated ? (
            <Link to="/dashboard">
              <Button className="bg-primary hover:bg-primary/90 text-primary-foreground">
                Dashboard
              </Button>
            </Link>
          ) : (
            <Link to="/login">
              <Button className="bg-primary hover:bg-primary/90 text-primary-foreground">
                Sign In
              </Button>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
};

// Hero Section
const HeroSection = () => {
  return (
    <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-background to-primary/5" />

      {/* Animated grid */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(70,204,198,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(70,204,198,0.03)_1px,transparent_1px)] bg-[size:50px_50px]" />

      <div className="relative z-10 max-w-6xl mx-auto px-4 text-center">
        <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 rounded-full px-4 py-2 mb-8">
          <Sparkles className="w-4 h-4 text-primary" />
          <span className="text-sm text-primary">MCP Protocol Compatible</span>
        </div>

        <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-white via-primary/90 to-white bg-clip-text text-transparent">
          Meta Ads MCP Server
        </h1>

        <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-3xl mx-auto">
          Connect your favorite AI assistant to your Meta Ads data.
          Query campaigns, get insights, and optimize performance using natural language.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
          <Link to="/register">
            <Button size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground text-lg px-8 py-6">
              Connect Meta Ads
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </Link>
          <a href="#how-it-works">
            <Button size="lg" variant="outline" className="text-lg px-8 py-6 border-border hover:bg-muted">
              See How It Works
            </Button>
          </a>
        </div>

        {/* Logos of supported platforms */}
        <div className="flex flex-wrap items-center justify-center gap-8 text-muted-foreground">
          <div className="flex items-center gap-2">
            <Bot className="w-6 h-6" />
            <span className="text-sm">Claude Desktop</span>
          </div>
          <div className="flex items-center gap-2">
            <MessageSquare className="w-6 h-6" />
            <span className="text-sm">Claude.ai</span>
          </div>
          <div className="flex items-center gap-2">
            <Sparkles className="w-6 h-6" />
            <span className="text-sm">ChatGPT</span>
          </div>
          <div className="flex items-center gap-2">
            <Globe className="w-6 h-6" />
            <span className="text-sm">Any MCP Client</span>
          </div>
        </div>
      </div>
    </section>
  );
};

// Features Section
const FeaturesSection = () => {
  const features = [
    {
      icon: MessageSquare,
      title: 'Natural Language Queries',
      description: 'Ask questions about your campaigns in plain English. No complex interfaces or reports to navigate.',
    },
    {
      icon: BarChart3,
      title: 'Real-time Insights',
      description: 'Get up-to-date metrics on spend, ROAS, CTR, and more. All your campaign data at your fingertips.',
    },
    {
      icon: Zap,
      title: 'Instant Answers',
      description: 'Skip the Meta Ads Manager. Get the data you need in seconds through your AI assistant.',
    },
    {
      icon: Shield,
      title: 'Secure Connection',
      description: 'OAuth 2.0 authentication with Meta. Your credentials are never stored on our servers.',
    },
    {
      icon: Database,
      title: 'Multiple Ad Accounts',
      description: 'Connect and query multiple ad accounts. Perfect for agencies managing multiple clients.',
    },
    {
      icon: TrendingUp,
      title: 'Performance Analysis',
      description: 'Get AI-powered analysis and recommendations to improve your campaign performance.',
    },
  ];

  return (
    <section className="py-24 px-4" id="features">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold mb-4">Why Use MCP for Meta Ads?</h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            The Model Context Protocol lets AI assistants interact with your data directly.
            No more copy-pasting or manual exports.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <Card key={index} className="bg-card border-border hover:border-primary/50 transition-colors">
              <CardContent className="p-6">
                <feature.icon className="w-12 h-12 text-primary mb-4" />
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

// How It Works Section
const HowItWorksSection = () => {
  const steps = [
    {
      number: '01',
      title: 'Connect Your Meta Account',
      description: 'Securely authorize access to your Meta Ads data using OAuth. Takes less than a minute.',
    },
    {
      number: '02',
      title: 'Add the MCP Server',
      description: 'Copy your unique MCP server URL and add it to Claude Desktop, Claude.ai, or any MCP-compatible client.',
    },
    {
      number: '03',
      title: 'Start Asking Questions',
      description: 'Query your campaigns naturally. "What\'s my best performing campaign this week?" - It\'s that simple.',
    },
  ];

  return (
    <section className="py-24 px-4 bg-gradient-to-b from-transparent via-primary/5 to-transparent" id="how-it-works">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold mb-4">How It Works</h2>
          <p className="text-xl text-muted-foreground">Get started in three simple steps</p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {steps.map((step, index) => (
            <div key={index} className="relative">
              <div className="text-7xl font-bold text-primary/20 mb-4">{step.number}</div>
              <h3 className="text-2xl font-semibold mb-3">{step.title}</h3>
              <p className="text-muted-foreground">{step.description}</p>
              {index < steps.length - 1 && (
                <ArrowRight className="hidden md:block absolute top-1/2 -right-4 w-8 h-8 text-primary/30" />
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

// Example Queries Section
const ExampleQueriesSection = () => {
  const examples = [
    "What's my total spend this month across all campaigns?",
    "Show me the top 5 campaigns by ROAS in the last 7 days",
    "Which ad sets have a CPA above $50?",
    "Compare performance of Campaign A vs Campaign B",
    "What's my average CTR for prospecting campaigns?",
    "List all active campaigns with their daily budgets",
  ];

  return (
    <section className="py-24 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold mb-4">Example Queries</h2>
          <p className="text-xl text-muted-foreground">Just ask naturally - the AI understands context</p>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          {examples.map((example, index) => (
            <div
              key={index}
              className="flex items-center gap-3 bg-card border border-border rounded-lg p-4 hover:border-primary/50 transition-colors"
            >
              <MessageSquare className="w-5 h-5 text-primary flex-shrink-0" />
              <span className="text-muted-foreground">{example}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

// Dashboard Section
const DashboardSection = () => {
  const features = [
    'Drag and drop widgets',
    'Customize your metrics',
    'Real-time data updates',
    'Multiple layout options',
    'Save custom views',
    'Export reports',
  ];

  return (
    <section className="py-24 px-4 bg-gradient-to-b from-transparent via-primary/5 to-transparent" id="dashboard">
      <div className="max-w-6xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 rounded-full px-4 py-2 mb-6">
              <LayoutDashboard className="w-4 h-4 text-primary" />
              <span className="text-sm text-primary">Included Free</span>
            </div>

            <h2 className="text-4xl font-bold mb-6">Customizable Dashboard</h2>
            <p className="text-xl text-muted-foreground mb-8">
              Beyond MCP, you also get access to a beautiful, customizable dashboard
              to visualize your Meta Ads performance your way.
            </p>

            <ul className="space-y-3">
              {features.map((feature, index) => (
                <li key={index} className="flex items-center gap-3">
                  <CheckCircle2 className="w-5 h-5 text-primary" />
                  <span className="text-muted-foreground">{feature}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="relative">
            {/* Dashboard mockup */}
            <div className="bg-card border border-border rounded-xl p-6 shadow-2xl">
              <div className="flex items-center gap-2 mb-6">
                <div className="w-3 h-3 rounded-full bg-red-500" />
                <div className="w-3 h-3 rounded-full bg-yellow-500" />
                <div className="w-3 h-3 rounded-full bg-green-500" />
              </div>

              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="bg-muted rounded-lg p-4">
                  <div className="text-sm text-muted-foreground mb-1">Total Spend</div>
                  <div className="text-2xl font-bold text-foreground">$12,450</div>
                  <div className="text-sm text-primary">+12.5%</div>
                </div>
                <div className="bg-muted rounded-lg p-4">
                  <div className="text-sm text-muted-foreground mb-1">ROAS</div>
                  <div className="text-2xl font-bold text-foreground">3.2x</div>
                  <div className="text-sm text-primary">+8.3%</div>
                </div>
              </div>

              <div className="bg-muted rounded-lg p-4 h-32 flex items-end gap-2">
                {[40, 65, 45, 80, 55, 90, 70].map((height, i) => (
                  <div
                    key={i}
                    className="flex-1 bg-primary rounded-t"
                    style={{ height: `${height}%` }}
                  />
                ))}
              </div>
            </div>

            {/* Decorative elements */}
            <div className="absolute -z-10 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
          </div>
        </div>
      </div>
    </section>
  );
};

// Pricing Section
const PricingSection = () => {
  return (
    <section className="py-24 px-4" id="pricing">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold mb-4">Simple Pricing</h2>
          <p className="text-xl text-muted-foreground">One plan, everything included</p>
        </div>

        <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/30 max-w-lg mx-auto">
          <CardContent className="p-8">
            <div className="text-center mb-8">
              <div className="inline-flex items-center gap-2 bg-primary/20 rounded-full px-4 py-1 mb-4">
                <Sparkles className="w-4 h-4 text-primary" />
                <span className="text-sm text-primary">Most Popular</span>
              </div>
              <h3 className="text-2xl font-bold mb-2">Chatdata MCP</h3>
              <div className="text-5xl font-bold mb-2">$10<span className="text-xl text-muted-foreground">/month</span></div>
              <p className="text-muted-foreground">Everything you need to supercharge your Meta Ads workflow</p>
            </div>

            <ul className="space-y-4 mb-8">
              {[
                'Remote MCP Server Access',
                'Claude Desktop Integration',
                'Claude.ai Integration',
                'ChatGPT Integration',
                'Meta Ads Queries via AI',
                'Real-time Campaign Insights',
                'Customizable Dashboard',
                'Unlimited Requests',
              ].map((feature, index) => (
                <li key={index} className="flex items-center gap-3">
                  <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0" />
                  <span className="text-muted-foreground">{feature}</span>
                </li>
              ))}
            </ul>

            <Link to="/register" className="block">
              <Button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground text-lg py-6">
                Connect Meta Ads
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </section>
  );
};

// FAQ Section
const FAQSection = () => {
  const faqs = [
    {
      question: 'What is MCP (Model Context Protocol)?',
      answer: 'MCP is an open protocol that allows AI assistants like Claude to securely connect to external data sources. It enables natural language interactions with your data.',
    },
    {
      question: 'Which AI assistants are supported?',
      answer: 'Currently, we support Claude Desktop, Claude.ai, ChatGPT, and any other MCP-compatible client. More integrations are being added regularly.',
    },
    {
      question: 'Is my Meta Ads data secure?',
      answer: 'Yes. We use OAuth 2.0 for authentication with Meta. Your credentials are never stored on our servers. All data is encrypted in transit.',
    },
    {
      question: 'Can I connect multiple ad accounts?',
      answer: 'Yes! You can connect and query multiple Meta ad accounts. Perfect for agencies or businesses managing multiple brands.',
    },
    {
      question: 'What data can I query?',
      answer: 'You can query campaigns, ad sets, ads, and their performance metrics including spend, impressions, clicks, conversions, ROAS, CPA, and more.',
    },
  ];

  return (
    <section className="py-24 px-4" id="faq">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold mb-4">Frequently Asked Questions</h2>
        </div>

        <div className="space-y-6">
          {faqs.map((faq, index) => (
            <div key={index} className="bg-card border border-border rounded-lg p-6">
              <h3 className="text-lg font-semibold mb-2">{faq.question}</h3>
              <p className="text-muted-foreground">{faq.answer}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

// CTA Section
const CTASection = () => {
  return (
    <section className="py-24 px-4">
      <div className="max-w-4xl mx-auto text-center">
        <div className="bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20 rounded-2xl p-12">
          <h2 className="text-4xl font-bold mb-4">Ready to Transform Your Workflow?</h2>
          <p className="text-xl text-muted-foreground mb-8">
            Stop switching between tabs. Start asking questions.
          </p>
          <Link to="/register">
            <Button size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground text-lg px-8 py-6">
              Connect Meta Ads
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
};

// Footer
const FooterSection = () => {
  return (
    <footer className="py-12 px-4 border-t border-border">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2">
            <Bot className="w-6 h-6 text-primary" />
            <span className="text-xl font-bold">Chatdata MCP</span>
          </div>

          <div className="flex gap-6 text-sm text-muted-foreground">
            <Link to="/terms" className="hover:text-foreground transition-colors">Terms of Service</Link>
            <Link to="/privacy" className="hover:text-foreground transition-colors">Privacy Policy</Link>
            <Link to="/data-deletion" className="hover:text-foreground transition-colors">Data Deletion</Link>
          </div>

          <div className="text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} Chatdata. All rights reserved.
          </div>
        </div>
      </div>
    </footer>
  );
};

// Main Landing Page Component
const LandingPageMCP2 = () => {
  const { trackPageView } = useTracking();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const utmSource = params.get('utm_source') || undefined;
    const utmMedium = params.get('utm_medium') || undefined;
    const utmCampaign = params.get('utm_campaign') || undefined;

    trackPageView('landing_page_mcp2', {
      page_version: 'mcp2',
      utm_source: utmSource,
      utm_medium: utmMedium,
      utm_campaign: utmCampaign,
    });
  }, [trackPageView]);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />
      <div className="pt-16"> {/* Offset for fixed header */}
        <HeroSection />
        <FeaturesSection />
        <HowItWorksSection />
        <ExampleQueriesSection />
        <DashboardSection />
        <PricingSection />
        <FAQSection />
        <CTASection />
        <FooterSection />
      </div>
    </div>
  );
};

export default LandingPageMCP2;
