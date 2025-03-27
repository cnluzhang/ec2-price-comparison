# EC2 Price Comparison - Developer Guidelines

## Build Commands

### Using Docker (Recommended)
- **Start both services**: `docker-compose up`
- **Rebuild containers**: `docker-compose up --build`
- **Stop services**: `docker-compose down`
- **View logs**: `docker-compose logs -f`

### Manual Setup
- **Backend**
  - Install: `cd backend && npm install`
  - Start server: `cd backend && npm run start`
  - Development mode: `cd backend && npm run dev`
  - Build: `cd backend && npm run build`
  - Test: `cd backend && npm test` (Not implemented yet)

- **Frontend**
  - Install: `cd frontend && npm install`
  - Development mode: `cd frontend && npm run dev`
  - Build: `cd frontend && npm run build`
  - Lint: `cd frontend && npm run lint`
  - Preview build: `cd frontend && npm run preview`

## Project Structure
- **Frontend Components**
  - `App.tsx`: Main application container and state management
  - `components/InputSection.tsx`: All input controls (instance type, region selection)
  - `components/ResultsTable.tsx`: Price comparison table
  - `components/PriceChart.tsx`: Chart visualization 
  - `components/InstanceInfoCard.tsx`: Instance specifications display
  - `components/ErrorDisplay.tsx`: Error message handling

- **Backend Structure**
  - `src/controllers`: API endpoint handlers
  - `src/services`: Business logic and AWS integration
  - `src/routes`: API route definitions
  - `src/middleware`: Logging and error handling
  - `src/config`: AWS and environment configuration
  - `src/types`: TypeScript interfaces
  - `src/utils`: Helper functions

## Code Style Guidelines
- **TypeScript**: Use strict typing with explicit interfaces; configuration is set to strict mode
- **Naming**:
  - camelCase for variables, functions, methods
  - PascalCase for components, classes, interfaces
  - File names should match default exports
- **Imports**: Group in order: core libraries, external packages, local modules with blank lines between groups
- **Formatting**: 2-space indentation, blank lines between logical sections
- **ESLint Rules**: No unused locals/parameters, no fallthrough cases, no unchecked side effects
- **Error handling**: Try-catch with HTTP status codes (backend) and user-friendly messages (frontend)
- **React**: Use functional components with hooks (useState, useEffect), follow react-hooks rules
- **Styling**: Use Tailwind CSS utility classes for frontend styling
- **AWS Integration**: Use AWS SDK v3, properly handle region endpoints and API responses
- **TS Target**: ES2020 for both frontend and backend
- **Comments**: Include appropriate comments (English or Chinese) for complex logic

## Project Features
- Multiple region selection across all AWS global regions
- On-demand and reserved instance price comparison
- Custom instance type input with validation
- Detailed instance specifications display
- Badge-based UI for instance attributes
- Currency conversion between USD and CNY
- Interactive price comparison chart
- Tabular data with sorting capabilities

## Region Management
- All AWS regions are defined in `frontend/src/config/regions.ts`
- Regions are grouped by continent: North America, South America, Europe, Asia Pacific, Middle East, Africa, and China
- Add new regions by updating the `regionGroups` array with proper region code, name and continent
- Access all regions through the exported `allRegions` array

## Docker Setup
- `docker-compose.yml` orchestrates both frontend and backend services
- Frontend container runs on port 5173
- Backend container runs on port 3001
- Hot-reloading enabled for both services through volume mounts
- Environment variables for backend are loaded from `.env` file
- AWS credentials should be configured in `.env` file based on `.env.example`

## Development Workflow
1. Start services using Docker: `docker-compose up`
2. Make feature changes (changes will hot-reload)
3. Run linting before commits: `cd frontend && npm run lint`
4. Document any API or interface changes
5. Test on different AWS region combinations
6. Update the regions.ts file when new AWS regions become available
7. Stop services when done: `docker-compose down`

## Development Tools
- This project was developed using [Cursor](https://cursor.sh/), an AI-powered code editor
- [Claude Code](https://claude.ai/code) was used for AI assistance in development and documentation