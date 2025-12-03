import React, { useEffect, useState } from "react";

// Simple React SPA client for https://sapi.dramabox.be
// You can drop this component into a Vite + React + Tailwind project as App.jsx
// then run `npm run dev`.

const API_BASE = "https://sapi.dramabox.be/api";

// Helper to safely read common drama fields even if the API changes a bit
function getDramaTitle(item) {
  return (
    item?.title ||
    item?.name ||
    item?.bookName ||
    item?.dramaName ||
    "Untitled"
  );
}

function getDramaImage(item) {
  return item?.cover || item?.img || item?.poster || "";
}

function getDramaDescription(item) {
  // API Dramabox memakai field "introduction" untuk sinopsis
  return (
    item?.introduction ||
    item?.intro ||
    item?.description ||
    item?.shortDesc ||
    "Tidak ada deskripsi."
  );
}

function getDramaId(item) {
  return item?.bookId || item?.id || item?.dramaId || null;
}

function getDramaMeta(item) {
  const episodes = item?.chapterCount || item?.episodeCount;
  const year = item?.year || item?.releaseYear;
  const score = item?.score || item?.rating;
  return {
    episodes,
    year,
    score,
  };
}

const SectionTitle = ({ children }) => (
  <h2 className="text-xl sm:text-2xl font-semibold text-slate-100 mb-3 flex items-center gap-2">
    <span className="w-1.5 h-6 rounded-full bg-indigo-400" />
    {children}
  </h2>
);

const DramaCard = ({ item, onClick }) => {
  const title = getDramaTitle(item);
  const img = getDramaImage(item);
  const desc = getDramaDescription(item);
  const { episodes, year, score } = getDramaMeta(item);

  return (
    <button
      onClick={onClick}
      className="group flex flex-col text-left bg-slate-800/70 hover:bg-slate-700/80 transition border border-slate-700/80 hover:border-indigo-400/70 rounded-2xl overflow-hidden shadow-md hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-indigo-400"
    >
      <div className="relative aspect-[2/3] w-full overflow-hidden">
        {img ? (
          <img
            src={img}
            alt={title}
            className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
            loading="lazy"
          />
        ) : (
          <div className="h-full w-full flex items-center justify-center bg-slate-900 text-slate-500 text-xs">
            No image
          </div>
        )}
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-2 text-[10px] text-slate-100 flex justify-between gap-2">
          <span className="truncate max-w-[55%]">{title}</span>
          <div className="flex items-center gap-2 text-[10px]">
            {year && <span>{year}</span>}
            {episodes && (
              <span className="px-1.5 py-0.5 rounded-full bg-black/40 text-[9px]">
                {episodes} eps
              </span>
            )}
            {score && (
              <span className="px-1.5 py-0.5 rounded-full bg-yellow-400/20 text-yellow-300 text-[9px]">
                ⭐ {score}
              </span>
            )}
          </div>
        </div>
      </div>
      <div className="p-3 flex flex-col gap-1">
        <p className="text-sm font-medium text-slate-100 line-clamp-1">{title}</p>
        <p className="text-xs text-slate-400 line-clamp-2 min-h-[2.3rem]">{desc}</p>
      </div>
    </button>
  );
};

const EpisodeButton = ({ episode, isActive, onClick }) => {
  const label =
    episode?.title ||
    episode?.chapterName ||
    episode?.name ||
    `Episode ${episode?.chapterIndex ?? episode?.index ?? "?"}`;
  const idx = episode?.chapterIndex ?? episode?.index ?? 0;

  return (
    <button
      onClick={onClick}
      className={`px-3 py-1.5 rounded-full border text-xs sm:text-sm transition whitespace-nowrap ${
        isActive
          ? "bg-indigo-500 border-indigo-400 text-white shadow"
          : "bg-slate-800/70 border-slate-700 text-slate-100 hover:bg-slate-700 hover:border-indigo-400/60"
      }`}
      title={label}
    >
      Ep {idx + 1}
    </button>
  );
};

const DramaModal = ({
  drama,
  episodes,
  activeEpisode,
  streamUrl,
  onClose,
  onSelectEpisode,
}) => {
  if (!drama) return null;
  const title = getDramaTitle(drama);
  const img = getDramaImage(drama);
  const desc = getDramaDescription(drama);
  const { episodes: epCount, year, score } = getDramaMeta(drama);

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/70 backdrop-blur-sm p-2 sm:p-4">
      <div className="relative max-h-[95vh] w-full max-w-5xl overflow-hidden rounded-2xl bg-slate-900 border border-slate-700 shadow-2xl flex flex-col">
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-700">
          <h3 className="text-base sm:text-lg font-semibold text-slate-50 truncate pr-8">
            {title}
          </h3>
          <button
            onClick={onClose}
            className="absolute right-3 top-2.5 inline-flex h-8 w-8 items-center justify-center rounded-full bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white"
          >
            <span className="sr-only">Close</span>
            ✕
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4 sm:flex-row">
          <div className="w-full sm:w-1/3 flex flex-col gap-3">
            <div className="aspect-[2/3] w-full rounded-xl overflow-hidden border border-slate-700 bg-slate-800">
              {img ? (
                <img
                  src={img}
                  alt={title}
                  className="h-full w-full object-cover"
                  loading="lazy"
                />
              ) : (
                <div className="h-full w-full flex items-center justify-center text-slate-500 text-xs">
                  No image
                </div>
              )}
            </div>
            <div className="flex flex-wrap gap-2 text-[11px] text-slate-300">
              {year && (
                <span className="px-2 py-1 rounded-full bg-slate-800 border border-slate-700">
                  Tahun {year}
                </span>
              )}
              {epCount && (
                <span className="px-2 py-1 rounded-full bg-slate-800 border border-slate-700">
                  {epCount} episode
                </span>
              )}
              {score && (
                <span className="px-2 py-1 rounded-full bg-yellow-400/20 border border-yellow-500/40 text-yellow-200">
                  Rating {score}
                </span>
              )}
            </div>
          </div>

          <div className="w-full sm:w-2/3 flex flex-col gap-3">
            <p className="text-xs sm:text-sm text-slate-200 leading-relaxed whitespace-pre-line">
              {desc}
            </p>

            <div className="mt-1">
              <h4 className="text-sm font-semibold text-slate-100 mb-2">
                Episode
              </h4>
              {episodes?.length ? (
                <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto pr-1">
                  {episodes.map((ep) => (
                    <EpisodeButton
                      key={ep?.chapterIndex ?? ep?.index ?? ep?.id}
                      episode={ep}
                      isActive={
                        activeEpisode &&
                        (activeEpisode.chapterIndex ?? activeEpisode.index) ===
                          (ep.chapterIndex ?? ep.index)
                      }
                      onClick={() => onSelectEpisode(ep)}
                    />
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-400">
                  Episode belum tersedia.
                </p>
              )}
            </div>

            <div className="mt-3">
              <h4 className="text-sm font-semibold text-slate-100 mb-2">
                Player
              </h4>
              {streamUrl ? (
                <video
                  key={streamUrl}
                  src={streamUrl}
                  controls
                  className="w-full aspect-video rounded-xl border border-slate-700 bg-black"
                >
                  Browser Anda tidak mendukung pemutar video HTML5.
                </video>
              ) : (
                <p className="text-xs text-slate-400">
                  Pilih episode untuk memuat player.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const LoadingSkeletonRow = () => (
  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 animate-pulse">
    {Array.from({ length: 6 }).map((_, idx) => (
      <div
        key={idx}
        className="bg-slate-800/70 rounded-2xl overflow-hidden border border-slate-700/80"
      >
        <div className="aspect-[2/3] bg-slate-700" />
        <div className="p-3 space-y-2">
          <div className="h-3 bg-slate-700 rounded" />
          <div className="h-3 bg-slate-800 rounded w-3/4" />
        </div>
      </div>
    ))}
  </div>
);

const ErrorBox = ({ message }) => (
  <div className="mt-2 rounded-xl border border-red-500/60 bg-red-950/40 px-4 py-3 text-xs text-red-50">
    {message}
  </div>
);

const useFetch = (url, enabled = true) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!url || !enabled) return;
    let cancelled = false;

    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await fetch(url);
        if (!res.ok) {
          throw new Error(`HTTP ${res.status}`);
        }
        const json = await res.json();

        // A lot of free APIs wrap list data in data / result / list fields.
        const list =
          json?.data?.list ||
          json?.data ||
          json?.result ||
          json?.list ||
          json?.items ||
          json;

        if (!cancelled) {
          setData(list);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err.message || "Unknown error");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchData();
    return () => {
      cancelled = true;
    };
  }, [url, enabled]);

  return { data, loading, error };
};

const DramaApp = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("foryou");
  const [selectedDrama, setSelectedDrama] = useState(null);
  const [episodes, setEpisodes] = useState([]);
  const [activeEpisode, setActiveEpisode] = useState(null);
  const [streamUrl, setStreamUrl] = useState("");
  const [episodeLoading, setEpisodeLoading] = useState(false);
  const [episodeError, setEpisodeError] = useState(null);

  // Initial sections
  const {
    data: forYou,
    loading: forYouLoading,
    error: forYouError,
  } = useFetch(`${API_BASE}/foryou/1?lang=in`);

  const {
    data: newList,
    loading: newLoading,
    error: newError,
  } = useFetch(`${API_BASE}/new/1?lang=in&pageSize=18`);

  const {
    data: rankList,
    loading: rankLoading,
    error: rankError,
  } = useFetch(`${API_BASE}/rank/1?lang=in`);

  // Search
  const [searchUrl, setSearchUrl] = useState(null);
  const {
    data: searchResults,
    loading: searchLoading,
    error: searchError,
  } = useFetch(searchUrl, !!searchUrl);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    const q = searchQuery.trim();
    if (!q) return;
    setActiveTab("search");
    setSearchUrl(`${API_BASE}/search/${encodeURIComponent(q)}/1?lang=in`);
  };

  // When selecting a drama card
  const openDrama = async (item) => {
    const id = getDramaId(item);
    if (!id) {
      alert("ID drama tidak ditemukan di respons API. Coba cek struktur JSON nya.");
      return;
    }

    setSelectedDrama(item);
    setEpisodes([]);
    setActiveEpisode(null);
    setStreamUrl("");
    setEpisodeLoading(true);
    setEpisodeError(null);

    try {
      const res = await fetch(`${API_BASE}/chapters/${id}?lang=in`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();

      // Struktur response chapters bisa berbeda, jadi kita cek beberapa kemungkinan
      const eps =
        json?.data?.list ||
        json?.data?.chapters ||
        json?.data?.chapterList ||
        json?.data?.records ||
        json?.data?.items ||
        json?.chapters ||
        json?.list ||
        json?.items ||
        [];

      const epArray = Array.isArray(eps) ? eps : [];
      setEpisodes(epArray);

      if (epArray.length > 0) {
        // Auto pilih episode pertama
        handleSelectEpisode(epArray[0], item, false);
      }
    } catch (err) {
      setEpisodeError(err.message || "Gagal memuat episode.");
    } finally {
      setEpisodeLoading(false);
    }
  };

  const closeDrama = () => {
    setSelectedDrama(null);
    setEpisodes([]);
    setActiveEpisode(null);
    setStreamUrl("");
    setEpisodeError(null);
  };

  const handleSelectEpisode = async (
    episode,
    dramaOverride = null,
    showLoading = true
  ) => {
    const drama = dramaOverride || selectedDrama;
    const id = getDramaId(drama);
    if (!id) return;

    const index = episode?.chapterIndex ?? episode?.index ?? 0;

    if (showLoading) {
      setEpisodeLoading(true);
      setEpisodeError(null);
    }

    try {
      // /watch mengembalikan JSON berisi videoUrl & qualities,
      // bukan langsung file video / halaman.
      const res = await fetch(
        `${API_BASE}/watch/${id}/${index}?lang=in&source=search_result`
      );
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();

      const videoUrl =
        json?.data?.videoUrl ||
        json?.data?.qualities?.find((q) => q.isDefault === 1)?.videoPath ||
        json?.data?.qualities?.[0]?.videoPath;

      if (!videoUrl) {
        throw new Error("URL video tidak ditemukan di respons API.");
      }

      setActiveEpisode(episode);
      setStreamUrl(videoUrl);
    } catch (err) {
      setEpisodeError(err.message || "Gagal memuat stream.");
    } finally {
      if (showLoading) setEpisodeLoading(false);
    }
  };

  const renderSection = (label, data, loading, error, emptyMessage) => (
    <section className="mt-6">
      <SectionTitle>{label}</SectionTitle>
      {loading && <LoadingSkeletonRow />}
      {error && (
        <ErrorBox
          message={`Gagal memuat data (${error}). Coba cek CORS atau struktur respons API.`}
        />
      )}
      {!loading && !error && Array.isArray(data) && data.length === 0 && (
        <p className="text-sm text-slate-400 mt-1">{emptyMessage}</p>
      )}
      {!loading && !error && Array.isArray(data) && data.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
          {data.map((item, idx) => (
            <DramaCard key={idx} item={item} onClick={() => openDrama(item)} />
          ))}
        </div>
      )}
    </section>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 text-slate-50">
      <div className="mx-auto max-w-6xl px-3 sm:px-4 pb-10">
        {/* Header */}
        <header className="sticky top-0 z-30 -mx-3 sm:-mx-4 mb-4 border-b border-slate-800 bg-slate-950/80 backdrop-blur-xl">
          <div className="mx-auto max-w-6xl px-3 sm:px-4 py-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-xl bg-indigo-500 flex items-center justify-center text-lg font-bold">
                D
              </div>
              <div>
                <p className="text-sm font-semibold leading-tight">
                  DramaBox Explorer
                </p>
                <p className="text-[11px] text-slate-400 leading-tight">
                  Built on sapi.dramabox.be
                </p>
              </div>
            </div>

            <form
              onSubmit={handleSearchSubmit}
              className="flex w-full sm:w-auto items-center gap-2"
            >
              <div className="relative flex-1 min-w-0">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Cari drama, misal: cinta, ceo, school..."
                  className="w-full rounded-xl border border-slate-700 bg-slate-900/80 px-3 py-1.5 text-xs sm:text-sm text-slate-100 placeholder:text-slate-500 focus:border-indigo-400 focus:outline-none focus:ring-1 focus:ring-indigo-400"
                />
                <span className="pointer-events-none absolute inset-y-0 right-2 flex items-center text-slate-500 text-xs">
                  ⌕
                </span>
              </div>
              <button
                type="submit"
                className="px-3 py-1.5 rounded-xl text-xs sm:text-sm font-medium bg-indigo-500 hover:bg-indigo-400 text-white shadow-sm"
              >
                Cari
              </button>
            </form>
          </div>

          {/* Tabs */}
          <div className="mx-auto max-w-6xl px-3 sm:px-4 pb-2 flex gap-2 text-[11px] sm:text-xs">
            {[
              { id: "foryou", label: "Rekomendasi" },
              { id: "new", label: "Rilis Terbaru" },
              { id: "rank", label: "Paling Populer" },
              { id: "search", label: "Hasil Pencarian" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-3 py-1.5 rounded-full border transition ${
                  activeTab === tab.id
                    ? "bg-indigo-500 border-indigo-400 text-white shadow-sm"
                    : "bg-slate-900/80 border-slate-700 text-slate-300 hover:bg-slate-800 hover:border-indigo-400/60"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </header>

        {/* Content */}
        <main>
          {activeTab === "foryou" &&
            renderSection(
              "Rekomendasi Untukmu",
              Array.isArray(forYou) ? forYou : forYou?.list || [],
              forYouLoading,
              forYouError,
              "Belum ada rekomendasi."
            )}

          {activeTab === "new" &&
            renderSection(
              "Rilis Terbaru",
              Array.isArray(newList) ? newList : newList?.list || [],
              newLoading,
              newError,
              "Belum ada rilis terbaru."
            )}

          {activeTab === "rank" &&
            renderSection(
              "Peringkat Populer",
              Array.isArray(rankList) ? rankList : rankList?.list || [],
              rankLoading,
              rankError,
              "Belum ada data peringkat."
            )}

          {activeTab === "search" && (
            <section className="mt-6">
              <SectionTitle>
                Hasil Pencarian{searchQuery ? `: "${searchQuery}"` : ""}
              </SectionTitle>
              {searchLoading && <LoadingSkeletonRow />}
              {searchError && (
                <ErrorBox
                  message={`Gagal memuat hasil pencarian (${searchError}). Pastikan endpoint /search tersedia.`}
                />
              )}
              {!searchLoading &&
                !searchError &&
                searchUrl &&
                Array.isArray(searchResults) &&
                searchResults.length === 0 && (
                  <p className="text-sm text-slate-400 mt-1">
                    Tidak ada hasil untuk kata kunci tersebut.
                  </p>
                )}
              {!searchLoading &&
                !searchError &&
                Array.isArray(searchResults) &&
                searchResults.length > 0 && (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                    {searchResults.map((item, idx) => (
                      <DramaCard
                        key={idx}
                        item={item}
                        onClick={() => openDrama(item)}
                      />
                    ))}
                  </div>
                )}
              {!searchUrl && (
                <p className="text-xs text-slate-500 mt-1">
                  Masukkan kata kunci kemudian tekan tombol Cari.
                </p>
              )}
            </section>
          )}
        </main>

        {/* Footer */}
        <footer className="mt-10 pt-4 border-t border-slate-800 text-[11px] text-slate-500 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
          <p>
            Data drama diambil dari <span className="text-slate-300">sapi.dramabox.be</span>.
          </p>
          <p>
            Jika mengalami masalah CORS, gunakan backend proxy sederhana untuk meneruskan
            request ke API.
          </p>
        </footer>
      </div>

      {/* Modal */}
      <DramaModal
        drama={selectedDrama}
        episodes={episodes}
        activeEpisode={activeEpisode}
        streamUrl={streamUrl}
        onClose={closeDrama}
        onSelectEpisode={handleSelectEpisode}
      />

      {/* Global small loader for episode actions */}
      {episodeLoading && (
        <div className="fixed bottom-3 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 rounded-full bg-slate-900/90 border border-slate-700 px-3 py-1.5 text-[11px] text-slate-100 shadow-lg">
          <span className="h-3 w-3 rounded-full border-2 border-slate-500 border-t-indigo-400 animate-spin" />
          Memuat episode / player...
        </div>
      )}
      {episodeError && !episodeLoading && (
        <div className="fixed bottom-3 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 rounded-full bg-red-950/90 border border-red-600 px-3 py-1.5 text-[11px] text-red-50 shadow-lg">
          ⚠ {episodeError}
        </div>
      )}
    </div>
  );
};

export default DramaApp;
