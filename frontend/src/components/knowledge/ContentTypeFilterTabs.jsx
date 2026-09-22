/** Category tabs on the search results page (spec §18: ALL/GUIDES/CONCEPTS/CAREERS/COURSES/CERTIFICATIONS/LEARNING PATHS/GLOSSARY). */
export default function ContentTypeFilterTabs({ categories, active, counts, onChange }) {
  return (
    <div role="tablist" aria-label="Result category" className="flex flex-wrap gap-2 border-b border-border pb-4">
      {categories.map((cat) => (
        <button
          key={cat.value}
          type="button"
          role="tab"
          aria-selected={active === cat.value}
          onClick={() => onChange(cat.value)}
          className={`inline-flex h-10 items-center gap-1.5 rounded-full px-4 text-sm font-medium transition-colors ${
            active === cat.value ? 'bg-primary text-text-inverse' : 'bg-surface-muted text-text-muted hover:text-text'
          }`}
        >
          {cat.label}
          {typeof counts?.[cat.value] === 'number' && <span className="text-xs opacity-70">{counts[cat.value]}</span>}
        </button>
      ))}
    </div>
  )
}
