import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus } from 'lucide-react';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../lib/auth';
import Layout from '../components/Layout';
import JobComponent from '../components/JobComponent';
import Toolbar from '../components/Toolbar';
import AddJobModal from '../components/AddJobModal';
import JobDetailModal from '../components/JobDetailModal';
import PressView from '../components/PressView';

const Jobs = () => {
  const [jobs, setJobs] = useState([]);
  const [filteredJobs, setFilteredJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('list'); // Default to list view
  const [filterMode, setFilterMode] = useState('all');
  const [sortMode, setSortMode] = useState('newest');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showPressView, setShowPressView] = useState(false);
  const [selectedJob, setSelectedJob] = useState(null);
  const [editingJob, setEditingJob] = useState(null);
  const { isAdmin } = useAuth();

  // Load saved preferences from localStorage on component mount
  useEffect(() => {
    const savedViewMode = localStorage.getItem('jobsViewMode');
    const savedFilterMode = localStorage.getItem('jobsFilterMode');
    const savedSortMode = localStorage.getItem('jobsSortMode');

    if (savedViewMode && savedViewMode !== 'press') { // Don't restore press view
      setViewMode(savedViewMode);
    }
    if (savedFilterMode) {
      setFilterMode(savedFilterMode);
    }
    if (savedSortMode) {
      setSortMode(savedSortMode);
    }
  }, []);

  // Save view mode to localStorage whenever it changes
  const handleViewModeChange = (newViewMode) => {
    setViewMode(newViewMode);
    if (newViewMode !== 'press') { // Don't save press view as preference
      localStorage.setItem('jobsViewMode', newViewMode);
    }
  };

  // Save filter mode to localStorage whenever it changes
  const handleFilterModeChange = (newFilterMode) => {
    setFilterMode(newFilterMode);
    localStorage.setItem('jobsFilterMode', newFilterMode);
  };

  // Save sort mode to localStorage whenever it changes
  const handleSortModeChange = (newSortMode) => {
    setSortMode(newSortMode);
    localStorage.setItem('jobsSortMode', newSortMode);
  };

  // Handle opening press view
  const handlePressViewOpen = () => {
    setShowPressView(true);
  };

  // Handle closing press view
  const handlePressViewClose = () => {
    setShowPressView(false);
  };

  useEffect(() => {
    const q = query(collection(db, 'jobs'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const jobsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setJobs(jobsData);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  useEffect(() => {
    let filtered = [...jobs];

    // Apply filters
    switch (filterMode) {
      case 'open':
        filtered = filtered.filter(job => job.status !== 'completed');
        break;
      case 'completed':
        filtered = filtered.filter(job => job.status === 'completed');
        break;
      case 'hot':
        filtered = filtered.filter(job => job.hot);
        break;
    }

    // Apply sorting
    filtered.sort((a, b) => {
      const aDate = a.createdAt?.toDate() || new Date(0);
      const bDate = b.createdAt?.toDate() || new Date(0);
      
      if (sortMode === 'newest') {
        return bDate - aDate;
      } else {
        return aDate - bDate;
      }
    });

    setFilteredJobs(filtered);
  }, [jobs, filterMode, sortMode]);

  const handleJobClick = (job) => {
    setSelectedJob(job);
    setShowDetailModal(true);
  };

  const handleEditJob = (job) => {
    setEditingJob(job);
    setShowAddModal(true);
  };

  const handleCloseDetailModal = () => {
    setShowDetailModal(false);
    setSelectedJob(null);
  };

  const handleCloseAddModal = () => {
    setShowAddModal(false);
    setEditingJob(null);
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
        </div>
      </Layout>
    );
  }

  return (
    <>
      <Layout>
        <div className="space-y-6">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex justify-between items-center"
          >
            <h1 className="text-3xl font-bold text-gray-900">Print Jobs</h1>
          </motion.div>

          <Toolbar
            viewMode={viewMode}
            onViewModeChange={handleViewModeChange}
            filterMode={filterMode}
            onFilterModeChange={handleFilterModeChange}
            sortMode={sortMode}
            onSortModeChange={handleSortModeChange}
            jobCount={filteredJobs.length}
            onPressViewOpen={handlePressViewOpen}
          />

          <AnimatePresence>
            {filteredJobs.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-12"
              >
                <p className="text-gray-500 text-lg">No jobs found</p>
                {isAdmin() && (
                  <button
                    onClick={() => setShowAddModal(true)}
                    className="mt-4 bg-primary-500 text-white px-6 py-2 rounded-md hover:bg-primary-600"
                  >
                    Add First Job
                  </button>
                )}
              </motion.div>
            ) : (
              <div className={
                viewMode === 'grid' 
                  ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4'
                  : 'space-y-3'  // List view - vertical stack with spacing
              }>
                {filteredJobs.map((job) => (
                  <JobComponent
                    key={job.id}
                    job={job}
                    onClick={handleJobClick}
                    viewMode={viewMode}
                  />
                ))}
              </div>
            )}
          </AnimatePresence>
        </div>

        {isAdmin() && (
          <motion.button
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowAddModal(true)}
            className="fixed bottom-8 right-8 bg-primary-500 text-white w-16 h-16 rounded-full shadow-lg hover:bg-primary-600 flex items-center justify-center z-40"
          >
            <Plus className="w-8 h-8" />
          </motion.button>
        )}

        <AddJobModal
          isOpen={showAddModal}
          onClose={handleCloseAddModal}
          editJob={editingJob}
        />

        <JobDetailModal
          isOpen={showDetailModal}
          onClose={handleCloseDetailModal}
          job={selectedJob}
          onEdit={handleEditJob}
        />
      </Layout>

      {/* Press View - Fullscreen overlay */}
      <PressView
        isOpen={showPressView}
        onClose={handlePressViewClose}
        jobs={jobs} // Pass all jobs, not filtered ones
      />
    </>
  );
};

export default Jobs;