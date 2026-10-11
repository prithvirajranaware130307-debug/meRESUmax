import os
from reportlab.lib.pagesizes import letter, A4
from reportlab.lib import colors
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, HRFlowable
)
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
from ..config import Config

class ReportGenerator:
    @classmethod
    def generate_pdf_report(cls, analysis_data: dict, output_path: str):
        """
        Creates a clean, branded A4 executive PDF career assessment report.
        """
        os.makedirs(os.path.dirname(output_path), exist_ok=True)
        doc = SimpleDocTemplate(
            output_path,
            pagesize=A4,
            rightMargin=36,
            leftMargin=36,
            topMargin=36,
            bottomMargin=36
        )

        styles = getSampleStyleSheet()
        
        # Custom styles with Apple / Midnight blue aesthetic
        title_style = ParagraphStyle(
            'ReportTitle',
            parent=styles['Normal'],
            fontName='Helvetica-Bold',
            fontSize=22,
            leading=26,
            textColor=colors.HexColor('#0B1020')
        )

        subtitle_style = ParagraphStyle(
            'ReportSubtitle',
            parent=styles['Normal'],
            fontName='Helvetica',
            fontSize=11,
            leading=15,
            textColor=colors.HexColor('#4A5568')
        )

        h2_style = ParagraphStyle(
            'SectionH2',
            parent=styles['Normal'],
            fontName='Helvetica-Bold',
            fontSize=13,
            leading=17,
            textColor=colors.HexColor('#1E3A8A'),
            spaceBefore=10,
            spaceAfter=6
        )

        body_style = ParagraphStyle(
            'BodyTextCustom',
            parent=styles['Normal'],
            fontName='Helvetica',
            fontSize=9.5,
            leading=13.5,
            textColor=colors.HexColor('#2D3748')
        )

        bold_item = ParagraphStyle(
            'BoldItem',
            parent=styles['Normal'],
            fontName='Helvetica-Bold',
            fontSize=9.5,
            leading=13.5,
            textColor=colors.HexColor('#1A202C')
        )

        elements = []

        # 1. Header Banner
        elements.append(Paragraph("<b>meRESUmax</b> — Career Intelligence & Resume Audit", title_style))
        elements.append(Paragraph(
            f"Target Role: <b>{analysis_data.get('target_role', 'Software Developer')}</b> &nbsp;|&nbsp; "
            f"Analysis Date: {analysis_data.get('created_at', 'Recent')[:10]} &nbsp;|&nbsp; "
            f"Document: {analysis_data.get('resume_filename', 'Candidate Resume')}",
            subtitle_style
        ))
        elements.append(Spacer(1, 12))
        elements.append(HRFlowable(width="100%", thickness=1.5, color=colors.HexColor('#3B82F6'), spaceAfter=14))

        # 2. Executive Scores Table
        q_score = analysis_data.get('quality_score', 0)
        m_score = analysis_data.get('job_match_score', 0)

        score_table_data = [
            [
                Paragraph("<b>Resume Quality Score</b>", bold_item),
                Paragraph(f"<b><font size=16 color='#1D4ED8'>{q_score}/100</font></b>", bold_item),
                Paragraph("<b>Role Match Fit</b>", bold_item),
                Paragraph(f"<b><font size=16 color='#047857'>{m_score}%</font></b>", bold_item)
            ]
        ]
        score_table = Table(score_table_data, colWidths=[1.8 * inch, 1.3 * inch, 1.8 * inch, 1.3 * inch])
        score_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, -1), colors.HexColor('#F0F4F8')),
            ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
            ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 8),
            ('TOPPADDING', (0, 0), (-1, -1), 8),
            ('BOX', (0, 0), (-1, -1), 1, colors.HexColor('#CBD5E1')),
            ('INNERGRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#E2E8F0')),
        ]))
        elements.append(score_table)
        elements.append(Spacer(1, 14))

        # 3. Category Breakdown Table
        elements.append(Paragraph("Score Category Breakdown", h2_style))
        cat_scores = analysis_data.get('category_scores', {})
        cat_rows = [["Category", "Score Earned", "Max Points", "Evaluation"]]
        
        for k, v in cat_scores.items():
            if isinstance(v, dict):
                cat_rows.append([
                    v.get('title', k.capitalize()),
                    f"{v.get('score', 0)} pts",
                    f"{v.get('max', 0)} pts",
                    f"{v.get('percentage', 0)}%"
                ])

        if len(cat_rows) > 1:
            cat_table = Table(cat_rows, colWidths=[2.5 * inch, 1.4 * inch, 1.2 * inch, 1.1 * inch])
            cat_table.setStyle(TableStyle([
                ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#1E293B')),
                ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
                ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
                ('FONTSIZE', (0, 0), (-1, -1), 9),
                ('ALIGN', (1, 0), (-1, -1), 'CENTER'),
                ('BOTTOMPADDING', (0, 0), (-1, -1), 5),
                ('TOPPADDING', (0, 0), (-1, -1), 5),
                ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.HexColor('#FFFFFF'), colors.HexColor('#F8FAFC')]),
                ('BOX', (0, 0), (-1, -1), 0.5, colors.HexColor('#CBD5E1')),
                ('INNERGRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#E2E8F0')),
            ]))
            elements.append(cat_table)
            elements.append(Spacer(1, 14))

        # 4. Verified Skills & Skill Gaps
        matched = analysis_data.get('matched_skills', [])
        missing = analysis_data.get('missing_skills', [])
        
        skills_summary = [
            [
                Paragraph("<b>Verified Matching Skills</b>", bold_item),
                Paragraph(", ".join(matched[:15]) if matched else "Foundational engineering skills", body_style)
            ],
            [
                Paragraph("<b>Identified Skill Gaps</b>", bold_item),
                Paragraph(", ".join(missing[:10]) if missing else "None identified for this role archetype", body_style)
            ]
        ]
        sk_table = Table(skills_summary, colWidths=[2.0 * inch, 4.2 * inch])
        sk_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (0, -1), colors.HexColor('#F1F5F9')),
            ('VALIGN', (0, 0), (-1, -1), 'TOP'),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
            ('TOPPADDING', (0, 0), (-1, -1), 6),
            ('BOX', (0, 0), (-1, -1), 0.5, colors.HexColor('#CBD5E1')),
            ('INNERGRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#E2E8F0')),
        ]))
        elements.append(sk_table)
        elements.append(Spacer(1, 14))

        # 5. Key Strengths & Actionable Improvements
        elements.append(Paragraph("Key Strengths & Identified Growth Areas", h2_style))
        for s in analysis_data.get('strengths', [])[:3]:
            elements.append(Paragraph(f"• <b>Strength:</b> {s}", body_style))
        for imp in analysis_data.get('improvements', [])[:3]:
            elements.append(Paragraph(f"• <b>Action Item:</b> {imp}", body_style))

        elements.append(Spacer(1, 14))

        # 6. AI Summary Rewrite
        ai_feed = analysis_data.get('ai_feedback', {})
        if ai_feed and ai_feed.get('summary_rewrite'):
            elements.append(Paragraph("Recommended Professional Summary", h2_style))
            elements.append(Paragraph(f"<i>\"{ai_feed.get('summary_rewrite')}\"</i>", body_style))
            elements.append(Spacer(1, 14))

        # 7. Roadmap Milestones
        milestones = ai_feed.get('roadmap_milestones', [])
        if milestones:
            elements.append(Paragraph("Recommended Action Roadmap", h2_style))
            for m in milestones[:4]:
                elements.append(Paragraph(
                    f"<b>[{m.get('priority', 'Medium').upper()}] {m.get('title')}</b> — {m.get('description')}",
                    body_style
                ))

        elements.append(Spacer(1, 20))
        elements.append(Paragraph(
            "<font size=8 color='#94A3B8'>meRESUmax Platform &copy; 2026. This report is an AI and heuristic advisory assessment. "
            "Scores represent structured alignment heuristics and do not guarantee hiring outcomes.</font>",
            body_style
        ))

        doc.build(elements)
        return output_path
