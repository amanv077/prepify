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

export default function ClassicTemplate({ data }: TemplateProps) {
  return (
    <div className="bg-white min-h-[297mm] w-full max-w-[210mm] mx-auto shadow-lg print:shadow-none print:min-h-0">
      {/* Header */}
      <div className="text-center border-b-2 border-gray-800 pb-4 mb-6 print:pb-3 print:mb-4 p-6 print:p-4">
        <h1 className="text-4xl font-bold text-gray-900 mb-2 print:text-3xl print:mb-1">{data.name}</h1>
        <div className="flex justify-center flex-wrap gap-4 text-gray-700 text-sm">
          <span>{data.email}</span>
          {data.phone && <span>•</span>}
          {data.phone && <span>{data.phone}</span>}
          {data.city && <span>•</span>}
          {data.city && <span>{data.city}</span>}
        </div>
      </div>

      <div className="px-6 pb-6 print:px-4 print:pb-4">
        {/* Summary */}
        {data.summary && (
          <div className="mb-6">
            <h2 className="text-lg font-bold text-gray-900 mb-3 uppercase tracking-wide border-b border-gray-300 pb-1">
              Professional Summary
            </h2>
            <p className="text-gray-700 leading-relaxed text-sm">{data.summary}</p>
          </div>
        )}

        {/* Experience */}
        {data.experience && data.experience.length > 0 && (
          <div className="mb-6">
            <h2 className="text-lg font-bold text-gray-900 mb-3 uppercase tracking-wide border-b border-gray-300 pb-1">
              Professional Experience
            </h2>
            {data.experience.map((exp, index) => (
              <div key={index} className="mb-5 print:mb-3 no-page-break">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className="text-base font-bold text-gray-900">{exp.role}</h3>
                    <p className="text-gray-700 font-semibold">{exp.company}</p>
                    {exp.location && <p className="text-sm text-gray-600">{exp.location}</p>}
                  </div>
                  <span className="text-sm text-gray-600 font-medium">
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

        {/* Education */}
        {data.education && data.education.length > 0 && (
          <div className="mb-6">
            <h2 className="text-lg font-bold text-gray-900 mb-3 uppercase tracking-wide border-b border-gray-300 pb-1">
              Education
            </h2>
            {data.education.map((edu, index) => (
              <div key={index} className="mb-4 print:mb-3 no-page-break">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-base font-bold text-gray-900">{edu.degree}</h3>
                    <p className="text-gray-700 font-semibold">{edu.college}</p>
                    {edu.marks && <p className="text-sm text-gray-600">Grade: {edu.marks}</p>}
                  </div>
                  <span className="text-sm text-gray-600 font-medium">{edu.year}</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Skills */}
        {data.skills && data.skills.length > 0 && (
          <div className="mb-6">
            <h2 className="text-lg font-bold text-gray-900 mb-3 uppercase tracking-wide border-b border-gray-300 pb-1">
              Skills
            </h2>
            <div className="flex flex-wrap gap-3">
              {data.skills.map((skill, index) => (
                <span key={index} className="text-sm text-gray-700 font-medium">
                  {skill}{index < data.skills.length - 1 ? ' •' : ''}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Projects */}
        {data.projects && data.projects.length > 0 && (
          <div className="mb-6">
            <h2 className="text-lg font-bold text-gray-900 mb-3 uppercase tracking-wide border-b border-gray-300 pb-1">
              Projects
            </h2>
            {data.projects.map((project, index) => (
              <div key={index} className="mb-4 print:mb-3 no-page-break">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-base font-bold text-gray-900">{project.name}</h3>
                  {project.link && (
                    <span className="text-sm text-gray-600">{project.link}</span>
                  )}
                </div>
                <p className="text-sm text-gray-700 mb-2 leading-relaxed">{project.description}</p>
                <div className="flex flex-wrap gap-2">
                  {project.technologies.map((tech, i) => (
                    <span key={i} className="text-xs text-gray-600 font-medium">
                      {tech}{i < project.technologies.length - 1 ? ' •' : ''}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
