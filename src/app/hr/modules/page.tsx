'use client';

import DashboardLayout from '@/components/DashboardLayout';
import { mockModules } from '@/lib/mock-data';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function HRModulesPage() {
  const router = useRouter();
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedModule, setSelectedModule] = useState<any>(null);
  const [modules, setModules] = useState(mockModules);

  const categories = [...new Set(modules.map(m => m.category))];

  const handleAddModule = () => {
    setShowAddModal(true);
  };

  const handleEditModule = (module: any) => {
    setSelectedModule(module);
    setShowEditModal(true);
  };

  const handleDeleteModule = (module: any) => {
    setSelectedModule(module);
    setShowDeleteModal(true);
  };

  const confirmDelete = () => {
    setModules(modules.filter(m => m.id !== selectedModule?.id));
    setShowDeleteModal(false);
    setSelectedModule(null);
  };

  const handleToggleStatus = (moduleId: string) => {
    setModules(modules.map(m => 
      m.id === moduleId 
        ? { ...m, isActive: !m.isActive } 
        : m
    ));
  };

  return (
    <DashboardLayout title="Module Management" role="hr_admin">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Learning Modules</h2>
            <p className="text-gray-600">Manage and assign modules to employees</p>
          </div>
          <button 
            onClick={handleAddModule}
            className="px-6 py-2 rounded-lg font-medium text-white transition-all hover:shadow-md" 
            style={{ backgroundColor: 'var(--brand-primary)' }}
          >
            + Add New Module
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Modules</p>
                <p className="text-3xl font-bold mt-1" style={{ color: 'var(--brand-primary)' }}>
                  {modules.length}
                </p>
              </div>
              <div className="w-12 h-12 rounded-lg flex items-center justify-center" style={{ backgroundColor: 'var(--brand-primary-tint-4)' }}>
                <span className="text-2xl">📚</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Active</p>
                <p className="text-3xl font-bold mt-1 text-green-600">
                  {modules.length}
                </p>
              </div>
              <div className="w-12 h-12 rounded-lg flex items-center justify-center bg-green-100">
                <span className="text-2xl">✅</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Lessons</p>
                <p className="text-3xl font-bold mt-1" style={{ color: 'var(--endevo-setting-sun)' }}>
                  {modules.reduce((sum, m) => sum + m.lessonsCount, 0)}
                </p>
              </div>
              <div className="w-12 h-12 rounded-lg flex items-center justify-center bg-orange-100">
                <span className="text-2xl">📖</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Hours</p>
                <p className="text-3xl font-bold mt-1" style={{ color: 'var(--endevo-guiding-light-shade-1)' }}>
                  {modules.length * 2.5}
                </p>
              </div>
              <div className="w-12 h-12 rounded-lg flex items-center justify-center" style={{ backgroundColor: 'var(--endevo-guiding-light-tint-4)' }}>
                <span className="text-2xl">⏱️</span>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
          <div className="flex flex-wrap gap-4">
            <input
              type="text"
              placeholder="Search modules..."
              className="flex-1 min-w-64 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <select className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
              <option>All Categories</option>
              {categories.map(cat => (
                <option key={cat}>{cat}</option>
              ))}
            </select>
            <select className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
              <option>Sort by: Name</option>
              <option>Sort by: Duration</option>
              <option>Sort by: Lessons</option>
            </select>
          </div>
        </div>

        {/* Modules by Category */}
        {categories.map(category => {
          const categoryModules = modules.filter(m => m.category === category);
          
          return (
            <div key={category} className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-gray-900">{category}</h3>
                <span className="text-sm text-gray-600">{categoryModules.length} modules</span>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {categoryModules.map(module => (
                  <div 
                    key={module.id}
                    className={`border-2 rounded-lg p-4 hover:shadow-md transition-all ${
                      module.isActive === false ? 'opacity-60 bg-gray-50 border-gray-300' : 'border-gray-200'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900">{module.title}</h4>
                        {module.isActive === false && (
                          <span className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded-full mt-1 inline-block">
                            Disabled
                          </span>
                        )}
                      </div>
                    </div>
                    
                    <p className="text-sm text-gray-600 mb-4 line-clamp-2">{module.description}</p>
                    
                    <div className="flex items-center justify-between text-xs text-gray-500 mb-4">
                      <span>⏱️ {module.estimatedTime}</span>
                      <span>📚 {module.lessonsCount} lessons</span>
                      <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full font-medium">
                        {module.competency}
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-2">
                      <button 
                        onClick={() => router.push(`/employee/modules/${module.id}`)}
                        className="px-3 py-2 rounded-lg font-medium text-sm border-2 transition-all hover:shadow-md"
                        style={{ 
                          borderColor: 'var(--brand-primary)',
                          color: 'var(--brand-primary)'
                        }}
                      >
                        👁️ Preview
                      </button>
                      <button 
                        onClick={() => handleEditModule(module)}
                        className="px-3 py-2 rounded-lg font-medium text-sm text-white transition-all hover:shadow-md bg-blue-600 hover:bg-blue-700"
                      >
                        ✏️ Edit
                      </button>
                      <button 
                        onClick={() => handleToggleStatus(module.id)}
                        className={`px-3 py-2 rounded-lg font-medium text-sm text-white transition-all hover:shadow-md ${
                          module.isActive === false ? 'bg-green-600 hover:bg-green-700' : 'bg-orange-600 hover:bg-orange-700'
                        }`}
                      >
                        {module.isActive === false ? '✅ Enable' : '⏸️ Disable'}
                      </button>
                      <button 
                        onClick={() => handleDeleteModule(module)}
                        className="px-3 py-2 rounded-lg font-medium text-sm text-white transition-all hover:shadow-md bg-red-600 hover:bg-red-700"
                      >
                        🗑️ Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}

        {/* Add Module Modal */}
        {showAddModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-8 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
              <h3 className="text-2xl font-bold text-gray-900 mb-6">Add New Module</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Module Title</label>
                  <input type="text" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" placeholder="Enter module title" />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                  <textarea className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" rows={3} placeholder="Enter module description"></textarea>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                    <select className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
                      {categories.map(cat => (
                        <option key={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Competency</label>
                    <select className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
                      <option>Awareness</option>
                      <option>Knowledge</option>
                      <option>Application</option>
                    </select>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Estimated Time</label>
                    <input type="text" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" placeholder="e.g., 2-3 hours" />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Lessons Count</label>
                    <input type="number" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" placeholder="5" />
                  </div>
                </div>
              </div>
              
              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 px-6 py-2 border-2 border-gray-300 rounded-lg font-medium hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 px-6 py-2 rounded-lg font-medium text-white transition-all hover:shadow-md"
                  style={{ backgroundColor: 'var(--brand-primary)' }}
                >
                  Add Module
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Edit Module Modal */}
        {showEditModal && selectedModule && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-8 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
              <h3 className="text-2xl font-bold text-gray-900 mb-6">Edit Module</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Module Title</label>
                  <input type="text" defaultValue={selectedModule.title} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                  <textarea defaultValue={selectedModule.description} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" rows={3}></textarea>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                    <select defaultValue={selectedModule.category} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
                      {categories.map(cat => (
                        <option key={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Competency</label>
                    <select defaultValue={selectedModule.competency} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
                      <option>Awareness</option>
                      <option>Knowledge</option>
                      <option>Application</option>
                    </select>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Estimated Time</label>
                    <input type="text" defaultValue={selectedModule.estimatedTime} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Lessons Count</label>
                    <input type="number" defaultValue={selectedModule.lessonsCount} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" />
                  </div>
                </div>
              </div>
              
              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => {
                    setShowEditModal(false);
                    setSelectedModule(null);
                  }}
                  className="flex-1 px-6 py-2 border-2 border-gray-300 rounded-lg font-medium hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    setShowEditModal(false);
                    setSelectedModule(null);
                  }}
                  className="flex-1 px-6 py-2 rounded-lg font-medium text-white transition-all hover:shadow-md bg-blue-600 hover:bg-blue-700"
                >
                  Update Module
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {showDeleteModal && selectedModule && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-8 max-w-md w-full mx-4">
              <div className="text-center">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-3xl">⚠️</span>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Delete Module?</h3>
                <p className="text-gray-600 mb-6">
                  Are you sure you want to delete "{selectedModule.title}"? This action cannot be undone.
                </p>
              </div>
              
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowDeleteModal(false);
                    setSelectedModule(null);
                  }}
                  className="flex-1 px-6 py-2 border-2 border-gray-300 rounded-lg font-medium hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDelete}
                  className="flex-1 px-6 py-2 rounded-lg font-medium text-white transition-all hover:shadow-md bg-red-600 hover:bg-red-700"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
