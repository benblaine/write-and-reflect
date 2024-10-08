import { useState } from 'react'
import { MeditationAudio } from '../lib/types'

interface MeditationFormProps {
  onMeditationGenerated: (audios: MeditationAudio[]) => void
}

export default function MeditationForm({ onMeditationGenerated }: MeditationFormProps) {
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isGenerated, setIsGenerated] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setIsGenerated(false)

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
      setIsGenerated(true)
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
        <label htmlFor="meditation-input" className="block text-sm font-medium text-gray-700 mb-2">
          Enter a theme or focus for your meditation:
        </label>
        <textarea
          id="meditation-input"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="w-full px-3 py-2 text-gray-700 border rounded-lg focus:outline-none focus:border-blue-500"
          rows={4}
          placeholder="e.g., relaxation, stress relief, mindfulness"
          required
        />
      </div>
      {!isGenerated && (
        <div className="bg-gray-100 p-4 rounded-lg">
          <h3 className="text-lg font-semibold mb-2">How it works:</h3>
          <ul className="list-disc list-inside space-y-1 text-sm text-gray-700">
            <li>Enter your desired meditation theme or focus in the box above.</li>
            <li>Click &quot;Generate Meditation&quot; to create your personalized guided meditation.</li>
            <li>Follow the audio prompts and enjoy your tailored meditation experience.</li>
          </ul>
        </div>
      )}
      <button
        type="submit"
        disabled={isLoading}
        className="w-full px-4 py-2 text-white bg-blue-500 rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 disabled:opacity-50"
      >
        {isLoading ? 'Generating...' : 'Generate Meditation'}
      </button>
    </form>
  )
}