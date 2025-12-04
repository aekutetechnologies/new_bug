import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useJobStore } from '../../store/jobStore';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Textarea } from '../../components/ui/textarea';
import { Label } from '../../components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '../../components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { toast } from 'sonner';
import { Plus, Edit, Trash2, Users, Eye, ToggleLeft, ToggleRight } from 'lucide-react';
import { formatCurrency, formatDate } from '../../lib/utils';

export default function ProviderJobs() {
  const { providerJobs, loading, fetchProviderJobs, createJob, updateJob, partialUpdateJob, deleteJob } = useJobStore();
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedJob, setSelectedJob] = useState(null);

  const [jobForm, setJobForm] = useState({
    title: '',
    description: '',
    requirements: '',
    responsibilities: '',
    location: '',
    job_type: 'full_time',
    experience_level: 'mid',
    salary_min: '',
    salary_max: '',
    skills_required: '',
    application_deadline: '',
    is_active: true,
  });

  useEffect(() => {
    fetchProviderJobs();
  }, [fetchProviderJobs]);

  const resetForm = () => {
    setJobForm({
      title: '',
      description: '',
      requirements: '',
      responsibilities: '',
      location: '',
      job_type: 'full_time',
      experience_level: 'mid',
      salary_min: '',
      salary_max: '',
      skills_required: '',
      application_deadline: '',
      is_active: true,
    });
  };

  const handleCreateJob = async (e) => {
    e.preventDefault();

    try {
      const jobData = {
        ...jobForm,
        skills_required: jobForm.skills_required.split(',').map(s => s.trim()).filter(s => s),
        salary_min: jobForm.salary_min ? parseFloat(jobForm.salary_min) : null,
        salary_max: jobForm.salary_max ? parseFloat(jobForm.salary_max) : null,
      };

      await createJob(jobData);
      toast.success('Job created successfully!');
      setCreateDialogOpen(false);
      resetForm();
      fetchProviderJobs();
    } catch (error) {
      toast.error('Failed to create job');
    }
  };

  const handleEditJob = async (e) => {
    e.preventDefault();

    try {
      const jobData = {
        ...jobForm,
        skills_required: typeof jobForm.skills_required === 'string' 
          ? jobForm.skills_required.split(',').map(s => s.trim()).filter(s => s)
          : jobForm.skills_required,
        salary_min: jobForm.salary_min ? parseFloat(jobForm.salary_min) : null,
        salary_max: jobForm.salary_max ? parseFloat(jobForm.salary_max) : null,
      };

      await updateJob(selectedJob.id, jobData);
      toast.success('Job updated successfully!');
      setEditDialogOpen(false);
      fetchProviderJobs();
    } catch (error) {
      toast.error('Failed to update job');
    }
  };

  const handleDeleteJob = async () => {
    try {
      await deleteJob(selectedJob.id);
      toast.success('Job deleted successfully');
      setDeleteDialogOpen(false);
      fetchProviderJobs();
    } catch (error) {
      toast.error('Failed to delete job');
    }
  };

  const openEditDialog = (job) => {
    setSelectedJob(job);
    setJobForm({
      title: job.title,
      description: job.description,
      requirements: job.requirements,
      responsibilities: job.responsibilities || '',
      location: job.location,
      job_type: job.job_type,
      experience_level: job.experience_level,
      salary_min: job.salary_min || '',
      salary_max: job.salary_max || '',
      skills_required: Array.isArray(job.skills_required) ? job.skills_required.join(', ') : '',
      application_deadline: job.application_deadline || '',
      is_active: job.is_active,
    });
    setEditDialogOpen(true);
  };

  const toggleJobStatus = async (job) => {
    try {
      await partialUpdateJob(job.id, { is_active: !job.is_active });
      toast.success(`Job ${job.is_active ? 'deactivated' : 'activated'}`);
      fetchProviderJobs();
    } catch (error) {
      toast.error('Failed to update job status');
    }
  };

  if (loading && providerJobs.length === 0) {
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

  const JobFormFields = ({ form, setForm }) => (
    <>
      <div className="space-y-2">
        <Label htmlFor="title">Job Title *</Label>
        <Input
          id="title"
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description *</Label>
        <Textarea
          id="description"
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
          rows={4}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="requirements">Requirements *</Label>
        <Textarea
          id="requirements"
          value={form.requirements}
          onChange={(e) => setForm({ ...form, requirements: e.target.value })}
          rows={4}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="responsibilities">Responsibilities</Label>
        <Textarea
          id="responsibilities"
          value={form.responsibilities}
          onChange={(e) => setForm({ ...form, responsibilities: e.target.value })}
          rows={3}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="location">Location *</Label>
          <Input
            id="location"
            value={form.location}
            onChange={(e) => setForm({ ...form, location: e.target.value })}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="job_type">Job Type *</Label>
          <Select value={form.job_type} onValueChange={(value) => setForm({ ...form, job_type: value })}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="full_time">Full Time</SelectItem>
              <SelectItem value="part_time">Part Time</SelectItem>
              <SelectItem value="contract">Contract</SelectItem>
              <SelectItem value="remote">Remote</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="experience_level">Experience Level *</Label>
          <Select value={form.experience_level} onValueChange={(value) => setForm({ ...form, experience_level: value })}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="entry">Entry Level</SelectItem>
              <SelectItem value="mid">Mid Level</SelectItem>
              <SelectItem value="senior">Senior Level</SelectItem>
              <SelectItem value="lead">Lead/Principal</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="application_deadline">Application Deadline</Label>
          <Input
            id="application_deadline"
            type="date"
            value={form.application_deadline}
            onChange={(e) => setForm({ ...form, application_deadline: e.target.value })}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="salary_min">Minimum Salary</Label>
          <Input
            id="salary_min"
            type="number"
            value={form.salary_min}
            onChange={(e) => setForm({ ...form, salary_min: e.target.value })}
            placeholder="e.g., 80000"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="salary_max">Maximum Salary</Label>
          <Input
            id="salary_max"
            type="number"
            value={form.salary_max}
            onChange={(e) => setForm({ ...form, salary_max: e.target.value })}
            placeholder="e.g., 120000"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="skills_required">Required Skills (comma-separated)</Label>
        <Input
          id="skills_required"
          value={form.skills_required}
          onChange={(e) => setForm({ ...form, skills_required: e.target.value })}
          placeholder="e.g., Python, Network Security, SIEM"
        />
      </div>
    </>
  );

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold mb-2">My Jobs</h1>
          <p className="text-gray-600">Manage your job postings</p>
        </div>
        <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Create New Job
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create New Job</DialogTitle>
              <DialogDescription>
                Fill in the details for your new job posting
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleCreateJob} className="space-y-4">
              <JobFormFields form={jobForm} setForm={setJobForm} />
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => {
                  setCreateDialogOpen(false);
                  resetForm();
                }}>
                  Cancel
                </Button>
                <Button type="submit">Create Job</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {providerJobs.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <h3 className="text-lg font-semibold mb-2">No jobs posted yet</h3>
            <p className="text-gray-600 mb-4">
              Create your first job posting to start receiving applications.
            </p>
            <Button onClick={() => setCreateDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Create Your First Job
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {providerJobs.map((job) => (
            <Card key={job.id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <CardTitle className="text-xl">{job.title}</CardTitle>
                      <Badge variant={job.is_active ? 'default' : 'secondary'}>
                        {job.is_active ? 'Active' : 'Inactive'}
                      </Badge>
                    </div>
                    <CardDescription>
                      Posted {formatDate(job.created_at)}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>

              <CardContent>
                <p className="text-gray-700 mb-4 line-clamp-2">{job.description}</p>

                <div className="flex flex-wrap gap-3 mb-4 text-sm text-gray-600">
                  <span>{job.location}</span>
                  <span>•</span>
                  <span>{job.job_type}</span>
                  <span>•</span>
                  <span>{job.experience_level}</span>
                  {job.salary_min && job.salary_max && (
                    <>
                      <span>•</span>
                      <span>{formatCurrency(job.salary_min)} - {formatCurrency(job.salary_max)}</span>
                    </>
                  )}
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center text-sm">
                      <Users className="h-4 w-4 mr-1" />
                      <span>{job.applicant_count || 0} applicants</span>
                    </div>
                    <Link to={`/provider/applicants?job_id=${job.id}`}>
                      <Button variant="link" size="sm" className="p-0 h-auto">
                        View Applicants
                      </Button>
                    </Link>
                  </div>

                  <div className="flex space-x-2">
                    <Link to={`/jobs/${job.id}`}>
                      <Button variant="ghost" size="sm">
                        <Eye className="h-4 w-4 mr-2" />
                        View
                      </Button>
                    </Link>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleJobStatus(job)}
                    >
                      {job.is_active ? (
                        <ToggleRight className="h-4 w-4 mr-2" />
                      ) : (
                        <ToggleLeft className="h-4 w-4 mr-2" />
                      )}
                      {job.is_active ? 'Deactivate' : 'Activate'}
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => openEditDialog(job)}>
                      <Edit className="h-4 w-4 mr-2" />
                      Edit
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setSelectedJob(job);
                        setDeleteDialogOpen(true);
                      }}
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Edit Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Job</DialogTitle>
            <DialogDescription>
              Update the job posting details
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleEditJob} className="space-y-4">
            <JobFormFields form={jobForm} setForm={setJobForm} />
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setEditDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">Save Changes</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Job?</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete "{selectedJob?.title}"? This will also delete all applications for this job.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteJob}>
              Yes, Delete Job
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
