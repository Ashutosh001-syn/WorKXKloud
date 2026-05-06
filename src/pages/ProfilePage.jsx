import React, { useState, useRef, useEffect } from 'react';
import { Camera, User, Pencil, Briefcase, MapPin } from 'lucide-react';

const initialUserData = {
  firstName: 'Natashia',
  lastName: 'Khaleira',
  dob: '12-10-1990',
  email: 'info@binary-fusion.com',
  phone: '(+62) 821 2554-5846',
  role: 'Admin',
  country: 'United Kingdom',
  city: 'Leeds, East London',
  postalCode: 'ERT 1254',
  image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2.25&w=256&h=256&q=80',
};

const InfoField = ({ label, value, isEditing, tempData, field, onChange, type = "text" }) => (
  <div className="flex flex-col gap-1.5">
    <span className="text-[13px] font-medium text-[#64748b]">{label}</span>
    {isEditing ? (
      <input
        type={type}
        value={tempData[field] || ''}
        onChange={(e) => onChange(field, e.target.value)}
        className="h-11 w-full rounded-[8px] border border-[#e2e8f0] bg-white px-3.5 text-[13px] text-[#334155] outline-none focus:border-[#1191da] transition-all"
      />
    ) : (
      <span className="text-[14px] font-medium text-[#334155]">{value || '-'}</span>
    )}
  </div>
);

export default function ProfilePage() {
  const [isEditing, setIsEditing] = useState(false);
  const [userData, setUserData] = useState(() => {
    const saved = localStorage.getItem('user_profile');
    return saved ? JSON.parse(saved) : initialUserData;
  });
  const [tempData, setTempData] = useState(userData);
  const fileInputRef = useRef(null);

  useEffect(() => {
    localStorage.setItem('user_profile', JSON.stringify(userData));
    window.dispatchEvent(new Event('storage'));
  }, [userData]);

  const handleEdit = () => {
    setTempData(userData);
    setIsEditing(true);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setTempData(userData);
  };

  const handleSave = () => {
    setUserData(tempData);
    setIsEditing(false);
  };

  const handleChange = (field, value) => {
    let filteredValue = value;
    if (field === 'firstName' || field === 'lastName') {
      filteredValue = value.replace(/[^a-zA-Z\s]/g, "");
    } else if (field === 'phone') {
      filteredValue = value.replace(/[^0-9]/g, "").slice(0, 10);
    }
    setTempData(prev => ({ ...prev, [field]: filteredValue }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (isEditing) {
          setTempData(prev => ({ ...prev, image: reader.result }));
        } else {
          setUserData(prev => ({ ...prev, image: reader.result }));
        }
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="relative min-h-[calc(100vh-64px)] bg-[#f1f5f9] p-3 sm:p-4">
      <section className="rounded-[10px] bg-white p-6 shadow-[0_16px_40px_rgba(3,10,24,0.16)]">
        
        {/* Header Section */}
        <div className="mb-8 flex items-start justify-between">
          <div>
            <h1 className="text-[20px] font-semibold text-[#1e293b]">My Profile</h1>
            <p className="mt-1 text-[13px] text-[#64748b]">
              Manage your personal information and account settings
            </p>
          </div>
          {!isEditing ? (
            <button
              onClick={handleEdit}
              className="rounded-full bg-[#0052ff] px-6 py-2 text-[14px] font-medium text-white transition hover:bg-[#0042cc]"
            >
              Edit Profile
            </button>
          ) : (
            <div className="flex items-center gap-3">
              <button
                onClick={handleCancel}
                className="rounded-full bg-[#f1f5f9] px-6 py-2 text-[14px] font-medium text-[#475569] transition hover:bg-[#e2e8f0]"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="rounded-full bg-[#0052ff] px-6 py-2 text-[14px] font-medium text-white transition hover:bg-[#0042cc]"
              >
                Save Changes
              </button>
            </div>
          )}
        </div>

        {/* Profile Card */}
        <div className="mb-8 flex flex-col md:flex-row items-center gap-8 rounded-[12px] border border-[#e2e8f0] bg-[#f8fafc] p-8">
          <div className="relative group">
            <div className="h-28 w-28 overflow-hidden rounded-full border-4 border-white bg-white shadow-md ring-1 ring-[#e2e8f0]">
              {(isEditing ? tempData.image : userData.image) ? (
                <img 
                  src={isEditing ? tempData.image : userData.image} 
                  alt="Profile" 
                  className="h-full w-full object-cover" 
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-slate-100">
                  <User size={48} className="text-slate-300" />
                </div>
              )}
            </div>
            {isEditing && (
              <button 
                onClick={() => fileInputRef.current?.click()}
                className="absolute bottom-1 right-1 rounded-full bg-[#0052ff] p-2 text-white shadow-lg transition hover:bg-[#0042cc]"
              >
                <Camera size={16} />
              </button>
            )}
            <input 
              type="file" 
              ref={fileInputRef} 
              className="hidden" 
              accept="image/*" 
              onChange={handleImageChange} 
            />
          </div>
          
          <div className="text-center md:text-left">
            <h2 className="text-[22px] font-bold text-[#065f46]">
              {userData.firstName} {userData.lastName}
            </h2>
            <div className="mt-2 flex flex-wrap justify-center md:justify-start gap-4">
              <span className="flex items-center gap-1.5 text-[13px] text-[#64748b]">
                <Briefcase size={14} />
                {userData.role}
              </span>
              <span className="flex items-center gap-1.5 text-[13px] text-[#64748b]">
                <MapPin size={14} />
                {userData.city}, {userData.country}
              </span>
            </div>
          </div>
        </div>

        {/* Form Sections */}
        <div className="space-y-10">
          {/* Personal Information */}
          <section>
            <h3 className="mb-6 border-b border-[#e2e8f0] pb-3 text-[16px] font-semibold text-[#065f46]">
              Personal Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-10 gap-y-6">
              <InfoField label="First Name" value={userData.firstName} isEditing={isEditing} tempData={tempData} field="firstName" onChange={handleChange} />
              <InfoField label="Last Name" value={userData.lastName} isEditing={isEditing} tempData={tempData} field="lastName" onChange={handleChange} />
              <InfoField label="Date of Birth" value={userData.dob} isEditing={isEditing} tempData={tempData} field="dob" onChange={handleChange} />
              <InfoField label="Email Address" value={userData.email} isEditing={isEditing} tempData={tempData} field="email" type="email" onChange={handleChange} />
              <InfoField label="Phone Number" value={userData.phone} isEditing={isEditing} tempData={tempData} field="phone" onChange={handleChange} />
              <InfoField label="User Role" value={userData.role} isEditing={false} tempData={tempData} field="role" onChange={handleChange} />
            </div>
          </section>

          {/* Address */}
          <section>
            <h3 className="mb-6 border-b border-[#e2e8f0] pb-3 text-[16px] font-semibold text-[#065f46]">
              Address Details
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-10 gap-y-6">
              <InfoField label="Country" value={userData.country} isEditing={isEditing} tempData={tempData} field="country" onChange={handleChange} />
              <InfoField label="City" value={userData.city} isEditing={isEditing} tempData={tempData} field="city" onChange={handleChange} />
              <InfoField label="Postal Code" value={userData.postalCode} isEditing={isEditing} tempData={tempData} field="postalCode" onChange={handleChange} />
            </div>
          </section>
        </div>

      </section>
    </div>
  );
}
