import { useState } from 'react';
import { motion } from 'framer-motion';
import { Grid, List, Filter, SortDesc } from 'lucide-react';

const Toolbar = ({ 
  viewMode, 
  onViewModeChange, 
  filterMode, 
  onFilterModeChange, 
  sortMode, 
  onSortModeChange,
  jobCount 
}) => {
  const [showFilters, setShowFilters] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-lg shadow-sm p-4 mb-6"
    >
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
        <div className="flex items-center space-x-4">
          <span className="text-sm font-medium text-gray-700">
            {jobCount} Jobs
          </span>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={() => onViewModeChange('list')}
              className={`p-2 rounded-md ${
                viewMode === 'list' 
                  ? 'bg-primary-100 text-primary-700' 
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <List className="w-4 h-4" />
            </button>
            <button
              onClick={() => onViewModeChange('grid')}
              className={`p-2 rounded-md ${
                viewMode === 'grid' 
                  ? 'bg-primary-100 text-primary-700' 
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <Grid className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Filter className="w-4 h-4 text-gray-600" />
            <select
              value={filterMode}
              onChange={(e) => onFilterModeChange(e.target.value)}
              className="text-sm border border-gray-300 rounded-md px-3 py-1 focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="all">All Jobs</option>
              <option value="open">Open Jobs</option>
              <option value="completed">Completed Jobs</option>
              <option value="hot">Hot Jobs</option>
            </select>
          </div>

          <div className="flex items-center space-x-2">
            <SortDesc className="w-4 h-4 text-gray-600" />
            <select
              value={sortMode}
              onChange={(e) => onSortModeChange(e.target.value)}
              className="text-sm border border-gray-300 rounded-md px-3 py-1 focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
            </select>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default Toolbar;