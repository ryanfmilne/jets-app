import { motion } from 'framer-motion';
import { Flame, CheckCircle } from 'lucide-react';

const JobComponent = ({ job, onClick }) => {
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

      {/* Hover indicator */}
      <div className="mt-3 text-xs text-gray-400 text-center opacity-0 group-hover:opacity-100 transition-opacity">
        Click to view details
      </div>
    </motion.div>
  );
};

export default JobComponent;