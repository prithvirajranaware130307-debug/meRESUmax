import unittest
from unittest.mock import patch, MagicMock
from app.services.job_service import JobService, CURATED_SAMPLE_JOBS
from app.config import Config


class TestJobService(unittest.TestCase):

    def test_fallback_when_no_api_key(self):
        with patch.object(Config, 'RAPIDAPI_KEY', ''):
            result = JobService.fetch_jobs(query="Software Developer", location="Pune")
            self.assertFalse(result['is_live'])
            self.assertEqual(result['message'], 'Curated demo jobs — connect JSearch in Render for live listings')
            self.assertGreater(len(result['jobs']), 0)
            self.assertTrue(result['jobs'][0]['is_demo'])

    def test_successful_jsearch_live_api(self):
        mock_response = MagicMock()
        mock_response.status_code = 200
        mock_response.json.return_value = {
            "status": "OK",
            "data": [
                {
                    "job_id": "jsearch-test-1",
                    "job_title": "Full Stack Developer",
                    "employer_name": "RapidTech Solutions",
                    "job_city": "Pune",
                    "job_country": "IN",
                    "job_location": "Pune, India",
                    "job_is_remote": True,
                    "job_description": "We are seeking a Full Stack Developer skilled in React, Python, and SQL.",
                    "job_required_skills": ["Python", "React", "SQL"],
                    "job_min_salary": 900000,
                    "job_max_salary": 1400000,
                    "job_salary_currency": "INR",
                    "job_employment_type": "FULLTIME",
                    "job_apply_link": "https://example.com/apply/1",
                    "job_posted_at_datetime_utc": "2026-04-10T10:00:00.000Z"
                }
            ]
        }

        with patch.object(Config, 'RAPIDAPI_KEY', 'dummy_key'):
            with patch('requests.get', return_value=mock_response):
                result = JobService.fetch_jobs(query="Full Stack Developer", location="Pune")
                self.assertTrue(result['is_live'])
                self.assertEqual(result['message'], 'Live JSearch results')
                self.assertEqual(len(result['jobs']), 1)
                job = result['jobs'][0]
                self.assertEqual(job['title'], 'Full Stack Developer')
                self.assertEqual(job['company'], 'RapidTech Solutions')
                self.assertFalse(job['is_demo'])
                self.assertEqual(job['url'], 'https://example.com/apply/1')

    def test_fallback_on_api_error(self):
        with patch.object(Config, 'RAPIDAPI_KEY', 'dummy_key'):
            with patch('requests.get', side_effect=Exception("Connection timeout to RapidAPI")):
                result = JobService.fetch_jobs(query="Data Analyst", location="Mumbai")
                self.assertFalse(result['is_live'])
                self.assertEqual(result['message'], 'Job service temporarily unavailable — showing curated demo jobs')
                self.assertGreater(len(result['jobs']), 0)


if __name__ == '__main__':
    unittest.main()
