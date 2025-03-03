# IntellijHosts

A modern, cross-platform hosts file manager built with Tauri, React, and Rust.

## Features

- 🚀 Modern UI with dark/light theme support
- 🔄 Easy hosts file management
- 📋 Multiple profiles support
- 🌐 Import/Export functionality
- 🔒 Secure system integration
- 🌍 Internationalization support (en, zh, de, fr)

## Getting Started

### Prerequisites

- Node.js (v16 or later)
- Rust (latest stable)
- Git

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/IntellijHosts.git
cd IntellijHosts
```

2. Install dependencies:
```bash
npm install
```

3. Run the development server:
```bash
npm run tauri dev
```

### Building

To create a production build:

```bash
npm run tauri build
```

## Usage

1. **Current Hosts**: View and edit your current hosts file entries
2. **Profiles**: Create and manage different hosts file configurations
3. **Settings**: Customize application settings (theme, language)

## Development

The project uses:
- Tauri for the desktop application framework
- React for the frontend
- Rust for the backend
- Tailwind CSS for styling
- i18next for internationalization

### Project Structure

```
IntellijHosts/
├── src/                    # Frontend source files
│   ├── components/         # React components
│   ├── locales/           # Translation files
│   └── store.ts           # State management
├── src-tauri/             # Rust backend
│   ├── src/               # Rust source files
│   └── Cargo.toml         # Rust dependencies
└── package.json           # NPM dependencies
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- [Tauri](https://tauri.app/)
- [React](https://reactjs.org/)
- [Rust](https://www.rust-lang.org/)
- All contributors who have helped this project grow