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

export default function MinimalistTemplate({ data }: TemplateProps) {
  return (
    <div className="bg-white min-h-[297mm] w-full max-w-[210mm] mx-auto shadow-lg print:shadow-none print:min-h-0">
      {/* Header */}
      <div className="border-b border-gray-200 pb-6 mb-8 p-8 print:p-6 print:pb-4 print:mb-6">
        <h1 className="text-4xl font-light text-gray-900 mb-4 print:text-3xl print:mb-3">{data.name}</h1>
        <div className="flex flex-wrap gap-6 text-gray-600 text-sm">
          <span>{data.email}</span>
          {data.phone && <span>{data.phone}</span>}
          {data.city && <span>{data.city}</span>}
        </div>
      </div>

      <div className="px-8 pb-8 print:px-6 print:pb-6">
        {/* Summary */}
        {data.summary && (
          <div className="mb-8 print:mb-6">
            <p className="text-gray-700 leading-relaxed text-base font-light">{data.summary}</p>
          </div>
        )}

        {/* Experience */}
        {data.experience && data.experience.length > 0 && (
          <div className="mb-8 print:mb-6">
            <h2 className="text-xl font-light text-gray-900 mb-6 print:text-lg print:mb-4">Experience</h2>
            {data.experience.map((exp, index) => (
              <div key={index} className="mb-8 print:mb-5 no-page-break">
                <div className="flex justify-between items-baseline mb-2">
                  <h3 className="text-lg font-medium text-gray-900 print:text-base">{exp.role}</h3>
                  <span className="text-sm text-gray-500 font-light">
                    {exp.startDate} - {exp.endDate || 'Present'}
                  </span>
                </div>
                <p className="text-gray-600 mb-2 font-light">{exp.company}</p>
                {exp.location && <p className="text-gray-500 text-sm mb-3 font-light">{exp.location}</p>}
                {exp.description && (
                  <p className="text-gray-700 leading-relaxed text-sm font-light">{exp.description}</p>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Education */}
        {data.education && data.education.length > 0 && (
          <div className="mb-8 print:mb-6">
            <h2 className="text-xl font-light text-gray-900 mb-6 print:text-lg print:mb-4">Education</h2>
            {data.education.map((edu, index) => (
              <div key={index} className="mb-6 print:mb-4 no-page-break">
                <div className="flex justify-between items-baseline mb-2">
                  <h3 className="text-lg font-medium text-gray-900 print:text-base">{edu.degree}</h3>
                  <span className="text-sm text-gray-500 font-light">{edu.year}</span>
                </div>
                <p className="text-gray-600 font-light">{edu.college}</p>
                {edu.marks && <p className="text-gray-500 text-sm font-light">Grade: {edu.marks}</p>}
              </div>
            ))}
          </div>
        )}

        {/* Skills */}
        {data.skills && data.skills.length > 0 && (
          <div className="mb-8 print:mb-6">
            <h2 className="text-xl font-light text-gray-900 mb-6 print:text-lg print:mb-4">Skills</h2>
            <div className="flex flex-wrap gap-4">
              {data.skills.map((skill, index) => (
                <span key={index} className="text-gray-700 font-light">
                  {skill}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Projects */}
        {data.projects && data.projects.length > 0 && (
          <div className="mb-8 print:mb-6">
            <h2 className="text-xl font-light text-gray-900 mb-6 print:text-lg print:mb-4">Projects</h2>
            {data.projects.map((project, index) => (
              <div key={index} className="mb-6 print:mb-4 no-page-break">
                <div className="flex justify-between items-baseline mb-2">
                  <h3 className="text-lg font-medium text-gray-900 print:text-base">{project.name}</h3>
                  {project.link && (
                    <span className="text-sm text-gray-500 font-light">{project.link}</span>
                  )}
                </div>
                <p className="text-gray-700 leading-relaxed mb-3 font-light text-sm">{project.description}</p>
                <div className="flex flex-wrap gap-3">
                  {project.technologies.map((tech, i) => (
                    <span key={i} className="text-gray-600 text-sm font-light">
                      {tech}
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
