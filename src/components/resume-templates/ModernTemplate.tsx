'use client'

import { IResumeEducation, IResumeExperience, IProject } from '@/models'

interface ResumeData {
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

interface TemplateProps {
  data: ResumeData
}

export default function ModernTemplate({ data }: TemplateProps) {
  return (
    <div className="bg-white min-h-[297mm] w-full max-w-[210mm] mx-auto shadow-lg print:shadow-none print:min-h-0">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6 print:p-4">
        <h1 className="text-3xl font-bold mb-3 print:text-2xl print:mb-2">{data.name}</h1>
        <div className="flex flex-wrap gap-4 text-blue-100 text-sm">
          <span>📧 {data.email}</span>
          {data.phone && <span>📞 {data.phone}</span>}
          {data.city && <span>📍 {data.city}</span>}
        </div>
      </div>

      <div className="p-6 print:p-4">
        {/* Summary */}
        {data.summary && (
          <div className="mb-6">
            <h2 className="text-xl font-bold text-blue-700 mb-3 border-b-2 border-blue-200 pb-1 print:text-lg print:mb-2">
              PROFESSIONAL SUMMARY
            </h2>
            <p className="text-gray-700 leading-relaxed text-sm">{data.summary}</p>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 print:grid-cols-3 print:gap-4">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-6 print:col-span-2 print:space-y-4">
            {/* Experience */}
            {data.experience && data.experience.length > 0 && (
              <div>
                <h2 className="text-xl font-bold text-blue-700 mb-3 border-b-2 border-blue-200 pb-1 print:text-lg print:mb-2">
                  EXPERIENCE
                </h2>
                {data.experience.map((exp, index) => (
                  <div key={index} className="mb-5 print:mb-3 no-page-break">
                    <div className="flex justify-between items-start mb-2 print:mb-1">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 print:text-base">{exp.role}</h3>
                        <p className="text-blue-600 font-medium print:text-black">{exp.company}</p>
                        {exp.location && <p className="text-sm text-gray-600">{exp.location}</p>}
                      </div>
                      <span className="text-xs text-gray-600 bg-gray-100 px-2 py-1 rounded print:bg-transparent print:border print:border-gray-300">
                        {exp.startDate} - {exp.endDate || 'Present'}
                      </span>
                    </div>
                    {exp.description && (
                      <p className="text-sm text-gray-700 leading-relaxed">{exp.description}</p>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Projects */}
            {data.projects && data.projects.length > 0 && (
              <div>
                <h2 className="text-xl font-bold text-blue-700 mb-3 border-b-2 border-blue-200 pb-1 print:text-lg print:mb-2">
                  PROJECTS
                </h2>
                {data.projects.map((project, index) => (
                  <div key={index} className="mb-4 print:mb-3 no-page-break">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="text-lg font-semibold text-gray-900 print:text-base">{project.name}</h3>
                      {project.link && (
                        <span className="text-xs text-blue-600 print:text-black">{project.link}</span>
                      )}
                    </div>
                    <p className="text-sm text-gray-700 mb-2">{project.description}</p>
                    <div className="flex flex-wrap gap-1">
                      {project.technologies.map((tech, i) => (
                        <span
                          key={i}
                          className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs print:bg-transparent print:border print:border-gray-300"
                        >
                          {tech}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Right Column */}
          <div className="space-y-6 print:space-y-4">
            {/* Education */}
            {data.education && data.education.length > 0 && (
              <div>
                <h2 className="text-xl font-bold text-blue-700 mb-3 border-b-2 border-blue-200 pb-1 print:text-lg print:mb-2">
                  EDUCATION
                </h2>
                {data.education.map((edu, index) => (
                  <div key={index} className="mb-4 print:mb-3 no-page-break">
                    <h3 className="text-base font-semibold text-gray-900 print:text-sm">{edu.degree}</h3>
                    <p className="text-blue-600 font-medium text-sm print:text-black">{edu.college}</p>
                    <p className="text-xs text-gray-600">{edu.year}</p>
                    {edu.marks && <p className="text-xs text-gray-600">Grade: {edu.marks}</p>}
                  </div>
                ))}
              </div>
            )}

            {/* Skills */}
            {data.skills && data.skills.length > 0 && (
              <div>
                <h2 className="text-xl font-bold text-blue-700 mb-3 border-b-2 border-blue-200 pb-1 print:text-lg print:mb-2">
                  SKILLS
                </h2>
                <div className="flex flex-wrap gap-2">
                  {data.skills.map((skill, index) => (
                    <span
                      key={index}
                      className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm font-medium print:bg-transparent print:border print:border-gray-300 print:text-black"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
