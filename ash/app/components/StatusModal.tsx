// components/StatusModal.tsx
import React from "react";
import { Button } from "./ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import { CheckCircle, Clock, XCircle, User } from "lucide-react";

interface StatusModalProps {
  isOpen: boolean;
  onClose: () => void;
  status: "unencrypted" | "pending" | "encrypted";
  isExistingUser: boolean;
  statusDetails: string;
  userId: string;
}

const StatusModal: React.FC<StatusModalProps> = ({
  isOpen,
  onClose,
  status,
  isExistingUser,
  statusDetails,
  userId,
}) => {
  const getStatusIcon = () => {
    switch (status) {
      case "encrypted":
        return <CheckCircle className="w-16 h-16 text-green-500" />;
      case "unencrypted":
        return <XCircle className="w-16 h-16 text-red-500" />;
      default:
        return <Clock className="w-16 h-16 text-yellow-500" />;
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case "encrypted":
        return "text-green-600";
      case "unencrypted":
        return "text-red-600";
      default:
        return "text-yellow-600";
    }
  };

  const getStatusTitle = () => {
    switch (status) {
      case "encrypted":
        return "Verification Approved";
      case "unencrypted":
        return "Verification Declined";
      default:
        return "Verification Pending";
    }
  };

  const getBgGradient = () => {
    switch (status) {
      case "encrypted":
        return "from-green-50 to-emerald-50";
      case "unencrypted":
        return "from-red-50 to-pink-50";
      default:
        return "from-yellow-50 to-amber-50";
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md mx-auto">
        <div className={`bg-gradient-to-br ${getBgGradient()} rounded-lg p-6`}>
          <DialogHeader className="text-center space-y-4">
            <div className="flex justify-center">{getStatusIcon()}</div>

            <DialogTitle className={`text-2xl font-bold ${getStatusColor()}`}>
              {getStatusTitle()}
            </DialogTitle>

            <div className="space-y-2">
              {isExistingUser && (
                <div className="flex items-center justify-center gap-2 text-sm text-gray-600 bg-white/50 rounded-full px-3 py-1">
                  <User className="w-4 h-4" />
                  <span>Existing User Found</span>
                </div>
              )}

              <DialogDescription className="text-gray-700 leading-relaxed">
                {statusDetails}
              </DialogDescription>

              {status === "pending" && (
                <div className="text-sm text-gray-600 mt-4 p-3 bg-white/50 rounded-lg">
                  <p>
                    <strong>What happens next?</strong>
                  </p>
                  <p>
                    Our team will review your documents within 24-48 hours.
                    You'll be notified once a decision is made.
                  </p>
                </div>
              )}

              {status === "unencrypted" && (
                <div className="text-sm text-gray-600 mt-4 p-3 bg-white/50 rounded-lg">
                  <p>
                    <strong>You can resubmit:</strong>
                  </p>
                  <p>
                    Please ensure your documents are clear and all information
                    matches exactly.
                  </p>
                </div>
              )}

              {status === "encrypted" && (
                <div className="text-sm text-gray-600 mt-4 p-3 bg-white/50 rounded-lg">
                  <p>
                    <strong>Your data is now secure:</strong>
                  </p>
                  <p>
                    All your personal information has been encrypted and routed
                    safely.
                  </p>
                </div>
              )}
            </div>
          </DialogHeader>

          <div className="mt-6 space-y-3">
            <div className="text-xs text-gray-500 text-center">
              Reference ID: {userId}
            </div>

            <Button
              onClick={onClose}
              className="w-full h-12 bg-gradient-to-r from-blue-500 to-gray-600 hover:from-blue-600 hover:to-gray-700 text-white rounded-xl shadow-lg transition-all duration-200"
            >
              Done
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default StatusModal;
