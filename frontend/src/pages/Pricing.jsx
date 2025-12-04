import { Check } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Link } from 'react-router-dom';

export default function Pricing() {
  const plans = [
    {
      name: 'Job Seeker',
      price: 'Free',
      description: 'Perfect for cybersecurity professionals looking for opportunities',
      features: [
        'Browse all job listings',
        'Apply to unlimited positions',
        'Create and manage your profile',
        'Save favorite jobs',
        'Track application status',
        'Access to VDI workspaces upon approval',
        'Career resources and guides',
      ],
      cta: 'Get Started Free',
      link: '/register',
      popular: false,
    },
    {
      name: 'Company',
      price: '$299',
      period: '/month',
      description: 'For companies looking to hire cybersecurity talent',
      features: [
        'Post unlimited job listings',
        'Access to candidate database',
        'Application management tools',
        'VDI workspace provisioning',
        'Analytics and insights',
        'Priority support',
        'Company profile page',
      ],
      cta: 'Start Hiring',
      link: '/register',
      popular: true,
    },
    {
      name: 'Enterprise',
      price: 'Custom',
      description: 'Tailored solutions for large organizations',
      features: [
        'Everything in Company plan',
        'Dedicated account manager',
        'Custom integrations',
        'Advanced analytics',
        'Bulk hiring tools',
        'White-label options',
        '24/7 priority support',
        'Custom SLA agreements',
      ],
      cta: 'Contact Sales',
      link: '/contact',
      popular: false,
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Simple, Transparent Pricing</h1>
          <p className="text-xl text-gray-600">
            Choose the plan that's right for you. No hidden fees, cancel anytime.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {plans.map((plan, index) => (
            <Card
              key={index}
              className={`relative ${plan.popular ? 'border-indigo-600 shadow-lg scale-105' : ''}`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <span className="bg-indigo-600 text-white px-4 py-1 rounded-full text-sm font-semibold">
                    Most Popular
                  </span>
                </div>
              )}
              <CardHeader>
                <CardTitle className="text-2xl">{plan.name}</CardTitle>
                <div className="mt-4">
                  <span className="text-4xl font-bold text-gray-900">{plan.price}</span>
                  {plan.period && <span className="text-gray-600">{plan.period}</span>}
                </div>
                <p className="text-gray-600 mt-2">{plan.description}</p>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3 mb-6">
                  {plan.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <Check className="h-5 w-5 text-indigo-600 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-600">{feature}</span>
                    </li>
                  ))}
                </ul>
                <Link to={plan.link}>
                  <Button
                    className={`w-full ${plan.popular ? 'bg-indigo-600 hover:bg-indigo-700' : ''}`}
                  >
                    {plan.cta}
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mt-12 text-center">
          <p className="text-gray-600 mb-4">
            All plans include our standard security features and data protection.
          </p>
          <p className="text-sm text-gray-500">
            Need help choosing? <Link to="/contact" className="text-indigo-600 hover:underline">Contact us</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

