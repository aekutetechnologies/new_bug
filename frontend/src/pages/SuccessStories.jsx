import { Quote, Star } from 'lucide-react';
import { Card, CardContent } from '../components/ui/card';

export default function SuccessStories() {
  const stories = [
    {
      name: 'Sarah Chen',
      role: 'Senior Penetration Tester',
      company: 'TechSecure Inc.',
      image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop',
      quote:
        'Bugbear connected me with my dream remote position. The platform made it easy to find opportunities that matched my skills, and the VDI access was set up immediately after approval. I couldn\'t be happier!',
      rating: 5,
    },
    {
      name: 'Michael Rodriguez',
      role: 'Security Engineer',
      company: 'CloudGuard Solutions',
      image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop',
      quote:
        'As someone who values work-life balance, Bugbear\'s remote-first approach was perfect. I found a great company that values my expertise, and the application process was smooth and transparent.',
      rating: 5,
    },
    {
      name: 'Emily Johnson',
      role: 'Cybersecurity Analyst',
      company: 'DataDefense Corp',
      image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop',
      quote:
        'The quality of companies on Bugbear is outstanding. Every opportunity I explored was legitimate and well-vetted. I landed my current role within two weeks of joining!',
      rating: 5,
    },
    {
      name: 'David Kim',
      role: 'Bug Bounty Hunter',
      company: 'Freelance',
      image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop',
      quote:
        'Bugbear has been a game-changer for my freelance career. The platform connects me with exciting projects, and the instant workspace access means I can start working right away.',
      rating: 5,
    },
    {
      name: 'Lisa Anderson',
      role: 'Security Architect',
      company: 'SecureNet Systems',
      image: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop',
      quote:
        'I\'ve been in cybersecurity for 15 years, and Bugbear is by far the best platform I\'ve used. The companies are serious about hiring, and the process is professional from start to finish.',
      rating: 5,
    },
    {
      name: 'James Wilson',
      role: 'Network Security Specialist',
      company: 'InfraSecure',
      image: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&h=150&fit=crop',
      quote:
        'The remote opportunities on Bugbear are top-notch. I work with a global team now, and the flexibility has improved my quality of life significantly. Highly recommend!',
      rating: 5,
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Success Stories</h1>
          <p className="text-xl text-gray-600">
            Real stories from cybersecurity professionals who found their dream jobs on Bugbear
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {stories.map((story, index) => (
            <Card key={index} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center gap-2 mb-4">
                  {[...Array(story.rating)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <Quote className="h-8 w-8 text-indigo-600 mb-4" />
                <p className="text-gray-700 mb-6 italic">"{story.quote}"</p>
                <div className="flex items-center gap-4">
                  <img
                    src={story.image}
                    alt={story.name}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                  <div>
                    <div className="font-semibold text-gray-900">{story.name}</div>
                    <div className="text-sm text-gray-600">
                      {story.role} at {story.company}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}

