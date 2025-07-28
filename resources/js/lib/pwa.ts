// PWA utility functions for handling offline state and updates

export function isOnline(): boolean {
  return navigator.onLine;
}

export function onOnlineStatusChange(callback: (isOnline: boolean) => void): () => void {
  const handleOnline = () => callback(true);
  const handleOffline = () => callback(false);
  
  window.addEventListener('online', handleOnline);
  window.addEventListener('offline', handleOffline);
  
  return () => {
    window.removeEventListener('online', handleOnline);
    window.removeEventListener('offline', handleOffline);
  };
}

export async function checkForUpdates(): Promise<boolean> {
  if ('serviceWorker' in navigator) {
    const registration = await navigator.serviceWorker.ready;
    await registration.update();
    
    return new Promise((resolve) => {
      const handleUpdate = () => {
        resolve(true);
        navigator.serviceWorker.removeEventListener('controllerchange', handleUpdate);
      };
      
      navigator.serviceWorker.addEventListener('controllerchange', handleUpdate);
      
      setTimeout(() => {
        navigator.serviceWorker.removeEventListener('controllerchange', handleUpdate);
        resolve(false);
      }, 5000);
    });
  }
  
  return false;
}

export function skipWaiting(): void {
  if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
    navigator.serviceWorker.controller.postMessage({ type: 'SKIP_WAITING' });
  }
}

export interface BeforeInstallPromptEvent extends Event {
  readonly platforms: Array<string>;
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

export function handleInstallPrompt(): Promise<BeforeInstallPromptEvent | null> {
  return new Promise((resolve) => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      console.log('beforeinstallprompt event fired');
      resolve(e as BeforeInstallPromptEvent);
    };
    
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt, { once: true });
    
    // If already installed or not installable, resolve with null after timeout
    setTimeout(() => {
      console.log('No beforeinstallprompt event, resolving with null');
      resolve(null);
    }, 1000);
  });
}

export async function installPWA(): Promise<boolean> {
  console.log('Attempting to install PWA...');
  
  // Check if PWA is installable
  if (!('serviceWorker' in navigator)) {
    console.log('Service Worker not supported');
    return false;
  }

  // Check if already installed
  if (isInstalled()) {
    console.log('PWA already installed');
    return true;
  }

  const deferredPrompt = await handleInstallPrompt();
  
  if (deferredPrompt) {
    console.log('Using deferred prompt for installation');
    deferredPrompt.prompt();
    const choiceResult = await deferredPrompt.userChoice;
    console.log('Installation choice:', choiceResult.outcome);
    return choiceResult.outcome === 'accepted';
  } else {
    console.log('No deferred prompt available, PWA may not meet installation criteria');
    return false;
  }
}

export function isInstalled(): boolean {
  const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
  const isIOSStandalone = (window.navigator as any).standalone;
  const isAndroidApp = document.referrer.includes('android-app://');
  
  console.log('PWA install check:', { isStandalone, isIOSStandalone, isAndroidApp });
  
  return isStandalone || isIOSStandalone || isAndroidApp;
}

// Check if PWA meets installation criteria
export function checkPWACriteria(): {
  hasServiceWorker: boolean;
  hasManifest: boolean;
  hasHttps: boolean;
  hasValidIcons: boolean;
  isInstallable: boolean;
} {
  const hasServiceWorker = 'serviceWorker' in navigator;
  const hasManifest = !!document.querySelector('link[rel="manifest"]');
  
  // Fix HTTPS detection - localhost and 127.0.0.1 are considered secure for PWA
  const isSecure = location.protocol === 'https:' || 
                   location.hostname === 'localhost' || 
                   location.hostname === '127.0.0.1' ||
                   location.hostname.includes('localhost');
  
  // For now, assume icons are valid if manifest exists (we'll validate async)
  let hasValidIcons = hasManifest; // Assume valid if manifest exists
  
  // Check for valid icons (at least 192x192) - async validation
  const manifestLink = document.querySelector('link[rel="manifest"]') as HTMLLinkElement;
  
  if (manifestLink) {
    // Check if manifest has valid icons
    fetch(manifestLink.href)
      .then(response => response.json())
      .then(manifest => {
        console.log('Manifest content:', manifest);
        const validIcons = manifest.icons && manifest.icons.some((icon: any) => {
          const hasValidSize = icon.sizes && (
            icon.sizes.includes('192x192') || 
            icon.sizes.includes('512x512') ||
            icon.sizes.includes('any')
          );
          console.log('Icon check:', icon, 'hasValidSize:', hasValidSize);
          return hasValidSize;
        });
        console.log('Final hasValidIcons:', validIcons);
        
        // Also test if the icon files are actually accessible
        if (validIcons && manifest.icons) {
          const testIcon = manifest.icons.find((icon: any) => 
            icon.sizes && (icon.sizes.includes('192x192') || icon.sizes.includes('512x512'))
          );
          
          if (testIcon) {
            fetch(testIcon.src)
              .then(response => {
                console.log('Icon accessibility test:', testIcon.src, response.ok);
              })
              .catch(error => {
                console.error('Icon accessibility error:', testIcon.src, error);
              });
          }
        }
        
        // Update the criteria if needed
        if (validIcons !== hasValidIcons) {
          console.log('Icon validation updated:', validIcons);
        }
      })
      .catch((error) => {
        console.error('Error fetching manifest:', error);
      });
  }
  
  const isInstallable = hasServiceWorker && hasManifest && isSecure && hasValidIcons;
  
  console.log('PWA criteria check:', {
    hasServiceWorker,
    hasManifest,
    hasHttps: isSecure,
    hasValidIcons,
    isInstallable,
    hostname: location.hostname,
    protocol: location.protocol
  });
  
  return {
    hasServiceWorker,
    hasManifest,
    hasHttps: isSecure,
    hasValidIcons,
    isInstallable
  };
} 