/** @type {import('tailwindcss').Config} */
module.exports = {
    darkMode: ['class'],
    content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './src/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
  	extend: {
  		colors: {
  			// Canonized Apple Colors - Light Mode
  			apple: {
  				bg: '#FFFFFF',
  				secondary: '#F5F5F7',
  				border: '#D2D2D7',
  				blue: '#007AFF',
  			},
  			// Canonized Apple Colors - Dark Mode
  			appleDark: {
  				bg: '#000000',
  				secondary: '#1C1C1E',
  				border: '#38383A',
  				blue: '#0A84FF',
  			},
  			primary: {
  				'50': '#eff6ff',
  				'100': '#dbeafe',
  				'200': '#bfdbfe',
  				'300': '#93c5fd',
  				'400': '#60a5fa',
  				'500': '#3b82f6',
  				'600': '#2563eb',
  				'700': '#1d4ed8',
  				'800': '#1e40af',
  				'900': '#1e3a8a',
  				DEFAULT: '#007AFF', // iOS system blue (light mode)
  				foreground: 'hsl(var(--primary-foreground))'
  			},
  			secondary: {
  				'50': '#f8fafc',
  				'100': '#f1f5f9',
  				'200': '#e2e8f0',
  				'300': '#cbd5e1',
  				'400': '#94a3b8',
  				'500': '#64748b',
  				'600': '#475569',
  				'700': '#334155',
  				'800': '#1e293b',
  				'900': '#0f172a',
  				DEFAULT: '#F5F5F7', // Apple's exact gray (light mode)
  				foreground: 'hsl(var(--secondary-foreground))'
  			},
  			background: 'hsl(var(--background))',
  			foreground: 'hsl(var(--foreground))',
  			card: {
  				DEFAULT: 'hsl(var(--card))',
  				foreground: 'hsl(var(--card-foreground))'
  			},
  			popover: {
  				DEFAULT: 'hsl(var(--popover))',
  				foreground: 'hsl(var(--popover-foreground))'
  			},
  			muted: {
  				DEFAULT: 'hsl(var(--muted))',
  				foreground: 'hsl(var(--muted-foreground))'
  			},
  			accent: {
  				DEFAULT: 'hsl(var(--accent))',
  				foreground: 'hsl(var(--accent-foreground))'
  			},
  			destructive: {
  				DEFAULT: 'hsl(var(--destructive))',
  				foreground: 'hsl(var(--destructive-foreground))'
  			},
  			border: 'hsl(var(--border))',
  			input: 'hsl(var(--input))',
  			ring: 'hsl(var(--ring))',
  			chart: {
  				'1': 'hsl(var(--chart-1))',
  				'2': 'hsl(var(--chart-2))',
  				'3': 'hsl(var(--chart-3))',
  				'4': 'hsl(var(--chart-4))',
  				'5': 'hsl(var(--chart-5))'
  			}
  		},
  		fontFamily: {
  			sans: [
  				'Inter',
  				'system-ui',
  				'sans-serif'
  			]
  		},
  		animation: {
  			'fade-in': 'fadeIn 0.5s ease-in-out',
  			'slide-up': 'slideUp 0.3s ease-out',
  			'bounce-slow': 'bounce 2s infinite'
  		},
  		keyframes: {
  			fadeIn: {
  				'0%': {
  					opacity: '0'
  				},
  				'100%': {
  					opacity: '1'
  				}
  			},
  			slideUp: {
  				'0%': {
  					transform: 'translateY(10px)',
  					opacity: '0'
  				},
  				'100%': {
  					transform: 'translateY(0)',
  					opacity: '1'
  				}
  			}
  		},
  		borderRadius: {
  			// Canonized Apple Border Radius
  			sm: '8px',      // buttons, chips
  			md: '12px',     // cards, inputs
  			lg: '16px',     // panels
  			xl: '20px',     // hero sections
  			// Legacy
  			'2xl': '1.5rem',
  			full: '9999px',
  			// Shadcn compatibility
  			'lg-var': 'var(--radius)',
  			'md-var': 'calc(var(--radius) - 2px)',
  			'sm-var': 'calc(var(--radius) - 4px)'
  		},
  		boxShadow: {
  			// Canonized Apple Shadows (Light Mode)
  			sm: '0 1px 3px rgba(0, 0, 0, 0.04)',
  			md: '0 4px 6px rgba(0, 0, 0, 0.04)',
  			lg: '0 10px 15px rgba(0, 0, 0, 0.05)',
  			// Legacy
  			soft: '0 2px 15px -3px rgba(0, 0, 0, 0.07), 0 10px 20px -2px rgba(0, 0, 0, 0.04)',
  			medium: '0 4px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
  			strong: '0 10px 40px -10px rgba(0, 0, 0, 0.15), 0 2px 10px -2px rgba(0, 0, 0, 0.05)'
  		},
  		fontSize: {
  			// Canonized Typography
  			hero: ['72px', { lineHeight: '1.2', letterSpacing: '-0.04em', fontWeight: '700' }],
  			subhead: ['21px', { lineHeight: '1.4', fontWeight: '400' }],
  			body: ['17px', { lineHeight: '1.5', fontWeight: '400' }],
  			caption: ['13px', { lineHeight: '1.4', fontWeight: '500' }],
  			micro: ['12px', { lineHeight: '1.3', fontWeight: '600' }],
  			// Legacy
  			xs: ['0.75rem', { lineHeight: '1' }],
  			sm: ['0.875rem', { lineHeight: '1.25' }],
  			base: ['1rem', { lineHeight: '1.5' }],
  			lg: ['1.125rem', { lineHeight: '1.75' }],
  			xl: ['1.25rem', { lineHeight: '1.75' }],
  			'2xl': ['1.5rem', { lineHeight: '2' }],
  			'3xl': ['1.875rem', { lineHeight: '2.25' }],
  			'4xl': ['2.25rem', { lineHeight: '2.5' }],
  			'5xl': ['3rem', { lineHeight: '1' }],
  			'6xl': ['3.75rem', { lineHeight: '1' }],
  			'7xl': ['4.5rem', { lineHeight: '1' }]
  		},
  		fontFamily: {
  			display: ['SF Pro Display', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
  			text: ['SF Pro Text', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
  			sans: ['SF Pro Text', '-apple-system', 'BlinkMacSystemFont', 'Inter', 'sans-serif'],
  			mono: ['SF Mono', 'Monaco', 'Inconsolata', 'Fira Code', 'monospace']
  		},
  		spacing: {
  			// Canonized Apple 4pt Grid
  			1: '4px',
  			2: '8px',
  			3: '12px',
  			4: '16px',
  			5: '20px',
  			6: '24px',
  			8: '32px',
  			12: '48px',
  			16: '64px',
  			20: '80px'
  		}
  	}
  },
  plugins: [require("tailwindcss-animate")],
};