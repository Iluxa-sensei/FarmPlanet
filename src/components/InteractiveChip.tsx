import React from 'react';
import { motion } from 'framer-motion';

interface InteractiveChipProps {
  id: string;
  title: string;
  isSelected: boolean;
  onClick: (id: string) => void;
}

const InteractiveChip = ({ id, title, isSelected, onClick }: InteractiveChipProps) => {
  return (
    <motion.button
      onClick={() => onClick(id)}
      className={`px-6 py-3 rounded-full border-2 transition-all duration-300 font-medium ${
        isSelected
          ? 'bg-primary text-primary-foreground border-primary shadow-glow'
          : 'bg-background/50 text-foreground border-border hover:border-primary/50 hover:bg-primary/10'
      }`}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      {title}
    </motion.button>
  );
};

export default InteractiveChip;