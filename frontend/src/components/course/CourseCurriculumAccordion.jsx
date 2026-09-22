import AccordionItem from '../ui/Accordion'

export default function CourseCurriculumAccordion({ modules }) {
  if (!modules?.length) return null

  return (
    <div>
      {modules.map((module, i) => (
        <AccordionItem
          key={i}
          question={`${i + 1}. ${module.module_title}`}
          answer={module.module_description}
          defaultOpen={i === 0}
        />
      ))}
    </div>
  )
}
