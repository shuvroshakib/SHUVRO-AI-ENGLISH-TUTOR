import { motion } from 'framer-motion';

interface AvatarProps {
  state: 'idle' | 'listening' | 'thinking' | 'speaking' | 'correcting' | 'encouraging' | 'confused';
}

export default function Avatar({ state }: AvatarProps) {
  const getExpression = () => {
    switch (state) {
      case 'listening': return { scaleY: 1.05, rotate: 2 };
      case 'thinking': return { rotate: [0, -3, 3, 0], scale: 1.02 };
      case 'speaking': return { scaleY: [1, 1.08, 1], scaleX: [1, 0.98, 1] };
      case 'correcting': return { rotate: 0, scale: 1 };
      case 'encouraging': return { scale: 1.1, rotate: [0, -5, 5, 0] };
      case 'confused': return { rotate: -5, scale: 0.98 };
      default: return { scale: 1, rotate: 0 };
    }
  };

  const mouthVariant = state === 'speaking' ? {
    scaleY: [1, 1.5, 0.8, 1.3, 1],
    transition: { repeat: Infinity, duration: 0.4 }
  } : { scaleY: 1 };

  const eyeVariant = state === 'listening' ? {
    scaleY: [1, 0.3, 1],
    transition: { repeat: Infinity, repeatDelay: 3, duration: 0.2 }
  } : { scaleY: 1 };

  return (
    <div className="relative w-48 h-48 md:w-64 md:h-64 mx-auto">
      <motion.div
        animate={getExpression()}
        transition={{ type: 'spring', stiffness: 200, damping: 15 }}
        className="w-full h-full relative"
      >
        {/* Face */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary-200 to-accent-200 rounded-full shadow-xl" />

        {/* Hair */}
        <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-40 h-20 bg-gradient-to-b from-primary-300 to-primary-200 rounded-t-full" />

        {/* Eyes */}
        <div className="absolute top-[38%] left-[25%] w-5 h-5 md:w-7 md:h-7 bg-white rounded-full flex items-center justify-center">
          <motion.div animate={eyeVariant} className="w-3 h-3 md:w-4 md:h-4 bg-gray-800 rounded-full" />
        </div>
        <div className="absolute top-[38%] right-[25%] w-5 h-5 md:w-7 md:h-7 bg-white rounded-full flex items-center justify-center">
          <motion.div animate={eyeVariant} className="w-3 h-3 md:w-4 md:h-4 bg-gray-800 rounded-full" />
        </div>

        {/* Eyebrows */}
        <motion.div 
          animate={{ y: state === 'thinking' ? -4 : state === 'confused' ? 2 : 0, rotate: state === 'confused' ? -10 : 0 }}
          className="absolute top-[30%] left-[22%] w-7 h-1.5 bg-gray-700 rounded-full"
        />
        <motion.div 
          animate={{ y: state === 'thinking' ? -4 : state === 'confused' ? -2 : 0, rotate: state === 'confused' ? 10 : 0 }}
          className="absolute top-[30%] right-[22%] w-7 h-1.5 bg-gray-700 rounded-full"
        />

        {/* Mouth */}
        <motion.div
          animate={mouthVariant}
          className={`absolute bottom-[28%] left-1/2 -translate-x-1/2 w-12 h-5 md:w-16 md:h-6 rounded-full ${state === 'speaking' ? 'bg-red-400' : 'bg-red-300'}`}
        />

        {/* Blush */}
        <div className="absolute top-[52%] left-[15%] w-6 h-4 bg-pink-300 rounded-full opacity-40" />
        <div className="absolute top-[52%] right-[15%] w-6 h-4 bg-pink-300 rounded-full opacity-40" />
      </motion.div>

      {/* Status indicator */}
      <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 px-4 py-1.5 bg-white rounded-full shadow-md text-xs font-medium text-gray-600 capitalize border border-gray-100">
        {state === 'idle' ? 'Ready' : state}
      </div>
    </div>
  );
}
