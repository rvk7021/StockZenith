import React, { useEffect, useState, useMemo } from 'react';
import { Search, Users, ChevronLeft, ChevronRight, User, Eye, Sparkles, TrendingUp } from 'lucide-react';

export interface PublicUser {
  id: string;
  name: string | null;
}

const PublicUsersList: React.FC<{ onSelect: (user: PublicUser) => void }> = ({ onSelect }) => {
  const [users, setUsers] = useState<PublicUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const usersPerPage = 10;

  useEffect(() => {
    setLoading(true);
    fetch('/api/public-users')
      .then(res => res.json())
      .then(data => setUsers(data.users))
      .catch(() => setError('Failed to load public users'))
      .finally(() => setLoading(false));
  }, []);

  // Filter users based on search term
  const filteredUsers = useMemo(() => {
    if (!searchTerm) return users;
    return users.filter(user => 
      (user.name || 'Unnamed User').toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [users, searchTerm]);

  // Calculate pagination
  const totalPages = Math.ceil(filteredUsers.length / usersPerPage);
  const startIndex = (currentPage - 1) * usersPerPage;
  const endIndex = startIndex + usersPerPage;
  const currentUsers = filteredUsers.slice(startIndex, endIndex);

  // Reset to first page when search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  const handlePreviousPage = () => {
    setCurrentPage(prev => Math.max(prev - 1, 1));
  };

  const handleNextPage = () => {
    setCurrentPage(prev => Math.min(prev + 1, totalPages));
  };

  if (loading) return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center px-4">
      <div className="text-center">
        <div className="relative w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-4">
          <div className="w-12 h-12 sm:w-16 sm:h-16 border-4 border-blue-200 border-t-blue-500 rounded-full animate-spin"></div>
        </div>
        <p className="text-indigo-900 text-base sm:text-lg font-semibold">Loading public users...</p>
        <p className="text-blue-600 text-xs sm:text-sm mt-2">Discovering amazing portfolios</p>
      </div>
    </div>
  );

  if (error) return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center px-4">
      <div className="text-center max-w-md mx-auto p-6 sm:p-8">
        <div className="w-12 h-12 sm:w-16 sm:h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Users className="w-6 h-6 sm:w-8 sm:h-8 text-red-500" />
        </div>
        <h2 className="text-red-600 font-bold text-lg sm:text-xl mb-2">Error Loading Users</h2>
        <p className="text-red-500 text-sm sm:text-base">{error}</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Header */}
        <div className="text-center mb-6 sm:mb-8">
          <div className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-3 mb-4">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
              <Users className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
            </div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 text-center">
              Explore Public Portfolios
            </h1>
            <Sparkles className="w-6 h-6 sm:w-8 sm:h-8 text-yellow-500" />
          </div>
          <p className="text-blue-600 text-base sm:text-lg font-medium px-4">
            Discover and learn from successful investment strategies
          </p>
        </div>

        {/* Search Bar */}
        <div className="mb-6 sm:mb-8">
          <div className="relative max-w-md mx-auto">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="w-4 h-4 sm:w-5 sm:h-5 text-blue-400" />
            </div>
            <input
              type="text"
              placeholder="Search investors..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 sm:pl-10 pr-4 py-2.5 sm:py-3 border border-blue-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white/80 backdrop-blur-sm text-gray-900 placeholder-blue-400 font-medium text-sm sm:text-base"
            />
          </div>
        </div>

        {/* Results Info */}
        <div className="mb-4 sm:mb-6 text-center px-4">
          <p className="text-blue-600 font-medium text-sm sm:text-base">
            {filteredUsers.length === 0 && searchTerm ? (
              <>No users found matching &quot;{searchTerm}&quot;</>
            ) : (
              <>
                Showing {startIndex + 1}-{Math.min(endIndex, filteredUsers.length)} of {filteredUsers.length} investors
                {searchTerm && ` for "${searchTerm}"`}
              </>
            )}
          </p>
        </div>

        {/* Users List */}
        {filteredUsers.length === 0 && !searchTerm ? (
          <div className="text-center py-8 sm:py-12 px-4">
            <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Users className="w-6 h-6 sm:w-8 sm:h-8 text-gray-400" />
            </div>
            <p className="text-gray-500 text-base sm:text-lg font-medium">No public users found</p>
          </div>
        ) : (
          <div className="space-y-3 sm:space-y-4 mb-6 sm:mb-8">
            {currentUsers.map((user, ) => (
              <div
                key={user.id}
                className="bg-white/80 backdrop-blur-sm rounded-xl shadow-sm border border-blue-100 hover:shadow-md hover:border-blue-200 transition-all duration-200 p-4 sm:p-6"
              >
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:justify-between">
                  <div className="flex items-center gap-3 sm:gap-4 min-w-0 flex-1">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full flex items-center justify-center shadow-md flex-shrink-0">
                      <User className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="text-base sm:text-lg font-bold text-gray-900 truncate">
                        {user.name || 'Unnamed User'}
                      </h3>
                      <p className="text-blue-600 text-xs sm:text-sm font-medium flex items-center gap-1">
                        <TrendingUp className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                        Public Portfolio Available
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => onSelect(user)}
                    className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg font-semibold transition-all duration-200 transform hover:scale-105 shadow-md flex items-center gap-2 text-sm sm:text-base w-full sm:w-auto justify-center"
                  >
                    <Eye className="w-4 h-4 flex-shrink-0" />
                    View Portfolio
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 px-4">
            <button
              onClick={handlePreviousPage}
              disabled={currentPage === 1}
              className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-white/80 backdrop-blur-sm border border-blue-200 rounded-lg font-medium text-blue-600 hover:bg-blue-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 text-sm sm:text-base"
            >
              <ChevronLeft className="w-4 h-4" />
              <span className="hidden xs:inline">Previous</span>
              <span className="xs:hidden">Prev</span>
            </button>
            
            <div className="flex items-center gap-1 sm:gap-2 overflow-x-auto max-w-full">
              {totalPages <= 7 ? (
                // Show all pages if total is 7 or less
                Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`w-8 h-8 sm:w-10 sm:h-10 rounded-lg font-semibold transition-all duration-200 text-sm sm:text-base flex-shrink-0 ${
                      page === currentPage
                        ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-md'
                        : 'bg-white/80 backdrop-blur-sm text-blue-600 hover:bg-blue-50 border border-blue-200'
                    }`}
                  >
                    {page}
                  </button>
                ))
              ) : (
                // Show smart pagination for more pages
                <>
                  <button
                    onClick={() => setCurrentPage(1)}
                    className={`w-8 h-8 sm:w-10 sm:h-10 rounded-lg font-semibold transition-all duration-200 text-sm sm:text-base flex-shrink-0 ${
                      1 === currentPage
                        ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-md'
                        : 'bg-white/80 backdrop-blur-sm text-blue-600 hover:bg-blue-50 border border-blue-200'
                    }`}
                  >
                    1
                  </button>
                  
                  {currentPage > 3 && (
                    <span className="text-blue-600 font-medium px-1">...</span>
                  )}
                  
                  {Array.from({ length: 3 }, (_, i) => {
                    const page = currentPage - 1 + i;
                    if (page <= 1 || page >= totalPages) return null;
                    return (
                      <button
                        key={page}
                        onClick={() => setCurrentPage(page)}
                        className={`w-8 h-8 sm:w-10 sm:h-10 rounded-lg font-semibold transition-all duration-200 text-sm sm:text-base flex-shrink-0 ${
                          page === currentPage
                            ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-md'
                            : 'bg-white/80 backdrop-blur-sm text-blue-600 hover:bg-blue-50 border border-blue-200'
                        }`}
                      >
                        {page}
                      </button>
                    );
                  })}
                  
                  {currentPage < totalPages - 2 && (
                    <span className="text-blue-600 font-medium px-1">...</span>
                  )}
                  
                  {totalPages > 1 && (
                    <button
                      onClick={() => setCurrentPage(totalPages)}
                      className={`w-8 h-8 sm:w-10 sm:h-10 rounded-lg font-semibold transition-all duration-200 text-sm sm:text-base flex-shrink-0 ${
                        totalPages === currentPage
                          ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-md'
                          : 'bg-white/80 backdrop-blur-sm text-blue-600 hover:bg-blue-50 border border-blue-200'
                      }`}
                    >
                      {totalPages}
                    </button>
                  )}
                </>
              )}
            </div>

            <button
              onClick={handleNextPage}
              disabled={currentPage === totalPages}
              className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-white/80 backdrop-blur-sm border border-blue-200 rounded-lg font-medium text-blue-600 hover:bg-blue-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 text-sm sm:text-base"
            >
              <span className="hidden xs:inline">Next</span>
              <span className="xs:hidden">Next</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default PublicUsersList;