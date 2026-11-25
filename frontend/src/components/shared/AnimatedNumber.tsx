"use client";

import React, { useEffect } from "react";
import { useMotionValue, useSpring, useTransform, motion } from "framer-motion";

interface AnimatedNumberProps {
  value: number;
  prefix?: string;
  suffix?: string;
  decimals?: number;
  className?: string;
}

export const AnimatedNumber: React.FC<AnimatedNumberProps> = ({
  value,
  prefix = "",
  suffix = "",
  decimals = 0,
  className = "",
}) => {
  const motionVal = useMotionValue(value || 0);
  const springVal = useSpring(motionVal, {
    stiffness: 280,
    damping: 28,
    mass: 0.8,
  });

  useEffect(() => {
    motionVal.set(value || 0);
  }, [value, motionVal]);

  const display = useTransform(springVal, (current) => {
    const formatted = new Intl.NumberFormat("en-IN", {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    }).format(current);
    return `${prefix}${formatted}${suffix}`;
  });

  return <motion.span className={className}>{display}</motion.span>;
};
