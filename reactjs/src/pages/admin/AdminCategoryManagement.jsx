import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { 
  Tag, 
  Plus, 
  Search, 
  Edit,
  Trash2,
  XCircle,
  CheckCircle,
  Book,
  Building,
  User
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

const AdminCategoryManagement = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('categories');
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [newItem, setNewItem] = useState({ name: '', description: '' });
  const queryClient = useQueryClient();

  // Mock data for demonstration
  const { data: categoriesData, isLoading: categoriesLoading } = useQuery({
    queryKey: ['categories'],
    queryFn: () => ({
      data: [
        {
          _id: '1',
          name: 'Fiction',
          description: 'Fictional literature including novels and short stories',
          books_count: 245,
          created_at: '2024-01-15',
          updated_at: '2024-10-20'
        },
        {
          _id: '2',
          name: 'Science',
          description: 'Scientific publications and research materials',
          books_count: 156,
          created_at: '2024-02-10',
          updated_at: '2024-09-15'
        },
        {
          _id: '3',
          name: 'History',
          description: 'Historical books and documentation',
          books_count: 189,
          created_at: '2024-01-20',
          updated_at: '2024-11-01'
        },
        {
          _id: '4',
          name: 'Technology',
          description: 'Computer science and technology books',
          books_count: 98,
          created_at: '2024-03-05',
          updated_at: '2024-10-30'
        }
      ]
    }),
    enabled: user?.role === 'Admin'
  });

  const { data: genresData, isLoading: genresLoading } = useQuery({
    queryKey: ['genres'],
    queryFn: () => ({
      data: [
        {
          _id: '1',
          name: 'Mystery',
          description: 'Mystery and detective fiction',
          books_count: 67,
          parent_category: 'Fiction'
        },
        {
          _id: '2',
          name: 'Romance',
          description: 'Romantic fiction and love stories',
          books_count: 89,
          parent_category: 'Fiction'
        },
        {
          _id: '3',
          name: 'Physics',
          description: 'Physics textbooks and research',
          books_count: 45,
          parent_category: 'Science'
        }
      ]
    }),
    enabled: user?.role === 'Admin'
  });

  const { data: publishersData, isLoading: publishersLoading } = useQuery({
    queryKey: ['publishers'],
    queryFn: () => ({
      data: [
        {
          _id: '1',
          name: 'Penguin Random House',
          description: 'Major international publisher',
          books_count: 123,
          contact_email: 'contact@penguinrandomhouse.com',
          website: 'https://penguinrandomhouse.com'
        },
        {
          _id: '2',
          name: 'Harper Collins',
          description: 'Global publishing company',
          books_count: 89,
          contact_email: 'info@harpercollins.com',
          website: 'https://harpercollins.com'
        },
        {
          _id: '3',
          name: 'Oxford University Press',
          description: 'Academic and educational publisher',
          books_count: 156,
          contact_email: 'info@oup.com',
          website: 'https://oup.com'
        }
      ]
    }),
    enabled: user?.role === 'Admin'
  });

  // Mock mutations
  const addItemMutation = useMutation({
    mutationFn: ({ type, data }) => Promise.resolve({ success: true }),
    onSuccess: () => {
      queryClient.invalidateQueries([activeTab]);
      setShowAddModal(false);
      setNewItem({ name: '', description: '' });
      alert('Item added successfully!');
    },
    onError: () => {
      alert('Failed to add item');
    }
  });

  const updateItemMutation = useMutation({
    mutationFn: ({ type, id, data }) => Promise.resolve({ success: true }),
    onSuccess: () => {
      queryClient.invalidateQueries([activeTab]);
      setEditingItem(null);
      alert('Item updated successfully!');
    },
    onError: () => {
      alert('Failed to update item');
    }
  });

  const deleteItemMutation = useMutation({
    mutationFn: ({ type, id }) => Promise.resolve({ success: true }),
    onSuccess: () => {
      queryClient.invalidateQueries([activeTab]);
      alert('Item deleted successfully!');
    },
    onError: () => {
      alert('Failed to delete item');
    }
  });

  // Check if user is admin
  if (!user || user.role !== 'Admin') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <XCircle className="mx-auto h-12 w-12 text-red-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">Access Denied</h3>
          <p className="mt-1 text-sm text-gray-500">
            You need administrator privileges to access this page
          </p>
        </div>
      </div>
    );
  }

  const handleAdd = () => {
    if (!newItem.name.trim()) {
      alert('Name is required');
      return;
    }
    addItemMutation.mutate({ type: activeTab, data: newItem });
  };

  const handleEdit = (item) => {
    setEditingItem({ ...item });
  };

  const handleUpdate = () => {
    if (!editingItem.name.trim()) {
      alert('Name is required');
      return;
    }
    updateItemMutation.mutate({ 
      type: activeTab, 
      id: editingItem._id, 
      data: editingItem 
    });
  };

  const handleDelete = (id, name) => {
    if (window.confirm(`Are you sure you want to delete "${name}"?`)) {
      deleteItemMutation.mutate({ type: activeTab, id });
    }
  };

  const getCurrentData = () => {
    switch (activeTab) {
      case 'categories':
        return { data: categoriesData?.data || [], loading: categoriesLoading };
      case 'genres':
        return { data: genresData?.data || [], loading: genresLoading };
      case 'publishers':
        return { data: publishersData?.data || [], loading: publishersLoading };
      default:
        return { data: [], loading: false };
    }
  };

  const { data: currentData, loading: currentLoading } = getCurrentData();

  const filteredData = currentData.filter(item =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (item.description && item.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const tabs = [
    { id: 'categories', name: 'Categories', icon: Tag, description: 'Main book categories' },
    { id: 'genres', name: 'Genres', icon: Book, description: 'Book genres and sub-categories' },
    { id: 'publishers', name: 'Publishers', icon: Building, description: 'Publishing companies' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Tag className="h-8 w-8 text-blue-600 mr-3" />
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">Category Management</h1>
                  <p className="text-gray-600">Manage categories, genres, and publishers</p>
                </div>
              </div>
              <div className="flex space-x-3">
                <Link
                  to="/admin"
                  className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                >
                  Back to Dashboard
                </Link>
                <button
                  onClick={() => setShowAddModal(true)}
                  className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add {activeTab.slice(0, -1)}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tabs */}
        <div className="bg-white rounded-lg shadow mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8 px-6">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                      activeTab === tab.id
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    <span>{tab.name}</span>
                  </button>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Search */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="relative">
            <Search className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder={`Search ${activeTab}...`}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>

        {/* Content */}
        {currentLoading ? (
          <div className="bg-white rounded-lg shadow p-6">
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="flex items-center space-x-4">
                    <div className="bg-gray-200 h-6 w-32 rounded"></div>
                    <div className="bg-gray-200 h-4 flex-1 rounded"></div>
                    <div className="bg-gray-200 h-4 w-16 rounded"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Description
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Books Count
                    </th>
                    {activeTab === 'genres' && (
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Parent Category
                      </th>
                    )}
                    {activeTab === 'publishers' && (
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Contact
                      </th>
                    )}
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredData.map((item) => (
                    <tr key={item._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        {editingItem && editingItem._id === item._id ? (
                          <input
                            type="text"
                            value={editingItem.name}
                            onChange={(e) => setEditingItem({ ...editingItem, name: e.target.value })}
                            className="w-full px-3 py-1 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                          />
                        ) : (
                          <div className="text-sm font-medium text-gray-900">
                            {item.name}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        {editingItem && editingItem._id === item._id ? (
                          <textarea
                            value={editingItem.description || ''}
                            onChange={(e) => setEditingItem({ ...editingItem, description: e.target.value })}
                            className="w-full px-3 py-1 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                            rows="2"
                          />
                        ) : (
                          <div className="text-sm text-gray-500">
                            {item.description || 'No description'}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center text-sm text-gray-900">
                          <Book className="h-4 w-4 text-gray-400 mr-1" />
                          {item.books_count}
                        </div>
                      </td>
                      {activeTab === 'genres' && (
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                            {item.parent_category}
                          </span>
                        </td>
                      )}
                      {activeTab === 'publishers' && (
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-900">
                            {item.contact_email}
                          </div>
                          {item.website && (
                            <div className="text-sm text-blue-600">
                              <a href={item.website} target="_blank" rel="noopener noreferrer">
                                {item.website}
                              </a>
                            </div>
                          )}
                        </td>
                      )}
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        {editingItem && editingItem._id === item._id ? (
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={handleUpdate}
                              className="text-green-600 hover:text-green-900"
                            >
                              <CheckCircle className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => setEditingItem(null)}
                              className="text-red-600 hover:text-red-900"
                            >
                              <XCircle className="h-4 w-4" />
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => handleEdit(item)}
                              className="text-blue-600 hover:text-blue-900"
                            >
                              <Edit className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleDelete(item._id, item.name)}
                              className="text-red-600 hover:text-red-900"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Add Modal */}
        {showAddModal && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
              <div className="mt-3">
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  Add New {activeTab.slice(0, -1)}
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Name</label>
                    <input
                      type="text"
                      value={newItem.name}
                      onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Enter name..."
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Description</label>
                    <textarea
                      value={newItem.description}
                      onChange={(e) => setNewItem({ ...newItem, description: e.target.value })}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                      rows="3"
                      placeholder="Enter description..."
                    />
                  </div>
                </div>
                <div className="flex justify-end space-x-3 mt-6">
                  <button
                    onClick={() => {
                      setShowAddModal(false);
                      setNewItem({ name: '', description: '' });
                    }}
                    className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleAdd}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  >
                    Add {activeTab.slice(0, -1)}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminCategoryManagement;
