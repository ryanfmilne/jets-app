import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Users, Palette, Printer, Plus, Edit, Trash2, Settings as SettingsIcon } from 'lucide-react';
import { collection, onSnapshot, addDoc, updateDoc, deleteDoc, doc, setDoc, getDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useForm } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import Layout from '../components/Layout';
import UserModal from '../components/UserModal';
import PressModal from '../components/PressModal';
import UserAvatar from '../components/UserAvatar';

const Admin = () => {
  const [activeTab, setActiveTab] = useState('users');
  const [users, setUsers] = useState([]);
  const [colors, setColors] = useState([]);
  const [presses, setPresses] = useState([]);
  const [settings, setSettings] = useState({});
  const [showAddForm, setShowAddForm] = useState(false);
  const [showUserModal, setShowUserModal] = useState(false);
  const [showPressModal, setShowPressModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [editingUser, setEditingUser] = useState(null);
  const [editingPress, setEditingPress] = useState(null);

  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm();

  useEffect(() => {
    // Listen to users
    const unsubUsers = onSnapshot(collection(db, 'users'), (snapshot) => {
      const usersData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setUsers(usersData);
    });

    // Listen to colors
    const unsubColors = onSnapshot(collection(db, 'colors'), (snapshot) => {
      const colorsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setColors(colorsData);
    });

    // Listen to presses
    const unsubPresses = onSnapshot(collection(db, 'presses'), (snapshot) => {
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
          // Create default settings if none exist
          const defaultSettings = {
            showPressImagesInPressView: false,
          };
          await setDoc(doc(db, 'settings', 'app'), defaultSettings);
          setSettings(defaultSettings);
        }
      } catch (error) {
        console.error('Error loading settings:', error);
        // Set default settings on error
        setSettings({
          showPressImagesInPressView: false,
        });
      }
    };

    loadSettings();

    return () => {
      unsubUsers();
      unsubColors();
      unsubPresses();
    };
  }, []);

  const handleAdd = () => {
    if (activeTab === 'users') {
      // Open user modal for new user
      setEditingUser(null);
      setShowUserModal(true);
    } else if (activeTab === 'presses') {
      // Open press modal for new press
      setEditingPress(null);
      setShowPressModal(true);
    } else if (activeTab === 'colors') {
      // Show inline form for colors only
      setEditingItem(null);
      setShowAddForm(true);
      reset();
    }
  };

  const handleEdit = (item) => {
    if (activeTab === 'users') {
      // Open user modal for editing
      setEditingUser(item);
      setShowUserModal(true);
    } else if (activeTab === 'presses') {
      // Open press modal for editing
      setEditingPress(item);
      setShowPressModal(true);
    } else {
      // Show inline form for colors only
      setEditingItem(item);
      setShowAddForm(true);
      
      if (activeTab === 'colors') {
        setValue('name', item.name);
        setValue('hex', item.hex);
      }
    }
  };

  const handleDelete = async (item) => {
    if (window.confirm(`Are you sure you want to delete this ${activeTab.slice(0, -1)}?`)) {
      try {
        await deleteDoc(doc(db, activeTab, item.id));
        toast.success(`${activeTab.slice(0, -1)} deleted successfully`);
      } catch (error) {
        toast.error('Error deleting item');
      }
    }
  };

  const handleCloseUserModal = () => {
    setShowUserModal(false);
    setEditingUser(null);
  };

  const handleClosePressModal = () => {
    setShowPressModal(false);
    setEditingPress(null);
  };

  const handleSettingChange = async (settingKey, value) => {
    try {
      const updatedSettings = {
        ...settings,
        [settingKey]: value,
      };
      
      await setDoc(doc(db, 'settings', 'app'), updatedSettings);
      setSettings(updatedSettings);
      toast.success('Setting updated successfully');
    } catch (error) {
      console.error('Error updating setting:', error);
      toast.error('Error updating setting');
    }
  };

  const onSubmit = async (data) => {
    try {
      if (activeTab === 'colors') {
        const colorData = {
          name: data.name,
          hex: data.hex,
          updatedAt: new Date(),
        };

        if (editingItem) {
          await updateDoc(doc(db, 'colors', editingItem.id), colorData);
          toast.success('Color updated successfully');
        } else {
          await addDoc(collection(db, 'colors'), {
            ...colorData,
            createdAt: new Date(),
          });
          toast.success('Color added successfully');
        }
      }

      setShowAddForm(false);
      setEditingItem(null);
      reset();
    } catch (error) {
      console.error('Error saving:', error);
      toast.error('Error saving. Please try again.');
    }
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'users':
        return (
          <div className="space-y-4">
            {users.map((user) => (
              <motion.div
                key={user.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white p-4 rounded-lg shadow-sm border flex justify-between items-center"
              >
                <div className="flex items-center space-x-4">
                  <UserAvatar user={user} size="lg" />
                  <div>
                    <h3 className="font-semibold text-gray-900">
                      {user.firstName} {user.lastName}
                    </h3>
                    <p className="text-gray-600">{user.email}</p>
                    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                      user.role === 'admin' 
                        ? 'bg-purple-100 text-purple-800' 
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {user.role}
                    </span>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleEdit(user)}
                    className="p-2 text-gray-600 hover:text-primary-600 rounded-md hover:bg-gray-100"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(user)}
                    className="p-2 text-gray-600 hover:text-red-600 rounded-md hover:bg-gray-100"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        );

      case 'colors':
        return (
          <div className="space-y-4">
            {colors.map((color) => (
              <motion.div
                key={color.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white p-4 rounded-lg shadow-sm border flex justify-between items-center"
              >
                <div className="flex items-center space-x-4">
                  <div
                    className="w-8 h-8 rounded border"
                    style={{ backgroundColor: color.hex }}
                  ></div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{color.name}</h3>
                    <p className="text-gray-600">{color.hex}</p>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleEdit(color)}
                    className="p-2 text-gray-600 hover:text-primary-600 rounded-md hover:bg-gray-100"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(color)}
                    className="p-2 text-gray-600 hover:text-red-600 rounded-md hover:bg-gray-100"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        );

      case 'presses':
        return (
          <div className="space-y-4">
            {presses.map((press) => (
              <motion.div
                key={press.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white p-4 rounded-lg shadow-sm border flex justify-between items-center"
              >
                <div className="flex items-center space-x-4">
                  <div className="w-16 h-12 rounded-lg overflow-hidden border bg-gray-100 flex items-center justify-center">
                    {press.imageUrl ? (
                      <img
                        src={press.imageUrl}
                        alt={press.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <Printer className="w-6 h-6 text-gray-400" />
                    )}
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{press.name}</h3>
                    <p className="text-gray-600">{press.description}</p>
                    <span className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
                      {press.pressType || 'Jet Press'}
                    </span>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleEdit(press)}
                    className="p-2 text-gray-600 hover:text-primary-600 rounded-md hover:bg-gray-100"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(press)}
                    className="p-2 text-gray-600 hover:text-red-600 rounded-md hover:bg-gray-100"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        );

      case 'settings':
        return (
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Press View Settings</h3>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-medium text-gray-900">Show Press Images in Press View</h4>
                    <p className="text-sm text-gray-500">
                      When enabled, press images will be used as background images in the Press View with a gradient overlay for better text readability.
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.showPressImagesInPressView || false}
                      onChange={(e) => handleSettingChange('showPressImagesInPressView', e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                  </label>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Future Settings</h3>
              <p className="text-gray-500">Additional admin settings will be added here in future updates.</p>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  const renderAddForm = () => {
    if (!showAddForm || activeTab !== 'colors') return null;

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white p-6 rounded-lg shadow-sm border mb-6"
      >
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          {editingItem ? 'Edit Color' : 'Add New Color'}
        </h3>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Color Name
            </label>
            <input
              {...register('name', { required: 'Color name is required' })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder="Red"
            />
            {errors.name && (
              <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Hex Color
            </label>
            <input
              type="color"
              {...register('hex', { required: 'Hex color is required' })}
              className="w-full h-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
            {errors.hex && (
              <p className="mt-1 text-sm text-red-600">{errors.hex.message}</p>
            )}
          </div>

          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={() => {
                setShowAddForm(false);
                setEditingItem(null);
                reset();
              }}
              className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-primary-500 text-white rounded-md hover:bg-primary-600"
            >
              {editingItem ? 'Update' : 'Add'}
            </button>
          </div>
        </form>
      </motion.div>
    );
  };

  return (
    <Layout requireAdmin={true}>
      <div className="space-y-6">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex justify-between items-center"
        >
          <h1 className="text-3xl font-bold text-gray-900">Admin Panel</h1>
          {activeTab !== 'settings' && (
            <button
              onClick={handleAdd}
              className="bg-primary-500 text-white px-4 py-2 rounded-md hover:bg-primary-600 flex items-center"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add {activeTab.slice(0, -1)}
            </button>
          )}
        </motion.div>

        <div className="bg-white rounded-lg shadow-sm">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              {[
                { id: 'users', label: 'Users', icon: Users },
                { id: 'colors', label: 'Colors', icon: Palette },
                { id: 'presses', label: 'Presses', icon: Printer },
                { id: 'settings', label: 'Settings', icon: SettingsIcon },
              ].map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center ${
                      activeTab === tab.id
                        ? 'border-primary-500 text-primary-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <Icon className="w-4 h-4 mr-2" />
                    {tab.label}
                  </button>
                );
              })}
            </nav>
          </div>

          <div className="p-6">
            {renderAddForm()}
            {renderTabContent()}
          </div>
        </div>
      </div>

      <UserModal
        isOpen={showUserModal}
        onClose={handleCloseUserModal}
        editUser={editingUser}
      />

      <PressModal
        isOpen={showPressModal}
        onClose={handleClosePressModal}
        editPress={editingPress}
      />
    </Layout>
  );
};

export default Admin;