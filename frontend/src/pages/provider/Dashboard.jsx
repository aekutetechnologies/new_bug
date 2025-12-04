import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useJobStore } from '../../store/jobStore';
import { useWorkspaceStore } from '../../store/workspaceStore';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Briefcase, Users, Server, TrendingUp, CheckCircle, Clock, XCircle, Eye } from 'lucide-react';
import { formatDate } from '../../lib/utils';

export default function Dashboard() {
  const { providerJobs, applicants, fetchProviderJobs, fetchApplicants } = useJobStore();
  const { workspaces, fetchWorkspaces } = useWorkspaceStore();
  const [stats, setStats] = useState({
    totalJobs: 0,
    activeJobs: 0,
    totalApplicants: 0,
    pendingApplicants: 0,
    approvedApplicants: 0,
    rejectedApplicants: 0,
    totalWorkspaces: 0,
    activeWorkspaces: 0,
  });

  useEffect(() => {
    fetchProviderJobs();
    fetchApplicants();
    fetchWorkspaces();
  }, [fetchProviderJobs, fetchApplicants, fetchWorkspaces]);

  useEffect(() => {
    // Calculate statistics
    const activeJobs = providerJobs.filter(j => j.is_active).length;
    const pending = applicants.filter(a => a.status === 'submitted' || a.status === 'under_review').length;
    const approved = applicants.filter(a => a.status === 'approved').length;
    const rejected = applicants.filter(a => a.status === 'rejected').length;
    const activeWs = workspaces.filter(w => w.state === 'AVAILABLE').length;

    setStats({
      totalJobs: providerJobs.length,
      activeJobs,
      totalApplicants: applicants.length,
      pendingApplicants: pending,
      approvedApplicants: approved,
      rejectedApplicants: rejected,
      totalWorkspaces: workspaces.length,
      activeWorkspaces: activeWs,
    });
  }, [providerJobs, applicants, workspaces]);

  // Get recent applicants (last 5)
  const recentApplicants = [...applicants]
    .sort((a, b) => new Date(b.applied_at) - new Date(a.applied_at))
    .slice(0, 5);

  // Get top jobs by applicant count
  const topJobs = [...providerJobs]
    .sort((a, b) => (b.applicant_count || 0) - (a.applicant_count || 0))
    .slice(0, 5);

  const getStatusBadge = (status) => {
    const colors = {
      submitted: 'bg-blue-100 text-blue-800',
      under_review: 'bg-yellow-100 text-yellow-800',
      approved: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800',
    };

    return (
      <Badge className={colors[status]}>
        {status.replace('_', ' ')}
      </Badge>
    );
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Dashboard</h1>
        <p className="text-gray-600">Overview of your job postings and applicants</p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Jobs</CardTitle>
            <Briefcase className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalJobs}</div>
            <p className="text-xs text-muted-foreground">
              {stats.activeJobs} active
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Applicants</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalApplicants}</div>
            <p className="text-xs text-muted-foreground">
              {stats.pendingApplicants} pending review
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Approved</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.approvedApplicants}</div>
            <p className="text-xs text-muted-foreground">
              Ready for workspace
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Workspaces</CardTitle>
            <Server className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalWorkspaces}</div>
            <p className="text-xs text-muted-foreground">
              {stats.activeWorkspaces} running
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Application Status Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <Card>
          <CardHeader>
            <CardTitle>Application Status Breakdown</CardTitle>
            <CardDescription>Overview of all application statuses</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Clock className="h-5 w-5 text-blue-600 mr-3" />
                  <span className="font-medium">Pending Review</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-2xl font-bold">{stats.pendingApplicants}</span>
                  <span className="text-sm text-gray-500">
                    ({stats.totalApplicants > 0 ? Math.round((stats.pendingApplicants / stats.totalApplicants) * 100) : 0}%)
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-green-600 mr-3" />
                  <span className="font-medium">Approved</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-2xl font-bold text-green-600">{stats.approvedApplicants}</span>
                  <span className="text-sm text-gray-500">
                    ({stats.totalApplicants > 0 ? Math.round((stats.approvedApplicants / stats.totalApplicants) * 100) : 0}%)
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <XCircle className="h-5 w-5 text-red-600 mr-3" />
                  <span className="font-medium">Rejected</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-2xl font-bold text-red-600">{stats.rejectedApplicants}</span>
                  <span className="text-sm text-gray-500">
                    ({stats.totalApplicants > 0 ? Math.round((stats.rejectedApplicants / stats.totalApplicants) * 100) : 0}%)
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Top Performing Jobs</CardTitle>
            <CardDescription>Jobs with the most applicants</CardDescription>
          </CardHeader>
          <CardContent>
            {topJobs.length === 0 ? (
              <p className="text-sm text-gray-500 text-center py-4">No jobs created yet</p>
            ) : (
              <div className="space-y-3">
                {topJobs.map((job, idx) => (
                  <div key={job.id} className="flex items-center justify-between pb-3 border-b last:border-0">
                    <div className="flex-1">
                      <Link to={`/jobs/${job.id}`} className="font-medium hover:text-primary text-sm">
                        {job.title}
                      </Link>
                      <p className="text-xs text-gray-500">{job.location}</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant="outline">{job.applicant_count || 0} applicants</Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent Applicants Table */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Recent Applicants</CardTitle>
              <CardDescription>Latest applications to your job postings</CardDescription>
            </div>
            <Link to="/provider/applicants">
              <Button variant="outline" size="sm">
                <Eye className="h-4 w-4 mr-2" />
                View All
              </Button>
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          {recentApplicants.length === 0 ? (
            <p className="text-sm text-gray-500 text-center py-8">No applicants yet</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 font-medium">Applicant</th>
                    <th className="text-left py-3 px-4 font-medium">Job</th>
                    <th className="text-left py-3 px-4 font-medium">Applied</th>
                    <th className="text-left py-3 px-4 font-medium">Status</th>
                    <th className="text-left py-3 px-4 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {recentApplicants.map((app) => (
                    <tr key={app.id} className="border-b last:border-0 hover:bg-gray-50">
                      <td className="py-3 px-4">
                        <div>
                          <p className="font-medium">
                            {app.applicant.first_name} {app.applicant.last_name}
                          </p>
                          <p className="text-xs text-gray-500">{app.applicant.email}</p>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <Link to={`/jobs/${app.job.id}`} className="text-sm hover:text-primary">
                          {app.job.title}
                        </Link>
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-600">
                        {formatDate(app.applied_at)}
                      </td>
                      <td className="py-3 px-4">
                        {getStatusBadge(app.status)}
                      </td>
                      <td className="py-3 px-4">
                        <Link to="/provider/applicants">
                          <Button size="sm" variant="ghost">
                            <Eye className="h-4 w-4 mr-1" />
                            Review
                          </Button>
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
        <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => window.location.href = '/provider/jobs'}>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Manage</p>
                <h3 className="text-xl font-bold">Job Postings</h3>
              </div>
              <Briefcase className="h-10 w-10 text-blue-600" />
            </div>
            <p className="text-sm text-gray-500 mt-2">
              Create, edit, and manage your job listings
            </p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => window.location.href = '/provider/applicants'}>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Review</p>
                <h3 className="text-xl font-bold">Applicants</h3>
              </div>
              <Users className="h-10 w-10 text-green-600" />
            </div>
            <p className="text-sm text-gray-500 mt-2">
              Review and manage job applications
            </p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => window.location.href = '/provider/workspaces'}>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Manage</p>
                <h3 className="text-xl font-bold">VDI Workspaces</h3>
              </div>
              <Server className="h-10 w-10 text-purple-600" />
            </div>
            <p className="text-sm text-gray-500 mt-2">
              Create and manage VDI environments
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

