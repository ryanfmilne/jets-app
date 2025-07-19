import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Clock, Flame, Printer, CheckCircle, Edit, Trash2, FileText, Package, User } from 'lucide-react';
import { useAuth } from '../lib/auth';
import { doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { toast } from 'react-hot-toast';
import UserAvatar from './UserAvatar';

const JobDetailModal = ({ isOpen, onClose, job, onEdit }) => {
  const { isAdmin } = useAuth();
  const [isCompleting, setIsCompleting] = useState(false);

  if (!job) return null;

  const handleComplete = async () => {
    if (job.status === 'completed') return;
    
    setIsCompleting(true);
    try {
      await updateDoc(doc(db, 'jobs', job.id), {
        status: 'completed',
        completedAt: new Date(),
      });
      toast.success('Job marked as completed!');
      onClose(); // Close modal after completing
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
        onClose(); // Close modal after deleting
      } catch (error) {
        toast.error('Error deleting job');
      }
    }
  };

  const handleEdit = () => {
    onClose(); // Close detail modal
    onEdit(job); // Open edit modal
  };

  // Format plate bin display
  const formatPlateBin = (plateBin) => {
    if (!plateBin || plateBin === 'Waiting on Plates') {
      return 'Waiting on Plates';
    }
    return `Bin ${plateBin}`;
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 overflow-y-auto"
        >
          <div className="flex items-center justify-center min-h-screen px-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-gray-500 bg-opacity-75"
              onClick={onClose}
            />
            
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative bg-white rounded-lg max-w-2xl w-full mx-auto shadow-xl"
            >
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b">
                <div className="flex items-center space-x-3">
                  <h2 className="text-xl font-semibold text-gray-900">{job.title}</h2>
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
                <div className="flex items-center space-x-2">
                  {isAdmin() && (
                    <>
                      <button
                        onClick={handleEdit}
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
                  <button
                    onClick={onClose}
                    className="p-2 text-gray-400 hover:text-gray-600 rounded-md hover:bg-gray-100"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Content */}
              <div className="p-6">
                {/* Job Creator Information */}
                {job.createdBy && (
                  <div className="mb-6 p-4 bg-gray-50 rounded-lg border">
                    <div className="flex items-center space-x-2 mb-3">
                      <User className="w-4 h-4 text-gray-600" />
                      <h3 className="text-sm font-medium text-gray-700">Created By</h3>
                    </div>
                    <div className="flex items-center space-x-3">
                      <UserAvatar 
                        user={job.createdBy} 
                        size="md"
                        showBorder={true}
                      />
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {job.createdBy.firstName} {job.createdBy.lastName}
                        </p>
                        <p className="text-xs text-gray-500 capitalize">
                          {job.createdBy.role}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Job Info */}
                <div className="flex items-center space-x-6 text-sm text-gray-600 mb-6">
                  <span className="flex items-center">
                    <Clock className="w-4 h-4 mr-2" />
                    Created: {new Date(job.createdAt?.toDate()).toLocaleDateString()}
                  </span>
                  <span className="flex items-center">
                    <Printer className="w-4 h-4 mr-2" />
                    {job.pressName || 'No Press Assigned'}
                  </span>
                </div>

                {/* Image */}
                {job.imageUrl && (
                  <div className="mb-6">
                    <h3 className="text-sm font-medium text-gray-700 mb-2">Job Image</h3>
                    <img
                      src={job.imageUrl}
                      alt={job.title}
                      className="w-full h-64 object-cover rounded-md border"
                    />
                  </div>
                )}

                {/* Details Grid */}
                <div className="grid grid-cols-2 gap-6 mb-6">
                  <div>
                    <h3 className="text-sm font-medium text-gray-700 mb-2">Quantity</h3>
                    <p className="text-2xl font-bold text-gray-900">{job.quantity}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-700 mb-2">Status</h3>
                    <span className={`inline-flex px-3 py-1 text-sm font-medium rounded-full ${
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

                {/* Plate Bin */}
                <div className="mb-6">
                  <div className="flex items-center space-x-2 mb-2">
                    <Package className="w-4 h-4 text-gray-600" />
                    <h3 className="text-sm font-medium text-gray-700">Plate Bin</h3>
                  </div>
                  <span className={`inline-flex px-3 py-1 text-sm font-medium rounded-full ${
                    job.plateBin && job.plateBin !== 'Waiting on Plates'
                      ? 'bg-blue-100 text-blue-800'
                      : 'bg-orange-100 text-orange-800'
                  }`}>
                    {formatPlateBin(job.plateBin)}
                  </span>
                </div>

                {/* Colors */}
                {(job.frontColor1 || job.frontColor2 || job.backColor1 || job.backColor2) && (
                  <div className="mb-6">
                    <h3 className="text-sm font-medium text-gray-700 mb-3">Print Colors</h3>
                    <div className="grid grid-cols-2 gap-3">
                      {job.frontColor1 && (
                        <div className="flex items-center space-x-3 p-2 bg-gray-50 rounded-md">
                          <div className="w-6 h-6 rounded border-2 border-gray-300" style={{ backgroundColor: job.frontColor1 }}></div>
                          <span className="text-sm text-gray-700 font-medium">Front Color 1</span>
                        </div>
                      )}
                      {job.frontColor2 && (
                        <div className="flex items-center space-x-3 p-2 bg-gray-50 rounded-md">
                          <div className="w-6 h-6 rounded border-2 border-gray-300" style={{ backgroundColor: job.frontColor2 }}></div>
                          <span className="text-sm text-gray-700 font-medium">Front Color 2</span>
                        </div>
                      )}
                      {job.backColor1 && (
                        <div className="flex items-center space-x-3 p-2 bg-gray-50 rounded-md">
                          <div className="w-6 h-6 rounded border-2 border-gray-300" style={{ backgroundColor: job.backColor1 }}></div>
                          <span className="text-sm text-gray-700 font-medium">Back Color 1</span>
                        </div>
                      )}
                      {job.backColor2 && (
                        <div className="flex items-center space-x-3 p-2 bg-gray-50 rounded-md">
                          <div className="w-6 h-6 rounded border-2 border-gray-300" style={{ backgroundColor: job.backColor2 }}></div>
                          <span className="text-sm text-gray-700 font-medium">Back Color 2</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Notes */}
                {job.notes && (
                  <div className="mb-6">
                    <div className="flex items-center space-x-2 mb-3">
                      <FileText className="w-4 h-4 text-gray-600" />
                      <h3 className="text-sm font-medium text-gray-700">Notes</h3>
                    </div>
                    <div className="p-3 bg-gray-50 rounded-md border">
                      <p className="text-sm text-gray-600 whitespace-pre-wrap">{job.notes}</p>
                    </div>
                  </div>
                )}

                {/* Complete Button */}
                {job.status !== 'completed' && (
                  <button
                    onClick={handleComplete}
                    disabled={isCompleting}
                    className="w-full bg-primary-500 text-white py-3 px-4 rounded-md hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center text-sm font-medium"
                  >
                    {isCompleting ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    ) : (
                      <CheckCircle className="w-4 h-4 mr-2" />
                    )}
                    Mark Job Complete
                  </button>
                )}
              </div>
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default JobDetailModal;