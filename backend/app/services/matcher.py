import re
from typing import Dict, Any, List
from .parser import ROLE_SKILL_REQUIREMENTS, ResumeParser

class JobMatcher:
    """
    Deterministic Job Matching Engine.
    Evaluates resume against a target role archetype or custom job description.
    """

    @classmethod
    def match_resume_to_role(cls, parsed_data: Dict[str, Any], target_role: str, custom_jd: str = "") -> Dict[str, Any]:
        user_skills = [s.lower() for s in parsed_data.get('skills', [])]
        text_lower = parsed_data.get('text', '').lower()
        
        # Determine benchmark requirements
        role_config = ROLE_SKILL_REQUIREMENTS.get(target_role)
        if not role_config:
            # Fallback to general Software Developer archetype
            role_config = ROLE_SKILL_REQUIREMENTS['Software Developer']

        required_skills = list(role_config['required'])
        preferred_skills = list(role_config['preferred'])

        # If custom JD is provided, extract additional keywords from JD
        if custom_jd and len(custom_jd.strip()) > 20:
            jd_extracted = ResumeParser.extract_skills(custom_jd)
            jd_skills = jd_extracted.get('skills_list', [])
            for s in jd_skills:
                if s not in required_skills and s not in preferred_skills:
                    if len(required_skills) < 10:
                        required_skills.append(s)
                    else:
                        preferred_skills.append(s)

        matched_skills = []
        missing_required = []
        missing_preferred = []

        # Check required
        for req in required_skills:
            if req.lower() in user_skills or re.search(r'\b' + re.escape(req.lower()) + r'\b', text_lower):
                matched_skills.append(req)
            else:
                missing_required.append(req)

        # Check preferred
        for pref in preferred_skills:
            if pref.lower() in user_skills or re.search(r'\b' + re.escape(pref.lower()) + r'\b', text_lower):
                if pref not in matched_skills:
                    matched_skills.append(pref)
            else:
                missing_preferred.append(pref)

        # Score calculation:
        # Required skills carry 60% weight
        # Preferred skills carry 25% weight
        # Keyword density & domain context carry 15% weight
        total_req = max(1, len(required_skills))
        matched_req_count = len([s for s in required_skills if s in matched_skills])
        req_ratio = matched_req_count / total_req

        total_pref = max(1, len(preferred_skills))
        matched_pref_count = len([s for s in preferred_skills if s in matched_skills])
        pref_ratio = matched_pref_count / total_pref

        # Check role domain context in text
        role_tokens = target_role.lower().split()
        context_matches = sum(1 for tok in role_tokens if tok in text_lower)
        context_score = min(1.0, context_matches / max(1, len(role_tokens)))

        calculated_match = (req_ratio * 60.0) + (pref_ratio * 25.0) + (context_score * 15.0)
        match_score = round(max(15.0, min(96.0, calculated_match)), 1)

        recommendations = []
        if missing_required:
            recommendations.append(f"Prioritize acquiring top missing core skills: {', '.join(missing_required[:3])}.")
        if missing_preferred:
            recommendations.append(f"Enhance competitiveness with preferred tooling: {', '.join(missing_preferred[:3])}.")
        if match_score < 60:
            recommendations.append(f"Build a dedicated portfolio project directly targeting the {target_role} tech stack.")
        else:
            recommendations.append(f"Good alignment with {target_role} expectations. Tailor project bullet points to emphasize relevant skills.")

        return {
            'target_role': target_role,
            'match_score': match_score,
            'matched_skills': matched_skills,
            'missing_required_skills': missing_required,
            'missing_preferred_skills': missing_preferred,
            'missing_skills': missing_required + missing_preferred,
            'required_count': len(required_skills),
            'matched_count': len(matched_skills),
            'recommendations': recommendations
        }
