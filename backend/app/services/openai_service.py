import json
import logging
from typing import Dict, Any, List
import requests
from openai import OpenAI
from ..config import Config

logger = logging.getLogger(__name__)

class AIService:
    @classmethod
    def get_client(cls):
        if Config.OPENAI_API_KEY and Config.OPENAI_API_KEY.strip() and not Config.OPENAI_API_KEY.startswith("replace_"):
            try:
                return OpenAI(api_key=Config.OPENAI_API_KEY, timeout=20.0)
            except Exception as e:
                logger.warning(f"Failed to initialize OpenAI client: {e}")
        return None

    @classmethod
    def _build_prompts(cls, resume_text: str, skills: List[str], target_role: str, quality_score: float, matched_skills: List[str], missing_skills: List[str]):
        safe_text = resume_text[:3500]
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
            f"Extracted Skills: {', '.join(skills[:25])}\n"
            f"Matched Skills: {', '.join(matched_skills[:15])}\n"
            f"Missing Key Skills: {', '.join(missing_skills[:10])}\n"
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
        """Calls Google Gemini API with JSON structured output."""
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

        resp = requests.post(url, headers=headers, json=payload, timeout=25.0)
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
        Tries Google Gemini first (if configured), then OpenAI, then falls back to deterministic engine.
        """
        # 1. Try Google Gemini if configured
        if Config.GEMINI_API_KEY and Config.GEMINI_API_KEY.strip() and not Config.GEMINI_API_KEY.startswith("replace_"):
            try:
                return cls._call_gemini(resume_text, skills, target_role, quality_score, matched_skills, missing_skills)
            except Exception as e:
                logger.error(f"Google Gemini API call failed: {e}")

        # 2. Try OpenAI if configured
        client = cls.get_client()
        if client:
            try:
                system_prompt, user_prompt = cls._build_prompts(resume_text, skills, target_role, quality_score, matched_skills, missing_skills)

                response = client.chat.completions.create(
                    model=Config.OPENAI_MODEL or "gpt-4o-mini",
                    messages=[
                        {"role": "system", "content": system_prompt},
                        {"role": "user", "content": user_prompt}
                    ],
                    response_format={"type": "json_object"},
                    temperature=0.4,
                    max_tokens=1500
                )
                
                content = response.choices[0].message.content
                ai_data = json.loads(content)
                
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

                ai_data['provider'] = 'openai'
                ai_data['model'] = Config.OPENAI_MODEL or 'gpt-4o-mini'
                ai_data['is_live_ai'] = True
                return ai_data
            except Exception as e:
                logger.error(f"OpenAI API call failed or timed out: {e}")

        # 3. No live AI or failure: Provide deterministic high-grade intelligence
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
