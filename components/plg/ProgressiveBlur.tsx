"use client";

import { useState } from "react";
import { motion } from "framer-motion";

export default function ProgressiveBlur({ children, unlockOnHover = true }: { children: React.ReactNode; unlockOnHover?: boolean }) {
  const [blur, setBlur] = useState(10);

  return (
    <motion.div
      onMouseEnter={() => unlockOnHover && setBlur(0)}
      onMouseLeave={() => unlockOnHover && setBlur(10)}
      style={{ filter: `blur(${blur}px)`, transition: 'filter 0.3s ease' }}
      className="cursor-pointer"
    >
      {children}
    </motion.div>
  );
}

