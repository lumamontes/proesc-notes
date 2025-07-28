import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Download, X, Info, Zap } from 'lucide-react';
import { installPWA, isInstalled, checkPWACriteria } from '@/lib/pwa';

export default function PWAInstallPrompt() {
  const [showPrompt, setShowPrompt] = useState(false);
  const [installing, setInstalling] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showDebug, setShowDebug] = useState(false);
  const [criteria, setCriteria] = useState<any>(null);

  useEffect(() => {
    // Check PWA criteria
    const pwaCriteria = checkPWACriteria();
    setCriteria(pwaCriteria);

    // Don't show if already installed
    if (isInstalled()) {
      console.log('PWA already installed, not showing prompt');
      return;
    }

    // Listen for the beforeinstallprompt event
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      console.log('beforeinstallprompt event received');
      setDeferredPrompt(e);
      setShowPrompt(true);
    };

    // Listen for the appinstalled event
    const handleAppInstalled = () => {
      console.log('appinstalled event received');
      setShowPrompt(false);
      setDeferredPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    // Show prompt after a delay if no beforeinstallprompt event
    const timer = setTimeout(() => {
      if (!deferredPrompt && !isInstalled()) {
        console.log('No beforeinstallprompt event, showing fallback prompt');
        setShowPrompt(true);
      }
    }, 3000); // Reduced to 3 seconds

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
      clearTimeout(timer);
    };
  }, [deferredPrompt]);

  const handleInstall = async () => {
    try {
      setInstalling(true);
      
      if (deferredPrompt) {
        console.log('Using deferred prompt for installation');
        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        console.log('Installation outcome:', outcome);
        if (outcome === 'accepted') {
          setShowPrompt(false);
        }
        setDeferredPrompt(null);
      } else {
        console.log('Using fallback install method');
        const installed = await installPWA();
        if (installed) {
          setShowPrompt(false);
        }
      }
    } catch (error) {
      console.error('Installation failed:', error);
    } finally {
      setInstalling(false);
    }
  };

  const handleForceInstall = async () => {
    try {
      setInstalling(true);
      console.log('Force installing PWA...');
      
      // Try to trigger installation manually
      if ('serviceWorker' in navigator) {
        const registration = await navigator.serviceWorker.ready;
        console.log('Service Worker ready:', registration);
      }
      
      // Show instructions for manual installation
      alert('Para instalar o app:\n\n1. Clique no ícone de instalação na barra de endereços\n2. Ou vá em Menu > Instalar app\n3. Ou use Ctrl+Shift+I > Application > Manifest > Install');
      
    } catch (error) {
      console.error('Force installation failed:', error);
    } finally {
      setInstalling(false);
    }
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    setDeferredPrompt(null);
    // Don't show again for this session
    sessionStorage.setItem('pwa-prompt-dismissed', 'true');
  };

  // Don't show if already dismissed in this session
  if (sessionStorage.getItem('pwa-prompt-dismissed') || !showPrompt) {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 max-w-sm">
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2">
              <Download className="h-5 w-5 text-primary" />
              <CardTitle className="text-base">Instalar App</CardTitle>
            </div>
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowDebug(!showDebug)}
                className="h-6 w-6 p-0"
              >
                <Info className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleDismiss}
                className="h-6 w-6 p-0"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <CardDescription className="text-sm">
            Instale o Proesc Notes para acesso rápido e uso offline
          </CardDescription>
        </CardHeader>
        
        {showDebug && criteria && (
          <CardContent className="pb-3">
            <div className="text-xs space-y-1">
              <div className="font-semibold">PWA Criteria:</div>
              <div>Service Worker: {criteria.hasServiceWorker ? '✅' : '❌'}</div>
              <div>Manifest: {criteria.hasManifest ? '✅' : '❌'}</div>
              <div>HTTPS: {criteria.hasHttps ? '✅' : '❌'}</div>
              <div>Valid Icons: {criteria.hasValidIcons ? '✅' : '❌'}</div>
              <div>Installable: {criteria.isInstallable ? '✅' : '❌'}</div>
              <div>Deferred Prompt: {deferredPrompt ? '✅' : '❌'}</div>
            </div>
          </CardContent>
        )}
        
        <CardFooter className="pt-0 gap-2">
          <Button
            onClick={handleInstall}
            disabled={installing}
            size="sm"
            className="flex-1"
          >
            {installing ? 'Instalando...' : 'Instalar'}
          </Button>
          {!criteria?.isInstallable && (
            <Button
              onClick={handleForceInstall}
              disabled={installing}
              size="sm"
              variant="outline"
              className="flex-1"
            >
              <Zap className="h-3 w-3 mr-1" />
              Forçar
            </Button>
          )}
          <Button
            variant="outline"
            onClick={handleDismiss}
            size="sm"
          >
            Agora não
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
} 