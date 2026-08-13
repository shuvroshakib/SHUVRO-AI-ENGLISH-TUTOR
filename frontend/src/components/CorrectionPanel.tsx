import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle } from 'lucide-react';
import type { Correction } from '../types';

interface Props {
  correction: Correction | null;
}

export default function CorrectionPanel({ correction }: Props) {
  return (
    <AnimatePresence>
      {correction && (
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.95 }}
          transition={{ type: 'spring', stiffness: 300, damping: 25 }}
          className="bg-white border border-primary-200 rounded-xl p-4 shadow-lg"
        >
          <div className="flex items-center gap-2 mb-3">
            <AlertCircle className="text-primary-500" size={20} />
            <h3 className="font-semibold text-gray-800">Correction</h3>
          </div>

          <div className="space-y-2 text-sm">
            <div className="flex gap-2">
              <span className="text-red-500 font-medium shrink-0">You said:</span>
              <span className="text-gray-700 line-through decoration-red-400">{correction.original}</span>
            </div>
            <div className="flex gap-2">
              <span className="text-green-600 font-medium shrink-0">Better:</span>
              <span className="text-gray-800 font-semibold">{correction.corrected}</span>
            </div>
            <div className="text-gray-600 bg-gray-50 p-2.5 rounded-lg text-xs leading-relaxed">
              {correction.explanation}
            </div>
            {correction.banglaExplanation && (
              <div className="text-gray-700 bg-primary-50 p-2.5 rounded-lg border-l-4 border-primary-400 text-xs leading-relaxed">
                {correction.banglaExplanation}
              </div>
            )}
            {correction.focusWord && (
              <div className="text-xs text-primary-600 font-medium bg-primary-50 inline-block px-2 py-1 rounded">
                Focus: <span className="uppercase">{correction.focusWord}</span>
              </div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
