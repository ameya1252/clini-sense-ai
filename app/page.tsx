import Link from "next/link"
import { Button } from "@/components/ui/button"
import { DisclaimerBanner } from "@/components/disclaimer-banner"
import {
  Activity,
  Shield,
  Mic,
  FileText,
  Zap,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  Brain,
  Stethoscope,
  Lock,
  ChevronRight,
} from "lucide-react"

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col overflow-x-hidden">
      <DisclaimerBanner />

      {/* Navigation */}
      <nav className="sticky top-0 z-50 glass-panel border-b border-border/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-primary/10 border border-primary/20">
                <Activity className="h-5 w-5 text-primary" />
              </div>
              <span className="text-xl font-bold">
                <span className="text-primary">Clini</span>Sense
              </span>
            </Link>

            <div className="hidden md:flex items-center gap-8">
              <a href="#features" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Features
              </a>
              <a href="#how-it-works" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                How it works
              </a>
              <a href="#pricing" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Pricing
              </a>
            </div>

            <div className="flex items-center gap-3">
              <Button variant="ghost" size="sm" asChild className="hidden sm:inline-flex">
                <Link href="/login">Sign In</Link>
              </Button>
              <Button size="sm" asChild className="teal-glow-sm">
                <Link href="/dashboard">Get Started</Link>
              </Button>
            </div>
          </div>
        </div>
      </nav>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative py-20 sm:py-32 overflow-hidden">
          {/* Background effects */}
          <div className="absolute inset-0 grid-bg opacity-50" />
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />

          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-4xl mx-auto space-y-8">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-panel text-sm">
                <Sparkles className="h-4 w-4 text-primary" />
                <span className="text-muted-foreground">AI-Powered Clinical Support</span>
              </div>

              {/* Headline */}
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-balance">
                The AI copilot for <span className="text-primary">clinical consultations</span>
              </h1>

              {/* Subheadline */}
              <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto text-balance">
                Real-time transcription, intelligent insights, and automated SOAP notes. Spend less time documenting and
                more time with your patients.
              </p>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
                <Button size="lg" asChild className="teal-glow text-base px-8">
                  <Link href="/dashboard">
                    Start Free Trial
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
                <Button size="lg" variant="outline" asChild className="text-base px-8 bg-transparent">
                  <a href="#how-it-works">Watch Demo</a>
                </Button>
              </div>

              {/* Trust indicators */}
              <div className="flex flex-wrap items-center justify-center gap-6 pt-8 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-primary" />
                  <span>HIPAA Compliant</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-primary" />
                  <span>No diagnosis claims</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-primary" />
                  <span>Clinician-in-the-loop</span>
                </div>
              </div>
            </div>

            {/* Hero Image/Preview */}
            <div className="mt-16 relative">
              <div className="glass-panel rounded-2xl p-2 gradient-border-full max-w-5xl mx-auto">
                <div className="rounded-xl bg-background/80 overflow-hidden aspect-video flex items-center justify-center">
                  <div className="text-center space-y-4 p-8">
                    <div className="flex justify-center gap-4">
                      <div className="glass-panel rounded-lg p-4 animate-float" style={{ animationDelay: "0s" }}>
                        <Mic className="h-8 w-8 text-primary" />
                      </div>
                      <div className="glass-panel rounded-lg p-4 animate-float" style={{ animationDelay: "0.5s" }}>
                        <Brain className="h-8 w-8 text-primary" />
                      </div>
                      <div className="glass-panel rounded-lg p-4 animate-float" style={{ animationDelay: "1s" }}>
                        <FileText className="h-8 w-8 text-primary" />
                      </div>
                    </div>
                    <p className="text-muted-foreground">Live consultation dashboard preview</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="py-16 border-y border-border/50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {[
                { value: "50%", label: "Less documentation time" },
                { value: "99.2%", label: "Transcription accuracy" },
                { value: "<2s", label: "AI response latency" },
                { value: "24/7", label: "Availability" },
              ].map((stat, i) => (
                <div key={i} className="text-center">
                  <div className="text-3xl sm:text-4xl font-bold text-primary">{stat.value}</div>
                  <div className="text-sm text-muted-foreground mt-1">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-20 sm:py-32">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <h2 className="text-3xl sm:text-4xl font-bold mb-4">Everything you need for smarter consultations</h2>
              <p className="text-lg text-muted-foreground">
                Powerful AI tools designed with clinicians, for clinicians. Always keeping you in control.
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                {
                  icon: Mic,
                  title: "Live Transcription",
                  description:
                    "Real-time speech-to-text powered by Deepgram. Captures every detail of your consultation automatically.",
                },
                {
                  icon: Brain,
                  title: "AI Clinical Insights",
                  description:
                    "Extracts key symptoms, suggests follow-up questions, and identifies potential safety considerations.",
                },
                {
                  icon: Shield,
                  title: "Safety-First Design",
                  description:
                    "Built-in guardrails ensure AI never makes diagnosis claims or prescriptions. You're always in control.",
                },
                {
                  icon: FileText,
                  title: "Auto SOAP Notes",
                  description:
                    "Generate structured clinical documentation in seconds. Review, edit, and export to your EHR.",
                },
                {
                  icon: Zap,
                  title: "Real-Time Processing",
                  description:
                    "Sub-2-second latency for AI insights. Get relevant suggestions while the conversation is happening.",
                },
                {
                  icon: Lock,
                  title: "HIPAA Compliant",
                  description:
                    "Enterprise-grade security with end-to-end encryption. Your patient data stays protected.",
                },
              ].map((feature, i) => (
                <div key={i} className="glass-panel rounded-xl p-6 gradient-border card-hover group">
                  <div className="p-2 rounded-lg bg-primary/10 w-fit mb-4 group-hover:bg-primary/20 transition-colors">
                    <feature.icon className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                  <p className="text-muted-foreground text-sm">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section id="how-it-works" className="py-20 sm:py-32 bg-secondary/30">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <h2 className="text-3xl sm:text-4xl font-bold mb-4">How CliniSense works</h2>
              <p className="text-lg text-muted-foreground">Three simple steps to transform your clinical workflow</p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {[
                {
                  step: "01",
                  icon: Stethoscope,
                  title: "Start a consultation",
                  description:
                    "Click record and begin your patient consultation as normal. CliniSense listens and transcribes in real-time.",
                },
                {
                  step: "02",
                  icon: Sparkles,
                  title: "Get AI insights",
                  description:
                    "Receive intelligent suggestions for follow-up questions, key findings extraction, and safety alerts as you speak.",
                },
                {
                  step: "03",
                  icon: FileText,
                  title: "Export documentation",
                  description:
                    "Review and edit auto-generated SOAP notes. Export to FHIR-compliant JSON or download as PDF.",
                },
              ].map((item, i) => (
                <div key={i} className="relative">
                  <div className="glass-panel rounded-xl p-8 h-full">
                    <div className="text-5xl font-bold text-primary/20 mb-4">{item.step}</div>
                    <div className="p-2 rounded-lg bg-primary/10 w-fit mb-4">
                      <item.icon className="h-6 w-6 text-primary" />
                    </div>
                    <h3 className="text-xl font-semibold mb-2">{item.title}</h3>
                    <p className="text-muted-foreground">{item.description}</p>
                  </div>
                  {i < 2 && (
                    <div className="hidden md:block absolute top-1/2 -right-4 transform -translate-y-1/2 z-10">
                      <ChevronRight className="h-8 w-8 text-primary/30" />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Pricing Section */}
        <section id="pricing" className="py-20 sm:py-32">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <h2 className="text-3xl sm:text-4xl font-bold mb-4">Simple, transparent pricing</h2>
              <p className="text-lg text-muted-foreground">Start free and scale as you grow. No hidden fees.</p>
            </div>

            <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
              {/* Free Tier */}
              <div className="glass-panel rounded-xl p-8 gradient-border">
                <div className="text-sm text-muted-foreground mb-2">Starter</div>
                <div className="text-4xl font-bold mb-1">Free</div>
                <div className="text-sm text-muted-foreground mb-6">Forever</div>
                <ul className="space-y-3 mb-8">
                  {[
                    "5 consultations/month",
                    "Real-time transcription",
                    "Basic AI insights",
                    "SOAP note generation",
                  ].map((feature, i) => (
                    <li key={i} className="flex items-center gap-2 text-sm">
                      <CheckCircle2 className="h-4 w-4 text-primary shrink-0" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
                <Button variant="outline" className="w-full bg-transparent" asChild>
                  <Link href="/dashboard">Get Started</Link>
                </Button>
              </div>

              {/* Pro Tier */}
              <div className="glass-panel rounded-xl p-8 gradient-border-full relative teal-glow-sm">
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-primary text-primary-foreground text-xs font-medium">
                  Most Popular
                </div>
                <div className="text-sm text-primary mb-2">Professional</div>
                <div className="text-4xl font-bold mb-1">$49</div>
                <div className="text-sm text-muted-foreground mb-6">per month</div>
                <ul className="space-y-3 mb-8">
                  {[
                    "Unlimited consultations",
                    "Advanced AI insights",
                    "Priority transcription",
                    "EHR export (FHIR)",
                    "Team collaboration",
                    "Priority support",
                  ].map((feature, i) => (
                    <li key={i} className="flex items-center gap-2 text-sm">
                      <CheckCircle2 className="h-4 w-4 text-primary shrink-0" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
                <Button className="w-full teal-glow-sm" asChild>
                  <Link href="/dashboard">Start Free Trial</Link>
                </Button>
              </div>

              {/* Enterprise Tier */}
              <div className="glass-panel rounded-xl p-8 gradient-border">
                <div className="text-sm text-muted-foreground mb-2">Enterprise</div>
                <div className="text-4xl font-bold mb-1">Custom</div>
                <div className="text-sm text-muted-foreground mb-6">Contact us</div>
                <ul className="space-y-3 mb-8">
                  {[
                    "Everything in Pro",
                    "Custom integrations",
                    "Dedicated support",
                    "On-premise deployment",
                    "SLA guarantee",
                    "Custom training",
                  ].map((feature, i) => (
                    <li key={i} className="flex items-center gap-2 text-sm">
                      <CheckCircle2 className="h-4 w-4 text-primary shrink-0" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
                <Button variant="outline" className="w-full bg-transparent">
                  Contact Sales
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 sm:py-32 bg-secondary/30">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">Ready to transform your clinical workflow?</h2>
            <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
              Join hundreds of healthcare professionals using CliniSense to save time and improve patient care.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" asChild className="teal-glow text-base px-8">
                <Link href="/dashboard">
                  Start Your Free Trial
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild className="text-base px-8 bg-transparent">
                <a href="mailto:sales@clinisense.ai">Talk to Sales</a>
              </Button>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-border py-12 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
            <div className="col-span-2 md:col-span-1">
              <Link href="/" className="flex items-center gap-2 mb-4">
                <div className="p-1.5 rounded-lg bg-primary/10 border border-primary/20">
                  <Activity className="h-4 w-4 text-primary" />
                </div>
                <span className="text-lg font-bold">
                  <span className="text-primary">Clini</span>Sense
                </span>
              </Link>
              <p className="text-sm text-muted-foreground">
                AI-powered clinical decision support for modern healthcare.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-3">Product</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <a href="#features" className="hover:text-foreground transition-colors">
                    Features
                  </a>
                </li>
                <li>
                  <a href="#pricing" className="hover:text-foreground transition-colors">
                    Pricing
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-foreground transition-colors">
                    Security
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-3">Company</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <a href="#" className="hover:text-foreground transition-colors">
                    About
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-foreground transition-colors">
                    Blog
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-foreground transition-colors">
                    Careers
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-3">Legal</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <a href="#" className="hover:text-foreground transition-colors">
                    Privacy
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-foreground transition-colors">
                    Terms
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-foreground transition-colors">
                    HIPAA
                  </a>
                </li>
              </ul>
            </div>
          </div>
          <div className="pt-8 border-t border-border text-center text-sm text-muted-foreground">
            <p className="mb-2">
              CliniSense is a clinical decision support tool and does not provide medical diagnoses or prescriptions.
            </p>
            <p>&copy; {new Date().getFullYear()} CliniSense. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
