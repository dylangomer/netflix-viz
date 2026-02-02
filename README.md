# Netflix Viewing Dashboard

A data visualization dashboard that transforms your Netflix viewing history into interactive charts and insights. Built by **Dylan Gomer** as a hands-on project for familiarization with React and data visualization.

## Features

- **CSV Upload** - Import your Netflix `ViewingActivity.csv` file
- **Watches Over Time** - Line chart showing viewing activity by date
- **Top Titles** - Paginated bar chart of most-watched shows and movies
- **Privacy-First** - All data processing happens locally in your browser
- **Dark Mode** - Automatic theme detection based on system preferences

## Tech Stack

| Category | Technology |
|----------|------------|
| Framework | [Next.js 16](https://nextjs.org/) with App Router |
| UI Library | [React 19](https://react.dev/) |
| Language | [TypeScript](https://www.typescriptlang.org/) |
| Styling | [Tailwind CSS 4](https://tailwindcss.com/) |
| Charts | [Recharts](https://recharts.org/) |
| CSV Parsing | [PapaParse](https://www.papaparse.com/) |

## Getting Your Netflix Data

1. Go to [Netflix Account Settings](https://www.netflix.com/account)
2. Select your profile
3. Click **Viewing activity**
4. Click **Download all** at the bottom of the page
5. Upload the downloaded `ViewingActivity.csv` to this dashboard

## Roadmap

- [ ] TMDB API integration for richer metadata (genres, actors, posters)
- [ ] Distinguish between TV shows and movies
- [ ] Additional chart types and filtering options
- [ ] Export visualizations as images

## Development

This project was built as a learning exercise in React data visualization. Development was assisted by modern AI tools (Claude) for code review, refactoring guidance, and best practices.

## Author

**Dylan Gomer**

---

Built with Next.js
