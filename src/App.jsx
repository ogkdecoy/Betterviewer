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
  set: (k, v) => localStorage.setItem(k, JSON.stringify(v)),
  del: (k) => localStorage.removeItem(k),
};
const genCode = () => Math.random().toString(36).toUpperCase().replace(/[^A-Z0-9]/g,"").slice(0,6).padEnd(6,"X");
const genId   = () => Math.random().toString(36).slice(2,10);
const fmt     = (n) => Number(n||0).toLocaleString("fr-FR",{minimumFractionDigits:2,maximumFractionDigits:2});

function useIsMobile() {
  const [m, setM] = useState(typeof window !== "undefined" ? window.innerWidth < 760 : false);
  useEffect(() => {
    const fn = () => setM(window.innerWidth < 760);
    window.addEventListener("resize", fn);
    return () => window.removeEventListener("resize", fn);
  }, []);
  return m;
}

const T = {
  fr: {
    tagline:"Argent factice · Jeu 100% gratuit", heroSub:"Engage tes viewers avec des paris factices en direct.\nLe meilleur gagne le giveaway.",
    loginHint:"Connecte-toi pour créer ou rejoindre une session", loginTwitch:"Se connecter avec Twitch",
    streamer:"Streamer", streamerDesc:"Lance une session, crée les marchés, désigne le gagnant.",
    viewer:"Viewer", viewerDesc:"Entre le code partagé en stream pour participer.",
    createSession:"Créer une session", codePlaceholder:"Ex: A3FX9K",
    markets:"Marchés", create:"Créer", leaderboard:"Classement", bets:"Paris",
    noMarket:"Aucun marché disponible.", noMarketAction:"Créer le premier →",
    question:"Question", questionPlaceholder:"Ex: Qui va gagner le prochain duel ?",
    options:"Options", openMarket:"Ouvrir le marché", closeBets:"Fermer les paris",
    goLive:"▶ Go Live", endSession:"■ Terminer", copyLink:"🔗 Lien", copyCode:"📋 Code",
    copied:"✓ Copié !", resolve:"✓", balance:"Solde", rank:"Rang", players:"Joueurs",
    bet:"Parier", myBet:"Mon pari", sessionOf:"Session de", streamEnded:"🏆 Stream terminé !",
    winner:"GAGNANT DU GIVEAWAY", myRank:"Ton classement", backHome:"← Retour à l'accueil",
    waitingLobby:"En attente du démarrage…", open:"Ouvert", closed:"Fermé", resolved:"Résolu",
    live:"LIVE", ended:"TERMINÉ", addOption:"+ Option", viewers:"viewers", totalPool:"Total",
    dashboard:"Dashboard", mySession:"Ma session",
    rebuyTab:"Recaves", rebuyNone:"Aucune demande en attente.",
    rebuyBroke:"Tu es à sec !", rebuyHint:"Offre un sub au streamer pour repartir avec {n} coins.",
    rebuyAsk:"Demander une recave", rebuyPending:"Demande envoyée",
    rebuyPendingHint:"Le streamer va vérifier ton sub et valider.",
    rebuyApprove:"Valider", rebuyCount:"Recaves",
    rebuyStreamerHint:"Vérifie le sub sur Twitch avant de valider. La validation remet le joueur à "+REBUY_AMOUNT+" coins.",
    cancelBet:"Annuler mon pari", cancelled:"Pari annulé, mise remboursée.",
    undoResolve:"↩ Annuler le résultat", undoDone:"Résultat annulé, marché rouvert.",
    manageBets:"Gérer les paris", noBets:"Aucun pari sur ce marché.",
    cancelThisBet:"Annuler ce pari", lastBet:"Dernier pari", noLastBet:"—",
    stake:"Mise", potential:"Gain potentiel", pickOption:"Choisis une option",
  },
  en: {
    tagline:"Fake money · 100% free game", heroSub:"Engage your viewers with live fake bets.\nThe best player wins the giveaway.",
    loginHint:"Sign in to create or join a session", loginTwitch:"Sign in with Twitch",
    streamer:"Streamer", streamerDesc:"Start a session, create markets, pick the winner.",
    viewer:"Viewer", viewerDesc:"Enter the code shared in stream to participate.",
    createSession:"Create a session", codePlaceholder:"Ex: A3FX9K",
    markets:"Markets", create:"Create", leaderboard:"Leaderboard", bets:"Bets",
    noMarket:"No markets available yet.", noMarketAction:"Create the first one →",
    question:"Question", questionPlaceholder:"Ex: Who will win the next duel?",
    options:"Options", openMarket:"Open market", closeBets:"Close bets",
    goLive:"▶ Go Live", endSession:"■ End stream", copyLink:"🔗 Link", copyCode:"📋 Code",
    copied:"✓ Copied!", resolve:"✓", balance:"Balance", rank:"Rank", players:"Players",
    bet:"Bet", myBet:"My bet", sessionOf:"Session by", streamEnded:"🏆 Stream ended!",
    winner:"GIVEAWAY WINNER", myRank:"Your rank", backHome:"← Back to home",
    waitingLobby:"Waiting for stream to start…", open:"Open", closed:"Closed", resolved:"Resolved",
    live:"LIVE", ended:"ENDED", addOption:"+ Option", viewers:"viewers", totalPool:"Total",
    dashboard:"Dashboard", mySession:"My session",
    rebuyTab:"Rebuys", rebuyNone:"No pending request.",
    rebuyBroke:"You're broke!", rebuyHint:"Gift a sub to the streamer to restart with {n} coins.",
    rebuyAsk:"Request a rebuy", rebuyPending:"Request sent",
    rebuyPendingHint:"The streamer will check your sub and approve.",
    rebuyApprove:"Approve", rebuyCount:"Rebuys",
    rebuyStreamerHint:"Check the sub on Twitch before approving. Approving sets the player to "+REBUY_AMOUNT+" coins.",
    cancelBet:"Cancel my bet", cancelled:"Bet cancelled, stake refunded.",
    undoResolve:"↩ Undo result", undoDone:"Result undone, market reopened.",
    manageBets:"Manage bets", noBets:"No bets on this market.",
    cancelThisBet:"Cancel this bet", lastBet:"Last bet", noLastBet:"—",
    stake:"Stake", potential:"Potential win", pickOption:"Pick an option",
  },
  es: {
    tagline:"Dinero ficticio · Juego 100% gratis", heroSub:"Involucra a tus viewers con apuestas falsas.\nEl mejor gana el giveaway.",
    loginHint:"Conéctate para crear o unirte a una sesión", loginTwitch:"Conectarse con Twitch",
    streamer:"Streamer", streamerDesc:"Inicia una sesión, crea mercados, elige al ganador.",
    viewer:"Viewer", viewerDesc:"Introduce el código compartido en stream para participar.",
    createSession:"Crear una sesión", codePlaceholder:"Ej: A3FX9K",
    markets:"Mercados", create:"Crear", leaderboard:"Clasificación", bets:"Apuestas",
    noMarket:"No hay mercados disponibles.", noMarketAction:"Crear el primero →",
    question:"Pregunta", questionPlaceholder:"¿Quién ganará el próximo duelo?",
    options:"Opciones", openMarket:"Abrir mercado", closeBets:"Cerrar apuestas",
    goLive:"▶ En directo", endSession:"■ Terminar", copyLink:"🔗 Enlace", copyCode:"📋 Código",
    copied:"✓ ¡Copiado!", resolve:"✓", balance:"Saldo", rank:"Rango", players:"Jugadores",
    bet:"Apostar", myBet:"Mi apuesta", sessionOf:"Sesión de", streamEnded:"🏆 ¡Stream terminado!",
    winner:"GANADOR DEL GIVEAWAY", myRank:"Tu clasificación", backHome:"← Volver al inicio",
    waitingLobby:"Esperando el inicio…", open:"Abierto", closed:"Cerrado", resolved:"Resuelto",
    live:"EN DIRECTO", ended:"TERMINADO", addOption:"+ Opción", viewers:"viewers", totalPool:"Total",
    dashboard:"Panel", mySession:"Mi sesión",
    rebuyTab:"Recargas", rebuyNone:"No hay solicitudes pendientes.",
    rebuyBroke:"¡Estás sin fondos!", rebuyHint:"Regala un sub al streamer para volver con {n} coins.",
    rebuyAsk:"Pedir una recarga", rebuyPending:"Solicitud enviada",
    rebuyPendingHint:"El streamer verificará tu sub y la aprobará.",
    rebuyApprove:"Aprobar", rebuyCount:"Recargas",
    rebuyStreamerHint:"Verifica el sub en Twitch antes de aprobar. Aprobar deja al jugador con "+REBUY_AMOUNT+" coins.",
    cancelBet:"Cancelar mi apuesta", cancelled:"Apuesta cancelada, importe devuelto.",
    undoResolve:"↩ Anular resultado", undoDone:"Resultado anulado, mercado reabierto.",
    manageBets:"Gestionar apuestas", noBets:"No hay apuestas en este mercado.",
    cancelThisBet:"Cancelar esta apuesta", lastBet:"Última apuesta", noLastBet:"—",
    stake:"Importe", potential:"Ganancia potencial", pickOption:"Elige una opción",
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
        const user = { id:u.id, login:u.login, displayName:u.display_name, avatar:u.profile_image_url, token:pending, platform:"twitch" };
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
    if (!token || state !== LS.get("bv_state")) { setAuthError("Auth échouée."); return; }
    LS.del("bv_state");
    LS.set("bv_pending_token", token);
    setAuthLoading(true);
    fetchTwitchUser(token).then(u => {
      const user = { id:u.id, login:u.login, displayName:u.display_name, avatar:u.profile_image_url, token, platform:"twitch" };
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

  function showToast(msg, type="ok") { setToast({msg,type}); setTimeout(()=>setToast(null),3500); }

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
    showToast(`Session créée ! Code : ${code}`);
  }

  async function handleJoin(code) {
    const snap = await get(ref(getDb(), `sessions/${code}`));
    if (!snap.exists()) return showToast("Code introuvable.", "err");
    const data = snap.val();
    if (data.status === "ended") return showToast("Session terminée.", "err");
    if (!data.participants?.[twitchUser.login]) {
      await set(ref(getDb(), `sessions/${code}/participants/${twitchUser.login}`), {
        login:twitchUser.login, displayName:twitchUser.displayName, avatar:twitchUser.avatar, balance:STARTING_BALANCE, joinedAt:Date.now(),
      });
    }
    setSessionCode(code); subscribeSession(code);
    setView(data.streamerLogin === twitchUser.login ? "streamer" : "viewer");
    showToast(`Rejoint la session ${code} !`);
  }

  async function handleStartLive() { await update(ref(getDb(),`sessions/${sessionCode}`),{status:"live"}); showToast("Le live a démarré !"); }
  async function handleEndSession() { await update(ref(getDb(),`sessions/${sessionCode}`),{status:"ended"}); setView("results"); }

  async function handleCreateMarket(title, options) {
    const id = genId();
    const opts = {};
    options.forEach(({label, odds}) => { const oid=genId(); opts[oid]={id:oid, label, odds, bettors:{}}; });
    await set(ref(getDb(),`sessions/${sessionCode}/markets/${id}`),{id,title,options:opts,status:"open",createdAt:Date.now(),winner:null});
    showToast("Marché ouvert !");
  }

  async function handleCloseMarket(marketId) { await update(ref(getDb(),`sessions/${sessionCode}/markets/${marketId}`),{status:"closed"}); }
  async function handleReopenMarket(marketId) { await update(ref(getDb(),`sessions/${sessionCode}/markets/${marketId}`),{status:"open"}); showToast("Paris rouverts."); }

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
    showToast("🏆 Gains distribués !");
  }

  // ── Annuler le résultat d'un marché déjà résolu : on rembourse les gains versés ──
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
    // On efface le dernier résultat de tous ceux dont il venait de ce marché
    Object.values(market.options||{}).forEach(opt => {
      Object.keys(opt.bettors||{}).forEach(login => {
        if (s.participants?.[login]?.lastResult?.marketId === marketId)
          updates[`sessions/${sessionCode}/participants/${login}/lastResult`] = null;
      });
    });
    await update(ref(getDb()),updates);
    showToast(t.undoDone);
  }

  async function handleBet(marketId, optionId, amount) {
    const snap = await get(ref(getDb(),`sessions/${sessionCode}`));
    const s = snap.val();
    const participant = s.participants?.[twitchUser.login];
    if (!participant) return showToast("Participant introuvable.","err");
    if (amount>participant.balance) return showToast("Solde insuffisant.","err");
    const market = s.markets?.[marketId];
    if (!market||market.status!=="open") return showToast("Paris fermés.","err");
    if (Object.values(market.options||{}).some(o=>o.bettors?.[twitchUser.login])) return showToast("Tu as déjà parié.","err");
    const optData = market.options[optionId];
    const optOdds = optData?.odds || 2;
    const updates = {};
    updates[`sessions/${sessionCode}/markets/${marketId}/options/${optionId}/bettors/${twitchUser.login}`]=amount;
    updates[`sessions/${sessionCode}/participants/${twitchUser.login}/balance`]=+(participant.balance-amount).toFixed(2);
    await update(ref(getDb()),updates);
    showToast(`Pari de ${fmt(amount)} coins ! Gain potentiel : ${fmt(amount*optOdds)} coins (×${optOdds})`);
  }

  // ── Annulation d'un pari. force=true => le streamer, même sur un marché résolu ──
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
    // On rend la mise ; si le marché était résolu et que ce pari avait gagné, on retire aussi le gain versé
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
      return showToast("Demande déjà en attente.","err");
    await set(ref(getDb(),`sessions/${sessionCode}/rebuyRequests/${twitchUser.login}`),{
      login: twitchUser.login, displayName: twitchUser.displayName,
      avatar: twitchUser.avatar, status: "pending", requestedAt: Date.now(),
    });
    showToast("Demande envoyée au streamer !");
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
    showToast(`${p.displayName} repart avec ${fmt(REBUY_AMOUNT)} coins !`);
  }

  async function handleRejectRebuy(login) {
    await set(ref(getDb(),`sessions/${sessionCode}/rebuyRequests/${login}`), null);
    showToast("Demande refusée.");
  }

  function logout() { LS.del("bv_user"); setTwitchUser(null); setView("home"); setSession(null); setSessionCode(null); if(unsub.current) unsub.current(); }
  function toggleLang() {
    const langs=["fr","en","es"];
    const next=langs[(langs.indexOf(lang)+1)%langs.length];
    setLang(next); LS.set("bv_lang",next);
  }

  const isStreamer = session?.streamerLogin === twitchUser?.login;

  return (
    <div style={S.root}>
      <style>{CSS}</style>
      <div style={S.bgGlow} />
      {toast && <div className={`toast toast-${toast.type}`}>{toast.msg}</div>}
      <Nav user={twitchUser} onLogout={logout} onHome={()=>setView("home")} session={session} isStreamer={isStreamer} onDash={()=>setView(isStreamer?"streamer":"viewer")} lang={lang} onToggleLang={toggleLang} t={t} />
      <main style={S.main}>
        {authLoading && <Loader />}
        {authError && <ErrorBanner msg={authError} onDismiss={()=>setAuthError("")} />}
        {view==="home" && !authLoading && <HomePage user={twitchUser} t={t} onLogin={()=>{window.location.href=buildTwitchURL();}} onCreate={handleCreate} onJoin={handleJoin} />}
        {view==="streamer" && session && <StreamerDash session={session} user={twitchUser} t={t}
          onCreateMarket={handleCreateMarket} onCloseMarket={handleCloseMarket} onReopenMarket={handleReopenMarket}
          onResolveMarket={handleResolveMarket} onUndoResolve={handleUndoResolve} onCancelBet={handleCancelBet}
          onStartLive={handleStartLive} onEndSession={handleEndSession}
          onApproveRebuy={handleApproveRebuy} onRejectRebuy={handleRejectRebuy} />}
        {view==="viewer" && session && <ViewerDash session={session} user={twitchUser} t={t} onBet={handleBet} onCancelBet={handleCancelBet} onRequestRebuy={handleRequestRebuy} />}
        {view==="results" && session && <ResultsPage session={session} user={twitchUser} t={t} onHome={()=>{setView("home");setSession(null);setSessionCode(null);}} />}
      </main>
    </div>
  );
}

function Nav({ user, onLogout, onHome, session, isStreamer, onDash, lang, onToggleLang, t }) {
  const mobile = useIsMobile();
  return (
    <nav style={{...S.nav, padding:mobile?"10px 14px":"12px 28px"}}>
      <div style={S.navBrand} onClick={onHome}>
        <img src={LOGO} alt="BETterviewer" style={{height:mobile?34:52, width:"auto", objectFit:"contain"}} />
        {session && (
          <div style={S.sessionPill}>
            {session.status==="live"?<><span style={S.liveDot}/>LIVE</>:session.status==="lobby"?"LOBBY":t.ended}
            <span style={{opacity:.4}}>·</span>
            <span style={{fontFamily:"'DM Mono',monospace",fontWeight:700,color:"#c4b5fd"}}>{session.code}</span>
          </div>
        )}
      </div>
      <div style={S.navRight}>
        {session && <button style={S.navBtn} onClick={onDash}>{isStreamer?t.dashboard:t.mySession}</button>}
        <button style={S.langBtn} onClick={onToggleLang}>
          {lang==="fr"?"🇬🇧 EN":lang==="en"?"🇪🇸 ES":"🇫🇷 FR"}
        </button>
        {user ? (
          <div style={S.userChip}>
            <img src={user.avatar} style={S.ava} alt="" />
            {!mobile && <span style={S.uname}>{user.displayName}</span>}
            <button style={S.logoutBtn} onClick={onLogout}>↩</button>
          </div>
        ) : <span style={S.guestTxt}>{lang==="fr"?"Non connecté":"Not signed in"}</span>}
      </div>
    </nav>
  );
}

function HomePage({ user, t, onLogin, onCreate, onJoin }) {
  const [code, setCode] = useState("");
  const mobile = useIsMobile();

  return (
    <div style={S.homeWrap}>
      <div style={S.hero}>
        <div style={{position:"relative"}}>
          <div style={S.heroBadge}><Coin size={16}/> {t.tagline}</div>
          <img src={LOGO} alt="BETterviewer" style={{width:"100%",maxWidth:mobile?260:440,margin:"12px auto",display:"block"}} />
          <img src={COINS_STACK} alt="" style={{width:mobile?140:200,height:"auto",display:"block",margin:"0 auto 8px",filter:"drop-shadow(0 0 24px rgba(145,70,255,0.5))"}} />
          <p style={{...S.heroSub,whiteSpace:"pre-line"}}>{t.heroSub}</p>
        </div>
      </div>

      {!user ? (
        <div style={S.loginBox}>
          <p style={S.loginHint}>{t.loginHint}</p>
          <button style={S.twitchBtn} onClick={onLogin}><TwitchSVG />{t.loginTwitch}</button>
        </div>
      ) : (
        <div style={{...S.cards2, gridTemplateColumns:mobile?"1fr":"1fr 1fr"}}>
          <div style={S.roleCard}>
            <img src={IMG_STREAMER} alt="Streamer" style={{width:"100%",maxWidth:mobile?200:280,height:"auto",display:"block",margin:"0 auto 10px"}} />
            <p style={S.roleDesc}>{t.streamerDesc}</p>
            <button style={{...S.primaryBtn,width:"100%"}} onClick={onCreate}>{t.createSession}</button>
          </div>
          <div style={S.roleCard}>
            <img src={IMG_VIEWER} alt="Viewer" style={{width:"100%",maxWidth:mobile?200:280,height:"auto",display:"block",margin:"0 auto 10px"}} />
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

function StreamerDash({ session, user, t, onCreateMarket, onCloseMarket, onReopenMarket, onResolveMarket, onUndoResolve, onCancelBet, onStartLive, onEndSession, onApproveRebuy, onRejectRebuy }) {
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

  function copy(val,key){ navigator.clipboard.writeText(val); setCopied(key); setTimeout(()=>setCopied(""),2000); }
  function submit(){
    if(!title.trim()) return;
    const valid = optOdds.filter(o=>o.label.trim());
    if(valid.length<2) return;
    for(const o of valid){
      const v = o.custom ? parseFloat(o.custom) : o.odds;
      if(!v || v < 1.01) return;
    }
    const options = valid.map(o=>({ label:o.label, odds: o.custom ? parseFloat(o.custom) : o.odds }));
    onCreateMarket(title, options);
    setTitle("");
    setOptOdds([{label:"Oui",odds:2,custom:""},{label:"Non",odds:3,custom:""}]);
  }

  return (
    <div style={S.dashWrap}>
      <div style={{...S.topBar,flexDirection:mobile?"column":"row"}}>
        <div>
          <div style={{...S.topCode,fontSize:mobile?"26px":"40px"}}>{session.code}</div>
          <div style={S.topMeta}>{participants.length} {t.viewers} · {markets.length} {t.markets.toLowerCase()}</div>
        </div>
        <div style={{...S.topActions,width:mobile?"100%":"auto"}}>
          <button style={S.ghostBtn} onClick={()=>copy(session.link,"link")}>{copied==="link"?t.copied:t.copyLink}</button>
          <button style={S.ghostBtn} onClick={()=>copy(session.code,"code")}>{copied==="code"?t.copied:t.copyCode}</button>
          {session.status==="lobby"&&<button style={S.goLiveBtn} onClick={onStartLive}>{t.goLive}</button>}
          {session.status==="live"&&<button style={S.endBtn} onClick={onEndSession}>{t.endSession}</button>}
        </div>
      </div>

      <div style={S.tabs}>
        {[["markets",`📊 ${t.markets}`],["create",`➕ ${t.create}`],["rebuy",`💰 ${t.rebuyTab}`],["lb",`🏆 ${t.leaderboard}`]].map(([k,l])=>(
          <button key={k} style={{...S.tab,...(tab===k?S.tabOn:{})}} onClick={()=>setTab(k)}>
            {l}
            {k==="rebuy" && rebuys.length>0 && <span style={S.tabDot}>{rebuys.length}</span>}
          </button>
        ))}
      </div>

      {tab==="markets" && (
        <div>
          {markets.length===0&&<Empty msg={t.noMarket} action={t.noMarketAction} onAction={()=>setTab("create")}/>}
          {markets.map(m=>(
            <AdminMarketCard key={m.id} market={m} session={session} t={t}
              onClose={onCloseMarket} onReopen={onReopenMarket} onResolve={onResolveMarket}
              onUndo={onUndoResolve} onCancelBet={onCancelBet}/>
          ))}
        </div>
      )}

      {tab==="create" && (
        <div style={S.card}>
          <h3 style={S.cardH}>{t.create}</h3>
          <label style={S.label}>{t.question}</label>
          <input style={S.input} placeholder={t.questionPlaceholder} value={title} onChange={e=>setTitle(e.target.value)}/>
          <label style={S.label}>{t.options}</label>
          {optOdds.map((o,i)=>(
            <div key={i} style={S.optEditor}>
              <div style={{display:"flex",gap:8,marginBottom:10}}>
                <input style={{...S.input,flex:1}} value={o.label} placeholder={`Option ${i+1}`}
                  onChange={e=>{const a=[...optOdds];a[i]={...a[i],label:e.target.value};setOptOdds(a);}}/>
                {optOdds.length>2&&<button style={S.rmBtn} onClick={()=>setOptOdds(optOdds.filter((_,j)=>j!==i))}>✕</button>}
              </div>
              <div style={S.miniLabel}>Cote</div>
              <div style={{display:"flex",gap:6,flexWrap:"wrap",marginBottom:8}}>
                {[1.20,2,3,5].map(v=>(
                  <button key={v} style={{...S.chipOdds,...(!o.custom&&o.odds===v?S.chipOddsOn:{})}}
                    onClick={()=>{const a=[...optOdds];a[i]={...a[i],odds:v,custom:""};setOptOdds(a);}}>×{v}</button>
                ))}
              </div>
              <input style={S.input} type="number" step="0.01" min="1.01" placeholder="Cote personnalisée (ex: 1.75)"
                value={o.custom} onChange={e=>{const a=[...optOdds];a[i]={...a[i],custom:e.target.value};setOptOdds(a);}}/>
              <div style={{fontSize:12,color:"#4ade80",marginTop:6}}>
                100 misés → <b>{fmt(100*(o.custom?parseFloat(o.custom)||0:o.odds))}</b> coins
              </div>
            </div>
          ))}
          {optOdds.length<6&&<button style={S.addBtn} onClick={()=>setOptOdds([...optOdds,{label:"",odds:2,custom:""}])}>{t.addOption}</button>}
          <button style={{...S.primaryBtn,width:"100%",marginTop:18}} onClick={submit}>{t.openMarket}</button>
        </div>
      )}

      {tab==="rebuy" && (
        <div style={S.card}>
          <h3 style={S.cardH}>💰 {t.rebuyTab}</h3>
          <div style={S.rebuyNotice}>{t.rebuyStreamerHint}</div>
          {rebuys.length===0 && <Empty msg={t.rebuyNone}/>}
          {rebuys.map(r=>{
            const p = session.participants?.[r.login];
            return (
              <div key={r.login} style={S.rebuyRow}>
                <img src={r.avatar} style={S.lbAva} alt="" onError={e=>e.target.style.display="none"}/>
                <div style={{flex:1,minWidth:0}}>
                  <div style={S.rebuyName}>{r.displayName}</div>
                  <div style={S.rebuySub}>
                    {t.rebuyCount}: {p?.rebuys||0} ·{" "}
                    <a href={`https://twitch.tv/${r.login}`} target="_blank" rel="noreferrer" style={{color:"#c4b5fd"}}>
                      twitch.tv/{r.login}
                    </a>
                  </div>
                </div>
                <div style={{display:"flex",gap:6,flexShrink:0}}>
                  <button style={S.resolveBtn} onClick={()=>onApproveRebuy(r.login)}>✓ {t.rebuyApprove}</button>
                  <button style={S.rmBtn} onClick={()=>onRejectRebuy(r.login)}>✕</button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {tab==="lb"&&<Leaderboard participants={participants} t={t}/>}
    </div>
  );
}

function AdminMarketCard({ market, session, t, onClose, onReopen, onResolve, onUndo, onCancelBet }) {
  const [showBets, setShowBets] = useState(false);
  const opts = Object.values(market.options||{});
  const allBets = [];
  opts.forEach(o => Object.entries(o.bettors||{}).forEach(([login,amount]) =>
    allBets.push({ login, amount, optLabel:o.label, optId:o.id })));

  return (
    <div style={S.mCard}>
      <div style={S.mHeader}>
        <span style={S.mTitle}>{market.title}</span>
        <StatusBadge status={market.status} t={t}/>
      </div>
      <div style={S.mBody}>
        <div style={S.oddsGrid}>
          {opts.map(opt=>{
            const optOdds = opt.odds || 2;
            const betCount = Object.keys(opt.bettors||{}).length;
            const totalBet = Object.values(opt.bettors||{}).reduce((s,v)=>s+v,0);
            const isWin = market.winner===opt.id;
            return (
              <div key={opt.id} style={{...S.oddsBtn,...(isWin?S.oddsBtnWin:{})}}>
                <div style={S.oddsLabel}>{opt.label}{isWin?" 🏆":""}</div>
                <div style={S.oddsValue}>{optOdds.toFixed(2)}</div>
                <div style={S.oddsMeta}>{fmt(totalBet)} · {betCount}</div>
              </div>
            );
          })}
        </div>

        <div style={S.mFoot}>
          <button style={S.linkBtn} onClick={()=>setShowBets(v=>!v)}>
            {showBets?"▾":"▸"} {t.manageBets} ({allBets.length})
          </button>
          <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
            {market.status==="open"&&<button style={S.closeBtn} onClick={()=>onClose(market.id)}>{t.closeBets}</button>}
            {market.status==="closed"&&(
              <>
                <button style={S.ghostBtnSm} onClick={()=>onReopen(market.id)}>↺ {t.open}</button>
                {opts.map(opt=>(
                  <button key={opt.id} style={S.resolveBtn} onClick={()=>onResolve(market.id,opt.id)}>✓ {opt.label}</button>
                ))}
              </>
            )}
            {market.status==="resolved"&&(
              <button style={S.undoBtn} onClick={()=>onUndo(market.id)}>{t.undoResolve}</button>
            )}
          </div>
        </div>

        {showBets && (
          <div style={S.betsList}>
            {allBets.length===0 && <div style={S.betsEmpty}>{t.noBets}</div>}
            {allBets.map(b=>{
              const p = session.participants?.[b.login];
              return (
                <div key={b.login+b.optId} style={S.betRow}>
                  <img src={p?.avatar} style={S.betAva} alt="" onError={e=>e.target.style.display="none"}/>
                  <span style={S.betName}>{p?.displayName||b.login}</span>
                  <span style={S.betOpt}>{b.optLabel}</span>
                  <span style={S.betAmt}>{fmt(b.amount)} <Coin size={12}/></span>
                  <button style={S.rmBtnSm} title={t.cancelThisBet} onClick={()=>onCancelBet(market.id,b.login,true)}>✕</button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

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
      <div style={{...S.viewerTopBar,flexDirection:mobile?"column":"row"}}>
        <div style={S.viewerLeft}>
          <img src={user.avatar} style={S.bigAva} alt=""/>
          <div>
            <div style={S.viewerName}>{user.displayName}</div>
            <div style={S.viewerSub}>{t.sessionOf} <b>{session.streamerName}</b></div>
          </div>
        </div>
        <div style={{...S.statsRow,width:mobile?"100%":"auto",justifyContent:mobile?"space-around":"flex-end"}}>
          <Stat val={<span>{fmt(me?.balance??STARTING_BALANCE)} <Coin size={18}/></span>} label={t.balance} accent/>
          <Stat val={`#${rank}`} label={t.rank}/>
          <Stat val={participants.length} label={t.players}/>
        </div>
      </div>

      {session.status==="lobby"&&<div style={S.lobbyBanner}>⏳ {t.waitingLobby}</div>}

      {session.status!=="ended" && isBroke && (
        <div style={S.rebuyBox}>
          {rebuyStatus==="pending" ? (
            <>
              <div style={S.rebuyTitle}>⏳ {t.rebuyPending}</div>
              <div style={S.rebuyHint}>{t.rebuyPendingHint}</div>
            </>
          ) : (
            <>
              <div style={S.rebuyTitle}>💀 {t.rebuyBroke}</div>
              <div style={S.rebuyHint}>{t.rebuyHint.replace("{n}", fmt(REBUY_AMOUNT))}</div>
              <button style={{...S.primaryBtn,marginTop:12,width:"100%"}} onClick={onRequestRebuy}>{t.rebuyAsk}</button>
            </>
          )}
        </div>
      )}

      <div style={S.tabs}>
        {[["markets",`📊 ${t.bets}`],["lb",`🏆 ${t.leaderboard}`]].map(([k,l])=>(
          <button key={k} style={{...S.tab,...(tab===k?S.tabOn:{})}} onClick={()=>setTab(k)}>{l}</button>
        ))}
      </div>

      {tab==="markets"&&(
        <div>
          {markets.length===0&&<Empty msg={t.noMarket}/>}
          {markets.map(m=>(
            <ViewerMarketCard key={m.id} market={m} user={user} balance={me?.balance??0} t={t}
              onBet={onBet} onCancelBet={onCancelBet}/>
          ))}
        </div>
      )}
      {tab==="lb"&&<Leaderboard participants={participants} highlightLogin={user.login} t={t}/>}
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
  const selOdds = sel ? (opts.find(o=>o.id===sel)?.odds || 2) : 0;
  const stake = parseFloat(amount)||0;

  function submit(){
    if(!sel||!stake||stake<=0) return;
    onBet(market.id,sel,stake); setSel(null); setAmount("");
  }

  return (
    <div style={S.mCard}>
      <div style={S.mHeader}>
        <span style={S.mTitle}>{market.title}</span>
        <StatusBadge status={market.status} t={t}/>
      </div>
      <div style={S.mBody}>
        <div style={S.oddsGrid}>
          {opts.map(opt=>{
            const isMine=myBetOpt?.id===opt.id;
            const isWin=market.winner===opt.id;
            const optOdds = opt.odds || 2;
            return (
              <div key={opt.id}
                style={{...S.oddsBtn,
                  ...(sel===opt.id?S.oddsBtnSel:{}),
                  ...(isMine?S.oddsBtnMine:{}),
                  ...(isWin?S.oddsBtnWin:{}),
                  cursor:canBet?"pointer":"default"}}
                onClick={()=>canBet&&setSel(sel===opt.id?null:opt.id)}>
                <div style={S.oddsLabel}>{opt.label}{isWin?" 🏆":""}</div>
                <div style={S.oddsValue}>{optOdds.toFixed(2)}</div>
                {isMine && <div style={S.oddsMine}>{t.myBet} · {fmt(myBetAmount)}</div>}
              </div>
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
                  <span style={S.slipWin}>{t.potential} : <b>{fmt(stake*selOdds)}</b> <Coin size={13}/></span>
                </div>
                <input style={S.input} type="number" min="1" max={balance} placeholder={`max ${fmt(balance)}`}
                  value={amount} onChange={e=>setAmount(e.target.value)}/>
                <div style={{display:"flex",gap:6,marginTop:8}}>
                  {[10,50,100,250].map(v=>(
                    <button key={v} style={{...S.quickBtn,flex:1}} onClick={()=>setAmount(String(Math.min(v,balance)))}>{v}</button>
                  ))}
                  <button style={{...S.quickBtn,flex:1}} onClick={()=>setAmount(String(balance))}>MAX</button>
                </div>
                <button style={{...S.primaryBtn,width:"100%",marginTop:10}} onClick={submit}>{t.bet}</button>
              </>
            )}
          </div>
        )}

        {myBetOpt && (
          <div style={S.myBetNote}>
            <span>{t.myBet} : <b>{fmt(myBetAmount)}</b> <Coin size={12}/> → <b>{myBetOpt.label}</b></span>
            {market.status==="open" && (
              <button style={S.cancelBtn} onClick={()=>onCancelBet(market.id,user.login,false)}>{t.cancelBet}</button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function Leaderboard({ participants, highlightLogin, t }) {
  return (
    <div style={S.card}>
      <h3 style={S.cardH}>🏆 {t.leaderboard}</h3>
      {participants.map((p,i)=>{
        const lr = p.lastResult;
        return (
          <div key={p.login} style={{...S.lbRow,...(p.login===highlightLogin?S.lbMe:{})}}>
            <span style={S.lbRank}>{i===0?"🥇":i===1?"🥈":i===2?"🥉":`#${i+1}`}</span>
            <img src={p.avatar} style={S.lbAva} alt="" onError={e=>e.target.style.display="none"}/>
            <span style={S.lbName}>{p.displayName}</span>
            <span style={S.lbBal}>{fmt(p.balance)} <Coin size={14}/></span>
            <span style={{...S.lbLast, color: !lr ? "#4b5563" : lr.net>=0 ? "#4ade80" : "#f87171"}}>
              {!lr ? t.noLastBet : `${lr.net>=0?"+":"−"}${fmt(Math.abs(lr.net))}`}
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
      <p style={S.resSub}>{session.code} · {sorted.length} {t.players}</p>
      {winner&&(
        <div style={S.winCard}>
          <div style={{fontSize:48,marginBottom:8}}>👑</div>
          <img src={winner.avatar} style={S.winAva} alt=""/>
          <div style={S.winName}>{winner.displayName}</div>
          <div style={S.winBal}>{fmt(winner.balance)} <Coin size={28}/></div>
          <div style={S.winLabel}>{t.winner}</div>
        </div>
      )}
      {myRank>0&&<p style={S.myRank}>{t.myRank} : <b style={{color:"#c4b5fd"}}>#{myRank}</b> / {sorted.length}</p>}
      <div style={{maxWidth:520,margin:"24px auto"}}><Leaderboard participants={sorted} highlightLogin={user?.login} t={t}/></div>
      <button style={{...S.primaryBtn,margin:"0 auto 60px",display:"block"}} onClick={onHome}>{t.backHome}</button>
    </div>
  );
}

function StatusBadge({ status, t }) {
  if (status==="open")     return <span style={S.badgeOpen}>● {t.open}</span>;
  if (status==="closed")   return <span style={S.badgeClosed}>⏸ {t.closed}</span>;
  if (status==="resolved") return <span style={S.badgeResolved}>✓ {t.resolved}</span>;
  return null;
}
function Stat({ val, label, accent }) {
  return <div style={S.statBox}><div style={{...S.statVal,...(accent?{color:"#c4b5fd"}:{})}}>{val}</div><div style={S.statLab}>{label}</div></div>;
}
function Empty({ msg, action, onAction }) {
  return <div style={S.empty}>{msg}{action&&<span style={S.emptyLink} onClick={onAction}> {action}</span>}</div>;
}
function Loader() { return <div style={S.loader}><span className="spin">◈</span></div>; }
function ErrorBanner({ msg, onDismiss }) {
  return <div style={S.errBanner}>⚠ {msg} <button style={S.errClose} onClick={onDismiss}>✕</button></div>;
}
function Coin({ size=16 }) {
  return <img src={COIN} alt="" style={{width:size,height:size,objectFit:"contain",verticalAlign:"middle",marginLeft:3,display:"inline"}} />;
}
function TwitchSVG() {
  return <svg width="18" height="18" viewBox="0 0 24 24" fill="white" style={{marginRight:8,flexShrink:0}}>
    <path d="M11.571 4.714h1.715v5.143H11.57zm4.715 0H18v5.143h-1.714zM6 0L1.714 4.286v15.428h5.143V24l4.286-4.286h3.428L22.286 12V0zm14.571 11.143l-3.428 3.428h-3.429l-3 3v-3H6.857V1.714h13.714z"/>
  </svg>;
}

const S = {
  root:{ minHeight:"100vh", background:"#050b24", color:"#eef0ff", fontFamily:"'Syne','Trebuchet MS',sans-serif", position:"relative" },
  bgGlow:{ position:"fixed", inset:0, pointerEvents:"none", zIndex:0,
    background:"radial-gradient(1000px 600px at 50% -10%, #17307a 0%, #0b1740 42%, #050b24 100%)" },

  nav:{ display:"flex", alignItems:"center", justifyContent:"space-between", borderBottom:"1px solid rgba(255,255,255,.08)",
    background:"rgba(5,11,36,.88)", position:"sticky", top:0, zIndex:100, backdropFilter:"blur(16px)", gap:12, flexWrap:"wrap" },
  navBrand:{ display:"flex", alignItems:"center", gap:12, cursor:"pointer" },
  sessionPill:{ display:"flex", alignItems:"center", gap:6, fontSize:11, background:"rgba(255,255,255,.07)",
    border:"1px solid rgba(255,255,255,.1)", padding:"3px 12px", borderRadius:20, color:"#b6c0e6", letterSpacing:"0.06em" },
  liveDot:{ width:7, height:7, borderRadius:"50%", background:"#4ade80", boxShadow:"0 0 8px #4ade80", display:"inline-block" },
  navRight:{ display:"flex", alignItems:"center", gap:8 },
  navBtn:{ background:"rgba(255,255,255,.08)", border:"1px solid rgba(255,255,255,.14)", color:"#eef0ff",
    padding:"7px 15px", borderRadius:8, cursor:"pointer", fontSize:13, fontWeight:600 },
  langBtn:{ background:"rgba(255,255,255,.08)", border:"1px solid rgba(255,255,255,.14)", color:"#eef0ff",
    padding:"6px 12px", borderRadius:8, cursor:"pointer", fontSize:12, fontWeight:700 },
  userChip:{ display:"flex", alignItems:"center", gap:8, background:"rgba(255,255,255,.08)",
    border:"1px solid rgba(255,255,255,.14)", borderRadius:24, padding:"3px 10px 3px 3px" },
  ava:{ width:30, height:30, borderRadius:"50%", objectFit:"cover", border:"2px solid #9146ff" },
  uname:{ fontSize:13, fontWeight:700 },
  logoutBtn:{ background:"none", border:"none", color:"#8e9ac4", cursor:"pointer", fontSize:15, padding:0 },
  guestTxt:{ fontSize:13, color:"#6b7aa8" },

  main:{ maxWidth:1000, margin:"0 auto", padding:"clamp(16px,4vw,36px) clamp(12px,3vw,20px)", position:"relative", zIndex:1 },

  homeWrap:{ maxWidth:720, margin:"0 auto" },
  hero:{ position:"relative", textAlign:"center", padding:"36px 16px 28px" },
  heroBadge:{ display:"inline-flex", alignItems:"center", gap:4, fontSize:12, background:"rgba(145,70,255,.16)",
    border:"1px solid rgba(145,70,255,.38)", color:"#c4b5fd", padding:"6px 16px", borderRadius:20, letterSpacing:"0.04em" },
  heroSub:{ fontSize:15, color:"#9aa6d0", lineHeight:1.7, margin:"12px 0 0" },
  loginBox:{ textAlign:"center", padding:"28px 0" },
  loginHint:{ color:"#9aa6d0", fontSize:14, marginBottom:20 },
  twitchBtn:{ display:"inline-flex", alignItems:"center", background:"#9146ff", color:"#fff", border:"none",
    borderRadius:10, padding:"14px 32px", fontSize:15, fontWeight:800, cursor:"pointer",
    boxShadow:"0 8px 24px rgba(145,70,255,.35)" },

  cards2:{ display:"grid", gap:18, alignItems:"stretch" },
  roleCard:{ background:"rgba(16,28,66,.72)", border:"1px solid rgba(255,255,255,.1)", borderRadius:16, padding:22,
    display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"space-between", gap:12,
    boxShadow:"0 10px 30px rgba(0,0,0,.28)" },
  roleDesc:{ fontSize:13, color:"#9aa6d0", lineHeight:1.6, textAlign:"center", margin:0, flex:1 },
  primaryBtn:{ background:"linear-gradient(135deg,#7c3aed,#a855f7)", border:"none", color:"#fff", borderRadius:10,
    padding:"12px 24px", fontSize:14, fontWeight:800, cursor:"pointer", boxShadow:"0 6px 18px rgba(124,58,237,.35)" },
  codeInput:{ background:"rgba(255,255,255,.07)", border:"1px solid rgba(255,255,255,.16)", borderRadius:10, color:"#eef0ff",
    padding:"12px 14px", fontSize:17, fontFamily:"'DM Mono',monospace", letterSpacing:"0.18em", outline:"none",
    flex:1, minWidth:0, textTransform:"uppercase" },
  joinBtn:{ background:"#9146ff", border:"none", color:"#fff", borderRadius:10, padding:"12px 20px",
    cursor:"pointer", fontWeight:900, fontSize:15 },

  dashWrap:{ maxWidth:760, margin:"0 auto" },
  topBar:{ display:"flex", justifyContent:"space-between", alignItems:"center", background:"rgba(16,28,66,.72)",
    border:"1px solid rgba(255,255,255,.1)", borderRadius:16, padding:"20px 24px", marginBottom:20, gap:16,
    boxShadow:"0 10px 30px rgba(0,0,0,.28)" },
  topCode:{ fontWeight:900, color:"#c4b5fd", fontFamily:"'DM Mono',monospace", letterSpacing:"0.18em" },
  topMeta:{ fontSize:13, color:"#8e9ac4", marginTop:4 },
  topActions:{ display:"flex", gap:8, flexWrap:"wrap" },
  ghostBtn:{ background:"rgba(255,255,255,.08)", border:"1px solid rgba(255,255,255,.16)", color:"#dfe4f7",
    padding:"9px 15px", borderRadius:9, cursor:"pointer", fontSize:12, fontWeight:600 },
  ghostBtnSm:{ background:"rgba(255,255,255,.08)", border:"1px solid rgba(255,255,255,.18)", color:"#dfe4f7",
    padding:"7px 13px", borderRadius:8, cursor:"pointer", fontSize:12, fontWeight:600 },
  goLiveBtn:{ background:"#16a34a", border:"none", color:"#fff", padding:"9px 18px", borderRadius:9,
    cursor:"pointer", fontSize:13, fontWeight:800, boxShadow:"0 6px 16px rgba(22,163,74,.3)" },
  endBtn:{ background:"#dc2626", border:"none", color:"#fff", padding:"9px 18px", borderRadius:9,
    cursor:"pointer", fontSize:13, fontWeight:800, boxShadow:"0 6px 16px rgba(220,38,38,.3)" },

  tabs:{ display:"flex", gap:4, marginBottom:18, background:"rgba(255,255,255,.05)",
    border:"1px solid rgba(255,255,255,.08)", borderRadius:12, padding:4, flexWrap:"wrap" },
  tab:{ flex:1, minWidth:90, background:"none", border:"none", color:"#9aa6d0", padding:"10px 12px",
    cursor:"pointer", fontSize:13, fontWeight:700, borderRadius:9, display:"flex", alignItems:"center",
    justifyContent:"center", gap:4 },
  tabOn:{ background:"rgba(145,70,255,.22)", color:"#e9ddff", boxShadow:"inset 0 0 0 1px rgba(145,70,255,.4)" },
  tabDot:{ display:"inline-flex", alignItems:"center", justifyContent:"center", minWidth:18, height:18,
    fontSize:11, fontWeight:900, color:"#fff", background:"#dc2626", borderRadius:9, padding:"0 5px" },

  card:{ background:"rgba(16,28,66,.72)", border:"1px solid rgba(255,255,255,.1)", borderRadius:16,
    padding:"clamp(16px,4vw,24px)", boxShadow:"0 10px 30px rgba(0,0,0,.28)" },
  cardH:{ fontSize:15, fontWeight:800, margin:"0 0 16px" },
  label:{ display:"block", fontSize:11, color:"#8e9ac4", textTransform:"uppercase", letterSpacing:"0.08em",
    marginBottom:6, marginTop:14 },
  miniLabel:{ fontSize:10, color:"#8e9ac4", textTransform:"uppercase", letterSpacing:"0.08em", marginBottom:6 },
  input:{ width:"100%", background:"rgba(255,255,255,.06)", border:"1px solid rgba(255,255,255,.16)", borderRadius:10,
    color:"#eef0ff", padding:"11px 14px", fontSize:14, fontFamily:"inherit", outline:"none", boxSizing:"border-box" },
  optEditor:{ background:"rgba(255,255,255,.04)", border:"1px solid rgba(255,255,255,.1)", borderRadius:12,
    padding:14, marginBottom:10 },
  chipOdds:{ background:"rgba(255,255,255,.07)", border:"1px solid rgba(255,255,255,.16)", color:"#b6c0e6",
    padding:"8px 16px", borderRadius:9, cursor:"pointer", fontSize:14, fontWeight:800 },
  chipOddsOn:{ background:"#fbbf24", border:"1px solid #fbbf24", color:"#1a1400" },
  addBtn:{ background:"none", border:"1px dashed rgba(255,255,255,.2)", color:"#8e9ac4", padding:10,
    borderRadius:10, cursor:"pointer", width:"100%", fontSize:13, marginTop:4 },
  rmBtn:{ background:"rgba(248,113,113,.12)", border:"1px solid rgba(248,113,113,.35)", color:"#f87171",
    borderRadius:9, padding:"0 14px", cursor:"pointer", fontSize:14 },
  rmBtnSm:{ background:"rgba(248,113,113,.12)", border:"1px solid rgba(248,113,113,.35)", color:"#f87171",
    borderRadius:7, padding:"4px 9px", cursor:"pointer", fontSize:12, flexShrink:0 },

  // ── Cartes de marché, style bookmaker ──
  mCard:{ background:"rgba(16,28,66,.78)", border:"1px solid rgba(255,255,255,.1)", borderRadius:16,
    marginBottom:14, overflow:"hidden", boxShadow:"0 10px 28px rgba(0,0,0,.3)" },
  mHeader:{ display:"flex", justifyContent:"space-between", alignItems:"center", gap:12, padding:"12px 16px",
    background:"linear-gradient(90deg, rgba(124,58,237,.35), rgba(37,60,140,.25))",
    borderBottom:"1px solid rgba(255,255,255,.08)" },
  mTitle:{ fontSize:14, fontWeight:800, flex:1, lineHeight:1.4, color:"#f4f2ff" },
  mBody:{ padding:16 },
  oddsGrid:{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(110px,1fr))", gap:10 },
  oddsBtn:{ background:"#fff", borderRadius:12, padding:"12px 10px", textAlign:"center",
    border:"2px solid transparent", transition:"transform .12s, box-shadow .12s", userSelect:"none" },
  oddsBtnSel:{ border:"2px solid #7c3aed", boxShadow:"0 0 0 4px rgba(124,58,237,.25)", transform:"translateY(-2px)" },
  oddsBtnMine:{ border:"2px solid #a855f7", background:"#f6f0ff" },
  oddsBtnWin:{ border:"2px solid #16a34a", background:"#effcf3" },
  oddsLabel:{ fontSize:12, color:"#4b5563", fontWeight:700, marginBottom:4,
    overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" },
  oddsValue:{ fontSize:22, fontWeight:900, color:"#dc2626", lineHeight:1.1, fontFamily:"'DM Mono',monospace" },
  oddsMeta:{ fontSize:10, color:"#9ca3af", marginTop:4 },
  oddsMine:{ fontSize:10, color:"#7c3aed", marginTop:4, fontWeight:800 },

  slip:{ marginTop:14, background:"rgba(255,255,255,.05)", border:"1px solid rgba(255,255,255,.12)",
    borderRadius:12, padding:14 },
  slipEmpty:{ fontSize:13, color:"#8e9ac4", textAlign:"center", padding:"6px 0" },
  slipTop:{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:8, flexWrap:"wrap", gap:6 },
  slipLabel:{ fontSize:11, color:"#8e9ac4", textTransform:"uppercase", letterSpacing:"0.08em" },
  slipWin:{ fontSize:12, color:"#4ade80" },
  quickBtn:{ background:"rgba(255,255,255,.08)", border:"1px solid rgba(255,255,255,.16)", color:"#dfe4f7",
    borderRadius:8, padding:"9px 8px", cursor:"pointer", fontSize:12, fontWeight:700 },

  mFoot:{ display:"flex", justifyContent:"space-between", alignItems:"center", marginTop:14, flexWrap:"wrap", gap:8 },
  linkBtn:{ background:"none", border:"none", color:"#8e9ac4", cursor:"pointer", fontSize:12, padding:0, fontWeight:600 },
  closeBtn:{ background:"rgba(251,191,36,.14)", border:"1px solid rgba(251,191,36,.45)", color:"#fbbf24",
    padding:"7px 13px", borderRadius:8, cursor:"pointer", fontSize:12, fontWeight:700 },
  resolveBtn:{ background:"rgba(74,222,128,.14)", border:"1px solid rgba(74,222,128,.45)", color:"#4ade80",
    padding:"7px 13px", borderRadius:8, cursor:"pointer", fontSize:12, fontWeight:700 },
  undoBtn:{ background:"rgba(255,255,255,.08)", border:"1px solid rgba(255,255,255,.22)", color:"#dfe4f7",
    padding:"7px 14px", borderRadius:8, cursor:"pointer", fontSize:12, fontWeight:700 },
  cancelBtn:{ background:"rgba(248,113,113,.12)", border:"1px solid rgba(248,113,113,.4)", color:"#f87171",
    padding:"6px 12px", borderRadius:8, cursor:"pointer", fontSize:12, fontWeight:700, whiteSpace:"nowrap" },

  betsList:{ marginTop:12, borderTop:"1px solid rgba(255,255,255,.1)", paddingTop:10 },
  betsEmpty:{ fontSize:12, color:"#6b7aa8", textAlign:"center", padding:"10px 0" },
  betRow:{ display:"flex", alignItems:"center", gap:9, padding:"8px 0",
    borderBottom:"1px solid rgba(255,255,255,.06)" },
  betAva:{ width:26, height:26, borderRadius:"50%", objectFit:"cover", flexShrink:0 },
  betName:{ fontSize:13, fontWeight:700, flex:1, minWidth:0, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" },
  betOpt:{ fontSize:11, color:"#b6c0e6", background:"rgba(255,255,255,.07)", padding:"2px 8px",
    borderRadius:10, whiteSpace:"nowrap" },
  betAmt:{ fontSize:12, fontWeight:800, color:"#c4b5fd", whiteSpace:"nowrap" },

  badgeOpen:{ fontSize:11, color:"#052e16", background:"#4ade80", padding:"4px 11px", borderRadius:20,
    whiteSpace:"nowrap", fontWeight:800 },
  badgeClosed:{ fontSize:11, color:"#1a1400", background:"#fbbf24", padding:"4px 11px", borderRadius:20,
    whiteSpace:"nowrap", fontWeight:800 },
  badgeResolved:{ fontSize:11, color:"#dfe4f7", background:"rgba(255,255,255,.14)", padding:"4px 11px",
    borderRadius:20, whiteSpace:"nowrap", fontWeight:800 },

  myBetNote:{ marginTop:12, fontSize:13, color:"#c4b5fd", background:"rgba(145,70,255,.12)",
    border:"1px solid rgba(145,70,255,.3)", borderRadius:10, padding:"10px 14px",
    display:"flex", justifyContent:"space-between", alignItems:"center", gap:10, flexWrap:"wrap" },

  viewerTopBar:{ display:"flex", justifyContent:"space-between", alignItems:"center", background:"rgba(16,28,66,.72)",
    border:"1px solid rgba(255,255,255,.1)", borderRadius:16, padding:"18px 20px", marginBottom:18, gap:16,
    boxShadow:"0 10px 30px rgba(0,0,0,.28)" },
  viewerLeft:{ display:"flex", alignItems:"center", gap:14 },
  bigAva:{ width:50, height:50, borderRadius:"50%", border:"2px solid #9146ff", flexShrink:0 },
  viewerName:{ fontSize:18, fontWeight:900 },
  viewerSub:{ fontSize:13, color:"#8e9ac4", marginTop:2 },
  statsRow:{ display:"flex", gap:20 },
  statBox:{ textAlign:"center" },
  statVal:{ fontSize:20, fontWeight:900 },
  statLab:{ fontSize:10, color:"#7b88b5", textTransform:"uppercase", letterSpacing:"0.08em" },
  lobbyBanner:{ background:"rgba(145,70,255,.12)", border:"1px solid rgba(145,70,255,.3)", borderRadius:10,
    padding:"12px 18px", fontSize:14, color:"#c4b5fd", textAlign:"center", marginBottom:18 },

  rebuyBox:{ background:"linear-gradient(135deg, rgba(180,83,9,.25), rgba(124,58,237,.2))",
    border:"1px solid rgba(251,191,36,.45)", borderRadius:14, padding:"18px 20px", marginBottom:18, textAlign:"center" },
  rebuyTitle:{ fontSize:16, fontWeight:900, color:"#fbbf24", marginBottom:6 },
  rebuyHint:{ fontSize:13, color:"#c9d0ea", lineHeight:1.6 },
  rebuyNotice:{ fontSize:12, color:"#9aa6d0", background:"rgba(255,255,255,.05)", border:"1px solid rgba(255,255,255,.12)",
    borderRadius:10, padding:"10px 14px", marginBottom:16, lineHeight:1.6 },
  rebuyRow:{ display:"flex", alignItems:"center", gap:12, padding:"12px 0",
    borderBottom:"1px solid rgba(255,255,255,.07)", flexWrap:"wrap" },
  rebuyName:{ fontSize:14, fontWeight:700 },
  rebuySub:{ fontSize:12, color:"#8e9ac4", marginTop:2 },

  lbRow:{ display:"flex", alignItems:"center", gap:10, padding:"11px 0", borderBottom:"1px solid rgba(255,255,255,.07)" },
  lbMe:{ background:"rgba(145,70,255,.1)", borderRadius:10, padding:"11px 10px", margin:"0 -10px" },
  lbRank:{ fontSize:16, width:30, textAlign:"center", flexShrink:0 },
  lbAva:{ width:32, height:32, borderRadius:"50%", objectFit:"cover", flexShrink:0 },
  lbName:{ flex:1, fontSize:14, fontWeight:700, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" },
  lbBal:{ fontSize:14, fontWeight:800, color:"#c4b5fd", whiteSpace:"nowrap" },
  lbLast:{ fontSize:12, fontWeight:800, whiteSpace:"nowrap", minWidth:62, textAlign:"right" },

  resultsWrap:{ maxWidth:580, margin:"0 auto", textAlign:"center" },
  resTitle:{ fontSize:"clamp(30px,8vw,46px)", fontWeight:900, margin:"32px 0 8px" },
  resSub:{ fontSize:15, color:"#8e9ac4", marginBottom:32 },
  winCard:{ background:"linear-gradient(135deg, rgba(124,58,237,.3), rgba(22,163,74,.18))",
    border:"2px solid #a855f7", borderRadius:20, padding:"clamp(20px,5vw,34px) 24px", marginBottom:26,
    boxShadow:"0 16px 44px rgba(124,58,237,.3)" },
  winAva:{ width:80, height:80, borderRadius:"50%", border:"3px solid #a855f7", marginBottom:12 },
  winName:{ fontSize:"clamp(20px,5vw,28px)", fontWeight:900, marginBottom:8 },
  winBal:{ fontSize:"clamp(24px,6vw,32px)", fontWeight:900, color:"#c4b5fd", marginBottom:8 },
  winLabel:{ fontSize:12, color:"#4ade80", letterSpacing:"0.15em", textTransform:"uppercase", fontWeight:800 },
  myRank:{ fontSize:16, color:"#9aa6d0", marginBottom:8 },

  empty:{ textAlign:"center", color:"#6b7aa8", padding:"36px 0", fontSize:14 },
  emptyLink:{ color:"#c4b5fd", cursor:"pointer" },
  loader:{ textAlign:"center", color:"#c4b5fd", padding:60, fontSize:24 },
  errBanner:{ background:"rgba(220,38,38,.15)", border:"1px solid rgba(220,38,38,.5)", borderRadius:10,
    padding:"12px 18px", color:"#fca5a5", fontSize:14, marginBottom:18,
    display:"flex", justifyContent:"space-between", alignItems:"center" },
  errClose:{ background:"none", border:"none", color:"#fca5a5", cursor:"pointer", fontSize:16 },
};

const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800;900&family=DM+Mono:wght@400;500&display=swap');
  *{box-sizing:border-box;}
  body{margin:0;background:#050b24;}
  input:focus,textarea:focus{border-color:#a855f7!important;box-shadow:0 0 0 3px rgba(168,85,247,.2);}
  input::placeholder{color:#6b7aa8;}
  button{font-family:inherit;}
  button:hover{filter:brightness(1.12);}
  .toast{position:fixed;bottom:24px;right:24px;padding:13px 20px;border-radius:10px;font-size:14px;
    font-family:'Syne',sans-serif;z-index:9999;animation:fadeUp .2s ease;max-width:340px;line-height:1.5;
    box-shadow:0 10px 30px rgba(0,0,0,.4);}
  .toast-ok{background:#0b3d20;border:1px solid #4ade80;color:#86efac;}
  .toast-err{background:#3d0b0b;border:1px solid #f87171;color:#fca5a5;}
  @keyframes fadeUp{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:none}}
  .spin{display:inline-block;animation:spin 1s linear infinite;}
  @keyframes spin{to{transform:rotate(360deg)}}
  ::-webkit-scrollbar{width:6px;}
  ::-webkit-scrollbar-track{background:#050b24;}
  ::-webkit-scrollbar-thumb{background:#2a3a68;border-radius:3px;}
`;
