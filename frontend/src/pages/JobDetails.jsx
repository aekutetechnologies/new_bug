import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useJobStore } from '../store/jobStore';
import { useApplicationStore } from '../store/applicationStore';
import { useSavedJobStore } from '../store/savedJobStore';
import { useAuthStore } from '../store/authStore';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Input } from '../components/ui/input';
import { toast } from 'sonner';
import { MapPin, Briefcase, DollarSign, Calendar, Bookmark, BookmarkCheck, ArrowLeft } from 'lucide-react';
import { formatCurrency, formatDate } from '../lib/utils';

export default function JobDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentJob, loading, fetchJob } = useJobStore();
  const { createApplication } = useApplicationStore();
  const { saveJob, unsaveJob } = useSavedJobStore();
  const { user, isAuthenticated } = useAuthStore();

  const [applyDialogOpen, setApplyDialogOpen] = useState(false);
  const [coverLetter, setCoverLetter] = useState('');
  const [resume, setResume] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (id) {
      fetchJob(id);
    }
  }, [id, fetchJob]);

  const handleSaveJob = async () => {
    if (!isAuthenticated) {
      toast.error('Please login to save jobs');
      navigate('/login');
      return;
    }

    try {
      if (currentJob.is_saved) {
        await unsaveJob(id);
        toast.success('Job removed from saved');
      } else {
        await saveJob(parseInt(id));
        toast.success('Job saved successfully');
      }
      fetchJob(id);
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to save job');
    }
  };

  const handleApply = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const formData = {
        job: parseInt(id),
        cover_letter: coverLetter,
        resume: resume,
      };

      await createApplication(formData);
      toast.success('Application submitted successfully!');
      setApplyDialogOpen(false);
      setCoverLetter('');
      setResume(null);
      fetchJob(id);
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to submit application');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-8"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (!currentJob) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Job Not Found</h2>
          <Link to="/jobs">
            <Button>Back to Jobs</Button>
          </Link>
        </div>
      </div>
    );
  }

  const canApply = isAuthenticated && user?.user_type !== 'org_provider' && !currentJob.has_applied;

  return (
    <div className="container mx-auto px-4 py-8">
      <Button variant="ghost" onClick={() => navigate('/jobs')} className="mb-4">
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Jobs
      </Button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-3xl mb-2">{currentJob.title}</CardTitle>
                  <CardDescription className="text-lg">
                    {currentJob.created_by?.company_name || currentJob.created_by?.email}
                  </CardDescription>
                </div>
                <Badge className="text-sm">{currentJob.job_type}</Badge>
              </div>

              <div className="flex flex-wrap gap-4 mt-4">
                <div className="flex items-center text-gray-600">
                  <MapPin className="h-5 w-5 mr-2" />
                  {currentJob.location}
                </div>
                <div className="flex items-center text-gray-600">
                  <Briefcase className="h-5 w-5 mr-2" />
                  {currentJob.experience_level}
                </div>
                {currentJob.salary_min && currentJob.salary_max && (
                  <div className="flex items-center text-gray-600">
                    <DollarSign className="h-5 w-5 mr-2" />
                    {formatCurrency(currentJob.salary_min)} - {formatCurrency(currentJob.salary_max)}
                  </div>
                )}
                {currentJob.application_deadline && (
                  <div className="flex items-center text-gray-600">
                    <Calendar className="h-5 w-5 mr-2" />
                    Apply by {formatDate(currentJob.application_deadline)}
                  </div>
                )}
              </div>
            </CardHeader>

            <CardContent className="space-y-6">
              <div>
                <h3 className="text-xl font-semibold mb-3">Job Description</h3>
                <p className="text-gray-700 whitespace-pre-line">{currentJob.description}</p>
              </div>

              <div>
                <h3 className="text-xl font-semibold mb-3">Requirements</h3>
                <p className="text-gray-700 whitespace-pre-line">{currentJob.requirements}</p>
              </div>

              {currentJob.responsibilities && (
                <div>
                  <h3 className="text-xl font-semibold mb-3">Responsibilities</h3>
                  <p className="text-gray-700 whitespace-pre-line">{currentJob.responsibilities}</p>
                </div>
              )}

              <div>
                <h3 className="text-xl font-semibold mb-3">Required Skills</h3>
                <div className="flex flex-wrap gap-2">
                  {currentJob.skills_required?.map((skill, idx) => (
                    <Badge key={idx} variant="outline">{skill}</Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-1">
          <Card className="sticky top-4">
            <CardHeader>
              <CardTitle>Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {currentJob.has_applied ? (
                <Button disabled className="w-full">
                  Already Applied
                </Button>
              ) : canApply ? (
                <Dialog open={applyDialogOpen} onOpenChange={setApplyDialogOpen}>
                  <DialogTrigger asChild>
                    <Button className="w-full">Apply for this Job</Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl">
                    <DialogHeader>
                      <DialogTitle>Apply for {currentJob.title}</DialogTitle>
                      <DialogDescription>
                        Fill in your application details below
                      </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleApply} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="cover_letter">Cover Letter *</Label>
                        <Textarea
                          id="cover_letter"
                          value={coverLetter}
                          onChange={(e) => setCoverLetter(e.target.value)}
                          placeholder="Tell us why you're a great fit for this position..."
                          rows={6}
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="resume">Resume/CV (Optional)</Label>
                        <Input
                          id="resume"
                          type="file"
                          accept=".pdf,.doc,.docx"
                          onChange={(e) => setResume(e.target.files[0])}
                        />
                      </div>

                      <div className="flex justify-end space-x-2">
                        <Button type="button" variant="outline" onClick={() => setApplyDialogOpen(false)}>
                          Cancel
                        </Button>
                        <Button type="submit" disabled={submitting}>
                          {submitting ? 'Submitting...' : 'Submit Application'}
                        </Button>
                      </div>
                    </form>
                  </DialogContent>
                </Dialog>
              ) : !isAuthenticated ? (
                <Button onClick={() => navigate('/login')} className="w-full">
                  Login to Apply
                </Button>
              ) : null}

              {isAuthenticated && user?.user_type !== 'org_provider' && (
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={handleSaveJob}
                >
                  {currentJob.is_saved ? (
                    <>
                      <BookmarkCheck className="h-4 w-4 mr-2" />
                      Saved
                    </>
                  ) : (
                    <>
                      <Bookmark className="h-4 w-4 mr-2" />
                      Save Job
                    </>
                  )}
                </Button>
              )}
            </CardContent>
          </Card>

          {/* Company Info */}
          <Card className="mt-4">
            <CardHeader>
              <CardTitle>Company Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div>
                <p className="text-sm text-gray-600">Company</p>
                <p className="font-semibold">{currentJob.created_by?.company_name || 'Not specified'}</p>
              </div>
              {currentJob.created_by?.location && (
                <div>
                  <p className="text-sm text-gray-600">Location</p>
                  <p className="font-semibold">{currentJob.created_by.location}</p>
                </div>
              )}
              {currentJob.created_by?.website && (
                <div>
                  <p className="text-sm text-gray-600">Website</p>
                  <a href={currentJob.created_by.website} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                    {currentJob.created_by.website}
                  </a>
                </div>
              )}
              <div>
                <p className="text-sm text-gray-600">Posted</p>
                <p className="font-semibold">{formatDate(currentJob.created_at)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Applicants</p>
                <p className="font-semibold">{currentJob.applicant_count || 0}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
