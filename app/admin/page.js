"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";

const THEMES = [
  { id: "classique", name: "Classique", emoji: "📝" },
  { id: "cinema", name: "Cinéma", emoji: "🎬" },
  { id: "sport", name: "Sport", emoji: "⚽" },
];

export default function AdminPage() {
  const [theme, setTheme] = useState("classique");
  const [entries, setEntries] = useState([]);
  const [filteredEntries, setFilteredEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [editingEntry, setEditingEntry] = useState(null);
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [newEntry, setNewEntry] = useState({ regle: "", mots: ["", "", "", "", "", "", "", ""] });
  const [message, setMessage] = useState({ type: "", text: "" });

  // Charger les données
  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin?theme=${theme}`);
      const json = await res.json();
      if (json.data) {
        setEntries(json.data);
        setFilteredEntries(json.data);
      }
    } catch (error) {
      showMessage("error", "Erreur lors du chargement des données");
    }
    setLoading(false);
  }, [theme]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Filtrer les entrées
  useEffect(() => {
    if (!search.trim()) {
      setFilteredEntries(entries);
    } else {
      const searchLower = search.toLowerCase();
      setFilteredEntries(
        entries.filter(
          (entry) =>
            entry.regle.toLowerCase().includes(searchLower) ||
            entry.mots.some((mot) => mot.toLowerCase().includes(searchLower)) ||
            entry.id.toString().includes(searchLower)
        )
      );
    }
  }, [search, entries]);

  const showMessage = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: "", text: "" }), 3000);
  };

  // Ajouter une entrée
  const handleAdd = async () => {
    if (!newEntry.regle.trim()) {
      showMessage("error", "La règle est obligatoire");
      return;
    }
    const validMots = newEntry.mots.filter((m) => m.trim());
    if (validMots.length < 4) {
      showMessage("error", "Au moins 4 mots sont requis");
      return;
    }

    try {
      const res = await fetch("/api/admin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          theme,
          entry: { regle: newEntry.regle, mots: validMots },
        }),
      });
      const json = await res.json();
      if (json.success) {
        showMessage("success", "Entrée ajoutée avec succès !");
        setNewEntry({ regle: "", mots: ["", "", "", "", "", "", "", ""] });
        setIsAddingNew(false);
        fetchData();
      } else {
        showMessage("error", json.error || "Erreur lors de l'ajout");
      }
    } catch (error) {
      showMessage("error", "Erreur lors de l'ajout");
    }
  };

  // Modifier une entrée
  const handleEdit = async () => {
    if (!editingEntry.regle.trim()) {
      showMessage("error", "La règle est obligatoire");
      return;
    }
    const validMots = editingEntry.mots.filter((m) => m.trim());
    if (validMots.length < 4) {
      showMessage("error", "Au moins 4 mots sont requis");
      return;
    }

    try {
      const res = await fetch("/api/admin", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          theme,
          entry: { ...editingEntry, mots: validMots },
        }),
      });
      const json = await res.json();
      if (json.success) {
        showMessage("success", "Entrée modifiée avec succès !");
        setEditingEntry(null);
        fetchData();
      } else {
        showMessage("error", json.error || "Erreur lors de la modification");
      }
    } catch (error) {
      showMessage("error", "Erreur lors de la modification");
    }
  };

  // Supprimer une entrée
  const handleDelete = async (id) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer cette entrée ?")) return;

    try {
      const res = await fetch(`/api/admin?theme=${theme}&id=${id}`, {
        method: "DELETE",
      });
      const json = await res.json();
      if (json.success) {
        showMessage("success", "Entrée supprimée !");
        fetchData();
      } else {
        showMessage("error", json.error || "Erreur lors de la suppression");
      }
    } catch (error) {
      showMessage("error", "Erreur lors de la suppression");
    }
  };

  const startEdit = (entry) => {
    const mots = [...entry.mots];
    while (mots.length < 8) mots.push("");
    setEditingEntry({ ...entry, mots });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">
              🛠️ Back Office
            </h1>
            <p className="text-gray-400 mt-1">Gérer les données du jeu</p>
          </div>
          <Link
            href="/"
            className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition text-center"
          >
            ← Retour au jeu
          </Link>
        </div>

        {/* Message */}
        {message.text && (
          <div
            className={`mb-4 p-4 rounded-lg ${
              message.type === "success"
                ? "bg-green-500/20 border border-green-500 text-green-300"
                : "bg-red-500/20 border border-red-500 text-red-300"
            }`}
          >
            {message.text}
          </div>
        )}

        {/* Sélection du thème */}
        <div className="flex flex-wrap gap-2 mb-6">
          {THEMES.map((t) => (
            <button
              key={t.id}
              onClick={() => {
                setTheme(t.id);
                setSearch("");
                setEditingEntry(null);
                setIsAddingNew(false);
              }}
              className={`px-4 py-2 rounded-lg font-medium transition ${
                theme === t.id
                  ? "bg-gradient-to-r from-yellow-500 to-orange-500 text-black"
                  : "bg-white/10 hover:bg-white/20"
              }`}
            >
              {t.emoji} {t.name}
            </button>
          ))}
        </div>

        {/* Statistiques */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white/5 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-yellow-400">{entries.length}</div>
            <div className="text-sm text-gray-400">Total entrées</div>
          </div>
          <div className="bg-white/5 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-blue-400">{filteredEntries.length}</div>
            <div className="text-sm text-gray-400">Résultats filtrés</div>
          </div>
        </div>

        {/* Barre de recherche et bouton ajouter */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <input
            type="text"
            placeholder="🔍 Rechercher par ID, règle ou mot..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 px-4 py-3 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:border-yellow-500"
          />
          <button
            onClick={() => {
              setIsAddingNew(true);
              setEditingEntry(null);
              setNewEntry({ regle: "", mots: ["", "", "", "", "", "", "", ""] });
            }}
            className="px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg font-bold hover:opacity-90 transition"
          >
            ➕ Ajouter
          </button>
        </div>

        {/* Formulaire d'ajout */}
        {isAddingNew && (
          <div className="bg-white/10 rounded-xl p-6 mb-6 border border-green-500/50">
            <h3 className="text-xl font-bold mb-4 text-green-400">➕ Nouvelle entrée</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gray-400 mb-1">Règle / Réponse</label>
                <input
                  type="text"
                  value={newEntry.regle}
                  onChange={(e) => setNewEntry({ ...newEntry, regle: e.target.value })}
                  placeholder="Ex: Zinédine Zidane"
                  className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:border-green-500"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Mots indices (min 4, max 8)</label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {newEntry.mots.map((mot, i) => (
                    <input
                      key={i}
                      type="text"
                      value={mot}
                      onChange={(e) => {
                        const mots = [...newEntry.mots];
                        mots[i] = e.target.value;
                        setNewEntry({ ...newEntry, mots });
                      }}
                      placeholder={`Mot ${i + 1}`}
                      className="px-3 py-2 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:border-green-500 text-sm"
                    />
                  ))}
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={handleAdd}
                  className="px-6 py-2 bg-green-500 hover:bg-green-600 rounded-lg font-medium transition"
                >
                  ✓ Enregistrer
                </button>
                <button
                  onClick={() => setIsAddingNew(false)}
                  className="px-6 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition"
                >
                  Annuler
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Formulaire d'édition */}
        {editingEntry && (
          <div className="bg-white/10 rounded-xl p-6 mb-6 border border-yellow-500/50">
            <h3 className="text-xl font-bold mb-4 text-yellow-400">
              ✏️ Modifier l'entrée #{editingEntry.id}
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gray-400 mb-1">Règle / Réponse</label>
                <input
                  type="text"
                  value={editingEntry.regle}
                  onChange={(e) => setEditingEntry({ ...editingEntry, regle: e.target.value })}
                  className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:border-yellow-500"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Mots indices</label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {editingEntry.mots.map((mot, i) => (
                    <input
                      key={i}
                      type="text"
                      value={mot}
                      onChange={(e) => {
                        const mots = [...editingEntry.mots];
                        mots[i] = e.target.value;
                        setEditingEntry({ ...editingEntry, mots });
                      }}
                      placeholder={`Mot ${i + 1}`}
                      className="px-3 py-2 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:border-yellow-500 text-sm"
                    />
                  ))}
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={handleEdit}
                  className="px-6 py-2 bg-yellow-500 hover:bg-yellow-600 text-black rounded-lg font-medium transition"
                >
                  ✓ Enregistrer
                </button>
                <button
                  onClick={() => setEditingEntry(null)}
                  className="px-6 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition"
                >
                  Annuler
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Liste des entrées */}
        {loading ? (
          <div className="text-center py-12">
            <div className="text-4xl mb-4">⏳</div>
            <p className="text-gray-400">Chargement...</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredEntries.map((entry) => (
              <div
                key={entry.id}
                className="bg-white/5 hover:bg-white/10 rounded-xl p-4 transition border border-white/10"
              >
                <div className="flex flex-col md:flex-row md:items-center gap-4">
                  {/* ID et règle */}
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="px-2 py-1 bg-white/10 rounded text-xs text-gray-400">
                        #{entry.id}
                      </span>
                      <span className="font-bold text-lg text-yellow-400">{entry.regle}</span>
                    </div>
                    {/* Mots */}
                    <div className="flex flex-wrap gap-1">
                      {entry.mots.map((mot, i) => (
                        <span
                          key={i}
                          className="px-2 py-1 bg-white/10 rounded text-sm text-gray-300"
                        >
                          {mot}
                        </span>
                      ))}
                    </div>
                  </div>
                  {/* Actions */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        startEdit(entry);
                        setIsAddingNew(false);
                      }}
                      className="px-4 py-2 bg-yellow-500/20 hover:bg-yellow-500/30 text-yellow-400 rounded-lg transition"
                    >
                      ✏️ Modifier
                    </button>
                    <button
                      onClick={() => handleDelete(entry.id)}
                      className="px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg transition"
                    >
                      🗑️ Supprimer
                    </button>
                  </div>
                </div>
              </div>
            ))}

            {filteredEntries.length === 0 && !loading && (
              <div className="text-center py-12">
                <div className="text-4xl mb-4">🔍</div>
                <p className="text-gray-400">Aucune entrée trouvée</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
