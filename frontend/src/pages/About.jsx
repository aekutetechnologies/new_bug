import { Shield, Users, Target, Award } from 'lucide-react';
import { Card, CardContent } from '../components/ui/card';

export default function About() {
  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">About Bugbear</h1>
          <p className="text-xl text-gray-600">
            Connecting cybersecurity professionals with remote opportunities worldwide
          </p>
        </div>

        <div className="prose prose-lg max-w-none mb-12">
          <p className="text-gray-700 leading-relaxed mb-6">
            Bugbear is the premier platform dedicated to connecting cybersecurity professionals with
            remote job opportunities. We understand that the cybersecurity landscape is constantly
            evolving, and talented professionals need flexible, remote work options to thrive.
          </p>

          <p className="text-gray-700 leading-relaxed mb-6">
            Our mission is to bridge the gap between skilled cybersecurity experts and companies
            seeking top talent. We provide a secure, efficient platform where professionals can find
            meaningful work and companies can discover the expertise they need to protect their
            digital assets.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 mb-12">
          <Card>
            <CardContent className="p-6">
              <div className="w-12 h-12 bg-indigo-50 rounded-lg flex items-center justify-center mb-4">
                <Target className="h-6 w-6 text-indigo-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Our Mission</h3>
              <p className="text-gray-600">
                To create the most trusted platform for cybersecurity professionals and companies to
                connect, collaborate, and grow together in a secure, remote-first environment.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="w-12 h-12 bg-indigo-50 rounded-lg flex items-center justify-center mb-4">
                <Award className="h-6 w-6 text-indigo-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Our Vision</h3>
              <p className="text-gray-600">
                To become the global leader in remote cybersecurity talent matching, empowering
                professionals and organizations to build a more secure digital future.
              </p>
            </CardContent>
          </Card>
        </div>

        <Card className="mb-12">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-indigo-50 rounded-lg flex items-center justify-center flex-shrink-0">
                <Users className="h-6 w-6 text-indigo-600" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Our Values</h3>
                <ul className="space-y-2 text-gray-600">
                  <li>• Security and privacy are paramount in everything we do</li>
                  <li>• We believe in the power of remote work and flexibility</li>
                  <li>• Transparency and trust guide all our interactions</li>
                  <li>• We're committed to supporting the cybersecurity community</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

