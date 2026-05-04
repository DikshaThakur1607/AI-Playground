import { useEffect } from 'react';

export default function TenorBird({ className }) {
  useEffect(() => {
    // Inject the Tenor embed script when the component mounts
    const script = document.createElement('script');
    script.src = "https://tenor.com/embed.js";
    script.async = true;
    document.body.appendChild(script);

    return () => {
      // Clean up script on unmount
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
    };
  }, []);

  return (
    <div className={className} style={{ width: '100px', pointerEvents: 'none', mixBlendMode: 'multiply' }}>
      <div 
        className="tenor-gif-embed" 
        data-postid="15266978" 
        data-share-method="host" 
        data-aspect-ratio="1.48148" 
        data-width="100%"
      >
        <a href="https://tenor.com/view/flying-fly-wings-purple-bird-bird-gif-15266978">Flying Wings Sticker</a>
      </div>
    </div>
  );
}
