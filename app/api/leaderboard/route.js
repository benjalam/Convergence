import { kv } from "@vercel/kv";

const LEADERBOARD_KEY = "convergence:leaderboard";
const MAX_ENTRIES = 100;

export async function GET() {
  try {
    // Récupère le top 100
    const leaderboard = await kv.zrange(LEADERBOARD_KEY, 0, MAX_ENTRIES - 1, {
      rev: true,
      withScores: true,
    });

    // Transforme en tableau d'objets
    const entries = [];
    for (let i = 0; i < leaderboard.length; i += 2) {
      entries.push({
        pseudo: leaderboard[i],
        score: leaderboard[i + 1],
      });
    }

    return Response.json({ leaderboard: entries });
  } catch (error) {
    console.error("Erreur GET leaderboard:", error);
    // Si KV pas configuré, retourne un tableau vide
    return Response.json({ leaderboard: [], error: "KV non configuré" });
  }
}

export async function POST(request) {
  try {
    const { pseudo, score } = await request.json();

    if (!pseudo || typeof score !== "number") {
      return Response.json({ error: "Pseudo et score requis" }, { status: 400 });
    }

    // Nettoie le pseudo
    const cleanPseudo = pseudo.trim().slice(0, 20);

    // Récupère le score actuel du joueur
    const currentScore = await kv.zscore(LEADERBOARD_KEY, cleanPseudo);

    // Met à jour seulement si le nouveau score est meilleur
    if (currentScore === null || score > currentScore) {
      await kv.zadd(LEADERBOARD_KEY, { score, member: cleanPseudo });
    }

    // Récupère le rang du joueur
    const rank = await kv.zrevrank(LEADERBOARD_KEY, cleanPseudo);

    return Response.json({
      success: true,
      rank: rank !== null ? rank + 1 : null,
      bestScore: Math.max(score, currentScore || 0),
    });
  } catch (error) {
    console.error("Erreur POST leaderboard:", error);
    return Response.json({ error: "KV non configuré" }, { status: 500 });
  }
}
