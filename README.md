[![Deployed on Vercel](https://img.shields.io/badge/Live%20App-StockZenith-blue?style=for-the-badge&logo=vercel)](https://stock-zenith.vercel.app)

**Live App:** https://stock-zenith.vercel.app

# StockZenith Portfolio Dashboard

A modern, full-stack portfolio management dashboard for tracking, analyzing, and sharing investment portfolios. Built with Next.js, React, Prisma, and Tailwind CSS.

**Now with a public portfolio explorer, public user list, and beautiful unified branding across all pages!**

---

## 🌐 Links

- **GitHub Repository (Public):** [https://github.com/yourusername/stockzenith](https://github.com/yourusername/stockzenith)
- **Deployed URL (Vercel):** [https://stockzenith.vercel.app](https://stockzenith.vercel.app)

---

## 🚀 Features
- **User Authentication**: Secure sign-in and registration with hashed passwords (NextAuth.js + Prisma).
- **Portfolio Management**: Create, edit, and delete portfolios with multiple stock lots and cash positions.
- **Real-Time Analytics**: View portfolio analytics, performance, and AI-powered insights.
- **AI Insights**: Get portfolio summaries, risk analysis, diversification tips, and recommendations using Gemini AI.
- **Sharing**: Generate shareable portfolio links with access control and revoke options.
- **Public Portfolio Explorer**: Browse and view public portfolios from other users, even without an account.
- **Public User List**: Discover investors and view their public portfolios with a modern, paginated, searchable list.
- **Public Portfolio Detail Parity**: Public portfolio detail pages now match the dashboard experience, including holdings, summary, AI insights, and floating chatbot.
- **Unified StockZenith Branding**: Consistent, modern logo and header styling across dashboard, public, and unauthenticated pages.
- **Responsive UI**: Beautiful, mobile-friendly design with Tailwind CSS and custom components.
- **Stock Price Fetching**: Real-time price updates for tracked tickers.
- **Animated, User-Friendly Experience**: Smooth transitions and feedback for all actions.

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
│   ├── components/          # Reusable React components (UI, dashboard, analytics, public explorer, etc.)
│   │   ├── AnalyticsSection.tsx
│   │   ├── PortfolioForm.tsx
│   │   ├── PortfolioGrid.tsx
│   │   ├── PublicUsersList.tsx   # Public user explorer component
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
│   │   │   ├── public-users.ts      # Public user list API
│   │   │   ├── public-portfolios.ts # Public portfolios API
│   │   │   ├── public-portfolio/    # Public portfolio detail API
│   │   │   └── ...
│   │   ├── auth/            # Authentication pages (sign in, etc.)
│   │   ├── dashboard/       # Dashboard and portfolio detail pages
│   │   ├── portfolio/       # Shared portfolio view pages
│   │   ├── public/          # Public explorer pages
│   │   │   ├── [userId]/        # Public user portfolio list
│   │   │   │   ├── index.tsx
│   │   │   │   └── [portfolioId].tsx # Public portfolio detail (full-featured)
│   │   │   └── ...
│   │   ├── dashboard.tsx    # Main dashboard page
│   │   ├── public.tsx       # Public explorer landing page
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
- **src/components/**: All reusable UI components, such as forms, cards, analytics sections, modals, and public explorer.
- **src/generated/**: (If present) Auto-generated code, e.g., Prisma client. Usually not edited manually.
- **src/lib/**: Utility code, such as the Prisma client setup, stock price fetching logic, and ticker lists.
- **src/pages/api/**: All backend API endpoints, including authentication, portfolio CRUD, analytics, sharing, stock price fetching, and public explorer APIs.
- **src/pages/auth/**: Frontend pages for user authentication (sign in, register, etc.).
- **src/pages/dashboard/**: Dashboard and portfolio detail pages for authenticated users.
- **src/pages/portfolio/**: Pages for viewing shared portfolios via tokenized links.
- **src/pages/public/**: Public explorer pages for browsing users and portfolios without authentication.
- **src/pages/index.tsx**: The landing page for unauthenticated users.
- **src/pages/_app.tsx, _document.tsx**: Custom app and document configuration for Next.js.
- **src/styles/**: Global and modular CSS files for styling the app.
- **.env.example**: Template for required environment variables (copy to `.env.local` and fill in your values).
- **package.json**: Lists dependencies, scripts, and project metadata.
- **tailwind.config.js**: Tailwind CSS configuration file.
- **tsconfig.json**: TypeScript configuration file.
- **README.md**: This documentation file.

## 📦 How to Run Locally

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

---

## 💡 Prompt Design Explanation

The AI-powered features in StockZenith are crafted with a focus on clarity, relevance, and user empowerment. Here’s how prompt design elevates the user experience:

- **Conversational, Human-Centric Approach**: Prompts are written in natural, friendly language to make the AI feel approachable and helpful, encouraging users to ask questions about their portfolios without hesitation.
- **Contextual Awareness**: Every AI prompt is dynamically generated based on the user’s actual portfolio data—holdings, cash, risk profile, and recent activity—so responses are always personalized and actionable.
- **Guided Discovery**: The chatbot and insights panels suggest example questions and topics, helping users discover the full range of AI capabilities (e.g., “What’s my diversification risk?” or “Suggest ways to rebalance my portfolio”).
- **Prompt Engineering for Clarity**: Prompts are engineered to request concise, jargon-free, and practical advice from the Gemini API, avoiding generic or overly technical responses. The AI is asked to summarize, explain, and recommend in plain English.
- **Multi-Turn Interaction**: The chatbot supports follow-up questions and context retention, so users can dig deeper or clarify their needs without starting over.
- **Feedback Loops**: User actions and feedback (e.g., “Was this answer helpful?”) can be used to refine future prompts and improve the AI’s usefulness over time.
- **Transparency and Safety**: Prompts include reminders that AI advice is informational, not financial advice, and encourage users to verify important decisions independently.

This thoughtful prompt design ensures that StockZenith’s AI features are not just technically advanced, but genuinely helpful, intuitive, and trustworthy for all users.

---

## ⚠️ Limitations & What’s Next

### Current Limitations
- **AI Limitations**: The quality of AI insights depends on the Gemini API and may not always be perfect or up-to-date.
- **Stock Data**: Real-time stock prices are subject to API limits and may be delayed or incomplete.
- **No Social Features**: No following, commenting, or messaging between users (yet).
- **No Advanced Analytics**: Lacks deep historical analysis, charting, or risk metrics beyond basic summaries.
- **No Mobile App**: Web-only, not a native mobile app.
- **No Email/Push Notifications**: Users are not notified of portfolio changes or market events.

### What’s Next / Future Improvements
- **OAuth Providers**: Add Google, GitHub, or other social logins.
- **Email Verification**: Require email confirmation for new accounts.
- **Password Reset**: Add forgot/reset password functionality.
- **Advanced Analytics**: More detailed AI insights, historical performance charts, and risk metrics.
- **Notifications**: Email or in-app alerts for portfolio changes or market events.
- **Multi-currency Support**: Track investments in different currencies.
- **Better Mobile Experience**: Further optimize for mobile and tablet users.
- **Unit Tests & CI**: Add automated testing and continuous integration.
- **Social Features**: Following, commenting, and sharing between users.

---

## 🤝 Contributing
Pull requests and suggestions are welcome! Please open an issue or submit a PR.

## 📄 License

© 2024 Ranvijay Kumar. All rights reserved.

This project is the intellectual property of Ranvijay Kumar. Unauthorized copying, distribution, or use is strictly prohibited.
