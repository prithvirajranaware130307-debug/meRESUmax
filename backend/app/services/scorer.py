import re
from typing import Dict, Any, List

class ResumeScorer:
    """
    Transparent Heuristic Scoring Engine (0 - 100).
    Breakdown:
      - Structure & Completeness (20%)
      - Relevant Skills Depth (25%)
      - Projects & Experience (25%)
      - Clarity & Formatting (15%)
      - Measurable Impact & Achievements (15%)
    """

    @classmethod
    def calculate_quality_score(cls, parsed_data: Dict[str, Any], target_role: str = 'Software Developer') -> Dict[str, Any]:
        text = parsed_data.get('text', '')
        sections = parsed_data.get('sections', {})
        skills = parsed_data.get('skills', [])
        word_count = parsed_data.get('word_count', len(text.split()))

        strengths = []
        weaknesses = []
        improvements = []

        # 1. Structure & Completeness (20 points max)
        structure_score = 0
        detected_sections = 0
        
        if sections.get('summary') or re.search(r'(?i)\b(summary|objective|profile)\b', text):
            structure_score += 4
            detected_sections += 1
        else:
            weaknesses.append("Missing a concise Professional Summary / Career Objective.")
            improvements.append("Add a 2-3 sentence Professional Summary highlighting your background and career goals.")

        if sections.get('education') or re.search(r'(?i)\b(bachelor|master|b\.tech|b\.e|degree|university|college|gpa)\b', text):
            structure_score += 4
            detected_sections += 1
        else:
            weaknesses.append("Education section is unverified or lacks explicit degree details.")
            improvements.append("Ensure your degree, institution, and graduation year are clearly listed.")

        if sections.get('skills') or len(skills) > 0:
            structure_score += 4
            detected_sections += 1

        if sections.get('experience') or re.search(r'(?i)\b(experience|intern|internship|developer|engineer|worked)\b', text):
            structure_score += 4
            detected_sections += 1

        if sections.get('projects') or re.search(r'(?i)\b(project|built|developed|repository|github)\b', text):
            structure_score += 4
            detected_sections += 1

        if detected_sections >= 4:
            strengths.append(f"Strong structural coverage with {detected_sections}/5 standard resume sections present.")

        # 2. Relevant Skills Depth (25 points max)
        skill_count = len(skills)
        if skill_count >= 15:
            skill_score = 25.0
            strengths.append(f"Broad technical skill repository detected ({skill_count} validated skills).")
        elif skill_count >= 10:
            skill_score = 21.0
            strengths.append(f"Solid skill variety with {skill_count} relevant technical skills.")
        elif skill_count >= 6:
            skill_score = 16.0
            improvements.append("Expand your skills section with relevant frameworks, testing tools, or cloud tech.")
        elif skill_count >= 3:
            skill_score = 11.0
            weaknesses.append("Limited technical keywords extracted from resume.")
            improvements.append("Explicitly list technical proficiencies such as languages, databases, and version control.")
        else:
            skill_score = 6.0
            weaknesses.append("Very few recognizable technical skills detected.")
            improvements.append("Add a structured Skills section divided by Programming, Frameworks, and Tools.")

        # 3. Projects & Practical Experience (25 points max)
        exp_score = 0.0
        exp_text = (sections.get('experience', '') + " " + sections.get('projects', '')).lower()
        if not exp_text.strip():
            exp_text = text.lower()

        action_verbs = [
            'engineered', 'developed', 'architected', 'implemented', 'designed', 'optimized',
            'created', 'deployed', 'built', 'integrated', 'spearheaded', 'managed', 'reduced', 'increased'
        ]
        found_verbs = [v for v in action_verbs if re.search(r'\b' + v + r'\b', exp_text)]
        
        if len(found_verbs) >= 5:
            exp_score += 15.0
            strengths.append(f"Dynamic action-oriented language utilized ({', '.join(found_verbs[:3])}...)")
        elif len(found_verbs) >= 2:
            exp_score += 10.0
            improvements.append("Begin project bullet points with strong active verbs like 'Architected', 'Deployed', or 'Optimized'.")
        else:
            exp_score += 5.0
            weaknesses.append("Few proactive technical action verbs identified in experiences.")
            improvements.append("Replace passive descriptions with impactful action verbs.")

        # Check for projects
        project_mentions = len(re.findall(r'(?i)\b(project|application|system|platform|website|tool|api)\b', exp_text))
        if project_mentions >= 4:
            exp_score += 10.0
        elif project_mentions >= 2:
            exp_score += 7.0
        else:
            exp_score += 4.0
            improvements.append("Feature 2-3 substantial personal or academic projects with GitHub links.")

        # 4. Clarity & Formatting (15 points max)
        clarity_score = 0.0
        if 250 <= word_count <= 850:
            clarity_score += 15.0
            strengths.append(f"Ideal document length ({word_count} words), standard for single-page modern resumes.")
        elif 150 <= word_count < 250:
            clarity_score += 9.0
            improvements.append("Resume appears a bit brief. Expand on technical project methodologies and tools used.")
        elif 850 < word_count <= 1400:
            clarity_score += 11.0
            improvements.append("Consider condensing resume content to improve visual hierarchy and scan speed.")
        else:
            clarity_score += 6.0
            weaknesses.append("Word count is outside standard optimal ranges.")

        # 5. Measurable Impact & Achievements (15 points max)
        impact_score = 0.0
        metrics_found = len(re.findall(r'(\d+%\s*|\$\d+|\b\d+\+?\s*(users|clients|ms|seconds|requests|stars|downloads|percent|reduction|increase|gain))', text, re.IGNORECASE))
        
        if metrics_found >= 4:
            impact_score = 15.0
            strengths.append("Exceptional quantifiable impact demonstrated with measurable data points.")
        elif metrics_found >= 2:
            impact_score = 11.0
            strengths.append("Good inclusion of quantifiable achievements.")
            improvements.append("Add 1 or 2 more metrics showing results (e.g. 'Improved query latency by 35%').")
        elif metrics_found == 1:
            impact_score = 7.0
            improvements.append("Quantify your project outcomes using percentages, user numbers, or performance gains.")
        else:
            impact_score = 4.0
            weaknesses.append("Lacks quantifiable outcomes and numerical metrics.")
            improvements.append("Quantify results: mention speedups, volume of data processed, test coverage, or users served.")

        total_score = round(structure_score + skill_score + exp_score + clarity_score + impact_score, 1)
        total_score = max(10.0, min(98.0, total_score))

        category_breakdown = {
            'structure': {
                'score': round(structure_score, 1),
                'max': 20,
                'percentage': round((structure_score / 20) * 100),
                'title': 'Structure & Completeness'
            },
            'skills': {
                'score': round(skill_score, 1),
                'max': 25,
                'percentage': round((skill_score / 25) * 100),
                'title': 'Relevant Skills Depth'
            },
            'experience': {
                'score': round(exp_score, 1),
                'max': 25,
                'percentage': round((exp_score / 25) * 100),
                'title': 'Projects & Experience'
            },
            'clarity': {
                'score': round(clarity_score, 1),
                'max': 15,
                'percentage': round((clarity_score / 15) * 100),
                'title': 'Clarity & Formatting'
            },
            'impact': {
                'score': round(impact_score, 1),
                'max': 15,
                'percentage': round((impact_score / 15) * 100),
                'title': 'Measurable Impact'
            }
        }

        return {
            'overall_score': total_score,
            'category_scores': category_breakdown,
            'strengths': strengths,
            'weaknesses': weaknesses,
            'improvements': improvements
        }
