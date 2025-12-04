import { Calendar, User, ArrowRight } from 'lucide-react';
import { Card, CardContent } from '../components/ui/card';
import { Link } from 'react-router-dom';

export default function Blog() {
  const posts = [
    {
      title: 'Top 10 Cybersecurity Skills in Demand for 2025',
      excerpt:
        'Discover the most sought-after cybersecurity skills and how to develop them to advance your career.',
      author: 'Bugbear Team',
      date: 'January 15, 2025',
      category: 'Career',
      image: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=800&h=400&fit=crop',
    },
    {
      title: 'Remote Work Security Best Practices',
      excerpt:
        'Learn essential security practices for working remotely in cybersecurity roles.',
      author: 'Bugbear Team',
      date: 'January 10, 2025',
      category: 'Security',
      image: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800&h=400&fit=crop',
    },
    {
      title: 'How to Prepare for Your First Penetration Testing Job',
      excerpt:
        'A comprehensive guide for aspiring penetration testers looking to break into the field.',
      author: 'Bugbear Team',
      date: 'January 5, 2025',
      category: 'Career',
      image: 'https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=800&h=400&fit=crop',
    },
    {
      title: 'Understanding VDI Workspaces for Cybersecurity Professionals',
      excerpt:
        'Everything you need to know about Virtual Desktop Infrastructure and how it enhances remote security work.',
      author: 'Bugbear Team',
      date: 'December 28, 2024',
      category: 'Technology',
      image: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=800&h=400&fit=crop',
    },
    {
      title: 'Building a Strong Cybersecurity Portfolio',
      excerpt:
        'Tips and strategies for creating a portfolio that showcases your cybersecurity expertise.',
      author: 'Bugbear Team',
      date: 'December 20, 2024',
      category: 'Career',
      image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&h=400&fit=crop',
    },
    {
      title: 'The Future of Remote Cybersecurity Work',
      excerpt:
        'Exploring trends and predictions for the future of remote work in cybersecurity.',
      author: 'Bugbear Team',
      date: 'December 15, 2024',
      category: 'Industry',
      image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&h=400&fit=crop',
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Blog</h1>
          <p className="text-xl text-gray-600">
            Insights, tips, and news for cybersecurity professionals
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {posts.map((post, index) => (
            <Card key={index} className="hover:shadow-lg transition-shadow overflow-hidden">
              <div className="relative h-48 overflow-hidden">
                <img
                  src={post.image}
                  alt={post.title}
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute top-4 left-4">
                  <span className="bg-indigo-600 text-white px-3 py-1 rounded-full text-sm font-semibold">
                    {post.category}
                  </span>
                </div>
              </div>
              <CardContent className="p-6">
                <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                  <div className="flex items-center gap-1">
                    <User className="h-4 w-4" />
                    <span>{post.author}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    <span>{post.date}</span>
                  </div>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{post.title}</h3>
                <p className="text-gray-600 mb-4">{post.excerpt}</p>
                <Link
                  to="#"
                  className="text-indigo-600 hover:text-indigo-700 font-semibold flex items-center gap-2"
                >
                  Read More <ArrowRight className="h-4 w-4" />
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}

