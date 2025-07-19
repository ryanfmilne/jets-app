import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Printer, FileText, Upload, Camera, Settings } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { addDoc, updateDoc, doc, collection } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../lib/firebase';
import { toast } from 'react-hot-toast';

const PressModal = ({ isOpen, onClose, editPress = null }) => {
  const [saving, setSaving] = useState(false);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm();

  useEffect(() => {
    if (isOpen) {
      if (editPress) {
        // Populate form with existing press data
        setValue('name', editPress.name || '');
        setValue('description', editPress.description || '');
        setValue('pressType', editPress.pressType || 'Jet Press');
        
        // Set existing image if available
        if (editPress.imageUrl) {
          setImagePreview(editPress.imageUrl);
        } else {
          setImagePreview(null);
        }
      } else {
        // Clear form for new press and set default press type
        reset();
        setValue('pressType', 'Jet Press'); // Set default value
        setImagePreview(null);
        setImageFile(null);
      }
    }
  }, [isOpen, editPress, setValue, reset]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast.error('Please select an image file');
        return;
      }
      
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Image size should be less than 5MB');
        return;
      }

      setImageFile(file);
      const reader = new FileReader();
      reader.onload = (e) => setImagePreview(e.target.result);
      reader.readAsDataURL(file);
    }
  };

  const onSubmit = async (data) => {
    setSaving(true);
    try {
      let imageUrl = editPress?.imageUrl || null;
      
      // Upload press image if selected
      if (imageFile) {
        const imageRef = ref(storage, `press-images/${Date.now()}-${imageFile.name}`);
        await uploadBytes(imageRef, imageFile);
        imageUrl = await getDownloadURL(imageRef);
      }

      const pressData = {
        name: data.name.trim(),
        description: data.description?.trim() || '',
        pressType: data.pressType,
        imageUrl: imageUrl,
        updatedAt: new Date(),
      };

      if (editPress) {
        // Update existing press
        await updateDoc(doc(db, 'presses', editPress.id), pressData);
        toast.success('Press updated successfully!');
      } else {
        // Create new press
        await addDoc(collection(db, 'presses'), {
          ...pressData,
          createdAt: new Date(),
        });
        toast.success('Press added successfully!');
      }

      handleClose();
    } catch (error) {
      console.error('Error saving press:', error);
      toast.error('Error saving press. Please try again.');
    } finally {
      setSaving(false);
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
              className="relative bg-white rounded-lg max-w-md w-full mx-auto shadow-xl"
            >
              <div className="flex items-center justify-between p-6 border-b">
                <h2 className="text-xl font-semibold text-gray-900">
                  {editPress ? 'Edit Press' : 'Add New Press'}
                </h2>
                <button
                  onClick={handleClose}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <form onSubmit={handleSubmit(onSubmit)} className="p-6">
                <div className="space-y-4">
                  {/* Press Image Upload Section */}
                  <div className="flex flex-col items-center mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-3 text-center">
                      <Camera className="w-4 h-4 inline mr-1" />
                      Press Image
                    </label>
                    
                    <div className="relative">
                      <div className="w-32 h-24 rounded-lg overflow-hidden border-4 border-gray-200 bg-gray-100 flex items-center justify-center">
                        {imagePreview ? (
                          <img
                            src={imagePreview}
                            alt="Press"
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                            <Printer className="w-8 h-8 text-gray-400" />
                          </div>
                        )}
                      </div>
                      
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="hidden"
                        id="press-image-upload"
                      />
                      
                      <label
                        htmlFor="press-image-upload"
                        className="absolute bottom-0 right-0 bg-primary-500 text-white p-2 rounded-full cursor-pointer hover:bg-primary-600 shadow-lg"
                      >
                        <Upload className="w-3 h-3" />
                      </label>
                    </div>
                    
                    <p className="text-xs text-gray-500 mt-2 text-center">
                      Click the upload button to add an image<br />
                      Max size: 5MB
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <Printer className="w-4 h-4 inline mr-1" />
                      Press Name *
                    </label>
                    <input
                      {...register('name', { required: 'Press name is required' })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                      placeholder="Press 1"
                    />
                    {errors.name && (
                      <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <Settings className="w-4 h-4 inline mr-1" />
                      Press Type *
                    </label>
                    <select
                      {...register('pressType', { required: 'Press type is required' })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                    >
                      <option value="Jet Press">Jet Press</option>
                      <option value="Super Jet Press">Super Jet Press</option>
                    </select>
                    {errors.pressType && (
                      <p className="mt-1 text-sm text-red-600">{errors.pressType.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <FileText className="w-4 h-4 inline mr-1" />
                      Description
                    </label>
                    <textarea
                      {...register('description')}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                      placeholder="Description of the press..."
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
                    disabled={saving}
                    className="px-4 py-2 bg-primary-500 text-white rounded-md hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                  >
                    {saving && (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    )}
                    {editPress ? 'Update Press' : 'Add Press'}
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

export default PressModal;