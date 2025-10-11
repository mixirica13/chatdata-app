export const Logo = ({ className = "w-32 h-32" }: { className?: string }) => {
  return (
    <img
      src="/logo.svg"
      alt="ChatData Logo"
      className={className}
    />
  );
};
