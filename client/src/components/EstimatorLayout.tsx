import React from 'react';
import { cn } from '@/lib/utils';
import { Cpu, Github, Info, Languages } from 'lucide-react';
import { Button } from './ui/tech-ui';
import { useTranslation } from 'react-i18next';

interface EstimatorLayoutProps {
  children: React.ReactNode;
}

export function EstimatorLayout({ children }: EstimatorLayoutProps) {
  const { t, i18n } = useTranslation();

  const toggleLanguage = () => {
    const newLang = i18n.language === 'en' ? 'zh' : 'en';
    i18n.changeLanguage(newLang);
  };

  return (
    <div className="min-h-screen bg-background text-foreground font-sans selection:bg-primary selection:text-primary-foreground">
      {/* Header */}
      <header className="border-b-2 border-border bg-card sticky top-0 z-50">
        <div className="container mx-auto h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary flex items-center justify-center border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
              <Cpu className="w-6 h-6 text-black" />
            </div>
            <div>
              <h1 className="text-xl font-bold font-mono uppercase tracking-tighter leading-none">
                {t('app.title')}
              </h1>
              <p className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest">
                {t('app.subtitle')}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={toggleLanguage}
              className="flex items-center gap-2"
            >
              <Languages className="w-4 h-4" />
              {i18n.language === 'en' ? '中文' : 'EN'}
            </Button>

            <a 
              href="https://github.com/zihaoli-cn/llm-vram-estimator" 
              target="_blank" 
              rel="noreferrer"
              className="hidden sm:flex items-center gap-2 text-sm font-mono text-muted-foreground hover:text-primary transition-colors"
            >
              <Github className="w-4 h-4" />
              <span>{t('app.github')}</span>
            </a>
            <Button variant="outline" size="sm" className="hidden sm:flex">
              <Info className="w-4 h-4 mr-2" />
              {t('app.about')}
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto py-8">
        {children}
      </main>

      {/* Footer */}
      <footer className="border-t-2 border-border bg-card mt-auto py-8">
        <div className="container mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-xs font-mono text-muted-foreground">
            {t('app.footer')}
          </p>
          <div className="flex items-center gap-6">
            <span className="flex items-center gap-2 text-xs font-mono text-muted-foreground">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
              {t('app.systemOnline')}
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}
