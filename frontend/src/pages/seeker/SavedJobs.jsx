import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useSavedJobStore } from '../../store/savedJobStore';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '../../components/ui/dialog';
import { toast } from 'sonner';
import { Bookmark, MapPin, Briefcase, DollarSign, Trash2, Eye } from 'lucide-react';
import { formatCurrency, formatDate } from '../../lib/utils';

export default function SavedJobs() {
  const { savedJobs, loading, fetchSavedJobs, unsaveJob } = useSavedJobStore();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedJobId, setSelectedJobId] = useState(null);

  useEffect(() => {
    fetchSavedJobs();
  }, [fetchSavedJobs]);

  const handleUnsave = async () => {
    if (!selectedJobId) return;

    try {
      await unsaveJob(selectedJobId);
      toast.success('Job removed from saved list');
      setDeleteDialogOpen(false);
      fetchSavedJobs();
    } catch (error) {
      toast.error('Failed to remove saved job');
    }
  };

  if (loading && savedJobs.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-8"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-64 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Saved Jobs</h1>
        <p className="text-gray-600">Jobs you've saved for later review</p>
      </div>

      {savedJobs.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Bookmark className="h-12 w-12 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold mb-2">No saved jobs yet</h3>
            <p className="text-gray-600 mb-4">
              Browse jobs and save the ones you're interested in for quick access later.
            </p>
            <Link to="/jobs">
              <Button>Browse Jobs</Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {savedJobs.map((savedJob) => (
            <Card key={savedJob.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <CardTitle className="text-lg line-clamp-2">
                      {savedJob.job.title}
                    </CardTitle>
                    <CardDescription className="mt-1">
                      {savedJob.job.created_by?.company_name || savedJob.job.created_by?.email}
                    </CardDescription>
                  </div>
                  <Badge>{savedJob.job.job_type}</Badge>
                </div>
                <div className="text-xs text-gray-500 mt-2">
                  Saved {formatDate(savedJob.saved_at)}
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                <p className="text-sm text-gray-600 line-clamp-3">
                  {savedJob.job.description}
                </p>

                <div className="space-y-2 text-sm">
                  <div className="flex items-center text-gray-600">
                    <MapPin className="h-4 w-4 mr-2" />
                    {savedJob.job.location}
                  </div>
                  <div className="flex items-center text-gray-600">
                    <Briefcase className="h-4 w-4 mr-2" />
                    {savedJob.job.experience_level}
                  </div>
                  {savedJob.job.salary_min && savedJob.job.salary_max && (
                    <div className="flex items-center text-gray-600">
                      <DollarSign className="h-4 w-4 mr-2" />
                      {formatCurrency(savedJob.job.salary_min)} - {formatCurrency(savedJob.job.salary_max)}
                    </div>
                  )}
                </div>

                <div className="flex flex-wrap gap-2">
                  {savedJob.job.skills_required?.slice(0, 3).map((skill, idx) => (
                    <Badge key={idx} variant="outline" className="text-xs">
                      {skill}
                    </Badge>
                  ))}
                </div>

                <div className="flex space-x-2 pt-2">
                  <Link to={`/jobs/${savedJob.job.id}`} className="flex-1">
                    <Button className="w-full" size="sm">
                      <Eye className="h-4 w-4 mr-2" />
                      View Details
                    </Button>
                  </Link>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => {
                      setSelectedJobId(savedJob.id);
                      setDeleteDialogOpen(true);
                    }}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Remove Saved Job?</DialogTitle>
            <DialogDescription>
              Are you sure you want to remove this job from your saved list?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleUnsave}>
              Yes, Remove
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
