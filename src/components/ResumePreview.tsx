'use client'

import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { 
  ModernTemplate, 
  ClassicTemplate, 
  CreativeTemplate, 
  MinimalistTemplate, 
  ProfessionalTemplate 
} from '@/components/resume-templates'
import { IResumeEducation, IResumeExperience, IProject } from '@/models'

interface FormData {
  name: string
  email: string
  phone: string
  city: string
  summary: string
  education: IResumeEducation[]
  experience: IResumeExperience[]
  skills: string[]
  projects: IProject[]
}

interface ResumePreviewProps {
  formData: FormData
  onBack: () => void
}

const templates = [
  { id: 'modern', name: 'Modern', component: ModernTemplate },
  { id: 'classic', name: 'Classic', component: ClassicTemplate },
  { id: 'creative', name: 'Creative', component: CreativeTemplate },
  { id: 'minimalist', name: 'Minimalist', component: MinimalistTemplate },
  { id: 'professional', name: 'Professional', component: ProfessionalTemplate },
]

export default function ResumePreview({ formData, onBack }: ResumePreviewProps) {
  const [selectedTemplate, setSelectedTemplate] = useState('modern')

  const handlePrint = () => {
    // Create a new window for printing
    const printWindow = window.open('', '_blank', 'width=800,height=600')
    
    if (!printWindow) {
      alert('Please allow popups to download the PDF')
      return
    }

    // Get the resume content
    const resumeContent = document.getElementById('resume-content')
    if (!resumeContent) {
      alert('Resume content not found')
      return
    }

    // Create the print document
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Resume</title>
          <meta charset="utf-8">
          <style>
            @page {
              size: A4;
              margin: 0.5in;
            }
            
            body {
              font-family: Arial, sans-serif;
              margin: 0;
              padding: 0;
              background: white;
              color: black;
              font-size: 12px;
              line-height: 1.4;
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
            }
            
            * {
              box-sizing: border-box;
            }
            
            h1 { 
              font-size: 18pt; 
              line-height: 1.2; 
              margin-bottom: 6pt; 
              font-weight: bold;
            }
            h2 { 
              font-size: 14pt; 
              line-height: 1.2; 
              margin-bottom: 4pt; 
              font-weight: bold;
            }
            h3 { 
              font-size: 12pt; 
              line-height: 1.2; 
              margin-bottom: 3pt; 
              font-weight: bold;
            }
            p, li { 
              font-size: 10pt; 
              line-height: 1.3; 
              margin-bottom: 3pt; 
            }
            
            .bg-gradient-to-r,
            .bg-gradient-to-b {
              background: #333 !important;
              color: white !important;
            }
            
            .text-blue-600,
            .text-purple-600,
            .text-blue-700,
            .text-purple-700,
            .text-green-600,
            .text-indigo-600 {
              color: #333 !important;
              font-weight: 600 !important;
            }
            
            .bg-blue-100,
            .bg-purple-100,
            .bg-gray-100,
            .bg-blue-50,
            .bg-green-50,
            .bg-indigo-50 {
              background-color: #f8f9fa !important;
              border: 1px solid #dee2e6 !important;
            }
            
            .shadow-lg,
            .shadow-xl {
              box-shadow: none !important;
            }
            
            .rounded-lg,
            .rounded-xl {
              border-radius: 0 !important;
            }
            
            .p-8, .p-6 {
              padding: 8pt !important;
            }
            
            .p-4 {
              padding: 6pt !important;
            }
            
            .mb-8, .mb-6 {
              margin-bottom: 8pt !important;
            }
            
            .mb-4, .mb-3 {
              margin-bottom: 6pt !important;
            }
            
            .mb-2 {
              margin-bottom: 3pt !important;
            }
            
            .grid {
              display: block !important;
            }
            
            .flex {
              display: block !important;
            }
            
            .hidden {
              display: none !important;
            }
          </style>
        </head>
        <body>
          ${resumeContent.innerHTML}
        </body>
      </html>
    `)
    
    printWindow.document.close()
    
    // Wait for content to load, then print
    setTimeout(() => {
      printWindow.print()
      printWindow.close()
    }, 500)
  }

  const SelectedTemplateComponent = templates.find(t => t.id === selectedTemplate)?.component || ModernTemplate

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b sticky top-0 z-10 no-print">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center py-4 gap-4">
            <div className="flex items-center space-x-4">
              <Button variant="outline" onClick={onBack} className="text-sm">
                ← Back to Editor
              </Button>
              <h1 className="text-lg sm:text-xl font-semibold text-gray-900">Resume Preview</h1>
            </div>
            <Button onClick={handlePrint} className="bg-blue-600 hover:bg-blue-700 w-full sm:w-auto">
              Download PDF
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
        <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
          {/* Template Selector - Mobile First */}
          <div className="w-full lg:w-80 order-1 lg:order-2">
            <Card>
              <CardContent className="p-4 sm:p-6">
                <h2 className="text-base sm:text-lg font-semibold text-gray-900 mb-4">Choose Template</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-3">
                  {templates.map((template) => (
                    <button
                      key={template.id}
                      onClick={() => setSelectedTemplate(template.id)}
                      className={`w-full p-3 sm:p-4 text-left border rounded-lg transition-all hover:shadow-md ${
                        selectedTemplate === template.id
                          ? 'border-blue-500 bg-blue-50 shadow-md'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-medium text-gray-900 text-sm sm:text-base">{template.name}</h3>
                          <p className="text-xs sm:text-sm text-gray-500 mt-1 hidden sm:block">
                            {getTemplateDescription(template.id)}
                          </p>
                        </div>
                        {selectedTemplate === template.id && (
                          <div className="w-3 h-3 bg-blue-500 rounded-full flex-shrink-0"></div>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
                
                <div className="mt-4 sm:mt-6 pt-4 sm:pt-6 border-t border-gray-200 hidden sm:block">
                  <h3 className="font-medium text-gray-900 mb-3 text-sm sm:text-base">Preview Tips</h3>
                  <ul className="text-xs sm:text-sm text-gray-600 space-y-2">
                    <li>• Use the Download PDF button to save your resume</li>
                    <li>• Try different templates to find your style</li>
                    <li>• All templates are ATS-friendly</li>
                    <li>• Print layout is optimized for standard paper</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Preview Area */}
          <div className="flex-1 order-2 lg:order-1">
            <div className="bg-white shadow-lg rounded-lg overflow-hidden resume-content" id="resume-content">
              <SelectedTemplateComponent data={formData} />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function getTemplateDescription(templateId: string): string {
  const descriptions = {
    modern: 'Clean design with blue accents and modern typography',
    classic: 'Traditional layout perfect for conservative industries',
    creative: 'Colorful and unique design for creative professionals',
    minimalist: 'Simple, clean design focused on content',
    professional: 'Sophisticated layout for executive positions'
  }
  return descriptions[templateId as keyof typeof descriptions] || ''
}
