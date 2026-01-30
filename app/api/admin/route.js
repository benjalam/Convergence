import { NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";

// Chemins des fichiers de données
const DATA_FILES = {
  classique: path.join(process.cwd(), "data", "datamot.json"),
  cinema: path.join(process.cwd(), "data", "datacine.json"),
  sport: path.join(process.cwd(), "data", "datasport.json"),
};

// GET - Récupérer toutes les entrées d'une thématique
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const theme = searchParams.get("theme") || "classique";

    if (!DATA_FILES[theme]) {
      return NextResponse.json(
        { error: "Thématique invalide" },
        { status: 400 }
      );
    }

    const fileContent = await fs.readFile(DATA_FILES[theme], "utf-8");
    const data = JSON.parse(fileContent);

    return NextResponse.json({ data, theme });
  } catch (error) {
    console.error("Erreur lecture:", error);
    return NextResponse.json(
      { error: "Erreur lors de la lecture des données" },
      { status: 500 }
    );
  }
}

// POST - Ajouter une nouvelle entrée
export async function POST(request) {
  try {
    const { theme, entry } = await request.json();

    if (!DATA_FILES[theme]) {
      return NextResponse.json(
        { error: "Thématique invalide" },
        { status: 400 }
      );
    }

    const fileContent = await fs.readFile(DATA_FILES[theme], "utf-8");
    const data = JSON.parse(fileContent);

    // Trouver le prochain ID disponible
    const maxId = data.reduce((max, item) => Math.max(max, item.id), 0);
    const newEntry = {
      id: maxId + 1,
      regle: entry.regle,
      mots: entry.mots,
    };

    data.push(newEntry);

    await fs.writeFile(DATA_FILES[theme], JSON.stringify(data, null, 2));

    return NextResponse.json({ success: true, entry: newEntry });
  } catch (error) {
    console.error("Erreur ajout:", error);
    return NextResponse.json(
      { error: "Erreur lors de l'ajout" },
      { status: 500 }
    );
  }
}

// PUT - Modifier une entrée existante
export async function PUT(request) {
  try {
    const { theme, entry } = await request.json();

    if (!DATA_FILES[theme]) {
      return NextResponse.json(
        { error: "Thématique invalide" },
        { status: 400 }
      );
    }

    const fileContent = await fs.readFile(DATA_FILES[theme], "utf-8");
    const data = JSON.parse(fileContent);

    const index = data.findIndex((item) => item.id === entry.id);
    if (index === -1) {
      return NextResponse.json(
        { error: "Entrée non trouvée" },
        { status: 404 }
      );
    }

    data[index] = {
      id: entry.id,
      regle: entry.regle,
      mots: entry.mots,
    };

    await fs.writeFile(DATA_FILES[theme], JSON.stringify(data, null, 2));

    return NextResponse.json({ success: true, entry: data[index] });
  } catch (error) {
    console.error("Erreur modification:", error);
    return NextResponse.json(
      { error: "Erreur lors de la modification" },
      { status: 500 }
    );
  }
}

// DELETE - Supprimer une entrée
export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const theme = searchParams.get("theme");
    const id = parseInt(searchParams.get("id"));

    if (!DATA_FILES[theme]) {
      return NextResponse.json(
        { error: "Thématique invalide" },
        { status: 400 }
      );
    }

    const fileContent = await fs.readFile(DATA_FILES[theme], "utf-8");
    const data = JSON.parse(fileContent);

    const index = data.findIndex((item) => item.id === id);
    if (index === -1) {
      return NextResponse.json(
        { error: "Entrée non trouvée" },
        { status: 404 }
      );
    }

    data.splice(index, 1);

    await fs.writeFile(DATA_FILES[theme], JSON.stringify(data, null, 2));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Erreur suppression:", error);
    return NextResponse.json(
      { error: "Erreur lors de la suppression" },
      { status: 500 }
    );
  }
}
