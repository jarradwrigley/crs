import React, { useState } from "react";
import {
  ChevronDown,
  ChevronRight,
  Calendar,
  DollarSign,
  Phone,
  Mail,
  Smartphone,
  FileText,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Filter,
} from "lucide-react";
import { User } from "@/types/auth";

interface TransactionHistoryProps {
  user: User;
}

const TransactionHistory: React.FC<TransactionHistoryProps> = ({ user }) => {
  const [expandedTransaction, setExpandedTransaction] = useState<string | null>(
    null
  );
  const [filterStatus, setFilterStatus] = useState<string>("ALL");
  const [showFilter, setShowFilter] = useState(false);

  const getStatusIcon = (status: string) => {
    switch (status.toUpperCase()) {
      case "COMPLETED":
      case "SUCCESS":
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case "PENDING":
        return <Clock className="w-4 h-4 text-yellow-600" />;
      case "FAILED":
      case "CANCELLED":
        return <XCircle className="w-4 h-4 text-red-600" />;
      default:
        return <AlertCircle className="w-4 h-4 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toUpperCase()) {
      case "COMPLETED":
      case "SUCCESS":
        return "bg-green-100 text-green-800";
      case "PENDING":
        return "bg-yellow-100 text-yellow-800";
      case "FAILED":
      case "CANCELLED":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
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

  const formatAmount = (amount: number, currency: string) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency || "USD",
    }).format(amount);
  };

  const getPlanDisplayName = (plan: string) => {
    const planNames: { [key: string]: string } = {
      "mobile-v4-basic": "Mobile v4 Basic",
      "mobile-v4-premium": "Mobile v4 Premium",
      "mobile-v4-enterprise": "Mobile v4 Enterprise",
      "mobile-v5-basic": "Mobile v5 Basic",
      "full-suite-basic": "Full Suite Basic",
      "full-suite-premium": "Full Suite Premium",
    };
    return planNames[plan] || plan;
  };

  const getTransactionTypeDisplay = (type: string) => {
    return type
      .replace(/_/g, " ")
      .toLowerCase()
      .replace(/\b\w/g, (l) => l.toUpperCase());
  };

  const transactionHistory = user.transactionHistory || [];

  const filteredTransactions = transactionHistory.filter((transaction) => {
    if (filterStatus === "ALL") return true;
    return transaction.status.toUpperCase() === filterStatus;
  });

  const toggleExpanded = (transactionId: string) => {
    setExpandedTransaction(
      expandedTransaction === transactionId ? null : transactionId
    );
  };

  if (!transactionHistory || transactionHistory.length === 0) {
    return (
      <div className="bg-white rounded-xl p-4 shadow-md border border-gray-100">
        <div className="flex items-center gap-3 mb-4">
          <FileText className="w-5 h-5 text-gray-600" />
          <h3 className="text-lg font-semibold text-gray-800">
            Transaction History
          </h3>
        </div>
        <div className="text-center py-8">
          <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 font-medium mb-1">No transactions yet</p>
          <p className="text-sm text-gray-400">
            Your transaction history will appear here
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="flex items-center justify-between mb-3 mt-6">
        <div className="flex items-center gap-3">
          {/* <FileText className="w-5 h-5 text-gray-600" /> */}
          <h3 className="text-lg font-semibold text-gray-800">History</h3>
        </div>

        {/* Filter Button */}
        <button
          onClick={() => setShowFilter(!showFilter)}
          className="flex items-center gap-2 px-3 py-2 bg-gray-50 rounded-lg border border-gray-200"
        >
          <Filter className="w-4 h-4 text-gray-600" />
          <span className="text-sm text-gray-600">Filter</span>
          <ChevronDown
            className={`w-4 h-4 text-gray-600 transition-transform ${
              showFilter ? "rotate-180" : ""
            }`}
          />
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-md border border-gray-100">
        {/* Header */}
        {/* <div className="p-4 border-b border-gray-100">
          
          <div className="flex justify-between bg-gray-50 rounded-lg p-3">
            <div className="text-center flex-1">
              <p className="text-xs text-gray-500 uppercase tracking-wide">
                Total Spent
              </p>
              <p className="text-lg font-bold text-gray-800">
                {formatAmount(user.totalSpent || 0, "USD")}
              </p>
            </div>
            <div className="w-px bg-gray-200 mx-3"></div>
            <div className="text-center flex-1">
              <p className="text-xs text-gray-500 uppercase tracking-wide">
                Completed
              </p>
              <p className="text-lg font-bold text-gray-800">
                {user.completedTransactions || 0}
              </p>
            </div>
            <div className="w-px bg-gray-200 mx-3"></div>
            <div className="text-center flex-1">
              <p className="text-xs text-gray-500 uppercase tracking-wide">
                Total
              </p>
              <p className="text-lg font-bold text-gray-800">
                {transactionHistory.length}
              </p>
            </div>
          </div>

        </div> */}

          {/* Filter Dropdown */}
        {showFilter && (
          <div className="mt-3 space-y-2">
            <div className="flex gap-2 flex-wrap">
              {["ALL", "PENDING", "COMPLETED", "FAILED"].map((status) => (
                <button
                  key={status}
                  onClick={() => {
                    setFilterStatus(status);
                    setShowFilter(false);
                  }}
                  className={`px-3 py-2 rounded-full text-sm font-medium transition-colors ${
                    filterStatus === status
                      ? "bg-blue-500 text-white"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  {status === "ALL"
                    ? "All"
                    : status.charAt(0) + status.slice(1).toLowerCase()}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Transaction List */}
        <div className="divide-y divide-gray-100">
          {filteredTransactions.map((transaction, index) => (
            <div key={transaction._id}>
              {/* Transaction Summary */}
              <div
                className="p-4 active:bg-gray-50 transition-colors"
                onClick={() => toggleExpanded(transaction._id)}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      {getStatusIcon(transaction.status)}
                      <h4 className="font-semibold text-gray-900 text-sm truncate">
                        {getPlanDisplayName(transaction.plan)}
                      </h4>
                    </div>
                    <p className="text-xs text-gray-500 mb-2">
                      {transaction.metadata.deviceInfo.deviceName} •{" "}
                      {getTransactionTypeDisplay(transaction.type)}
                    </p>
                    <p className="text-xs text-gray-400">
                      {formatDate(transaction.createdAt)}
                    </p>
                  </div>

                  <div className="text-right ml-3">
                    <p className="font-bold text-gray-900 text-lg">
                      {formatAmount(transaction.amount, transaction.currency)}
                    </p>
                    <span
                      className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                        transaction.status
                      )}`}
                    >
                      {transaction.status}
                    </span>
                  </div>
                </div>

                {/* Expand Indicator */}
                {/* <div className="flex items-center justify-center pt-2">
                  {expandedTransaction === transaction._id ? (
                    <ChevronDown className="w-5 h-5 text-gray-400" />
                  ) : (
                    <ChevronRight className="w-5 h-5 text-gray-400" />
                  )}
                </div> */}
              </div>

              {/* Expanded Details */}
              {expandedTransaction === transaction._id && (
                <div className="px-4 pb-4 bg-gray-50">
                  {/* Transaction Details Card */}
                  <div className="bg-white rounded-lg p-3 mb-3 border border-gray-200">
                    <h5 className="font-semibold text-gray-700 mb-3 text-sm">
                      Transaction Details
                    </h5>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">
                          Transaction ID
                        </span>
                        <span className="font-mono text-xs text-gray-800 bg-gray-100 px-2 py-1 rounded">
                          {transaction.transactionId}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">
                          Payment Method
                        </span>
                        <span className="text-sm text-gray-800">
                          {transaction.paymentMethod.replace(/_/g, " ")}
                        </span>
                      </div>
                      {transaction.queuePosition && (
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">
                            Queue Position
                          </span>
                          <span className="text-sm font-medium text-gray-800">
                            #{transaction.queuePosition}
                          </span>
                        </div>
                      )}
                      {transaction.queuedAt && (
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">
                            Queued At
                          </span>
                          <span className="text-sm text-gray-800">
                            {formatDate(transaction.queuedAt)}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Device Info Card */}
                  <div className="bg-white rounded-lg p-3 mb-3 border border-gray-200">
                    <h5 className="font-semibold text-gray-700 mb-3 text-sm">
                      Device & Contact
                    </h5>
                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        <Smartphone className="w-4 h-4 text-gray-400" />
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-800">
                            {transaction.metadata.deviceInfo.deviceName}
                          </p>
                          <p className="text-xs text-gray-500 font-mono">
                            {transaction.metadata.deviceInfo.imei}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Phone className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-gray-800">
                          {transaction.metadata.phoneNumber}
                        </span>
                      </div>
                      <div className="flex items-center gap-3">
                        <Mail className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-gray-800 truncate">
                          {transaction.metadata.email}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Subscription Info */}
                  {transaction.subscription && (
                    <div className="bg-white rounded-lg p-3 mb-3 border border-gray-200">
                      <h5 className="font-semibold text-gray-700 mb-3 text-sm">
                        Subscription
                      </h5>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">Plan</span>
                          <span className="text-sm font-medium text-gray-800">
                            {getPlanDisplayName(transaction.subscription.plan)}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">Status</span>
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                              transaction.subscription.status
                            )}`}
                          >
                            {transaction.subscription.status}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Submission Notes */}
                  {transaction.metadata.submissionNotes && (
                    <div className="bg-white rounded-lg p-3 border border-gray-200">
                      <h5 className="font-semibold text-gray-700 mb-2 text-sm">
                        Notes
                      </h5>
                      <p className="text-sm text-gray-600 leading-relaxed">
                        {transaction.metadata.submissionNotes}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </>
  );
};

export default TransactionHistory;
