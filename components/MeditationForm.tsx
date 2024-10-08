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
          placeholder="e.g., overcoming anxiety, finding inner peace, boosting self-confidence"
          required
        />
      </div>
      {!isGenerated && (
        <div className="bg-gray-100 p-4 rounded-lg">
          <h3 className="text-lg font-semibold mb-2">How it works:</h3>
          <ol className="list-decimal list-inside space-y-2 text-sm text-gray-700">
            <li>Enter your desired meditation theme or focus in the box above. Be specific about what you want to address or achieve in your meditation session.</li>
            <li>Click &quot;Generate Meditation&quot; to create your personalized 6-minute guided meditation. This will produce three 2-minute audio segments.</li>
            <li>Once generated, you&apos;ll see audio controls. Click &quot;Start Meditation&quot; when you&apos;re ready to begin.</li>
            <li>Follow the audio guidance:
              <ul className="list-disc list-inside ml-4 mt-1">
                <li>0-2 min: Opening guidance</li>
                <li>2-4 min: Silent reflection</li>
                <li>4-6 min: Deepening guidance</li>
                <li>6-8 min: Silent reflection</li>
                <li>8-10 min: Insight guidance</li>
                <li>10-12 min: Final reflection</li>
              </ul>
            </li>
            <li>Adjust the background music volume as needed for your comfort.</li>
            <li>The session will end automatically after 12 minutes with a gentle gong sound.</li>
          </ol>
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