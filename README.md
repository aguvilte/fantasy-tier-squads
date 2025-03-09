# Fantasy Tier Squads

This project is a fantasy team management application built with Vercel v0. It allows users to manage squads, search for teams and players, and analyze player popularity based on selection data.

## Features

- **Fantasy Team Management**: Create and manage squads with selected players.
- **Search & Filtering**: Search teams and players by name and apply various filters.
- **Favorites**: Mark favorite teams for quick access.
- **Sorting**: Sort players by position and teams by various criteria.
- **Player Popularity Analysis**: View the most selected players and captains across all squads.
- **Local Storage**: Saves user preferences such as sort order, active tab, and favorites.

## Installation

1. Clone the repository:
   ```sh
   git clone https://github.com/aguvilte/fantasy-tier-squads.git
   cd https://github.com/aguvilte/fantasy-tier-squads.git
   ```
2. Install dependencies:
   ```sh
   npm install
   ```
3. Run the development server:
   ```sh
   npm run dev
   ```

## Usage

- Open `http://localhost:3000` in your browser.
- Navigate between the **Teams** and **Players** tabs.
- Use the search bar and filters to find specific teams or players.
- Mark teams as favorites for easier access.
- View player popularity and analyze the most selected players.

## Technologies Used

- **Vercel v0** for serverless deployment
- **React & Next.js** for UI and client-side rendering
- **Lucide React** for icons
- **ShadCN UI components** for styling and layout
- **TypeScript** for type safety

## API Endpoints

- `/api/teams` - Fetches team, player, and squad data.

## Contributing

Contributions are welcome! If you find a bug or have an idea for an improvement, feel free to open an issue or submit a pull request.

## License

This project is licensed under the MIT License.

