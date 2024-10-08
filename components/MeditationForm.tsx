import { useState } from 'react'
import { MeditationAudio } from '../lib/types'

interface MeditationFormProps {
  onMeditationGenerated: (audios: MeditationAudio[]) => void
}

export default function MeditationForm({ onMeditationGenerated }: MeditationFormProps) {
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const response = await fetch('/api/generate-meditation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ input }),
      })

      if (!response.ok) {
        throw new Error('Failed to generate meditation')
      }

      const audios: MeditationAudio[] = await response.json()
      onMeditationGenerated(audios)
    } catch (error) {
      console.error('Error generating meditation:', error)
      alert('Failed to generate meditation. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="meditation-input" className="block text-sm font-medium text-gray-700">
          Enter a theme or focus for your meditation:
        </label>
        <input
          type="text"
          id="meditation-input"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
          placeholder="e.g., relaxation, stress relief, mindfulness"
          required
        />
      </div>
      <button
        type="submit"
        disabled={isLoading}
        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
      >
        {isLoading ? 'Generating...' : 'Generate Meditation'}
      </button>
    </form>
  )
}