/** @type {import('tailwindcss').Config} */
export default {
    darkMode: ["class"],
    content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
  	extend: {
  		colors: {
  			'deep-blue': '#002b36',
  			'dark-gray-c-one': '#121212',
  			'dark-gray-c-two': '#1e1e1e',
  			'dark-gray-c-three': '#222222',
  			'dark-gray-c-four': '#242424',
  			'dark-gray-c-five': '#272727',
  			'dark-gray-c-six': '#2c2c2c',
  			'dark-gray-c-seven': '#2e2e2e',
  			'dark-gray-c-eight': '#333333',
  			'dark-gray-c-nine': '#343434',
  			'dark-gray-c-ten': '#383838',
  			'dark-gray-c-eleven': '#191919',
  			'dark-slate-gray': '#2F4F4F',
  			'light-arsenic': '#182c44',
  			'distinct-dark-purple': '#3a395e',
  			'moodly-blue': '#7f7dcb',
  			'bg-000': 'hsl(var(--bg-000) / 1.0)',
  			'text-gen-100': 'hsl(var(--gen-100) / 1.0)',
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
  			primary: {
  				DEFAULT: 'hsl(var(--primary))',
  				foreground: 'hsl(var(--primary-foreground))'
  			},
  			secondary: {
  				DEFAULT: 'hsl(var(--secondary))',
  				foreground: 'hsl(var(--secondary-foreground))'
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
  		height: {
  			titlebar: '30px',
  			'below-titlebar': 'calc(100vh - 30px)'
  		},
  		minHeight: {
  			'below-titlebar-min': 'calc(100vh - 30px)'
  		},
  		transitionProperty: {
  			height: 'height',
  			spacing: 'margin, padding',
  			transform: 'transform'
  		},
  		transitionDuration: {
  			'400': '400ms'
  		},
  		transitionDelay: {
  			'400': '400ms'
  		},
  		fontSize: {
  			'2lg': '1.0rem'
  		},
  		keyframes: {
  			slideIn: {
  				'0%': {
  					transform: 'translateX(100%)',
  					opacity: '0'
  				},
  				'100%': {
  					transform: 'translateX(0)',
  					opacity: '1'
  				}
  			},
  			bounce: {
  				'0%, 20%, 50%, 80%, 100%': {
  					opacity: '1'
  				},
  				'40%, 60%': {
  					opacity: '0'
  				}
  			}
  		},
  		animation: {
  			'slide-in': 'slideIn 0.3s ease-out',
  			bounce: 'bounce 1.4s infinite both'
  		},
  		borderRadius: {
  			lg: 'var(--radius)',
  			md: 'calc(var(--radius) - 2px)',
  			sm: 'calc(var(--radius) - 4px)'
  		}
  	}
  },
  corePlugins: {
    preflight: false,
  },
  plugins: [
    require('tailwind-scrollbar')({
      nocompatible: true,
      scrollbar: {
        rounded: 'rounded-full'
      }
    }),
    require("tailwindcss-animate")
  ],
};
