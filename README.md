# StockZenith Portfolio Dashboard

A modern, full-stack portfolio management dashboard for tracking, analyzing, and sharing investment portfolios. Built with Next.js, React, Prisma, and Tailwind CSS.

## 🚀 Features
- **User Authentication**: Secure sign-in and registration with hashed passwords (NextAuth.js + Prisma).
- **Portfolio Management**: Create, edit, and delete portfolios with multiple stock lots and cash positions.
- **Real-Time Analytics**: View portfolio analytics, performance, and AI-powered insights.
- **AI Insights**: Get portfolio summaries, risk analysis, diversification tips, and recommendations using Gemini AI.
- **Sharing**: Generate shareable portfolio links with access control and revoke options.
- **Responsive UI**: Beautiful, mobile-friendly design with Tailwind CSS and custom components.
- **Stock Price Fetching**: Real-time price updates for tracked tickers.
- **Animated, User-Friendly Experience**: Smooth transitions and feedback for all actions.

## 🛠️ Technologies Used
- **Frontend**: Next.js, React, TypeScript, Tailwind CSS
- **Backend**: Next.js API routes, Prisma ORM, bcryptjs
- **Database**: Prisma (MongoDB, configurable)
- **Authentication**: NextAuth.js (credentials provider)
- **AI Integration**: Gemini API (Google Generative Language)
- **Stock Price API**: Finnhub (or similar, requires `STOCK_API_KEY`)

## 🗂️ Project Structure (Detailed)

```
StockZenith/
├── prisma/                  # Prisma schema and database migrations
│   └── schema.prisma        # Database schema definition
│
├── public/                  # Static assets served at the root URL
│   ├── favicon.ico          # Favicon for the app
│   ├── *.svg                # SVG icons and images
│   └── ...
│
├── src/
│   ├── components/          # Reusable React components (UI, dashboard, analytics, etc.)
│   │   ├── AnalyticsSection.tsx
│   │   ├── PortfolioForm.tsx
│   │   ├── PortfolioGrid.tsx
│   │   └── ...
│   │
│   ├── generated/           # (Optional) Auto-generated code (e.g., Prisma client)
│   │
│   ├── lib/                 # Utility libraries and helpers
│   │   ├── prisma.ts        # Prisma client instance
│   │   ├── stockPrice.ts    # Stock price fetching logic (uses STOCK_API_KEY)
│   │   └── tickers.ts       # List of supported stock tickers
│   │
│   ├── pages/               # Next.js pages (routes)
│   │   ├── api/             # API routes (backend logic)
│   │   │   ├── auth/        # Authentication endpoints (NextAuth, register, etc.)
│   │   │   ├── analytics.ts # Portfolio analytics API
│   │   │   ├── portfolio.ts # Portfolio CRUD API
│   │   │   ├── share.ts     # Share link generation API
│   │   │   ├── stock-prices.ts # Stock price API endpoint
│   │   │   └── ...
│   │   ├── auth/            # Authentication pages (sign in, etc.)
│   │   ├── dashboard/       # Dashboard and portfolio detail pages
│   │   ├── portfolio/       # Shared portfolio view pages
│   │   ├── dashboard.tsx    # Main dashboard page
│   │   ├── index.tsx        # Landing page
│   │   └── _app.tsx, _document.tsx # App-level config
│   │
│   └── styles/              # Global and component-specific styles
│       ├── globals.css
│       └── Home.module.css
│
├── .env.example             # Example environment variables
├── package.json             # Project dependencies and scripts
├── tailwind.config.js       # Tailwind CSS configuration
├── tsconfig.json            # TypeScript configuration
└── README.md                # Project documentation
```

### Directory/Files Explained
- **prisma/schema.prisma**: Defines your database models, relations, and configuration for Prisma ORM.
- **public/**: All static files (images, icons, etc.) that are directly accessible via URL.
- **src/components/**: All reusable UI components, such as forms, cards, analytics sections, and modals.
- **src/generated/**: (If present) Auto-generated code, e.g., Prisma client. Usually not edited manually.
- **src/lib/**: Utility code, such as the Prisma client setup, stock price fetching logic, and ticker lists.
- **src/pages/api/**: All backend API endpoints, including authentication, portfolio CRUD, analytics, sharing, and stock price fetching.
- **src/pages/auth/**: Frontend pages for user authentication (sign in, register, etc.).
- **src/pages/dashboard/**: Dashboard and portfolio detail pages for authenticated users.
- **src/pages/portfolio/**: Pages for viewing shared portfolios via tokenized links.
- **src/pages/index.tsx**: The landing page for unauthenticated users.
- **src/pages/_app.tsx, _document.tsx**: Custom app and document configuration for Next.js.
- **src/styles/**: Global and modular CSS files for styling the app.
- **.env.example**: Template for required environment variables (copy to `.env.local` and fill in your values).
- **package.json**: Lists dependencies, scripts, and project metadata.
- **tailwind.config.js**: Tailwind CSS configuration file.
- **tsconfig.json**: TypeScript configuration file.
- **README.md**: This documentation file.

## 📦 Setup Instructions

1. **Clone the repository**
   ```sh
   git clone <repo-url>
   cd StockZenith
   ```

2. **Install dependencies**
   ```sh
   npm install
   ```

3. **Configure environment variables**
   - Copy `.env.example` to `.env.local` and fill in required values:
     - `DATABASE_URL` (for Prisma)
     - `NEXTAUTH_SECRET` (for NextAuth.js)
     - `GEMINI_API_KEY` (for AI features)
     - `STOCK_API_KEY` (for stock price fetching, e.g., Finnhub)

4. **Set up the database**
   ```sh
   npx prisma migrate dev --name init
   npx prisma generate
   ```

5. **Run the development server**
   ```sh
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📝 Challenges Faced
- **Authentication Flow**: Balancing user experience (register vs. sign-in) with security and clear error handling.
- **AI Integration**: Handling API limits, parsing and displaying AI responses in a user-friendly way.
- **Real-Time Data**: Efficiently fetching and updating stock prices for multiple portfolios.
- **Sharing & Access Control**: Securely generating, revoking, and tracking shared portfolio links.
- **UI/UX**: Ensuring a smooth, animated, and accessible experience across devices.

## 🌱 Possible Future Improvements
- **OAuth Providers**: Add Google, GitHub, or other social logins.
- **Email Verification**: Require email confirmation for new accounts.
- **Password Reset**: Add forgot/reset password functionality.
- **Advanced Analytics**: More detailed AI insights, historical performance charts, and risk metrics.
- **Notifications**: Email or in-app alerts for portfolio changes or market events.
- **Multi-currency Support**: Track investments in different currencies.
- **Better Mobile Experience**: Further optimize for mobile and tablet users.
- **Unit Tests & CI**: Add automated testing and continuous integration.

## 🤝 Contributing
Pull requests and suggestions are welcome! Please open an issue or submit a PR.

## 📄 License
MIT
