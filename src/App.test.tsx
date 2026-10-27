import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it } from 'vitest'
import App from './App'

describe('Browser Studio', () => {
  beforeEach(() => {
    window.localStorage.clear()
  })

  it('renders a useful demo trail immediately', () => {
    render(<App />)
    expect(screen.getByRole('heading', { name: 'North Star' })).toBeInTheDocument()
    expect(screen.getByText('The quiet power of one good default')).toBeInTheDocument()
  })

  it('filters materials from the keyboard-accessible search field', () => {
    render(<App />)
    fireEvent.change(screen.getByRole('textbox', { name: 'Search your trail' }), { target: { value: 'unfindable phrase' } })
    expect(screen.getByText('Nothing is answering that yet.')).toBeInTheDocument()
  })

  it('opens the capture studio with a demo fallback outside Chrome', async () => {
    render(<App />)
    fireEvent.click(screen.getByRole('button', { name: /capture this window/i }))
    expect(await screen.findByRole('dialog', { name: 'Make a trail from this window' })).toBeInTheDocument()
    await waitFor(() => expect(screen.getByText('Designing for calm attention')).toBeInTheDocument())
  })

  it('keeps a previously saved local trail instead of replacing it with demo data', async () => {
    window.localStorage.setItem('browser-studio-cards', JSON.stringify([{ id: 'saved', title: 'A saved signal', domain: 'Local', url: '#', type: 'Note', accent: 'lime', savedAt: 'Now', note: 'Persisted context', tags: [], state: 'Kept', progress: 100 }]))
    render(<App />)
    await waitFor(() => expect(screen.getByText('A saved signal')).toBeInTheDocument())
  })
})
