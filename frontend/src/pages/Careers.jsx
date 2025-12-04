import { Briefcase, MapPin, Clock } from 'lucide-react';
import { Card, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Link } from 'react-router-dom';

export default function Careers() {
  const openings = [
    {
      title: 'Senior Full-Stack Developer',
      location: 'Remote',
      type: 'Full-time',
      department: 'Engineering',
    },
    {
      title: 'Product Designer',
      location: 'Remote',
      type: 'Full-time',
      department: 'Design',
    },
    {
      title: 'Customer Success Manager',
      location: 'Remote',
      type: 'Full-time',
      department: 'Customer Success',
    },
    {
      title: 'Marketing Manager',
      location: 'Remote',
      type: 'Full-time',
      department: 'Marketing',
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Join Our Team</h1>
          <p className="text-xl text-gray-600">
            Help us build the future of remote cybersecurity talent matching
          </p>
        </div>

        <div className="prose prose-lg max-w-none mb-12 text-center">
          <p className="text-gray-700 leading-relaxed">
            At Bugbear, we're building a platform that connects cybersecurity professionals with
            remote opportunities. We're looking for talented individuals who share our passion for
            security, remote work, and innovation.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 mb-12">
          {openings.map((job, index) => (
            <Card key={index} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">{job.title}</h3>
                    <p className="text-sm text-indigo-600 font-medium">{job.department}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 text-sm text-gray-600 mb-4">
                  <div className="flex items-center gap-1">
                    <MapPin className="h-4 w-4" />
                    <span>{job.location}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    <span>{job.type}</span>
                  </div>
                </div>
                <Link to="/contact">
                  <Button variant="outline" className="w-full">
                    Apply Now
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card className="bg-gradient-to-br from-indigo-50 to-blue-50 border-indigo-200">
          <CardContent className="p-8 text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Don't See a Role That Fits?
            </h2>
            <p className="text-gray-600 mb-6">
              We're always looking for talented people. Send us your resume and we'll keep you in
              mind for future opportunities.
            </p>
            <Link to="/contact">
              <Button className="bg-indigo-600 hover:bg-indigo-700">
                Get in Touch
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

