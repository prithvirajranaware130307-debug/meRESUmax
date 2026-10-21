import json
import logging
import re
from typing import Dict, Any, List
import requests
from ..config import Config

logger = logging.getLogger(__name__)

ROLE_QUESTION_BANKS = {
    'frontend': [
        {
            'id': 1,
            'question': 'How do you optimize rendering performance in a large-scale React/modern web application when handling real-time data streams?',
            'category': 'Technical Depth',
            'tips': 'Discuss memoization (useMemo/useCallback/React.memo), virtualization (react-window/virtualizer), throttling/debouncing, and minimizing layout thrashing.'
        },
        {
            'id': 2,
            'question': 'Explain the difference between Client-Side Rendering (CSR), Server-Side Rendering (SSR), and Static Site Generation (SSG). When would you choose each?',
            'category': 'Architecture',
            'tips': 'Compare initial Time to First Byte (TTFB), First Contentful Paint (FCP), SEO impact, hydration overhead, and server caching strategies.'
        },
        {
            'id': 3,
            'question': 'Tell me about a time you identified and resolved an elusive frontend bug or memory leak in production. What tools did you use?',
            'category': 'Behavioral (STAR)',
            'tips': 'Structure using STAR: Situation, Task, Action (Chrome DevTools Memory Profiler, event listeners cleanup), and Result (reduction in heap size/crashes).'
        },
        {
            'id': 4,
            'question': 'How do you ensure accessibility (a11y) and responsive cross-browser compatibility across varying screen densities and assistive devices?',
            'category': 'Domain Expertise',
            'tips': 'Mention semantic HTML, ARIA attributes, keyboard navigation traps, contrast ratios (WCAG 2.1 AA), and automated linting/axe-core testing.'
        },
        {
            'id': 5,
            'question': 'Walk me through how you architect global state management in an enterprise application. When is Context API sufficient vs Zustand or Redux Toolkit?',
            'category': 'Problem Solving',
            'tips': 'Address re-render cascades, separation of server state (React Query/TanStack) from UI state, predictability, and middleware debugging.'
        }
    ],
    'backend': [
        {
            'id': 1,
            'question': 'How do you design a database schema and indexing strategy to prevent full table scans on tables with tens of millions of records?',
            'category': 'Technical Depth',
            'tips': 'Cover B-tree index structures, composite indexes, query execution plans (EXPLAIN ANALYZE), cardinality, and partitioning.'
        },
        {
            'id': 2,
            'question': 'How do you handle distributed transactions or data consistency across microservices without introducing tight coupling?',
            'category': 'Architecture',
            'tips': 'Discuss the Saga pattern (orchestration vs choreography), two-phase commit drawbacks, idempotency keys, and eventual consistency.'
        },
        {
            'id': 3,
            'question': 'Describe a scenario where a critical API endpoint suffered from high latency or a sudden spike in traffic. How did you diagnose and mitigate it?',
            'category': 'Behavioral (STAR)',
            'tips': 'Explain using STAR: Bottleneck discovery (APM, database slow logs, connection pool saturation), caching (Redis), rate-limiting, and p99 latency reduction.'
        },
        {
            'id': 4,
            'question': 'What strategies do you employ for API authentication, rate limiting, and protecting against common vulnerabilities like SQL injection and SSRF?',
            'category': 'Domain Expertise',
            'tips': 'Touch on JWT vs session store, token refresh rotations, Redis token bucket rate limiting, ORM parameterized queries, and input validation.'
        },
        {
            'id': 5,
            'question': 'How would you architect an asynchronous background job processing system with retry mechanisms, dead-letter queues, and exactly-once semantics?',
            'category': 'Problem Solving',
            'tips': 'Explain message brokers (RabbitMQ/Kafka/Celery), idempotency keys, exponential backoff with jitter, and dead-letter queues.'
        }
    ],
    'ai': [
        {
            'id': 1,
            'question': 'How do you mitigate hallucination and latency when building Retrieval-Augmented Generation (RAG) pipelines with Large Language Models?',
            'category': 'Technical Depth',
            'tips': 'Cover chunking strategies, hybrid search (dense embeddings + BM25), re-ranking (cross-encoders), prompt grounding, and streaming tokens.'
        },
        {
            'id': 2,
            'question': 'What are the key trade-offs between fine-tuning a model (e.g. LoRA/QLoRA) vs prompt engineering with context injection?',
            'category': 'Architecture',
            'tips': 'Address compute costs, knowledge cutoffs, training data drift, deployment maintenance, and specialized tone/syntax alignment.'
        },
        {
            'id': 3,
            'question': 'Tell me about an ML or AI project where your model degraded or faced distribution shift in production. How did you catch and fix it?',
            'category': 'Behavioral (STAR)',
            'tips': 'Use STAR: Situation, Task, Action (monitoring feature drift, population stability index, automated retraining pipeline), and Result.'
        },
        {
            'id': 4,
            'question': 'How do you design an evaluation framework (evals) to measure LLM accuracy, safety, and guardrail compliance in production?',
            'category': 'Domain Expertise',
            'tips': 'Discuss golden benchmark datasets, LLM-as-a-judge, semantic similarity metrics, latency tracking, and deterministic regex guardrails.'
        },
        {
            'id': 5,
            'question': 'Walk me through how you optimize inference latency and memory footprint when deploying transformer models to production.',
            'category': 'Problem Solving',
            'tips': 'Mention quantization (INT8/INT4, AWQ), model pruning, KV-cache management, batching (vLLM/Triton), and GPU memory management.'
        }
    ],
    'general': [
        {
            'id': 1,
            'question': 'Walk me through your thought process when designing a modular, maintainable software architecture from ambiguous technical requirements.',
            'category': 'Architecture',
            'tips': 'Highlight requirements breakdown, identifying core entities, decoupling interfaces, choosing appropriate data stores, and defining SLOs.'
        },
        {
            'id': 2,
            'question': 'Tell me about a time you experienced a significant technical disagreement with a teammate or stakeholder. How did you resolve it?',
            'category': 'Behavioral (STAR)',
            'tips': 'Use STAR: Focus on active listening, framing discussions around objective data and benchmarks, finding common ground, and collective ownership.'
        },
        {
            'id': 3,
            'question': 'How do you approach writing clean, testable code, and what role do unit, integration, and end-to-end tests play in your daily workflow?',
            'category': 'Technical Depth',
            'tips': 'Discuss test pyramids, dependency injection/mocking, test flakiness prevention, CI pipeline integration, and automated code review.'
        },
        {
            'id': 4,
            'question': 'Describe a complex feature or optimization you championed that directly moved a business metric or saved engineering hours.',
            'category': 'Behavioral (STAR)',
            'tips': 'Highlight measurable impact: quantifiable percentages, cost savings, user retention improvement, or developer productivity gains.'
        },
        {
            'id': 5,
            'question': 'Walk me through how you keep your technical skills current with evolving frameworks, tools, and best engineering practices without succumbing to hype?',
            'category': 'Problem Solving',
            'tips': 'Discuss reading official documentation, building prototypes, evaluating practical business value, and continuous learning habits.'
        }
    ],
    'python': [
        {
            'id': 1,
            'question': 'Explain Python’s Global Interpreter Lock (GIL), its impact on multi-threaded CPU-bound tasks, and how Python 3.12+ (or multiprocessing/asyncio) addresses concurrency.',
            'category': 'Technical Depth',
            'tips': 'Discuss CPython GIL internals, CPU-bound vs I/O-bound workloads, multiprocessing vs threading, asyncio event loop, and PEP 684/703 subinterpreters.'
        },
        {
            'id': 2,
            'question': 'How does Python manage memory internally? Explain reference counting, cyclic garbage collection, and how you profile memory leaks in production.',
            'category': 'Architecture',
            'tips': 'Address PyObject reference counting, generational cyclic garbage collector (gc module), tracemalloc, objgraph, and memory profiling tools.'
        },
        {
            'id': 3,
            'question': 'Tell me about a time you optimized a slow Python backend pipeline or data processing job. What was the bottleneck and how did you profile it?',
            'category': 'Behavioral (STAR)',
            'tips': 'Use STAR: Mention cProfile, line_profiler, eliminating N+1 queries, vectorized operations (NumPy), generators for lazy evaluation, and the resulting speedup.'
        },
        {
            'id': 4,
            'question': 'What are Python generators and context managers, and how do they differ from standard collections and try/finally blocks in memory efficiency?',
            'category': 'Domain Expertise',
            'tips': 'Explain lazy evaluation with yield, the iterator protocol (__iter__, __next__), contextlib and __enter__/__exit__, and streaming large datasets.'
        },
        {
            'id': 5,
            'question': 'How do you design robust Python packages or web APIs? Discuss type annotations (mypy), dependency management (poetry/pip-tools), and automated testing.',
            'category': 'Problem Solving',
            'tips': 'Cover PEP 484 type hints, Pydantic data validation, pytest fixtures and parameterization, and CI/CD linting with ruff or flake8.'
        }
    ],
    'data_analyst': [
        {
            'id': 1,
            'question': 'Explain how you use advanced SQL window functions (ROW_NUMBER, RANK, DENSE_RANK, LAG/LEAD) and query partitioning to answer complex analytical business questions.',
            'category': 'Technical Depth',
            'tips': 'Contrast ranking nuances, running totals, cohort retention analysis, and explain how indexing and CTEs impact query performance.'
        },
        {
            'id': 2,
            'question': 'How do you structure data validation and anomaly detection pipelines when cleaning noisy, missing, or contradictory datasets in Pandas or SQL?',
            'category': 'Architecture',
            'tips': 'Address imputation techniques, outlier detection (IQR vs z-score), data drift, schema constraints, and building idempotent transformation steps.'
        },
        {
            'id': 3,
            'question': 'Describe a scenario where your analytical findings challenged a leadership assumption or changed a major product roadmap decision.',
            'category': 'Behavioral (STAR)',
            'tips': 'Use STAR: Describe the data source, statistical significance, how you visualized insights to bridge technical and business gaps, and the business impact.'
        },
        {
            'id': 4,
            'question': 'How do you design and interpret A/B tests? Explain sample sizing, statistical power, p-values, and avoiding false positives with multiple testing corrections.',
            'category': 'Domain Expertise',
            'tips': 'Discuss minimum detectable effect (MDE), alpha/beta errors, Bonferroni correction, and guardrail metrics to safeguard user experience.'
        },
        {
            'id': 5,
            'question': 'Walk me through how you design an executive KPI dashboard in Tableau, PowerBI, or Metabase that prevents dashboard bloat and drives decisive action.',
            'category': 'Problem Solving',
            'tips': 'Cover visual hierarchy, leading vs lagging indicators, user personas, drill-down granularity, and automated refresh scheduling.'
        }
    ]
}

class InterviewService:
    @classmethod
    def generate_questions(
        cls,
        target_role: str,
        skills: List[str] = None,
        resume_summary: str = '',
        difficulty: str = 'Mid-Level'
    ) -> List[Dict[str, Any]]:
        """Generates 5 tailored technical & behavioral interview questions using Gemini AI or structured fallback."""
        skills = skills or []
        role_lower = target_role.lower()

        if Config.GEMINI_API_KEY and Config.GEMINI_API_KEY.strip() and not Config.GEMINI_API_KEY.startswith("replace_"):
            try:
                model = Config.GEMINI_MODEL or "gemini-2.5-flash"
                url = f"https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent?key={Config.GEMINI_API_KEY}"
                headers = {"Content-Type": "application/json"}
                
                system_instruction = (
                    "You are a Principal Technical Interviewer and Engineering Manager at a top-tier tech company. "
                    "Generate 5 realistic, rigorous, and engaging interview questions tailored to the candidate's target role, "
                    "extracted skills, and experience level. Include a balanced mix: 2 Technical Depth questions, 1 Architecture/System Design question, "
                    "1 Behavioral STAR scenario question, and 1 Practical Problem-Solving/Debugging question. "
                    "Return ONLY valid JSON with a single top-level key 'questions' containing an array of 5 objects. "
                    "Each object must have keys: 'id' (int 1-5), 'question' (str), 'category' (str), 'tips' (str explaining what interviewers look for)."
                )
                
                user_content = (
                    f"Target Role: {target_role}\n"
                    f"Target Experience Level: {difficulty}\n"
                    f"Candidate Technical Skills: {', '.join(skills[:20]) if skills else 'General Software Engineering'}\n"
                    f"Candidate Background Context: {resume_summary[:600] if resume_summary else 'Passionate engineer building modern applications.'}\n"
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
                    if isinstance(parsed, dict) and 'questions' in parsed and len(parsed['questions']) >= 3:
                        return parsed['questions']
                    elif isinstance(parsed, list) and len(parsed) >= 3:
                        return parsed
            except Exception as e:
                logger.warning(f"Gemini interview question generation failed, falling back to curated bank: {e}")

        # Curated Fallback with dynamic skill injection
        if any(k in role_lower for k in ['front', 'react', 'ui', 'web', 'vue', 'angular']):
            bank = [dict(q) for q in ROLE_QUESTION_BANKS['frontend']]
        elif 'python' in role_lower:
            bank = [dict(q) for q in ROLE_QUESTION_BANKS['python']]
        elif any(k in role_lower for k in ['data analyst', 'business analyst', 'bi analyst', 'analytics', 'data analysis']):
            bank = [dict(q) for q in ROLE_QUESTION_BANKS['data_analyst']]
        elif any(k in role_lower for k in ['back', 'node', 'django', 'fastapi', 'java', 'golang', 'c#']):
            bank = [dict(q) for q in ROLE_QUESTION_BANKS['backend']]
        elif any(k in role_lower for k in ['ai', 'machine learning', 'ml', 'data science', 'llm', 'deep learning']):
            bank = [dict(q) for q in ROLE_QUESTION_BANKS['ai']]
        else:
            bank = [dict(q) for q in ROLE_QUESTION_BANKS['general']]

        # Personalize with detected skills if available
        if skills:
            primary_skill = skills[0]
            bank[0]['question'] = f"In your experience working with {primary_skill}, what are the most critical architectural decisions or performance pitfalls you have had to navigate?"
            if len(skills) > 1:
                secondary_skill = skills[1]
                bank[2]['question'] = f"Describe a real-world project where you combined {primary_skill} with {secondary_skill}. What was the biggest technical challenge and how did you overcome it?"

        return bank

    @classmethod
    def evaluate_answer(
        cls,
        question: str,
        category: str,
        candidate_answer: str,
        target_role: str,
        difficulty: str = 'Mid-Level'
    ) -> Dict[str, Any]:
        """Evaluates candidate interview response using Gemini AI or heuristic STAR analysis."""
        clean_answer = candidate_answer.strip()
        word_count = len(clean_answer.split())

        if word_count < 10:
            return {
                'overall_score': 30,
                'star_score': 20,
                'technical_depth': 25,
                'clarity_score': 45,
                'strengths': ['Attempted response'],
                'areas_for_improvement': [
                    'Response is too brief. Provide a structured answer with specific details and context.',
                    'Use the STAR method (Situation, Task, Action, Result) to illustrate your concrete experience.',
                    'Include technical metrics, tools, or architectural trade-offs to demonstrate competence.'
                ],
                'suggested_exemplar_answer': (
                    "In my previous role, our team faced a bottleneck where API latency spiked to 1.8 seconds (Situation). "
                    "My objective was to reduce p95 latency under 200ms while maintaining full data freshness (Task). "
                    "I implemented an asynchronous Redis cache layer, optimized indexing on relational foreign keys, "
                    "and refactored database queries using batch retrieval (Action). "
                    "As a result, p95 response times dropped by 84% to 160ms, reducing server infrastructure costs by 22% (Result)."
                ),
                'feedback_summary': 'Your answer was too short to properly evaluate. Elaborate using concrete examples and quantifiable outcomes.'
            }

        # Try Gemini AI evaluation
        if Config.GEMINI_API_KEY and Config.GEMINI_API_KEY.strip() and not Config.GEMINI_API_KEY.startswith("replace_"):
            try:
                model = Config.GEMINI_MODEL or "gemini-2.5-flash"
                url = f"https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent?key={Config.GEMINI_API_KEY}"
                headers = {"Content-Type": "application/json"}
                
                system_instruction = (
                    "You are a Lead Technical Recruiter and Hiring Committee Evaluator. "
                    "Evaluate the candidate's interview response objectively and constructively. "
                    "Assess whether they effectively structured their answer, communicated technical depth, and used the STAR methodology if appropriate. "
                    "Return ONLY valid JSON with keys: "
                    "'overall_score' (int 0-100), "
                    "'star_score' (int 0-100), "
                    "'technical_depth' (int 0-100), "
                    "'clarity_score' (int 0-100), "
                    "'strengths' (list of 2-3 specific positive aspects), "
                    "'areas_for_improvement' (list of 2-3 constructive actionable points), "
                    "'suggested_exemplar_answer' (an exemplary 3-4 sentence senior-level STAR response demonstrating ideal structure and impact), "
                    "'feedback_summary' (2 sentence executive assessment)."
                )
                
                user_content = (
                    f"Target Role: {target_role} ({difficulty})\n"
                    f"Question ({category}): {question}\n"
                    f"Candidate's Answer:\n{clean_answer}\n"
                )
                
                payload = {
                    "system_instruction": {"parts": [{"text": system_instruction}]},
                    "contents": [{"parts": [{"text": user_content}]}],
                    "generationConfig": {
                        "responseMimeType": "application/json",
                        "temperature": 0.3
                    }
                }
                
                resp = requests.post(url, headers=headers, json=payload, timeout=22.0)
                if resp.status_code == 200:
                    data = resp.json()
                    raw_text = data['candidates'][0]['content']['parts'][0]['text']
                    parsed = json.loads(raw_text)
                    if isinstance(parsed, dict) and 'overall_score' in parsed:
                        return parsed
            except Exception as e:
                logger.warning(f"Gemini answer evaluation failed, falling back to heuristic evaluation: {e}")

        # Heuristic Scorer Fallback
        lower = clean_answer.lower()
        has_metrics = bool(re.search(r'\d+%|\d+x|\d+\s*(ms|seconds|minutes|users|requests|percent)', lower))
        action_verbs = ['implemented', 'architected', 'optimized', 'reduced', 'designed', 'resolved', 'built', 'analyzed', 'led', 'deployed']
        verbs_found = [v for v in action_verbs if v in lower]
        star_markers = ['situation', 'task', 'action', 'result', 'when', 'because', 'impact', 'led to', 'improved', 'reduced']
        star_count = sum(1 for sm in star_markers if sm in lower)

        # Baseline score calculation
        tech_score = min(92, 45 + len(verbs_found) * 8 + (15 if has_metrics else 0))
        clarity_score = min(95, 50 + min(word_count // 3, 35))
        star_score = min(90, 40 + star_count * 7 + (15 if has_metrics else 0))
        overall_score = round((tech_score * 0.4) + (star_score * 0.35) + (clarity_score * 0.25))

        strengths = []
        if verbs_found:
            strengths.append(f"Strong action-oriented vocabulary demonstrated ({', '.join(verbs_found[:3])}).")
        if has_metrics:
            strengths.append("Included quantifiable outcomes and impact metrics.")
        else:
            strengths.append("Addressed the core intent of the question directly.")

        improvements = []
        if not has_metrics:
            improvements.append("Incorporate quantifiable metrics (e.g., % improvement, latency reduction, throughput, user volume).")
        if star_count < 2:
            improvements.append("Adopt a stricter STAR format (Situation, Task, Action, Result) to make your narrative memorable.")
        if word_count < 45:
            improvements.append("Expand on technical trade-offs, architecture choices, or alternative approaches you considered.")

        exemplar = (
            f"When tackling this for {target_role}, I first isolated the root requirements and potential scaling boundaries. "
            f"I architected a solution using decoupled services and resilient error-handling patterns, while establishing clear telemetry. "
            f"By testing edge conditions and automating verification, we reduced incident frequency by 40% and delivered the feature two weeks ahead of schedule."
        )

        return {
            'overall_score': overall_score,
            'star_score': star_score,
            'technical_depth': tech_score,
            'clarity_score': clarity_score,
            'strengths': strengths,
            'areas_for_improvement': improvements,
            'suggested_exemplar_answer': exemplar,
            'feedback_summary': f"Solid baseline response scoring {overall_score}/100. Adding deeper quantifiable metrics and STAR framing will make it competitive with top-tier candidates."
        }
