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
      id: "1_v2", 
      player: "LeBron James", 
      team: "LAL", 
      sport: "NBA", 
      propType: "POINTS", 
      line: 24.5, 
      projection: 28.2, 
      edge: 15.1, 
      winProb: 68, 
      overOdds: -115, 
      underOdds: -105, 
      confidence: "High", 
      color: "#FDB927",
      image: "https://ak-static.cms.nba.com/wp-content/uploads/headshots/nba/latest/260x190/2544.png"
    },
    { 
      id: "2_v2", 
      player: "Nikola Jokic", 
      team: "DEN", 
      sport: "NBA", 
      propType: "REBOUNDS", 
      line: 12.5, 
      projection: 14.8, 
      edge: 18.4, 
      winProb: 72, 
      overOdds: -125, 
      underOdds: +105, 
      confidence: "High", 
      color: "#0E2240",
      image: "https://ak-static.cms.nba.com/wp-content/uploads/headshots/nba/latest/260x190/203999.png"
    },
    { 
      id: "3_v2", 
      player: "Luka Doncic", 
      team: "LAL", 
      sport: "NBA", 
      propType: "ASSISTS", 
      line: 9.5, 
      projection: 8.1, 
      edge: 14.7, 
      winProb: 64, 
      overOdds: +110, 
      underOdds: -130, 
      confidence: "Medium", 
      color: "#FDB927",
      image: "https://ak-static.cms.nba.com/wp-content/uploads/headshots/nba/latest/260x190/1629029.png"
    }
  ];
  return c.json(data);
});

export default app;
