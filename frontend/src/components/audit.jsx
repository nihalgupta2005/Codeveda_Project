import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext.jsx';
import { supabase } from '../config/supabase.js';

export default function Audit() {
    const { user, userProfile, isAdmin } = useAuth();
    
    // State management
    const [auditLogs, setAuditLogs] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [filters, setFilters] = useState({
        action: '',
        resourceType: '',
        userId: '',
        dateRange: '7days'
    });
    const [pagination, setPagination] = useState({
        page: 1,
        limit: 50,
        total: 0,
        totalPages: 0
    });

    // Redirect if not admin
    useEffect(() => {
        if (userProfile && !isAdmin()) {
            // This would normally be handled by routing, but we'll show an error
            setError('Access denied. Admin privileges required.');
        }
    }, [userProfile, isAdmin]);

    // Load audit logs when component mounts or filters change
    useEffect(() => {
        if (user && isAdmin()) {
            fetchAuditLogs();
        }
    }, [user, filters, pagination.page, searchTerm]);

    // Fetch audit logs from backend
    const fetchAuditLogs = async () => {
        try {
            setLoading(true);
            setError('');

            const queryParams = new URLSearchParams({
                page: pagination.page,
                limit: pagination.limit,
                ...(filters.action && { action: filters.action }),
                ...(filters.resourceType && { resourceType: filters.resourceType }),
                ...(filters.userId && { userId: filters.userId }),
                ...(searchTerm && { search: searchTerm })
            });

            const response = await fetch(`${import.meta.env.VITE_API_URL}/audit/logs?${queryParams}`, {
                headers: {
                    'Authorization': `Bearer ${user?.access_token || (await supabase.auth.getSession())?.data?.session?.access_token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error('Failed to fetch audit logs');
            }

            const result = await response.json();
            setAuditLogs(result.data || []);
            
            if (result.pagination) {
                setPagination(prev => ({
                    ...prev,
                    total: result.pagination.total,
                    totalPages: result.pagination.totalPages
                }));
            }

        } catch (error) {
            console.error('Error fetching audit logs:', error);
            setError('Failed to load audit logs: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    // Handle filter changes
    const handleFilterChange = (filterName, value) => {
        setFilters(prev => ({
            ...prev,
            [filterName]: value
        }));
        setPagination(prev => ({ ...prev, page: 1 })); // Reset to first page
    };

    // Handle pagination
    const handlePageChange = (newPage) => {
        setPagination(prev => ({ ...prev, page: newPage }));
    };

    // Format date for display
    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
        });
    };

    // Get action badge color
    const getActionBadgeColor = (action) => {
        switch (action?.toLowerCase()) {
            case 'create': return 'bg-green-100 text-green-800';
            case 'update': return 'bg-blue-100 text-blue-800';
            case 'delete': return 'bg-red-100 text-red-800';
            case 'read': return 'bg-gray-100 text-gray-800';
            case 'login': return 'bg-purple-100 text-purple-800';
            case 'logout': return 'bg-orange-100 text-orange-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    // Get resource type icon
    const getResourceIcon = (resourceType) => {
        switch (resourceType?.toLowerCase()) {
            case 'user': return 'fa-user';
            case 'patient_visit': return 'fa-stethoscope';
            case 'patient': return 'fa-user-injured';
            case 'code_mapping': return 'fa-code';
            default: return 'fa-file';
        }
    };

    if (!isAdmin()) {
        return (
            <div className="flex items-center justify-center min-h-96">
                <div className="text-center">
                    <div className="text-red-500 text-6xl mb-4">
                        <i className="fas fa-shield-alt"></i>
                    </div>
                    <h2 className="text-2xl font-bold text-gray-800 mb-2">Access Denied</h2>
                    <p className="text-gray-600">Admin privileges required to access audit logs.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="pb-15">
            {/* Header */}
            <div className="text-center p-15">
                <p className="text-[#0a5614] font-bold text-3xl m-5">Audit Log Dashboard</p>
                <p>Comprehensive system activity tracking and user action monitoring</p>
            </div>

            {/* Stats Cards */}
            <div className="mx-40 grid grid-cols-4 gap-10 mb-10">
                <div className="bg-gradient-to-br from-[#fcf8ec] to-white hover:shadow-2xl transition duration-500 px-8 py-6 rounded-xl flex flex-col justify-center items-center gap-5">
                    <div className="bg-[#0a5714] h-13 w-13 rounded-full flex justify-center items-center text-white text-xl">
                        <i className="fa-solid fa-clipboard-list"></i>
                    </div>
                    <p className="font-bold text-xl text-[#0a5614]">Total Events</p>
                    <p className="text-center text-[#a7aab1]">{pagination.total} activities logged</p>
                </div>

                <div className="bg-gradient-to-br from-[#f7fafe] to-white hover:shadow-2xl transition duration-500 px-8 py-6 rounded-xl flex flex-col justify-center items-center gap-5">
                    <div className="bg-[#0152cd] h-13 w-13 rounded-full flex justify-center items-center text-white text-xl">
                        <i className="fa-solid fa-users"></i>
                    </div>
                    <p className="font-bold text-xl text-[#0152cd]">Active Users</p>
                    <p className="text-center text-[#a7aab1]">Monitor user activity</p>
                </div>

                <div className="bg-gradient-to-br from-[#f8f3db] to-white hover:shadow-2xl transition duration-500 px-8 py-6 rounded-xl flex flex-col justify-center items-center gap-5">
                    <div className="bg-[#dab530] h-13 w-13 rounded-full flex justify-center items-center text-white text-xl">
                        <i className="fa-solid fa-shield-alt"></i>
                    </div>
                    <p className="font-bold text-xl text-[#dab530]">Security</p>
                    <p className="text-center text-[#a7aab1]">Access control monitoring</p>
                </div>

                <div className="bg-gradient-to-br from-[#f4f5f6] to-white hover:shadow-2xl transition duration-500 px-8 py-6 rounded-xl flex flex-col justify-center items-center gap-5">
                    <div className="bg-[#495463] h-13 w-13 rounded-full flex justify-center items-center text-white text-xl">
                        <i className="fa-solid fa-download"></i>
                    </div>
                    <p className="font-bold text-xl text-[#495463]">Export</p>
                    <p className="text-center text-[#a7aab1]">Compliance reports</p>
                </div>
            </div>

            {/* Main Content */}
            <div className="mx-40 rounded-3xl shadow-xl">
                {/* Header */}
                <div className="flex justify-between items-center p-5 bg-gradient-to-r from-[#0a5614] to-[#0152cb] text-white rounded-t-3xl">
                    <div>
                        <p className="font-bold text-xl">System Audit Logs</p>
                        <p className="text-sm opacity-90">Real-time activity monitoring</p>
                    </div>
                    <div className="flex gap-3 items-center">
                        <button className="bg-[#ffffff49] rounded-full px-4 py-2 cursor-pointer flex items-center gap-2 hover:bg-[#ffffff66] transition-colors">
                            <i className="fa-solid fa-download"></i>
                            Export
                        </button>
                        <button className="bg-[#ffffff49] rounded-full px-4 py-2 cursor-pointer flex items-center gap-2 hover:bg-[#ffffff66] transition-colors">
                            <i className="fa-solid fa-refresh"></i>
                            Refresh
                        </button>
                    </div>
                </div>

                <div className="p-6 bg-white rounded-b-3xl">
                    {/* Error Message */}
                    {error && (
                        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
                            <div className="flex items-center">
                                <i className="fas fa-exclamation-circle mr-2"></i>
                                <span>{error}</span>
                            </div>
                        </div>
                    )}

                    {/* Filters */}
                    <div className="bg-gray-50 p-4 rounded-xl mb-6">
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            {/* Search */}
                            <div className="relative">
                                <i className="fa-solid fa-magnifying-glass absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
                                <input 
                                    type="text" 
                                    placeholder="Search by user, IP, or description..." 
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-[#0152cd] focus:ring-1 focus:ring-[#0152cd]"
                                />
                            </div>

                            {/* Action Filter */}
                            <select 
                                value={filters.action}
                                onChange={(e) => handleFilterChange('action', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-[#0152cd] focus:ring-1 focus:ring-[#0152cd]"
                            >
                                <option value="">All Actions</option>
                                <option value="create">Create</option>
                                <option value="update">Update</option>
                                <option value="delete">Delete</option>
                                <option value="read">Read</option>
                                <option value="login">Login</option>
                                <option value="logout">Logout</option>
                            </select>

                            {/* Resource Type Filter */}
                            <select 
                                value={filters.resourceType}
                                onChange={(e) => handleFilterChange('resourceType', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-[#0152cd] focus:ring-1 focus:ring-[#0152cd]"
                            >
                                <option value="">All Resources</option>
                                <option value="user">User</option>
                                <option value="patient_visit">Patient Visit</option>
                                <option value="patient">Patient</option>
                                <option value="code_mapping">Code Mapping</option>
                            </select>

                            {/* Date Range Filter */}
                            <select 
                                value={filters.dateRange}
                                onChange={(e) => handleFilterChange('dateRange', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-[#0152cd] focus:ring-1 focus:ring-[#0152cd]"
                            >
                                <option value="1day">Last 24 Hours</option>
                                <option value="7days">Last 7 Days</option>
                                <option value="30days">Last 30 Days</option>
                                <option value="90days">Last 3 Months</option>
                                <option value="all">All Time</option>
                            </select>
                        </div>
                    </div>

                    {/* Audit Log Table */}
                    <div className="overflow-x-auto">
                        {loading ? (
                            <div className="text-center py-12">
                                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0152cd] mx-auto mb-4"></div>
                                <p className="text-gray-500">Loading audit logs...</p>
                            </div>
                        ) : auditLogs.length === 0 ? (
                            <div className="text-center py-12">
                                <div className="text-gray-400 text-5xl mb-4">
                                    <i className="fas fa-clipboard-list"></i>
                                </div>
                                <p className="text-lg font-medium text-gray-600">No Audit Logs Found</p>
                                <p className="text-sm text-gray-500 mt-2">
                                    {searchTerm || filters.action || filters.resourceType 
                                        ? 'No logs match your current filters' 
                                        : 'No audit logs available'}
                                </p>
                            </div>
                        ) : (
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b border-gray-200">
                                        <th className="text-left py-3 px-4 font-semibold text-gray-700">Timestamp</th>
                                        <th className="text-left py-3 px-4 font-semibold text-gray-700">User</th>
                                        <th className="text-left py-3 px-4 font-semibold text-gray-700">Action</th>
                                        <th className="text-left py-3 px-4 font-semibold text-gray-700">Resource</th>
                                        <th className="text-left py-3 px-4 font-semibold text-gray-700">Details</th>
                                        <th className="text-left py-3 px-4 font-semibold text-gray-700">IP Address</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {auditLogs.map((log, index) => (
                                        <tr key={log.id || index} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                                            <td className="py-3 px-4">
                                                <div className="text-sm text-gray-600">
                                                    {formatDate(log.created_at)}
                                                </div>
                                            </td>
                                            <td className="py-3 px-4">
                                                <div className="flex items-center">
                                                    <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-white text-xs font-bold mr-3">
                                                        {log.user?.full_name?.charAt(0) || 'U'}
                                                    </div>
                                                    <div>
                                                        <div className="text-sm font-medium text-gray-900">
                                                            {log.user?.full_name || 'Unknown User'}
                                                        </div>
                                                        <div className="text-xs text-gray-500">
                                                            {log.user?.role || 'unknown'}
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="py-3 px-4">
                                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getActionBadgeColor(log.action)}`}>
                                                    {log.action?.toUpperCase()}
                                                </span>
                                            </td>
                                            <td className="py-3 px-4">
                                                <div className="flex items-center">
                                                    <i className={`fas ${getResourceIcon(log.resource_type)} text-gray-400 mr-2`}></i>
                                                    <span className="text-sm text-gray-900">{log.resource_type}</span>
                                                </div>
                                            </td>
                                            <td className="py-3 px-4">
                                                <div className="text-sm text-gray-600 max-w-xs truncate" title={log.description}>
                                                    {log.description || `${log.action} ${log.resource_type}`}
                                                </div>
                                            </td>
                                            <td className="py-3 px-4">
                                                <div className="text-xs text-gray-500 font-mono">
                                                    {log.ip_address || 'Unknown'}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>

                    {/* Pagination */}
                    {pagination.totalPages > 1 && (
                        <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-200">
                            <div className="text-sm text-gray-500">
                                Showing {((pagination.page - 1) * pagination.limit) + 1} to {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} entries
                            </div>
                            <div className="flex items-center gap-2">
                                <button 
                                    onClick={() => handlePageChange(pagination.page - 1)}
                                    disabled={pagination.page <= 1}
                                    className="p-2 text-gray-400 hover:text-gray-600 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <i className="fa-solid fa-chevron-left"></i>
                                </button>
                                
                                {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                                    const page = i + 1;
                                    return (
                                        <button 
                                            key={page}
                                            onClick={() => handlePageChange(page)}
                                            className={`w-8 h-8 rounded-lg font-medium transition ${
                                                pagination.page === page
                                                    ? 'bg-[#0a5614] text-white'
                                                    : 'text-gray-600 hover:bg-gray-100'
                                            }`}
                                        >
                                            {page}
                                        </button>
                                    );
                                })}
                                
                                <button 
                                    onClick={() => handlePageChange(pagination.page + 1)}
                                    disabled={pagination.page >= pagination.totalPages}
                                    className="p-2 text-gray-600 hover:text-gray-800 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <i className="fa-solid fa-chevron-right"></i>
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}