import { FormEvent, KeyboardEvent, useEffect, useMemo, useRef, useState } from 'react'
import { activity, demoTabTitles, seedCards, trails, type SourceCard } from './data'

type CapturedTab = { title: string; url: string; selected: boolean }
type Modal = 'capture' | 'note' | null
type BrowserTab = { title?: string; url?: string }
type BrowserChrome = { tabs?: { query: (options: { currentWindow: boolean }) => Promise<BrowserTab[]> } }

const icons = {
  compass: '⌘',
  plus: '+',
  search: '⌕',
  bolt: '↗',
  spark: '✦',
  close: '×',
  arrow: '→',
  dots: '•••',
  check: '✓',
  sun: '☼',
  book: '▤',
  keyboard: '⌘',
  frame: '⌗',
}

function initials(value: string) {
  return value
    .split(/\s|\./)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase()
}

function sourceDomain(url: string) {
  try {
    return new URL(url).hostname.replace(/^www\./, '')
  } catch {
    return 'Saved tab'
  }
}

function App() {
  const [cards, setCards] = useState<SourceCard[]>(seedCards)
  const [activeTrail, setActiveTrail] = useState('north-star')
  const [search, setSearch] = useState('')
  const [modal, setModal] = useState<Modal>(null)
  const [capturedTabs, setCapturedTabs] = useState<CapturedTab[]>([])
  const [captureError, setCaptureError] = useState('')
  const [isCapturing, setIsCapturing] = useState(false)
  const [selectedCard, setSelectedCard] = useState<SourceCard | null>(null)
  const [toast, setToast] = useState('')
  const [focusMode, setFocusMode] = useState(false)
  const [noteTitle, setNoteTitle] = useState('')
  const [noteBody, setNoteBody] = useState('')
  const [hydrated, setHydrated] = useState(false)
  const searchRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const saved = window.localStorage.getItem('browser-studio-cards')
    if (saved) {
      try {
        const parsed = JSON.parse(saved) as SourceCard[]
        if (Array.isArray(parsed) && parsed.length) setCards(parsed)
      } catch {
        window.localStorage.removeItem('browser-studio-cards')
      }
    }
    setHydrated(true)
  }, [])

  useEffect(() => {
    if (!hydrated) return
    window.localStorage.setItem('browser-studio-cards', JSON.stringify(cards))
  }, [cards, hydrated])

  useEffect(() => {
    if (!toast) return
    const timer = window.setTimeout(() => setToast(''), 2800)
    return () => window.clearTimeout(timer)
  }, [toast])

  useEffect(() => {
    const onKeyDown = (event: globalThis.KeyboardEvent) => {
      if (event.key === 'Escape') {
        setModal(null)
        setSelectedCard(null)
        return
      }
      const target = event.target as HTMLElement
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) return
      if (event.key === '/') {
        event.preventDefault()
        searchRef.current?.focus()
      }
      if (event.key.toLowerCase() === 'c') {
        event.preventDefault()
        void openCapture()
      }
      if (event.key.toLowerCase() === 'n') {
        event.preventDefault()
        setModal('note')
      }
      if (event.key.toLowerCase() === 'f') {
        setFocusMode((value) => !value)
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  })

  const filteredCards = useMemo(() => {
    const query = search.trim().toLowerCase()
    if (!query) return cards
    return cards.filter((card) =>
      [card.title, card.domain, card.note, ...card.tags, card.state].join(' ').toLowerCase().includes(query),
    )
  }, [cards, search])

  async function openCapture() {
    setModal('capture')
    setCaptureError('')
    setIsCapturing(true)
    try {
      let found: BrowserTab[] = []
      const extensionChrome = (globalThis as unknown as { chrome?: BrowserChrome }).chrome
      if (extensionChrome?.tabs?.query) {
        found = await extensionChrome.tabs.query({ currentWindow: true })
      }
      const usable = found.filter((tab) => tab.title && tab.url && !tab.url.startsWith('chrome://'))
      const tabs = (usable.length ? usable : demoTabTitles).slice(0, 6).map((tab) => ({
        title: tab.title || 'Untitled tab',
        url: tab.url || '#',
        selected: true,
      }))
      setCapturedTabs(tabs)
    } catch {
      setCapturedTabs(demoTabTitles.map((tab) => ({ ...tab, selected: true })))
      setCaptureError('We could not read this window, so Studio loaded a sample capture instead.')
    } finally {
      setIsCapturing(false)
    }
  }

  function saveCapture() {
    const selected = capturedTabs.filter((tab) => tab.selected)
    if (!selected.length) {
      setCaptureError('Choose at least one tab to make a trail.')
      return
    }
    const additions = selected.map<SourceCard>((tab, index) => ({
      id: `capture-${Date.now()}-${index}`,
      title: tab.title,
      domain: sourceDomain(tab.url),
      url: tab.url,
      type: 'Clip',
      accent: index % 2 ? 'blue' : 'lime',
      savedAt: 'Just now',
      note: 'Freshly captured — add the part you want to remember.',
      tags: ['inbox'],
      state: 'To distill',
      progress: 12,
    }))
    setCards((current) => [...additions, ...current])
    setModal(null)
    setToast(`${selected.length} ${selected.length === 1 ? 'tab is' : 'tabs are'} now in North Star.`)
  }

  function createNote(event: FormEvent) {
    event.preventDefault()
    const title = noteTitle.trim()
    const note = noteBody.trim()
    if (!title || !note) return
    const card: SourceCard = {
      id: `note-${Date.now()}`,
      title,
      domain: 'Personal note',
      url: '#note',
      type: 'Note',
      accent: 'coral',
      savedAt: 'Just now',
      note,
      tags: ['thought'],
      state: 'Spark',
      progress: 36,
    }
    setCards((current) => [card, ...current])
    setNoteTitle('')
    setNoteBody('')
    setModal(null)
    setToast('Your note was tucked into North Star.')
  }

  function visitSource(card: SourceCard) {
    if (card.url.startsWith('http') && !card.url.includes('example.com')) {
      window.open(card.url, '_blank', 'noopener,noreferrer')
      return
    }
    setToast('The portfolio demo uses placeholder source links.')
  }

  function keyActivate(event: KeyboardEvent<HTMLElement>, callback: () => void) {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      callback()
    }
  }

  return (
    <main className={focusMode ? 'app focus-on' : 'app'}>
      <aside className="sidebar" aria-label="Trails">
        <div className="brand-row">
          <div className="brand-mark" aria-hidden="true"><span></span><span></span><span></span></div>
          <div><strong>browser Studio</strong><small>1026</small></div>
          <button className="icon-button sidebar-hide" onClick={() => setFocusMode(true)} aria-label="Hide navigation">{icons.arrow}</button>
        </div>

        <button className="capture-button" onClick={() => void openCapture()}>
          <span>{icons.bolt}</span> Capture this window <kbd>C</kbd>
        </button>

        <div className="nav-section">
          <p className="eyebrow">Your trails</p>
          <div className="trail-list">
            {trails.map((trail) => (
              <button
                className={activeTrail === trail.id ? 'trail-row active' : 'trail-row'}
                key={trail.id}
                onClick={() => { setActiveTrail(trail.id); setToast(`${trail.title} is open.`) }}
                aria-current={activeTrail === trail.id ? 'page' : undefined}
              >
                <span className="trail-dot" style={{ background: trail.color }}></span>
                <span>{trail.title}</span>
                <b>{trail.count}</b>
              </button>
            ))}
          </div>
          <button className="new-trail" onClick={() => setToast('A blank trail is ready when your next question is.')}><span>{icons.plus}</span> New trail</button>
        </div>

        <div className="sidebar-bottom">
          <div className="pulse-card">
            <span className="pulse-icon">{icons.spark}</span>
            <p><b>Little by little.</b><br />You’ve kept 3 useful signals this week.</p>
          </div>
          <button className="help-link" onClick={() => setToast('Shortcuts: / search · C capture · N note · F focus')}>{icons.keyboard} Shortcuts</button>
        </div>
      </aside>

      <section className="workspace">
        <header className="topbar">
          <button className="show-nav" onClick={() => setFocusMode(false)} aria-label="Show navigation">{icons.compass}</button>
          <label className="search-box">
            <span aria-hidden="true">{icons.search}</span>
            <input ref={searchRef} value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search your trail" aria-label="Search your trail" />
            <kbd>/</kbd>
          </label>
          <div className="top-actions">
            <button className="quiet-button" onClick={() => setFocusMode((value) => !value)} aria-pressed={focusMode}><span>{icons.frame}</span> Focus view <kbd>F</kbd></button>
            <button className="avatar" onClick={() => setToast('Studio is saved locally in this browser.')} aria-label="Open profile">SA</button>
          </div>
        </header>

        <div className="content-scroll">
          <section className="trail-hero" aria-labelledby="trail-title">
            <div className="breadcrumb"><span>All trails</span><i>›</i><span>Product thinking</span></div>
            <div className="hero-title-row">
              <div>
                <div className="title-line"><h1 id="trail-title">North Star</h1><span className="status-dot"><i></i> In motion</span></div>
                <p>Signals for designing a calmer, more intentional workspace.</p>
              </div>
              <div className="hero-controls">
                <button className="round-control" aria-label="Trail options" onClick={() => setToast('Trail options are safely tucked away for now.')}>{icons.dots}</button>
                <button className="accent-button" onClick={() => setModal('note')}><span>{icons.plus}</span> Add thought <kbd>N</kbd></button>
              </div>
            </div>
            <div className="hero-meta">
              <span><b>{cards.length}</b> materials</span><span className="divider"></span><span>Updated just now</span><span className="divider"></span><span className="collaborators"><i>SA</i><i>MH</i> Small studio</span>
            </div>
          </section>

          <section className="studio-grid">
            <div className="materials-panel">
              <div className="section-heading">
                <div><p className="eyebrow">Collected materials</p><h2>{search ? `${filteredCards.length} matches` : 'The current pile'}</h2></div>
                <button className="filter-button" onClick={() => setToast('Everything is visible—Studio keeps the pile small on purpose.')}><span>⌘</span> All signals</button>
              </div>

              {filteredCards.length ? (
                <div className="card-grid" aria-label="Collected source cards">
                  {filteredCards.map((card) => (
                    <article
                      key={card.id}
                      className={`source-card ${card.accent}`}
                      tabIndex={0}
                      role="button"
                      aria-label={`Open details for ${card.title}`}
                      onClick={() => setSelectedCard(card)}
                      onKeyDown={(event) => keyActivate(event, () => setSelectedCard(card))}
                    >
                      <div className="card-top"><span className="source-badge">{initials(card.domain)}</span><span className="card-type">{card.type}</span><button className="card-menu" aria-label={`More actions for ${card.title}`} onClick={(event) => { event.stopPropagation(); setSelectedCard(card) }}>{icons.dots}</button></div>
                      <div className="card-body"><h3>{card.title}</h3><p>{card.note}</p></div>
                      <div className="card-footer"><span>{card.domain}</span><span>{card.savedAt}</span></div>
                      <div className="progress-track" aria-label={`${card.progress}% distilled`}><i style={{ width: `${card.progress}%` }}></i></div>
                    </article>
                  ))}
                </div>
              ) : (
                <div className="empty-state">
                  <div className="empty-orbit">{icons.search}</div>
                  <h3>Nothing is answering that yet.</h3>
                  <p>Try a wider phrase, or capture the tabs that started the question.</p>
                  <button className="accent-button" onClick={() => void openCapture()}>{icons.bolt} Capture a window</button>
                </div>
              )}
            </div>

            <aside className="insight-rail" aria-label="Trail details">
              <section className="prompt-card">
                <div className="mini-label"><span>{icons.spark}</span> This trail is asking</div>
                <h2>What would make work feel lighter without making it less rigorous?</h2>
                <button onClick={() => setModal('note')}>Add a response <span>{icons.arrow}</span></button>
              </section>
              <section className="trail-map">
                <div className="rail-heading"><p className="eyebrow">Trail shape</p><button onClick={() => setToast('Your trail has a healthy mix of sparks and kept sources.')}>Why this?</button></div>
                <div className="map-bars">
                  <div><span>Fresh</span><i style={{ width: '42%' }}></i><b>3</b></div>
                  <div><span>Sparks</span><i style={{ width: '74%' }}></i><b>4</b></div>
                  <div><span>Kept</span><i style={{ width: '28%' }}></i><b>1</b></div>
                </div>
              </section>
              <section className="activity-list">
                <p className="eyebrow">Tiny history</p>
                {activity.map((item) => <div className="activity-row" key={item.time}><time>{item.time}</time><p>{item.text}</p></div>)}
              </section>
            </aside>
          </section>

          <footer className="workspace-footer"><span>{icons.sun} Made for slower collecting.</span><button onClick={() => { setCards(seedCards); setSearch(''); setToast('Demo trail restored.'); }}>Restore demo trail</button></footer>
        </div>
      </section>

      {modal === 'capture' && (
        <div className="modal-backdrop" role="presentation" onMouseDown={() => setModal(null)}>
          <section className="modal capture-modal" role="dialog" aria-modal="true" aria-labelledby="capture-title" onMouseDown={(event) => event.stopPropagation()}>
            <div className="modal-header"><div><p className="eyebrow">Quick collection</p><h2 id="capture-title">Make a trail from this window</h2></div><button className="round-control" onClick={() => setModal(null)} aria-label="Close capture">{icons.close}</button></div>
            <p className="modal-intro">Pick the tabs with momentum. Studio will save a thoughtful starting point—never a noisy dump.</p>
            {isCapturing ? <div className="loading-state"><span></span><span></span><span></span><p>Looking through this window…</p></div> : <div className="capture-list">
              {capturedTabs.map((tab, index) => <label className="capture-tab" key={`${tab.url}-${index}`}><input type="checkbox" checked={tab.selected} onChange={() => setCapturedTabs((items) => items.map((item, i) => i === index ? { ...item, selected: !item.selected } : item))} /><span className="tab-favicon">{initials(sourceDomain(tab.url))}</span><span><b>{tab.title}</b><small>{sourceDomain(tab.url)}</small></span><i>{tab.selected ? icons.check : ''}</i></label>)}
            </div>}
            {captureError && <p className="inline-error" role="alert">{captureError}</p>}
            <div className="modal-footer"><span>{capturedTabs.filter((tab) => tab.selected).length} selected</span><div><button className="quiet-button" onClick={() => setModal(null)}>Cancel</button><button className="accent-button" onClick={saveCapture} disabled={isCapturing}>Add to North Star {icons.arrow}</button></div></div>
          </section>
        </div>
      )}

      {modal === 'note' && (
        <div className="modal-backdrop" role="presentation" onMouseDown={() => setModal(null)}>
          <form className="modal note-modal" role="dialog" aria-modal="true" aria-labelledby="note-title" onSubmit={createNote} onMouseDown={(event) => event.stopPropagation()}>
            <div className="modal-header"><div><p className="eyebrow">A small thought</p><h2 id="note-title">Leave a breadcrumb</h2></div><button type="button" className="round-control" onClick={() => setModal(null)} aria-label="Close note composer">{icons.close}</button></div>
            <label className="form-field"><span>Title</span><input autoFocus value={noteTitle} onChange={(event) => setNoteTitle(event.target.value)} placeholder="A short thing worth keeping" /></label>
            <label className="form-field"><span>What do you want to remember?</span><textarea value={noteBody} onChange={(event) => setNoteBody(event.target.value)} placeholder="The connection, the hunch, the question…" rows={5} /></label>
            <div className="modal-footer"><span>Saved only in this browser</span><button className="accent-button" type="submit" disabled={!noteTitle.trim() || !noteBody.trim()}>Keep this thought {icons.arrow}</button></div>
          </form>
        </div>
      )}

      {selectedCard && (
        <div className="detail-backdrop" role="presentation" onMouseDown={() => setSelectedCard(null)}>
          <aside className="detail-card" role="dialog" aria-modal="true" aria-labelledby="detail-title" onMouseDown={(event) => event.stopPropagation()}>
            <div className={`detail-banner ${selectedCard.accent}`}><button className="round-control" onClick={() => setSelectedCard(null)} aria-label="Close source details">{icons.close}</button><span className="source-badge">{initials(selectedCard.domain)}</span></div>
            <div className="detail-content"><p className="eyebrow">{selectedCard.type} · {selectedCard.domain}</p><h2 id="detail-title">{selectedCard.title}</h2><p className="detail-note">{selectedCard.note}</p><div className="tag-row">{selectedCard.tags.map((tag) => <span key={tag}>#{tag}</span>)}</div><div className="detail-status"><span>{selectedCard.state}</span><b>{selectedCard.progress}% distilled</b></div><button className="source-link" onClick={() => visitSource(selectedCard)}><span>{icons.book}</span> Visit original source <b>{icons.arrow}</b></button><button className="remove-link" onClick={() => { setCards((current) => current.filter((card) => card.id !== selectedCard.id)); setSelectedCard(null); setToast('Source removed from this trail.'); }}>Remove from trail</button></div>
          </aside>
        </div>
      )}

      {toast && <div className="toast" role="status">{icons.check} {toast}</div>}
    </main>
  )
}

export default App
