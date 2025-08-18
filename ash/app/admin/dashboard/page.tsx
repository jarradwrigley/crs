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
import {
  Users,
  Clock,
  CheckCircle,
  XCircle,
  LogOut,
  Search,
  Filter,
  MoreVertical,
  Eye,
  Phone,
  Calendar,
  Shield,
  BarChart3,
  Settings,
  RefreshCw,
  Loader2,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import Image from "next/image";
import SafeImage from "@/app/components/SafeImage";

interface Admin {
  id: string;
  username: string;
  email: string;
  role: string;
}

interface User {
  _id: string;
  fullName: string;
  address: string;
  phoneNumber: string;
  imageUrls: string[];
  status: "pending" | "approved" | "declined";
  createdAt: string;
  approvedAt?: string;
  declineReason?: string;
}

interface Stats {
  total: number;
  pending: number;
  approved: number;
  declined: number;
}

const MobileAdminDashboard = () => {
  const router = useRouter();
  const [admin, setAdmin] = useState<Admin | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [stats, setStats] = useState<Stats>({
    total: 0,
    pending: 0,
    approved: 0,
    declined: 0,
  });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState<"pending" | "all" | "stats">(
    "pending"
  );
  const [processingUser, setProcessingUser] = useState<string | null>(null);
  const [loggingOut, setLoggingOut] = useState(false);

  useEffect(() => {
    checkAuth();
    fetchData();
  }, []);

  const checkAuth = async () => {
    try {
      const token = localStorage.getItem("adminToken");
      if (!token) {
        router.push("/admin");
        return;
      }

      const response = await fetch("/api/auth/verify", {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await response.json();
      if (data.success) {
        setAdmin(data.admin);
      } else {
        localStorage.removeItem("adminToken");
        router.push("/admin");
      }
    } catch (error) {
      console.error("Auth check failed:", error);
      router.push("/admin");
    }
  };

  const fetchData = async () => {
    try {
      const token = localStorage.getItem("adminToken");

      // Fetch pending users
      const usersResponse = await fetch("/api/admin/verifications/pending", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const usersData = await usersResponse.json();

      // Fetch stats
      const statsResponse = await fetch("/api/admin/stats", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const statsData = await statsResponse.json();

      if (usersData.success) setUsers(usersData.data);
      if (statsData.success) setStats(statsData.data);
    } catch (error) {
      console.error("Failed to fetch data:", error);
      toast.error("Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchData();
    setRefreshing(false);
    toast.success("Data refreshed");
  };

  const handleApprove = async (userId: string) => {
    setProcessingUser(userId);
    try {
      const token = localStorage.getItem("adminToken");
      const response = await fetch("/api/admin/verifications/approve", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ userId }),
      });

      const data = await response.json();
      if (data.success) {
        toast.success("User approved successfully!");
        setSelectedUser(null);
        fetchData();
      } else {
        toast.error(data.error || "Approval failed");
      }
    } catch (error) {
      console.error("Approval error:", error);
      toast.error("Approval failed");
    } finally {
      setProcessingUser(null);
    }
  };

  const handleDecline = async (userId: string, reason: string) => {
    setProcessingUser(userId);
    try {
      const token = localStorage.getItem("adminToken");
      const response = await fetch("/api/admin/verifications/decline", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ userId, reason }),
      });

      const data = await response.json();
      if (data.success) {
        toast.success("User declined successfully!");
        setSelectedUser(null);
        fetchData();
      } else {
        toast.error(data.error || "Decline failed");
      }
    } catch (error) {
      console.error("Decline error:", error);
      toast.error("Decline failed");
    } finally {
      setProcessingUser(null);
    }
  };

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      // Add small delay to show loading state
      await new Promise((resolve) => setTimeout(resolve, 500));
      localStorage.removeItem("adminToken");
      router.push("/admin/login");
      toast.success("Logged out successfully");
    } catch (error) {
      console.error("Logout error:", error);
      toast.error("Logout failed");
    } finally {
      setLoggingOut(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

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

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="relative">
            <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto" />
            <div className="absolute inset-0 flex items-center justify-center">
              <Shield className="w-5 h-5 text-blue-600" />
            </div>
          </div>
          <div className="space-y-2">
            <p className="text-gray-800 font-medium">
              Loading admin dashboard...
            </p>
            <p className="text-sm text-gray-600">
              Verifying credentials and fetching data
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <div className="bg-white/90 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-10">
        <div className="px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-gray-600 rounded-full flex items-center justify-center">
                <Shield className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="font-bold text-gray-800">Admin Portal</h1>
                <p className="text-xs text-gray-600">
                  Welcome, {admin?.username}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleRefresh}
                disabled={refreshing}
                className="p-2"
              >
                <RefreshCw
                  className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`}
                />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLogout}
                disabled={loggingOut}
                className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 disabled:opacity-50"
              >
                {loggingOut ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <LogOut className="w-4 h-4" />
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="p-4 space-y-4">
        {/* Stats Cards */}
        <div className="grid grid-cols-2 gap-3">
          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-md">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                  <Clock className="w-5 h-5 text-yellow-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-800">
                    {refreshing ? (
                      <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
                    ) : (
                      stats.pending
                    )}
                  </p>
                  <p className="text-xs text-gray-600">Pending</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-md">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-800">
                    {refreshing ? (
                      <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
                    ) : (
                      stats.approved
                    )}
                  </p>
                  <p className="text-xs text-gray-600">Approved</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-md">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                  <XCircle className="w-5 h-5 text-red-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-800">
                    {refreshing ? (
                      <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
                    ) : (
                      stats.declined
                    )}
                  </p>
                  <p className="text-xs text-gray-600">Declined</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-md">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Users className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-800">
                    {refreshing ? (
                      <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
                    ) : (
                      stats.total
                    )}
                  </p>
                  <p className="text-xs text-gray-600">Total</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Pending Verifications */}
        <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-md">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CardTitle className="text-lg">Pending Verifications</CardTitle>
                {refreshing && (
                  <Loader2 className="w-4 h-4 animate-spin text-gray-400" />
                )}
              </div>
              <Badge
                variant="secondary"
                className="bg-yellow-100 text-yellow-800"
              >
                {refreshing ? "..." : users.length}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {refreshing ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <Card key={i} className="border border-gray-200">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex-1 space-y-2">
                          <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4" />
                          <div className="h-3 bg-gray-200 rounded animate-pulse w-1/2" />
                          <div className="h-3 bg-gray-200 rounded animate-pulse w-2/3" />
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="h-6 bg-gray-200 rounded animate-pulse w-16" />
                          <div className="w-4 h-4 bg-gray-200 rounded animate-pulse" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : users.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Clock className="w-12 h-12 mx-auto text-gray-300 mb-3" />
                <p className="font-medium">No pending verifications</p>
                <p className="text-sm">All caught up! 🎉</p>
              </div>
            ) : (
              users.map((user) => (
                <Card
                  key={user._id}
                  className="border border-gray-200 hover:border-blue-300 transition-colors cursor-pointer relative"
                  onClick={() => {
                    console.log("USER", user);
                    setSelectedUser(user);
                  }}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-800 truncate">
                          {user.fullName}
                        </h3>
                        <div className="flex items-center gap-2 mt-1">
                          <Phone className="w-3 h-3 text-gray-400" />
                          <p className="text-sm text-gray-600">
                            {user.phoneNumber}
                          </p>
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          <Calendar className="w-3 h-3 text-gray-400" />
                          <p className="text-xs text-gray-500">
                            {formatDate(user.createdAt)}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className={getStatusColor(user.status)}>
                          {user.status}
                        </Badge>
                        {processingUser === user._id ? (
                          <Loader2 className="w-4 h-4 text-blue-500 animate-spin" />
                        ) : (
                          <Eye className="w-4 h-4 text-gray-400" />
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </CardContent>
        </Card>
      </div>

      {/* User Detail Modal */}
      {selectedUser && (
        <UserDetailModal
          user={selectedUser}
          onClose={() => setSelectedUser(null)}
          onApprove={handleApprove}
          onDecline={handleDecline}
          isProcessing={processingUser === selectedUser._id}
        />
      )}
    </div>
  );
};

// User Detail Modal Component
interface UserDetailModalProps {
  user: User;
  onClose: () => void;
  onApprove: (userId: string) => void;
  onDecline: (userId: string, reason: string) => void;
  isProcessing?: boolean;
}

const UserDetailModal: React.FC<UserDetailModalProps> = ({
  user,
  onClose,
  onApprove,
  onDecline,
  isProcessing = false,
}) => {
  const [declineReason, setDeclineReason] = useState("");
  const [showDeclineInput, setShowDeclineInput] = useState(false);
  const [imagesLoading, setImagesLoading] = useState<Record<number, boolean>>(
    {}
  );

  const handleDecline = () => {
    if (!declineReason.trim()) {
      toast.error("Please provide a reason for declining");
      return;
    }
    onDecline(user._id, declineReason);
  };

  const handleImageLoad = (index: number) => {
    setImagesLoading((prev) => ({ ...prev, [index]: false }));
  };

  const handleImageStart = (index: number) => {
    setImagesLoading((prev) => ({ ...prev, [index]: true }));
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-end">
      <div className="w-full bg-white rounded-t-3xl max-h-[90vh] overflow-y-auto">
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-800">
              Verification Details
            </h2>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              disabled={isProcessing}
              className="disabled:opacity-50"
            >
              ✕
            </Button>
          </div>
        </div>

        <div className="p-4 space-y-4">
          {/* User Info */}
          <Card>
            <CardContent className="p-4">
              <h3 className="font-medium text-gray-800 mb-3">
                Personal Information
              </h3>
              <div className="space-y-2 text-sm">
                <div>
                  <span className="text-gray-600">Name:</span>
                  <span className="ml-2 font-medium">{user.fullName}</span>
                </div>
                <div>
                  <span className="text-gray-600">Phone:</span>
                  <span className="ml-2 font-medium">{user.phoneNumber}</span>
                </div>
                <div>
                  <span className="text-gray-600">Address:</span>
                  <span className="ml-2">{user.address}</span>
                </div>
                <div>
                  <span className="text-gray-600">Submitted:</span>
                  <span className="ml-2">
                    {new Date(user.createdAt).toLocaleString()}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Images */}
          <Card>
            <CardContent className="p-4">
              <h3 className="font-medium text-gray-800 mb-3">ID Documents</h3>
              <div className="grid grid-cols-1 gap-3">
                {user.imageUrls.map((imageUrl, index) => (
                  <div key={index} className="space-y-2">
                    <p className="text-sm text-gray-600">
                      Document {index + 1}
                    </p>
                    <div className="relative aspect-video bg-gray-100 rounded-lg overflow-hidden">
                      {imagesLoading[index] && (
                        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 z-10">
                          <div className="text-center space-y-2">
                            <Loader2 className="w-8 h-8 animate-spin text-gray-400 mx-auto" />
                            <p className="text-sm text-gray-500">
                              Loading image...
                            </p>
                          </div>
                        </div>
                      )}
                      <img
                        src={imageUrl}
                        alt={`Document ${index + 1}`}
                        className="w-full h-full object-contain"
                        onLoadStart={() => handleImageStart(index)}
                        onLoad={() => handleImageLoad(index)}
                        onError={(e) => {
                          handleImageLoad(index);
                          e.currentTarget.src =
                            "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjNmNGY2Ii8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzZiNzI4MCIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkltYWdlIG5vdCBhdmFpbGFibGU8L3RleHQ+PC9zdmc+";
                        }}
                        style={{
                          opacity: imagesLoading[index] ? 0 : 1,
                          transition: "opacity 0.3s",
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          {user.status === "pending" && (
            <div className="space-y-3">
              {!showDeclineInput ? (
                <div className="grid grid-cols-2 gap-3">
                  <Button
                    onClick={() => onApprove(user._id)}
                    disabled={isProcessing}
                    className="h-12 bg-green-500 hover:bg-green-600 text-white disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isProcessing ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Approving...
                      </>
                    ) : (
                      <>
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Approve
                      </>
                    )}
                  </Button>
                  <Button
                    onClick={() => setShowDeclineInput(true)}
                    disabled={isProcessing}
                    variant="outline"
                    className="h-12 border-red-200 text-red-600 hover:bg-red-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <XCircle className="w-4 h-4 mr-2" />
                    Decline
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  <textarea
                    placeholder="Enter reason for declining..."
                    value={declineReason}
                    onChange={(e) => setDeclineReason(e.target.value)}
                    disabled={isProcessing}
                    className="w-full p-3 border border-gray-300 rounded-lg resize-none h-20 disabled:opacity-50 disabled:cursor-not-allowed"
                  />
                  <div className="grid grid-cols-2 gap-3">
                    <Button
                      onClick={() => setShowDeclineInput(false)}
                      disabled={isProcessing}
                      variant="outline"
                      className="h-10 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={handleDecline}
                      disabled={isProcessing || !declineReason.trim()}
                      className="h-10 bg-red-500 hover:bg-red-600 text-white disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isProcessing ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Declining...
                        </>
                      ) : (
                        "Confirm Decline"
                      )}
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Processing Overlay */}
          {isProcessing && (
            <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50">
              <div className="bg-white rounded-lg p-6 shadow-lg">
                <div className="text-center space-y-3">
                  <Loader2 className="w-8 h-8 animate-spin text-blue-500 mx-auto" />
                  <p className="font-medium text-gray-800">
                    Processing request...
                  </p>
                  <p className="text-sm text-gray-600">Please wait</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MobileAdminDashboard;
