"use client";

import { useEffect, useState } from 'react';

export default function SuppressHydrationWarning() {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    return null;
  }

  return (
    <script
      dangerouslySetInnerHTML={{
        __html: `
          const originalError = console.error;
          console.error = (...args) => {
            if (args[0] && typeof args[0] === 'string' && args[0].includes('cz-shortcut-listen')) {
              return;
            }
            originalError.apply(console, args);
          };
        `,
      }}
    />
  );
}