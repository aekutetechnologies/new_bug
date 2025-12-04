import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useJobStore } from '../../store/jobStore';
import { useApplicationStore } from '../../store/applicationStore';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '../../components/ui/dialog';
import { Textarea } from '../../components/ui/textarea';
import { Label } from '../../components/ui/label';
import { toast } from 'sonner';
import { CheckCircle, XCircle, FileText, Download, Eye, Mail, Phone, MapPin } from 'lucide-react';
import { formatDate } from '../../lib/utils';

export default function Applicants() {
  const [searchParams] = useSearchParams();
  const { applicants, loading, fetchApplicants } = useJobStore();
  const { updateApplicationStatus } = useApplicationStore();
  const [jobFilter, setJobFilter] = useState(searchParams.get('job_id') || 'all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [actionDialogOpen, setActionDialogOpen] = useState(false);
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [actionType, setActionType] = useState('');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    const params = {};
    if (jobFilter !== 'all') params.job_id = jobFilter;
    if (statusFilter !== 'all') params.status = statusFilter;
    fetchApplicants(params);
  }, [jobFilter, statusFilter, fetchApplicants]);

  const getStatusBadge = (status) => {
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

  const handleStatusUpdate = async () => {
    try {
      await updateApplicationStatus(selectedApplication.id, {
        status: actionType,
        notes: notes,
      });
      toast.success(`Application ${actionType}!`);
      setActionDialogOpen(false);
      setNotes('');
      fetchApplicants();
    } catch (error) {
      toast.error('Failed to update application status');
    }
  };

  const openActionDialog = (application, action) => {
    setSelectedApplication(application);
    setActionType(action);
    setActionDialogOpen(true);
  };

  // Get unique jobs for filter
  const uniqueJobs = [...new Map(applicants.map(app => [app.job.id, app.job])).values()];

  if (loading && applicants.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-48 bg-gray-200 rounded"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Applicants</h1>
        <p className="text-gray-600">Manage applications for your job postings</p>
      </div>

      {/* Filters */}
      <div className="flex space-x-4 mb-6">
        <div>
          <Select value={jobFilter} onValueChange={setJobFilter}>
            <SelectTrigger className="w-[250px]">
              <SelectValue placeholder="Filter by job" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Jobs</SelectItem>
              {uniqueJobs.map((job) => (
                <SelectItem key={job.id} value={job.id.toString()}>
                  {job.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="submitted">Submitted</SelectItem>
              <SelectItem value="under_review">Under Review</SelectItem>
              <SelectItem value="approved">Approved</SelectItem>
              <SelectItem value="rejected">Rejected</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {applicants.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <FileText className="h-12 w-12 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold mb-2">No applicants found</h3>
            <p className="text-gray-600">
              Applications will appear here once job seekers apply to your jobs.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {applicants.map((application) => (
            <Card key={application.id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3">
                      <CardTitle className="text-xl">
                        {application.applicant.first_name} {application.applicant.last_name}
                      </CardTitle>
                      {getStatusBadge(application.status)}
                    </div>
                    <CardDescription className="mt-2">
                      Applied for: <Link to={`/jobs/${application.job.id}`} className="text-primary hover:underline">
                        {application.job.title}
                      </Link>
                    </CardDescription>
                    <div className="text-sm text-gray-500 mt-1">
                      Applied on {formatDate(application.applied_at)}
                    </div>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                {/* Applicant Info */}
                <div className="grid grid-cols-2 gap-4 bg-gray-50 p-4 rounded">
                  <div className="flex items-center text-sm">
                    <Mail className="h-4 w-4 mr-2 text-gray-500" />
                    <span>{application.applicant.email}</span>
                  </div>
                  {application.applicant.phone && (
                    <div className="flex items-center text-sm">
                      <Phone className="h-4 w-4 mr-2 text-gray-500" />
                      <span>{application.applicant.phone}</span>
                    </div>
                  )}
                  {application.applicant.location && (
                    <div className="flex items-center text-sm">
                      <MapPin className="h-4 w-4 mr-2 text-gray-500" />
                      <span>{application.applicant.location}</span>
                    </div>
                  )}
                </div>

                {/* Skills */}
                {application.applicant.skills && application.applicant.skills.length > 0 && (
                  <div>
                    <p className="text-sm font-semibold mb-2">Skills:</p>
                    <div className="flex flex-wrap gap-2">
                      {application.applicant.skills.map((skill, idx) => (
                        <Badge key={idx} variant="outline">{skill}</Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Cover Letter */}
                {application.cover_letter && (
                  <div>
                    <p className="text-sm font-semibold mb-2">Cover Letter:</p>
                    <div className="bg-white border rounded p-3 text-sm text-gray-700">
                      {application.cover_letter}
                    </div>
                  </div>
                )}

                {/* Resume */}
                {application.resume && (
                  <div>
                    <p className="text-sm font-semibold mb-2">Resume:</p>
                    <a href={application.resume} download target="_blank" rel="noopener noreferrer">
                      <Button variant="outline" size="sm">
                        <Download className="h-4 w-4 mr-2" />
                        Download Resume
                      </Button>
                    </a>
                  </div>
                )}

                {/* Notes */}
                {application.notes && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded p-3">
                    <p className="text-sm font-semibold mb-1">Internal Notes:</p>
                    <p className="text-sm text-gray-700">{application.notes}</p>
                  </div>
                )}

                {/* Actions */}
                {application.status !== 'approved' && application.status !== 'rejected' && (
                  <div className="flex space-x-2 pt-4 border-t">
                    <Button
                      size="sm"
                      onClick={() => openActionDialog(application, 'under_review')}
                      variant="outline"
                    >
                      Mark Under Review
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => openActionDialog(application, 'approved')}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Approve
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => openActionDialog(application, 'rejected')}
                      variant="destructive"
                    >
                      <XCircle className="h-4 w-4 mr-2" />
                      Reject
                    </Button>
                  </div>
                )}

                {application.status === 'approved' && (
                  <div className="bg-green-50 border border-green-200 rounded p-4">
                    <p className="text-sm font-semibold text-green-800 mb-2">✅ Application Approved</p>
                    <Link to={`/provider/workspaces?application_id=${application.id}`}>
                      <Button size="sm">
                        Assign Workspace
                      </Button>
                    </Link>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Action Dialog */}
      <Dialog open={actionDialogOpen} onOpenChange={setActionDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {actionType === 'approved' && 'Approve Application'}
              {actionType === 'rejected' && 'Reject Application'}
              {actionType === 'under_review' && 'Mark Under Review'}
            </DialogTitle>
            <DialogDescription>
              Update the status of this application
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="notes">Notes (optional)</Label>
              <Textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Add any notes about this decision..."
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setActionDialogOpen(false);
              setNotes('');
            }}>
              Cancel
            </Button>
            <Button
              onClick={handleStatusUpdate}
              className={actionType === 'approved' ? 'bg-green-600 hover:bg-green-700' : ''}
              variant={actionType === 'rejected' ? 'destructive' : 'default'}
            >
              Confirm
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
