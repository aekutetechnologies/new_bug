import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useApplicationStore } from '../../store/applicationStore';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '../../components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { toast } from 'sonner';
import { FileText, MapPin, DollarSign, Calendar, Trash2, ExternalLink, Briefcase } from 'lucide-react';
import { formatDate, formatCurrency } from '../../lib/utils';

export default function AppliedJobs() {
  const { applications, loading, fetchApplications, withdrawApplication } = useApplicationStore();
  const [statusFilter, setStatusFilter] = useState('all');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedAppId, setSelectedAppId] = useState(null);

  useEffect(() => {
    fetchApplications();
  }, [fetchApplications]);

  const handleWithdraw = async () => {
    if (!selectedAppId) return;

    try {
      await withdrawApplication(selectedAppId);
      toast.success('Application withdrawn successfully');
      setDeleteDialogOpen(false);
      fetchApplications();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to withdraw application');
    }
  };

  const getStatusBadge = (status) => {
    const variants = {
      submitted: 'default',
      under_review: 'secondary',
      approved: 'default',
      rejected: 'destructive',
    };

    const colors = {
      submitted: 'bg-blue-100 text-blue-800',
      under_review: 'bg-yellow-100 text-yellow-800',
      approved: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800',
    };

    return (
      <Badge className={colors[status]}>
        {status.replace('_', ' ').toUpperCase()}
      </Badge>
    );
  };

  const filteredApplications = applications.filter((app) =>
    statusFilter === 'all' ? true : app.status === statusFilter
  );

  if (loading && applications.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-32 bg-gray-200 rounded"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold mb-2">Applied Jobs</h1>
          <p className="text-gray-600">Track your job applications and their status</p>
        </div>
        <div className="flex items-center space-x-2">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Applications</SelectItem>
              <SelectItem value="submitted">Submitted</SelectItem>
              <SelectItem value="under_review">Under Review</SelectItem>
              <SelectItem value="approved">Approved</SelectItem>
              <SelectItem value="rejected">Rejected</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {filteredApplications.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <FileText className="h-12 w-12 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold mb-2">No applications found</h3>
            <p className="text-gray-600 mb-4">
              {statusFilter === 'all'
                ? "You haven't applied to any jobs yet."
                : `No applications with status: ${statusFilter}`}
            </p>
            <Link to="/jobs">
              <Button>Browse Jobs</Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredApplications.map((application) => (
            <Card key={application.id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <Link to={`/jobs/${application.job.id}`}>
                      <CardTitle className="text-xl hover:text-primary cursor-pointer">
                        {application.job.title}
                        <ExternalLink className="h-4 w-4 inline ml-2" />
                      </CardTitle>
                    </Link>
                    <CardDescription className="mt-1">
                      {application.job.created_by?.company_name || application.job.created_by?.email}
                    </CardDescription>
                  </div>
                  <div className="flex flex-col items-end space-y-2">
                    {getStatusBadge(application.status)}
                    <span className="text-sm text-gray-500">
                      Applied {formatDate(application.applied_at)}
                    </span>
                  </div>
                </div>
              </CardHeader>

              <CardContent>
                <div className="flex flex-wrap gap-4 mb-4">
                  <div className="flex items-center text-sm text-gray-600">
                    <MapPin className="h-4 w-4 mr-1" />
                    {application.job.location}
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <Briefcase className="h-4 w-4 mr-1" />
                    {application.job.experience_level}
                  </div>
                  {application.job.salary_min && application.job.salary_max && (
                    <div className="flex items-center text-sm text-gray-600">
                      <DollarSign className="h-4 w-4 mr-1" />
                      {formatCurrency(application.job.salary_min)} - {formatCurrency(application.job.salary_max)}
                    </div>
                  )}
                </div>

                {application.cover_letter && (
                  <div className="mb-4">
                    <p className="text-sm font-semibold mb-1">Your Cover Letter:</p>
                    <p className="text-sm text-gray-600 line-clamp-2">{application.cover_letter}</p>
                  </div>
                )}

                {application.status === 'approved' && application.workspace && (
                  <div className="bg-green-50 border border-green-200 rounded p-4 mb-4">
                    <p className="text-sm font-semibold text-green-800 mb-2">🎉 Workspace Assigned!</p>
                    <Link to="/seeker/workspace">
                      <Button size="sm" variant="outline">
                        View Workspace Details
                      </Button>
                    </Link>
                  </div>
                )}

                <div className="flex justify-between items-center">
                  <div className="flex flex-wrap gap-2">
                    {application.job.skills_required?.slice(0, 3).map((skill, idx) => (
                      <Badge key={idx} variant="outline">{skill}</Badge>
                    ))}
                  </div>

                  {application.status !== 'approved' && (
                    <Dialog open={deleteDialogOpen && selectedAppId === application.id} onOpenChange={(open) => {
                      setDeleteDialogOpen(open);
                      if (open) setSelectedAppId(application.id);
                    }}>
                      <DialogTrigger asChild>
                        <Button variant="destructive" size="sm">
                          <Trash2 className="h-4 w-4 mr-2" />
                          Withdraw
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Withdraw Application?</DialogTitle>
                          <DialogDescription>
                            Are you sure you want to withdraw your application for {application.job.title}?
                            This action cannot be undone.
                          </DialogDescription>
                        </DialogHeader>
                        <DialogFooter>
                          <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
                            Cancel
                          </Button>
                          <Button variant="destructive" onClick={handleWithdraw}>
                            Yes, Withdraw
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
