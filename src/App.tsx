import { useState } from 'react';
import { useSim } from './store';
import Landing from './components/Landing';
import Desktop from './components/Desktop';

export default function App() {
  const { entered } = useSim();
  const [gone, setGone] = useState(false);
  const showDesktop = entered || gone;
  return (
    <>
      {!showDesktop ? (
        <Landing onEnter={() => setGone(true)} />
      ) : (
        <>
          {window.innerWidth < 560 && (
            <div style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 3000, background: '#fef3c7', color: '#92400e', fontSize: 12, padding: 6, textAlign: 'center' }}>
              📱 Optimized for larger screens — still usable, but desktop/tablet is best.
            </div>
          )}
          <Desktop />
        </>
      )}
    </>
  );
}
