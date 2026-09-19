import { useState, useEffect, useRef } from "react";
import { initializeApp } from "firebase/app";
import { getDatabase, ref, set, get, update, onValue } from "firebase/database";

const FIREBASE_CONFIG = {
  apiKey: "AIzaSyC4N6lt83VhpAoD6Q9E06LG3RSLS6-uu2Y",
  authDomain: "betterviewer-d14fa.firebaseapp.com",
  databaseURL: "https://betterviewer-d14fa-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "betterviewer-d14fa",
  storageBucket: "betterviewer-d14fa.firebasestorage.app",
  messagingSenderId: "172679268105",
  appId: "1:172679268105:web:db06e2ecf16ed1661875d8"
};
const TWITCH_CLIENT_ID = "d3313alwndj6mxi27aehgh6swizpk3";
const REDIRECT_URI = "https://betterviewer.vercel.app/";
const STARTING_BALANCE = 1000;
const REBUY_AMOUNT = 800;
const LOGO = "https://raw.githubusercontent.com/ogkdecoy/Betterviewer/main/public/logo.png.PNG";
const COIN = "https://raw.githubusercontent.com/ogkdecoy/Betterviewer/main/public/coin.PNG";
const COINS_STACK = "https://raw.githubusercontent.com/ogkdecoy/Betterviewer/main/public/coins-stack.PNG";
const IMG_STREAMER = "https://raw.githubusercontent.com/ogkdecoy/Betterviewer/main/public/streamer.PNG";
const IMG_VIEWER = "https://raw.githubusercontent.com/ogkdecoy/Betterviewer/main/public/viewer.PNG";

let _db = null;
function getDb() {
  if (_db) return _db;
  initializeApp(FIREBASE_CONFIG);
  _db = getDatabase();
  return _db;
}

const LS = {
  get: (k) => { try { return JSON.parse(localStorage.getItem(k)); } catch { return null; } },
  set: (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch {} },
  del: (k) => { try { localStorage.removeItem(k); } catch {} },
};
const genCode = () => Math.random().toString(36).toUpperCase().replace(/[^A-Z0-9]/g,"").slice(0,6).padEnd(6,"X");
const genId   = () => Math.random().toString(36).slice(2,10);
const fmt     = (n) => Number(n||0).toLocaleString("fr-FR",{minimumFractionDigits:2,maximumFractionDigits:2});
const fmtInt  = (n) => Number(n||0).toLocaleString("fr-FR",{maximumFractionDigits:0});

function useIsMobile() {
  const [m, setM] = useState(typeof window !== "undefined" ? window.innerWidth < 760 : false);
  useEffect(() => {
    const fn = () => setM(window.innerWidth < 760);
    window.addEventListener("resize", fn);
    return () => window.removeEventListener("resize", fn);
  }, []);
  return m;
}

const LANGS = [
  { code:"fr", flag:"🇫🇷", name:"Français" },
  { code:"en", flag:"🇬🇧", name:"English" },
  { code:"es", flag:"🇪🇸", name:"Español" },
];

const T = {
  fr: {
    tagline:"Argent factice · Jeu 100% gratuit", heroSub:"Engage tes viewers avec des paris factices en direct.\nLe meilleur gagne le giveaway.",
    loginHint:"Connecte-toi pour créer ou rejoindre une session", loginTwitch:"Se connecter avec Twitch",
    streamerDesc:"Lance une session, crée les marchés, désigne le gagnant.",
    viewerDesc:"Entre le code partagé en stream pour participer.",
    createSession:"Créer une session", codePlaceholder:"CODE",
    markets:"Marchés", create:"Créer", leaderboard:"Classement", bets:"Paris",
    noMarket:"Aucun marché pour l'instant.", noMarketAction:"Créer le premier →",
    question:"Question", questionPlaceholder:"Ex : Qui gagne le prochain duel ?",
    options:"Options & cotes", openMarket:"Ouvrir le marché", closeBets:"Fermer les paris",
    goLive:"Lancer le live", endSession:"Terminer", copyLink:"Lien", copyCode:"Code",
    copied:"Copié", balance:"Solde", rank:"Rang", players:"Joueurs",
    bet:"Valider le pari", myBet:"Mon pari", sessionOf:"Session de", streamEnded:"Stream terminé",
    winner:"Gagnant du giveaway", myRank:"Ton classement", backHome:"Retour à l'accueil",
    waitingLobby:"En attente du lancement du live", open:"Ouvert", closed:"Fermé", resolved:"Résolu",
    ended:"Terminé", addOption:"Ajouter une option", viewers:"joueurs",
    dashboard:"Dashboard", mySession:"Ma session",
    rebuyTab:"Recaves", rebuyNone:"Aucune demande en attente.",
    rebuyBroke:"Tu es à sec", rebuyHint:"Offre un sub au streamer pour repartir avec {n} coins.",
    rebuyAsk:"Demander une recave", rebuyPending:"Demande envoyée",
    rebuyPendingHint:"Le streamer va vérifier ton sub et valider.",
    rebuyApprove:"Valider", rebuyCount:"Recaves",
    rebuyStreamerHint:"Vérifie le sub sur Twitch avant de valider. Le joueur repart avec "+REBUY_AMOUNT+" coins.",
    cancelBet:"Annuler mon pari", cancelled:"Pari annulé, mise remboursée.",
    undoResolve:"Annuler le résultat", undoDone:"Résultat annulé, marché rouvert.",
    manageBets:"Gérer les paris", noBets:"Aucun pari sur ce marché.",
    lastBet:"Dernier", noLastBet:"—",
    stake:"Mise", potential:"Gain potentiel", pickOption:"Choisis une option ci-dessus",
    deleteMarket:"Supprimer le marché", deleted:"Marché supprimé, mises remboursées.",
    confirmDelete:"Supprimer ce marché ? Toutes les mises seront remboursées.",
    reopen:"Rouvrir", odds:"Cote", customOdds:"Cote personnalisée",
    example:"100 misés rapportent", totalStaked:"misés",
  },
  en: {
    tagline:"Play money · 100% free", heroSub:"Get your viewers betting live with play money.\nThe best one wins the giveaway.",
    loginHint:"Sign in to create or join a session", loginTwitch:"Sign in with Twitch",
    streamerDesc:"Start a session, create markets, pick the winner.",
    viewerDesc:"Enter the code shared on stream to join in.",
    createSession:"Create a session", codePlaceholder:"CODE",
    markets:"Markets", create:"Create", leaderboard:"Leaderboard", bets:"Bets",
    noMarket:"No markets yet.", noMarketAction:"Create the first one →",
    question:"Question", questionPlaceholder:"e.g. Who wins the next duel?",
    options:"Options & odds", openMarket:"Open market", closeBets:"Close betting",
    goLive:"Go live", endSession:"End stream", copyLink:"Link", copyCode:"Code",
    copied:"Copied", balance:"Balance", rank:"Rank", players:"Players",
    bet:"Place bet", myBet:"My bet", sessionOf:"Session by", streamEnded:"Stream over",
    winner:"Giveaway winner", myRank:"Your rank", backHome:"Back to home",
    waitingLobby:"Waiting for the stream to start", open:"Open", closed:"Closed", resolved:"Settled",
    ended:"Ended", addOption:"Add an option", viewers:"players",
    dashboard:"Dashboard", mySession:"My session",
    rebuyTab:"Rebuys", rebuyNone:"No pending requests.",
    rebuyBroke:"You're out of coins", rebuyHint:"Gift a sub to the streamer to restart with {n} coins.",
    rebuyAsk:"Request a rebuy", rebuyPending:"Request sent",
    rebuyPendingHint:"The streamer will check your sub and approve it.",
    rebuyApprove:"Approve", rebuyCount:"Rebuys",
    rebuyStreamerHint:"Check the sub on Twitch before approving. The player restarts with "+REBUY_AMOUNT+" coins.",
    cancelBet:"Cancel my bet", cancelled:"Bet cancelled, stake refunded.",
    undoResolve:"Undo result", undoDone:"Result undone, market reopened.",
    manageBets:"Manage bets", noBets:"No bets on this market.",
    lastBet:"Last", noLastBet:"—",
    stake:"Stake", potential:"Potential win", pickOption:"Pick an option above",
    deleteMarket:"Delete market", deleted:"Market deleted, stakes refunded.",
    confirmDelete:"Delete this market? Every stake will be refunded.",
    reopen:"Reopen", odds:"Odds", customOdds:"Custom odds",
    example:"100 staked returns", totalStaked:"staked",
  },
  es: {
    tagline:"Dinero ficticio · 100% gratis", heroSub:"Haz que tus viewers apuesten en directo con dinero ficticio.\nEl mejor gana el giveaway.",
    loginHint:"Conéctate para crear o unirte a una sesión", loginTwitch:"Conectarse con Twitch",
    streamerDesc:"Inicia una sesión, crea mercados, elige al ganador.",
    viewerDesc:"Introduce el código compartido en el stream para participar.",
    createSession:"Crear una sesión", codePlaceholder:"CÓDIGO",
    markets:"Mercados", create:"Crear", leaderboard:"Clasificación", bets:"Apuestas",
    noMarket:"Todavía no hay mercados.", noMarketAction:"Crear el primero →",
    question:"Pregunta", questionPlaceholder:"Ej.: ¿Quién gana el próximo duelo?",
    options:"Opciones y cuotas", openMarket:"Abrir mercado", closeBets:"Cerrar apuestas",
    goLive:"Empezar el directo", endSession:"Terminar", copyLink:"Enlace", copyCode:"Código",
    copied:"Copiado", balance:"Saldo", rank:"Puesto", players:"Jugadores",
    bet:"Confirmar apuesta", myBet:"Mi apuesta", sessionOf:"Sesión de", streamEnded:"Stream terminado",
    winner:"Ganador del giveaway", myRank:"Tu puesto", backHome:"Volver al inicio",
    waitingLobby:"Esperando el inicio del directo", open:"Abierto", closed:"Cerrado", resolved:"Resuelto",
    ended:"Terminado", addOption:"Añadir una opción", viewers:"jugadores",
    dashboard:"Panel", mySession:"Mi sesión",
    rebuyTab:"Recargas", rebuyNone:"No hay solicitudes pendientes.",
    rebuyBroke:"Te has quedado sin coins", rebuyHint:"Regala un sub al streamer para volver con {n} coins.",
    rebuyAsk:"Pedir una recarga", rebuyPending:"Solicitud enviada",
    rebuyPendingHint:"El streamer verificará tu sub y la aprobará.",
    rebuyApprove:"Aprobar", rebuyCount:"Recargas",
    rebuyStreamerHint:"Verifica el sub en Twitch antes de aprobar. El jugador vuelve con "+REBUY_AMOUNT+" coins.",
    cancelBet:"Cancelar mi apuesta", cancelled:"Apuesta cancelada, importe devuelto.",
    undoResolve:"Anular resultado", undoDone:"Resultado anulado, mercado reabierto.",
    manageBets:"Gestionar apuestas", noBets:"No hay apuestas en este mercado.",
    lastBet:"Última", noLastBet:"—",
    stake:"Importe", potential:"Ganancia potencial", pickOption:"Elige una opción arriba",
    deleteMarket:"Eliminar mercado", deleted:"Mercado eliminado, importes devueltos.",
    confirmDelete:"¿Eliminar este mercado? Se devolverán todos los importes.",
    reopen:"Reabrir", odds:"Cuota", customOdds:"Cuota personalizada",
    example:"100 apostados devuelven", totalStaked:"apostados",
  }
};

function buildTwitchURL() {
  const state = genId();
  LS.set("bv_state", state);
  return `https://id.twitch.tv/oauth2/authorize?` + new URLSearchParams({
    client_id: TWITCH_CLIENT_ID, redirect_uri: REDIRECT_URI,
    response_type: "token", scope: "user:read:email", state, force_verify: "true",
  });
}
async function fetchTwitchUser(token) {
  const r = await fetch("https://api.twitch.tv/helix/users", {
    headers: { Authorization: `Bearer ${token}`, "Client-Id": TWITCH_CLIENT_ID },
  });
  if (!r.ok) throw new Error("Twitch API error");
  return (await r.json()).data[0];
}

export default function App() {
  const [lang, setLang]             = useState(() => LS.get("bv_lang") || "fr");
  const [twitchUser, setTwitchUser] = useState(() => LS.get("bv_user") || null);
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError]   = useState("");
  const [view, setView]             = useState("home");
  const [sessionCode, setSessionCode] = useState(null);
  const [session, setSession]       = useState(null);
  const [toast, setToast]           = useState(null);
  const unsub = useRef(null);
  const t = T[lang];

  useEffect(() => { getDb(); }, []);

  useEffect(() => {
    const pending = LS.get("bv_pending_token");
    if (pending) {
      LS.del("bv_pending_token");
      setAuthLoading(true);
      fetchTwitchUser(pending).then(u => {
        const user = { id:u.id, login:u.login, displayName:u.display_name, avatar:u.profile_image_url, token:pending };
        setTwitchUser(user); LS.set("bv_user", user); setAuthLoading(false);
      }).catch(() => { setAuthError("Profil Twitch introuvable."); setAuthLoading(false); });
      return;
    }
    const hash = window.location.hash;
    if (!hash.includes("access_token")) return;
    const params = new URLSearchParams(hash.slice(1));
    const token = params.get("access_token");
    const state = params.get("state");
    window.history.replaceState({}, "", window.location.pathname);
    if (!token || state !== LS.get("bv_state")) { setAuthError("Authentification échouée."); return; }
    LS.del("bv_state");
    LS.set("bv_pending_token", token);
    setAuthLoading(true);
    fetchTwitchUser(token).then(u => {
      const user = { id:u.id, login:u.login, displayName:u.display_name, avatar:u.profile_image_url, token };
      LS.del("bv_pending_token");
      setTwitchUser(user); LS.set("bv_user", user); setAuthLoading(false);
    }).catch(() => { setAuthError("Profil Twitch introuvable."); setAuthLoading(false); });
  }, []);

  useEffect(() => {
    const p = new URLSearchParams(window.location.search);
    const j = p.get("join");
    if (j) { LS.set("bv_pending_join", j.toUpperCase()); window.history.replaceState({}, "", window.location.pathname); }
  }, []);
  useEffect(() => {
    if (!twitchUser) return;
    const pending = LS.get("bv_pending_join");
    if (pending) { LS.del("bv_pending_join"); handleJoin(pending); }
  }, [twitchUser]);

  function subscribeSession(code) {
    if (unsub.current) unsub.current();
    unsub.current = onValue(ref(getDb(), `sessions/${code}`), snap => { if (snap.val()) setSession(snap.val()); });
  }
  useEffect(() => () => { if (unsub.current) unsub.current(); }, []);

  function showToast(msg, type="ok") { setToast({msg,type,id:Date.now()}); setTimeout(()=>setToast(null),3400); }

  async function handleCreate() {
    const code = genCode();
    const link = `${window.location.origin}${window.location.pathname}?join=${code}`;
    await set(ref(getDb(), `sessions/${code}`), {
      code, link, streamerLogin:twitchUser.login, streamerName:twitchUser.displayName,
      streamerAvatar:twitchUser.avatar, status:"lobby", createdAt:Date.now(),
      participants:{ [twitchUser.login]:{ login:twitchUser.login, displayName:twitchUser.displayName, avatar:twitchUser.avatar, balance:STARTING_BALANCE, joinedAt:Date.now() } },
      markets:{},
    });
    setSessionCode(code); subscribeSession(code); setView("streamer");
    showToast(`Session ${code} créée`);
  }

  async function handleJoin(code) {
    const snap = await get(ref(getDb(), `sessions/${code}`));
    if (!snap.exists()) return showToast("Code introuvable.", "err");
    const data = snap.val();
    if (data.status === "ended") return showToast("Cette session est terminée.", "err");
    if (!data.participants?.[twitchUser.login]) {
      await set(ref(getDb(), `sessions/${code}/participants/${twitchUser.login}`), {
        login:twitchUser.login, displayName:twitchUser.displayName, avatar:twitchUser.avatar, balance:STARTING_BALANCE, joinedAt:Date.now(),
      });
    }
    setSessionCode(code); subscribeSession(code);
    setView(data.streamerLogin === twitchUser.login ? "streamer" : "viewer");
    showToast(`Session ${code} rejointe`);
  }

  async function handleStartLive() { await update(ref(getDb(),`sessions/${sessionCode}`),{status:"live"}); showToast("Le live a démarré"); }
  async function handleEndSession() { await update(ref(getDb(),`sessions/${sessionCode}`),{status:"ended"}); setView("results"); }

  async function handleCreateMarket(title, options) {
    const id = genId();
    const opts = {};
    options.forEach(({label, odds}) => { const oid=genId(); opts[oid]={id:oid, label, odds, bettors:{}}; });
    await set(ref(getDb(),`sessions/${sessionCode}/markets/${id}`),{id,title,options:opts,status:"open",createdAt:Date.now(),winner:null});
    showToast("Marché ouvert");
  }

  async function handleCloseMarket(marketId) { await update(ref(getDb(),`sessions/${sessionCode}/markets/${marketId}`),{status:"closed"}); }
  async function handleReopenMarket(marketId) { await update(ref(getDb(),`sessions/${sessionCode}/markets/${marketId}`),{status:"open"}); showToast("Paris rouverts"); }

  async function handleResolveMarket(marketId, winOptId) {
    const snap = await get(ref(getDb(),`sessions/${sessionCode}`));
    const s = snap.val();
    const market = s.markets?.[marketId];
    if (!market) return;
    if (market.status === "resolved") return showToast("Déjà résolu. Annule le résultat d'abord.","err");
    const updates = {};
    updates[`sessions/${sessionCode}/markets/${marketId}/status`]="resolved";
    updates[`sessions/${sessionCode}/markets/${marketId}/winner`]=winOptId;
    Object.values(market.options||{}).forEach(opt => {
      const optOdds = opt.odds || 2;
      Object.entries(opt.bettors||{}).forEach(([login,amount]) => {
        const cur = s.participants?.[login]?.balance || 0;
        if (opt.id === winOptId) {
          updates[`sessions/${sessionCode}/participants/${login}/balance`] = +(cur + amount*optOdds).toFixed(2);
          updates[`sessions/${sessionCode}/participants/${login}/lastResult`] = {
            net: +(amount*optOdds - amount).toFixed(2), won: true, marketId, at: Date.now(),
          };
        } else {
          updates[`sessions/${sessionCode}/participants/${login}/lastResult`] = {
            net: -amount, won: false, marketId, at: Date.now(),
          };
        }
      });
    });
    await update(ref(getDb()),updates);
    showToast("Gains distribués");
  }

  async function handleUndoResolve(marketId) {
    const snap = await get(ref(getDb(),`sessions/${sessionCode}`));
    const s = snap.val();
    const market = s.markets?.[marketId];
    if (!market || market.status !== "resolved") return;
    const winOptId = market.winner;
    const updates = {};
    updates[`sessions/${sessionCode}/markets/${marketId}/status`]="closed";
    updates[`sessions/${sessionCode}/markets/${marketId}/winner`]=null;
    Object.values(market.options||{}).forEach(opt => {
      if (opt.id !== winOptId) return;
      const optOdds = opt.odds || 2;
      Object.entries(opt.bettors||{}).forEach(([login,amount]) => {
        const cur = s.participants?.[login]?.balance || 0;
        updates[`sessions/${sessionCode}/participants/${login}/balance`] = +(cur - amount*optOdds).toFixed(2);
      });
    });
    Object.values(market.options||{}).forEach(opt => {
      Object.keys(opt.bettors||{}).forEach(login => {
        if (s.participants?.[login]?.lastResult?.marketId === marketId)
          updates[`sessions/${sessionCode}/participants/${login}/lastResult`] = null;
      });
    });
    await update(ref(getDb()),updates);
    showToast(t.undoDone);
  }

  // ── Supprimer un marché : on rembourse chaque mise, en retirant d'abord les gains déjà versés ──
  async function handleDeleteMarket(marketId) {
    const snap = await get(ref(getDb(),`sessions/${sessionCode}`));
    const s = snap.val();
    const market = s.markets?.[marketId];
    if (!market) return;
    const balances = {};
    const readBal = (login) => balances[login] !== undefined
      ? balances[login] : (balances[login] = s.participants?.[login]?.balance || 0);
    Object.values(market.options||{}).forEach(opt => {
      const optOdds = opt.odds || 2;
      Object.entries(opt.bettors||{}).forEach(([login,amount]) => {
        let b = readBal(login) + amount;
        if (market.status === "resolved" && market.winner === opt.id) b -= amount*optOdds;
        balances[login] = +b.toFixed(2);
      });
    });
    const updates = {};
    updates[`sessions/${sessionCode}/markets/${marketId}`] = null;
    Object.entries(balances).forEach(([login,b]) => {
      updates[`sessions/${sessionCode}/participants/${login}/balance`] = b;
      if (s.participants?.[login]?.lastResult?.marketId === marketId)
        updates[`sessions/${sessionCode}/participants/${login}/lastResult`] = null;
    });
    await update(ref(getDb()),updates);
    showToast(t.deleted);
  }

  async function handleBet(marketId, optionId, amount) {
    const snap = await get(ref(getDb(),`sessions/${sessionCode}`));
    const s = snap.val();
    const participant = s.participants?.[twitchUser.login];
    if (!participant) return showToast("Participant introuvable.","err");
    if (amount>participant.balance) return showToast("Solde insuffisant.","err");
    const market = s.markets?.[marketId];
    if (!market||market.status!=="open") return showToast("Les paris sont fermés.","err");
    if (Object.values(market.options||{}).some(o=>o.bettors?.[twitchUser.login])) return showToast("Tu as déjà parié sur ce marché.","err");
    const optData = market.options[optionId];
    const optOdds = optData?.odds || 2;
    const updates = {};
    updates[`sessions/${sessionCode}/markets/${marketId}/options/${optionId}/bettors/${twitchUser.login}`]=amount;
    updates[`sessions/${sessionCode}/participants/${twitchUser.login}/balance`]=+(participant.balance-amount).toFixed(2);
    await update(ref(getDb()),updates);
    showToast(`${fmt(amount)} misés · gain potentiel ${fmt(amount*optOdds)}`);
  }

  async function handleCancelBet(marketId, login, force=false) {
    const snap = await get(ref(getDb(),`sessions/${sessionCode}`));
    const s = snap.val();
    const market = s.markets?.[marketId];
    if (!market) return;
    if (!force && market.status !== "open") return showToast("Trop tard, les paris sont fermés.","err");
    let opt = null;
    Object.values(market.options||{}).forEach(o => { if (o.bettors?.[login] != null) opt = o; });
    if (!opt) return showToast("Aucun pari à annuler.","err");
    const amount = opt.bettors[login];
    const cur = s.participants?.[login]?.balance || 0;
    let newBalance = cur + amount;
    if (market.status === "resolved" && market.winner === opt.id)
      newBalance = cur - amount*(opt.odds||2) + amount;
    const updates = {};
    updates[`sessions/${sessionCode}/markets/${marketId}/options/${opt.id}/bettors/${login}`] = null;
    updates[`sessions/${sessionCode}/participants/${login}/balance`] = +newBalance.toFixed(2);
    if (s.participants?.[login]?.lastResult?.marketId === marketId)
      updates[`sessions/${sessionCode}/participants/${login}/lastResult`] = null;
    await update(ref(getDb()),updates);
    showToast(t.cancelled);
  }

  async function handleRequestRebuy() {
    const snap = await get(ref(getDb(),`sessions/${sessionCode}`));
    const s = snap.val();
    const p = s.participants?.[twitchUser.login];
    if (!p) return showToast("Participant introuvable.","err");
    if ((p.balance||0) > 0) return showToast("Recave possible uniquement à 0 coin.","err");
    if (s.rebuyRequests?.[twitchUser.login]?.status === "pending")
      return showToast("Ta demande est déjà en attente.","err");
    await set(ref(getDb(),`sessions/${sessionCode}/rebuyRequests/${twitchUser.login}`),{
      login: twitchUser.login, displayName: twitchUser.displayName,
      avatar: twitchUser.avatar, status: "pending", requestedAt: Date.now(),
    });
    showToast("Demande envoyée au streamer");
  }

  async function handleApproveRebuy(login) {
    const snap = await get(ref(getDb(),`sessions/${sessionCode}`));
    const s = snap.val();
    const p = s.participants?.[login];
    if (!p) return showToast("Participant introuvable.","err");
    const updates = {};
    updates[`sessions/${sessionCode}/participants/${login}/balance`] = REBUY_AMOUNT;
    updates[`sessions/${sessionCode}/participants/${login}/rebuys`] = (p.rebuys||0) + 1;
    updates[`sessions/${sessionCode}/rebuyRequests/${login}`] = null;
    await update(ref(getDb()),updates);
    showToast(`${p.displayName} repart avec ${fmtInt(REBUY_AMOUNT)} coins`);
  }

  async function handleRejectRebuy(login) {
    await set(ref(getDb(),`sessions/${sessionCode}/rebuyRequests/${login}`), null);
    showToast("Demande refusée");
  }

  function logout() { LS.del("bv_user"); setTwitchUser(null); setView("home"); setSession(null); setSessionCode(null); if(unsub.current) unsub.current(); }
  function changeLang(code) { setLang(code); LS.set("bv_lang", code); }

  const isStreamer = session?.streamerLogin === twitchUser?.login;

  return (
    <div style={S.root}>
      <style>{CSS}</style>
      <div style={S.bgGlow} />
      <div style={S.bgGrid} />
      {toast && <div key={toast.id} className={`toast toast-${toast.type}`}>{toast.msg}</div>}
      <Nav user={twitchUser} onLogout={logout} onHome={()=>setView("home")} session={session}
        isStreamer={isStreamer} onDash={()=>setView(isStreamer?"streamer":"viewer")}
        lang={lang} onChangeLang={changeLang} t={t} />
      <main style={S.main}>
        {authLoading && <Loader />}
        {authError && <ErrorBanner msg={authError} onDismiss={()=>setAuthError("")} />}
        {view==="home" && !authLoading && <HomePage user={twitchUser} t={t} onLogin={()=>{window.location.href=buildTwitchURL();}} onCreate={handleCreate} onJoin={handleJoin} />}
        {view==="streamer" && session && <StreamerDash session={session} t={t}
          onCreateMarket={handleCreateMarket} onCloseMarket={handleCloseMarket} onReopenMarket={handleReopenMarket}
          onResolveMarket={handleResolveMarket} onUndoResolve={handleUndoResolve} onCancelBet={handleCancelBet}
          onDeleteMarket={handleDeleteMarket} onStartLive={handleStartLive} onEndSession={handleEndSession}
          onApproveRebuy={handleApproveRebuy} onRejectRebuy={handleRejectRebuy} />}
        {view==="viewer" && session && <ViewerDash session={session} user={twitchUser} t={t} onBet={handleBet} onCancelBet={handleCancelBet} onRequestRebuy={handleRequestRebuy} />}
        {view==="results" && session && <ResultsPage session={session} user={twitchUser} t={t} onHome={()=>{setView("home");setSession(null);setSessionCode(null);}} />}
      </main>
    </div>
  );
}

// ─────────────────────────── NAV ───────────────────────────
function Nav({ user, onLogout, onHome, session, isStreamer, onDash, lang, onChangeLang, t }) {
  const mobile = useIsMobile();
  const [langOpen, setLangOpen] = useState(false);
  const boxRef = useRef(null);
  const current = LANGS.find(l=>l.code===lang) || LANGS[0];

  useEffect(() => {
    if (!langOpen) return;
    const fn = (e) => { if (boxRef.current && !boxRef.current.contains(e.target)) setLangOpen(false); };
    document.addEventListener("mousedown", fn);
    return () => document.removeEventListener("mousedown", fn);
  }, [langOpen]);

  return (
    <nav style={{...S.nav, padding: mobile?"10px 14px":"12px 26px"}}>
      <div style={S.navBrand} onClick={onHome}>
        <img src={LOGO} alt="BETterviewer" style={{height:mobile?32:46, width:"auto", objectFit:"contain"}} />
        {session && (
          <div style={S.sessionPill}>
            {session.status==="live" && <span style={S.liveDot}/>}
            <span style={S.sessionPillState}>
              {session.status==="live"?"LIVE":session.status==="lobby"?"LOBBY":t.ended.toUpperCase()}
            </span>
            <span style={S.sessionPillSep}/>
            <span style={S.sessionPillCode}>{session.code}</span>
          </div>
        )}
      </div>
      <div style={S.navRight}>
        {session && <button style={S.navBtn} onClick={onDash}>{isStreamer?t.dashboard:t.mySession}</button>}
        <div ref={boxRef} style={{position:"relative"}}>
          <button style={S.langBtn} onClick={()=>setLangOpen(v=>!v)} aria-expanded={langOpen}>
            <span style={{fontSize:14}}>{current.flag}</span>
            {!mobile && <span>{current.code.toUpperCase()}</span>}
            <span style={{...S.caret, transform: langOpen?"rotate(180deg)":"none"}}>▾</span>
          </button>
          {langOpen && (
            <div style={S.langMenu}>
              {LANGS.map(l=>(
                <button key={l.code}
                  style={{...S.langItem, ...(l.code===lang?S.langItemOn:{})}}
                  onClick={()=>{onChangeLang(l.code); setLangOpen(false);}}>
                  <span style={{fontSize:15}}>{l.flag}</span>
                  <span style={{flex:1,textAlign:"left"}}>{l.name}</span>
                  {l.code===lang && <span style={{color:"var(--gold)"}}>✓</span>}
                </button>
              ))}
            </div>
          )}
        </div>
        {user ? (
          <div style={S.userChip}>
            <img src={user.avatar} style={S.ava} alt="" />
            {!mobile && <span style={S.uname}>{user.displayName}</span>}
            <button style={S.logoutBtn} onClick={onLogout} title="Déconnexion">⏻</button>
          </div>
        ) : <span style={S.guestTxt}>{lang==="fr"?"Non connecté":lang==="es"?"Sin conectar":"Not signed in"}</span>}
      </div>
    </nav>
  );
}

// ─────────────────────────── HOME ───────────────────────────
function HomePage({ user, t, onLogin, onCreate, onJoin }) {
  const [code, setCode] = useState("");
  const mobile = useIsMobile();

  return (
    <div style={S.homeWrap}>
      <section style={S.hero}>
        <div style={S.heroBadge}><Coin size={15}/><span>{t.tagline}</span></div>
        <img src={LOGO} alt="BETterviewer" style={{width:"100%",maxWidth:mobile?250:400,margin:"10px auto -10px",display:"block"}} />
        <img src={COINS_STACK} alt="" style={{width:mobile?124:162,height:"auto",display:"block",margin:0,filter:"drop-shadow(0 12px 32px rgba(245,185,59,.34))"}} />
        <p style={S.heroSub}>{t.heroSub}</p>
      </section>

      {!user ? (
        <div style={S.loginBox}>
          <p style={S.loginHint}>{t.loginHint}</p>
          <button style={S.twitchBtn} onClick={onLogin}><TwitchSVG />{t.loginTwitch}</button>
        </div>
      ) : (
        <div style={{...S.cards2, gridTemplateColumns: mobile?"1fr":"1fr 1fr"}}>
          <div style={S.roleCard}>
            <img src={IMG_STREAMER} alt="Streamer" style={{width:"100%",maxWidth:mobile?196:264,height:"auto",display:"block",margin:"0 auto 4px"}} />
            <p style={S.roleDesc}>{t.streamerDesc}</p>
            <button style={{...S.primaryBtn,width:"100%"}} onClick={onCreate}>{t.createSession}</button>
          </div>
          <div style={S.roleCard}>
            <img src={IMG_VIEWER} alt="Viewer" style={{width:"100%",maxWidth:mobile?196:264,height:"auto",display:"block",margin:"0 auto 4px"}} />
            <p style={S.roleDesc}>{t.viewerDesc}</p>
            <div style={{display:"flex",gap:8,width:"100%"}}>
              <input style={S.codeInput} placeholder={t.codePlaceholder} maxLength={6}
                value={code} onChange={e=>setCode(e.target.value.toUpperCase())}
                onKeyDown={e=>e.key==="Enter"&&onJoin(code)} />
              <button style={S.joinBtn} onClick={()=>onJoin(code)}>GO</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─────────────────────── STREAMER DASH ───────────────────────
function StreamerDash({ session, t, onCreateMarket, onCloseMarket, onReopenMarket, onResolveMarket, onUndoResolve, onCancelBet, onDeleteMarket, onStartLive, onEndSession, onApproveRebuy, onRejectRebuy }) {
  const [tab, setTab]     = useState("markets");
  const [title, setTitle] = useState("");
  const [optOdds, setOptOdds] = useState([
    {label:"Oui", odds:2, custom:""},
    {label:"Non", odds:3, custom:""},
  ]);
  const [copied, setCopied] = useState("");
  const mobile = useIsMobile();
  const markets = Object.values(session.markets||{}).sort((a,b)=>b.createdAt-a.createdAt);
  const participants = Object.values(session.participants||{}).sort((a,b)=>b.balance-a.balance);
  const rebuys = Object.values(session.rebuyRequests||{})
    .filter(r=>r.status==="pending").sort((a,b)=>a.requestedAt-b.requestedAt);

  function copy(val,key){ navigator.clipboard?.writeText(val); setCopied(key); setTimeout(()=>setCopied(""),1800); }
  function submit(){
    if(!title.trim()) return;
    const valid = optOdds.filter(o=>o.label.trim());
    if(valid.length<2) return;
    for(const o of valid){
      const v = o.custom ? parseFloat(o.custom) : o.odds;
      if(!v || v < 1.01) return;
    }
    const options = valid.map(o=>({ label:o.label.trim(), odds: o.custom ? parseFloat(o.custom) : o.odds }));
    onCreateMarket(title.trim(), options);
    setTitle("");
    setOptOdds([{label:"Oui",odds:2,custom:""},{label:"Non",odds:3,custom:""}]);
  }

  return (
    <div style={S.dashWrap}>
      <section style={{...S.topBar, flexDirection: mobile?"column":"row", alignItems: mobile?"stretch":"center"}}>
        <div>
          <div style={S.topCodeLabel}>Code de session</div>
          <div style={{...S.topCode, fontSize: mobile?"34px":"46px"}}>{session.code}</div>
          <div style={S.topMeta}>{participants.length} {t.viewers} · {markets.length} {t.markets.toLowerCase()}</div>
        </div>
        <div style={{...S.topActions, justifyContent: mobile?"flex-start":"flex-end"}}>
          <button style={S.ghostBtn} onClick={()=>copy(session.link,"link")}>{copied==="link"?"✓ "+t.copied:t.copyLink}</button>
          <button style={S.ghostBtn} onClick={()=>copy(session.code,"code")}>{copied==="code"?"✓ "+t.copied:t.copyCode}</button>
          {session.status==="lobby"&&<button style={S.goLiveBtn} onClick={onStartLive}>{t.goLive}</button>}
          {session.status==="live"&&<button style={S.endBtn} onClick={onEndSession}>{t.endSession}</button>}
        </div>
      </section>

      <div style={S.tabs}>
        {[["markets",t.markets],["create",t.create],["rebuy",t.rebuyTab],["lb",t.leaderboard]].map(([k,l])=>(
          <button key={k} style={{...S.tab, ...(tab===k?S.tabOn:{})}} onClick={()=>setTab(k)}>
            <span>{l}</span>
            {k==="rebuy" && rebuys.length>0 && <span style={S.tabDot}>{rebuys.length}</span>}
          </button>
        ))}
      </div>

      {tab==="markets" && (
        <div>
          {markets.length===0 && <Empty msg={t.noMarket} action={t.noMarketAction} onAction={()=>setTab("create")}/>}
          {markets.map(m=>(
            <AdminMarketCard key={m.id} market={m} session={session} t={t}
              onClose={onCloseMarket} onReopen={onReopenMarket} onResolve={onResolveMarket}
              onUndo={onUndoResolve} onCancelBet={onCancelBet} onDelete={onDeleteMarket}/>
          ))}
        </div>
      )}

      {tab==="create" && (
        <div style={S.panel}>
          <h3 style={S.panelH}>{t.create}</h3>
          <label style={S.label} htmlFor="mk-title">{t.question}</label>
          <input id="mk-title" style={S.input} placeholder={t.questionPlaceholder} value={title} onChange={e=>setTitle(e.target.value)}/>
          <div style={{...S.label, marginTop:22}}>{t.options}</div>
          {optOdds.map((o,i)=>{
            const eff = o.custom ? (parseFloat(o.custom)||0) : o.odds;
            return (
              <div key={i} style={S.optEditor}>
                <div style={S.optEditorHead}>
                  <span style={S.optIndex}>{i+1}</span>
                  <input style={{...S.input, flex:1}} value={o.label} placeholder={`Option ${i+1}`}
                    onChange={e=>{const a=[...optOdds];a[i]={...a[i],label:e.target.value};setOptOdds(a);}}/>
                  {optOdds.length>2 && <button style={S.rmBtn} title="Retirer" onClick={()=>setOptOdds(optOdds.filter((_,j)=>j!==i))}>✕</button>}
                </div>
                <div style={S.miniLabel}>{t.odds}</div>
                <div style={S.chipRow}>
                  {[1.20,2,3,5].map(v=>(
                    <button key={v} style={{...S.chipOdds, ...(!o.custom && o.odds===v ? S.chipOddsOn : {})}}
                      onClick={()=>{const a=[...optOdds];a[i]={...a[i],odds:v,custom:""};setOptOdds(a);}}>
                      ×{v.toFixed(2)}
                    </button>
                  ))}
                </div>
                <input style={S.input} type="number" step="0.01" min="1.01" placeholder={t.customOdds+" (1.75…)"}
                  value={o.custom} onChange={e=>{const a=[...optOdds];a[i]={...a[i],custom:e.target.value};setOptOdds(a);}}/>
                <div style={S.optPreview}>
                  {t.example} <b style={{color:"var(--gold)"}}>{fmt(100*eff)}</b> <Coin size={13}/>
                </div>
              </div>
            );
          })}
          {optOdds.length<6 && <button style={S.addBtn} onClick={()=>setOptOdds([...optOdds,{label:"",odds:2,custom:""}])}>+ {t.addOption}</button>}
          <button style={{...S.primaryBtn, width:"100%", marginTop:18}} onClick={submit}>{t.openMarket}</button>
        </div>
      )}

      {tab==="rebuy" && (
        <div style={S.panel}>
          <h3 style={S.panelH}>{t.rebuyTab}</h3>
          <div style={S.notice}>{t.rebuyStreamerHint}</div>
          {rebuys.length===0 && <Empty msg={t.rebuyNone}/>}
          {rebuys.map(r=>{
            const p = session.participants?.[r.login];
            return (
              <div key={r.login} style={S.rebuyRow}>
                <img src={r.avatar} style={S.lbAva} alt="" onError={e=>{e.target.style.visibility="hidden";}}/>
                <div style={{flex:1, minWidth:0}}>
                  <div style={S.rebuyName}>{r.displayName}</div>
                  <div style={S.rebuySub}>
                    {t.rebuyCount} : {p?.rebuys||0} ·{" "}
                    <a href={`https://twitch.tv/${r.login}`} target="_blank" rel="noreferrer" style={S.link}>
                      twitch.tv/{r.login}
                    </a>
                  </div>
                </div>
                <div style={{display:"flex", gap:6, flexShrink:0}}>
                  <button style={S.approveBtn} onClick={()=>onApproveRebuy(r.login)}>{t.rebuyApprove}</button>
                  <button style={S.rmBtn} onClick={()=>onRejectRebuy(r.login)}>✕</button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {tab==="lb" && <Leaderboard participants={participants} t={t}/>}
    </div>
  );
}

function AdminMarketCard({ market, session, t, onClose, onReopen, onResolve, onUndo, onCancelBet, onDelete }) {
  const [showBets, setShowBets] = useState(false);
  const [confirmDel, setConfirmDel] = useState(false);
  const opts = Object.values(market.options||{});
  const allBets = [];
  opts.forEach(o => Object.entries(o.bettors||{}).forEach(([login,amount]) =>
    allBets.push({ login, amount, optLabel:o.label, optId:o.id })));
  const grandTotal = allBets.reduce((s,b)=>s+b.amount,0);

  return (
    <article style={S.mCard}>
      <header style={S.mHeader}>
        <span style={S.mTitle}>{market.title}</span>
        <StatusBadge status={market.status} t={t}/>
      </header>
      <div style={S.mBody}>
        <div style={S.oddsGrid}>
          {opts.map(opt=>{
            const optOdds = opt.odds || 2;
            const betCount = Object.keys(opt.bettors||{}).length;
            const totalBet = Object.values(opt.bettors||{}).reduce((s,v)=>s+v,0);
            const share = grandTotal>0 ? Math.round(totalBet/grandTotal*100) : 0;
            const isWin = market.winner===opt.id;
            return (
              <div key={opt.id} style={{...S.oddsTile, ...(isWin?S.oddsTileWin:{})}}>
                <div style={S.oddsLabel}>{opt.label}</div>
                <div style={{...S.oddsValue, ...(isWin?{color:"var(--green)"}:{})}}>{optOdds.toFixed(2)}</div>
                <div style={S.oddsBarTrack}>
                  <div style={{...S.oddsBarFill, width:`${share}%`, background: isWin?"var(--green)":"var(--gold)"}}/>
                </div>
                <div style={S.oddsMeta}>{fmtInt(totalBet)} {t.totalStaked} · {betCount}</div>
              </div>
            );
          })}
        </div>

        <div style={S.mFoot}>
          <button style={S.linkBtn} onClick={()=>setShowBets(v=>!v)}>
            {showBets?"▾":"▸"} {t.manageBets} ({allBets.length})
          </button>
          <div style={S.mActions}>
            {market.status==="open" && <button style={S.warnBtn} onClick={()=>onClose(market.id)}>{t.closeBets}</button>}
            {market.status==="closed" && (
              <>
                <button style={S.ghostBtnSm} onClick={()=>onReopen(market.id)}>{t.reopen}</button>
                {opts.map(opt=>(
                  <button key={opt.id} style={S.approveBtn} onClick={()=>onResolve(market.id,opt.id)}>✓ {opt.label}</button>
                ))}
              </>
            )}
            {market.status==="resolved" && <button style={S.ghostBtnSm} onClick={()=>onUndo(market.id)}>↩ {t.undoResolve}</button>}
            <button style={S.dangerBtn} onClick={()=>setConfirmDel(true)}>{t.deleteMarket}</button>
          </div>
        </div>

        {confirmDel && (
          <div style={S.confirmBox}>
            <span style={S.confirmTxt}>{t.confirmDelete}</span>
            <div style={{display:"flex",gap:8,flexShrink:0}}>
              <button style={S.ghostBtnSm} onClick={()=>setConfirmDel(false)}>Annuler</button>
              <button style={S.dangerSolid} onClick={()=>{setConfirmDel(false); onDelete(market.id);}}>{t.deleteMarket}</button>
            </div>
          </div>
        )}

        {showBets && (
          <div style={S.betsList}>
            {allBets.length===0 && <div style={S.betsEmpty}>{t.noBets}</div>}
            {allBets.map(b=>{
              const p = session.participants?.[b.login];
              return (
                <div key={b.login+b.optId} style={S.betRow}>
                  <img src={p?.avatar} style={S.betAva} alt="" onError={e=>{e.target.style.visibility="hidden";}}/>
                  <span style={S.betName}>{p?.displayName||b.login}</span>
                  <span style={S.betOpt}>{b.optLabel}</span>
                  <span style={S.betAmt}>{fmtInt(b.amount)}<Coin size={12}/></span>
                  <button style={S.rmBtnSm} title={t.cancelBet} onClick={()=>onCancelBet(market.id,b.login,true)}>✕</button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </article>
  );
}

// ──────────────────────── VIEWER DASH ────────────────────────
function ViewerDash({ session, user, t, onBet, onCancelBet, onRequestRebuy }) {
  const [tab, setTab] = useState("markets");
  const mobile = useIsMobile();
  const me = session.participants?.[user.login];
  const participants = Object.values(session.participants||{}).sort((a,b)=>b.balance-a.balance);
  const rank = participants.findIndex(p=>p.login===user.login)+1;
  const markets = Object.values(session.markets||{}).sort((a,b)=>b.createdAt-a.createdAt);

  const hasPendingBet = markets.some(m =>
    m.status !== "resolved" &&
    Object.values(m.options||{}).some(o => o.bettors?.[user.login])
  );
  const isBroke = (me?.balance ?? 0) <= 0 && !hasPendingBet;
  const rebuyStatus = session.rebuyRequests?.[user.login]?.status;

  return (
    <div style={S.dashWrap}>
      <section style={{...S.viewerBar, flexDirection: mobile?"column":"row"}}>
        <div style={S.viewerLeft}>
          <img src={user.avatar} style={S.bigAva} alt=""/>
          <div style={{minWidth:0}}>
            <div style={S.viewerName}>{user.displayName}</div>
            <div style={S.viewerSub}>{t.sessionOf} <b style={{color:"var(--ink)"}}>{session.streamerName}</b></div>
          </div>
        </div>
        <div style={{...S.statsRow, width: mobile?"100%":"auto"}}>
          <div style={S.balanceBox}>
            <div style={S.statLab}>{t.balance}</div>
            <div style={S.balanceVal}>{fmtInt(me?.balance ?? STARTING_BALANCE)}<Coin size={20}/></div>
          </div>
          <div style={S.statDivider}/>
          <Stat val={`#${rank}`} label={t.rank}/>
          <div style={S.statDivider}/>
          <Stat val={participants.length} label={t.players}/>
        </div>
      </section>

      {session.status==="lobby" && <div style={S.lobbyBanner}><span style={S.lobbyPulse}/>{t.waitingLobby}</div>}

      {session.status!=="ended" && isBroke && (
        <div style={S.rebuyBox}>
          {rebuyStatus==="pending" ? (
            <>
              <div style={S.rebuyTitle}>{t.rebuyPending}</div>
              <div style={S.rebuyHint}>{t.rebuyPendingHint}</div>
            </>
          ) : (
            <>
              <div style={S.rebuyTitle}>{t.rebuyBroke}</div>
              <div style={S.rebuyHint}>{t.rebuyHint.replace("{n}", fmtInt(REBUY_AMOUNT))}</div>
              <button style={{...S.primaryBtn, marginTop:14, width:"100%"}} onClick={onRequestRebuy}>{t.rebuyAsk}</button>
            </>
          )}
        </div>
      )}

      <div style={S.tabs}>
        {[["markets",t.bets],["lb",t.leaderboard]].map(([k,l])=>(
          <button key={k} style={{...S.tab, ...(tab===k?S.tabOn:{})}} onClick={()=>setTab(k)}>{l}</button>
        ))}
      </div>

      {tab==="markets" && (
        <div>
          {markets.length===0 && <Empty msg={t.noMarket}/>}
          {markets.map(m=>(
            <ViewerMarketCard key={m.id} market={m} user={user} balance={me?.balance??0} t={t}
              onBet={onBet} onCancelBet={onCancelBet}/>
          ))}
        </div>
      )}
      {tab==="lb" && <Leaderboard participants={participants} highlightLogin={user.login} t={t}/>}
    </div>
  );
}

function ViewerMarketCard({ market, user, balance, t, onBet, onCancelBet }) {
  const [sel, setSel]     = useState(null);
  const [amount, setAmount] = useState("");
  const opts  = Object.values(market.options||{});
  const myBetOpt = opts.find(o=>o.bettors?.[user.login]);
  const canBet = market.status==="open" && !myBetOpt;
  const myBetAmount = myBetOpt ? (myBetOpt.bettors[user.login]||0) : 0;
  const selOdds = sel ? (opts.find(o=>o.id===sel)?.odds || 0) : 0;
  const stake = parseFloat(amount)||0;
  const tooMuch = stake > balance;

  function submit(){
    if(!sel || !stake || stake<=0 || tooMuch) return;
    onBet(market.id, sel, stake); setSel(null); setAmount("");
  }

  return (
    <article style={S.mCard}>
      <header style={S.mHeader}>
        <span style={S.mTitle}>{market.title}</span>
        <StatusBadge status={market.status} t={t}/>
      </header>
      <div style={S.mBody}>
        <div style={S.oddsGrid}>
          {opts.map(opt=>{
            const isMine = myBetOpt?.id===opt.id;
            const isWin  = market.winner===opt.id;
            const optOdds = opt.odds || 2;
            const isSel = sel===opt.id;
            return (
              <button key={opt.id} disabled={!canBet}
                className={canBet?"odds-live":""}
                style={{...S.oddsTile,
                  ...(isSel?S.oddsTileSel:{}),
                  ...(isMine?S.oddsTileMine:{}),
                  ...(isWin?S.oddsTileWin:{}),
                  cursor: canBet?"pointer":"default"}}
                onClick={()=>canBet && setSel(isSel?null:opt.id)}>
                <div style={S.oddsLabel}>{opt.label}</div>
                <div style={{...S.oddsValue, ...(isWin?{color:"var(--green)"}:isSel?{color:"var(--ink)"}:{})}}>
                  {optOdds.toFixed(2)}
                </div>
                {isMine && <div style={S.oddsMineTag}>{t.myBet} · {fmtInt(myBetAmount)}</div>}
                {isWin && !isMine && <div style={{...S.oddsMineTag, color:"var(--green)"}}>✓</div>}
              </button>
            );
          })}
        </div>

        {canBet && (
          <div style={S.slip}>
            {!sel ? (
              <div style={S.slipEmpty}>{t.pickOption}</div>
            ) : (
              <>
                <div style={S.slipTop}>
                  <span style={S.slipLabel}>{t.stake}</span>
                  <span style={S.slipWin}>{t.potential} <b>{fmt(stake*selOdds)}</b><Coin size={13}/></span>
                </div>
                <input style={{...S.input, ...(tooMuch?S.inputErr:{})}} type="number" min="1" max={balance}
                  placeholder={`max ${fmtInt(balance)}`} value={amount} onChange={e=>setAmount(e.target.value)}/>
                <div style={S.quickRow}>
                  {[10,50,100,250].map(v=>(
                    <button key={v} style={S.quickBtn} disabled={v>balance}
                      onClick={()=>setAmount(String(Math.min(v,balance)))}>{v}</button>
                  ))}
                  <button style={{...S.quickBtn, ...S.quickBtnMax}} onClick={()=>setAmount(String(Math.floor(balance)))}>MAX</button>
                </div>
                <button style={{...S.primaryBtn, width:"100%", marginTop:10, ...(tooMuch||!stake?S.btnDisabled:{})}}
                  disabled={tooMuch||!stake} onClick={submit}>{t.bet}</button>
              </>
            )}
          </div>
        )}

        {myBetOpt && (
          <div style={S.myBetNote}>
            <span>{t.myBet} · <b style={{color:"var(--gold)"}}>{fmtInt(myBetAmount)}</b><Coin size={12}/> → <b>{myBetOpt.label}</b></span>
            {market.status==="open" && (
              <button style={S.cancelBtn} onClick={()=>onCancelBet(market.id,user.login,false)}>{t.cancelBet}</button>
            )}
          </div>
        )}
      </div>
    </article>
  );
}

// ─────────────────────── LEADERBOARD ───────────────────────
function Leaderboard({ participants, highlightLogin, t }) {
  return (
    <div style={S.panel}>
      <h3 style={S.panelH}>{t.leaderboard}</h3>
      <div style={S.lbHead}>
        <span style={{width:34}}/>
        <span style={{flex:1}}/>
        <span style={S.lbHeadCell}>{t.balance}</span>
        <span style={{...S.lbHeadCell, minWidth:66, textAlign:"right"}}>{t.lastBet}</span>
      </div>
      {participants.map((p,i)=>{
        const lr = p.lastResult;
        const medal = i===0?"var(--gold)":i===1?"#c3cde0":i===2?"#c98b52":null;
        return (
          <div key={p.login} style={{...S.lbRow, ...(p.login===highlightLogin?S.lbMe:{})}}>
            <span style={{...S.lbRank, ...(medal?{color:medal, fontWeight:900}:{})}}>{i+1}</span>
            <img src={p.avatar} style={S.lbAva} alt="" onError={e=>{e.target.style.visibility="hidden";}}/>
            <span style={S.lbName}>{p.displayName}</span>
            <span style={S.lbBal}>{fmtInt(p.balance)}<Coin size={13}/></span>
            <span style={{...S.lbLast, color: !lr ? "var(--muted)" : lr.net>=0 ? "var(--green)" : "var(--red)"}}>
              {!lr ? t.noLastBet : `${lr.net>=0?"+":"−"}${fmtInt(Math.abs(lr.net))}`}
            </span>
          </div>
        );
      })}
    </div>
  );
}

function ResultsPage({ session, user, t, onHome }) {
  const sorted = Object.values(session.participants||{}).sort((a,b)=>b.balance-a.balance);
  const winner = sorted[0];
  const myRank = sorted.findIndex(p=>p.login===user?.login)+1;
  return (
    <div style={S.resultsWrap}>
      <h1 style={S.resTitle}>{t.streamEnded}</h1>
      <p style={S.resSub}>{session.code} · {sorted.length} {t.players.toLowerCase()}</p>
      {winner && (
        <div style={S.winCard}>
          <div style={S.crown}>♛</div>
          <img src={winner.avatar} style={S.winAva} alt=""/>
          <div style={S.winName}>{winner.displayName}</div>
          <div style={S.winBal}>{fmtInt(winner.balance)}<Coin size={26}/></div>
          <div style={S.winLabel}>{t.winner}</div>
        </div>
      )}
      {myRank>0 && <p style={S.myRank}>{t.myRank} · <b style={{color:"var(--gold)"}}>#{myRank}</b> / {sorted.length}</p>}
      <div style={{maxWidth:540, margin:"22px auto"}}>
        <Leaderboard participants={sorted} highlightLogin={user?.login} t={t}/>
      </div>
      <button style={{...S.primaryBtn, margin:"0 auto 60px", display:"block"}} onClick={onHome}>{t.backHome}</button>
    </div>
  );
}

// ─────────────────────── PRIMITIVES ───────────────────────
function StatusBadge({ status, t }) {
  if (status==="open")     return <span style={{...S.badge, ...S.badgeOpen}}><span style={S.badgeDot}/>{t.open}</span>;
  if (status==="closed")   return <span style={{...S.badge, ...S.badgeClosed}}>{t.closed}</span>;
  if (status==="resolved") return <span style={{...S.badge, ...S.badgeResolved}}>{t.resolved}</span>;
  return null;
}
function Stat({ val, label }) {
  return <div style={S.statBox}><div style={S.statVal}>{val}</div><div style={S.statLab}>{label}</div></div>;
}
function Empty({ msg, action, onAction }) {
  return <div style={S.empty}>{msg}{action && <span style={S.emptyLink} onClick={onAction}> {action}</span>}</div>;
}
function Loader() { return <div style={S.loader}><span className="spin">◈</span></div>; }
function ErrorBanner({ msg, onDismiss }) {
  return <div style={S.errBanner}><span>{msg}</span><button style={S.errClose} onClick={onDismiss}>✕</button></div>;
}
function Coin({ size=16 }) {
  return <img src={COIN} alt="" style={{width:size,height:size,objectFit:"contain",verticalAlign:"-0.14em",marginLeft:4,display:"inline-block"}} />;
}
function TwitchSVG() {
  return <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" style={{marginRight:9,flexShrink:0}}>
    <path d="M11.571 4.714h1.715v5.143H11.57zm4.715 0H18v5.143h-1.714zM6 0L1.714 4.286v15.428h5.143V24l4.286-4.286h3.428L22.286 12V0zm14.571 11.143l-3.428 3.428h-3.429l-3 3v-3H6.857V1.714h13.714z"/>
  </svg>;
}

// ─────────────────────────── STYLES ───────────────────────────
const S = {
  root:{ minHeight:"100vh", background:"var(--bg)", color:"var(--ink)", fontFamily:"var(--font-body)", position:"relative" },
  bgGlow:{ position:"fixed", inset:0, pointerEvents:"none", zIndex:0,
    background:"radial-gradient(1200px 700px at 50% -6%, #24357a 0%, #14215a 30%, #0a1233 58%, var(--bg) 85%)" },
  bgGrid:{ position:"fixed", inset:0, pointerEvents:"none", zIndex:0, opacity:.5,
    backgroundImage:"linear-gradient(rgba(255,255,255,.028) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.028) 1px, transparent 1px)",
    backgroundSize:"58px 58px",
    maskImage:"radial-gradient(760px 460px at 50% 0%, #000 0%, transparent 72%)",
    WebkitMaskImage:"radial-gradient(760px 460px at 50% 0%, #000 0%, transparent 72%)" },

  nav:{ display:"flex", alignItems:"center", justifyContent:"space-between", gap:12, flexWrap:"wrap",
    borderBottom:"1px solid var(--line)", background:"rgba(6,11,31,.9)", backdropFilter:"blur(18px)",
    position:"sticky", top:0, zIndex:60 },
  navBrand:{ display:"flex", alignItems:"center", gap:12, cursor:"pointer" },
  sessionPill:{ display:"flex", alignItems:"center", gap:8, padding:"5px 12px", borderRadius:8,
    background:"var(--surface-2)", border:"1px solid var(--line)" },
  sessionPillState:{ fontSize:10, fontWeight:800, letterSpacing:".12em", color:"var(--muted)" },
  sessionPillSep:{ width:1, height:11, background:"var(--line-strong)" },
  sessionPillCode:{ fontFamily:"var(--font-mono)", fontWeight:800, fontSize:12, color:"var(--gold)", letterSpacing:".1em" },
  liveDot:{ width:7, height:7, borderRadius:"50%", background:"var(--green)", boxShadow:"0 0 9px var(--green)" },
  navRight:{ display:"flex", alignItems:"center", gap:8 },
  navBtn:{ background:"var(--surface-2)", border:"1px solid var(--line-strong)", color:"var(--ink)",
    padding:"8px 15px", borderRadius:9, cursor:"pointer", fontSize:12.5, fontWeight:700,
    fontFamily:"var(--font-body)", letterSpacing:".01em" },
  langBtn:{ display:"flex", alignItems:"center", gap:6, background:"var(--surface-2)",
    border:"1px solid var(--line-strong)", color:"var(--ink)", padding:"8px 11px", borderRadius:9,
    cursor:"pointer", fontSize:12, fontWeight:800, fontFamily:"var(--font-body)", letterSpacing:".04em" },
  caret:{ fontSize:9, color:"var(--muted)", transition:"transform .18s ease" },
  langMenu:{ position:"absolute", top:"calc(100% + 7px)", right:0, minWidth:172, zIndex:80,
    background:"var(--surface-hi)", border:"1px solid var(--line-strong)", borderRadius:12, padding:5,
    boxShadow:"0 18px 44px rgba(0,0,0,.55)" },
  langItem:{ display:"flex", alignItems:"center", gap:10, width:"100%", background:"none", border:"none",
    color:"var(--ink-dim)", padding:"10px 11px", borderRadius:8, cursor:"pointer", fontSize:13,
    fontWeight:600, fontFamily:"var(--font-body)" },
  langItemOn:{ background:"rgba(245,185,59,.12)", color:"var(--ink)" },
  userChip:{ display:"flex", alignItems:"center", gap:9, background:"var(--surface-2)",
    border:"1px solid var(--line-strong)", borderRadius:26, padding:"3px 11px 3px 3px" },
  ava:{ width:29, height:29, borderRadius:"50%", objectFit:"cover", border:"2px solid var(--violet)" },
  uname:{ fontSize:12.5, fontWeight:700 },
  logoutBtn:{ background:"none", border:"none", color:"var(--muted)", cursor:"pointer", fontSize:14, padding:0, lineHeight:1 },
  guestTxt:{ fontSize:12.5, color:"var(--muted)" },

  main:{ maxWidth:1000, margin:"0 auto", padding:"clamp(18px,4vw,36px) clamp(16px,3vw,22px)", position:"relative", zIndex:1 },

  homeWrap:{ maxWidth:720, margin:"0 auto" },
  hero:{ textAlign:"center", padding:"26px 0 22px", display:"flex", flexDirection:"column", alignItems:"center", gap:2 },
  heroBadge:{ display:"inline-flex", alignItems:"center", gap:7, fontSize:11.5, fontWeight:700,
    background:"rgba(245,185,59,.1)", border:"1px solid rgba(245,185,59,.32)", color:"var(--gold)",
    padding:"7px 15px", borderRadius:22, letterSpacing:".05em" },
  heroSub:{ fontSize:15, color:"var(--ink-dim)", lineHeight:1.75, margin:"18px auto 0", maxWidth:430, whiteSpace:"pre-line" },
  loginBox:{ textAlign:"center", padding:"22px 0 40px" },
  loginHint:{ color:"var(--ink-dim)", fontSize:14, marginBottom:20 },
  twitchBtn:{ display:"inline-flex", alignItems:"center", background:"var(--violet)", color:"#fff", border:"none",
    borderRadius:11, padding:"15px 34px", fontSize:14.5, fontWeight:800, cursor:"pointer",
    fontFamily:"var(--font-body)", letterSpacing:".02em", boxShadow:"0 12px 30px rgba(124,58,237,.34)" },

  cards2:{ display:"grid", gap:18, alignItems:"stretch" },
  roleCard:{ background:"var(--surface)", border:"1px solid var(--line)", borderRadius:18, padding:22,
    display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"space-between", gap:14,
    boxShadow:"var(--shadow)" },
  roleDesc:{ fontSize:13, color:"var(--ink-dim)", lineHeight:1.65, textAlign:"center", margin:0, flex:1 },

  primaryBtn:{ background:"linear-gradient(180deg,#8b5cf6,#6d28d9)", border:"none", color:"#fff", borderRadius:11,
    padding:"13px 24px", fontSize:13.5, fontWeight:800, cursor:"pointer", fontFamily:"var(--font-body)",
    letterSpacing:".02em", boxShadow:"0 8px 22px rgba(109,40,217,.38)" },
  btnDisabled:{ opacity:.42, cursor:"not-allowed", boxShadow:"none" },
  codeInput:{ flex:1, minWidth:0, background:"var(--field)", border:"1px solid var(--line-strong)", borderRadius:11,
    color:"var(--ink)", padding:"13px 15px", fontSize:17, fontFamily:"var(--font-mono)", fontWeight:700,
    letterSpacing:".22em", outline:"none", textTransform:"uppercase" },
  joinBtn:{ background:"var(--gold)", border:"none", color:"#1a1206", borderRadius:11, padding:"13px 21px",
    cursor:"pointer", fontWeight:900, fontSize:14, fontFamily:"var(--font-body)", letterSpacing:".06em" },

  dashWrap:{ maxWidth:780, margin:"0 auto" },
  topBar:{ display:"flex", justifyContent:"space-between", gap:18, background:"var(--surface)",
    border:"1px solid var(--line)", borderRadius:18, padding:"22px 24px", marginBottom:20, boxShadow:"var(--shadow)" },
  topCodeLabel:{ fontSize:10, fontWeight:700, letterSpacing:".14em", textTransform:"uppercase", color:"var(--muted)" },
  topCode:{ fontFamily:"var(--font-mono)", fontWeight:800, color:"var(--gold)", letterSpacing:".14em", lineHeight:1.15, margin:"4px 0 6px" },
  topMeta:{ fontSize:12.5, color:"var(--ink-dim)" },
  topActions:{ display:"flex", gap:8, flexWrap:"wrap", alignItems:"center" },
  ghostBtn:{ background:"var(--surface-2)", border:"1px solid var(--line-strong)", color:"var(--ink-dim)",
    padding:"10px 15px", borderRadius:9, cursor:"pointer", fontSize:12, fontWeight:700, fontFamily:"var(--font-body)" },
  ghostBtnSm:{ background:"var(--surface-2)", border:"1px solid var(--line-strong)", color:"var(--ink-dim)",
    padding:"8px 13px", borderRadius:8, cursor:"pointer", fontSize:11.5, fontWeight:700, fontFamily:"var(--font-body)" },
  goLiveBtn:{ background:"var(--green)", border:"none", color:"#04210f", padding:"10px 19px", borderRadius:9,
    cursor:"pointer", fontSize:12.5, fontWeight:900, fontFamily:"var(--font-body)", letterSpacing:".02em",
    boxShadow:"0 8px 20px rgba(52,211,153,.26)" },
  endBtn:{ background:"var(--red)", border:"none", color:"#2b0707", padding:"10px 19px", borderRadius:9,
    cursor:"pointer", fontSize:12.5, fontWeight:900, fontFamily:"var(--font-body)", letterSpacing:".02em" },

  tabs:{ display:"flex", gap:4, marginBottom:18, background:"var(--surface-2)", border:"1px solid var(--line)",
    borderRadius:13, padding:4, flexWrap:"wrap" },
  tab:{ flex:1, minWidth:88, background:"none", border:"none", color:"var(--muted)", padding:"11px 12px",
    cursor:"pointer", fontSize:12.5, fontWeight:700, borderRadius:10, display:"flex", alignItems:"center",
    justifyContent:"center", gap:6, fontFamily:"var(--font-body)", letterSpacing:".02em" },
  tabOn:{ background:"var(--surface-hi)", color:"var(--ink)", boxShadow:"inset 0 0 0 1px var(--line-strong)" },
  tabDot:{ display:"inline-flex", alignItems:"center", justifyContent:"center", minWidth:18, height:18,
    fontSize:10.5, fontWeight:900, color:"#2b0707", background:"var(--red)", borderRadius:9, padding:"0 5px",
    fontFamily:"var(--font-mono)" },

  panel:{ background:"var(--surface)", border:"1px solid var(--line)", borderRadius:18,
    padding:"clamp(18px,4vw,24px)", boxShadow:"var(--shadow)" },
  panelH:{ fontSize:13, fontWeight:800, margin:"0 0 18px", letterSpacing:".1em", textTransform:"uppercase", color:"var(--ink-dim)" },
  label:{ display:"block", fontSize:10.5, color:"var(--muted)", textTransform:"uppercase", letterSpacing:".13em",
    marginBottom:8, fontWeight:700 },
  miniLabel:{ fontSize:10, color:"var(--muted)", textTransform:"uppercase", letterSpacing:".13em", marginBottom:8, fontWeight:700 },
  input:{ width:"100%", background:"var(--field)", border:"1px solid var(--line-strong)", borderRadius:10,
    color:"var(--ink)", padding:"12px 14px", fontSize:13.5, fontFamily:"var(--font-body)", outline:"none",
    boxSizing:"border-box" },
  inputErr:{ borderColor:"var(--red)" },
  notice:{ fontSize:12, color:"var(--ink-dim)", background:"var(--field)", border:"1px solid var(--line)",
    borderRadius:10, padding:"12px 14px", marginBottom:16, lineHeight:1.65 },

  optEditor:{ background:"var(--field)", border:"1px solid var(--line)", borderRadius:13, padding:15, marginBottom:11 },
  optEditorHead:{ display:"flex", gap:9, alignItems:"center", marginBottom:13 },
  optIndex:{ width:25, height:25, flexShrink:0, borderRadius:7, background:"var(--surface-hi)",
    border:"1px solid var(--line-strong)", color:"var(--gold)", display:"flex", alignItems:"center",
    justifyContent:"center", fontSize:11.5, fontWeight:800, fontFamily:"var(--font-mono)" },
  chipRow:{ display:"flex", gap:7, flexWrap:"wrap", marginBottom:10 },
  chipOdds:{ background:"var(--surface-hi)", border:"1px solid var(--line-strong)", color:"var(--ink-dim)",
    padding:"9px 15px", borderRadius:9, cursor:"pointer", fontSize:13, fontWeight:800,
    fontFamily:"var(--font-mono)", letterSpacing:".02em" },
  chipOddsOn:{ background:"var(--gold)", borderColor:"var(--gold)", color:"#1a1206" },
  optPreview:{ fontSize:12, color:"var(--ink-dim)", marginTop:9 },
  addBtn:{ background:"none", border:"1px dashed var(--line-strong)", color:"var(--muted)", padding:11,
    borderRadius:10, cursor:"pointer", width:"100%", fontSize:12.5, fontWeight:700, fontFamily:"var(--font-body)" },
  rmBtn:{ background:"rgba(248,113,113,.1)", border:"1px solid rgba(248,113,113,.3)", color:"var(--red)",
    borderRadius:9, padding:"0 14px", cursor:"pointer", fontSize:13, flexShrink:0, height:41 },
  rmBtnSm:{ background:"rgba(248,113,113,.1)", border:"1px solid rgba(248,113,113,.3)", color:"var(--red)",
    borderRadius:7, padding:"5px 9px", cursor:"pointer", fontSize:11, flexShrink:0 },

  // ── Carte de marché ──
  mCard:{ background:"var(--surface)", border:"1px solid var(--line)", borderRadius:18, marginBottom:15,
    overflow:"hidden", boxShadow:"var(--shadow)" },
  mHeader:{ display:"flex", justifyContent:"space-between", alignItems:"center", gap:12, padding:"14px 18px",
    background:"var(--surface-2)", borderBottom:"1px solid var(--line)", borderLeft:"3px solid var(--gold)" },
  mTitle:{ fontSize:14.5, fontWeight:800, flex:1, lineHeight:1.45, letterSpacing:"-.005em" },
  mBody:{ padding:18 },
  oddsGrid:{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(118px,1fr))", gap:10 },
  oddsTile:{ background:"var(--tile)", border:"1px solid var(--line-strong)", borderRadius:13,
    padding:"13px 11px", textAlign:"center", color:"var(--ink)", fontFamily:"var(--font-body)",
    transition:"border-color .15s, background .15s, transform .12s", display:"block", width:"100%" },
  oddsTileSel:{ background:"rgba(245,185,59,.14)", borderColor:"var(--gold)", transform:"translateY(-2px)",
    boxShadow:"0 0 0 3px rgba(245,185,59,.16)" },
  oddsTileMine:{ borderColor:"var(--violet)", background:"rgba(139,92,246,.13)" },
  oddsTileWin:{ borderColor:"var(--green)", background:"rgba(52,211,153,.12)" },
  oddsLabel:{ fontSize:12, color:"var(--ink-dim)", fontWeight:700, marginBottom:6, lineHeight:1.3,
    overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap", fontFamily:"var(--font-cond)", letterSpacing:".02em" },
  oddsValue:{ fontSize:25, fontWeight:800, color:"var(--gold)", lineHeight:1, fontFamily:"var(--font-mono)",
    fontVariantNumeric:"tabular-nums", letterSpacing:"-.02em" },
  oddsBarTrack:{ height:3, background:"var(--line-strong)", borderRadius:2, marginTop:9, overflow:"hidden" },
  oddsBarFill:{ height:"100%", borderRadius:2, transition:"width .4s ease" },
  oddsMeta:{ fontSize:10, color:"var(--muted)", marginTop:7, fontFamily:"var(--font-mono)" },
  oddsMineTag:{ fontSize:10, color:"var(--violet-lt)", marginTop:7, fontWeight:800, letterSpacing:".04em" },

  slip:{ marginTop:15, background:"var(--field)", border:"1px solid var(--line-strong)", borderRadius:13, padding:15 },
  slipEmpty:{ fontSize:12.5, color:"var(--muted)", textAlign:"center", padding:"7px 0" },
  slipTop:{ display:"flex", justifyContent:"space-between", alignItems:"baseline", marginBottom:9, flexWrap:"wrap", gap:7 },
  slipLabel:{ fontSize:10.5, color:"var(--muted)", textTransform:"uppercase", letterSpacing:".13em", fontWeight:700 },
  slipWin:{ fontSize:12, color:"var(--ink-dim)" },
  quickRow:{ display:"flex", gap:7, marginTop:9 },
  quickBtn:{ flex:1, background:"var(--surface-hi)", border:"1px solid var(--line-strong)", color:"var(--ink-dim)",
    borderRadius:9, padding:"10px 7px", cursor:"pointer", fontSize:12, fontWeight:800, fontFamily:"var(--font-mono)" },
  quickBtnMax:{ color:"var(--gold)", borderColor:"rgba(245,185,59,.42)" },

  mFoot:{ display:"flex", justifyContent:"space-between", alignItems:"center", marginTop:15, flexWrap:"wrap", gap:10 },
  mActions:{ display:"flex", gap:7, flexWrap:"wrap" },
  linkBtn:{ background:"none", border:"none", color:"var(--muted)", cursor:"pointer", fontSize:11.5, padding:0,
    fontWeight:700, fontFamily:"var(--font-body)" },
  warnBtn:{ background:"rgba(245,185,59,.1)", border:"1px solid rgba(245,185,59,.38)", color:"var(--gold)",
    padding:"8px 13px", borderRadius:8, cursor:"pointer", fontSize:11.5, fontWeight:800, fontFamily:"var(--font-body)" },
  approveBtn:{ background:"rgba(52,211,153,.11)", border:"1px solid rgba(52,211,153,.38)", color:"var(--green)",
    padding:"8px 13px", borderRadius:8, cursor:"pointer", fontSize:11.5, fontWeight:800, fontFamily:"var(--font-body)" },
  dangerBtn:{ background:"none", border:"1px solid rgba(248,113,113,.26)", color:"rgba(248,113,113,.85)",
    padding:"8px 13px", borderRadius:8, cursor:"pointer", fontSize:11.5, fontWeight:700, fontFamily:"var(--font-body)" },
  dangerSolid:{ background:"var(--red)", border:"none", color:"#2b0707", padding:"8px 14px", borderRadius:8,
    cursor:"pointer", fontSize:11.5, fontWeight:900, fontFamily:"var(--font-body)" },
  confirmBox:{ marginTop:13, background:"rgba(248,113,113,.08)", border:"1px solid rgba(248,113,113,.32)",
    borderRadius:11, padding:"13px 15px", display:"flex", justifyContent:"space-between", alignItems:"center",
    gap:12, flexWrap:"wrap" },
  confirmTxt:{ fontSize:12.5, color:"#fca5a5", lineHeight:1.5 },

  betsList:{ marginTop:14, borderTop:"1px solid var(--line)", paddingTop:12 },
  betsEmpty:{ fontSize:12, color:"var(--muted)", textAlign:"center", padding:"12px 0" },
  betRow:{ display:"flex", alignItems:"center", gap:10, padding:"9px 0", borderBottom:"1px solid var(--line)" },
  betAva:{ width:26, height:26, borderRadius:"50%", objectFit:"cover", flexShrink:0 },
  betName:{ fontSize:12.5, fontWeight:700, flex:1, minWidth:0, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" },
  betOpt:{ fontSize:10.5, color:"var(--ink-dim)", background:"var(--surface-hi)", padding:"3px 9px",
    borderRadius:11, whiteSpace:"nowrap", fontFamily:"var(--font-cond)", fontWeight:700 },
  betAmt:{ fontSize:12, fontWeight:800, color:"var(--gold)", whiteSpace:"nowrap", fontFamily:"var(--font-mono)" },

  badge:{ display:"inline-flex", alignItems:"center", gap:6, fontSize:10, padding:"5px 11px", borderRadius:20,
    whiteSpace:"nowrap", fontWeight:800, letterSpacing:".1em", textTransform:"uppercase", fontFamily:"var(--font-body)" },
  badgeDot:{ width:5, height:5, borderRadius:"50%", background:"currentColor" },
  badgeOpen:{ color:"var(--green)", background:"rgba(52,211,153,.13)", border:"1px solid rgba(52,211,153,.32)" },
  badgeClosed:{ color:"var(--gold)", background:"rgba(245,185,59,.12)", border:"1px solid rgba(245,185,59,.3)" },
  badgeResolved:{ color:"var(--muted)", background:"var(--surface-hi)", border:"1px solid var(--line-strong)" },

  myBetNote:{ marginTop:14, fontSize:12.5, color:"var(--ink-dim)", background:"rgba(139,92,246,.1)",
    border:"1px solid rgba(139,92,246,.28)", borderRadius:11, padding:"11px 15px",
    display:"flex", justifyContent:"space-between", alignItems:"center", gap:11, flexWrap:"wrap" },
  cancelBtn:{ background:"rgba(248,113,113,.1)", border:"1px solid rgba(248,113,113,.32)", color:"var(--red)",
    padding:"7px 13px", borderRadius:8, cursor:"pointer", fontSize:11.5, fontWeight:700,
    whiteSpace:"nowrap", fontFamily:"var(--font-body)" },

  viewerBar:{ display:"flex", justifyContent:"space-between", alignItems:"center", background:"var(--surface)",
    border:"1px solid var(--line)", borderRadius:18, padding:"18px 22px", marginBottom:18, gap:18, boxShadow:"var(--shadow)" },
  viewerLeft:{ display:"flex", alignItems:"center", gap:14, minWidth:0 },
  bigAva:{ width:48, height:48, borderRadius:"50%", border:"2px solid var(--violet)", flexShrink:0 },
  viewerName:{ fontSize:17, fontWeight:800, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" },
  viewerSub:{ fontSize:12.5, color:"var(--muted)", marginTop:3 },
  statsRow:{ display:"flex", gap:16, alignItems:"center", justifyContent:"space-between" },
  statDivider:{ width:1, alignSelf:"stretch", background:"var(--line)" },
  statBox:{ textAlign:"center" },
  statVal:{ fontSize:19, fontWeight:800, fontFamily:"var(--font-mono)", fontVariantNumeric:"tabular-nums" },
  statLab:{ fontSize:9.5, color:"var(--muted)", textTransform:"uppercase", letterSpacing:".13em", marginTop:3, fontWeight:700 },
  balanceBox:{ textAlign:"center" },
  balanceVal:{ fontSize:23, fontWeight:800, color:"var(--gold)", fontFamily:"var(--font-mono)",
    fontVariantNumeric:"tabular-nums", marginTop:2 },

  lobbyBanner:{ display:"flex", alignItems:"center", justifyContent:"center", gap:9,
    background:"rgba(139,92,246,.1)", border:"1px solid rgba(139,92,246,.28)", borderRadius:11,
    padding:"13px 18px", fontSize:13, color:"var(--violet-lt)", marginBottom:18, fontWeight:600 },
  lobbyPulse:{ width:7, height:7, borderRadius:"50%", background:"var(--violet-lt)" },

  rebuyBox:{ background:"linear-gradient(140deg, rgba(245,185,59,.13), rgba(139,92,246,.1))",
    border:"1px solid rgba(245,185,59,.38)", borderRadius:16, padding:"20px 22px", marginBottom:18, textAlign:"center" },
  rebuyTitle:{ fontSize:15.5, fontWeight:800, color:"var(--gold)", marginBottom:7, letterSpacing:".01em" },
  rebuyHint:{ fontSize:13, color:"var(--ink-dim)", lineHeight:1.65 },
  rebuyRow:{ display:"flex", alignItems:"center", gap:12, padding:"13px 0", borderBottom:"1px solid var(--line)", flexWrap:"wrap" },
  rebuyName:{ fontSize:13.5, fontWeight:700 },
  rebuySub:{ fontSize:11.5, color:"var(--muted)", marginTop:3 },
  link:{ color:"var(--violet-lt)", textDecoration:"none" },

  lbHead:{ display:"flex", alignItems:"center", gap:10, padding:"0 0 9px", borderBottom:"1px solid var(--line)" },
  lbHeadCell:{ fontSize:9.5, color:"var(--muted)", textTransform:"uppercase", letterSpacing:".13em", fontWeight:700 },
  lbRow:{ display:"flex", alignItems:"center", gap:10, padding:"11px 0", borderBottom:"1px solid var(--line)" },
  lbMe:{ background:"rgba(139,92,246,.1)", borderRadius:11, padding:"11px 11px", margin:"0 -11px",
    borderBottom:"1px solid transparent" },
  lbRank:{ width:24, textAlign:"center", flexShrink:0, fontSize:13, fontWeight:700, color:"var(--muted)",
    fontFamily:"var(--font-mono)" },
  lbAva:{ width:31, height:31, borderRadius:"50%", objectFit:"cover", flexShrink:0 },
  lbName:{ flex:1, fontSize:13.5, fontWeight:700, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap", minWidth:0 },
  lbBal:{ fontSize:13.5, fontWeight:800, color:"var(--gold)", whiteSpace:"nowrap", fontFamily:"var(--font-mono)",
    fontVariantNumeric:"tabular-nums" },
  lbLast:{ fontSize:12, fontWeight:800, whiteSpace:"nowrap", minWidth:66, textAlign:"right",
    fontFamily:"var(--font-mono)", fontVariantNumeric:"tabular-nums" },

  resultsWrap:{ maxWidth:600, margin:"0 auto", textAlign:"center" },
  resTitle:{ fontSize:"clamp(29px,7vw,44px)", fontWeight:800, margin:"30px 0 8px", letterSpacing:"-.02em" },
  resSub:{ fontSize:14, color:"var(--muted)", marginBottom:32, fontFamily:"var(--font-mono)", letterSpacing:".06em" },
  winCard:{ background:"linear-gradient(160deg, rgba(245,185,59,.15), rgba(139,92,246,.12))",
    border:"1px solid rgba(245,185,59,.42)", borderRadius:22, padding:"clamp(22px,5vw,34px) 24px",
    marginBottom:26, boxShadow:"0 20px 52px rgba(0,0,0,.45)" },
  crown:{ fontSize:34, color:"var(--gold)", marginBottom:10, lineHeight:1 },
  winAva:{ width:78, height:78, borderRadius:"50%", border:"3px solid var(--gold)", marginBottom:13 },
  winName:{ fontSize:"clamp(20px,5vw,27px)", fontWeight:800, marginBottom:9 },
  winBal:{ fontSize:"clamp(24px,6vw,32px)", fontWeight:800, color:"var(--gold)", marginBottom:11,
    fontFamily:"var(--font-mono)", fontVariantNumeric:"tabular-nums" },
  winLabel:{ fontSize:10.5, color:"var(--green)", letterSpacing:".18em", textTransform:"uppercase", fontWeight:800 },
  myRank:{ fontSize:15, color:"var(--ink-dim)", marginBottom:10 },

  empty:{ textAlign:"center", color:"var(--muted)", padding:"40px 0", fontSize:13.5 },
  emptyLink:{ color:"var(--gold)", cursor:"pointer", fontWeight:700 },
  loader:{ textAlign:"center", color:"var(--gold)", padding:60, fontSize:24 },
  errBanner:{ background:"rgba(248,113,113,.12)", border:"1px solid rgba(248,113,113,.42)", borderRadius:11,
    padding:"13px 17px", color:"#fca5a5", fontSize:13.5, marginBottom:18,
    display:"flex", justifyContent:"space-between", alignItems:"center", gap:12 },
  errClose:{ background:"none", border:"none", color:"#fca5a5", cursor:"pointer", fontSize:15 },
};

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Archivo:wght@400;500;600;700;800;900&family=Archivo+Narrow:wght@500;600;700&family=JetBrains+Mono:wght@500;700;800&display=swap');

:root{
  --bg:#060b1f;
  --surface:rgba(16,25,55,.82);
  --surface-2:rgba(22,33,70,.72);
  --surface-hi:rgba(31,45,90,.85);
  --tile:rgba(12,20,46,.86);
  --field:rgba(9,15,36,.8);
  --line:rgba(255,255,255,.075);
  --line-strong:rgba(255,255,255,.15);
  --ink:#eef1fb;
  --ink-dim:#a6b0d0;
  --muted:#6f7ba3;
  --gold:#f5b93b;
  --violet:#8b5cf6;
  --violet-lt:#c4b5fd;
  --green:#34d399;
  --red:#f87171;
  --shadow:0 14px 38px rgba(0,0,0,.4);
  --font-body:'Archivo','Trebuchet MS',system-ui,sans-serif;
  --font-cond:'Archivo Narrow','Archivo',system-ui,sans-serif;
  --font-mono:'JetBrains Mono',ui-monospace,monospace;
}

*{box-sizing:border-box;}
html,body{margin:0;background:#060b1f;}
body{font-family:var(--font-body);-webkit-font-smoothing:antialiased;}
h1,h2,h3{text-wrap:balance;}

input,button,textarea,select{font-family:inherit;}
input::placeholder{color:#5c6890;}
input:focus,textarea:focus{border-color:var(--gold)!important;box-shadow:0 0 0 3px rgba(245,185,59,.16);}
input[type=number]::-webkit-outer-spin-button,
input[type=number]::-webkit-inner-spin-button{-webkit-appearance:none;margin:0;}
input[type=number]{-moz-appearance:textfield;}

button{transition:filter .15s ease, transform .12s ease;}
button:not(:disabled):hover{filter:brightness(1.12);}
button:not(:disabled):active{transform:translateY(1px);}
button:disabled{opacity:.4;cursor:not-allowed;}
a{color:var(--violet-lt);}
:focus-visible{outline:2px solid var(--gold);outline-offset:2px;}

.odds-live:hover{border-color:var(--gold)!important;background:rgba(245,185,59,.09)!important;}

.toast{position:fixed;bottom:22px;right:22px;left:auto;max-width:min(340px,calc(100vw - 44px));
  padding:13px 18px;border-radius:12px;font-size:13.5px;font-weight:600;z-index:9999;
  animation:slideIn .22s cubic-bezier(.2,.9,.3,1);line-height:1.5;
  box-shadow:0 16px 40px rgba(0,0,0,.5);backdrop-filter:blur(12px);}
.toast-ok{background:rgba(6,42,28,.94);border:1px solid rgba(52,211,153,.5);color:#6ee7b7;}
.toast-err{background:rgba(47,10,10,.94);border:1px solid rgba(248,113,113,.5);color:#fca5a5;}
@keyframes slideIn{from{opacity:0;transform:translateY(14px) scale(.97)}to{opacity:1;transform:none}}

.spin{display:inline-block;animation:spin 1.1s linear infinite;}
@keyframes spin{to{transform:rotate(360deg)}}

::-webkit-scrollbar{width:9px;height:9px;}
::-webkit-scrollbar-track{background:#060b1f;}
::-webkit-scrollbar-thumb{background:#243355;border-radius:5px;border:2px solid #060b1f;}
::-webkit-scrollbar-thumb:hover{background:#31436e;}

@media (prefers-reduced-motion:reduce){
  *{animation-duration:.01ms!important;transition-duration:.01ms!important;}
}
@media (max-width:480px){
  .toast{right:14px;left:14px;max-width:none;bottom:14px;}
}
`;
