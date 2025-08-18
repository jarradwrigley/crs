"use client";

import React, { useState, useEffect } from "react";
import { Button } from "../../components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import { Badge } from "../../components/ui/badge";
import { Input } from "../../components/ui/input";
import {
  Users,
  Search,
  Phone,
  Calendar,
  Eye,
  Download,
  Filter,
  BarChart3,
  Settings,
  UserPlus,
  Database,
  Trash2,
  Key,
  ArrowLeft,
  Clock,
  CheckCircle,
  XCircle,
  Shield,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

// Enhanced Admin Dashboard with Navigation
const EnhancedMobileAdminDashboard = () => {
  const router = useRouter();
  const [currentPage, setCurrentPage] = useState("dashboard");
  const [searchQuery, setSearchQuery] = useState("");
  const [users, setUsers] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    approved: 0,
    declined: 0,
  });

  const navigationItems = [
    { id: "dashboard", label: "Dashboard", icon: BarChart3 },
    { id: "verifications", label: "Verifications", icon: Users },
    { id: "phone-lookup", label: "Phone Lookup", icon: Phone },
    { id: "settings", label: "Settings", icon: Settings },
  ];

  const renderCurrentPage = () => {
    switch (currentPage) {
      case "dashboard":
        return <DashboardContent stats={stats} />;
      case "verifications":
        return <VerificationsContent users={users} searchQuery={searchQuery} />;
      case "phone-lookup":
        return <PhoneLookupContent />;
      case "settings":
        return <SettingsContent />;
      default:
        return <DashboardContent stats={stats} />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <div className="bg-white/90 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-10">
        <div className="px-4 py-3">
          <div className="flex items-center justify-between">
            <h1 className="font-bold text-gray-800">
              {navigationItems.find((item) => item.id === currentPage)?.label}
            </h1>
            {currentPage === "verifications" && (
              <div className="flex-1 max-w-xs ml-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Search users..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9 h-8 text-sm"
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-4 pb-20">{renderCurrentPage()}</div>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-sm border-t border-gray-200">
        <div className="flex items-center justify-around py-2">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentPage === item.id;
            return (
              <Button
                key={item.id}
                variant="ghost"
                size="sm"
                onClick={() => setCurrentPage(item.id)}
                className={`flex flex-col items-center gap-1 h-auto py-2 px-3 ${
                  isActive ? "text-blue-600 bg-blue-50" : "text-gray-600"
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="text-xs">{item.label}</span>
              </Button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

// Dashboard Content Component
const DashboardContent = ({ stats }: { stats: any }) => {
  return (
    <div className="space-y-4">
      {/* Quick Stats */}
      <div className="grid grid-cols-2 gap-3">
        <Card className="bg-gradient-to-r from-yellow-400 to-yellow-500 text-white border-0">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold">{stats.pending}</p>
                <p className="text-yellow-100 text-sm">Pending Review</p>
              </div>
              <Clock className="w-8 h-8 text-yellow-200" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-green-400 to-green-500 text-white border-0">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold">{stats.approved}</p>
                <p className="text-green-100 text-sm">Approved</p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-200" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-red-400 to-red-500 text-white border-0">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold">{stats.declined}</p>
                <p className="text-red-100 text-sm">Declined</p>
              </div>
              <XCircle className="w-8 h-8 text-red-200" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-blue-400 to-blue-500 text-white border-0">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold">{stats.total}</p>
                <p className="text-blue-100 text-sm">Total Users</p>
              </div>
              <Users className="w-8 h-8 text-blue-200" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-md">
        <CardHeader>
          <CardTitle className="text-lg">Quick Actions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Button className="w-full justify-start h-12 bg-gradient-to-r from-gray-500 to-pink-500 text-white">
            <Eye className="w-4 h-4 mr-3" />
            Review Pending Verifications
          </Button>
          <Button variant="outline" className="w-full justify-start h-12">
            <Download className="w-4 h-4 mr-3" />
            Export User Data
          </Button>
          <Button variant="outline" className="w-full justify-start h-12">
            <UserPlus className="w-4 h-4 mr-3" />
            Create New Admin
          </Button>
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-md">
        <CardHeader>
          <CardTitle className="text-lg">Recent Activity</CardTitle>
          <CardDescription>Latest verification actions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <div className="flex-1">
                <p className="text-sm font-medium">John Doe approved</p>
                <p className="text-xs text-gray-600">2 minutes ago</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-red-50 rounded-lg">
              <XCircle className="w-5 h-5 text-red-600" />
              <div className="flex-1">
                <p className="text-sm font-medium">Jane Smith declined</p>
                <p className="text-xs text-gray-600">5 minutes ago</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
              <Users className="w-5 h-5 text-blue-600" />
              <div className="flex-1">
                <p className="text-sm font-medium">
                  New verification submitted
                </p>
                <p className="text-xs text-gray-600">10 minutes ago</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// Verifications Content Component
const VerificationsContent = ({
  users,
  searchQuery,
}: {
  users: any[];
  searchQuery: string;
}) => {
  const [filterStatus, setFilterStatus] = useState("all");
  const [selectedUser, setSelectedUser] = useState(null);

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.phoneNumber.includes(searchQuery);
    const matchesFilter =
      filterStatus === "all" || user.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "approved":
        return "bg-green-100 text-green-800 border-green-200";
      case "declined":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
    }
  };

  return (
    <div className="space-y-4">
      {/* Filter Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {["all", "pending", "approved", "declined"].map((status) => (
          <Button
            key={status}
            variant={filterStatus === status ? "default" : "outline"}
            size="sm"
            onClick={() => setFilterStatus(status)}
            className="whitespace-nowrap"
          >
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </Button>
        ))}
      </div>

      {/* Users List */}
      <div className="space-y-3">
        {filteredUsers.length === 0 ? (
          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-md">
            <CardContent className="p-8 text-center">
              <Users className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500 font-medium">No users found</p>
              <p className="text-gray-400 text-sm">
                Try adjusting your search or filter
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredUsers.map((user) => (
            <Card
              key={user._id}
              className="bg-white/80 backdrop-blur-sm border-0 shadow-md hover:shadow-lg transition-shadow cursor-pointer"
              onClick={() => setSelectedUser(user)}
            >
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-medium text-gray-800">
                        {user.fullName}
                      </h3>
                      <Badge className={getStatusColor(user.status)}>
                        {user.status}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <div className="flex items-center gap-1">
                        <Phone className="w-3 h-3" />
                        <span>{user.phoneNumber}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        <span>
                          {new Date(user.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>
                  <Eye className="w-5 h-5 text-gray-400" />
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

// Phone Lookup Content Component
const PhoneLookupContent = () => {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [searchResults, setSearchResults] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSearch = async () => {
    if (!phoneNumber.trim()) {
      toast.error("Please enter a phone number");
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem("adminToken");
      const response = await fetch(
        `/api/admin/phone-entries/${encodeURIComponent(phoneNumber)}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const data = await response.json();
      if (data.success) {
        setSearchResults(data.data);
      } else {
        toast.error(data.error || "Search failed");
        setSearchResults(null);
      }
    } catch (error) {
      console.error("Search error:", error);
      toast.error("Search failed");
      setSearchResults(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Search Form */}
      <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-md">
        <CardHeader>
          <CardTitle className="text-lg">Phone Number Lookup</CardTitle>
          <CardDescription>
            Search for all entries related to a phone number
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input
              placeholder="Enter phone number..."
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              className="flex-1"
            />
            <Button onClick={handleSearch} disabled={loading}>
              {loading ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <Search className="w-4 h-4" />
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Search Results */}
      {searchResults && (
        <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-md">
          <CardHeader>
            <CardTitle className="text-lg">Search Results</CardTitle>
            <CardDescription>
              Found {searchResults.totalEntries} entries for{" "}
              {searchResults.originalPhoneNumber}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Statistics */}
            <div className="grid grid-cols-3 gap-3">
              <div className="text-center p-3 bg-blue-50 rounded-lg">
                <p className="text-xl font-bold text-blue-600">
                  {searchResults.statistics.totalChecks}
                </p>
                <p className="text-xs text-blue-800">Total Checks</p>
              </div>
              <div className="text-center p-3 bg-green-50 rounded-lg">
                <p className="text-xl font-bold text-green-600">
                  {searchResults.statistics.originalUserStatus || "None"}
                </p>
                <p className="text-xs text-green-800">Original Status</p>
              </div>
              <div className="text-center p-3 bg-gray-50 rounded-lg">
                <p className="text-xl font-bold text-black">
                  {searchResults.statistics.lastCheckDate
                    ? new Date(
                        searchResults.statistics.lastCheckDate
                      ).toLocaleDateString()
                    : "None"}
                </p>
                <p className="text-xs text-black">Last Check</p>
              </div>
            </div>

            {/* Original Entry */}
            {searchResults.originalEntry && (
              <div>
                <h4 className="font-medium text-gray-800 mb-2">
                  Original Entry
                </h4>
                <Card className="border-2 border-blue-200 bg-blue-50">
                  <CardContent className="p-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">
                          {searchResults.originalEntry.fullName}
                        </p>
                        <p className="text-sm text-gray-600">
                          {searchResults.originalEntry.phoneNumber}
                        </p>
                      </div>
                      <Badge
                        className={getStatusColor(
                          searchResults.originalEntry.status
                        )}
                      >
                        {searchResults.originalEntry.status}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Status Check Entries */}
            {searchResults.statusCheckEntries.length > 0 && (
              <div>
                <h4 className="font-medium text-gray-800 mb-2">
                  Status Check Entries (
                  {searchResults.statusCheckEntries.length})
                </h4>
                <div className="space-y-2">
                  {searchResults.statusCheckEntries.map((entry: any, index: any) => (
                    <Card key={entry._id} className="border border-gray-200">
                      <CardContent className="p-3">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">{entry.fullName}</p>
                            <p className="text-sm text-gray-600">
                              {entry.phoneNumber}
                            </p>
                            <p className="text-xs text-gray-500">
                              {new Date(entry.createdAt).toLocaleString()}
                            </p>
                          </div>
                          <Badge className={getStatusColor(entry.status)}>
                            {entry.status}
                          </Badge>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

// Settings Content Component
const SettingsContent = () => {
  const [showCreateAdmin, setShowCreateAdmin] = useState(false);
  const [newAdminData, setNewAdminData] = useState({
    username: "",
    email: "",
    password: "",
    role: "admin",
  });

  const handleCreateAdmin = async () => {
    if (
      !newAdminData.username ||
      !newAdminData.email ||
      !newAdminData.password
    ) {
      toast.error("Please fill in all fields");
      return;
    }

    try {
      const token = localStorage.getItem("adminToken");
      const response = await fetch("/api/auth/create-admin", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(newAdminData),
      });

      const data = await response.json();
      if (data.success) {
        toast.success("Admin created successfully!");
        setShowCreateAdmin(false);
        setNewAdminData({
          username: "",
          email: "",
          password: "",
          role: "admin",
        });
      } else {
        toast.error(data.error || "Failed to create admin");
      }
    } catch (error) {
      console.error("Create admin error:", error);
      toast.error("Failed to create admin");
    }
  };

  return (
    <div className="space-y-4">
      {/* Admin Management */}
      <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-md">
        <CardHeader>
          <CardTitle className="text-lg">Admin Management</CardTitle>
          <CardDescription>
            Manage admin accounts and permissions
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <Button
            onClick={() => setShowCreateAdmin(!showCreateAdmin)}
            className="w-full justify-start h-12"
          >
            <UserPlus className="w-4 h-4 mr-3" />
            Create New Admin
          </Button>

          {showCreateAdmin && (
            <div className="space-y-3 p-4 bg-gray-50 rounded-lg">
              <Input
                placeholder="Username"
                value={newAdminData.username}
                onChange={(e) =>
                  setNewAdminData((prev) => ({
                    ...prev,
                    username: e.target.value,
                  }))
                }
              />
              <Input
                type="email"
                placeholder="Email"
                value={newAdminData.email}
                onChange={(e) =>
                  setNewAdminData((prev) => ({
                    ...prev,
                    email: e.target.value,
                  }))
                }
              />
              <Input
                type="password"
                placeholder="Password"
                value={newAdminData.password}
                onChange={(e) =>
                  setNewAdminData((prev) => ({
                    ...prev,
                    password: e.target.value,
                  }))
                }
              />
              <select
                value={newAdminData.role}
                onChange={(e) =>
                  setNewAdminData((prev) => ({ ...prev, role: e.target.value }))
                }
                className="w-full p-2 border border-gray-300 rounded-lg"
              >
                <option value="admin">Admin</option>
                <option value="super_admin">Super Admin</option>
              </select>
              <div className="flex gap-2">
                <Button onClick={handleCreateAdmin} className="flex-1">
                  Create Admin
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setShowCreateAdmin(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Data Management */}
      <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-md">
        <CardHeader>
          <CardTitle className="text-lg">Data Management</CardTitle>
          <CardDescription>Export and manage user data</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <Button variant="outline" className="w-full justify-start h-12">
            <Download className="w-4 h-4 mr-3" />
            Export All User Data
          </Button>
          <Button variant="outline" className="w-full justify-start h-12">
            <Database className="w-4 h-4 mr-3" />
            Backup Database
          </Button>
          <Button
            variant="outline"
            className="w-full justify-start h-12 text-red-600 border-red-200 hover:bg-red-50"
          >
            <Trash2 className="w-4 h-4 mr-3" />
            Cleanup Old Records
          </Button>
        </CardContent>
      </Card>

      {/* Security */}
      <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-md">
        <CardHeader>
          <CardTitle className="text-lg">Security Settings</CardTitle>
          <CardDescription>Manage security and encryption</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <Button variant="outline" className="w-full justify-start h-12">
            <Key className="w-4 h-4 mr-3" />
            Rotate Encryption Keys
          </Button>
          <Button variant="outline" className="w-full justify-start h-12">
            <Shield className="w-4 h-4 mr-3" />
            View Security Logs
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

function getStatusColor(status: string): string {
  switch (status) {
    case "approved":
      return "bg-green-100 text-green-800 border-green-200";
    case "declined":
      return "bg-red-100 text-red-800 border-red-200";
    default:
      return "bg-yellow-100 text-yellow-800 border-yellow-200";
  }
}

export default EnhancedMobileAdminDashboard;
