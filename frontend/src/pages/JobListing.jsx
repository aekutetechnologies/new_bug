import { useEffect, useState, useMemo } from 'react';
import { useJobStore } from '../store/jobStore';
import { Link, useSearchParams } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { MapPin, Briefcase, DollarSign, Search, Filter, X } from 'lucide-react';

// Fuzzy search helper - calculates similarity between two strings
const calculateSimilarity = (str1, str2) => {
  const longer = str1.length > str2.length ? str1 : str2;
  const shorter = str1.length > str2.length ? str2 : str1;
  
  if (longer.length === 0) return 1.0;
  
  // Simple substring matching for fuzzy search
  const lowerLonger = longer.toLowerCase();
  const lowerShorter = shorter.toLowerCase();
  
  if (lowerLonger.includes(lowerShorter)) return 0.9;
  
  // Calculate Levenshtein distance
  const costs = [];
  for (let i = 0; i <= longer.length; i++) {
    let lastValue = i;
    for (let j = 0; j <= shorter.length; j++) {
      if (i === 0) {
        costs[j] = j;
      } else if (j > 0) {
        let newValue = costs[j - 1];
        if (longer.charAt(i - 1) !== shorter.charAt(j - 1)) {
          newValue = Math.min(Math.min(newValue, lastValue), costs[j]) + 1;
        }
        costs[j - 1] = lastValue;
        lastValue = newValue;
      }
    }
    if (i > 0) costs[shorter.length] = lastValue;
  }
  
  return (longer.length - costs[shorter.length]) / longer.length;
};

export default function JobListing() {
  const { jobs, loading, fetchJobs, filters, setFilters } = useJobStore();
  const [searchParams, setSearchParams] = useSearchParams();
  const [showFilters, setShowFilters] = useState(false);
  const [searchInput, setSearchInput] = useState('');
  const [searchSuggestions, setSearchSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [allJobs, setAllJobs] = useState([]); // Store all jobs for suggestions

  // Initialize search from URL params
  useEffect(() => {
    const searchParam = searchParams.get('search');
    if (searchParam) {
      setSearchInput(searchParam);
      setFilters({ search: searchParam });
    }
  }, [searchParams, setFilters]);

  useEffect(() => {
    fetchJobs();
  }, [fetchJobs]);

  // Store all jobs for intelligent suggestions
  useEffect(() => {
    if (jobs.length > 0 && !filters.search && !filters.job_type && !filters.experience_level && !filters.location && !filters.skills) {
      setAllJobs(jobs);
    }
  }, [jobs, filters]);

  // Debounced search effect
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchInput !== filters.search) {
        handleSearch(searchInput);
      }
    }, 800); // Increased delay to give time to see suggestions

    return () => clearTimeout(timer);
  }, [searchInput]);

  // Generate intelligent search suggestions from ALL jobs (not filtered)
  useEffect(() => {
    if (searchInput.length > 2) {
      const jobsToSearch = allJobs.length > 0 ? allJobs : jobs;
      const allSearchableText = jobsToSearch.flatMap(job => [
        job.title,
        job.description,
        job.location,
        ...(job.skills_required || [])
      ]);

      const uniqueTerms = [...new Set(allSearchableText.filter(Boolean))];
      
      const suggestions = uniqueTerms
        .map(term => ({
          term,
          similarity: calculateSimilarity(searchInput, term)
        }))
        .filter(item => item.similarity > 0.4)
        .sort((a, b) => b.similarity - a.similarity)
        .slice(0, 5)
        .map(item => item.term);

      setSearchSuggestions(suggestions);
      setShowSuggestions(suggestions.length > 0);
    } else {
      setSearchSuggestions([]);
      setShowSuggestions(false);
    }
  }, [searchInput, allJobs, jobs]);

  const handleSearch = (value) => {
    setFilters({ search: value });
    // Update URL params
    if (value) {
      setSearchParams({ search: value });
    } else {
      setSearchParams({});
    }
    fetchJobs();
  };

  const handleFilterChange = (key, value) => {
    setFilters({ [key]: value });
  };

  const handleApplyFilters = () => {
    fetchJobs();
  };

  const handleClearFilters = () => {
    setFilters({
      search: '',
      job_type: '',
      experience_level: '',
      location: '',
      min_salary: '',
      max_salary: '',
      skills: '',
    });
    setSearchInput('');
    fetchJobs();
  };

  const handleSuggestionClick = (suggestion) => {
    setSearchInput(suggestion);
    setFilters({ search: suggestion });
    setShowSuggestions(false);
    fetchJobs();
  };

  const activeFiltersCount = useMemo(() => {
    return Object.entries(filters).filter(([key, value]) => value && key !== 'search').length;
  }, [filters]);

  if (loading && jobs.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Browse Cybersecurity Jobs</h1>
        <p className="text-gray-600">Find your next career opportunity</p>
      </div>

      {/* Search Section */}
      <div className="mb-6">
        <div className="relative">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
            <Input
              type="text"
              placeholder="Search jobs by title, skills, location... (intelligent search enabled)"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              onFocus={() => searchSuggestions.length > 0 && setShowSuggestions(true)}
              className="pl-10 pr-10 h-12 text-lg"
            />
            {searchInput && (
              <button
                onClick={() => {
                  setSearchInput('');
                  handleSearch('');
                }}
                className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            )}
          </div>
          
          {/* Search Suggestions Dropdown */}
          {showSuggestions && searchSuggestions.length > 0 && (
            <div className="absolute z-10 w-full mt-2 bg-white border rounded-lg shadow-lg">
              <div className="p-2">
                <p className="text-xs text-gray-500 px-2 py-1">Suggestions based on your search:</p>
                {searchSuggestions.map((suggestion, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSuggestionClick(suggestion)}
                    className="w-full text-left px-3 py-2 hover:bg-gray-100 rounded text-sm"
                  >
                    <Search className="inline h-4 w-4 mr-2 text-gray-400" />
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Filter Toggle Button */}
      <div className="mb-6">
        <Button
          variant="outline"
          onClick={() => setShowFilters(!showFilters)}
          className="w-full md:w-auto"
        >
          <Filter className="h-4 w-4 mr-2" />
          {showFilters ? 'Hide Filters' : 'Show Filters'}
          {activeFiltersCount > 0 && (
            <Badge variant="default" className="ml-2">
              {activeFiltersCount}
            </Badge>
          )}
        </Button>
      </div>

      {/* Filters Section */}
      {showFilters && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Filters</CardTitle>
            <CardDescription>Refine your job search</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Job Type */}
              <div className="space-y-2">
                <Label>Job Type</Label>
                <Select
                  value={filters.job_type || 'all'}
                  onValueChange={(value) => handleFilterChange('job_type', value === 'all' ? '' : value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select job type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="full_time">Full Time</SelectItem>
                    <SelectItem value="part_time">Part Time</SelectItem>
                    <SelectItem value="contract">Contract</SelectItem>
                    <SelectItem value="internship">Internship</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Experience Level */}
              <div className="space-y-2">
                <Label>Experience Level</Label>
                <Select
                  value={filters.experience_level || 'all'}
                  onValueChange={(value) => handleFilterChange('experience_level', value === 'all' ? '' : value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select experience level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Levels</SelectItem>
                    <SelectItem value="entry">Entry Level</SelectItem>
                    <SelectItem value="mid">Mid Level</SelectItem>
                    <SelectItem value="senior">Senior Level</SelectItem>
                    <SelectItem value="lead">Lead</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Location */}
              <div className="space-y-2">
                <Label>Location</Label>
                <Input
                  type="text"
                  placeholder="Enter location"
                  value={filters.location}
                  onChange={(e) => handleFilterChange('location', e.target.value)}
                />
              </div>

              {/* Min Salary */}
              <div className="space-y-2">
                <Label>Min Salary</Label>
                <Input
                  type="number"
                  placeholder="e.g., 50000"
                  value={filters.min_salary}
                  onChange={(e) => handleFilterChange('min_salary', e.target.value)}
                />
              </div>

              {/* Max Salary */}
              <div className="space-y-2">
                <Label>Max Salary</Label>
                <Input
                  type="number"
                  placeholder="e.g., 150000"
                  value={filters.max_salary}
                  onChange={(e) => handleFilterChange('max_salary', e.target.value)}
                />
              </div>

              {/* Skills */}
              <div className="space-y-2">
                <Label>Skills (comma-separated)</Label>
                <Input
                  type="text"
                  placeholder="e.g., Python, Security, SIEM"
                  value={filters.skills}
                  onChange={(e) => handleFilterChange('skills', e.target.value)}
                />
              </div>
            </div>

            <div className="flex gap-4 mt-6">
              <Button onClick={handleApplyFilters} className="flex-1 md:flex-initial">
                Apply Filters
              </Button>
              <Button
                variant="outline"
                onClick={handleClearFilters}
                className="flex-1 md:flex-initial"
              >
                Clear All
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Results Section */}
      <div className="mb-4">
        <p className="text-sm text-gray-600">
          {jobs.length} {jobs.length === 1 ? 'job' : 'jobs'} found
          {loading && <span className="ml-2 text-primary">Updating...</span>}
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {jobs.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600">No jobs found matching your criteria.</p>
            <Button
              variant="outline"
              onClick={handleClearFilters}
              className="mt-4"
            >
              Clear Filters
            </Button>
          </div>
        ) : (
          jobs.map((job) => (
            <Card key={job.id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-xl">{job.title}</CardTitle>
                    <CardDescription className="mt-2">
                      {job.created_by?.company_name || job.created_by?.email}
                    </CardDescription>
                  </div>
                  <Badge>{job.job_type}</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4 line-clamp-2">{job.description}</p>
                
                <div className="flex flex-wrap gap-4 mb-4">
                  <div className="flex items-center text-sm text-gray-600">
                    <MapPin className="h-4 w-4 mr-1" />
                    {job.location}
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <Briefcase className="h-4 w-4 mr-1" />
                    {job.experience_level}
                  </div>
                  {job.salary_min && job.salary_max && (
                    <div className="flex items-center text-sm text-gray-600">
                      <DollarSign className="h-4 w-4 mr-1" />
                      ${job.salary_min} - ${job.salary_max}
                    </div>
                  )}
                </div>

                <div className="flex justify-between items-center">
                  <div className="flex flex-wrap gap-2">
                    {job.skills_required?.slice(0, 3).map((skill, idx) => (
                      <Badge key={idx} variant="outline">{skill}</Badge>
                    ))}
                  </div>
                  <Link to={`/jobs/${job.id}`}>
                    <Button>View Details</Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}

