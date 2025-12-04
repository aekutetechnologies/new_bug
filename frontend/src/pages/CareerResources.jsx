import { BookOpen, Video, FileText, Users, TrendingUp, Award } from 'lucide-react';
import { Card, CardContent } from '../components/ui/card';
import { Link } from 'react-router-dom';
import { Button } from '../components/ui/button';

export default function CareerResources() {
  const resources = [
    {
      icon: BookOpen,
      title: 'Learning Guides',
      description: 'Comprehensive guides on cybersecurity fundamentals, advanced topics, and career development.',
      color: 'bg-blue-50 text-blue-600',
    },
    {
      icon: Video,
      title: 'Video Tutorials',
      description: 'Step-by-step video tutorials covering penetration testing, security analysis, and more.',
      color: 'bg-purple-50 text-purple-600',
    },
    {
      icon: FileText,
      title: 'Certification Prep',
      description: 'Resources to help you prepare for industry certifications like CISSP, CEH, and OSCP.',
      color: 'bg-green-50 text-green-600',
    },
    {
      icon: Users,
      title: 'Community Forums',
      description: 'Connect with other cybersecurity professionals, share knowledge, and get advice.',
      color: 'bg-orange-50 text-orange-600',
    },
    {
      icon: TrendingUp,
      title: 'Career Paths',
      description: 'Explore different cybersecurity career paths and find the one that fits you best.',
      color: 'bg-indigo-50 text-indigo-600',
    },
    {
      icon: Award,
      title: 'Skill Assessments',
      description: 'Test your skills and identify areas for improvement with our assessment tools.',
      color: 'bg-cyan-50 text-cyan-600',
    },
  ];

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Career Resources</h1>
          <p className="text-xl text-gray-600">
            Everything you need to advance your cybersecurity career
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {resources.map((resource, index) => (
            <Card key={index} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div
                  className={`w-12 h-12 ${resource.color} rounded-lg flex items-center justify-center mb-4`}
                >
                  <resource.icon className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{resource.title}</h3>
                <p className="text-gray-600">{resource.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card className="bg-gradient-to-br from-indigo-50 to-blue-50 border-indigo-200">
          <CardContent className="p-8 text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Ready to Take Your Career to the Next Level?
            </h2>
            <p className="text-gray-600 mb-6">
              Browse our job listings and find your next opportunity
            </p>
            <Link to="/jobs">
              <Button className="bg-indigo-600 hover:bg-indigo-700">
                Browse Jobs
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

