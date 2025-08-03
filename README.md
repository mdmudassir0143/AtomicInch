# Atomic Swap Coordinator

A sophisticated cross-chain atomic swap protocol coordinator that enables secure, trustless swaps between Ethereum and Algorand networks using hashlock and timelock mechanisms.

## 🌟 Features

### Core Functionality
- **Cross-Chain Swaps**: Secure atomic swaps between Ethereum and Algorand
- **Hashlock/Timelock Security**: SHA-256 hash verification with time-based expiration
- **Real-Time Gas Optimization**: Live gas price tracking and cost estimation
- **1inch Integration**: Access to Fusion+ market orders and secrets
- **Session Management**: Track and manage swap states across chains

### User Interface
- **Dark Cyber Theme**: Professional, terminal-inspired design
- **Real-Time Updates**: Live gas prices and network status
- **Responsive Design**: Works seamlessly across devices
- **Interactive Forms**: Intuitive swap creation and redemption

### API Integration
- **1inch Fusion+ Orders**: Live cross-chain swap opportunities
- **Gas Price API**: Real-time Ethereum gas pricing (EIP-1559)
- **Order Secrets**: Reveal and analyze order secrets for atomic swaps
- **Swap Coordination**: Backend coordination between chains

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn
- 1inch API key (provided in code)

### Installation

\`\`\`bash
# Clone the repository
git clone <repository-url>
cd atomic-swap-coordinator

# Install dependencies
npm install

# Start development server
npm run dev
\`\`\`

Visit \`http://localhost:3000\` to access the application.

## 🏗️ Architecture

### Frontend (Next.js 14)
- **App Router**: Modern Next.js routing with server components
- **TypeScript**: Full type safety across the application
- **Tailwind CSS**: Utility-first styling with custom cyber theme
- **Custom Fonts**: Inter and Space Grotesk for modern typography

### Backend API Routes
- **\`/api/generate-secret\`** - Generate SHA-256 secrets and hashes
- **\`/api/initiate-swap\`** - Create atomic swap sessions
- **\`/api/redeem-swap\`** - Verify secrets and complete swaps
- **\`/api/gas-prices\`** - Fetch real-time gas prices
- **\`/api/1inch-orders\`** - Get Fusion+ market orders
- **\`/api/order-secrets\`** - Reveal order secrets by hash

### Blockchain Integration
- **Ethereum**: HTLC (Hash Time Locked Contracts) simulation
- **Algorand**: LogicSig transaction preparation
- **Gas Optimization**: EIP-1559 compliant gas estimation

## 📱 Usage Guide

### 1. Create Atomic Swap

1. **Select Direction**: Choose ETH→ALGO or ALGO→ETH
2. **Enter Amount**: Specify the token amount to swap
3. **Generate Secret**: Create or provide SHA-256 hash
4. **Set Recipient**: Enter target chain address
5. **Initialize**: Create the atomic swap session

### 2. Monitor Network Status

- **Gas Prices**: Real-time Ethereum gas costs (low/medium/high/instant)
- **Algorand Fees**: Fixed 0.001 ALGO transaction cost
- **Cost Estimation**: Total swap cost breakdown

### 3. Market Orders

- **Browse Orders**: View live 1inch Fusion+ opportunities
- **Order Analysis**: Check hashlock/timelock compatibility
- **Quick Integration**: Use market orders for swaps

### 4. Reveal Secrets

- **Order Hash Input**: Enter 1inch order hash
- **Secret Revelation**: View public secrets and resolver data
- **Compatibility Check**: Analyze atomic swap readiness

### 5. Redeem Swaps

- **Secret Entry**: Provide the original secret
- **Verification**: Automatic hash verification
- **Completion**: Finalize the atomic swap

## 🔧 Configuration

### Environment Variables (Optional)

Create \`.env.local\` for custom configuration:

\`\`\`bash
# Optional - defaults to relative URLs
NEXT_PUBLIC_BASE_URL=http://localhost:3000
\`\`\`

### API Keys

The application includes pre-configured 1inch API keys. For production use, replace with your own:

\`\`\`typescript
// In API route files
headers: {
  Authorization: "Bearer YOUR_1INCH_API_KEY",
}
\`\`\`

## 🛠️ Development

### Project Structure

\`\`\`
atomic-swap-coordinator/
├── app/
│   ├── api/                 # Backend API routes
│   │   ├── generate-secret/ # Secret generation
│   │   ├── initiate-swap/   # Swap creation
│   │   ├── redeem-swap/     # Swap redemption
│   │   ├── gas-prices/      # Gas price fetching
│   │   ├── 1inch-orders/    # Market orders
│   │   └── order-secrets/   # Secret revelation
│   ├── globals.css          # Global styles and theme
│   ├── layout.tsx           # Root layout with fonts
│   └── page.tsx             # Main application
├── components/ui/           # Reusable UI components
└── README.md
\`\`\`

### Key Technologies

- **Next.js 14**: React framework with App Router
- **TypeScript**: Type-safe development
- **Tailwind CSS**: Utility-first styling
- **Radix UI**: Accessible component primitives
- **1inch API**: DeFi protocol integration
- **Crypto**: Node.js cryptographic functions

### Custom Styling

The application uses a custom dark cyber theme:

\`\`\`css
/* Key design elements */
.cyber-grid        /* Subtle grid background */
.glass-panel       /* Glassmorphism containers */
.glow-border       /* Animated glowing borders */
.neon-separator    /* Gradient separators */
.animate-pulse-glow /* Pulsing glow effects */
\`\`\`

## 🔐 Security Features

### Atomic Swap Security
- **Hashlock Protection**: SHA-256 secret verification
- **Timelock Expiration**: 24-hour automatic expiration
- **Cross-Chain Coordination**: Ensures atomic execution or rollback

### API Security
- **Input Validation**: All user inputs are validated
- **Error Handling**: Secure error messages without sensitive data
- **Rate Limiting**: Built-in Next.js API protection

### Frontend Security
- **Type Safety**: Full TypeScript coverage
- **XSS Protection**: Sanitized user inputs
- **HTTPS Only**: Secure communication in production

## 📊 Gas Optimization

### Ethereum (EIP-1559)
- **Dynamic Pricing**: Real-time base fee and priority fee
- **Multiple Priorities**: Low, medium, high, and instant options
- **Cost Estimation**: USD cost calculations with current ETH prices

### Algorand
- **Fixed Fees**: Predictable 0.001 ALGO per transaction
- **Fast Finality**: ~4.5 second block times
- **Low Cost**: Minimal transaction fees

## 🔗 API Integration

### 1inch Fusion+ Integration

\`\`\`typescript
// Fetch market orders
GET /api/1inch-orders

// Reveal order secrets
POST /api/order-secrets
{
  "orderHash": "0xa0ea5bd12b2d04566e175de24c2df41a058bf16df4af3eb2fb9bff38a9da98e9"
}
\`\`\`

### Gas Price Integration

\`\`\`typescript
// Get current gas prices
GET /api/gas-prices

// Response includes EIP-1559 pricing
{
  "ethereum": {
    "low": { "maxFeePerGas": "25", "maxPriorityFeePerGas": "1" },
    "medium": { "maxFeePerGas": "30", "maxPriorityFeePerGas": "2" }
  }
}
\`\`\`

## 🚀 Deployment

### Vercel (Recommended)

1. **Connect Repository**: Link your GitHub repository to Vercel
2. **Configure Environment**: Set production environment variables
3. **Deploy**: Automatic deployment on push to main branch

\`\`\`bash
# Production environment variables
NEXT_PUBLIC_BASE_URL=https://your-app.vercel.app
\`\`\`

### Manual Deployment

\`\`\`bash
# Build for production
npm run build

# Start production server
npm start
\`\`\`

## 🧪 Testing

### Manual Testing Workflow

1. **Secret Generation**: Test hash generation and verification
2. **Swap Creation**: Create swaps with various parameters
3. **Gas Price Fetching**: Verify real-time gas price updates
4. **Market Orders**: Test 1inch order fetching and analysis
5. **Secret Revelation**: Test order hash secret revelation
6. **Swap Redemption**: Complete full swap cycles

### API Testing

\`\`\`bash
# Test secret generation
curl -X POST http://localhost:3000/api/generate-secret

# Test gas prices
curl http://localhost:3000/api/gas-prices

# Test 1inch orders
curl http://localhost:3000/api/1inch-orders
\`\`\`

## 🤝 Contributing

### Development Setup

1. Fork the repository
2. Create a feature branch: \`git checkout -b feature/amazing-feature\`
3. Make your changes
4. Test thoroughly
5. Commit: \`git commit -m 'Add amazing feature'\`
6. Push: \`git push origin feature/amazing-feature\`
7. Open a Pull Request

### Code Style

- **TypeScript**: Strict type checking enabled
- **ESLint**: Follow the configured linting rules
- **Prettier**: Consistent code formatting
- **Conventional Commits**: Use conventional commit messages

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

### Common Issues

**Q: Gas prices not loading?**
A: Check your internet connection and 1inch API key validity.

**Q: Swaps not initializing?**
A: Ensure all form fields are filled and addresses are valid.

**Q: Fonts not loading?**
A: The app uses Next.js font optimization - fonts should load automatically.

### Getting Help

- **Issues**: Open a GitHub issue for bugs or feature requests
- **Discussions**: Use GitHub Discussions for questions
- **Documentation**: Check the inline code comments for detailed explanations

## 🔮 Roadmap

### Upcoming Features
- [ ] Real blockchain integration (testnet)
- [ ] Multi-signature support
- [ ] Advanced order filtering
- [ ] Mobile app version
- [ ] Additional chain support (Polygon, BSC)
- [ ] MEV protection mechanisms
- [ ] Automated market making

### Performance Improvements
- [ ] WebSocket real-time updates
- [ ] Caching layer for gas prices
- [ ] Optimistic UI updates
- [ ] Progressive Web App (PWA)

---

**Built with ❤️ for the DeFi community**

*Enabling trustless cross-chain value transfer through atomic swap coordination*
