import { Redis } from "@upstash/redis";

// Clés de classement par mode
const LEADERBOARD_KEYS = {
  classique: "convergence:leaderboard:classique",
  cinema: "convergence:leaderboard:cinema",
  sport: "convergence:leaderboard:sport",
};
const DEFAULT_MODE = "classique";
const MAX_ENTRIES = 100;

// Crée le client Redis avec les variables d'environnement disponibles
function getRedisClient() {
  // Essaie différentes combinaisons de variables d'environnement
  const url = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;

  if (url && token) {
    return new Redis({ url, token });
  }
  return null;
}

// Récupère la clé du leaderboard selon le mode
function getLeaderboardKey(mode) {
  return LEADERBOARD_KEYS[mode] || LEADERBOARD_KEYS[DEFAULT_MODE];
}

export async function GET(request) {
  try {
    const redis = getRedisClient();
    if (!redis) {
      return Response.json({ 
        leaderboard: [], 
        error: "Redis non configuré. Variables requises: KV_REST_API_URL + KV_REST_API_TOKEN ou UPSTASH_REDIS_REST_URL + UPSTASH_REDIS_REST_TOKEN" 
      });
    }

    // Récupère le mode depuis les query params
    const { searchParams } = new URL(request.url);
    const mode = searchParams.get("mode") || DEFAULT_MODE;
    const leaderboardKey = getLeaderboardKey(mode);

    // Récupère le top 100 (zrange avec rev pour ordre décroissant)
    const results = await redis.zrange(leaderboardKey, 0, MAX_ENTRIES - 1, {
      rev: true,
      withScores: true,
    });

    // Transforme en tableau d'objets
    const entries = [];
    for (let i = 0; i < results.length; i += 2) {
      entries.push({
        pseudo: results[i],
        score: results[i + 1],
      });
    }

    return Response.json({ leaderboard: entries, mode });
  } catch (error) {
    console.error("Erreur GET leaderboard:", error);
    return Response.json({ leaderboard: [], error: error.message });
  }
}

export async function POST(request) {
  try {
    const redis = getRedisClient();
    if (!redis) {
      return Response.json({ error: "Redis non configuré" }, { status: 500 });
    }

    const { pseudo, score, mode = DEFAULT_MODE } = await request.json();

    if (!pseudo || typeof score !== "number") {
      return Response.json({ error: "Pseudo et score requis" }, { status: 400 });
    }

    // Nettoie le pseudo
    const cleanPseudo = pseudo.trim().slice(0, 20);
    const leaderboardKey = getLeaderboardKey(mode);

    // Récupère le score actuel du joueur
    const currentScore = await redis.zscore(leaderboardKey, cleanPseudo);

    // Met à jour seulement si le nouveau score est meilleur
    if (currentScore === null || score > currentScore) {
      await redis.zadd(leaderboardKey, { score, member: cleanPseudo });
    }

    // Récupère le rang du joueur
    const rank = await redis.zrevrank(leaderboardKey, cleanPseudo);

    return Response.json({
      success: true,
      rank: rank !== null ? rank + 1 : null,
      bestScore: Math.max(score, currentScore || 0),
      mode,
    });
  } catch (error) {
    console.error("Erreur POST leaderboard:", error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}
