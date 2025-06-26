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

export default function ProfessionalTemplate({ data }: TemplateProps) {
  return (
    <div className="bg-white min-h-[297mm] w-full max-w-[210mm] mx-auto shadow-lg print:shadow-none print:min-h-0">
      {/* Header */}
      <div className="bg-gray-800 text-white p-6 print:p-4">
        <h1 className="text-3xl font-bold mb-3 print:text-2xl print:mb-2">{data.name}</h1>
        <div className="flex flex-wrap gap-4 text-gray-300 text-sm">
          <span className="flex items-center gap-2">
            <span className="w-4 h-4 bg-gray-600 rounded-full flex items-center justify-center">
              <span className="text-xs">@</span>
            </span>
            {data.email}
          </span>
          {data.phone && (
            <span className="flex items-center gap-2">
              <span className="w-4 h-4 bg-gray-600 rounded-full flex items-center justify-center">
                <span className="text-xs">☎</span>
              </span>
              {data.phone}
            </span>
          )}
          {data.city && (
            <span className="flex items-center gap-2">
              <span className="w-4 h-4 bg-gray-600 rounded-full flex items-center justify-center">
                <span className="text-xs">📍</span>
              </span>
              {data.city}
            </span>
          )}
        </div>
      </div>

      <div className="p-6 print:p-4">
        {/* Summary */}
        {data.summary && (
          <div className="mb-6">
            <h2 className="text-lg font-bold text-gray-800 mb-3 uppercase tracking-wider border-b-2 border-gray-800 pb-1">
              Executive Summary
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
                <h2 className="text-lg font-bold text-gray-800 mb-3 uppercase tracking-wider border-b-2 border-gray-800 pb-1">
                  Professional Experience
                </h2>
                {data.experience.map((exp, index) => (
                  <div key={index} className="mb-5 print:mb-3 no-page-break">
                    <div className="border-l-4 border-gray-800 pl-4">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h3 className="text-base font-bold text-gray-900">{exp.role}</h3>
                          <p className="text-gray-700 font-semibold">{exp.company}</p>
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
                  </div>
                ))}
              </div>
            )}

            {/* Projects */}
            {data.projects && data.projects.length > 0 && (
              <div>
                <h2 className="text-lg font-bold text-gray-800 mb-3 uppercase tracking-wider border-b-2 border-gray-800 pb-1">
                  Key Projects
                </h2>
                {data.projects.map((project, index) => (
                  <div key={index} className="mb-4 print:mb-3 no-page-break">
                    <div className="border-l-4 border-gray-600 pl-4">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="text-base font-bold text-gray-900">{project.name}</h3>
                        {project.link && (
                          <span className="text-xs text-gray-600">{project.link}</span>
                        )}
                      </div>
                      <p className="text-sm text-gray-700 mb-2">{project.description}</p>
                      <div className="flex flex-wrap gap-2">
                        {project.technologies.map((tech, i) => (
                          <span
                            key={i}
                            className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs font-medium print:bg-transparent print:border print:border-gray-300"
                          >
                            {tech}
                          </span>
                        ))}
                      </div>
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
                <h2 className="text-lg font-bold text-gray-800 mb-3 uppercase tracking-wider border-b-2 border-gray-800 pb-1">
                  Education
                </h2>
                {data.education.map((edu, index) => (
                  <div key={index} className="mb-4 print:mb-3 no-page-break">
                    <div className="bg-gray-50 p-3 rounded print:bg-transparent print:border print:border-gray-200">
                      <h3 className="text-sm font-bold text-gray-900">{edu.degree}</h3>
                      <p className="text-gray-700 font-medium text-sm">{edu.college}</p>
                      <p className="text-xs text-gray-600">{edu.year}</p>
                      {edu.marks && <p className="text-xs text-gray-600">Grade: {edu.marks}</p>}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Skills */}
            {data.skills && data.skills.length > 0 && (
              <div>
                <h2 className="text-lg font-bold text-gray-800 mb-3 uppercase tracking-wider border-b-2 border-gray-800 pb-1">
                  Core Competencies
                </h2>
                <div className="bg-gray-50 p-3 rounded print:bg-transparent print:border print:border-gray-200">
                  <div className="grid grid-cols-1 gap-2">
                    {data.skills.map((skill, index) => (
                      <div key={index} className="flex items-center">
                        <div className="w-2 h-2 bg-gray-800 rounded-full mr-2"></div>
                        <span className="text-sm text-gray-700 font-medium">{skill}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
