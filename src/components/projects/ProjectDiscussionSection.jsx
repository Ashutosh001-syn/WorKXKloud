import React, { useState, useEffect, useCallback } from 'react';
import {
  Inbox,
  Search,
  Calendar,
  Printer,
  Download,
  FileText,
  Loader2
} from 'lucide-react';
import { API_ENDPOINTS } from '../../config/api';

function ProjectDiscussionSection() {
  const [discussions, setDiscussions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // Helper to parse auth user credentials
  const getAuthUserData = () => {
    const userStr = localStorage.getItem('auth_user');
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        return {
          id: user.id || null,
          role: user.role || user.user_type || null
        };
      } catch (e) {
        console.error('Error parsing auth_user:', e);
      }
    }
    return { id: null, role: null };
  };

  // Reusable fetch function using FormData
  const fetchDiscussions = useCallback(async () => {
    try {
      setLoading(true);
      const { id: resourceId, role } = getAuthUserData();
      if (!resourceId) {
        console.warn("resource_id not found in localStorage");
        setLoading(false);
        return;
      }

      // Create FormData as requested
      const formData = new FormData();
      formData.append('resource_id', resourceId);
      formData.append('type', role);

      const response = await fetch(API_ENDPOINTS.GET_USER_DISCUSSION, {
        method: 'POST',
        body: formData // Send as form data
      });
      const result = await response.json();

      if (result.success && Array.isArray(result.data)) {
        setDiscussions(result.data);
      }
    } catch (error) {
      console.error("Error fetching discussions:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDiscussions();
  }, [fetchDiscussions]);

  // Filter discussions based on search query
  const filteredDiscussions = discussions.filter(item => {
    const subject = (item.subject || item.title || item.topic || '').toLowerCase();
    const message = (item.message || item.comment || item.description || item.content || '').toLowerCase();
    const sender = (item.sender_name || item.sender || item.created_by || '').toLowerCase();
    const project = (item.project_name || item.projectName || '').toLowerCase();
    const query = searchQuery.toLowerCase();

    return (
      subject.includes(query) ||
      message.includes(query) ||
      sender.includes(query) ||
      project.includes(query)
    );
  });

  // Format date to: 24-Feb-26 / Today or 24-Feb-26 / Friday
  const formatLastPostDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;

    // Check if it is today
    const today = new Date();
    const isToday = date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear();

    const formattedDate = date.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: '2-digit'
    }).replace(/ /g, '-'); // e.g., 24-Feb-26

    const dayName = isToday ? 'Today' : date.toLocaleDateString('en-US', { weekday: 'long' });

    return `${formattedDate} / ${dayName}`;
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-slate-500">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600 mb-3" />
        <span className="text-sm font-medium">Fetching discussions...</span>
      </div>
    );
  }

  return (
    <div className="mt-8 bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden font-sans">
      {/* Toolbar / Search Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 border-b border-slate-100">
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-blue-500 focus:outline-none transition-all placeholder:text-slate-400"
          />
        </div>

        <div className="flex items-center gap-2 bg-slate-50 p-1 rounded-xl">
          <button className="p-2 text-slate-500 hover:text-slate-700 hover:bg-white rounded-lg transition" title="Calendar">
            <Calendar className="w-4 h-4" />
          </button>
          <button className="p-2 text-slate-500 hover:text-slate-700 hover:bg-white rounded-lg transition" title="Print">
            <Printer className="w-4 h-4" />
          </button>
          <button className="p-2 text-slate-500 hover:text-slate-700 hover:bg-white rounded-lg transition" title="Export">
            <Download className="w-4 h-4" />
          </button>
        </div>
      </div>

      {filteredDiscussions.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <Inbox size={48} className="mb-3 text-slate-300 animate-pulse" />
          <h3 className="text-base font-bold text-slate-700">No Discussions Found</h3>
          <p className="mt-1 max-w-[280px] text-xs text-slate-500">
            {searchQuery
              ? "No discussion topics match your search criteria."
              : "This project has no active discussions."}
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100 text-slate-500 text-xs font-semibold">
                <th className="py-4 px-6 w-20">Sr.no</th>
                <th className="py-4 px-6 w-1/4">Details</th>
                <th className="py-4 px-6">Last Post</th>
                <th className="py-4 px-6 w-56">Last post on</th>
                <th className="py-4 px-6 w-24 text-center">File</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700 text-sm">
              {filteredDiscussions.map((item, index) => {
                const subject = item.project_name || item.title || item.topic || 'Untitled Discussion';
                const message = item.project_scope || item.comment || item.description || item.content || '';
                const dateStr = item.start_date || item.date || item.created_date;
                const fileUrl = item.upload_personal_document || item.attachment || item.file_url;

                // Format messages into bullet list items
                const posts = message ? message.split('\n').filter(line => line.trim() !== '') : [];

                return (
                  <tr key={item.discussion_id || index} className="hover:bg-slate-50/20 transition-colors">
                    <td className="py-5 px-6 font-medium text-slate-400">{index + 1}.</td>
                    <td className="py-5 px-6 font-semibold text-slate-800 capitalize">{subject}</td>
                    <td className="py-5 px-6">
                      {posts.length > 0 ? (
                        <ul className="list-disc pl-4 space-y-1.5 text-slate-600 text-xs">
                          {posts.map((post, idx) => (
                            <li key={idx} className="leading-relaxed">{post}</li>
                          ))}
                        </ul>
                      ) : (
                        <span className="text-slate-400 text-xs">No posts</span>
                      )}
                    </td>
                    <td className="py-5 px-6 text-slate-500 font-medium text-xs">
                      {formatLastPostDate(dateStr)}
                    </td>
                    <td className="py-5 px-6 text-center">
                      {fileUrl ? (
                        <a
                          href={fileUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex p-2 bg-red-50 hover:bg-red-100 rounded-lg text-red-500 hover:text-red-600 transition shadow-sm"
                          title="Open Attachment"
                        >
                          <FileText className="w-4 h-4 fill-red-500/10" />
                        </a>
                      ) : (
                        <div className="inline-flex p-2 bg-red-50 rounded-lg text-red-500/70 cursor-default shadow-sm" title="Default Document">
                          <FileText className="w-4 h-4 fill-red-500/5" />
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default ProjectDiscussionSection;
