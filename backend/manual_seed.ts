
import 'dotenv/config';
import { db } from './src/db/client.js';
import { players, props } from './src/db/schema.js';
import { eq } from 'drizzle-orm';

async function seed() {
  console.log('SEEDING: Manually injecting Elite Edge Board data...');

  const nbaPlayers = [
    { 
      id: "2544", 
      name: "LeBron James", 
      team: "LAL", 
      teamColor: "#FDB927", 
      image: "https://ak-static.cms.nba.com/wp-content/uploads/headshots/nba/latest/260x190/2544.png" 
    },
    { 
      id: "203999", 
      name: "Nikola Jokic", 
      team: "DEN", 
      teamColor: "#0E2240", 
      image: "https://ak-static.cms.nba.com/wp-content/uploads/headshots/nba/latest/260x190/203999.png" 
    },
    { 
      id: "1629029", 
      name: "Luka Doncic", 
      team: "LAL", 
      teamColor: "#FDB927", 
      image: "https://ak-static.cms.nba.com/wp-content/uploads/headshots/nba/latest/260x190/1629029.png" 
    }
  ];

  for (const p of nbaPlayers) {
    await db.insert(players).values({
      id: p.id,
      name: p.name,
      team: p.team,
      teamColor: p.teamColor,
      image: p.image,
      lastUpdate: new Date()
    }).onConflictDoUpdate({
      target: [players.id],
      set: { team: p.team, teamColor: p.teamColor, image: p.image }
    });

    // Add a prop for each player
    await db.insert(props).values({
      id: `prop_${p.id}`,
      playerId: p.id,
      playerName: p.name,
      team: p.team,
      sport: 'NBA',
      statType: p.id === '2544' ? 'POINTS' : (p.id === '203999' ? 'REBOUNDS' : 'ASSISTS'),
      line: p.id === '2544' ? 24.5 : (p.id === '203999' ? 12.5 : 9.5),
      projection: p.id === '2544' ? 28.2 : (p.id === '203999' ? 14.8 : 8.1),
      edge: p.id === '2544' ? 15.1 : (p.id === '203999' ? 18.4 : 14.7),
      confidence: 85,
      lastUpdated: new Date()
    }).onConflictDoUpdate({
      target: [props.id],
      set: { edge: p.id === '2544' ? 15.1 : 18.4 }
    });
  }

  console.log('SEED COMPLETE: Dashboard should now have Elite Edge Board cards!');
}

seed().catch(console.error).finally(() => process.exit());
