import requests
import logging
from typing import Dict, Any, List
from datetime import datetime
from ..config import Config

logger = logging.getLogger(__name__)

CURATED_SAMPLE_JOBS = [
    {
        'external_id': 'demo_job_001',
        'provider': 'demo_curated',
        'title': 'Junior Software Engineer (Full Stack)',
        'company': 'AuraCloud Technologies',
        'location': 'Bangalore, India (Hybrid)',
        'description': 'Join our high-growth cloud infrastructure team building next-generation telemetry dashboards. Hands-on experience with Python, React, and REST APIs required.',
        'required_skills': ['Python', 'React', 'REST APIs', 'Git', 'SQL'],
        'salary_min': 700000,
        'salary_max': 1200000,
        'salary_currency': 'INR',
        'job_type': 'Full-time',
        'experience_level': 'Entry Level',
        'url': 'https://example.com/careers/auracloud/software-engineer',
        'is_demo': True,
        'posted_at': datetime.utcnow()
    },
    {
        'external_id': 'demo_job_002',
        'provider': 'demo_curated',
        'title': 'Frontend Developer (React / TypeScript)',
        'company': 'Verve Interactive Labs',
        'location': 'Remote',
        'description': 'Looking for an energetic frontend developer to build responsive, micro-animated user interfaces using React, TypeScript, and modern styling libraries.',
        'required_skills': ['React', 'TypeScript', 'Tailwind CSS', 'HTML5', 'CSS3', 'Git'],
        'salary_min': 650000,
        'salary_max': 1100000,
        'salary_currency': 'INR',
        'job_type': 'Full-time',
        'experience_level': 'Entry / Mid',
        'url': 'https://example.com/careers/vervelabs/frontend-dev',
        'is_demo': True,
        'posted_at': datetime.utcnow()
    },
    {
        'external_id': 'demo_job_003',
        'provider': 'demo_curated',
        'title': 'AI / ML Research Intern',
        'company': 'Cognitive Neural Systems',
        'location': 'Hyderabad, India (Hybrid)',
        'description': 'Work alongside senior scientists fine-tuning LLM pipelines, prompt engineering, evaluation metrics, and PyTorch deep learning models.',
        'required_skills': ['Python', 'Machine Learning', 'PyTorch', 'NLP', 'Pandas'],
        'salary_min': 35000,
        'salary_max': 60000,
        'salary_currency': 'INR/month',
        'job_type': 'Internship',
        'experience_level': 'Internship',
        'url': 'https://example.com/careers/cognitive/ml-intern',
        'is_demo': True,
        'posted_at': datetime.utcnow()
    },
    {
        'external_id': 'demo_job_004',
        'provider': 'demo_curated',
        'title': 'Backend Developer (Python / Flask / FastAPI)',
        'company': 'Zenith Fintech Solutions',
        'location': 'Mumbai, India',
        'description': 'Architect high-throughput transaction processing APIs with Python, PostgreSQL, and Redis caching. Strong focus on database normalization and security.',
        'required_skills': ['Python', 'Flask', 'PostgreSQL', 'Docker', 'Redis', 'REST APIs'],
        'salary_min': 800000,
        'salary_max': 1400000,
        'salary_currency': 'INR',
        'job_type': 'Full-time',
        'experience_level': 'Associate',
        'url': 'https://example.com/careers/zenith/backend-python',
        'is_demo': True,
        'posted_at': datetime.utcnow()
    },
    {
        'external_id': 'demo_job_005',
        'provider': 'demo_curated',
        'title': 'Junior Cloud & DevOps Associate',
        'company': 'StrataScale Systems',
        'location': 'Pune, India (Remote Available)',
        'description': 'Support CI/CD deployment pipelines, containerization using Docker, Linux server maintenance, and infrastructure provisioning on AWS / GCP.',
        'required_skills': ['Linux', 'Docker', 'AWS', 'Git', 'CI/CD', 'Bash'],
        'salary_min': 600000,
        'salary_max': 1000000,
        'salary_currency': 'INR',
        'job_type': 'Full-time',
        'experience_level': 'Entry Level',
        'url': 'https://example.com/careers/stratascale/cloud-devops',
        'is_demo': True,
        'posted_at': datetime.utcnow()
    },
    {
        'external_id': 'demo_job_006',
        'provider': 'demo_curated',
        'title': 'Data Analyst Associate',
        'company': 'OmniMetrics Global',
        'location': 'Gurugram, India',
        'description': 'Transform business data into actionable dashboard insights using SQL, Python (Pandas), and visualization suites. Help drive strategic decision-making.',
        'required_skills': ['SQL', 'Python', 'Pandas', 'Excel', 'Problem Solving'],
        'salary_min': 550000,
        'salary_max': 900000,
        'salary_currency': 'INR',
        'job_type': 'Full-time',
        'experience_level': 'Entry Level',
        'url': 'https://example.com/careers/omni/data-analyst',
        'is_demo': True,
        'posted_at': datetime.utcnow()
    },
    {
        'external_id': 'demo_job_007',
        'provider': 'demo_curated',
        'title': 'Cybersecurity Analyst',
        'company': 'SentinelShield Security',
        'location': 'Bangalore, India (Hybrid)',
        'description': 'Monitor enterprise infrastructure telemetry, conduct vulnerability assessments, evaluate threat vectors, and audit cloud security postures.',
        'required_skills': ['Network Security', 'Linux', 'Python', 'SIEM', 'Git'],
        'salary_min': 800000,
        'salary_max': 1400000,
        'salary_currency': 'INR',
        'job_type': 'Full-time',
        'experience_level': 'Associate',
        'url': 'https://example.com/careers/sentinel/cybersecurity-analyst',
        'is_demo': True,
        'posted_at': datetime.utcnow()
    },
    {
        'external_id': 'demo_job_008',
        'provider': 'demo_curated',
        'title': 'Data Scientist (Machine Learning)',
        'company': 'NeuroVector Intelligence',
        'location': 'Hyderabad, India (Remote Available)',
        'description': 'Build predictive machine learning pipelines, evaluate classification models, and deploy production inference microservices using Python and PyTorch.',
        'required_skills': ['Python', 'Machine Learning', 'Scikit-Learn', 'Pandas', 'SQL', 'PyTorch'],
        'salary_min': 900000,
        'salary_max': 1600000,
        'salary_currency': 'INR',
        'job_type': 'Full-time',
        'experience_level': 'Mid-Level',
        'url': 'https://example.com/careers/neurovector/data-scientist',
        'is_demo': True,
        'posted_at': datetime.utcnow()
    },
    {
        'external_id': 'demo_job_009',
        'provider': 'demo_curated',
        'title': 'UI/UX Product Designer',
        'company': 'Prism Experience Studio',
        'location': 'Remote',
        'description': 'Design modern user journeys, responsive wireframes, design systems, and high-fidelity interactive prototypes in Figma for web and mobile.',
        'required_skills': ['Figma', 'UI/UX Design', 'Wireframing', 'Prototyping', 'User Research'],
        'salary_min': 700000,
        'salary_max': 1200000,
        'salary_currency': 'INR',
        'job_type': 'Full-time',
        'experience_level': 'Associate',
        'url': 'https://example.com/careers/prism/uiux-designer',
        'is_demo': True,
        'posted_at': datetime.utcnow()
    },
    {
        'external_id': 'demo_job_010',
        'provider': 'demo_curated',
        'title': 'Python Backend Developer (FastAPI / Celery)',
        'company': 'NovaCore Systems',
        'location': 'Noida, India (Hybrid)',
        'description': 'Develop scalable event-driven backend services with Python, asynchronous job queues, PostgreSQL, and Redis caching.',
        'required_skills': ['Python', 'FastAPI', 'PostgreSQL', 'Docker', 'Redis', 'REST APIs'],
        'salary_min': 750000,
        'salary_max': 1300000,
        'salary_currency': 'INR',
        'job_type': 'Full-time',
        'experience_level': 'Entry / Mid',
        'url': 'https://example.com/careers/novacore/python-dev',
        'is_demo': True,
        'posted_at': datetime.utcnow()
    }
]

class JobService:
    @classmethod
    def is_jsearch_configured(cls) -> bool:
        return bool(Config.RAPIDAPI_KEY and not Config.RAPIDAPI_KEY.startswith("replace_"))

    @classmethod
    def fetch_jobs(
        cls, 
        query: str = 'software developer', 
        location: str = '', 
        page: int = 1,
        job_type: str = 'all'
    ) -> Dict[str, Any]:
        """
        Retrieves live job listings from JSearch Mega via RapidAPI if credentials exist.
        Otherwise falls back to curated demonstration listings with unambiguous states:
        - 'Live JSearch results'
        - 'Curated demo jobs — connect JSearch in Render for live listings'
        - 'Job service temporarily unavailable — showing curated demo jobs'
        """
        jsearch_available = cls.is_jsearch_configured()
        had_api_error = False

        if jsearch_available:
            try:
                host = Config.JSEARCH_API_HOST or 'jsearch-mega.p.rapidapi.com'
                url = f"https://{host}/search"
                
                # Build sensible query using role and location
                q_clean = (query or '').strip()
                loc_clean = (location or '').strip()

                if q_clean and loc_clean:
                    search_query = f"{q_clean} jobs in {loc_clean}"
                elif q_clean:
                    search_query = f"{q_clean} jobs in India" if " in " not in q_clean.lower() else q_clean
                elif loc_clean:
                    search_query = f"software developer jobs in {loc_clean}"
                else:
                    search_query = "software developer jobs in India"

                params: Dict[str, Any] = {
                    'query': search_query,
                    'page': str(page),
                    'num_pages': 1,
                }

                if job_type and job_type.lower() == 'full-time':
                    params['employment_types'] = 'FULLTIME'
                elif job_type and job_type.lower() == 'internship':
                    params['employment_types'] = 'INTERN'

                headers = {
                    'x-rapidapi-key': Config.RAPIDAPI_KEY,
                    'x-rapidapi-host': host
                }

                # Strict connect and read timeouts (5s connect, 8s read)
                response = requests.get(url, headers=headers, params=params, timeout=(5.0, 8.0))

                if response.status_code == 200:
                    data = response.json()
                    raw_items = data.get('data', []) if isinstance(data, dict) else []
                    
                    if raw_items:
                        normalized = []
                        for item in raw_items:
                            if not isinstance(item, dict):
                                continue

                            # Defensive extraction of fields
                            job_id = item.get('job_id') or str(hash(item.get('job_title', '') + item.get('employer_name', '')))
                            title = item.get('job_title') or 'Software Developer'
                            company = item.get('employer_name') or 'Tech Employer'

                            # Location resolution
                            loc_parts = [
                                item.get('job_city'),
                                item.get('job_state'),
                                item.get('job_country')
                            ]
                            formatted_loc = ', '.join([p for p in loc_parts if p])
                            if not formatted_loc:
                                formatted_loc = item.get('job_location') or ('Remote' if item.get('job_is_remote') else 'India')
                            elif item.get('job_is_remote'):
                                formatted_loc = f"{formatted_loc} (Remote Available)"

                            # Description & required skills
                            description = item.get('job_description') or ''
                            skills = item.get('job_required_skills')
                            if not skills or not isinstance(skills, list):
                                skills = cls._extract_skills_from_text(description)
                            else:
                                skills = [str(s) for s in skills[:6]]

                            # Salary fields
                            salary_min = item.get('job_min_salary')
                            salary_max = item.get('job_max_salary')
                            salary_curr = item.get('job_salary_currency') or 'INR'

                            # Normalize employment type
                            emp_type = item.get('job_employment_type') or 'Full-time'
                            if emp_type.upper() == 'FULLTIME':
                                emp_type = 'Full-time'
                            elif emp_type.upper() == 'INTERN':
                                emp_type = 'Internship'
                            elif emp_type.upper() == 'CONTRACTOR':
                                emp_type = 'Contract'

                            # Experience level
                            req_exp = item.get('job_required_experience') or {}
                            if isinstance(req_exp, dict) and req_exp.get('no_experience_required'):
                                exp_level = 'Entry Level'
                            else:
                                exp_level = 'Direct Hire'

                            # Trusted external URL
                            apply_url = item.get('job_apply_link') or item.get('job_google_link') or '#'

                            posted_at = item.get('job_posted_at_datetime_utc') or datetime.utcnow().isoformat()

                            normalized.append({
                                'external_id': f"jsearch_{job_id}",
                                'provider': 'jsearch',
                                'title': title,
                                'company': company,
                                'location': formatted_loc,
                                'description': description[:800],
                                'required_skills': skills,
                                'salary_min': float(salary_min) if salary_min is not None else None,
                                'salary_max': float(salary_max) if salary_max is not None else None,
                                'salary_currency': salary_curr,
                                'job_type': emp_type,
                                'experience_level': exp_level,
                                'url': apply_url,
                                'is_demo': False,
                                'posted_at': posted_at
                            })

                        if normalized:
                            return {
                                'provider': 'jsearch',
                                'is_live': True,
                                'message': 'Live JSearch results',
                                'total': len(normalized),
                                'page': page,
                                'jobs': normalized
                            }
                        else:
                            had_api_error = True
                    else:
                        had_api_error = True
                else:
                    logger.warning(f"JSearch API returned HTTP {response.status_code}")
                    had_api_error = True
            except Exception as e:
                logger.warning(f"Error querying JSearch API: {e}")
                had_api_error = True

        # Fallback to Curated Demonstration Job Listings
        filtered = list(CURATED_SAMPLE_JOBS)
        if query:
            q_lower = query.lower()
            filtered = [
                j for j in filtered 
                if q_lower in j['title'].lower() 
                or q_lower in j['description'].lower()
                or any(q_lower in s.lower() for s in j['required_skills'])
            ] or CURATED_SAMPLE_JOBS

        if location:
            l_lower = location.lower()
            filtered = [j for j in filtered if l_lower in j['location'].lower()] or filtered

        if job_type and job_type.lower() != 'all':
            filtered = [j for j in filtered if job_type.lower() in j['job_type'].lower()] or filtered

        # Accurate status message mapping
        if jsearch_available and had_api_error:
            fallback_message = 'Job service temporarily unavailable — showing curated demo jobs'
        else:
            fallback_message = 'Curated demo jobs — connect JSearch in Render for live listings'

        return {
            'provider': 'curated_demo',
            'is_live': False,
            'message': fallback_message,
            'total': len(filtered),
            'page': page,
            'jobs': [j.copy() for j in filtered]
        }

    @staticmethod
    def _extract_skills_from_text(text: str) -> List[str]:
        from .parser import ResumeParser
        extracted = ResumeParser.extract_skills(text)
        return extracted.get('skills_list', [])[:6]
