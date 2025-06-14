import { useEffect, useState, FC, ReactNode } from "react";

interface GrowCardProps {
  children: ReactNode;
  className?: string;
}

const GrowCard: FC<GrowCardProps> = ({ children, className }) => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const id = requestAnimationFrame(() => {
      setMounted(true);
    });
    return () => cancelAnimationFrame(id);
  }, []);

  return (
    <div
      className={`transform transition-transform duration-500 ease-out ${
        mounted ? "scale-100 opacity-100" : ""
      } ${className}`}
    >
      {children}
    </div>
  );
};

export default GrowCard;
