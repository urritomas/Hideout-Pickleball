"use client";

import { motion } from "framer-motion";
import type { PropsWithChildren } from "react";

type WrapperProps = PropsWithChildren<{
  className?: string;
}>;

export function FadeIn({ children, className }: WrapperProps) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.35 }}
    >
      {children}
    </motion.div>
  );
}

export function Stagger({ children, className }: WrapperProps) {
  return (
    <motion.div
      className={className}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, amount: 0.2 }}
      variants={{
        hidden: {},
        show: {
          transition: {
            staggerChildren: 0.08,
          },
        },
      }}
    >
      {children}
    </motion.div>
  );
}
