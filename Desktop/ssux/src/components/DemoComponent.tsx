import React from 'react';
import { useTheme } from './ThemeProvider';

export const DemoComponent: React.FC = () => {
  const { theme, product, setProduct, toggleTheme } = useTheme();

  return (
    <div className="min-h-screen p-8" style={{
      backgroundColor: 'var(--surface-neutral-minimal)',
      color: 'var(--text-neutral-regular)'
    }}>
      {/* Header */}
      <header className="mb-8 p-6 rounded-lg" style={{
        backgroundColor: 'var(--surface-neutral-subtle)',
        border: '1px solid var(--border-neutral-subtle)'
      }}>
        <h1 className="text-3xl font-bold mb-2" style={{
          color: 'var(--text-neutral-bold)'
        }}>
          Design Token Demo
        </h1>
        <p className="text-lg" style={{
          color: 'var(--text-neutral-regular)'
        }}>
          This component uses only CSS variables from variables.json
        </p>
      </header>

      {/* Theme Controls */}
      <div className="mb-8 p-6 rounded-lg" style={{
        backgroundColor: 'var(--surface-brand-subtle)',
        border: '1px solid var(--border-brand-subtle)'
      }}>
        <h2 className="text-xl font-semibold mb-4" style={{
          color: 'var(--text-brand-regular)'
        }}>
          Theme Controls
        </h2>
        
        <div className="flex flex-wrap gap-4 mb-4">
                  <button
          onClick={toggleTheme}
          className="px-4 py-2 rounded-md font-medium transition-colors"
          style={{
            backgroundColor: 'var(--surface-brand-regular)',
            color: 'var(--text-inverse-brand-subtle)',
            border: '1px solid var(--border-brand-bold)'
          }}
        >
            Toggle Theme: {theme}
          </button>
          
          <select
            value={product}
            onChange={(e) => setProduct(e.target.value as any)}
            className="px-4 py-2 rounded-md border"
            style={{
              backgroundColor: 'var(--surface-neutral-minimal)',
              color: 'var(--text-neutral-regular)',
              borderColor: 'var(--border-neutral-regular)'
            }}
          >
            <option value="Core">Core</option>
            <option value="Quant">Quant</option>
            <option value="Expressive">Expressive</option>
          </select>
        </div>
        
        <div className="text-sm" style={{
          color: 'var(--text-neutral-subtle)'
        }}>
          Current: {theme} theme, {product} product
        </div>
      </div>

      {/* Demo Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Card 1 */}
        <div className="p-6 rounded-lg" style={{
          backgroundColor: 'var(--surface-neutral-subtler)',
          border: '1px solid var(--border-neutral-subtle)',
          boxShadow: '0 var(--elevation-scale-1) var(--elevation-scale-2) var(--elevation-overlay-10)'
        }}>
          <h3 className="text-lg font-semibold mb-3" style={{
            color: 'var(--text-neutral-bold)'
          }}>
            Neutral Surface
          </h3>
          <p style={{
            color: 'var(--text-neutral-regular)'
          }}>
            This card uses neutral surface colors and subtle borders.
          </p>
        </div>

        {/* Card 2 */}
        <div className="p-6 rounded-lg" style={{
          backgroundColor: 'var(--surface-brand-minimal)',
          border: '1px solid var(--border-brand-subtle)',
          boxShadow: '0 var(--elevation-scale-1) var(--elevation-scale-2) var(--elevation-overlay-10)'
        }}>
          <h3 className="text-lg font-semibold mb-3" style={{
            color: 'var(--text-brand-regular)'
          }}>
            Brand Surface
          </h3>
          <p style={{
            color: 'var(--text-brand-regular)'
          }}>
            This card uses brand surface colors for emphasis.
          </p>
        </div>

        {/* Card 3 */}
        <div className="p-6 rounded-lg" style={{
          backgroundColor: 'var(--surface-neutral-inverse)',
          border: '1px solid var(--border-neutral-inverse)',
          boxShadow: '0 var(--elevation-scale-1) var(--elevation-scale-2) var(--elevation-overlay-10)'
        }}>
          <h3 className="text-lg font-semibold mb-3" style={{
            color: 'var(--text-neutral-inverse)'
          }}>
            Inverse Surface
          </h3>
          <p style={{
            color: 'var(--text-neutral-inverse)'
          }}>
            This card uses inverse colors for contrast.
          </p>
        </div>
      </div>

      {/* Status Bar */}
      <footer className="mt-8 p-4 rounded-lg text-center text-sm" style={{
        backgroundColor: 'var(--surface-neutral-strong)',
        color: 'var(--text-neutral-subtle)',
        border: '1px solid var(--border-neutral-regular)'
      }}>
        All styles are generated from variables.json • No hardcoded values
      </footer>
    </div>
  );
};
