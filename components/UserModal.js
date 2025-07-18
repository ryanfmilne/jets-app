import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, User, Mail, Lock, Shield, Camera, Upload } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc, updateDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, auth, storage } from '../lib/firebase';
import { toast } from 'react-hot-toast';

const UserModal = ({ isOpen, onClose, editUser = null }) => {
  const [saving, setSaving] = useState(false);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const { register, handleSubmit, reset, setValue, watch, formState: { errors } } = useForm();

  // Watch firstName and lastName for initials
  const firstName = watch('firstName', '');
  const lastName = watch('lastName', '');

  useEffect(() => {
    if (isOpen) {
      if (editUser) {
        // Populate form with existing user data
        setValue('firstName', editUser.firstName || '');
        setValue('lastName', editUser.lastName || '');
        setValue('email', editUser.email || '');
        setValue('role', editUser.role || '');
        
        // Set existing avatar if available
        if (editUser.avatarUrl) {
          setImagePreview(editUser.avatarUrl);
        } else {
          setImagePreview(null);
        }
      } else {
        // Clear form for new user
        reset();
        setImagePreview(null);
        setImageFile(null);
      }
    }
  }, [isOpen, editUser, setValue, reset]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast.error('Please select an image file');
        return;
      }
      
      // Validate file size (max 2MB)
      if (file.size > 2 * 1024 * 1024) {
        toast.error('Image size should be less than 2MB');
        return;
      }

      setImageFile(file);
      const reader = new FileReader();
      reader.onload = (e) => setImagePreview(e.target.result);
      reader.readAsDataURL(file);
    }
  };

  const generateInitials = (first, last) => {
    const firstInitial = first?.charAt(0)?.toUpperCase() || '';
    const lastInitial = last?.charAt(0)?.toUpperCase() || '';
    return `${firstInitial}${lastInitial}`;
  };

  const onSubmit = async (data) => {
    setSaving(true);
    try {
      let avatarUrl = editUser?.avatarUrl || null;
      
      // Upload avatar image if selected
      if (imageFile) {
        const imageRef = ref(storage, `avatars/${Date.now()}-${imageFile.name}`);
        await uploadBytes(imageRef, imageFile);
        avatarUrl = await getDownloadURL(imageRef);
      }

      if (editUser) {
        // Update existing user
        console.log('Updating user:', editUser.id, data);
        
        const userRef = doc(db, 'users', editUser.id);
        await updateDoc(userRef, {
          firstName: data.firstName.trim(),
          lastName: data.lastName.trim(),
          role: data.role,
          avatarUrl: avatarUrl,
          updatedAt: new Date(),
        });
        
        toast.success('User updated successfully!');
      } else {
        // Create new user
        console.log('Creating new user:', data);
        
        // Create user account
        const userCredential = await createUserWithEmailAndPassword(
          auth,
          data.email.trim(),
          data.password
        );
        
        console.log('User created in Auth:', userCredential.user.uid);
        
        // Add user data to Firestore
        await setDoc(doc(db, 'users', userCredential.user.uid), {
          firstName: data.firstName.trim(),
          lastName: data.lastName.trim(),
          email: data.email.trim(),
          role: data.role,
          avatarUrl: avatarUrl,
          createdAt: new Date(),
        });
        
        console.log('User added to Firestore');
        
        toast.success('User created successfully! You may need to refresh the page.');
      }

      handleClose();
    } catch (error) {
      console.error('Error saving user:', error);
      console.error('Error code:', error.code);
      console.error('Error message:', error.message);
      
      // More specific error handling
      switch (error.code) {
        case 'auth/email-already-in-use':
          toast.error('Email address is already in use');
          break;
        case 'auth/weak-password':
          toast.error('Password should be at least 6 characters');
          break;
        case 'auth/invalid-email':
          toast.error('Invalid email address');
          break;
        case 'permission-denied':
          toast.error('Permission denied. Check your admin privileges.');
          break;
        case 'auth/network-request-failed':
          toast.error('Network error. Please check your connection.');
          break;
        default:
          toast.error(`Error: ${error.message || 'Please try again'}`);
      }
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
                  {editUser ? 'Edit User' : 'Add New User'}
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
                  {/* Avatar Upload Section */}
                  <div className="flex flex-col items-center mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-3 text-center">
                      <Camera className="w-4 h-4 inline mr-1" />
                      User Avatar
                    </label>
                    
                    <div className="relative">
                      <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-gray-200 bg-gray-100 flex items-center justify-center">
                        {imagePreview ? (
                          <img
                            src={imagePreview}
                            alt="User avatar"
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full bg-primary-500 flex items-center justify-center">
                            <span className="text-white text-xl font-semibold">
                              {generateInitials(firstName, lastName) || '?'}
                            </span>
                          </div>
                        )}
                      </div>
                      
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="hidden"
                        id="avatar-upload"
                      />
                      
                      <label
                        htmlFor="avatar-upload"
                        className="absolute bottom-0 right-0 bg-primary-500 text-white p-2 rounded-full cursor-pointer hover:bg-primary-600 shadow-lg"
                      >
                        <Upload className="w-3 h-3" />
                      </label>
                    </div>
                    
                    <p className="text-xs text-gray-500 mt-2 text-center">
                      Click the upload button to add an image<br />
                      Max size: 2MB
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        <User className="w-4 h-4 inline mr-1" />
                        First Name *
                      </label>
                      <input
                        {...register('firstName', { required: 'First name is required' })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                        placeholder="John"
                      />
                      {errors.firstName && (
                        <p className="mt-1 text-sm text-red-600">{errors.firstName.message}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        <User className="w-4 h-4 inline mr-1" />
                        Last Name *
                      </label>
                      <input
                        {...register('lastName', { required: 'Last name is required' })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                        placeholder="Doe"
                      />
                      {errors.lastName && (
                        <p className="mt-1 text-sm text-red-600">{errors.lastName.message}</p>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <Mail className="w-4 h-4 inline mr-1" />
                      Email Address *
                    </label>
                    <input
                      type="email"
                      {...register('email', { 
                        required: 'Email is required',
                        pattern: {
                          value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                          message: 'Invalid email address'
                        }
                      })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                      placeholder="john@example.com"
                      disabled={editUser} // Disable email editing for existing users
                    />
                    {errors.email && (
                      <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
                    )}
                    {editUser && (
                      <p className="mt-1 text-xs text-gray-500">Email cannot be changed for existing users</p>
                    )}
                  </div>

                  {!editUser && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        <Lock className="w-4 h-4 inline mr-1" />
                        Password *
                      </label>
                      <input
                        type="password"
                        {...register('password', { 
                          required: 'Password is required',
                          minLength: {
                            value: 6,
                            message: 'Password must be at least 6 characters'
                          }
                        })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                        placeholder="Enter password"
                      />
                      {errors.password && (
                        <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
                      )}
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <Shield className="w-4 h-4 inline mr-1" />
                      Role *
                    </label>
                    <select
                      {...register('role', { required: 'Role is required' })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                    >
                      <option value="">Select role</option>
                      <option value="admin">Admin</option>
                      <option value="user">User</option>
                    </select>
                    {errors.role && (
                      <p className="mt-1 text-sm text-red-600">{errors.role.message}</p>
                    )}
                  </div>

                  {!editUser && (
                    <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                      <p className="text-sm text-red-800">
                        <strong>Warning:</strong> Creating a new user will temporarily log you out. 
                        Simply log back in with your admin credentials to continue.
                      </p>
                    </div>
                  )}
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
                    {editUser ? 'Update User' : 'Create User'}
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

export default UserModal;