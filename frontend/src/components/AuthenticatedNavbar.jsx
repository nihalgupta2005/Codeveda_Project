import React, { useState } from 'react';
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from '../contexts/AuthContext.jsx';
import logo from './images/logo.png';

export default function AuthenticatedNavbar() {
    const { user, userProfile, signOut, isAdmin, isDoctor, isPatient } = useAuth();
    const [showDropdown, setShowDropdown] = useState(false);
    const navigate = useNavigate();

    const handleSignOut = async () => {
        const { error } = await signOut();
        if (!error) {
            navigate('/login');
        }
    };

    const getRoleColor = (role) => {
        switch (role) {
            case 'admin': return 'bg-red-100 text-red-800';
            case 'doctor': return 'bg-blue-100 text-blue-800';
            case 'patient': return 'bg-green-100 text-green-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    return (
        <div className="flex justify-around items-center shadow-lg py-3 bg-white relative z-10 border-b border-gray-100">
            
            <div className="flex items-center">
                <img src={logo} alt="" className="h-17" />
                <div>
                    <p className="font-bold text-2xl text-[#0a5614]">CodeVeda</p>
                    <p className="text-sm text-[#e6ce78]">Traditional • Modern • Unified</p>
                </div>
            </div>

            <div className="flex gap-10 text-[#0a5614] *:cursor-pointer">
                <Link to="/" className="hover:text-[#017be8] transition duration-200">Home</Link>
                
                {(isDoctor() || isAdmin()) && (
                    <Link to="/mapping" className="hover:text-[#017be8] transition duration-200">Find Codes</Link>
                )}
                
                {(isDoctor() || isPatient() || isAdmin()) && (
                    <Link to="/ehr" className="hover:text-[#017be8] transition duration-200">EHR</Link>
                )}
                
                {isAdmin() && (
                    <Link to="/audit" className="hover:text-[#017be8] transition duration-200">Audit Logs</Link>
                )}
                
                <Link to="/about" className="hover:text-[#017be8] transition duration-200">About Us</Link>
                <Link to="/contact" className="hover:text-[#017be8] transition duration-200">Contact</Link>
            </div>

            <div className="flex gap-4 items-center">
                <i className="fa-sharp fa-solid fa-moon text-[#0a5614] cursor-pointer hover:text-[#017be8] transition duration-200"></i>
                
                {/* User Profile Dropdown */}
                <div className="relative">
                    <button
                        onClick={() => setShowDropdown(!showDropdown)}
                        className="flex items-center gap-3 text-white bg-black px-4 py-2 rounded-full bg-gradient-to-r from-[#0a5614] to-[#0157a9] cursor-pointer hover:shadow-lg transition duration-200"
                    >
                        <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                            <i className="fas fa-user text-white text-sm"></i>
                        </div>
                        <div className="text-left">
                            <p className="text-sm font-medium">{userProfile?.full_name}</p>
                            <p className="text-xs opacity-75">{userProfile?.role}</p>
                        </div>
                        <i className={`fas fa-chevron-${showDropdown ? 'up' : 'down'} text-xs`}></i>
                    </button>
                    
                    {showDropdown && (
                        <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-xl border border-gray-200 py-2 z-50">
                            {/* User Info */}
                            <div className="px-4 py-3 border-b border-gray-100">
                                <p className="text-sm font-medium text-gray-900">{userProfile?.full_name}</p>
                                <p className="text-sm text-gray-500">{user?.email}</p>
                                <span className={`inline-block mt-2 px-2 py-1 text-xs font-medium rounded-full ${getRoleColor(userProfile?.role)}`}>
                                    {userProfile?.role?.toUpperCase()}
                                </span>
                            </div>
                            
                            {/* Menu Items */}
                            <div className="py-1">
                                <Link
                                    to="/profile"
                                    className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition duration-150"
                                    onClick={() => setShowDropdown(false)}
                                >
                                    <i className="fas fa-user-circle mr-3"></i>
                                    Profile Settings
                                </Link>
                                
                                {isPatient() && (
                                    <Link
                                        to="/my-records"
                                        className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition duration-150"
                                        onClick={() => setShowDropdown(false)}
                                    >
                                        <i className="fas fa-file-medical mr-3"></i>
                                        My Health Records
                                    </Link>
                                )}
                                
                                {(isDoctor() || isAdmin()) && (
                                    <Link
                                        to="/dashboard"
                                        className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition duration-150"
                                        onClick={() => setShowDropdown(false)}
                                    >
                                        <i className="fas fa-chart-line mr-3"></i>
                                        Dashboard
                                    </Link>
                                )}
                                
                                {isAdmin() && (
                                    <Link
                                        to="/audit"
                                        className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition duration-150"
                                        onClick={() => setShowDropdown(false)}
                                    >
                                        <i className="fas fa-clipboard-list mr-3"></i>
                                        Audit Logs
                                    </Link>
                                )}
                                
                                <Link
                                    to="/notifications"
                                    className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition duration-150"
                                    onClick={() => setShowDropdown(false)}
                                >
                                    <i className="fas fa-bell mr-3"></i>
                                    Notifications
                                </Link>
                                
                                <Link
                                    to="/help"
                                    className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition duration-150"
                                    onClick={() => setShowDropdown(false)}
                                >
                                    <i className="fas fa-question-circle mr-3"></i>
                                    Help & Support
                                </Link>
                            </div>
                            
                            {/* Logout */}
                            <div className="border-t border-gray-100 py-1">
                                <button
                                    onClick={handleSignOut}
                                    className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition duration-150"
                                >
                                    <i className="fas fa-sign-out-alt mr-3"></i>
                                    Sign Out
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}