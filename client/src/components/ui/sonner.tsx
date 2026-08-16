import { useTheme } from "next-themes";
import { Toaster as Sonner, type ToasterProps } from "sonner";

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme();

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      style={
        {
          "--normal-bg": "#fffdf8",
          "--normal-text": "#174e51",
          "--normal-border": "#bdd6cf",
        } as React.CSSProperties
      }
      {...props}
    />
  );
};

export { Toaster };
