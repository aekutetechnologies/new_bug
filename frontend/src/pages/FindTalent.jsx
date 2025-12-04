import { Search, Users, Shield, CheckCircle } from 'lucide-react';
import { Card, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Link } from 'react-router-dom';

export default function FindTalent() {
  const benefits = [
    {
      icon: Users,
      title: 'Access Top Talent',
      description: 'Connect with verified cybersecurity professionals from around the world.',
    },
    {
      icon: Shield,
      title: 'Vetted Candidates',
      description: 'All candidates are verified and their credentials are checked.',
    },
    {
      icon: CheckCircle,
      title: 'Streamlined Process',
      description: 'Post jobs, review applications, and hire talent all in one platform.',
    },
    {
      icon: Search,
      title: 'Advanced Matching',
      description: 'Our AI-powered system matches you with the best candidates for your needs.',
    },
  ];

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Find Top Cybersecurity Talent</h1>
          <p className="text-xl text-gray-600">
            Connect with skilled professionals ready to protect your organization
          </p>
        </div>

        <div className="prose prose-lg max-w-none mb-12 text-center">
          <p className="text-gray-700 leading-relaxed">
            Looking for cybersecurity experts? Bugbear helps companies find and hire the best remote
            talent. Post your job openings and connect with qualified professionals who are ready to
            start immediately.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {benefits.map((benefit, index) => (
            <Card key={index} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="w-12 h-12 bg-indigo-50 rounded-lg flex items-center justify-center mb-4">
                  <benefit.icon className="h-6 w-6 text-indigo-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{benefit.title}</h3>
                <p className="text-gray-600">{benefit.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card className="bg-gradient-to-br from-indigo-50 to-blue-50 border-indigo-200">
          <CardContent className="p-8 text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Ready to Find Your Next Cybersecurity Expert?
            </h2>
            <p className="text-gray-600 mb-6">
              Post a job today and start connecting with top talent
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/register">
                <Button className="bg-indigo-600 hover:bg-indigo-700">
                  Post a Job
                </Button>
              </Link>
              <Link to="/jobs">
                <Button variant="outline">Browse Jobs</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

