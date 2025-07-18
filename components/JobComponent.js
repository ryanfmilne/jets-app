import { motion } from 'framer-motion';
import { Flame, CheckCircle, Clock, Printer } from 'lucide-react';

const JobComponent = ({ job, onClick, viewMode = 'grid' }) => {
  if (viewMode === 'list') {
    // List View Layout - Horizontal
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        onClick={() => onClick(job)}
        className={`bg-white rounded-lg shadow-md p-4 border-l-4 cursor-pointer hover:shadow-lg transition-shadow ${
          job.hot ? 'border-red-500' : 'border-gray-300'
        } ${job.status === 'completed' ? 'opacity-75' : ''}`}
      >
        <div className="flex items-center space-x-6">
          {/* Image */}
          <div className="flex-shrink-0">
            {job.imageUrl ? (
              <img
                src={job.imageUrl}
                alt={job.title}
                className="w-20 h-20 object-cover rounded-md"
              />
            ) : (
              <div className="w-20 h-20 bg-gray-100 rounded-md flex items-center justify-center">
                <span className="text-gray-400 text-xs">No Image</span>
              </div>
            )}
          </div>

          {/* Job Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-2 mb-1">
              <h3 className="text-lg font-semibold text-gray-900 truncate">{job.title}</h3>
              {job.hot && (
                <motion.div
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ repeat: Infinity, duration: 1 }}
                >
                  <Flame className="w-4 h-4 text-red-500" />
                </motion.div>
              )}
              {job.status === 'completed' && (
                <CheckCircle className="w-4 h-4 text-green-500" />
              )}
            </div>
            <div className="flex items-center space-x-4 text-sm text-gray-600">
              <span className="flex items-center">
                <Clock className="w-3 h-3 mr-1" />
                {new Date(job.createdAt?.toDate()).toLocaleDateString()}
              </span>
              <span className="flex items-center">
                <Printer className="w-3 h-3 mr-1" />
                {job.pressName || 'No Press'}
              </span>
            </div>
          </div>

          {/* Quantity */}
          <div className="flex-shrink-0 text-center">
            <p className="text-sm text-gray-600">Qty</p>
            <p className="text-xl font-bold text-gray-900">{job.quantity}</p>
          </div>

          {/* Colors */}
          <div className="flex-shrink-0">
            {(job.frontColor1 || job.frontColor2 || job.backColor1 || job.backColor2) ? (
              <div>
                <p className="text-sm text-gray-600 mb-1 text-center">Colors</p>
                <div className="flex space-x-1">
                  {job.frontColor1 && (
                    <div 
                      className="w-6 h-6 rounded border-2 border-gray-300" 
                      style={{ backgroundColor: job.frontColor1 }}
                      title="Front Color 1"
                    ></div>
                  )}
                  {job.frontColor2 && (
                    <div 
                      className="w-6 h-6 rounded border-2 border-gray-300" 
                      style={{ backgroundColor: job.frontColor2 }}
                      title="Front Color 2"
                    ></div>
                  )}
                  {job.backColor1 && (
                    <div 
                      className="w-6 h-6 rounded border-2 border-gray-300" 
                      style={{ backgroundColor: job.backColor1 }}
                      title="Back Color 1"
                    ></div>
                  )}
                  {job.backColor2 && (
                    <div 
                      className="w-6 h-6 rounded border-2 border-gray-300" 
                      style={{ backgroundColor: job.backColor2 }}
                      title="Back Color 2"
                    ></div>
                  )}
                </div>
              </div>
            ) : (
              <div className="w-24"> {/* Placeholder to maintain spacing */}
                <p className="text-sm text-gray-400 text-center">No Colors</p>
              </div>
            )}
          </div>

          {/* Status */}
          <div className="flex-shrink-0">
            <span className={`inline-flex px-3 py-1 text-xs font-medium rounded-full ${
              job.status === 'completed' 
                ? 'bg-green-100 text-green-800' 
                : job.status === 'in-progress'
                ? 'bg-yellow-100 text-yellow-800'
                : 'bg-gray-100 text-gray-800'
            }`}>
              {job.status}
            </span>
          </div>
        </div>
      </motion.div>
    );
  }

  // Grid View Layout - Vertical (Original compact design)
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      onClick={() => onClick(job)}
      className={`bg-white rounded-lg shadow-md p-4 border-l-4 cursor-pointer hover:shadow-lg transition-shadow ${
        job.hot ? 'border-red-500' : 'border-gray-300'
      } ${job.status === 'completed' ? 'opacity-75' : ''}`}
    >
      {/* Header with title and status icons */}
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-lg font-semibold text-gray-900 truncate flex-1 mr-2">{job.title}</h3>
        <div className="flex items-center space-x-1">
          {job.hot && (
            <motion.div
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ repeat: Infinity, duration: 1 }}
            >
              <Flame className="w-4 h-4 text-red-500" />
            </motion.div>
          )}
          {job.status === 'completed' && (
            <CheckCircle className="w-4 h-4 text-green-500" />
          )}
        </div>
      </div>

      {/* Image */}
      {job.imageUrl && (
        <div className="mb-3">
          <img
            src={job.imageUrl}
            alt={job.title}
            className="w-full h-32 object-cover rounded-md"
          />
        </div>
      )}

      {/* Quantity */}
      <div className="mb-3">
        <p className="text-sm text-gray-600">Quantity</p>
        <p className="text-xl font-bold text-gray-900">{job.quantity}</p>
      </div>

      {/* Colors */}
      {(job.frontColor1 || job.frontColor2 || job.backColor1 || job.backColor2) && (
        <div>
          <p className="text-sm text-gray-600 mb-2">Colors</p>
          <div className="flex space-x-2 flex-wrap">
            {job.frontColor1 && (
              <div 
                className="w-6 h-6 rounded border-2 border-gray-300 flex-shrink-0" 
                style={{ backgroundColor: job.frontColor1 }}
                title="Front Color 1"
              ></div>
            )}
            {job.frontColor2 && (
              <div 
                className="w-6 h-6 rounded border-2 border-gray-300 flex-shrink-0" 
                style={{ backgroundColor: job.frontColor2 }}
                title="Front Color 2"
              ></div>
            )}
            {job.backColor1 && (
              <div 
                className="w-6 h-6 rounded border-2 border-gray-300 flex-shrink-0" 
                style={{ backgroundColor: job.backColor1 }}
                title="Back Color 1"
              ></div>
            )}
            {job.backColor2 && (
              <div 
                className="w-6 h-6 rounded border-2 border-gray-300 flex-shrink-0" 
                style={{ backgroundColor: job.backColor2 }}
                title="Back Color 2"
              ></div>
            )}
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default JobComponent;