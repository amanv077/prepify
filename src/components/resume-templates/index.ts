export { default as ModernTemplate } from './ModernTemplate'
export { default as ClassicTemplate } from './ClassicTemplate'
export { default as CreativeTemplate } from './CreativeTemplate'
export { default as MinimalistTemplate } from './MinimalistTemplate'
export { default as ProfessionalTemplate } from './ProfessionalTemplate'

// Template metadata for the selector
export const templates = [
  {
    id: 'modern',
    name: 'Modern',
    description: 'Clean design with blue accents and modern layout',
    component: 'ModernTemplate',
    preview: '/template-previews/modern.png',
    color: 'blue'
  },
  {
    id: 'classic',
    name: 'Classic',
    description: 'Traditional professional layout with clean typography',
    component: 'ClassicTemplate',
    preview: '/template-previews/classic.png',
    color: 'gray'
  },
  {
    id: 'creative',
    name: 'Creative',
    description: 'Colorful sidebar design with purple and yellow accents',
    component: 'CreativeTemplate',
    preview: '/template-previews/creative.png',
    color: 'purple'
  },
  {
    id: 'minimalist',
    name: 'Minimalist',
    description: 'Clean, simple design focusing on content',
    component: 'MinimalistTemplate',
    preview: '/template-previews/minimalist.png',
    color: 'gray'
  },
  {
    id: 'professional',
    name: 'Professional',
    description: 'Corporate style with dark header and structured layout',
    component: 'ProfessionalTemplate',
    preview: '/template-previews/professional.png',
    color: 'slate'
  }
]
