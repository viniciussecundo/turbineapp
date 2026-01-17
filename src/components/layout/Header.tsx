import { LogOut, Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface HeaderProps {
  onMenuClick: () => void;
}

export function Header({ onMenuClick }: HeaderProps) {
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
        <Button
          variant="outline"
          size="sm"
          className="hidden md:flex gap-2 border-white/10 bg-white/5 hover:bg-white/10 hover:text-white"
        >
          <LogOut className="h-4 w-4" />
          Sair
        </Button>
      </div>
    </header>
  );
}
