import os
import re
from typing import Dict, Any, List, Set
from pypdf import PdfReader
from docx import Document

SKILLS_TAXONOMY = {
    'Programming Languages': [
        'Python', 'JavaScript', 'TypeScript', 'Java', 'C++', 'C#', 'C', 'Go', 'Golang', 
        'Rust', 'Ruby', 'PHP', 'Swift', 'Kotlin', 'SQL', 'Bash', 'Shell', 'R', 'Dart', 'Scala'
    ],
    'Frontend Development': [
        'React', 'React.js', 'Next.js', 'Vue', 'Vue.js', 'Angular', 'Svelte', 'Tailwind CSS', 
        'Tailwind', 'Bootstrap', 'HTML', 'HTML5', 'CSS', 'CSS3', 'Redux', 'Zustand', 'Vite', 
        'Webpack', 'Responsive Design', 'Sass', 'SCSS'
    ],
    'Backend Development': [
        'Node.js', 'Express', 'Express.js', 'Flask', 'Django', 'FastAPI', 'Spring Boot', 
        'ASP.NET', 'REST APIs', 'RESTful API', 'GraphQL', 'Microservices', 'gRPC', 'Celery',
        'WebSockets'
    ],
    'Databases & Storage': [
        'PostgreSQL', 'Postgres', 'MySQL', 'SQLite', 'MongoDB', 'Redis', 'Cassandra', 
        'DynamoDB', 'Firebase', 'Supabase', 'Elasticsearch', 'Prisma', 'SQLAlchemy'
    ],
    'AI & Machine Learning': [
        'Machine Learning', 'Deep Learning', 'PyTorch', 'TensorFlow', 'Scikit-Learn', 
        'NLP', 'Natural Language Processing', 'Computer Vision', 'LLMs', 'Large Language Models',
        'LangChain', 'Hugging Face', 'OpenAI', 'Pandas', 'NumPy', 'Keras', 'Generative AI',
        'RAG', 'Vector Databases', 'Pinecone', 'ChromaDB'
    ],
    'Cloud & DevOps': [
        'AWS', 'Amazon Web Services', 'GCP', 'Google Cloud', 'Azure', 'Docker', 'Kubernetes', 
        'K8s', 'CI/CD', 'GitHub Actions', 'GitLab CI', 'Terraform', 'Linux', 'Nginx', 
        'Serverless', 'Cloudflare', 'Vercel', 'Prometheus', 'Grafana'
    ],
    'Software Tools & Testing': [
        'Git', 'GitHub', 'GitLab', 'Jira', 'Agile', 'Scrum', 'Unit Testing', 'PyTest', 
        'Jest', 'Cypress', 'Selenium', 'Postman', 'Docker Compose', 'Swagger', 'OpenAPI'
    ],
    'Soft Skills & Collaboration': [
        'Leadership', 'Communication', 'Problem Solving', 'Teamwork', 'Critical Thinking', 
        'Time Management', 'Mentorship', 'Agile Methodologies', 'Collaboration'
    ]
}

ROLE_SKILL_REQUIREMENTS = {
    'Software Developer': {
        'required': ['Python', 'JavaScript', 'Git', 'SQL', 'REST APIs', 'Data Structures', 'Algorithms'],
        'preferred': ['Docker', 'React', 'Node.js', 'Linux', 'CI/CD', 'Unit Testing']
    },
    'Frontend Developer': {
        'required': ['JavaScript', 'TypeScript', 'React', 'HTML5', 'CSS3', 'Tailwind CSS', 'Git'],
        'preferred': ['Next.js', 'Redux', 'Vite', 'Responsive Design', 'Unit Testing', 'GraphQL']
    },
    'Backend Developer': {
        'required': ['Python', 'Node.js', 'REST APIs', 'SQL', 'PostgreSQL', 'Git', 'Database Design'],
        'preferred': ['Docker', 'Redis', 'Microservices', 'FastAPI', 'Django', 'CI/CD', 'AWS']
    },
    'Python Developer': {
        'required': ['Python', 'Git', 'SQL', 'Flask', 'FastAPI', 'OOP', 'REST APIs'],
        'preferred': ['Django', 'Docker', 'PostgreSQL', 'Pandas', 'PyTest', 'Celery']
    },
    'AI/ML Engineer': {
        'required': ['Python', 'Machine Learning', 'Deep Learning', 'PyTorch', 'Scikit-Learn', 'Pandas', 'NumPy'],
        'preferred': ['TensorFlow', 'LLMs', 'Hugging Face', 'LangChain', 'Docker', 'NLP', 'Computer Vision']
    },
    'Data Analyst': {
        'required': ['SQL', 'Python', 'Pandas', 'Data Visualization', 'Excel', 'Problem Solving'],
        'preferred': ['Tableau', 'Power BI', 'NumPy', 'Statistics', 'R', 'PostgreSQL']
    },
    'Data Scientist': {
        'required': ['Python', 'Machine Learning', 'SQL', 'Statistics', 'Pandas', 'Scikit-Learn'],
        'preferred': ['Deep Learning', 'PyTorch', 'Data Visualization', 'NLP', 'Big Data', 'Docker']
    },
    'Web Developer': {
        'required': ['HTML5', 'CSS3', 'JavaScript', 'React', 'Node.js', 'Git', 'Responsive Design'],
        'preferred': ['TypeScript', 'Tailwind CSS', 'MongoDB', 'Express', 'REST APIs', 'Next.js']
    },
    'Cybersecurity Analyst': {
        'required': ['Network Security', 'Linux', 'Python', 'Vulnerability Assessment', 'Firewalls', 'SIEM'],
        'preferred': ['Ethical Hacking', 'Wireshark', 'Cryptography', 'Cloud Security', 'Bash']
    },
    'Cloud Engineer': {
        'required': ['AWS', 'GCP', 'Linux', 'Docker', 'Terraform', 'CI/CD', 'Networking'],
        'preferred': ['Kubernetes', 'Python', 'Bash', 'Azure', 'Monitoring', 'Serverless']
    },
    'UI/UX Designer': {
        'required': ['Figma', 'Wireframing', 'Prototyping', 'User Research', 'Design Systems', 'Usability Testing'],
        'preferred': ['HTML', 'CSS', 'Tailwind CSS', 'Adobe XD', 'Responsive Design', 'Motion Design']
    }
}

class ResumeParser:
    @staticmethod
    def extract_text_from_pdf(file_path: str) -> str:
        text_content = []
        try:
            reader = PdfReader(file_path)
            for page in reader.pages:
                extracted = page.extract_text()
                if extracted:
                    text_content.append(extracted)
            return "\n".join(text_content).strip()
        except Exception as e:
            raise ValueError(f"Failed to parse PDF: {str(e)}")

    @staticmethod
    def extract_text_from_docx(file_path: str) -> str:
        try:
            doc = Document(file_path)
            paragraphs = [p.text for p in doc.paragraphs if p.text.strip()]
            for table in doc.tables:
                for row in table.rows:
                    for cell in row.cells:
                        if cell.text.strip():
                            paragraphs.append(cell.text.strip())
            return "\n".join(paragraphs).strip()
        except Exception as e:
            raise ValueError(f"Failed to parse DOCX: {str(e)}")

    @staticmethod
    def extract_sections(text: str) -> Dict[str, str]:
        sections = {
            'summary': '',
            'experience': '',
            'projects': '',
            'education': '',
            'skills': '',
            'certifications': '',
            'achievements': ''
        }

        header_patterns = {
            'summary': r'(?:summary|profile|about\s+me|objective|professional\s+summary)',
            'experience': r'(?:work\s+experience|experience|employment\s+history|internships|professional\s+experience)',
            'projects': r'(?:projects|academic\s+projects|personal\s+projects|key\s+projects)',
            'education': r'(?:education|academic\s+background|qualifications)',
            'skills': r'(?:skills|technical\s+skills|core\s+competencies|technologies)',
            'certifications': r'(?:certifications|licenses|courses|certificates)',
            'achievements': r'(?:achievements|awards|honors|publications)'
        }

        combined_regex = r'(?im)^(?:[#\*\-\s]*)(?:' + '|'.join(f'(?P<{k}>{v})' for k, v in header_patterns.items()) + r')(?:[:\-\s]*)$'
        
        matches = list(re.finditer(combined_regex, text))
        
        if not matches:
            # Fallback: simple heuristic scanning
            sections['experience'] = text
            return sections

        for i, match in enumerate(matches):
            section_name = None
            for key in header_patterns.keys():
                if match.group(key):
                    section_name = key
                    break
            
            start_pos = match.end()
            end_pos = matches[i + 1].start() if (i + 1) < len(matches) else len(text)
            
            if section_name:
                sections[section_name] = text[start_pos:end_pos].strip()

        return sections

    @staticmethod
    def extract_skills(text: str) -> Dict[str, Any]:
        extracted_by_cat = {}
        all_skills = []
        
        text_lower = " " + re.sub(r'[^a-zA-Z0-9\+#\.]', ' ', text.lower()) + " "

        for category, skills in SKILLS_TAXONOMY.items():
            matched_in_cat = []
            for skill in skills:
                # Skill matching with word boundary protection
                clean_skill = skill.lower()
                # Handle special chars like C++, C#, .NET
                pattern = r'(?:\b|(?<=\s))' + re.escape(clean_skill) + r'(?:\b|(?=\s))'
                if re.search(pattern, text_lower):
                    matched_in_cat.append(skill)
                    if skill not in all_skills:
                        all_skills.append(skill)
            if matched_in_cat:
                extracted_by_cat[category] = matched_in_cat

        return {
            'skills_by_category': extracted_by_cat,
            'skills_list': all_skills,
            'total_skills_count': len(all_skills)
        }

    @classmethod
    def parse_file(cls, file_path: str) -> Dict[str, Any]:
        if not os.path.exists(file_path):
            raise FileNotFoundError(f"File not found: {file_path}")

        file_size = os.path.getsize(file_path)
        if file_size == 0:
            raise ValueError("Uploaded file is empty (0 bytes). Please upload a valid document.")

        ext = file_path.rsplit('.', 1)[-1].lower()
        if ext == 'pdf':
            text = cls.extract_text_from_pdf(file_path)
        elif ext in ['docx', 'doc']:
            text = cls.extract_text_from_docx(file_path)
        else:
            raise ValueError(f"Unsupported file format: .{ext}. Please upload a PDF or DOCX file.")

        if not text or len(text.strip()) < 50:
            raise ValueError("Could not extract legible text. The document may be scanned or empty.")

        sections = cls.extract_sections(text)
        skills_info = cls.extract_skills(text)

        words = text.split()
        word_count = len(words)

        return {
            'text': text,
            'word_count': word_count,
            'sections': sections,
            'skills': skills_info['skills_list'],
            'skills_by_category': skills_info['skills_by_category'],
            'total_skills_count': skills_info['total_skills_count']
        }
