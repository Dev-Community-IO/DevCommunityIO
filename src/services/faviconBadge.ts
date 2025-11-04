/**
 * Service to update favicon and PWA icon with notification badge
 */

class FaviconBadgeService {
  private originalFavicon: string | null = null;
  private canvas: HTMLCanvasElement | null = null;
  private faviconElement: HTMLLinkElement | null = null;
  private appIconLinks: HTMLLinkElement[] = [];

  /**
   * Initialize the service by storing original favicon
   */
  init(): void {
    // Find favicon link
    this.faviconElement = document.querySelector('link[rel="icon"]') || 
                         document.querySelector('link[rel="shortcut icon"]');
    
    if (this.faviconElement) {
      this.originalFavicon = this.faviconElement.href;
    }

    // Find PWA icon links (apple-touch-icon and all icon links with sizes)
    const iconLinks = document.querySelectorAll('link[rel="apple-touch-icon"], link[rel="icon"][sizes], link[rel^="icon"]');
    iconLinks.forEach(link => {
      const linkElement = link as HTMLLinkElement;
      // Store original href if not already stored
      if (!linkElement.dataset.originalHref) {
        linkElement.dataset.originalHref = linkElement.href;
      }
      this.appIconLinks.push(linkElement);
    });

    // Create canvas for badge generation
    this.canvas = document.createElement('canvas');
    this.canvas.width = 64;
    this.canvas.height = 64;
  }

  /**
   * Update favicon and PWA icons with badge
   */
  async updateBadge(count: number): Promise<void> {
    if (!this.canvas) {
      this.init();
    }

    if (!this.canvas || count === 0) {
      this.removeBadge();
      return;
    }

    try {
      // Check if favicon URL is from S3 - if so, skip loading and use default
      const faviconUrl = this.originalFavicon || '/favicon.ico';
      const isS3Url = faviconUrl.includes('s3.amazonaws.com') || faviconUrl.includes('amazonaws.com');
      
      let img: HTMLImageElement;
      
      // For S3 URLs, always use default favicon to avoid CORS/tainted canvas issues
      if (isS3Url) {
        img = this.createDefaultFavicon();
      } else {
        try {
          img = await this.loadImage(faviconUrl);
        } catch (error) {
          // If loading fails (CORS, 503, etc.), create a default favicon
          console.warn('Failed to load favicon, using default:', error);
          img = this.createDefaultFavicon();
        }
      }
      
      // Draw original favicon or default
      const ctx = this.canvas.getContext('2d');
      if (!ctx) return;

      ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
      
      // Draw favicon centered
      const size = Math.min(this.canvas.width, this.canvas.height);
      ctx.drawImage(img, (this.canvas.width - size) / 2, (this.canvas.height - size) / 2, size, size);

      // Draw red badge circle
      const badgeSize = Math.min(size * 0.4, 24);
      const badgeX = this.canvas.width - badgeSize - 2;
      const badgeY = 2;
      
      ctx.fillStyle = '#ef4444'; // red-500
      ctx.beginPath();
      ctx.arc(badgeX + badgeSize / 2, badgeY + badgeSize / 2, badgeSize / 2, 0, Math.PI * 2);
      ctx.fill();

      // Draw white border
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Draw notification count or dot
      if (count > 0) {
        ctx.fillStyle = '#ffffff';
        ctx.font = `bold ${Math.max(10, badgeSize * 0.5)}px Arial`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        
        const displayCount = count > 99 ? '99+' : count.toString();
        ctx.fillText(
          displayCount,
          badgeX + badgeSize / 2,
          badgeY + badgeSize / 2
        );
      }

      // Convert canvas to blob and update favicon
      const blob = await new Promise<Blob | null>((resolve, reject) => {
        try {
          this.canvas?.toBlob(resolve, 'image/png');
        } catch (error) {
          reject(error);
        }
      });

      if (blob) {
        // Revoke old blob URL before creating new one
        if (this.faviconElement?.dataset.badgeUrl) {
          URL.revokeObjectURL(this.faviconElement.dataset.badgeUrl);
        }
        this.appIconLinks.forEach(link => {
          if (link.dataset.badgeUrl) {
            URL.revokeObjectURL(link.dataset.badgeUrl);
          }
        });

        const url = URL.createObjectURL(blob);
        this.updateFavicon(url);
        this.updatePWAIcons(url);
      }
    } catch (error) {
      console.error('Failed to update favicon badge:', error);
      // On error, just remove badge
      this.removeBadge();
    }
  }

  /**
   * Remove badge and restore original favicon
   */
  removeBadge(): void {
    // Revoke blob URLs before restoring
    if (this.faviconElement?.dataset.badgeUrl) {
      URL.revokeObjectURL(this.faviconElement.dataset.badgeUrl);
      delete this.faviconElement.dataset.badgeUrl;
    }

    // Restore original favicon
    if (this.originalFavicon && this.faviconElement) {
      this.faviconElement.href = this.originalFavicon;
    }

    // Restore PWA icons and revoke blob URLs
    this.appIconLinks.forEach(link => {
      if (link.dataset.badgeUrl) {
        URL.revokeObjectURL(link.dataset.badgeUrl);
        delete link.dataset.badgeUrl;
      }
      if (link.dataset.originalHref) {
        link.href = link.dataset.originalHref;
      }
    });
  }

  /**
   * Load image from URL
   */
  private loadImage(url: string): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
      // Check if URL is from S3 - if so, skip crossOrigin to avoid CORS issues
      const isS3Url = url.includes('s3.amazonaws.com') || url.includes('amazonaws.com');
      
      const img = new Image();
      // Only set crossOrigin for non-S3 URLs or if we're sure CORS is configured
      if (!isS3Url) {
        img.crossOrigin = 'anonymous';
      }
      
      const timeout = setTimeout(() => {
        img.onload = null;
        img.onerror = null;
        reject(new Error('Image load timeout'));
      }, 5000); // 5 second timeout
      
      img.onload = () => {
        clearTimeout(timeout);
        resolve(img);
      };
      
      img.onerror = () => {
        clearTimeout(timeout);
        reject(new Error(`Failed to load image from ${url}`));
      };
      
      img.src = url;
    });
  }

  /**
   * Create a default favicon when S3 favicon fails to load
   */
  private createDefaultFavicon(): HTMLImageElement {
    const canvas = document.createElement('canvas');
    canvas.width = 64;
    canvas.height = 64;
    const ctx = canvas.getContext('2d');
    
    if (ctx) {
      // Create a gradient background
      const gradient = ctx.createLinearGradient(0, 0, 64, 64);
      gradient.addColorStop(0, '#667eea');
      gradient.addColorStop(1, '#764ba2');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, 64, 64);
      
      // Draw a simple "D" letter in white
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 40px Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('D', 32, 32);
    }
    
    const img = new Image();
    img.src = canvas.toDataURL();
    return img;
  }

  /**
   * Update favicon link
   */
  private updateFavicon(url: string): void {
    if (!this.faviconElement) {
      // Create favicon link if it doesn't exist
      this.faviconElement = document.createElement('link');
      this.faviconElement.rel = 'icon';
      this.faviconElement.type = 'image/png';
      document.head.appendChild(this.faviconElement);
    }

    // Remove old blob URL if exists
    if (this.faviconElement.dataset.badgeUrl) {
      URL.revokeObjectURL(this.faviconElement.dataset.badgeUrl);
    }

    this.faviconElement.href = url;
    this.faviconElement.dataset.badgeUrl = url;
  }

  /**
   * Update PWA icon links
   */
  private updatePWAIcons(url: string): void {
    this.appIconLinks.forEach(link => {
      // Store original href if not already stored
      if (!link.dataset.originalHref) {
        link.dataset.originalHref = link.href;
      }

      // Remove old blob URL if exists
      if (link.dataset.badgeUrl) {
        URL.revokeObjectURL(link.dataset.badgeUrl);
      }

      link.href = url;
      link.dataset.badgeUrl = url;
    });
  }
}

export const faviconBadgeService = new FaviconBadgeService();

