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

export default function CreativeTemplate({ data }: TemplateProps) {
  return (
    <div className="bg-white min-h-[297mm] w-full max-w-[210mm] mx-auto shadow-lg print:shadow-none print:min-h-0">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 via-pink-600 to-red-600 text-white p-6 print:p-4">
        <h1 className="text-3xl font-bold mb-3 print:text-2xl print:mb-2">{data.name}</h1>
        <div className="flex flex-wrap gap-4 text-purple-100 text-sm">
          <span className="flex items-center gap-1">
            <span>✉</span> {data.email}
          </span>
          {data.phone && (
            <span className="flex items-center gap-1">
              <span>📱</span> {data.phone}
            </span>
          )}
          {data.city && (
            <span className="flex items-center gap-1">
              <span>📍</span> {data.city}
            </span>
          )}
        </div>
      </div>

      <div className="p-6 print:p-4">
        {/* Summary */}
        {data.summary && (
          <div className="mb-6">
            <div className="flex items-center mb-3">
              <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center mr-3">
                <span className="text-white text-sm font-bold">💡</span>
              </div>
              <h2 className="text-xl font-bold text-gray-900 print:text-lg">ABOUT ME</h2>
            </div>
            <p className="text-gray-700 leading-relaxed text-sm pl-11">{data.summary}</p>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 print:grid-cols-3 print:gap-4">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-6 print:col-span-2 print:space-y-4">
            {/* Experience */}
            {data.experience && data.experience.length > 0 && (
              <div>
                <div className="flex items-center mb-3">
                  <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center mr-3">
                    <span className="text-white text-sm font-bold">💼</span>
                  </div>
                  <h2 className="text-xl font-bold text-gray-900 print:text-lg">EXPERIENCE</h2>
                </div>
                {data.experience.map((exp, index) => (
                  <div key={index} className="mb-5 print:mb-3 no-page-break pl-11">
                    <div className="relative">
                      <div className="absolute -left-8 top-2 w-3 h-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full"></div>
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900 print:text-base">{exp.role}</h3>
                          <p className="text-purple-600 font-medium print:text-black">{exp.company}</p>
                          {exp.location && <p className="text-sm text-gray-600">{exp.location}</p>}
                        </div>
                        <span className="text-xs text-gray-600 bg-purple-100 px-2 py-1 rounded-full print:bg-transparent print:border print:border-gray-300">
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
                <div className="flex items-center mb-3">
                  <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-blue-500 rounded-full flex items-center justify-center mr-3">
                    <span className="text-white text-sm font-bold">🚀</span>
                  </div>
                  <h2 className="text-xl font-bold text-gray-900 print:text-lg">PROJECTS</h2>
                </div>
                {data.projects.map((project, index) => (
                  <div key={index} className="mb-4 print:mb-3 no-page-break pl-11">
                    <div className="relative">
                      <div className="absolute -left-8 top-2 w-3 h-3 bg-gradient-to-r from-green-500 to-blue-500 rounded-full"></div>
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="text-lg font-semibold text-gray-900 print:text-base">{project.name}</h3>
                        {project.link && (
                          <span className="text-xs text-purple-600 print:text-black">{project.link}</span>
                        )}
                      </div>
                      <p className="text-sm text-gray-700 mb-2">{project.description}</p>
                      <div className="flex flex-wrap gap-1">
                        {project.technologies.map((tech, i) => (
                          <span
                            key={i}
                            className="bg-gradient-to-r from-purple-100 to-pink-100 text-purple-800 px-2 py-1 rounded-full text-xs print:bg-transparent print:border print:border-gray-300 print:text-black"
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
                <div className="flex items-center mb-3">
                  <div className="w-8 h-8 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full flex items-center justify-center mr-3">
                    <span className="text-white text-sm font-bold">🎓</span>
                  </div>
                  <h2 className="text-xl font-bold text-gray-900 print:text-lg">EDUCATION</h2>
                </div>
                {data.education.map((edu, index) => (
                  <div key={index} className="mb-4 print:mb-3 no-page-break pl-11">
                    <div className="relative">
                      <div className="absolute -left-8 top-2 w-3 h-3 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full"></div>
                      <h3 className="text-base font-semibold text-gray-900 print:text-sm">{edu.degree}</h3>
                      <p className="text-purple-600 font-medium text-sm print:text-black">{edu.college}</p>
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
                <div className="flex items-center mb-3">
                  <div className="w-8 h-8 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full flex items-center justify-center mr-3">
                    <span className="text-white text-sm font-bold">⚡</span>
                  </div>
                  <h2 className="text-xl font-bold text-gray-900 print:text-lg">SKILLS</h2>
                </div>
                <div className="flex flex-wrap gap-2 pl-11">
                  {data.skills.map((skill, index) => (
                    <span
                      key={index}
                      className="bg-gradient-to-r from-indigo-100 to-purple-100 text-indigo-800 px-2 py-1 rounded-full text-sm font-medium print:bg-transparent print:border print:border-gray-300 print:text-black"
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
