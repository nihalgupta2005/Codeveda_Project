import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext.jsx';
import { supabase } from '../config/supabase.js';

export default function EHR() {
    const { user, userProfile, isDoctor, isPatient, isAdmin } = useAuth();
    
    // Form state
    const [formData, setFormData] = useState({
        patient_email: '',
        patient_name: '',
        age: '',
        contact_number: '',
        diagnosis: '',
        namaste_code: '',
        icd11_code: '',
        treatment_summary: '',
        prescription: '',
        hospital_name: '',
        doctor_name: userProfile?.full_name || '',
        visit_date: new Date().toISOString().split('T')[0]
    });
    
    // State management
    const [patientRecords, setPatientRecords] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [showCodeMapping, setShowCodeMapping] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    
    // Load records when component mounts
    useEffect(() => {
        if (user) {
            fetchPatientRecords();
        }
    }, [user, userProfile]);
    
    // Fetch patient records based on user role
    const fetchPatientRecords = async () => {
        try {
            setLoading(true);
            let query = supabase.from('patient_visits').select(`
                *,
                patient:patient_id(full_name, email),
                doctor:doctor_id(full_name)
            `);
            
            if (isPatient()) {
                // Patients can only see their own records  
                query = query.eq('patient_id', user.id);
            } else if (isDoctor()) {
                // Doctors can see records they created
                query = query.eq('doctor_id', user.id);
            } else if (isAdmin()) {
                // Admins can see all records
                // No additional filter needed
            }
            
            const { data, error } = await query.order('created_at', { ascending: false });
            
            if (error) {
                console.error('Error fetching records:', error);
                setError('Failed to load patient records');
            } else {
                setPatientRecords(data || []);
            }
        } catch (error) {
            console.error('Error in fetchPatientRecords:', error);
            setError('Failed to load patient records');
        } finally {
            setLoading(false);
        }
    };
    
    // Handle form input changes
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };
    
    
    // Handle dual code mapping
    const handleDualCodeMapping = async () => {
        if (!formData.diagnosis) {
            setError('Please enter a diagnosis first');
            return;
        }
        
        try {
            const { data, error } = await supabase
                .from('namaste_icd11_mappings')
                .select('namaste_code, namaste_label, icd11_code, icd11_label')
                .or(`namaste_label.ilike.%${formData.diagnosis}%,icd11_label.ilike.%${formData.diagnosis}%`)
                .limit(1);
                
            if (data && data.length > 0) {
                const mapping = data[0];
                setFormData(prev => ({
                    ...prev,
                    namaste_code: mapping.namaste_code,
                    icd11_code: mapping.icd11_code
                }));
                setShowCodeMapping(true);
            } else {
                setError('No code mapping found for this diagnosis');
            }
        } catch (error) {
            console.error('Error finding code mapping:', error);
            setError('Failed to find code mapping');
        }
    };
    
    // Save patient visit record
    const handleSaveRecord = async (e) => {
        e.preventDefault();
        
        // Validation
        if (!formData.patient_name || !formData.diagnosis) {
            setError('Please fill in patient name and diagnosis');
            return;
        }
        
        try {
            setLoading(true);
            setError('');
            
            // Prepare visit data for backend API
            const visitData = {
                patient_name: formData.patient_name,
                patient_email: formData.patient_email || null,
                patient_age: formData.age || null,
                patient_contact: formData.contact_number || null,
                visit_date: formData.visit_date,
                chief_complaint: formData.diagnosis,
                diagnosis: formData.diagnosis,
                namaste_code: formData.namaste_code || null,
                icd11_code: formData.icd11_code || null,
                treatment_plan: formData.treatment_summary,
                prescription: formData.prescription,
                hospital_name: formData.hospital_name
            };
            
            // Call backend API to create patient and visit
            const response = await fetch(`${import.meta.env.VITE_API_URL}/users/patient/visit`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${user?.access_token || (await supabase.auth.getSession())?.data?.session?.access_token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(visitData)
            });
            
            const result = await response.json();
            
            if (!response.ok) {
                setError(result.message || 'Failed to save patient record');
                return;
            }
            
            setSuccess('Patient record saved successfully!');
            // Reset form
            setFormData({
                patient_email: '',
                patient_name: '',
                age: '',
                contact_number: '',
                diagnosis: '',
                namaste_code: '',
                icd11_code: '',
                treatment_summary: '',
                prescription: '',
                hospital_name: '',
                doctor_name: userProfile?.full_name || '',
                visit_date: new Date().toISOString().split('T')[0]
            });
            setShowCodeMapping(false);
            // Refresh records list
            fetchPatientRecords();
            
            // Clear success message after 3 seconds
            setTimeout(() => setSuccess(''), 3000);
        } catch (error) {
            console.error('Error in handleSaveRecord:', error);
            setError('Failed to save patient record');
        } finally {
            setLoading(false);
        }
    };
    
    // Filter records based on search term
    const filteredRecords = patientRecords.filter(record => {
        const searchLower = searchTerm.toLowerCase();
        return (
            record.patient?.full_name?.toLowerCase().includes(searchLower) ||
            record.patient?.email?.toLowerCase().includes(searchLower) ||
            record.diagnosis?.toLowerCase().includes(searchLower) ||
            record.namaste_code?.toLowerCase().includes(searchLower) ||
            record.icd11_code?.toLowerCase().includes(searchLower)
        );
    });
    return (
        <div className="pb-15">

            <div className="text-center p-15">
                <p className="text-[#0a5614] font-bold text-3xl m-5 ">Electronic Health Records</p>
                <p>Comprehensive patient management with integrated traditional and modern medical records</p>
            </div>

            <div className="mx-40 grid grid-cols-4 gap-10">
                <div className="bg-gradient-to-br from-[#fcf8ec] to-white hover:shadow-2xl transition duration-500 px-8 py-6 rounded-xl flex flex-col justify-center items-center gap-5 ">
                    <div className="bg-[#0a5714] h-13 w-13 rounded-full flex justify-center items-center text-white text-xl">
                        <i className="fa-solid fa-user-plus"></i>
                    </div>
                    <p className="font-bold text-xl text-[#0a5614]">New Patient</p>
                    <p className="text-center text-[#a7aab1]">Create comprehensive patient record</p>
                </div>

                <div className="bg-gradient-to-br from-[#f7fafe] to-white hover:shadow-2xl transition duration-500 px-8 py-6 rounded-xl flex flex-col justify-center items-center gap-5 ">
                    <div className="bg-[#0152cd] h-13 w-13 rounded-full flex justify-center items-center text-white text-xl">
                        <i className="fa-solid fa-magnifying-glass"></i>
                    </div>
                    <p className="font-bold text-xl text-[#0152cd]">Search Records</p>
                    <p className="text-center text-[#a7aab1]">Find patient information quickly</p>
                </div>

                <div className="bg-gradient-to-br from-[#f8f3db] to-white hover:shadow-2xl transition duration-500 px-8 py-6 rounded-xl flex flex-col justify-center items-center gap-5 ">
                    <div className="bg-[#dab530] h-13 w-13 rounded-full flex justify-center items-center text-white text-xl">
                        <i className="fa-solid fa-chart-line"></i>
                    </div>
                    <p className="font-bold text-xl text-[#dab530]">Analytics</p>
                    <p className="text-center text-[#a7aab1]">Patient care insights</p>
                </div>

                <div className="bg-gradient-to-br from-[#f4f5f6] to-white hover:shadow-2xl transition duration-500 px-8 py-6 rounded-xl flex flex-col justify-center items-center gap-5 ">
                    <div className="bg-[#495463] h-13 w-13 rounded-full flex justify-center items-center text-white text-xl">
                        <i className="fa-solid fa-download"></i>
                    </div>
                    <p className="font-bold text-xl text-[#495463]">Export</p>
                    <p className="text-center text-[#a7aab1]">PDF & JSON formats</p>
                </div>
            </div>

            <div className="mx-40 rounded-3xl shadow-xl mt-15">
                <div className="flex justify-between items-center p-5 bg-gradient-to-r from-[#0a5614] to-[#0152cb] text-white rounded-t-3xl">
                    <div>
                        <p className="font-bold text-xl"> Patient Record Management</p>
                    </div>

                    <div className="flex gap-5 items-center">
                        <span className="bg-[#ffffff49] rounded-full p-3 cursor-pointer flex justify-center items-center">
                            <i className="fa-solid fa-plus"></i>
                            New Record
                        </span>
                        <span className="bg-[#ffffff49] rounded-full p-3 cursor-pointer flex justify-center items-center">
                            <i className="fa-solid fa-filter"></i>
                            Filter
                        </span>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-5 p-5">
                    {/* Left Panel - Patient Information Form */}
                    <div className="border rounded-2xl bg-[#fcfbf7] border-[#d8ba41] p-6">
                        <p className="font-bold text-xl text-[#0a5614]">{isDoctor() || isAdmin() ? 'Patient Information Form' : 'Your Medical Records'}</p>
                        
                        {/* Error and Success Messages */}
                        {error && (
                            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
                                <div className="flex items-center">
                                    <i className="fas fa-exclamation-circle mr-2"></i>
                                    <span>{error}</span>
                                </div>
                            </div>
                        )}
                        
                        {success && (
                            <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-4">
                                <div className="flex items-center">
                                    <i className="fas fa-check-circle mr-2"></i>
                                    <span>{success}</span>
                                </div>
                            </div>
                        )}
                        
                        {(isDoctor() || isAdmin()) ? (
                            <form onSubmit={handleSaveRecord}>
                                {/* Patient Email (Optional) */}
                                <div className="mb-4">
                                    <p className="py-2">Patient Email (Optional)</p>
                                    <input 
                                        type="email" 
                                        name="patient_email"
                                        placeholder="patient@example.com"
                                        value={formData.patient_email}
                                        onChange={handleInputChange}
                                        className="border rounded-xl border-[#cfd3d9] px-4 bg-white py-3 w-full focus:outline-none focus:border-[#d8ba41] focus:ring-1 focus:ring-[#d8ba41]"
                                    />
                                </div>
                        
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <p className="py-2">Patient Name*</p>
                                        <input 
                                            type="text" 
                                            name="patient_name"
                                            placeholder="Full name"
                                            value={formData.patient_name}
                                            onChange={handleInputChange}
                                            className="border rounded-xl border-[#cfd3d9] px-4 bg-white py-3 w-full focus:outline-none focus:border-[#d8ba41] focus:ring-1 focus:ring-[#d8ba41]"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <p className="py-2">Age</p>
                                        <input 
                                            type="number" 
                                            name="age"
                                            placeholder="Years"
                                            value={formData.age}
                                            onChange={handleInputChange}
                                            className="border rounded-xl border-[#cfd3d9] px-4 bg-white py-3 w-full focus:outline-none focus:border-[#d8ba41] focus:ring-1 focus:ring-[#d8ba41]"
                                        />
                                    </div>
                                </div>

                                <div className="mb-4">
                                    <p className="py-3">Contact Number</p>
                                    <input 
                                        type="tel" 
                                        name="contact_number"
                                        placeholder="+91 XXXXX XXXXX" 
                                        value={formData.contact_number}
                                        onChange={handleInputChange}
                                        className="border rounded-xl border-[#cfd3d9] px-4 bg-white py-3 w-full focus:outline-none focus:border-[#d8ba41] focus:ring-1 focus:ring-[#d8ba41]"
                                    />
                                </div>

                                <div className="flex justify-between items-center py-3">
                                    <p>Disease/Diagnosis *</p>
                                    <button 
                                        type="button"
                                        onClick={handleDualCodeMapping}
                                        className="bg-[#0a5614] text-white px-3 py-1 rounded-md text-sm hover:bg-[#0a5614]/90 transition-colors"
                                    >
                                        <i className="fa-solid fa-code"></i> Auto Map Codes
                                    </button>
                                </div>
                                <input 
                                    type="text" 
                                    name="diagnosis"
                                    placeholder="Enter diagnosis or symptoms" 
                                    value={formData.diagnosis}
                                    onChange={handleInputChange}
                                    className="border rounded-xl border-[#cfd3d9] px-4 bg-white py-3 w-full focus:outline-none focus:border-[#d8ba41] focus:ring-1 focus:ring-[#d8ba41]"
                                    required
                                />

                                {showCodeMapping && (formData.namaste_code || formData.icd11_code) && (
                                    <div className="py-3 flex gap-3">
                                        {formData.namaste_code && (
                                            <span className="bg-[#d8ba41] text-white px-3 py-1 rounded text-sm">
                                                NAMASTE: {formData.namaste_code}
                                            </span>
                                        )}
                                        {formData.icd11_code && (
                                            <span className="bg-[#0152cd] text-white px-3 py-1 rounded text-sm">
                                                ICD-11: {formData.icd11_code}
                                            </span>
                                        )}
                                    </div>
                                )}

                                <div className="mb-4">
                                    <p className="py-3">Treatment Summary</p>
                                    <textarea 
                                        name="treatment_summary"
                                        rows={2} 
                                        value={formData.treatment_summary}
                                        onChange={handleInputChange}
                                        className="border rounded-xl border-[#cfd3d9] px-4 bg-white py-3 w-full focus:outline-none focus:border-[#d8ba41] focus:ring-1 focus:ring-[#d8ba41]" 
                                        placeholder="Treatment plan and approach"
                                    ></textarea>
                                </div>

                                <div className="mb-4">
                                    <p className="py-3">Prescription & Medicines</p>
                                    <textarea 
                                        name="prescription"
                                        rows={3} 
                                        value={formData.prescription}
                                        onChange={handleInputChange}
                                        placeholder="Prescribed medications and dosage" 
                                        className="border rounded-xl border-[#cfd3d9] px-4 bg-white py-3 w-full focus:outline-none focus:border-[#d8ba41] focus:ring-1 focus:ring-[#d8ba41]"
                                    ></textarea>
                                </div>

                                <div className="grid grid-cols-2 gap-4 mb-4">
                                    <div>
                                        <p className="py-2">Hospital/Clinic Name</p>
                                        <input 
                                            type="text" 
                                            name="hospital_name"
                                            placeholder="Healthcare facility" 
                                            value={formData.hospital_name}
                                            onChange={handleInputChange}
                                            className="border rounded-xl border-[#cfd3d9] px-4 bg-white py-3 w-full focus:outline-none focus:border-[#d8ba41] focus:ring-1 focus:ring-[#d8ba41]"
                                        />
                                    </div>
                                    <div>
                                        <p className="py-2">Doctor/Practitioner Name</p>
                                        <input 
                                            type="text" 
                                            name="doctor_name"
                                            placeholder="Healthcare provider" 
                                            value={formData.doctor_name}
                                            onChange={handleInputChange}
                                            className="border rounded-xl border-[#cfd3d9] px-4 bg-white py-3 w-full focus:outline-none focus:border-[#d8ba41] focus:ring-1 focus:ring-[#d8ba41]"
                                            readOnly
                                        />
                                    </div>
                                </div>

                                <div className="mb-4">
                                    <p className="py-2">Visit Date</p>
                                    <input 
                                        type="date" 
                                        name="visit_date"
                                        value={formData.visit_date}
                                        onChange={handleInputChange}
                                        className="border rounded-xl border-[#cfd3d9] px-4 bg-white py-3 w-full focus:outline-none focus:border-[#d8ba41] focus:ring-1 focus:ring-[#d8ba41]"
                                    />
                                </div>

                                <div className="grid grid-cols-3 gap-5 mt-5">
                                    <button 
                                        type="submit"
                                        disabled={loading}
                                        className="col-span-2 flex items-center justify-center gap-2 text-white font-bold rounded-xl py-3 bg-gradient-to-r from-[#0a5614] to-[#d2ae2e] hover:shadow-lg transition-transform hover:-translate-y-1 duration-300 disabled:opacity-50"
                                    >
                                        {loading ? (
                                            <>
                                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                                <span>Saving...</span>
                                            </>
                                        ) : (
                                            <>
                                                <i className="fa-solid fa-floppy-disk"></i>
                                                <span>Save Record</span>
                                            </>
                                        )}
                                    </button>
                                    <button 
                                        type="button"
                                        onClick={() => {
                                            setFormData({
                                                patient_email: '',
                                                patient_name: '',
                                                age: '',
                                                contact_number: '',
                                                diagnosis: '',
                                                namaste_code: '',
                                                icd11_code: '',
                                                treatment_summary: '',
                                                prescription: '',
                                                hospital_name: '',
                                                doctor_name: userProfile?.full_name || '',
                                                visit_date: new Date().toISOString().split('T')[0]
                                            });
                                            setShowCodeMapping(false);
                                            setError('');
                                            setSuccess('');
                                        }}
                                        className="col-span-1 border border-gray-400 text-gray-600 font-bold rounded-xl py-3 bg-white hover:bg-gray-100 hover:border-gray-500 transition duration-300"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </form>
                        ) : (
                            <div className="text-center py-8">
                                <div className="text-gray-500">
                                    <i className="fas fa-user-injured text-4xl mb-4"></i>
                                    <p className="text-lg font-medium">Patient View</p>
                                    <p className="text-sm mt-2">Your medical records will be displayed on the right panel</p>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Right Panel - Patient Records List */}
                    <div className="border rounded-2xl bg-white border-gray-200 p-6">
                        <p className="font-bold text-xl text-[#0152cd] mb-4">
                            {isPatient() ? 'Your Medical Records' : 'Patient Records List'}
                        </p>
                        
                        {/* Search Bar */}
                        <div className="relative mb-6">
                            <i className="fa-solid fa-magnifying-glass absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
                            <input 
                                type="text" 
                                placeholder="Search by name, diagnosis, codes..." 
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-[#0152cd] focus:ring-1 focus:ring-[#0152cd]"
                            />
                        </div>

                        {/* Patient Records */}
                        <div className="space-y-4 max-h-96 overflow-y-auto">
                            {loading ? (
                                <div className="text-center py-8">
                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#0152cd] mx-auto mb-4"></div>
                                    <p className="text-gray-500">Loading patient records...</p>
                                </div>
                            ) : filteredRecords.length === 0 ? (
                                <div className="text-center py-8">
                                    <div className="text-gray-500">
                                        <i className="fas fa-inbox text-4xl mb-4"></i>
                                        <p className="text-lg font-medium">No Records Found</p>
                                        <p className="text-sm mt-2">
                                            {searchTerm ? 'No records match your search criteria' : 'No patient records available'}
                                        </p>
                                    </div>
                                </div>
                            ) : (
                                filteredRecords.map((record, index) => {
                                    const initials = record.patient?.full_name
                                        ?.split(' ')
                                        .map(name => name.charAt(0))
                                        .join('')
                                        .toUpperCase() || 'UN';
                                    
                                    const gradientClasses = [
                                        'from-purple-400 to-pink-400',
                                        'from-blue-400 to-teal-400',
                                        'from-green-400 to-blue-400',
                                        'from-yellow-400 to-red-400',
                                        'from-indigo-400 to-purple-400'
                                    ];
                                    
                                    return (
                                        <div key={record.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:shadow-md transition duration-300">
                                            <div className="flex items-center gap-4">
                                                <div className={`w-12 h-12 bg-gradient-to-br ${gradientClasses[index % gradientClasses.length]} rounded-full flex items-center justify-center text-white font-bold`}>
                                                    {initials}
                                                </div>
                                                <div>
                                                    <h3 className="font-semibold text-gray-800">
                                                        {record.patient?.full_name || 'Unknown Patient'}
                                                    </h3>
                                                    <p className="text-sm text-gray-500">
                                                        {record.patient?.email || 'No email'}
                                                    </p>
                                                    <p className="text-sm text-gray-600">
                                                        <span className="font-medium">Diagnosis:</span> {record.diagnosis || 'No diagnosis'}
                                                    </p>
                                                    <div className="flex gap-2 mt-1">
                                                        {record.namaste_code && (
                                                            <span className="bg-[#d8ba41] text-white px-2 py-1 rounded text-xs">
                                                                {record.namaste_code}
                                                            </span>
                                                        )}
                                                        {record.icd11_code && (
                                                            <span className="bg-[#0152cd] text-white px-2 py-1 rounded text-xs">
                                                                {record.icd11_code}
                                                            </span>
                                                        )}
                                                    </div>
                                                    <p className="text-xs text-gray-400 mt-1">
                                                        Visit Date: {record.visit_date ? new Date(record.visit_date).toLocaleDateString() : 'Unknown'}
                                                        {!isPatient() && record.doctor?.full_name && (
                                                            <span className="ml-2">• Dr. {record.doctor.full_name}</span>
                                                        )}
                                                    </p>
                                                    {record.hospital_name && (
                                                        <p className="text-xs text-gray-400">
                                                            <i className="fas fa-hospital mr-1"></i>{record.hospital_name}
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="flex gap-2">
                                                <button 
                                                    title="View Details"
                                                    className="p-2 text-green-600 hover:bg-green-100 rounded-lg transition"
                                                    onClick={() => {
                                                        // TODO: Implement view details modal
                                                        alert(`View details for ${record.patient?.full_name || 'patient'}`);
                                                    }}
                                                >
                                                    <i className="fa-solid fa-eye"></i>
                                                </button>
                                                {(isDoctor() || isAdmin()) && (
                                                    <>
                                                        <button 
                                                            title="Edit Record"
                                                            className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition"
                                                            onClick={() => {
                                                                // TODO: Implement edit functionality
                                                                alert(`Edit record for ${record.patient?.full_name || 'patient'}`);
                                                            }}
                                                        >
                                                            <i className="fa-solid fa-pen-to-square"></i>
                                                        </button>
                                                        <button 
                                                            title="Delete Record"
                                                            className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition"
                                                            onClick={() => {
                                                                if (confirm(`Are you sure you want to delete this record for ${record.patient?.full_name || 'patient'}?`)) {
                                                                    // TODO: Implement delete functionality
                                                                    alert('Delete functionality coming soon');
                                                                }
                                                            }}
                                                        >
                                                            <i className="fa-solid fa-trash"></i>
                                                        </button>
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                        </div>

                        {/* Records Count */}
                        {!loading && filteredRecords.length > 0 && (
                            <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-200">
                                <p className="text-sm text-gray-500">
                                    Showing {filteredRecords.length} of {patientRecords.length} record{patientRecords.length !== 1 ? 's' : ''}
                                    {searchTerm && ` (filtered)`}
                                </p>
                                {filteredRecords.length > 10 && (
                                    <div className="text-sm text-gray-500">
                                        <i className="fas fa-info-circle mr-1"></i>
                                        Scroll to see more records
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}
