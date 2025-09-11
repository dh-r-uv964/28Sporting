import React from 'react';
import { motion } from 'framer-motion';

export default function PageHeader({ icon: Icon, title, subtitle }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="mb-8 md:mb-12"
    >
      <div className="flex items-center space-x-4 mb-4">
        {Icon && (
          <div className="w-14 h-14 bg-gradient-to-br from-emerald-500 to-green-600 rounded-2xl flex items-center justify-center shadow-lg">
            <Icon className="w-7 h-7 text-white" />
          </div>
        )}
        <div>
          <h1 className="text-3xl md:text-4xl font-black text-gray-900 dark:text-white tracking-tight">{title}</h1>
          {subtitle && <p className="text-lg text-gray-600 dark:text-gray-300 mt-1">{subtitle}</p>}
        </div>
      </div>
    </motion.div>
  );
}