import React from "react";
import styles from "./Card.module.css";

interface CardProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  className?: string;
}

export function Card({ children, title, subtitle, className }: CardProps) {
  return (
    <div className={`${styles.card} ${className || ""}`}>
      {(title || subtitle) && (
        <div className={styles.cardHeader}>
          {title && <h2 className={styles.cardTitle}>{title}</h2>}
          {subtitle && <p className={styles.cardSubtitle}>{subtitle}</p>}
        </div>
      )}
      <div className={styles.cardContent}>{children}</div>
    </div>
  );
}
