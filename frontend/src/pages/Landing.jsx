import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { ImageWithFallback } from '../components/ImageWithFallback';
import {
  ArrowRight,
  Search,
  Shield,
  Zap,
  Globe,
  Lock,
  TrendingUp,
  Monitor,
  UserPlus,
  Briefcase,
  ShieldAlert,
  Code,
  Bug,
  Network,
  Eye,
  Database,
  Twitter,
  Linkedin,
  Github,
  Mail,
} from 'lucide-react';

export default function Landing() {
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/jobs?search=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      navigate('/jobs');
    }
  };
  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <div className="max-w-2xl">
              <div className="inline-block px-4 py-1 bg-indigo-50 text-indigo-600 rounded-full mb-6">
                🔒 Secure Your Future in Cybersecurity
              </div>

              <h1 className="text-5xl font-bold text-gray-900 mb-6">
                Connect with Top Cybersecurity Opportunities
              </h1>

              <p className="text-xl text-gray-600 mb-8">
                Bugbear is the premier platform connecting cybersecurity professionals with remote
                opportunities. Find your next role or hire top talent to protect what matters most.
              </p>

              {/* Search Bar */}
              <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3 mb-8">
                <div className="flex-1 relative">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search jobs by name, company, or tag (e.g., Penetration Tester, Microsoft, Python)"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:border-transparent"
                  />
                </div>
                <Button
                  type="submit"
                  className="bg-indigo-600 hover:bg-indigo-700 px-8 h-[50px]"
                >
                  Search Jobs
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </form>

              {/* Quick Stats */}
              <div className="flex flex-wrap gap-8">
                <div>
                  <div className="text-2xl font-bold text-gray-900">500+</div>
                  <div className="text-gray-600">Active Jobs</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-gray-900">200+</div>
                  <div className="text-gray-600">Companies</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-gray-900">10k+</div>
                  <div className="text-gray-600">Professionals</div>
                </div>
              </div>
            </div>

            {/* Right Image */}
            <div className="relative">
              <div className="relative rounded-2xl overflow-hidden shadow-2xl">
                <ImageWithFallback
                  src="https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=800&q=80"
                  alt="Cybersecurity professional"
                  className="w-full h-auto"
                />
              </div>
              {/* Floating Card */}
              <div className="absolute -bottom-6 -left-6 bg-white p-6 rounded-xl shadow-lg border border-gray-100">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                    <span className="text-green-600 text-xl">✓</span>
                  </div>
                  <div>
                    <div className="text-gray-900 font-semibold">Remote First</div>
                    <div className="text-gray-600 text-sm">Work from anywhere</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Statistics Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gray-900">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="text-4xl font-bold text-indigo-400 mb-2">500+</div>
              <div className="text-gray-400">Active Jobs</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-indigo-400 mb-2">95%</div>
              <div className="text-gray-400">Remote Positions</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-indigo-400 mb-2">48h</div>
              <div className="text-gray-400">Average Response Time</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-indigo-400 mb-2">100%</div>
              <div className="text-gray-400">Vetted Companies</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Why Choose Bugbear?</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              We've built the most trusted platform for cybersecurity professionals and companies
              to connect, collaborate, and grow together.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="p-6 rounded-xl border border-gray-200 hover:border-indigo-300 hover:shadow-lg transition-all">
              <div className="w-12 h-12 bg-indigo-50 rounded-lg flex items-center justify-center mb-4">
                <Shield className="h-6 w-6 text-indigo-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Verified Companies</h3>
              <p className="text-gray-600">
                All companies are thoroughly vetted to ensure legitimate opportunities and safe work
                environments.
              </p>
            </div>

            <div className="p-6 rounded-xl border border-gray-200 hover:border-indigo-300 hover:shadow-lg transition-all">
              <div className="w-12 h-12 bg-indigo-50 rounded-lg flex items-center justify-center mb-4">
                <Globe className="h-6 w-6 text-indigo-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">100% Remote</h3>
              <p className="text-gray-600">
                Work from anywhere in the world. All positions are fully remote with flexible
                schedules.
              </p>
            </div>

            <div className="p-6 rounded-xl border border-gray-200 hover:border-indigo-300 hover:shadow-lg transition-all">
              <div className="w-12 h-12 bg-indigo-50 rounded-lg flex items-center justify-center mb-4">
                <Monitor className="h-6 w-6 text-indigo-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Instant Workspaces</h3>
              <p className="text-gray-600">
                Get VDI access immediately upon job approval to start working without any delays.
              </p>
            </div>

            <div className="p-6 rounded-xl border border-gray-200 hover:border-indigo-300 hover:shadow-lg transition-all">
              <div className="w-12 h-12 bg-indigo-50 rounded-lg flex items-center justify-center mb-4">
                <Lock className="h-6 w-6 text-indigo-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Secure Platform</h3>
              <p className="text-gray-600">
                Your data is protected with enterprise-grade security. Privacy is our priority.
              </p>
            </div>

            <div className="p-6 rounded-xl border border-gray-200 hover:border-indigo-300 hover:shadow-lg transition-all">
              <div className="w-12 h-12 bg-indigo-50 rounded-lg flex items-center justify-center mb-4">
                <Zap className="h-6 w-6 text-indigo-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Fast Matching</h3>
              <p className="text-gray-600">
                Our AI-powered system matches you with relevant opportunities in real-time.
              </p>
            </div>

            <div className="p-6 rounded-xl border border-gray-200 hover:border-indigo-300 hover:shadow-lg transition-all">
              <div className="w-12 h-12 bg-indigo-50 rounded-lg flex items-center justify-center mb-4">
                <TrendingUp className="h-6 w-6 text-indigo-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Career Growth</h3>
              <p className="text-gray-600">
                Access resources, training, and mentorship to advance your cybersecurity career.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">How It Works</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Getting started is simple. Follow these four steps to launch your cybersecurity
              career.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                icon: UserPlus,
                title: 'Create Your Profile',
                description:
                  'Sign up and build your professional profile with your skills, certifications, and experience.',
                color: 'bg-blue-50 text-blue-600',
              },
              {
                icon: Search,
                title: 'Browse Opportunities',
                description:
                  'Explore hundreds of cybersecurity jobs from vetted companies looking for remote talent.',
                color: 'bg-purple-50 text-purple-600',
              },
              {
                icon: Monitor,
                title: 'Apply & Get Assigned VDI',
                description:
                  'Submit your application and get instant VDI access upon approval to start working immediately.',
                color: 'bg-green-50 text-green-600',
              },
              {
                icon: Briefcase,
                title: 'Start Working',
                description:
                  'Get hired and start working remotely on exciting cybersecurity projects worldwide.',
                color: 'bg-indigo-50 text-indigo-600',
              },
            ].map((step, index) => (
              <div key={index} className="relative">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 h-full">
                  <div
                    className={`w-12 h-12 ${step.color} rounded-lg flex items-center justify-center mb-4`}
                  >
                    <step.icon className="h-6 w-6" />
                  </div>

                  <div className="absolute -top-3 -left-3 w-8 h-8 bg-indigo-600 text-white rounded-full flex items-center justify-center font-bold">
                    {index + 1}
                  </div>

                  <h3 className="text-xl font-semibold text-gray-900 mb-2">{step.title}</h3>
                  <p className="text-gray-600">{step.description}</p>
                </div>

                {index < 3 && (
                  <div className="hidden lg:block absolute top-1/2 -right-6 transform -translate-y-1/2 z-10">
                    <ArrowRight className="h-6 w-6 text-indigo-400" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Job Categories Section */}
      <section id="categories" className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-end mb-12">
            <div>
              <h2 className="text-4xl font-bold text-gray-900 mb-4">Browse by Category</h2>
              <p className="text-lg text-gray-600">Find opportunities in your area of expertise</p>
            </div>
            <Link to="/jobs">
              <Button
                variant="ghost"
                className="hidden sm:flex items-center gap-2 text-indigo-600 hover:text-indigo-700"
              >
                View All Categories
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                icon: ShieldAlert,
                title: 'Penetration Testing',
                jobs: 127,
                color: 'bg-indigo-50 text-indigo-600',
              },
              {
                icon: Code,
                title: 'Security Engineering',
                jobs: 94,
                color: 'bg-blue-50 text-blue-600',
              },
              {
                icon: Bug,
                title: 'Bug Bounty Hunting',
                jobs: 56,
                color: 'bg-purple-50 text-purple-600',
              },
              {
                icon: Network,
                title: 'Network Security',
                jobs: 73,
                color: 'bg-green-50 text-green-600',
              },
              {
                icon: Eye,
                title: 'Security Analysis',
                jobs: 89,
                color: 'bg-orange-50 text-orange-600',
              },
              {
                icon: Database,
                title: 'Cloud Security',
                jobs: 112,
                color: 'bg-cyan-50 text-cyan-600',
              },
            ].map((category, index) => (
              <Link
                key={index}
                to="/jobs"
                className="p-6 rounded-xl border border-gray-200 hover:border-indigo-300 hover:shadow-lg transition-all text-left group block"
              >
                <div className="flex items-start justify-between mb-4">
                  <div
                    className={`w-12 h-12 ${category.color} rounded-lg flex items-center justify-center`}
                  >
                    <category.icon className="h-6 w-6" />
                  </div>
                  <ArrowRight className="h-5 w-5 text-gray-400 group-hover:text-indigo-600 group-hover:translate-x-1 transition-all" />
                </div>

                <h3 className="text-xl font-semibold text-gray-900 mb-1">{category.title}</h3>
                <p className="text-gray-600">{category.jobs} open positions</p>
              </Link>
            ))}
          </div>

          <div className="mt-8 sm:hidden">
            <Link to="/jobs">
              <Button
                variant="ghost"
                className="w-full flex items-center justify-center gap-2 text-indigo-600 hover:text-indigo-700"
              >
                View All Categories
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-gray-900 to-gray-800">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold text-white mb-6">
            Ready to Start Your Cybersecurity Journey?
          </h2>
          <p className="text-lg text-gray-300 mb-8 max-w-2xl mx-auto">
            Join thousands of cybersecurity professionals who have found their dream remote jobs
            through Bugbear. Your next opportunity is just a click away.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/register">
              <Button className="bg-indigo-600 hover:bg-indigo-700 px-8">
                Get Started for Free
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <Link to="/register">
              <Button
                variant="outline"
                className="bg-transparent border-white text-white hover:bg-white hover:text-gray-900"
              >
                Post a Job
              </Button>
            </Link>
          </div>

          <div className="mt-12 grid grid-cols-3 gap-8 max-w-2xl mx-auto pt-12 border-t border-gray-700">
            <div>
              <div className="text-white mb-1 font-semibold">Free to Join</div>
              <div className="text-gray-400">No hidden fees</div>
            </div>
            <div>
              <div className="text-white mb-1 font-semibold">24/7 Support</div>
              <div className="text-gray-400">Always here to help</div>
            </div>
            <div>
              <div className="text-white mb-1 font-semibold">Trusted</div>
              <div className="text-gray-400">By thousands</div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-50 border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-8 mb-12">
            {/* Logo and Description */}
            <div className="col-span-2">
              <div className="flex items-center gap-2 mb-4">
                <Shield className="h-8 w-8 text-indigo-600" />
                <span className="text-xl font-bold text-gray-900">Bugbear</span>
              </div>
              <p className="text-gray-600 mb-4">
                The premier platform for cybersecurity professionals and companies to connect and
                grow.
              </p>
              <div className="flex gap-4">
                <a
                  href="#"
                  className="text-gray-400 hover:text-indigo-600 transition-colors"
                  aria-label="Twitter"
                >
                  <Twitter className="h-5 w-5" />
                </a>
                <a
                  href="#"
                  className="text-gray-400 hover:text-indigo-600 transition-colors"
                  aria-label="LinkedIn"
                >
                  <Linkedin className="h-5 w-5" />
                </a>
                <a
                  href="#"
                  className="text-gray-400 hover:text-indigo-600 transition-colors"
                  aria-label="GitHub"
                >
                  <Github className="h-5 w-5" />
                </a>
                <a
                  href="#"
                  className="text-gray-400 hover:text-indigo-600 transition-colors"
                  aria-label="Email"
                >
                  <Mail className="h-5 w-5" />
                </a>
              </div>
            </div>

            {/* Links */}
            <div>
              <h3 className="text-gray-900 font-semibold mb-4">For Job Seekers</h3>
              <ul className="space-y-2">
                <li>
                  <Link to="/jobs" className="text-gray-600 hover:text-indigo-600 transition-colors">
                    Browse Jobs
                  </Link>
                </li>
                <li>
                  <Link
                    to="/register"
                    className="text-gray-600 hover:text-indigo-600 transition-colors"
                  >
                    Create Profile
                  </Link>
                </li>
                <li>
                  <Link to="/career-resources" className="text-gray-600 hover:text-indigo-600 transition-colors">
                    Career Resources
                  </Link>
                </li>
                <li>
                  <Link to="/success-stories" className="text-gray-600 hover:text-indigo-600 transition-colors">
                    Success Stories
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="text-gray-900 font-semibold mb-4">For Companies</h3>
              <ul className="space-y-2">
                <li>
                  <Link
                    to="/register"
                    className="text-gray-600 hover:text-indigo-600 transition-colors"
                  >
                    Post a Job
                  </Link>
                </li>
                <li>
                  <Link to="/pricing" className="text-gray-600 hover:text-indigo-600 transition-colors">
                    Pricing
                  </Link>
                </li>
                <li>
                  <Link to="/find-talent" className="text-gray-600 hover:text-indigo-600 transition-colors">
                    Find Talent
                  </Link>
                </li>
                <li>
                  <Link to="/enterprise" className="text-gray-600 hover:text-indigo-600 transition-colors">
                    Enterprise
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="text-gray-900 font-semibold mb-4">Company</h3>
              <ul className="space-y-2">
                <li>
                  <Link to="/about" className="text-gray-600 hover:text-indigo-600 transition-colors">
                    About Us
                  </Link>
                </li>
                <li>
                  <Link to="/blog" className="text-gray-600 hover:text-indigo-600 transition-colors">
                    Blog
                  </Link>
                </li>
                <li>
                  <Link to="/careers" className="text-gray-600 hover:text-indigo-600 transition-colors">
                    Careers
                  </Link>
                </li>
                <li>
                  <Link to="/contact" className="text-gray-600 hover:text-indigo-600 transition-colors">
                    Contact
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="text-gray-900 font-semibold mb-4">Legal</h3>
              <ul className="space-y-2">
                <li>
                  <Link to="/privacy" className="text-gray-600 hover:text-indigo-600 transition-colors">
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link to="/terms" className="text-gray-600 hover:text-indigo-600 transition-colors">
                    Terms of Service
                  </Link>
                </li>
                <li>
                  <Link to="/cookies" className="text-gray-600 hover:text-indigo-600 transition-colors">
                    Cookie Policy
                  </Link>
                </li>
                <li>
                  <Link to="/gdpr" className="text-gray-600 hover:text-indigo-600 transition-colors">
                    GDPR
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="pt-8 border-t border-gray-200 flex flex-col sm:flex-row justify-between items-center gap-4">
            <p className="text-gray-600">© 2025 Bugbear. All rights reserved.</p>
            <p className="text-gray-600">Made with ❤️ for the cybersecurity community</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
