import { Link, useNavigate } from 'react-router-dom';
import { LogOut, User } from 'lucide-react';
import { Button } from '../ui/button';
import { CreditBadge } from '../CreditBadge';
import { useAuth } from '@/hooks/useAuth';
import { useUserProfile } from '@/hooks/useUserProfile';

export function Header() {
  const { user, signOut } = useAuth();
  const { data: profile } = useUserProfile(user?.id);
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-studio-border bg-white/70 backdrop-blur-xl">
      <div className="container mx-auto px-4 h-20 flex items-center justify-between">
        <Link to={user ? '/dashboard' : '/'} className="flex flex-col items-start group">
          <span className="text-3xl font-black italic tracking-tighter text-studio-text-main leading-none">
            agentized.io
          </span>
          <div className="w-[160px] h-[4px] bg-studio-neon-lime -mt-1 shadow-[0_2_8px_rgba(204,255,0,0.3)]" />
        </Link>

        <div className="flex items-center gap-6">
          {user && profile ? (
            <>
              <CreditBadge credits={profile.credits_balance} />

              <div className="hidden md:flex items-center gap-2 px-5 py-2.5 rounded-full bg-studio-surface border border-studio-border shadow-sm">
                <User className="w-4 h-4 text-studio-text-muted" />
                <span className="text-sm font-bold text-studio-text-main">
                  {profile.full_name || profile.email}
                </span>
              </div>

              <Button
                variant="ghost"
                size="icon"
                onClick={handleSignOut}
                title="Sign Out"
                className="text-studio-text-muted hover:text-studio-text-main hover:bg-studio-surface"
              >
                <LogOut className="w-5 h-5" />
              </Button>
            </>
          ) : (
            <>
              <Button variant="ghost" onClick={() => navigate('/auth')} className="text-studio-text-main font-bold hover:bg-studio-surface">
                Login
              </Button>
              <Button onClick={() => navigate('/auth')} className="studio-neon-button h-11 px-8">
                Get Started
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
