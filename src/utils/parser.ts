export interface ParsedStep {
  id: number
  content: string // Markdown content for the description
  highlightLines: number[] // Array of 0-based line indices to highlight
}

export interface LessonData {
  title: string
  description: string
  code: string
  steps: ParsedStep[]
}
export function parseLessonMarkdown(markdown: string): LessonData {
  const sections = markdown.split(/^---$/gm)

  // Section 0: Metadata and Code
  const headerSection = sections[0] ?? ''
  const titleMatch = headerSection?.match(/^# (.*)$/m)
  const title = titleMatch ? titleMatch[1]?.trim() : 'Untitled Lesson'

  // Extract description (text after title, before code block)
  // Simplified: just take lines that aren't title and aren't code block
  const description = headerSection
    .replace(/^# .*$/m, '')
    .replace(/```[\s\S]*?```/, '')
    .trim()

  // Extract Code
  const codeMatch = headerSection.match(/```(?:\w+)?\n([\s\S]*?)```/)
  const code = codeMatch ? codeMatch[1]?.trim() : ''

  // Process Steps
  const steps: ParsedStep[] = sections.slice(1).map((section, index) => {
    const lines = section.trim().split('\n')
    let highlightLines: number[] = []

    // Check for highlight comment <!-- highlight: 1-2, 5 -->
    const highlightMatch = section.match(/<!--\s*highlight:\s*([0-9\-, ]*)\s*-->/)

    if (highlightMatch && highlightMatch[1]?.trim()) {
      const rangeStrings = highlightMatch[1]?.split(',')
      rangeStrings.forEach((range) => {
        const [start, end] = range.split('-').map((s) => parseInt(s.trim(), 10))
        if (!isNaN(start)) {
          if (!isNaN(end)) {
            // Add range (convert to 0-based)
            for (let i = start; i <= end; i++) {
              highlightLines.push(i - 1) // User input is usually 1-based in these formats
            }
          } else {
            // Single line
            highlightLines.push(start - 1)
          }
        }
      })
    }

    // Remove the comment from content to avoid rendering it
    const content = section.replace(/<!--\s*highlight:.*-->/, '').trim()

    return {
      id: index + 1,
      content,
      highlightLines,
    }
  })

  // Add an initial "Intro" step if user didn't explicitly create one after the ---
  // but for this specific parser, we assume the format in constants.ts

  return {
    title,
    description,
    code,
    steps,
  }
}
