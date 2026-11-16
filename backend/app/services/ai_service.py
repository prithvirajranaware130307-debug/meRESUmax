import json
import logging
from typing import Dict, Any, List
import requests
from ..config import Config

logger = logging.getLogger(__name__)

class AIService:
    @classmethod
    def _build_prompts(cls, resume_text: str, skills: List[str], target_role: str, quality_score: float, matched_skills: List[str], missing_skills: List[str]):
        safe_text = resume_text[:2000]
        system_prompt = (
            "You are meRESUmax Career Intelligence AI, a senior technical recruiter and career coach. "
            "Analyze the candidate's resume objectively. Do NOT invent fake degrees or non-existent companies. "
            "Provide actionable suggestions with realistic before-and-after examples. "
            "For every weak area, include an improved example (e.g., transforming passive phrasing like 'Worked on a website' "
            "into quantifiable STAR bullets like 'Built a responsive React dashboard that reduced manual reporting time by 35% for 20 internal users'). "
            "Suggest missing skills relevant to the target role. Give ATS-friendly keyword recommendations without keyword stuffing. "
            "Return ONLY valid JSON with keys: "
            "'executive_summary' (string), "
            "'summary_rewrite' (suggested enhanced 3-sentence summary for target role), "
            "'key_insights' (array of 3 strings), "
            "'high_priority_fixes' (array of 3 objects with 'issue', 'action', 'priority'), "
            "'better_bullet_examples' (array of 3 objects with 'weak', 'better', 'rationale'), "
            "'missing_skills' (array of missing skills for target role), "
            "'ats_keywords' (array of 5 ATS-friendly keyword phrases), "
            "'next_steps' (array of 3 actionable next steps), "
            "'interview_prep_tips' (array of 3 technical questions and advice), "
            "'roadmap_milestones' (array of 4 objects with 'title', 'description', 'priority', 'category')."
        )
        user_prompt = (
            f"Target Role: {target_role}\n"
            f"Resume Quality Score: {quality_score}/100\n"
            f"Extracted Skills: {', '.join(skills[:20])}\n"
            f"Matched Skills: {', '.join(matched_skills[:12])}\n"
            f"Missing Key Skills: {', '.join(missing_skills[:8])}\n"
            f"Resume Content Excerpt:\n{safe_text}\n"
        )
        return system_prompt, user_prompt

    @classmethod
    def _call_gemini(
        cls,
        resume_text: str,
        skills: List[str],
        target_role: str,
        quality_score: float,
        matched_skills: List[str],
        missing_skills: List[str]
    ) -> Dict[str, Any]:
        """Calls Google Gemini API with JSON structured output and 7s strict timeout."""
        system_prompt, user_prompt = cls._build_prompts(resume_text, skills, target_role, quality_score, matched_skills, missing_skills)

        model = Config.GEMINI_MODEL or "gemini-2.5-flash"
        url = f"https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent?key={Config.GEMINI_API_KEY}"
        headers = {"Content-Type": "application/json"}
        payload = {
            "system_instruction": {"parts": [{"text": system_prompt}]},
            "contents": [{"parts": [{"text": user_prompt}]}],
            "generationConfig": {
                "responseMimeType": "application/json",
                "temperature": 0.4
            }
        }

        resp = requests.post(url, headers=headers, json=payload, timeout=7.0)
        resp.raise_for_status()
        res_json = resp.json()
        raw_text = res_json['candidates'][0]['content']['parts'][0]['text']
        ai_data = json.loads(raw_text)
        
        # Normalize bullet improvements for compatibility
        if 'better_bullet_examples' in ai_data and 'project_bullet_improvements' not in ai_data:
            ai_data['project_bullet_improvements'] = [
                {
                    'original_theme': item.get('weak', ''),
                    'suggested_rewrite': item.get('better', ''),
                    'rationale': item.get('rationale', '')
                }
                for item in ai_data['better_bullet_examples']
            ]
        elif 'project_bullet_improvements' in ai_data and 'better_bullet_examples' not in ai_data:
            ai_data['better_bullet_examples'] = [
                {
                    'weak': item.get('original_theme', ''),
                    'better': item.get('suggested_rewrite', ''),
                    'rationale': item.get('rationale', '')
                }
                for item in ai_data['project_bullet_improvements']
            ]

        ai_data['provider'] = 'google_gemini'
        ai_data['model'] = model
        ai_data['is_live_ai'] = True
        return ai_data

    @classmethod
    def generate_resume_intelligence(
        cls, 
        resume_text: str, 
        skills: List[str], 
        target_role: str, 
        quality_score: float,
        matched_skills: List[str],
        missing_skills: List[str]
    ) -> Dict[str, Any]:
        """
        Generates structured AI feedback, actionable rewrites, and roadmap steps.
        Uses Google Gemini when GEMINI_API_KEY is configured with a 7s timeout,
        then immediately falls back to the deterministic internal engine.
        """
        # 1. Try Google Gemini if configured
        if Config.GEMINI_API_KEY and Config.GEMINI_API_KEY.strip() and not Config.GEMINI_API_KEY.startswith("replace_"):
            try:
                return cls._call_gemini(resume_text, skills, target_role, quality_score, matched_skills, missing_skills)
            except Exception as e:
                logger.warning(f"Google Gemini API call failed or timed out ({e}). Falling back immediately to deterministic engine.")
                fallback = cls._generate_deterministic_fallback(skills, target_role, quality_score, matched_skills, missing_skills)
                fallback['provider_status'] = "Deterministic Heuristic Engine (Fallback)"
                return fallback

        # 2. No live AI configured: Provide deterministic high-grade intelligence
        fallback = cls._generate_deterministic_fallback(skills, target_role, quality_score, matched_skills, missing_skills)
        fallback['provider_status'] = "Deterministic Heuristic Engine"
        return fallback

    @classmethod
    def _generate_deterministic_fallback(
        cls,
        skills: List[str],
        target_role: str,
        quality_score: float,
        matched_skills: List[str],
        missing_skills: List[str]
    ) -> Dict[str, Any]:
        """High-fidelity fallback advice calibrated to the candidate's actual data with realistic examples."""
        top_matched = matched_skills[:4] if matched_skills else skills[:4]
        top_missing = missing_skills[:4] if missing_skills else ["System Design", "Cloud Infrastructure"]
        
        top_skills_str = ", ".join(top_matched) if top_matched else "modern software engineering"
        missing_str = ", ".join(top_missing)

        executive_summary = (
            f"Candidate displays foundational proficiencies in {top_skills_str}. "
            f"To accelerate readiness for {target_role} opportunities, prioritize closing the gap in {missing_str} "
            f"and strengthening evidence of measurable project outcomes."
        )

        summary_rewrite = (
            f"Results-driven technical specialist with expertise in {top_skills_str}, focused on architecting "
            f"high-performance solutions for {target_role} roles. Demonstrated ability to build reliable applications, "
            f"optimize software architecture, and rapidly master new frameworks such as {top_missing[0] if top_missing else 'modern cloud tools'}."
        )

        key_insights = [
            f"Technical strengths match core {target_role} fundamentals in {top_skills_str}.",
            f"High-impact opportunity: Add a flagship full-stack project demonstrating hands-on integration of {missing_str}.",
            "Enhance resume bullet points with STAR format (Situation, Task, Action, Result) with quantified metrics."
        ]

        high_priority_fixes = [
            {
                'issue': f"Missing benchmark skills for {target_role}: {missing_str}",
                'action': f"Add a targeted capstone project showcasing {top_missing[0] if top_missing else 'modern frameworks'} with automated tests and CI/CD.",
                'priority': "High"
            },
            {
                'issue': "Passive language and unquantified project descriptions",
                'action': "Revise all bullet points to use active verbs and quantify impact (latency reductions, data volumes, users served).",
                'priority': "High"
            },
            {
                'issue': "ATS scanability and section keyword density",
                'action': "Group technical skills by category (Languages, Databases, Tools) and include explicit keywords from the job description.",
                'priority': "Medium"
            }
        ]

        better_bullet_examples = [
            {
                'weak': "Worked on a website.",
                'better': "Built a responsive React dashboard that reduced manual reporting time by 35% for 20 internal users.",
                'rationale': "Specifies component architecture, identifies the active user base, and quantifies workflow efficiency gain."
            },
            {
                'weak': "Know Python and SQL.",
                'better': "Used Python, Pandas, and SQL to clean and analyze 50,000+ records, improving reporting accuracy.",
                'rationale': "Replaces static keyword declarations with verified volume metrics and real business intelligence outcomes."
            },
            {
                'weak': "Made a college project.",
                'better': "Developed a Flask-based expense tracker with user authentication and PostgreSQL persistence; deployed it for live testing.",
                'rationale': "Highlights backend security ownership, relational schema design, and production deployment."
            }
        ]

        ats_keywords = [
            f"{target_role} Architecture",
            f"RESTful API & {top_skills_str.split(',')[0]} Integration",
            f"Relational & Distributed Databases ({'PostgreSQL, Redis' if 'PostgreSQL' not in top_skills_str else 'SQLAlchemy, Indexing'})",
            "Agile Development & CI/CD Pipelines",
            "Automated Testing & Code Quality (PyTest / Jest)"
        ]

        next_steps = [
            f"Update your summary section with the role-tailored rewrite targeting {target_role}.",
            "Replace 2-3 vague bullet points in your projects with the STAR transformations above.",
            f"Complete a containerized showcase project integrating {top_missing[0] if top_missing else 'Docker & Cloud Deployment'}."
        ]

        interview_prep_tips = [
            f"Be ready to explain how you would design a system using {top_matched[0] if top_matched else 'your primary stack'} alongside {top_missing[0] if top_missing else 'relational storage'}.",
            "Practice walking through a difficult bug you resolved: debugging methodology, root cause analysis, and preventative regression tests.",
            f"Review standard technical challenges specific to {target_role}: API rate limiting, concurrency handling, and clean code principles."
        ]

        roadmap_milestones = [
            {
                'title': f"Master Core Missing Tool: {top_missing[0] if top_missing else 'Docker & Containerization'}",
                'description': f"Complete a hands-on project deploying a containerized service with automated tests and CI/CD.",
                'priority': 'high',
                'category': 'skill'
            },
            {
                'title': f"Build Flagship {target_role} Capstone Project",
                'description': f"Develop an end-to-end production-ready project incorporating {top_skills_str} with live demo and GitHub documentation.",
                'priority': 'high',
                'category': 'project'
            },
            {
                'title': "Optimize Project Descriptions with Metric Backing",
                'description': "Revise all resume project bullet points to highlight throughput, latency reductions, test coverage, or user metrics.",
                'priority': 'medium',
                'category': 'resume'
            },
            {
                'title': f"Technical Interview Simulation for {target_role}",
                'description': "Complete 10 LeetCode / Data Structure problems and 3 mock behavioral interview rounds using the STAR method.",
                'priority': 'medium',
                'category': 'interview'
            }
        ]

        return {
            'executive_summary': executive_summary,
            'summary_rewrite': summary_rewrite,
            'key_insights': key_insights,
            'high_priority_fixes': high_priority_fixes,
            'better_bullet_examples': better_bullet_examples,
            'project_bullet_improvements': [
                {
                    'original_theme': item['weak'],
                    'suggested_rewrite': item['better'],
                    'rationale': item['rationale']
                }
                for item in better_bullet_examples
            ],
            'missing_skills': top_missing,
            'ats_keywords': ats_keywords,
            'next_steps': next_steps,
            'interview_prep_tips': interview_prep_tips,
            'roadmap_milestones': roadmap_milestones,
            'provider': 'deterministic_fallback',
            'is_live_ai': False
        }

    @classmethod
    def chat_assistant(
        cls,
        message: str,
        target_role: str = 'Software Developer',
        quality_score: float = None,
        skills: List[str] = None,
        missing_skills: List[str] = None
    ) -> Dict[str, Any]:
        """
        Interactive career coach chat assistant.
        Uses Google Gemini when GEMINI_API_KEY is configured,
        or immediately falls back to high-fidelity deterministic fallback.
        """
        skills = skills or []
        missing_skills = missing_skills or []
        msg_clean = (message or '').strip()

        context_str = (
            f"Target Role: {target_role}\n"
            f"Resume Score: {quality_score if quality_score is not None else 'Not yet analyzed'}/100\n"
            f"Detected Skills: {', '.join(skills[:8]) if skills else 'Not extracted yet'}\n"
            f"Missing Benchmark Skills: {', '.join(missing_skills[:5]) if missing_skills else 'None identified'}\n"
        )

        system_instruction = (
            "You are meRESUmax Career Assistant, an expert technical recruiter and resume strategist. "
            "Help the candidate optimize their resume, prepare for interviews, understand ATS algorithms, "
            "and land technical roles. Give direct, actionable, concise advice (under 180 words). "
            "Use bullet points and concrete examples (e.g., STAR bullet rewrites with quantifiable metrics). "
            "Never invent fake credentials."
        )

        # 1. Try Gemini
        if Config.GEMINI_API_KEY and Config.GEMINI_API_KEY.strip() and not Config.GEMINI_API_KEY.startswith("replace_"):
            try:
                model = Config.GEMINI_MODEL or "gemini-2.5-flash"
                url = f"https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent?key={Config.GEMINI_API_KEY}"
                payload = {
                    "system_instruction": {"parts": [{"text": system_instruction}]},
                    "contents": [{"parts": [{"text": f"Context:\n{context_str}\nUser Question: {msg_clean}"}]}],
                    "generationConfig": {"temperature": 0.4, "maxOutputTokens": 600}
                }
                resp = requests.post(url, headers={"Content-Type": "application/json"}, json=payload, timeout=6.0)
                if resp.status_code == 200:
                    data = resp.json()
                    reply = data['candidates'][0]['content']['parts'][0]['text']
                    return {
                        'reply': reply.strip(),
                        'provider': 'google_gemini',
                        'model': model,
                        'is_live_ai': True,
                        'disclaimer': None
                    }
                else:
                    logger.warning(f"Gemini API returned status {resp.status_code}: {resp.text}")
            except Exception as e:
                logger.warning(f"Gemini assistant chat failed, falling back: {e}")

        # 2. Deterministic Heuristic Assistant (Demo / Fallback Mode)
        reply = cls._generate_chat_fallback(msg_clean, target_role, quality_score, skills, missing_skills)
        return {
            'reply': reply,
            'provider': 'deterministic_demo',
            'is_live_ai': False,
            'disclaimer': 'Demo Engine Fallback (Deterministic Mode) — Running in built-in fallback mode without external API keys. Configure GEMINI_API_KEY to activate live AI.'
        }

    @classmethod
    def _generate_chat_fallback(
        cls,
        msg: str,
        target_role: str,
        quality_score: float,
        skills: List[str],
        missing_skills: List[str]
    ) -> str:
        lower = msg.lower()
        skills_str = ', '.join(skills[:4]) if skills else "Python, React, and SQL"
        missing_str = ', '.join(missing_skills[:3]) if missing_skills else "Cloud Architecture & Docker"

        # 1. Job Matching & Opportunities
        if any(w in lower for w in ['job', 'match', 'opportunity', 'opening', 'vacancy']):
            return (
                f"### Career Opportunity Recommendations for {target_role}\n\n"
                f"Based on your profile with {skills_str}:\n"
                f"• **Top Job Titles**: Junior/Mid-Level {target_role}, Full Stack Associate, Cloud Applications Engineer.\n"
                f"• **Target Keywords to Search**: {target_role}, {skills_str}.\n"
                f"• **Closing Skill Gaps**: Adding {missing_str} will increase your match rate by up to 25%.\n\n"
                "👉 *Head to the Opportunity Radar (/jobs) to view matching openings and track applications in the Kanban pipeline (/tracker).*"
            )

        # 2. ATS Formatting & Parsing Standards
        if any(w in lower for w in ['ats', 'format', 'layout', 'font', 'template', 'column', 'margin', 'docx', 'pdf', 'parser', 'parse']):
            return (
                f"### ATS Formatting & Parsing Standards for {target_role}\n\n"
                "To ensure 100% readability across modern Applicant Tracking Systems (Workday, Greenhouse, Lever, Taleo):\n"
                "• **Linear Single-Column Layout**: Avoid multi-column tables, text boxes, and floating header graphics.\n"
                "• **Standard Section Headers**: Use universal titles: `Professional Summary`, `Technical Skills`, `Experience`, `Projects`, `Education`.\n"
                "• **Clean File Formats**: Standard PDF or Microsoft Word DOCX under 16 MB. Avoid scanned images or rasterized text.\n"
                "• **Typography**: Use standard clean fonts (Inter, Arial, Calibri, Helvetica) at 10-11pt with 0.5-0.75in margins.\n"
                "• **Structured Skills Section**: Categorize skills (Languages, Frameworks, Cloud, Databases) without rating bars or percentages.\n\n"
                "💡 *Run your updated document through our ATS Audit Engine (/analyze) to verify parsing accuracy.*"
            )

        # 3. Score calculation & heuristic breakdown
        if any(w in lower for w in ['score', 'explain', 'audit', 'calculate', 'breakdown', 'dimension', 'points']):
            score_text = f"{round(quality_score)}/100" if quality_score is not None else "pending audit"
            return (
                f"### How Your Score is Calculated (Current: {score_text})\n\n"
                "The meRESUmax scoring engine evaluates 5 core dimensions:\n"
                "• **Section Structure & ATS Readability** (20 pts): Standard headers, contact details, parsing clarity.\n"
                "• **Technical Skill Density** (20 pts): Depth and categorization of modern frameworks.\n"
                "• **Measurable Impact & Action Verbs** (25 pts): Quantifiable STAR metrics (%, throughput, volume).\n"
                f"• **Role Archetype Alignment** (25 pts): Keyword alignment against {target_role} benchmarks.\n"
                "• **ATS Hygiene** (10 pts): Clean formatting free of unparseable columns or icons.\n\n"
                "💡 *Tip: To gain 10-15 points immediately, revise 2 project bullet points with hard metrics.*"
            )

        # 4. Technical & Behavioral Interview Preparation
        if any(w in lower for w in ['interview', 'question', 'prepare', 'prep', 'behavioral', 'mock']):
            return (
                f"### Technical Interview Preparation for {target_role}\n\n"
                "Key technical and behavioral focus areas:\n"
                f"1. **System Design & Architecture**: How would you build a scalable service integrating {skills[0] if skills else 'REST APIs'} with caching?\n"
                "2. **Performance Optimization**: Walk through how you diagnosed a high-latency query or memory leak in production.\n"
                "3. **Behavioral (STAR)**: Describe a time you disagreed with a technical design decision and how you reached consensus.\n\n"
                "👉 *Use our AI Mock Interview Simulator (/interview) to practice answering with instant STAR feedback and voice dictation.*"
            )

        # 5. Roadmap & Skill Upskilling Guidance
        if any(w in lower for w in ['roadmap', 'upskill', 'learn', 'study', 'milestone', 'path', 'gap', 'timeline']):
            return (
                f"### Targeted Learning Roadmap for {target_role}\n\n"
                f"To close high-impact skill gaps and qualify for higher-tier {target_role} roles:\n"
                f"• **Sprint 1 (Weeks 1-2)**: Core Proficiency in {skills_str} — build a functional project emphasizing production error handling.\n"
                f"• **Sprint 2 (Weeks 3-4)**: Gap Remediation in {missing_str} — implement containerization, CI/CD pipeline automation, and automated testing.\n"
                "• **Sprint 3 (Weeks 5-6)**: System Architecture & Scale — document trade-offs, caching (Redis), and database indexing strategies.\n"
                "• **Sprint 4 (Weeks 7-8)**: Portfolio & Proof of Work — publish verified open-source code and link demo deployments directly on your resume.\n\n"
                "👉 *View, track, and complete your personalized milestones in the Career Roadmap dashboard (/roadmap).*"
            )

        # 6. Account, Profile & Data Privacy Management
        if any(w in lower for w in ['account', 'delete', 'password', 'privacy', 'settings', 'data policy', 'profile']):
            return (
                "### Account & Data Management in meRESUmax\n\n"
                "Here is how you can manage your account and confidential documents:\n"
                "• **Update Profile & Target Role**: Head to your Profile page (/profile) to update your name, target role, education, and credentials.\n"
                "• **Document Privacy**: Your resumes and analysis audits are isolated in your private session and never used to train public models.\n"
                "• **Delete Uploads or Audits**: You can delete individual resumes or analysis audits anytime from History (/history).\n"
                "• **Permanent Account Deletion**: You can permanently purge your entire account, resumes, and data from the Profile settings section.\n\n"
                "👉 *Navigate to My Profile (/profile) to manage your candidate preferences.*"
            )

        # 7. General Career Strategy & Networking
        if any(w in lower for w in ['career', 'salary', 'negotiat', 'switch', 'transition', 'linkedin', 'network', 'offer']):
            return (
                f"### Career Growth & Strategy for {target_role}\n\n"
                "Strategic recommendations to maximize your career trajectory and compensation:\n"
                '• **LinkedIn Optimization**: Craft an impactful headline with target keywords (e.g., "Software Engineer | Distributed Systems | Python & React").\n'
                "• **Proof of Capability**: Replace broad claims with verifiable links to GitHub repositories, live projects, or technical case studies.\n"
                "• **Salary Benchmarking**: Research compensation bands for your region using current market data and negotiate based on quantified impact.\n"
                "• **Cover Letters & Outreach**: Generate customized, company-specific cover letters using our AI Career Tools (/tools).\n\n"
                "👉 *Explore our AI Tools suite (/tools) for instant cover letters and LinkedIn headline generators.*"
            )

        # 8. Resume improvement & STAR bullets
        if any(w in lower for w in ['improve', 'resume', 'bullet', 'rewrite', 'action verb', 'star']):
            return (
                f"### Resume Optimization Strategy for {target_role}\n\n"
                "To instantly elevate your resume above 85% of applicants:\n"
                "1. **Use STAR Formatted Bullets**: Frame achievements as (Situation, Task, Action, Result).\n"
                '   - *Weak*: "Worked on a website."\n'
                '   - *Improved*: "Built a responsive React dashboard that reduced manual reporting time by 35% for 20 internal users."\n'
                "2. **Quantify Metrics**: Add numbers (latency reduction, query times, users served, records processed).\n"
                f"3. **Target High-Impact Skills**: Highlight proficiency in {skills_str} and consider addressing gaps in {missing_str}.\n"
                "4. **ATS Hygiene**: Keep headers standard (Experience, Projects, Education) without graphical tables."
            )

        # 9. General Focused Recruiting Guidance
        return (
            f"Hello! I am your meRESUmax Career Intelligence Assistant.\n\n"
            f"I specialize in technical career advancement, resume optimization, and interview preparation for **{target_role}** roles. I can assist you with:\n"
            "• **Resume Optimization**: Transform bullet points into quantified STAR impact statements.\n"
            "• **Score Breakdown**: Understand your 5-dimension heuristic audit score and how to reach 90+.\n"
            "• **ATS Formatting**: Master clean parsing layout, fonts, and section structure.\n"
            "• **Interview Prep**: Practice behavioral and technical questions for target roles.\n"
            "• **Job Search & Roadmap**: Discover curated openings and structured learning milestones.\n\n"
            "How can I assist your career progression today?"
        )
