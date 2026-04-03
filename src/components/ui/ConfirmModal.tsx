"use client";

import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle, X } from "lucide-react";
import { useEffect } from "react";

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
  variant?: "danger" | "warning" | "info";
  isLoading?: boolean;
}

export default function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmText = "Confirm",
  cancelText = "Cancel",
  variant = "danger",
  isLoading = false,
}: ConfirmModalProps) {
  // Prevent scrolling when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  const variantStyles = {
    danger: "bg-rose-600 hover:bg-rose-700 text-white shadow-rose-200",
    warning: "bg-amber-500 hover:bg-amber-600 text-white shadow-amber-200",
    info: "bg-gray-900 hover:bg-gray-800 text-white shadow-gray-200",
  };

  const iconStyles = {
    danger: "bg-rose-50 text-rose-600",
    warning: "bg-amber-50 text-amber-600",
    info: "bg-gray-50 text-gray-600",
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-gray-900/40 backdrop-blur-[6px]"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            className="relative w-full max-w-md bg-white rounded-[2rem] shadow-2xl overflow-hidden border border-gray-100"
          >
            {/* Close Button */}
            <button
              onClick={onClose}
              disabled={isLoading}
              className="absolute top-6 right-6 p-2 rounded-full hover:bg-gray-50 text-gray-400 transition-colors"
            >
              <X size={20} />
            </button>

            <div className="p-8 md:p-10">
              <div className="flex flex-col items-center text-center">
                {/* Icon */}
                <div className={`w-16 h-16 rounded-3xl flex items-center justify-center mb-6 ${iconStyles[variant]}`}>
                  <AlertTriangle size={32} />
                </div>

                <h3 className="text-2xl font-bold text-gray-900 mb-3 tracking-tight" style={{ fontFamily: "var(--font-serif)" }}>
                  {title}
                </h3>
                <p className="text-gray-500 leading-relaxed max-w-[280px]">
                  {description}
                </p>
              </div>

              {/* Actions */}
              <div className="mt-10 grid grid-cols-2 gap-4">
                <button
                  onClick={onClose}
                  disabled={isLoading}
                  className="h-14 rounded-2xl border border-gray-100 text-gray-600 font-bold hover:bg-gray-50 transition-all active:scale-95 disabled:opacity-50"
                >
                  {cancelText}
                </button>
                <button
                  onClick={onConfirm}
                  disabled={isLoading}
                  className={`h-14 rounded-2xl font-bold shadow-lg transition-all active:scale-95 flex items-center justify-center disabled:opacity-50 ${variantStyles[variant]}`}
                >
                  {isLoading ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    confirmText
                  )}
                </button>
              </div>
            </div>

            {/* Bottom Accent */}
            <div className={`h-1.5 w-full bg-gradient-to-r ${variant === "danger" ? "from-rose-500 to-orange-500" : "from-amber-400 to-orange-400"}`} />
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
