'use client';

import { useEffect, useRef, useState } from 'react';
import { 
  ArrowUpRight, ArrowRight, MapPin, Waves, Sun, Mountain, 
  Compass, Heart, X, Menu, Leaf, ChevronRight, Download, 
  Check, Signal, Landmark 
} from 'lucide-react';



const BASE_PATH =
  process.env.NODE_ENV === "production"
    ? "/pangasinan-heritage"
    : "";


// --- Types & Data ---

type Place = { 
  id: string; 
  title: string; 
  town: string; 
  category: string; 
  image: string; 
  intro: string; 
  story: string; 
  tips: string[]; 
  source: string; 
  label: string;
};

const places: Place[] = [
  { 
    id: 'islands', title: 'Hundred Islands', town: 'Alaminos City', category: 'Island escapes', 
    image: `${BASE_PATH}/images/hundred.jpg`, intro: 'A little island. A whole new perspective.', 
    story: 'Discover the island-dotted waters of the Hundred Islands National Park in Alaminos. Limestone formations, quiet coves and sea views make this a distinctive part of Pangasinan’s natural heritage.', 
    tips: ['Arrange your visit through the local tourism office at Lucap.', 'Bring drinking water, sun protection and a reusable bag.', 'Follow your boat operator’s safety instructions and leave marine life undisturbed.'], 
    source: 'https://www.pangasinan.gov.ph/city-municipalities/alaminos-city/', label: 'Sea & discovery' 
  },
  { 
    id: 'lighthouse', title: 'Cape Bolinao Lighthouse', town: 'Bolinao', category: 'Heritage trails', 
    image: `${BASE_PATH}/images/light.jpg`, intro: 'Follow the coast. Find a story.', 
    story: 'Above the coast of Patar, Cape Bolinao Lighthouse connects the landscape with the province’s maritime story. Take time to appreciate the landmark and the coastal communities around it.', 
    tips: ['Confirm current access with the local tourism office.', 'Bring sun protection for the exposed grounds.', 'Respect barriers and signs; tower access should not be assumed.'], 
    source: 'https://bolinaopangasinan.gov.ph/services/tourism-3/', label: 'History & horizons' 
  },
  { 
    id: 'springs', title: 'Balungao Hot Springs', town: 'Balungao', category: 'Nature retreats', 
    image: `${BASE_PATH}/images/spring.jpg`, intro: 'Slow days, warm waters, greener views.', 
    story: 'At the foot of Mount Balungao, hot and cold springs offer a different side of Pangasinan. Trade the coastline for an inland landscape and discover the town’s connection to its mountain and local traditions.', 
    tips: ['Check operating hours and facilities directly before traveling.', 'Bring swimwear, a towel and a change of clothes.', 'Follow posted pool guidance and keep the surroundings clean.'], 
    source: 'https://www.balungao.gov.ph/?page_id=595', label: 'Nature & renewal' 
  }
];

const categories = ['All destinations', 'Island escapes', 'Heritage trails', 'Nature retreats'];

// --- Custom Hook for Business Logic ---

function useTripPlanner() {
  const [saved, setSaved] = useState<string[]>([]);
  const [isLowDataMode, setIsLowDataMode] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  // Load initial data
  useEffect(() => {
    try {
      const storedTrips = JSON.parse(localStorage.getItem('pangasinan-trip') || '[]');
      if (Array.isArray(storedTrips)) {
        setSaved(storedTrips.filter(id => typeof id === 'string' && places.some(p => p.id === id)));
      }
      
      const navConnection = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection;
      const isLowDataPref = localStorage.getItem('pangasinan-low') === 'true' || Boolean(navConnection?.saveData);
      setIsLowDataMode(isLowDataPref);
    } catch (e) {
      console.warn("Could not load from localStorage", e);
    }
    setIsReady(true);
  }, []);

  // Save changes to localStorage
  useEffect(() => {
    if (!isReady) return;
    try {
      localStorage.setItem('pangasinan-trip', JSON.stringify(saved));
      localStorage.setItem('pangasinan-low', String(isLowDataMode));
    } catch {
      setToastMessage('Storage is unavailable. Your choices will last for this visit.');
    }
  }, [saved, isLowDataMode, isReady]);

  // Handle toast timeout
  useEffect(() => {
    if (!toastMessage) return;
    const timer = setTimeout(() => setToastMessage(''), 4000);
    return () => clearTimeout(timer);
  }, [toastMessage]);

  const togglePlace = (place: Place) => {
    setSaved(current => {
      const isSaved = current.includes(place.id);
      setToastMessage(isSaved ? `${place.title} removed from your trip` : `${place.title} saved to your trip`);
      return isSaved ? current.filter(id => id !== place.id) : [...current, place.id];
    });
  };

  const downloadTrip = () => {
    const savedPlaces = places.filter(p => saved.includes(p.id));
    const textContent = 'MY PANGASINAN TRIP\n\n' + 
      savedPlaces.map(p => `${p.title} — ${p.town}\n${p.story}\n${p.tips.map(t => '• ' + t).join('\n')}\nOfficial information: ${p.source}`).join('\n\n') + 
      '\n\nConfirm rates, access and opening hours before departure. These destinations are spread across the province; plan transport and overnight stops separately.';
    
    const blobUrl = URL.createObjectURL(new Blob([textContent], { type: 'text/plain;charset=utf-8' }));
    const anchor = document.createElement('a');
    anchor.href = blobUrl;
    anchor.download = 'my-pangasinan-trip.txt';
    anchor.click();
    setTimeout(() => URL.revokeObjectURL(blobUrl), 1000);
  };

  return { saved, isLowDataMode, setIsLowDataMode, isReady, toastMessage, togglePlace, downloadTrip };
}

// --- Main Component ---

export default function Home() {
  const { saved, isLowDataMode, setIsLowDataMode, isReady, toastMessage, togglePlace, downloadTrip } = useTripPlanner();
  
  const [activeCategory, setActiveCategory] = useState(categories[0]);
  const [activePlace, setActivePlace] = useState<Place | null>(null);
  const [isPlannerOpen, setIsPlannerOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [photoErrors, setPhotoErrors] = useState<string[]>([]);

  const placeDialogRef = useRef<HTMLDialogElement>(null);
  const plannerDialogRef = useRef<HTMLDialogElement>(null);

  // Manage Dialog states and body scroll lock
  useEffect(() => {
    const activeDialog = activePlace ? placeDialogRef.current : isPlannerOpen ? plannerDialogRef.current : null;
    
    if (activePlace) placeDialogRef.current?.showModal();
    else placeDialogRef.current?.close();

    if (isPlannerOpen) plannerDialogRef.current?.showModal();
    else plannerDialogRef.current?.close();

    document.body.style.overflow = activePlace || isPlannerOpen ? 'hidden' : '';

    return () => { document.body.style.overflow = ''; };
  }, [activePlace, isPlannerOpen]);

  const closeModals = () => {
    setActivePlace(null);
    setIsPlannerOpen(false);
  };

  // Shared Photo Component
  const Photo = ({ place, isHero = false }: { place: Place, isHero?: boolean }) => {
    const showImage = isReady && !isLowDataMode && !photoErrors.includes(place.id);
    
    return (
      <div className={`photo ${isHero ? 'hero-photo' : ''}`}>
        {showImage ? (
          <img 
            src={place.image} 
            alt={`${place.title} in ${place.town}`} 
            width={isHero ? 1100 : 600} 
            height={isHero ? 1000 : 450} 
            loading={isHero ? 'eager' : 'lazy'} 
            fetchPriority={isHero ? 'high' : 'auto'} 
            onError={() => setPhotoErrors(prev => [...prev, place.id])} 
          />
        ) : (
          <div className="photo-fallback">
            <Compass size={48} />
            <span>{place.title}</span>
            <small>{isLowDataMode ? 'Low-data mode · Photos paused' : 'Pangasinan, Philippines'}</small>
          </div>
        )}
      </div>
    );
  };

  return (
    <>
      <a href="#main" className="skip">Skip to content</a>
      
      <header>
        <a className="brand" href="#">
          <span className="brand-symbol"><Waves size={26} /></span>
          <span>Pangasinan<small>WANDER. CONNECT. DISCOVER.</small></span>
        </a>
        
        <nav aria-label="Main navigation" className={isMenuOpen ? 'open' : ''}>
          <a href="#destinations" onClick={() => setIsMenuOpen(false)}>Discover</a>
          <a href="#our-story" onClick={() => setIsMenuOpen(false)}>Our story</a>
          <button onClick={() => { setIsPlannerOpen(true); setIsMenuOpen(false); }}>
            My trip <span className="count">{saved.length}</span>
          </button>
        </nav>
        
        <div className="header-actions">
          <button 
            className={`data-toggle ${isLowDataMode ? 'enabled' : ''}`} 
            aria-pressed={isLowDataMode} 
            onClick={() => setIsLowDataMode(!isLowDataMode)} 
            title="Pause photos to use less mobile data"
          >
            <Signal size={16} /><span>Low data</span><span className="switch" />
          </button>
          <button 
            className="menu-button" 
            aria-label="Toggle navigation" 
            aria-expanded={isMenuOpen} 
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X /> : <Menu />}
          </button>
        </div>
      </header>

      <main id="main">
        {/* HERO SECTION */}
        <section className="hero">
          <div className="hero-copy">
            <div className="eyebrow"><span /> YOUR NEXT STORY STARTS HERE</div>
            <h1>A place to<br />wander.<br /><em>A feeling to<br className="desktop-break" /> keep.</em></h1>
            <p>Island mornings. Coastal stories. A warm welcome.<br className="desktop-break" /> Find your kind of wonder in Pangasinan.</p>
            <a className="button primary" href="#destinations">Find your next escape <ArrowUpRight size={20} /></a>
            
            <div className="hero-foot">
              <span className="mini-compass"><Compass size={25} /></span>
              <span>Closer to nature.<br /><strong>Connected to our roots.</strong></span>
              <span className="coordinates">16.01° N<br />120.34° E</span>
            </div>
          </div>
          
          <div className="hero-visual">
            <Photo place={places[0]} isHero />
            <span className="vertical-caption">A DIFFERENT KIND OF GETAWAY</span>
            <div className="postmark"><Sun size={24} /><span>A little closer<br />to paradise</span></div>
            <div className="image-caption">
              <span>
                <small><MapPin size={13} /> ALAMINOS CITY</small>
                <strong>One hundred reasons<br />to fall in love.</strong>
              </span>
              <button aria-label="Explore Hundred Islands" onClick={() => setActivePlace(places[0])}>
                <ArrowUpRight />
              </button>
            </div>
          </div>
        </section>

        <div className="ribbon">
          <span><Waves /> Coastlines worth the journey</span><span>✳</span>
          <span><Landmark /> Stories that stay with you</span><span>✳</span>
          <span><Leaf /> Travel gently. Discover deeply.</span>
        </div>

        {/* DESTINATIONS SECTION */}
        <section className="destinations section" id="destinations">
          <div className="section-heading">
            <div>
              <div className="eyebrow">THREE PLACES. COUNTLESS POSSIBILITIES.</div>
              <h2>Where will your<br /><em>curiosity take you?</em></h2>
            </div>
            <p>From sea-swept islands to quiet mountain escapes,<br className="desktop-break" /> there’s a corner of Pangasinan calling your name.</p>
          </div>
          
          <div className="filters" aria-label="Filter destinations">
            {categories.map((cat, i) => (
              <button 
                key={cat} 
                aria-pressed={activeCategory === cat} 
                className={activeCategory === cat ? 'selected' : ''} 
                onClick={() => setActiveCategory(cat)}
              >
                {i === 0 ? <Compass size={17} /> : i === 1 ? <Waves size={17} /> : i === 2 ? <Landmark size={17} /> : <Mountain size={17} />} {cat}
              </button>
            ))}
          </div>
          
          <div className="cards">
            {places
              .filter(p => activeCategory === categories[0] || activeCategory === p.category)
              .map((p) => (
                <article className="card" key={p.id}>
                  <div className="card-image">
                    <button className="photo-button" aria-label={`Discover ${p.title}`} onClick={() => setActivePlace(p)}>
                      <Photo place={p} />
                    </button>
                    <span className="card-tag">{p.label}</span>
                    <button 
                      className={`save ${saved.includes(p.id) ? 'saved' : ''}`} 
                      aria-label={`${saved.includes(p.id) ? 'Remove ' : 'Save '} ${p.title}`} 
                      aria-pressed={saved.includes(p.id)} 
                      onClick={() => togglePlace(p)}
                    >
                      <Heart size={19} fill={saved.includes(p.id) ? 'currentColor' : 'none'} />
                    </button>
                  </div>
                  <div className="card-body">
                    <small><MapPin size={13} />{p.town.toUpperCase()}</small>
                    <h3><button onClick={() => setActivePlace(p)}>{p.title}</button></h3>
                    <p>{p.intro}</p>
                    <button className="text-link" onClick={() => setActivePlace(p)}>
                      Meet your next escape <ArrowUpRight size={18} />
                    </button>
                  </div>
                </article>
            ))}
          </div>
          
          <p className="results" aria-live="polite">
            {activeCategory === categories[0] 
              ? 'Three signature destinations. One unforgettable province.' 
              : `${places.filter(p => p.category === activeCategory).length} destination to discover`}
          </p>
        </section>

        {/* STORY SECTION */}
        <section className="story section" id="our-story">
          <div className="story-intro">
            <div className="eyebrow">MORE THAN A PLACE ON THE MAP</div>
            <h2>Come for the views.<br /><em>Stay for the stories.</em></h2>
            <p>Pangasinan’s character lives in its coastlines, its inland towns, and the communities that call it home. Every visit is a chance to listen, learn, and leave with a deeper connection.</p>
            <a href="https://www.pangasinan.gov.ph/" target="_blank" rel="noreferrer" className="text-link">
              Get to know Pangasinan <ArrowUpRight size={18} />
            </a>
          </div>
          <div className="values">
            <div>
              <span>01</span>
              <div>
                <h3>Make it local.</h3>
                <p>Choose local guides, try regional food, and make space for the stories people share.</p>
              </div>
            </div>
            <div>
              <span>02</span>
              <div>
                <h3>Leave only light footsteps.</h3>
                <p>Bring reusables, respect wildlife, and take your waste home. Small choices protect extraordinary places.</p>
              </div>
            </div>
            <div>
              <span>03</span>
              <div>
                <h3>Take your time.</h3>
                <p>These destinations span the province. Check local travel conditions and give each place room in your itinerary.</p>
              </div>
            </div>
          </div>
        </section>

        {/* TRIP BANNER SECTION */}
        <section className="trip-banner">
          <div>
            <span className="eyebrow">A LITTLE PLANNING. A LOT OF POSSIBILITY.</span>
            <h2>Your next chapter<br />looks good from here.</h2>
          </div>
          <button className="button light" onClick={() => setIsPlannerOpen(true)}>
            Open my trip <ArrowRight size={20} />
          </button>
        </section>
      </main>

      <footer>
        <a className="brand" href="#">
          <span className="brand-symbol"><Waves size={25} /></span>
          <span>Pangasinan<small>KEEP EXPLORING.</small></span>
        </a>
        <p>A concept travel guide inspired by Pangasinan.<br />Independent demonstration · Not an official government website.<br />
        <a href="/photo-credits.txt" target="_blank" rel="noreferrer">Photo credits &amp; licenses</a></p>
        <a href="#main">Back to the sunshine ↑</a>
      </footer>

      {/* PLACE DETAILS DIALOG */}
      <dialog ref={placeDialogRef} onCancel={closeModals} onClick={e => { if (e.target === placeDialogRef.current) closeModals(); }}>
        <button className="close" aria-label="Close panel" onClick={closeModals}><X /></button>
        {activePlace && (
          <div className="detail">
            <Photo place={activePlace} />
            <div className="detail-body">
              <div className="eyebrow">{activePlace.town} · {activePlace.category}</div>
              <h2>{activePlace.title}</h2>
              <p>{activePlace.story}</p>
              <h3>Before you go</h3>
              <ul>
                {activePlace.tips.map(t => <li key={t}>{t}</li>)}
              </ul>
              <p className="note">Check current rates, schedules and accessibility with the destination before your visit.</p>
              <div className="detail-actions">
                <button className="button primary" onClick={() => togglePlace(activePlace)}>
                  {saved.includes(activePlace.id) ? <Check size={18} /> : <Heart size={18} />} 
                  {saved.includes(activePlace.id) ? 'Saved to my trip' : 'Save to my trip'}
                </button>
                <a className="text-link" target="_blank" rel="noreferrer" href={activePlace.source}>
                  Official information <ArrowUpRight size={18} />
                </a>
              </div>
            </div>
          </div>
        )}
      </dialog>

      {/* TRIP PLANNER DIALOG */}
      <dialog ref={plannerDialogRef} onCancel={closeModals} onClick={e => { if (e.target === plannerDialogRef.current) closeModals(); }}>
        <button className="close" aria-label="Close panel" onClick={closeModals}><X /></button>
        <div className="planner">
          <div className="eyebrow">YOUR PERSONAL LITTLE GETAWAY</div>
          <h2>My Pangasinan trip</h2>
          <p>Save a little inspiration. Take it with you.</p>
          
          {saved.length > 0 ? (
            <>
              <div className="saved-list">
                {places.filter(p => saved.includes(p.id)).map(p => (
                  <div key={p.id}>
                    <MapPin />
                    <div>
                      <h3>{p.title}</h3>
                      <span>{p.town}</span>
                    </div>
                    <button aria-label={`Remove ${p.title}`} onClick={() => togglePlace(p)}>
                      <X size={18} />
                    </button>
                  </div>
                ))}
              </div>
              <p className="note">This is your shortlist, not a timed route. Arrange transport and confirm opening hours with each destination.</p>
              <button className="button primary" onClick={downloadTrip}>
                <Download size={18} /> Download trip notes
              </button>
            </>
          ) : (
            <div className="empty">
              <Compass size={48} />
              <h3>A good journey starts with a little curiosity.</h3>
              <p>Tap the heart on a destination to save it here.</p>
              <button className="button primary" onClick={() => { closeModals(); document.getElementById('destinations')?.scrollIntoView(); }}>
                Explore destinations <ChevronRight size={18} />
              </button>
            </div>
          )}
          <small className="privacy">Saved on this browser only. No account needed.</small>
        </div>
      </dialog>

      {/* TOAST NOTIFICATION */}
      <div role="status" className={`toast ${toastMessage ? 'visible' : ''}`}>
        {toastMessage}
      </div>
    </>
  );
}
