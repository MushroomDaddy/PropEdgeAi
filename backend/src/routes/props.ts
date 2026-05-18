import { Hono } from 'hono';

const app = new Hono();

// GET /api/props/stats
app.get('/stats', async (c) => {
  return c.json({
    totalProps: 1428,
    avgEdge: 6.8,
    positiveEdgeCount: 412,
    topSport: "NBA"
  });
});

// GET /api/props/top-value
app.get('/top-value', async (c) => {
  const data = [
    { 
      id: "2544", 
      playerName: "LeBron James", 
      team: "LAL", 
      sport: "NBA", 
      statType: "POINTS", 
      line: 24.5, 
      projection: 28.2, 
      edge: 15.1, 
      winProb: 68, 
      overOdds: -115, 
      underOdds: -105, 
      confidence: "High", 
      playerTeamColor: "#FDB927",
      playerImage: "https://ak-static.cms.nba.com/wp-content/uploads/headshots/nba/latest/260x190/2544.png"
    },
    { 
      id: "203999", 
      playerName: "Nikola Jokic", 
      team: "DEN", 
      sport: "NBA", 
      statType: "REBOUNDS", 
      line: 12.5, 
      projection: 14.8, 
      edge: 18.4, 
      winProb: 72, 
      overOdds: -125, 
      underOdds: 105, 
      confidence: "High", 
      color: "#0E2240",
      playerTeamColor: "#0E2240",
      playerImage: "https://ak-static.cms.nba.com/wp-content/uploads/headshots/nba/latest/260x190/203999.png"
    },
    { 
      id: "1629029", 
      playerName: "Luka Doncic", 
      team: "LAL", 
      sport: "NBA", 
      statType: "ASSISTS", 
      line: 9.5, 
      projection: 8.1, 
      edge: 14.7, 
      winProb: 64, 
      overOdds: 110, 
      underOdds: -130, 
      confidence: "Medium", 
      playerTeamColor: "#FDB927",
      playerImage: "https://ak-static.cms.nba.com/wp-content/uploads/headshots/nba/latest/260x190/1629029.png"
    }
  ];
  return c.json(data);
});

// Mock other routes to prevent 404s
app.get('/', (c) => c.json([]));
app.get('/top-edges', (c) => c.json([]));

export default app;
