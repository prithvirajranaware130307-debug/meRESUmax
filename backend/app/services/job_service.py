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
    }
]

class JobService:
    @classmethod
    def is_adzuna_configured(cls) -> bool:
        return bool(Config.ADZUNA_APP_ID and Config.ADZUNA_APP_KEY and not Config.ADZUNA_APP_ID.startswith("replace_"))

    @classmethod
    def fetch_jobs(
        cls, 
        query: str = 'software engineer', 
        location: str = '', 
        page: int = 1,
        job_type: str = 'all'
    ) -> Dict[str, Any]:
        """
        Retrieves real job listings from Adzuna if credentials exist.
        Otherwise provides curated sample listings with unambiguous demo labels.
        """
        if cls.is_adzuna_configured():
            try:
                country = Config.ADZUNA_COUNTRY or 'in'
                url = f"https://api.adzuna.com/v1/api/jobs/{country}/search/{page}"
                params = {
                    'app_id': Config.ADZUNA_APP_ID,
                    'app_key': Config.ADZUNA_APP_KEY,
                    'what': query,
                    'where': location,
                    'results_per_page': 10,
                    'content-type': 'application/json'
                }
                response = requests.get(url, params=params, timeout=10)
                if response.status_code == 200:
                    data = response.json()
                    results = data.get('results', [])
                    normalized = []
                    for item in results:
                        salary_min = item.get('salary_min')
                        salary_max = item.get('salary_max')
                        company = item.get('company', {}).get('display_name', 'Tech Employer')
                        loc = item.get('location', {}).get('display_name', 'Various Locations')
                        
                        normalized.append({
                            'external_id': f"adzuna_{item.get('id')}",
                            'provider': 'adzuna',
                            'title': item.get('title', 'Software Role'),
                            'company': company,
                            'location': loc,
                            'description': item.get('description', ''),
                            'required_skills': cls._extract_skills_from_text(item.get('description', '')),
                            'salary_min': salary_min,
                            'salary_max': salary_max,
                            'salary_currency': 'INR' if country == 'in' else 'USD',
                            'job_type': 'Full-time',
                            'experience_level': 'Direct Hire',
                            'url': item.get('redirect_url', '#'),
                            'is_demo': False,
                            'posted_at': item.get('created', datetime.utcnow().isoformat())
                        })
                    
                    return {
                        'provider': 'adzuna',
                        'is_live': True,
                        'total': data.get('count', len(normalized)),
                        'page': page,
                        'jobs': normalized
                    }
                else:
                    logger.warning(f"Adzuna API returned {response.status_code}: {response.text}")
            except Exception as e:
                logger.error(f"Error querying Adzuna API: {e}")

        # Curated Sample Job Listings with Explicit Demo Labeling
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

        return {
            'provider': 'curated_demo',
            'is_live': False,
            'message': 'Displaying curated demo jobs. To connect live external jobs, configure ADZUNA_APP_ID and ADZUNA_APP_KEY in your environment.',
            'total': len(filtered),
            'page': page,
            'jobs': [j.copy() for j in filtered]
        }

    @staticmethod
    def _extract_skills_from_text(text: str) -> List[str]:
        from .parser import ResumeParser
        extracted = ResumeParser.extract_skills(text)
        return extracted.get('skills_list', [])[:6]
