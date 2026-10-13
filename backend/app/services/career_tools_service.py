import json
import logging
from typing import Dict, Any, List
import requests
from ..config import Config

logger = logging.getLogger(__name__)

class CareerToolsService:
    @classmethod
    def generate_cover_letter(
        cls,
        candidate_name: str,
        target_role: str,
        company_name: str,
        job_description: str = '',
        resume_summary: str = '',
        skills: List[str] = None,
        tone: str = 'Professional'
    ) -> Dict[str, Any]:
        """Generates a high-converting cover letter using Gemini AI or structured recruiter template."""
        skills = skills or []
        company = company_name.strip() if company_name.strip() else "your organization"

        if Config.GEMINI_API_KEY and Config.GEMINI_API_KEY.strip() and not Config.GEMINI_API_KEY.startswith("replace_"):
            try:
                model = Config.GEMINI_MODEL or "gemini-2.5-flash"
                url = f"https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent?key={Config.GEMINI_API_KEY}"
                headers = {"Content-Type": "application/json"}
                
                system_instruction = (
                    "You are an executive career coach and elite technical recruiter. "
                    "Draft an authentic, compelling, ATS-optimized cover letter for the candidate. "
                    "Focus on demonstrated value, quantifiable impact, and cultural resonance. "
                    "Avoid generic cliches like 'I am writing to express my enthusiasm'. "
                    "Return ONLY valid JSON with keys: "
                    "'cover_letter' (string with formatted markdown paragraphs), "
                    "'subject_line' (suggested email subject line), "
                    "'key_highlights' (array of 3 highlighted bullet points used), "
                    "'match_notes' (brief note on how this was tailored)."
                )
                
                user_content = (
                    f"Candidate Name: {candidate_name}\n"
                    f"Target Role: {target_role}\n"
                    f"Target Company: {company}\n"
                    f"Tone: {tone}\n"
                    f"Candidate Technical Skills: {', '.join(skills[:15]) if skills else 'Software Engineering'}\n"
                    f"Candidate Background/Achievements: {resume_summary[:800] if resume_summary else 'Passionate engineer delivering high-impact solutions.'}\n"
                    f"Target Job Description Highlights: {job_description[:800] if job_description else 'Seeking proactive talent.'}\n"
                )
                
                payload = {
                    "system_instruction": {"parts": [{"text": system_instruction}]},
                    "contents": [{"parts": [{"text": user_content}]}],
                    "generationConfig": {
                        "responseMimeType": "application/json",
                        "temperature": 0.4
                    }
                }
                
                resp = requests.post(url, headers=headers, json=payload, timeout=22.0)
                if resp.status_code == 200:
                    data = resp.json()
                    raw_text = data['candidates'][0]['content']['parts'][0]['text']
                    parsed = json.loads(raw_text)
                    if isinstance(parsed, dict) and 'cover_letter' in parsed:
                        letter = parsed['cover_letter'].strip()
                        if candidate_name and candidate_name.lower() not in letter.lower():
                            letter += f"\n\nSincerely,\n{candidate_name}"
                            parsed['cover_letter'] = letter
                        return parsed
            except Exception as e:
                logger.warning(f"Gemini cover letter generation failed, falling back to template: {e}")

        # Deterministic Recruiter-Grade Fallback
        skills_str = ", ".join(skills[:4]) if skills else "modern software engineering and scalable systems"
        
        paragraphs = [
            f"Dear Hiring Team at {company},",
            f"I am writing to present my candidacy for the {target_role} position. With hands-on engineering experience spanning {skills_str}, I specialize in transforming complex business requirements into robust, high-availability software products.",
            f"Throughout my career, I have prioritized architectural clarity, clean maintainable code, and measurable impact. Whether architecting decoupled application services, optimizing query and rendering pipelines, or championing rigorous automated testing, my objective has always been delivering verifiable user value and operational resilience.",
            f"{company}'s dedication to engineering excellence and scalable innovation deeply aligns with my technical ethos. I am eager to contribute my expertise in {skills[0] if skills else 'modern architecture'} to accelerate your product roadmap and support your team's ambitious growth objectives.",
            f"Thank you for your time and consideration. I welcome the opportunity to discuss how my skill set and problem-solving mindset will benefit {company}.",
            f"Sincerely,\n{candidate_name}"
        ]
        
        letter_text = "\n\n".join(paragraphs)
        return {
            'cover_letter': letter_text,
            'subject_line': f"Application for {target_role} - {candidate_name}",
            'key_highlights': [
                f"Demonstrated proficiency across {skills_str}",
                "Focus on performance optimization and scalable architecture",
                "Proven track record of quantifiable engineering results"
            ],
            'match_notes': f"Directly tailored for {company} and the {target_role} role."
        }

    @classmethod
    def generate_linkedin(
        cls,
        candidate_name: str,
        target_role: str,
        skills: List[str] = None,
        resume_summary: str = ''
    ) -> Dict[str, Any]:
        """Generates 3 punchy LinkedIn headlines and a high-converting About section."""
        skills = skills or []

        if Config.GEMINI_API_KEY and Config.GEMINI_API_KEY.strip() and not Config.GEMINI_API_KEY.startswith("replace_"):
            try:
                model = Config.GEMINI_MODEL or "gemini-2.5-flash"
                url = f"https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent?key={Config.GEMINI_API_KEY}"
                headers = {"Content-Type": "application/json"}
                
                system_instruction = (
                    "You are a LinkedIn personal branding strategist for top tech talent. "
                    "Generate high-visibility profile copy that ranks at the top of recruiter searches. "
                    "Return ONLY valid JSON with keys: "
                    "'headlines' (array of 3 distinct, impactful headline options under 220 chars), "
                    "'about_section' (a warm, 1st-person storytelling bio formatted with bullet points for skills and call to action), "
                    "'core_competencies' (array of 6 high-traffic search keywords), "
                    "'featured_post_prompt' (a suggested thought-leadership post idea for the candidate)."
                )
                
                user_content = (
                    f"Candidate Name: {candidate_name}\n"
                    f"Target Role: {target_role}\n"
                    f"Top Skills: {', '.join(skills[:15]) if skills else 'Software Engineering'}\n"
                    f"Experience Highlights: {resume_summary[:700] if resume_summary else 'Passionate engineer delivering high-impact solutions.'}\n"
                )
                
                payload = {
                    "system_instruction": {"parts": [{"text": system_instruction}]},
                    "contents": [{"parts": [{"text": user_content}]}],
                    "generationConfig": {
                        "responseMimeType": "application/json",
                        "temperature": 0.4
                    }
                }
                
                resp = requests.post(url, headers=headers, json=payload, timeout=20.0)
                if resp.status_code == 200:
                    data = resp.json()
                    raw_text = data['candidates'][0]['content']['parts'][0]['text']
                    parsed = json.loads(raw_text)
                    if isinstance(parsed, dict) and 'headlines' in parsed:
                        return parsed
            except Exception as e:
                logger.warning(f"Gemini LinkedIn copy generation failed, falling back to templates: {e}")

        # Deterministic High-Impact Fallback
        skill_tag = " | ".join(skills[:3]) if skills else "Full-Stack Development | Cloud | AI"
        headlines = [
            f"{target_role} | Specializing in {skill_tag} | Building Scalable, Resilient Software",
            f"Software Engineer & {target_role} | {', '.join(skills[:3]) if skills else 'Modern Web & Systems'} | Impact-Driven Problem Solver",
            f"{target_role} @ Scale | Crafting High-Performance Systems & User Experiences | {skills[0] if skills else 'Tech Innovator'}"
        ]

        about = (
            f"Hi! I am {candidate_name}, a passionate {target_role} focused on architecting resilient, user-centric software systems.\n\n"
            f"I believe that extraordinary software is born at the intersection of rigorous engineering, thoughtful system design, and relentless empathy for end users. "
            f"My focus centers on taking ambiguous challenges and transforming them into maintainable, scalable, and high-impact digital experiences.\n\n"
            f"🚀 What I Bring to the Table:\n"
            f"• Deep technical proficiency in {', '.join(skills[:5]) if skills else 'Modern Frameworks, Cloud Infrastructure, and API Architecture'}\n"
            f"• Passion for performance optimization, clean code architecture, and automated reliability\n"
            f"• Collaborative team mindset with proactive cross-functional communication\n\n"
            f"📫 Open to exciting conversations, engineering discussions, and new career opportunities. Feel free to connect or reach out!"
        )

        return {
            'headlines': headlines,
            'about_section': about,
            'core_competencies': skills[:6] if skills else ['Full Stack', 'System Architecture', 'API Design', 'Cloud', 'Performance', 'Agile'],
            'featured_post_prompt': f"Break down a recent architectural challenge you resolved in {skills[0] if skills else 'your latest project'} and the lessons learned."
        }
