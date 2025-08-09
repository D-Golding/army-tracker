// components/admin/VoucherAdmin.jsx - Complete Voucher Management Interface
import React, { useState, useEffect } from 'react';
import {
  Plus,
  Search,
  Filter,
  Download,
  Eye,
  Trash2,
  Copy,
  CheckCircle,
  XCircle,
  Calendar,
  Users,
  Gift,
  AlertTriangle
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import {
  createVoucher,
  listVouchers,
  deactivateVoucher,
  getVoucherStats,
  VOUCHER_TYPES
} from '../../services/voucherService';

const VoucherAdmin = () => {
  const { currentUser } = useAuth();
  const [vouchers, setVouchers] = useState([]);
  const [filteredVouchers, setFilteredVouchers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedVoucher, setSelectedVoucher] = useState(null);
  const [copiedCode, setCopiedCode] = useState(null);

  // Load vouchers on component mount
  useEffect(() => {
    loadVouchers();
  }, []);

  // Filter vouchers based on search and filter
  useEffect(() => {
    let filtered = vouchers;

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(voucher =>
        voucher.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        voucher.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply type filter
    if (filterType !== 'all') {
      filtered = filtered.filter(voucher => voucher.type === filterType);
    }

    setFilteredVouchers(filtered);
  }, [vouchers, searchTerm, filterType]);

  const loadVouchers = async () => {
    try {
      setLoading(true);
      const voucherList = await listVouchers();
      setVouchers(voucherList);
    } catch (error) {
      console.error('Error loading vouchers:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCopyCode = async (code) => {
    try {
      await navigator.clipboard.writeText(code);
      setCopiedCode(code);
      setTimeout(() => setCopiedCode(null), 2000);
    } catch (error) {
      console.error('Failed to copy code:', error);
    }
  };

  const handleDeactivateVoucher = async (code) => {
    if (!confirm(`Are you sure you want to deactivate voucher "${code}"?`)) {
      return;
    }

    try {
      await deactivateVoucher(code);
      await loadVouchers(); // Reload the list
    } catch (error) {
      console.error('Error deactivating voucher:', error);
      alert('Failed to deactivate voucher');
    }
  };

  const handleViewDetails = async (voucher) => {
    try {
      const stats = await getVoucherStats(voucher.code);
      setSelectedVoucher({ ...voucher, stats });
    } catch (error) {
      console.error('Error loading voucher stats:', error);
    }
  };

  const exportVouchers = () => {
    const csvContent = [
      ['Code', 'Type', 'Tier', 'Uses', 'Max Uses', 'Active', 'Created', 'Expires'].join(','),
      ...filteredVouchers.map(v => [
        v.code,
        v.type,
        v.tier,
        v.currentUses || 0,
        v.maxUses || 'Unlimited',
        v.isActive ? 'Yes' : 'No',
        v.createdAt?.toDate()?.toLocaleDateString() || 'N/A',
        v.expiresAt?.toDate()?.toLocaleDateString() || 'No expiry'
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `vouchers-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const getStatusBadge = (voucher) => {
    if (!voucher.isActive) {
      return <span className="badge-red text-xs">Deactivated</span>;
    }

    if (voucher.expiresAt && voucher.expiresAt.toDate() < new Date()) {
      return <span className="badge-orange text-xs">Expired</span>;
    }

    if (voucher.maxUses && voucher.currentUses >= voucher.maxUses) {
      return <span className="badge-gray text-xs">Exhausted</span>;
    }

    return <span className="badge-green text-xs">Active</span>;
  };

  const getTypeColor = (type) => {
    const colors = {
      [VOUCHER_TYPES.BETA]: 'text-blue-600 bg-blue-100',
      [VOUCHER_TYPES.TRIAL]: 'text-purple-600 bg-purple-100',
      [VOUCHER_TYPES.FREE]: 'text-green-600 bg-green-100',
      [VOUCHER_TYPES.DISCOUNT]: 'text-orange-600 bg-orange-100',
      [VOUCHER_TYPES.UPGRADE]: 'text-indigo-600 bg-indigo-100'
    };
    return colors[type] || 'text-gray-600 bg-gray-100';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Voucher Management
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Create and manage voucher codes for users
          </p>
        </div>

        <div className="flex gap-3">
          <button
            onClick={exportVouchers}
            className="btn-secondary flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            Export
          </button>
          <button
            onClick={() => setShowCreateModal(true)}
            className="btn-primary flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Create Voucher
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-600">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
              <input
                type="text"
                placeholder="Search vouchers..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="form-input pl-10"
              />
            </div>
          </div>

          {/* Type Filter */}
          <div className="sm:w-48">
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="form-select"
            >
              <option value="all">All Types</option>
              <option value={VOUCHER_TYPES.BETA}>Beta</option>
              <option value={VOUCHER_TYPES.TRIAL}>Trial</option>
              <option value={VOUCHER_TYPES.FREE}>Free</option>
              <option value={VOUCHER_TYPES.DISCOUNT}>Discount</option>
              <option value={VOUCHER_TYPES.UPGRADE}>Upgrade</option>
            </select>
          </div>
        </div>
      </div>

      {/* Vouchers List */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-600">
        {loading ? (
          <div className="p-8 text-center">
            <div className="loading-spinner mx-auto mb-4" />
            <p className="text-gray-600 dark:text-gray-400">Loading vouchers...</p>
          </div>
        ) : filteredVouchers.length === 0 ? (
          <div className="p-8 text-center">
            <Gift className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              No vouchers found
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              {searchTerm || filterType !== 'all'
                ? 'Try adjusting your search or filters.'
                : 'Get started by creating your first voucher code.'
              }
            </p>
            {(!searchTerm && filterType === 'all') && (
              <button
                onClick={() => setShowCreateModal(true)}
                className="btn-primary"
              >
                Create First Voucher
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Code
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Tier
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Usage
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-600">
                {filteredVouchers.map((voucher) => (
                  <tr key={voucher.code} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-sm font-medium text-gray-900 dark:text-white">
                          {voucher.code}
                        </span>
                        <button
                          onClick={() => handleCopyCode(voucher.code)}
                          className="p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded"
                          title="Copy code"
                        >
                          {copiedCode === voucher.code ? (
                            <CheckCircle className="w-4 h-4 text-green-500" />
                          ) : (
                            <Copy className="w-4 h-4 text-gray-400" />
                          )}
                        </button>
                      </div>
                      {voucher.description && (
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                          {voucher.description}
                        </p>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getTypeColor(voucher.type)}`}>
                        {voucher.type}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {voucher.tier}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {voucher.currentUses || 0} / {voucher.maxUses || '∞'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(voucher)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleViewDetails(voucher)}
                          className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-900 dark:hover:text-indigo-300"
                          title="View details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        {voucher.isActive && (
                          <button
                            onClick={() => handleDeactivateVoucher(voucher.code)}
                            className="text-red-600 dark:text-red-400 hover:text-red-900 dark:hover:text-red-300"
                            title="Deactivate"
                          >
                            <XCircle className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create Voucher Modal */}
      {showCreateModal && (
        <CreateVoucherModal
          onClose={() => setShowCreateModal(false)}
          onSuccess={() => {
            setShowCreateModal(false);
            loadVouchers();
          }}
          currentUser={currentUser}
        />
      )}

      {/* Voucher Details Modal */}
      {selectedVoucher && (
        <VoucherDetailsModal
          voucher={selectedVoucher}
          onClose={() => setSelectedVoucher(null)}
        />
      )}
    </div>
  );
};

// Create Voucher Modal Component
const CreateVoucherModal = ({ onClose, onSuccess, currentUser }) => {
  const [formData, setFormData] = useState({
    code: '',
    type: VOUCHER_TYPES.TRIAL,
    tier: 'casual',
    duration: '',
    maxUses: '',
    discountPercentage: '',
    discountAmount: '',
    description: '',
    expiresAt: ''
  });
  const [generating, setGenerating] = useState(false);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState('');

  const generateRandomCode = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 8; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setFormData(prev => ({ ...prev, code: result }));
  };

  const generateBulkCodes = () => {
    setGenerating(true);
    // This would be a separate modal/component for bulk generation
    alert('Bulk generation feature coming soon!');
    setGenerating(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setCreating(true);

    try {
      const voucherData = {
        ...formData,
        maxUses: formData.maxUses ? parseInt(formData.maxUses) : null,
        duration: formData.duration ? parseInt(formData.duration) : null,
        discountPercentage: formData.discountPercentage ? parseInt(formData.discountPercentage) : 0,
        discountAmount: formData.discountAmount ? parseFloat(formData.discountAmount) : 0,
        expiresAt: formData.expiresAt ? new Date(formData.expiresAt) : null,
        createdBy: currentUser.uid
      };

      const result = await createVoucher(voucherData);

      if (result.success) {
        onSuccess();
      } else {
        setError(result.error);
      }
    } catch (error) {
      console.error('Error creating voucher:', error);
      setError('Failed to create voucher. Please try again.');
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              Create New Voucher
            </h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full"
            >
              <XCircle className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Code Generation */}
            <div>
              <label className="form-label">Voucher Code</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={formData.code}
                  onChange={(e) => setFormData(prev => ({ ...prev, code: e.target.value.toUpperCase() }))}
                  placeholder="Enter code or generate one"
                  className="form-input flex-1"
                  required
                />
                <button
                  type="button"
                  onClick={generateRandomCode}
                  className="btn-secondary"
                >
                  Generate
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Type */}
              <div>
                <label className="form-label">Type</label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value }))}
                  className="form-select"
                >
                  <option value={VOUCHER_TYPES.TRIAL}>Trial</option>
                  <option value={VOUCHER_TYPES.BETA}>Beta Access</option>
                  <option value={VOUCHER_TYPES.FREE}>Free Access</option>
                  <option value={VOUCHER_TYPES.DISCOUNT}>Discount</option>
                  <option value={VOUCHER_TYPES.UPGRADE}>Upgrade</option>
                </select>
              </div>

              {/* Tier */}
              <div>
                <label className="form-label">Tier</label>
                <select
                  value={formData.tier}
                  onChange={(e) => setFormData(prev => ({ ...prev, tier: e.target.value }))}
                  className="form-select"
                >
                  <option value="casual">Casual</option>
                  <option value="pro">Pro</option>
                  <option value="battle">Battle</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Duration */}
              <div>
                <label className="form-label">Duration (Days)</label>
                <input
                  type="number"
                  value={formData.duration}
                  onChange={(e) => setFormData(prev => ({ ...prev, duration: e.target.value }))}
                  placeholder="Leave empty for permanent"
                  className="form-input"
                />
              </div>

              {/* Max Uses */}
              <div>
                <label className="form-label">Max Uses</label>
                <input
                  type="number"
                  value={formData.maxUses}
                  onChange={(e) => setFormData(prev => ({ ...prev, maxUses: e.target.value }))}
                  placeholder="Leave empty for unlimited"
                  className="form-input"
                />
              </div>
            </div>

            {/* Discount Options - only show for discount type */}
            {formData.type === VOUCHER_TYPES.DISCOUNT && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="form-label">Discount Percentage</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={formData.discountPercentage}
                    onChange={(e) => setFormData(prev => ({ ...prev, discountPercentage: e.target.value, discountAmount: '' }))}
                    placeholder="e.g., 20 for 20% off"
                    className="form-input"
                  />
                </div>
                <div>
                  <label className="form-label">OR Fixed Discount Amount (£)</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.discountAmount}
                    onChange={(e) => setFormData(prev => ({ ...prev, discountAmount: e.target.value, discountPercentage: '' }))}
                    placeholder="e.g., 5.00"
                    className="form-input"
                  />
                </div>
              </div>
            )}

            {/* Expiry Date */}
            <div>
              <label className="form-label">Expiry Date (Optional)</label>
              <input
                type="date"
                value={formData.expiresAt}
                onChange={(e) => setFormData(prev => ({ ...prev, expiresAt: e.target.value }))}
                className="form-input"
              />
            </div>

            {/* Description */}
            <div>
              <label className="form-label">Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Internal description for this voucher"
                rows={3}
                className="form-input"
              />
            </div>

            {error && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3">
                <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
              </div>
            )}

            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="btn-secondary flex-1"
                disabled={creating}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn-primary flex-1"
                disabled={creating}
              >
                {creating ? 'Creating...' : 'Create Voucher'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

// Voucher Details Modal Component
const VoucherDetailsModal = ({ voucher, onClose }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              Voucher Details
            </h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full"
            >
              <XCircle className="w-5 h-5" />
            </button>
          </div>

          <div className="space-y-6">
            {/* Basic Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Code</label>
                <p className="text-lg font-mono font-bold text-gray-900 dark:text-white">
                  {voucher.code}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Type</label>
                <p className="text-lg text-gray-900 dark:text-white">{voucher.type}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Tier</label>
                <p className="text-lg text-gray-900 dark:text-white">{voucher.tier}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Usage</label>
                <p className="text-lg text-gray-900 dark:text-white">
                  {voucher.currentUses || 0} / {voucher.maxUses || 'Unlimited'}
                </p>
              </div>
            </div>

            {/* Description */}
            {voucher.description && (
              <div>
                <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Description</label>
                <p className="text-gray-900 dark:text-white">{voucher.description}</p>
              </div>
            )}

            {/* Dates */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Created</label>
                <p className="text-gray-900 dark:text-white">
                  {voucher.createdAt?.toDate()?.toLocaleDateString() || 'N/A'}
                </p>
              </div>
              {voucher.expiresAt && (
                <div>
                  <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Expires</label>
                  <p className="text-gray-900 dark:text-white">
                    {voucher.expiresAt.toDate().toLocaleDateString()}
                  </p>
                </div>
              )}
            </div>

            {/* Redemption History */}
            {voucher.redemptions && voucher.redemptions.length > 0 && (
              <div>
                <label className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2 block">
                  Redemption History
                </label>
                <div className="border border-gray-200 dark:border-gray-600 rounded-lg max-h-40 overflow-y-auto">
                  {voucher.redemptions.map((redemption, index) => (
                    <div key={index} className="p-3 border-b border-gray-200 dark:border-gray-600 last:border-b-0">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">
                            {redemption.userDisplayName || 'Unknown User'}
                          </p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            {redemption.userEmail}
                          </p>
                        </div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {redemption.redeemedAt?.toDate()?.toLocaleDateString() || 'N/A'}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="flex justify-end pt-6">
            <button
              onClick={onClose}
              className="btn-primary"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VoucherAdmin;