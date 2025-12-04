import { Shield, Users, Zap, BarChart, Headphones, Settings } from 'lucide-react';
import { Card, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Link } from 'react-router-dom';

export default function Enterprise() {
  const features = [
    {
      icon: Users,
      title: 'Dedicated Account Manager',
      description: 'Get personalized support from a dedicated account manager who understands your hiring needs.',
    },
    {
      icon: Zap,
      title: 'Custom Integrations',
      description: 'Integrate Bugbear with your existing HR systems, ATS, and workflow tools.',
    },
    {
      icon: BarChart,
      title: 'Advanced Analytics',
      description: 'Access detailed insights and reporting to optimize your hiring process.',
    },
    {
      icon: Settings,
      title: 'Bulk Hiring Tools',
      description: 'Streamline your hiring process with tools designed for high-volume recruitment.',
    },
    {
      icon: Shield,
      title: 'Enhanced Security',
      description: 'Enterprise-grade security features and compliance with industry standards.',
    },
    {
      icon: Headphones,
      title: '24/7 Priority Support',
      description: 'Round-the-clock support with guaranteed response times and SLA agreements.',
    },
  ];

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Enterprise Solutions</h1>
          <p className="text-xl text-gray-600">
            Tailored cybersecurity talent solutions for large organizations
          </p>
        </div>

        <div className="prose prose-lg max-w-none mb-12 text-center">
          <p className="text-gray-700 leading-relaxed">
            Our Enterprise plan is designed for organizations that need advanced features, dedicated
            support, and custom solutions to scale their cybersecurity hiring efforts.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {features.map((feature, index) => (
            <Card key={index} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="w-12 h-12 bg-indigo-50 rounded-lg flex items-center justify-center mb-4">
                  <feature.icon className="h-6 w-6 text-indigo-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card className="bg-gradient-to-br from-indigo-50 to-blue-50 border-indigo-200">
          <CardContent className="p-8 text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Ready to Scale Your Cybersecurity Team?
            </h2>
            <p className="text-gray-600 mb-6">
              Contact our sales team to discuss custom enterprise solutions
            </p>
            <Link to="/contact">
              <Button className="bg-indigo-600 hover:bg-indigo-700">
                Contact Sales
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

