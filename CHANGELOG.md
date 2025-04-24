# Changelog

All notable changes to the Universal Portability SDK will be documented in this file.

## [1.3.4] - 2025-04-24

### Fixed
- Fixed critical packaging issue where dist files were missing from npm package
- Fixed React Native imports resolution with Metro bundler
- Fixed `atob` and `btoa` compatibility issues in React Native
- Fixed verification scripts to work with ES modules by using .cjs extension

### Added
- Added platform detection utilities for automatic React Native compatibility
- Added pure JavaScript implementations of base64 encoding/decoding
- Added dedicated React Native entry point for simplified imports
- Added package integrity verification scripts
- Added troubleshooting documentation
- Enhanced package.json exports field for better subpath resolution

### Changed
- Updated React Native documentation with proper import paths
- Improved error handling in platform-specific utilities
- Structured build process to ensure all required files are included

## [1.3.3] - 2025-04-23

### Fixed
- Fixed WebView communication in React Native
- Fixed package dependencies for better compatibility

## [1.3.2] - 2025-04-22

### Added
- Initial React Native support
- Added native bundle entry points
- Added WebView-based Port component for React Native

## [1.3.1] - 2025-04-21

### Changed
- Performance improvements for web implementation
- Updated dependencies

## [1.3.0] - 2025-04-20

### Added
- Initial public release
- Web support with iframe-based portability
- Basic dApp container components
