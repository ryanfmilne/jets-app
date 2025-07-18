import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Upload, Flame } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { collection, addDoc, getDocs, updateDoc, doc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../lib/firebase';
import { toast } from 'react-hot-toast';

const AddJobModal = ({ isOpen, onClose, editJob = null }) => {
  const [colors, setColors] = useState([]);
  const [presses, setPresses] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  const { register, handleSubmit, reset, setValue, watch, formState: { errors } } = useForm();

  useEffect(() => {
    if (isOpen) {
      loadColors();
      loadPresses();
      if (editJob) {
        // Populate form with existing job data
        setValue('title', editJob.title);
        setValue('quantity', editJob.quantity);
        setValue('hot', editJob.hot);
        setValue('frontColor1', editJob.frontColor1);
        setValue('frontColor2', editJob.frontColor2);
        setValue('backColor1', editJob.backColor1);
        setValue('backColor2', editJob.backColor2);
        setValue('pressId', editJob.pressId);
        setValue('notes', editJob.notes || ''); // Add notes field
        if (editJob.imageUrl) {
          setImagePreview(editJob.imageUrl);
        }
      }
    }
  }, [isOpen, editJob, setValue]);

  const loadColors = async () => {
    try {
      const colorsSnapshot = await getDocs(collection(db, 'colors'));
      const colorsData = colorsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setColors(colorsData);
    } catch (error) {
      console.error('Error loading colors:', error);
    }
  };

  const loadPresses = async () => {
    try {
      const pressesSnapshot = await getDocs(collection(db, 'presses'));
      const pressesData = pressesSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setPresses(pressesData);
    } catch (error) {
      console.error('Error loading presses:', error);
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onload = (e) => setImagePreview(e.target.result);
      reader.readAsDataURL(file);
    }
  };

  const onSubmit = async (data) => {
    try {
      setUploading(true);
      
      let imageUrl = editJob?.imageUrl || null;
      
      if (imageFile) {
        const imageRef = ref(storage, `job-images/${Date.now()}-${imageFile.name}`);
        await uploadBytes(imageRef, imageFile);
        imageUrl = await getDownloadURL(imageRef);
      }

      const selectedPress = presses.find(p => p.id === data.pressId);
      
      const jobData = {
        title: data.title,
        quantity: parseInt(data.quantity),
        hot: data.hot || false,
        frontColor1: data.frontColor1 || null,
        frontColor2: data.frontColor2 || null,
        backColor1: data.backColor1 || null,
        backColor2: data.backColor2 || null,
        pressId: data.pressId || null,
        pressName: selectedPress?.name || null,
        notes: data.notes || null, // Add notes to job data
        imageUrl,
        status: editJob?.status || 'open',
        createdAt: editJob?.createdAt || new Date(),
        updatedAt: new Date(),
      };

      if (editJob) {
        // Update existing job
        await updateDoc(doc(db, 'jobs', editJob.id), jobData);
        toast.success('Job updated successfully!');
      } else {
        // Create new job
        await addDoc(collection(db, 'jobs'), jobData);
        toast.success('Job added successfully!');
      }

      handleClose();
    } catch (error) {
      console.error('Error saving job:', error);
      toast.error('Error saving job. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const handleClose = () => {
    reset();
    setImageFile(null);
    setImagePreview(null);
    onClose();
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
              onClick={handleClose}
            />
            
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative bg-white rounded-lg max-w-2xl w-full mx-auto shadow-xl"
            >
              <div className="flex items-center justify-between p-6 border-b">
                <h2 className="text-xl font-semibold text-gray-900">
                  {editJob ? 'Edit Job' : 'Add New Job'}
                </h2>
                <button
                  onClick={handleClose}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <form onSubmit={handleSubmit(onSubmit)} className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Job Title *
                    </label>
                    <input
                      {...register('title', { required: 'Title is required' })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                      placeholder="Enter job title"
                    />
                    {errors.title && (
                      <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Quantity *
                    </label>
                    <input
                      type="number"
                      {...register('quantity', { required: 'Quantity is required', min: 1 })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                      placeholder="Enter quantity"
                    />
                    {errors.quantity && (
                      <p className="mt-1 text-sm text-red-600">{errors.quantity.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Press
                    </label>
                    <select
                      {...register('pressId')}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                    >
                      <option value="">Select a press</option>
                      {presses.map(press => (
                        <option key={press.id} value={press.id}>
                          {press.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="md:col-span-2">
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        {...register('hot')}
                        className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                      />
                      <span className="text-sm font-medium text-gray-700 flex items-center">
                        <Flame className="w-4 h-4 mr-1 text-red-500" />
                        Hot Job (Urgent)
                      </span>
                    </label>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Front Color 1 *
                    </label>
                    <select
                      {...register('frontColor1', { required: 'Front color 1 is required' })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                    >
                      <option value="">Select front color 1</option>
                      {colors.map(color => (
                        <option key={color.id} value={color.hex}>
                          {color.name}
                        </option>
                      ))}
                    </select>
                    {errors.frontColor1 && (
                      <p className="mt-1 text-sm text-red-600">{errors.frontColor1.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Front Color 2
                    </label>
                    <select
                      {...register('frontColor2')}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                    >
                      <option value="">Select front color 2</option>
                      {colors.map(color => (
                        <option key={color.id} value={color.hex}>
                          {color.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Back Color 1
                    </label>
                    <select
                      {...register('backColor1')}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                    >
                      <option value="">Select back color 1</option>
                      {colors.map(color => (
                        <option key={color.id} value={color.hex}>
                          {color.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Back Color 2
                    </label>
                    <select
                      {...register('backColor2')}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                    >
                      <option value="">Select back color 2</option>
                      {colors.map(color => (
                        <option key={color.id} value={color.hex}>
                          {color.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Job Image
                    </label>
                    <div className="flex items-center space-x-4">
                      <input
                        type="file"
                        accept="image/*,.pdf"
                        onChange={handleImageChange}
                        className="hidden"
                        id="image-upload"
                      />
                      <label
                        htmlFor="image-upload"
                        className="cursor-pointer bg-gray-100 hover:bg-gray-200 px-4 py-2 rounded-md border border-gray-300 flex items-center space-x-2"
                      >
                        <Upload className="w-4 h-4" />
                        <span>Choose File</span>
                      </label>
                      {imagePreview && (
                        <div className="w-20 h-20 rounded-md overflow-hidden border">
                          <img
                            src={imagePreview}
                            alt="Preview"
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}
                    </div>
                  </div>

                  {/* NEW NOTES FIELD */}
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Notes
                    </label>
                    <textarea
                      {...register('notes')}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                      placeholder="Add any special instructions or notes for this job..."
                      rows="3"
                    />
                  </div>
                </div>

                <div className="flex justify-end space-x-4 mt-8">
                  <button
                    type="button"
                    onClick={handleClose}
                    className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={uploading}
                    className="px-4 py-2 bg-primary-500 text-white rounded-md hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                  >
                    {uploading && (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    )}
                    {editJob ? 'Update Job' : 'Add Job'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default AddJobModal;