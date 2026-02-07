import { useState } from "react";
import { LogOut, Menu } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";

interface HeaderProps {
  onMenuClick: () => void;
}

export function Header({ onMenuClick }: HeaderProps) {
  const { user, signOut } = useAuth();
  const { toast } = useToast();
  const [isSigningOut, setIsSigningOut] = useState(false);

  const handleSignOut = async () => {
    setIsSigningOut(true);
    const result = await signOut();
    setIsSigningOut(false);

    if (result.error) {
      toast({
        title: "Nao foi possivel sair",
        description: result.error,
        variant: "destructive",
      });
    }
  };

  return (
    <header className="flex h-16 items-center justify-between border-b border-sidebar-border bg-sidebar/50 px-6 backdrop-blur-xl sticky top-0 z-30">
      <Button
        variant="ghost"
        size="icon"
        className="md:hidden -ml-2"
        onClick={onMenuClick}
      >
        <Menu className="h-5 w-5" />
      </Button>

      <div className="flex items-center gap-4 ml-auto">
        {user?.email && (
          <span className="hidden md:block text-sm text-muted-foreground truncate max-w-[200px]">
            {user.email}
          </span>
        )}
        <Button
          variant="outline"
          size="sm"
          className="gap-2 border-white/10 bg-white/5 hover:bg-white/10 hover:text-white"
          onClick={handleSignOut}
          disabled={isSigningOut}
        >
          <LogOut className="h-4 w-4" />
          <span className="hidden md:inline">
            {isSigningOut ? "Saindo..." : "Sair"}
          </span>
        </Button>
      </div>
    </header>
  );
}
