import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Flame, CheckCircle, Clock, Package } from 'lucide-react';
import { collection, onSnapshot, doc, getDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';

const PressView = ({ isOpen, onClose, jobs }) => {
  const [presses, setPresses] = useState([]);
  const [settings, setSettings] = useState({});

  useEffect(() => {
    if (isOpen) {
      // Listen to presses for real-time updates
      const unsubscribe = onSnapshot(collection(db, 'presses'), (snapshot) => {
        const pressesData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setPresses(pressesData);
      });

      // Load settings
      const loadSettings = async () => {
        try {
          const settingsDoc = await getDoc(doc(db, 'settings', 'app'));
          if (settingsDoc.exists()) {
            setSettings(settingsDoc.data());
          } else {
            setSettings({ showPressImagesInPressView: false });
          }
        } catch (error) {
          console.error('Error loading settings:', error);
          setSettings({ showPressImagesInPressView: false });
        }
      };

      loadSettings();

      return unsubscribe;
    }
  }, [isOpen]);

  // Apply Priority First sorting to jobs
  const sortJobsByPriority = (jobsArray) => {
    return [...jobsArray].sort((a, b) => {
      const aDate = a.createdAt?.toDate() || new Date(0);
      const bDate = b.createdAt?.toDate() || new Date(0);
      
      // Priority sorting: Hot jobs first, then oldest within each group
      
      // If one is hot and the other isn't, hot job comes first
      if (a.hot && !b.hot) return -1;
      if (!a.hot && b.hot) return 1;
      
      // If both are hot or both are not hot, sort by oldest first
      return aDate - bDate;
    });
  };

  // Group jobs by press and sort presses alphabetically
  const groupJobsByPress = () => {
    const grouped = {};
    
    // Initialize with all presses
    presses.forEach(press => {
      grouped[press.id] = {
        press: press,
        jobs: []
      };
    });

    // Add jobs to their respective presses
    jobs.forEach(job => {
      if (job.pressId && grouped[job.pressId]) {
        grouped[job.pressId].jobs.push(job);
      } else {
        // Jobs without press assignment go to "Unassigned" column
        if (!grouped['unassigned']) {
          grouped['unassigned'] = {
            press: { id: 'unassigned', name: 'Unassigned', description: 'Jobs not assigned to any press' },
            jobs: []
          };
        }
        grouped['unassigned'].jobs.push(job);
      }
    });

    // Apply Priority First sorting to each press's jobs
    Object.keys(grouped).forEach(pressId => {
      grouped[pressId].jobs = sortJobsByPriority(grouped[pressId].jobs);
    });

    // Convert to array and sort presses alphabetically by name
    const pressGroups = Object.values(grouped);
    
    return pressGroups.sort((a, b) => {
      // Always put "Unassigned" column at the end
      if (a.press.id === 'unassigned') return 1;
      if (b.press.id === 'unassigned') return -1;
      
      // Sort all other presses alphabetically by name
      return a.press.name.localeCompare(b.press.name, undefined, { 
        sensitivity: 'base',
        numeric: true 
      });
    });
  };

  const formatPlateBin = (plateBin) => {
    if (!plateBin || plateBin === 'Waiting on Plates') {
      return 'Waiting on Plates';
    }
    return `Bin ${plateBin}`;
  };

  // Get background style for press header
  const getPressHeaderStyle = (press) => {
    const showImages = settings.showPressImagesInPressView;
    const hasImage = press.imageUrl;
    const isUnassigned = press.id === 'unassigned';

    if (!showImages || isUnassigned) {
      // Default solid colors
      return {
        background: isUnassigned ? '#4B5563' : '#2563EB' // gray-600 or primary-600
      };
    }

    if (hasImage) {
      // Press image with gradient overlay
      return {
        backgroundImage: `
          linear-gradient(135deg, 
            rgba(0, 0, 0, 0.85) 0%, 
            rgba(0, 0, 0, 0.65) 40%, 
            rgba(0, 0, 0, 0.25) 70%, 
            rgba(0, 0, 0, 0.1) 100%
          ),
          url(${press.imageUrl})
        `,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat'
      };
    } else {
      // Fallback to black if no image
      return {
        background: '#000000'
      };
    }
  };

  const pressGroups = groupJobsByPress();

  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-white z-50 overflow-hidden"
    >
      {/* Close Button */}
      <button
        onClick={onClose}
        className="absolute top-6 right-6 z-10 bg-gray-800 text-white p-3 rounded-full hover:bg-gray-700 transition-colors shadow-lg"
        aria-label="Close Press View"
      >
        <X className="w-6 h-6" />
      </button>

      {/* Header */}
      <div className="bg-gray-900 text-white py-6 px-8">
        <h1 className="text-4xl font-bold text-center">Press Status Board</h1>
        <p className="text-center text-gray-300 mt-2 text-lg">
          Real-time job assignments by press • Priority First sorting
        </p>
      </div>

      {/* Press Columns */}
      <div className="h-full bg-gray-100 overflow-x-auto pb-20">
        <div 
          className="flex h-full min-w-full px-4 py-6 gap-6"
          style={{ 
            gridTemplateColumns: `repeat(${pressGroups.length}, 1fr)`,
            display: 'grid'
          }}
        >
          {pressGroups.map((group, index) => (
            <motion.div
              key={group.press.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white rounded-lg shadow-lg flex flex-col min-h-0 overflow-hidden"
            >
              {/* Press Header with Background Image */}
              <div 
                className="p-6 rounded-t-lg text-white relative"
                style={getPressHeaderStyle(group.press)}
              >
                {/* Content overlay to ensure text is always readable */}
                <div className="relative z-10">
                  <h2 className="text-2xl font-bold mb-2 text-white drop-shadow-lg">
                    {group.press.name}
                  </h2>
                  <p className="text-sm opacity-90 leading-relaxed text-white drop-shadow">
                    {group.press.description}
                  </p>
                  <div className="mt-3 flex items-center justify-between">
                    <span className="text-sm font-medium text-white drop-shadow">
                      {group.jobs.length} Job{group.jobs.length !== 1 ? 's' : ''}
                    </span>
                    {group.jobs.filter(job => job.hot).length > 0 && (
                      <div className="flex items-center text-red-200">
                        <Flame className="w-4 h-4 mr-1 drop-shadow" />
                        <span className="text-sm drop-shadow">
                          {group.jobs.filter(job => job.hot).length} Hot
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Jobs List */}
              <div className="flex-1 p-4 overflow-y-auto space-y-3">
                <AnimatePresence>
                  {group.jobs.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <p className="text-lg">No jobs assigned</p>
                    </div>
                  ) : (
                    group.jobs.map((job, jobIndex) => (
                      <motion.div
                        key={job.id}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ delay: jobIndex * 0.05 }}
                        className={`p-4 rounded-lg border-l-4 shadow-sm ${
                          job.hot 
                            ? 'border-red-500 bg-red-50' 
                            : job.status === 'completed'
                            ? 'border-green-500 bg-green-50 opacity-75'
                            : 'border-blue-500 bg-blue-50'
                        }`}
                      >
                        {/* Job Header */}
                        <div className="flex items-start justify-between mb-2">
                          <h3 className="font-semibold text-lg text-gray-900 leading-tight">
                            {job.title}
                          </h3>
                          <div className="flex items-center space-x-1 ml-2">
                            {job.hot && (
                              <motion.div
                                animate={{ scale: [1, 1.2, 1] }}
                                transition={{ repeat: Infinity, duration: 1 }}
                              >
                                <Flame className="w-5 h-5 text-red-500" />
                              </motion.div>
                            )}
                            {job.status === 'completed' && (
                              <CheckCircle className="w-5 h-5 text-green-500" />
                            )}
                          </div>
                        </div>

                        {/* Job Details */}
                        <div className="space-y-2">
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-600">Quantity:</span>
                            <span className="font-bold text-lg text-gray-900">
                              {job.quantity}
                            </span>
                          </div>

                          <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-600">Plate Bin:</span>
                            <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                              job.plateBin && job.plateBin !== 'Waiting on Plates'
                                ? 'bg-blue-100 text-blue-800'
                                : 'bg-orange-100 text-orange-800'
                            }`}>
                              {formatPlateBin(job.plateBin)}
                            </span>
                          </div>

                          <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-600">Status:</span>
                            <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                              job.status === 'completed' 
                                ? 'bg-green-100 text-green-800' 
                                : job.status === 'in-progress'
                                ? 'bg-yellow-100 text-yellow-800'
                                : 'bg-gray-100 text-gray-800'
                            }`}>
                              {job.status}
                            </span>
                          </div>

                          {/* Colors */}
                          {(job.frontColor1 || job.frontColor2 || job.backColor1 || job.backColor2) && (
                            <div>
                              <span className="text-sm text-gray-600 block mb-1">Colors:</span>
                              <div className="flex space-x-1">
                                {job.frontColor1 && (
                                  <div 
                                    className="w-4 h-4 rounded border border-gray-300" 
                                    style={{ backgroundColor: job.frontColor1 }}
                                    title="Front Color 1"
                                  ></div>
                                )}
                                {job.frontColor2 && (
                                  <div 
                                    className="w-4 h-4 rounded border border-gray-300" 
                                    style={{ backgroundColor: job.frontColor2 }}
                                    title="Front Color 2"
                                  ></div>
                                )}
                                {job.backColor1 && (
                                  <div 
                                    className="w-4 h-4 rounded border border-gray-300" 
                                    style={{ backgroundColor: job.backColor1 }}
                                    title="Back Color 1"
                                  ></div>
                                )}
                                {job.backColor2 && (
                                  <div 
                                    className="w-4 h-4 rounded border border-gray-300" 
                                    style={{ backgroundColor: job.backColor2 }}
                                    title="Back Color 2"
                                  ></div>
                                )}
                              </div>
                            </div>
                          )}

                          {/* Created Date */}
                          <div className="flex items-center justify-between pt-2 border-t border-gray-200">
                            <div className="flex items-center text-xs text-gray-500">
                              <Clock className="w-3 h-3 mr-1" />
                              {new Date(job.createdAt?.toDate()).toLocaleDateString()}
                            </div>
                            {job.createdBy && (
                              <div className="text-xs text-gray-500">
                                by {job.createdBy.firstName} {job.createdBy.lastName}
                              </div>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    ))
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className="absolute bottom-0 left-0 right-0 bg-gray-900 text-white text-center py-3">
        <p className="text-sm">
          PrintQueue Status Board • Last updated: {new Date().toLocaleTimeString()}
        </p>
      </div>
    </motion.div>
  );
};

export default PressView;