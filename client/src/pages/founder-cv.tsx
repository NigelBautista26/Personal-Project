import { useRef } from "react";
import { Printer, ArrowLeft, Mail, Phone, Linkedin, Github, Briefcase, GraduationCap, Award, Code, CheckCircle } from "lucide-react";
import { useLocation } from "wouter";

export default function FounderCV() {
  const [, navigate] = useLocation();
  const contentRef = useRef<HTMLDivElement>(null);

  const handlePrint = () => {
    window.print();
  };

  const skills = [
    { category: "UI & Automation", items: ["Playwright & TypeScript", "Cypress & JavaScript", "WebdriverIO", "Appium"] },
    { category: "CI/CD & DevOps", items: ["GitHub Actions", "Jenkins", "GitLab CI", "Docker"] },
    { category: "Cloud & Backend", items: ["AWS EC2/S3/Lambda", "Node.js", "Linux Servers"] },
    { category: "Testing Methods", items: ["BDD & TDD", "API Testing", "E2E Testing", "Exploratory Testing"] },
  ];

  const experience = [
    {
      company: "Companies House",
      role: "Senior Software Engineer in Test (SDET)",
      period: "Aug 2024 - Present",
      highlights: [
        "Architecting a next-generation Playwright TypeScript framework from the ground up, establishing coding standards and best practices adopted across the organisation",
        "Leading a team of 5 engineers in migrating 500+ legacy Java Cucumber tests to modern Playwright TS, reducing test execution time by 60%",
        "Implementing mandatory pre-merge gates requiring all PRs to rebase against master and achieve 100% green test suites before approval"
      ]
    },
    {
      company: "At Last (Part-time Contractor)",
      role: "Founding Senior SDET",
      period: "2024 - Present",
      highlights: [
        "Architected the complete test automation infrastructure for a multi-carrier logistics platform, designing scalable TypeScript/Playwright frameworks from scratch",
        "Engineered end-to-end, integration, and API test suites for Albert AI, implementing pre-merge validation pipelines that enforce green builds before any code merges to master",
        "Built CI/CD workflows with GitHub Actions, configuring branch protection rules, automated test runners, and rebase-before-merge enforcement across all repositories"
      ]
    },
    {
      company: "Natter",
      role: "Principal Software Engineer in Test (SDET)",
      period: "Jan 2024 - Aug 2024",
      highlights: [
        "Promoted to Principal role to lead and mentor a team of 2 SDETs, establishing quality standards from sprint planning through deployment",
        "Designed and implemented a Playwright/TypeScript framework that reduced regression testing time from 4 hours to 45 minutes",
        "Transformed CI/CD pipeline with GitHub Actions, enforcing branch protection rules that mandate rebasing and green builds before any merge to master"
      ]
    },
    {
      company: "Endeavor Streaming",
      role: "Senior Software Engineer in Test (SDET)",
      period: "Feb 2022 - Jan 2024",
      highlights: [
        "Pioneered shift-left transformation, embedding SDETs in product teams from day one of feature development, reducing production defects by 80%",
        "Built proprietary E2E testing framework with Playwright/TypeScript, achieving 95% test coverage across critical user journeys",
        "Eliminated 3 staging environments by implementing rigorous pre-merge validation—all tests must pass against rebased master before merge approval",
        "Reduced release cycle from 2 weeks to continuous deployment through automated quality gates"
      ]
    },
    {
      company: "Hopin",
      role: "Senior Software Engineer in Test (SDET)",
      period: "Aug 2020 - Jan 2022",
      highlights: [
        "Scaled testing infrastructure during explosive hyper-growth (50 to 1,000+ employees), maintaining quality while shipping daily",
        "Architected end-to-end automation suite with strict green-build requirements—no PR merged without passing all test layers",
        "Collaborated with 20+ engineering squads to integrate React Testing Library, increasing unit test coverage from 40% to 85%"
      ]
    },
    {
      company: "Automation Hero",
      role: "Software Engineer in Test (SDET)",
      period: "Jan 2020 - Aug 2020",
      highlights: [
        "Built Cypress + Jenkins automation framework, enabling 10x faster front-end regression testing",
        "Developed JavaScript/Supertest API testing framework integrated into CI pipeline, catching 90% of integration issues pre-merge"
      ]
    },
    {
      company: "Arcadia",
      role: "Software Engineer in Test (SDET)",
      period: "Mar 2018 - Jan 2020",
      highlights: [
        "Delivered full-stack testing coverage across web, mobile (iOS/Android), and backend services in Agile CI/CD environment",
        "Ensured seamless shopping experience for millions of global customers across TopShop, Burton, and Dorothy Perkins brands"
      ]
    }
  ];

  return (
    <>
      <style>{`
        .cv-page {
          position: fixed;
          inset: 0;
          z-index: 9999;
          background: #0f172a;
          color: white;
          padding: 1rem;
          overflow-y: auto;
          width: 100vw;
          height: 100vh;
        }
        
        @media print {
          @page { size: A4; margin: 0; }
          
          * {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          
          html, body, #root {
            height: auto !important;
            overflow: visible !important;
            max-width: none !important;
            width: auto !important;
            background: #0f172a !important;
            color: white !important;
          }
          
          .cv-page {
            position: static !important;
            overflow: visible !important;
            height: auto !important;
            width: auto !important;
            padding: 0.4in !important;
            background: #0f172a !important;
            color: white !important;
          }
          
          .print-wrapper {
            max-width: none !important;
            background: #0f172a !important;
          }
          
          .no-print {
            display: none !important;
          }
          
          .cv-section { 
            page-break-inside: avoid;
            margin-bottom: 0.5rem !important;
            background: rgba(30, 41, 59, 0.5) !important;
          }
          
          .job-card {
            page-break-inside: avoid !important;
            break-inside: avoid !important;
          }
          
          .cv-header {
            background: linear-gradient(135deg, #6366f1, #8b5cf6) !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          
          .bg-slate-800\/50 {
            background: rgba(30, 41, 59, 0.5) !important;
          }
          
          h2 { font-size: 1rem !important; margin-bottom: 0.5rem !important; color: white !important; }
          h3 { font-size: 0.9rem !important; color: white !important; }
          p, li { font-size: 0.8rem !important; line-height: 1.3 !important; }
          .text-sm { font-size: 0.75rem !important; }
          .mb-6 { margin-bottom: 0.4rem !important; }
          .mb-4 { margin-bottom: 0.3rem !important; }
          .py-6 { padding-top: 0.4rem !important; padding-bottom: 0.4rem !important; }
          .p-4 { padding: 0.3rem !important; }
          .gap-4 { gap: 0.3rem !important; }
          .space-y-4 > * + * { margin-top: 0.3rem !important; }
          .space-y-2 > * + * { margin-top: 0.15rem !important; }
          
          .text-white { color: white !important; }
          .text-gray-300 { color: #d1d5db !important; }
          .text-gray-400 { color: #9ca3af !important; }
          .text-gray-500 { color: #6b7280 !important; }
          .text-indigo-400 { color: #818cf8 !important; }
          .text-indigo-200 { color: #c7d2fe !important; }
          .text-indigo-100 { color: #e0e7ff !important; }
          .text-green-400 { color: #4ade80 !important; }
          
          .border-indigo-500 { border-color: #6366f1 !important; }
          .border-slate-700 { border-color: #334155 !important; }
        }
      `}</style>
      <div className="cv-page">
        <div className="print-wrapper max-w-4xl mx-auto">
          <div className="sticky top-0 z-50 bg-slate-900/95 backdrop-blur-sm border-b border-slate-800 p-4 flex items-center justify-between no-print">
            <button
              onClick={() => navigate("/")}
              className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
              data-testid="button-back"
            >
              <ArrowLeft className="w-5 h-5" />
              Back
            </button>
            <button
              onClick={handlePrint}
              className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg transition-colors"
              data-testid="button-download-pdf"
            >
              <Printer className="w-4 h-4" />
              Print / Save PDF
            </button>
          </div>

          <div ref={contentRef} className="p-4 md:p-8">
            
            {/* Header Section */}
            <div className="cv-header rounded-2xl p-6 md:p-8 mb-6 bg-gradient-to-br from-indigo-600 to-purple-600">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                  <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">Nigel Bautista</h1>
                  <p className="text-xl text-indigo-200 font-medium">Senior SDET / Software Engineer in Test</p>
                </div>
                <div className="flex flex-col gap-2 text-sm text-indigo-100">
                  <a href="tel:07462413044" className="flex items-center gap-2 hover:text-white transition-colors">
                    <Phone className="w-4 h-4" />
                    07462413044
                  </a>
                  <a href="mailto:nigel.zamudio.bautista@gmail.com" className="flex items-center gap-2 hover:text-white transition-colors">
                    <Mail className="w-4 h-4" />
                    nigel.zamudio.bautista@gmail.com
                  </a>
                  <a href="https://www.linkedin.com/in/nigel-bautista-70ab4045/" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 hover:text-white transition-colors">
                    <Linkedin className="w-4 h-4" />
                    LinkedIn Profile
                  </a>
                  <a href="https://github.com/NigelBautista26?tab=repositories" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 hover:text-white transition-colors">
                    <Github className="w-4 h-4" />
                    GitHub Profile
                  </a>
                </div>
              </div>
            </div>

            {/* Profile Summary */}
            <section className="cv-section mb-6 print-bg-light rounded-xl p-4 bg-slate-800/50">
              <h2 className="text-xl font-bold text-white print-dark-text mb-3 flex items-center gap-2">
                <Award className="w-5 h-5 text-indigo-400 print-accent" />
                Professional Profile
              </h2>
              <div className="text-gray-300 print-muted-text leading-relaxed space-y-3">
                <p>
                  Accomplished Senior SDET with 12+ years of expertise transforming software delivery through shift-left quality engineering. 
                  I specialise in revolutionising development workflows by embedding quality gates directly into the CI/CD pipeline, ensuring 
                  no code reaches production without passing rigorous automated validation.
                </p>
                <p>
                  My approach centres on pre-merge quality enforcement: every pull request must rebase against the latest master branch and 
                  pass comprehensive test suites (unit, integration, and end-to-end) before merge approval. This methodology eliminates 
                  the traditional "test after development" bottleneck, catching defects at the earliest and cheapest point in the lifecycle. 
                  By mandating green builds as a merge prerequisite, I've helped organisations achieve near-zero production defects while 
                  accelerating release velocity.
                </p>
                <p>
                  I architect robust testing frameworks using Playwright/TypeScript and Cypress/JavaScript, integrating them seamlessly 
                  with GitHub Actions, Jenkins, and GitLab CI. My frameworks are designed for developer adoption—enabling engineers to 
                  write and run tests locally before pushing, fostering a culture where quality is everyone's responsibility.
                </p>
              </div>
            </section>

            {/* Skills Grid */}
            <section className="cv-section mb-6">
              <h2 className="text-xl font-bold text-white print-dark-text mb-4 flex items-center gap-2">
                <Code className="w-5 h-5 text-indigo-400 print-accent" />
                Technical Skills
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {skills.map((skillGroup, idx) => (
                  <div key={idx} className="print-bg-light rounded-xl p-4 bg-slate-800/50">
                    <h3 className="font-semibold text-indigo-400 print-accent mb-2 text-sm">{skillGroup.category}</h3>
                    <ul className="space-y-1">
                      {skillGroup.items.map((skill, i) => (
                        <li key={i} className="text-sm text-gray-300 print-muted-text flex items-center gap-1">
                          <CheckCircle className="w-3 h-3 text-green-400 flex-shrink-0" />
                          {skill}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </section>

            {/* Experience */}
            <section className="cv-section mb-6">
              <h2 className="text-xl font-bold text-white print-dark-text mb-4 flex items-center gap-2">
                <Briefcase className="w-5 h-5 text-indigo-400 print-accent" />
                Professional Experience
              </h2>
              <div className="space-y-4">
                {experience.map((job, idx) => (
                  <div key={idx} className="job-card print-bg-light rounded-xl p-4 bg-slate-800/50 border-l-4 border-indigo-500">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-2">
                      <div>
                        <h3 className="font-bold text-white print-dark-text">{job.company}</h3>
                        <p className="text-indigo-400 print-accent font-medium">{job.role}</p>
                      </div>
                      <span className="text-sm text-gray-400 print-muted-text">{job.period}</span>
                    </div>
                    <ul className="space-y-1 mt-2">
                      {job.highlights.map((highlight, i) => (
                        <li key={i} className="text-sm text-gray-300 print-muted-text flex items-start gap-2">
                          <span className="text-indigo-400 print-accent mt-1">•</span>
                          {highlight}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </section>

            {/* Earlier Experience Summary */}
            <section className="cv-section mb-6 print-bg-light rounded-xl p-4 bg-slate-800/50">
              <h3 className="font-bold text-white print-dark-text mb-3">Earlier Career</h3>
              <div className="grid md:grid-cols-2 gap-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-300 print-muted-text">ECS Digital - SDET</span>
                  <span className="text-gray-500">Sep 2017 - Feb 2018</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-300 print-muted-text">HAPARA - SDET</span>
                  <span className="text-gray-500">Feb 2016 - Aug 2017</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-300 print-muted-text">SPARK - SDET</span>
                  <span className="text-gray-500">Feb 2015 - Jan 2016</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-300 print-muted-text">DATACOM - Junior SDET</span>
                  <span className="text-gray-500">Mar 2013 - Jan 2015</span>
                </div>
              </div>
            </section>

            {/* Education */}
            <section className="cv-section print-bg-light rounded-xl p-4 bg-slate-800/50">
              <h2 className="text-xl font-bold text-white print-dark-text mb-3 flex items-center gap-2">
                <GraduationCap className="w-5 h-5 text-indigo-400 print-accent" />
                Education
              </h2>
              <div className="space-y-2">
                <div>
                  <h3 className="font-semibold text-white print-dark-text">Bachelor of Science in Information Technology</h3>
                  <p className="text-sm text-gray-400 print-muted-text">Informatics International College, Quezon City, Philippines | 2007-2010</p>
                </div>
                <div>
                  <h3 className="font-semibold text-white print-dark-text">High School Diploma</h3>
                  <p className="text-sm text-gray-400 print-muted-text">Penn Foster High School, Pennsylvania, USA | 2007</p>
                </div>
              </div>
            </section>

          </div>
        </div>
      </div>
    </>
  );
}
