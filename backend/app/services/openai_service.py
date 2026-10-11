import json
import logging
from typing import Dict, Any, List
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
        Falls back to high-grade deterministic synthesis if OpenAI API is unconfigured or unavailable.
        """
        client = cls.get_client()
        
        if client:
            try:
                # Sanitize text: truncate to 3500 chars to protect privacy and respect token limits
                safe_text = resume_text[:3500]
                
                system_prompt = (
                    "You are meRESUmax Career Intelligence AI, a senior technical recruiter and career coach. "
                    "Analyze the candidate's resume objectively. Do NOT invent fake companies, degrees, or years of experience. "
                    "Return ONLY valid JSON with keys: "
                    "'executive_summary' (string), "
                    "'summary_rewrite' (suggested enhanced 3-sentence summary for target role), "
                    "'key_insights' (array of 3 strings), "
                    "'project_bullet_improvements' (array of objects with 'original_theme', 'suggested_rewrite', 'rationale'), "
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
                ai_data['provider'] = 'openai'
                ai_data['model'] = Config.OPENAI_MODEL or 'gpt-4o-mini'
                ai_data['is_live_ai'] = True
                return ai_data
            except Exception as e:
                logger.error(f"OpenAI API call failed or timed out: {e}")
                # Seamless fallback with note
                fallback = cls._generate_deterministic_fallback(skills, target_role, quality_score, matched_skills, missing_skills)
                fallback['provider_status'] = f"Deterministic Fallback (OpenAI Error: {str(e)[:80]})"
                return fallback

        # No API Key provided: Provide deterministic high-grade intelligence
        fallback = cls._generate_deterministic_fallback(skills, target_role, quality_score, matched_skills, missing_skills)
        fallback['provider_status'] = "Deterministic Heuristic Engine (Configure OPENAI_API_KEY for live GPT-4o inferences)"
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
        """High-fidelity fallback advice calibrated to the candidate's actual data."""
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

        project_bullet_improvements = [
            {
                'original_theme': "Built an application and integrated backend APIs.",
                'suggested_rewrite': f"Architected a scalable {target_role} service utilizing {top_matched[0] if top_matched else 'Python'}, reducing latency by 28% and handling concurrent client requests.",
                'rationale': "Emphasizes technical ownership, active verbs, and quantified performance impact."
            },
            {
                'original_theme': "Worked on database design and user authentication.",
                'suggested_rewrite': "Implemented secure JWT-based session authentication and indexed relational database schemas, ensuring data isolation and sub-100ms query response times.",
                'rationale': "Highlights security awareness, schema optimization, and measurable query speed."
            }
        ]

        interview_prep_tips = [
            f"Be ready to explain how you would design a system using {top_matched[0] if top_matched else 'your primary stack'} alongside {top_missing[0] if top_missing else 'relational storage'}.",
            "Practice walking through a difficult bug you resolved: the debugging methodology, root cause analysis, and preventative regression tests.",
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
            'project_bullet_improvements': project_bullet_improvements,
            'interview_prep_tips': interview_prep_tips,
            'roadmap_milestones': roadmap_milestones,
            'provider': 'deterministic_fallback',
            'is_live_ai': False
        }
