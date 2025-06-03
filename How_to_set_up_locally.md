# How to Set Up Dota 2 Companion Locally

This guide will help you set up the Dota 2 Companion application on your local development environment.

## 🎯 Prerequisites

Before you begin, ensure you have the following installed on your system:

- **Node.js**: Version 18 or higher (recommended: 22.x)
  - Download from: https://nodejs.org/
  - Verify installation: `node --version`
- **npm**: Comes with Node.js (or use yarn/pnpm)
  - Verify installation: `npm --version`
- **Git**: For cloning the repository
  - Download from: https://git-scm.com/
  - Verify installation: `git --version`

## 📥 Installation Steps

### 1. Clone the Repository

```bash
git clone https://github.com/nimishchaudhari/dota2companion_mvp.git
cd dota2companion_mvp
```

### 2. Install Frontend Dependencies

```bash
cd frontend
npm install
```

This will install all required dependencies including:
- React 18+
- Chakra UI v3
- Framer Motion
- React Router DOM
- React Icons
- Vite (build tool)

### 3. Start Development Server

```bash
npm run dev
```

The application will be available at: **http://localhost:5173**

## 🚀 Available Scripts

In the `frontend` directory, you can run:

### Development Commands

- **`npm run dev`** - Starts the development server with hot reload
- **`npm run build`** - Creates an optimized production build
- **`npm run preview`** - Preview the production build locally
- **`npm run lint`** - Run ESLint to check code quality
- **`npm run analyze`** - Analyze bundle size (after building)

### Example Development Workflow

```bash
# Start development server
npm run dev

# In another terminal, watch for code quality issues
npm run lint

# When ready to test production build
npm run build
npm run preview
```

## 🎮 Application Features

Once running locally, you can explore:

- **Hero Recommendations**: Browse Dota 2 heroes with filtering and search
- **Player Profiles**: Look up player statistics using OpenDota API
- **Match Details**: View detailed match information
- **User Preferences**: Set and save your gaming preferences
- **Favorites System**: Save your favorite heroes and builds

## 🛠️ Development Environment

### Tech Stack

- **Frontend Framework**: React 18 with Hooks
- **Build Tool**: Vite 6.x (fast dev server and builds)
- **UI Library**: Chakra UI v3 (modern component library)
- **Styling**: Tailwind CSS + Chakra UI tokens
- **Animation**: Framer Motion
- **Routing**: React Router DOM v6
- **Icons**: React Icons
- **API**: OpenDota API integration

### Project Structure

```
frontend/
├── public/                 # Static assets and data files
│   ├── data/              # JSON data files for offline functionality
│   └── vite.svg           # App icon
├── src/
│   ├── components/        # Reusable React components
│   │   ├── layout/        # Layout components (Header, Footer, etc.)
│   │   ├── AnimatedLoaders.jsx
│   │   ├── LoadingSkeleton.jsx
│   │   └── ...
│   ├── contexts/          # React Context providers
│   │   └── AuthContext.jsx
│   ├── pages/             # Page components
│   │   ├── HomePage.jsx
│   │   ├── PlayerProfilePage.jsx
│   │   └── ...
│   ├── services/          # API and data services
│   │   ├── api.js         # OpenDota API integration
│   │   ├── fileBackend.js # File-based backend
│   │   └── storage/       # Local storage utilities
│   ├── theme/             # Chakra UI theme configuration
│   │   └── index.js       # Custom Dota 2 theme
│   ├── utils/             # Utility functions
│   │   ├── animations.js  # Animation configurations
│   │   └── dotaAssets.js  # Dota 2 asset helpers
│   ├── App.jsx            # Main application component
│   ├── main.jsx           # Application entry point
│   └── index.css          # Global styles
├── vite.config.js         # Vite configuration
├── tailwind.config.js     # Tailwind CSS configuration
├── eslint.config.js       # ESLint configuration
└── package.json           # Dependencies and scripts
```

### Environment Configuration

The application runs in different modes:

- **Development**: `npm run dev` - uses localhost routing
- **Production**: `npm run build` - configured for GitHub Pages deployment with base path

### API Integration

The app integrates with the OpenDota API:
- **Base URL**: `https://api.opendota.com/api`
- **No API key required** for basic functionality
- **Rate limiting**: Be mindful of API rate limits during development

## 🔧 Troubleshooting

### Common Issues and Solutions

#### 1. Dependencies Issues
```bash
# Clear npm cache and reinstall
rm -rf node_modules package-lock.json
npm install
```

#### 2. Port Already in Use
```bash
# Kill process using port 5173
npx kill-port 5173
# Or use a different port
npm run dev -- --port 3000
```

#### 3. Build Errors
```bash
# Check for TypeScript/linting errors
npm run lint

# Clean build and retry
rm -rf dist
npm run build
```

#### 4. Chakra UI Theme Issues
If you see theme-related errors, ensure you're using the correct Chakra UI v3 syntax in components.

### Performance Tips

- Use React DevTools for component debugging
- Use Vite DevTools for build optimization
- Monitor bundle size with `npm run analyze`
- Check Network tab for API call optimization

## 📚 Additional Resources

- [Chakra UI v3 Documentation](https://www.chakra-ui.com/)
- [React Documentation](https://react.dev/)
- [Vite Documentation](https://vitejs.dev/)
- [OpenDota API Documentation](https://docs.opendota.com/)
- [Framer Motion Documentation](https://www.framer.com/motion/)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/new-feature`
3. Make your changes and test locally
4. Run linting: `npm run lint`
5. Create a production build: `npm run build`
6. Commit your changes: `git commit -m "Add new feature"`
7. Push to your fork: `git push origin feature/new-feature`
8. Create a Pull Request

## 📧 Support

If you encounter any issues during local setup:

1. Check this documentation first
2. Look at existing GitHub Issues
3. Create a new issue with detailed error information
4. Include your Node.js and npm versions in the issue

---

**Happy coding! 🎮✨**

Built with ❤️ for the Dota 2 community