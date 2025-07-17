import { useState } from 'react';
import { motion } from 'framer-motion';
import { Clock, Flame, Printer, CheckCircle, Edit, Trash2 } from 'lucide-react';
import { useAuth } from '../lib/auth';
import { doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { toast } from 'react-hot-toast';

const JobComponent = ({ job, onEdit, onDelete }) => {
  const { isAdmin } = useAuth();
  const [isCompleting, setIsCompleting] = useState(false);

  const handleComplete = async () => {
    if (job.status === 'completed') return;
    
    setIsCompleting(true);
    try {
      await updateDoc(doc(db, 'jobs', job.id), {
        status: 'completed',
        completedAt: new Date(),
      });
      toast.success('Job marked as completed!');
    } catch (error) {
      toast.error('Error updating job status');
    } finally {
      setIsCompleting(false);
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this job?')) {
      try {
        await deleteDoc(doc(db, 'jobs', job.id));
        toast.success('Job deleted successfully');
        onDelete?.(job.id);
      } catch (error) {
        toast.error('Error deleting job');
      }
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className={`bg-white rounded-lg shadow-md p-6 border-l-4 ${
        job.hot ? 'border-red-500' : 'border-gray-300'
      } ${job.status === 'completed' ? 'opacity-75' : ''}`}
    >
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          <div className="flex items-center space-x-2 mb-2">
            <h3 className="text-lg font-semibold text-gray-900">{job.title}</h3>
            {job.hot && (
              <motion.div
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ repeat: Infinity, duration: 1 }}
              >
                <Flame className="w-5 h-5 text-red-500" />
              </motion.div>
            )}
            {job.status === 'completed' && (
              <CheckCircle className="w-5 h-5 text-green-500" />
            )}
          </div>
          <div className="flex items-center space-x-4 text-sm text-gray-600">
            <span className="flex items-center">
              <Clock className="w-4 h-4 mr-1" />
              {new Date(job.createdAt?.toDate()).toLocaleDateString()}
            </span>
            <span className="flex items-center">
              <Printer className="w-4 h-4 mr-1" />
              {job.pressName || 'No Press'}
            </span>
          </div>
        </div>
        <div className="flex space-x-2">
          {isAdmin() && (
            <>
              <button
                onClick={() => onEdit(job)}
                className="p-2 text-gray-600 hover:text-primary-600 rounded-md hover:bg-gray-100"
              >
                <Edit className="w-4 h-4" />
              </button>
              <button
                onClick={handleDelete}
                className="p-2 text-gray-600 hover:text-red-600 rounded-md hover:bg-gray-100"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </>
          )}
        </div>
      </div>

      {job.imageUrl && (
        <div className="mb-4">
          <img
            src={job.imageUrl}
            alt={job.title}
            className="w-full h-48 object-cover rounded-md"
          />
        </div>
      )}

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <p className="text-sm font-medium text-gray-700">Quantity</p>
          <p className="text-lg font-semibold text-gray-900">{job.quantity}</p>
        </div>
        <div>
          <p className="text-sm font-medium text-gray-700">Status</p>
          <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
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

      {(job.frontColor1 || job.frontColor2 || job.backColor1 || job.backColor2) && (
        <div className="mb-4">
          <p className="text-sm font-medium text-gray-700 mb-2">Colors</p>
          <div className="grid grid-cols-2 gap-2">
            {job.frontColor1 && (
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 rounded" style={{ backgroundColor: job.frontColor1 }}></div>
                <span className="text-sm text-gray-600">Front 1</span>
              </div>
            )}
            {job.frontColor2 && (
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 rounded" style={{ backgroundColor: job.frontColor2 }}></div>
                <span className="text-sm text-gray-600">Front 2</span>
              </div>
            )}
            {job.backColor1 && (
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 rounded" style={{ backgroundColor: job.backColor1 }}></div>
                <span className="text-sm text-gray-600">Back 1</span>
              </div>
            )}
            {job.backColor2 && (
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 rounded" style={{ backgroundColor: job.backColor2 }}></div>
                <span className="text-sm text-gray-600">Back 2</span>
              </div>
            )}
          </div>
        </div>
      )}

      {job.status !== 'completed' && (
        <button
          onClick={handleComplete}
          disabled={isCompleting}
          className="w-full bg-primary-500 text-white py-2 px-4 rounded-md hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
        >
          {isCompleting ? (
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
          ) : (
            <CheckCircle className="w-4 h-4 mr-2" />
          )}
          Mark Complete
        </button>
      )}
    </motion.div>
  );
};

export default JobComponent;