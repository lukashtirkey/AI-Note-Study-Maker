import { jsPDF } from 'jspdf';
import type { StudyDeck, StudyNote } from '../types';

export function exportNoteToPDF(note: StudyNote) {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  let y = 20;

  // Title
  doc.setFontSize(22);
  doc.setTextColor(79, 70, 229); // Indigo
  doc.text(note.title, 14, y);
  y += 10;

  // Metadata
  doc.setFontSize(10);
  doc.setTextColor(100, 116, 139);
  doc.text(`Subject: ${note.subject} | Created: ${note.createdAt} | StudyCraft AI`, 14, y);
  y += 12;

  // Horizontal line
  doc.setDrawColor(226, 232, 240);
  doc.line(14, y, pageWidth - 14, y);
  y += 10;

  // Executive Summary
  doc.setFontSize(14);
  doc.setTextColor(15, 23, 42);
  doc.text('Executive Summary', 14, y);
  y += 8;

  doc.setFontSize(10);
  doc.setTextColor(51, 65, 85);
  const summaryLines = doc.splitTextToSize(note.summary, pageWidth - 28);
  doc.text(summaryLines, 14, y);
  y += (summaryLines.length * 6) + 8;

  // Key Takeaways / Bullet Points
  if (note.bulletPoints && note.bulletPoints.length > 0) {
    doc.setFontSize(14);
    doc.setTextColor(15, 23, 42);
    doc.text('Key Concepts & Takeaways', 14, y);
    y += 8;

    doc.setFontSize(10);
    doc.setTextColor(51, 65, 85);
    note.bulletPoints.forEach((point) => {
      if (y > 270) {
        doc.addPage();
        y = 20;
      }
      const lines = doc.splitTextToSize(`•  ${point}`, pageWidth - 28);
      doc.text(lines, 14, y);
      y += (lines.length * 6) + 2;
    });
    y += 6;
  }

  // Key Terms & Definitions
  if (note.keyTerms && note.keyTerms.length > 0) {
    if (y > 240) {
      doc.addPage();
      y = 20;
    }

    doc.setFontSize(14);
    doc.setTextColor(15, 23, 42);
    doc.text('Glossary & Key Definitions', 14, y);
    y += 8;

    note.keyTerms.forEach((kt) => {
      if (y > 270) {
        doc.addPage();
        y = 20;
      }
      doc.setFont('helvetica', 'bold');
      doc.text(`${kt.term}: `, 14, y);
      const termWidth = doc.getTextWidth(`${kt.term}: `);
      doc.setFont('helvetica', 'normal');
      
      const defLines = doc.splitTextToSize(kt.definition, pageWidth - 28 - termWidth);
      doc.text(defLines, 14 + termWidth, y);
      y += (defLines.length * 6) + 4;
    });
  }

  // Save PDF
  const filename = `${note.title.toLowerCase().replace(/[^a-z0-9]+/g, '_')}_study_guide.pdf`;
  doc.save(filename);
}

export function exportDeckToPDF(deck: StudyDeck) {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  let y = 20;

  // Title
  doc.setFontSize(22);
  doc.setTextColor(79, 70, 229);
  doc.text(deck.title, 14, y);
  y += 10;

  doc.setFontSize(11);
  doc.setTextColor(100, 116, 139);
  doc.text(`Subject: ${deck.subject} | Complete Study Deck & Quiz Sheet`, 14, y);
  y += 12;

  doc.setDrawColor(226, 232, 240);
  doc.line(14, y, pageWidth - 14, y);
  y += 10;

  // Description
  doc.setFontSize(12);
  doc.setTextColor(15, 23, 42);
  doc.text('Overview:', 14, y);
  y += 6;

  doc.setFontSize(10);
  doc.setTextColor(51, 65, 85);
  const descLines = doc.splitTextToSize(deck.description, pageWidth - 28);
  doc.text(descLines, 14, y);
  y += (descLines.length * 6) + 10;

  // Flashcards Section
  if (deck.flashcards && deck.flashcards.length > 0) {
    doc.setFontSize(14);
    doc.setTextColor(79, 70, 229);
    doc.text('Flashcards Sheet', 14, y);
    y += 8;

    deck.flashcards.forEach((fc, idx) => {
      if (y > 260) {
        doc.addPage();
        y = 20;
      }
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(15, 23, 42);
      doc.text(`Q${idx + 1}: ${fc.front}`, 14, y);
      y += 6;

      doc.setFont('helvetica', 'normal');
      doc.setTextColor(71, 85, 105);
      const ansLines = doc.splitTextToSize(`Ans: ${fc.back}`, pageWidth - 28);
      doc.text(ansLines, 18, y);
      y += (ansLines.length * 6) + 6;
    });
  }

  // Quiz Section
  if (deck.quiz && deck.quiz.length > 0) {
    if (y > 220) {
      doc.addPage();
      y = 20;
    } else {
      y += 6;
    }

    doc.setFontSize(14);
    doc.setTextColor(79, 70, 229);
    doc.text('Practice Quiz Sheet', 14, y);
    y += 8;

    deck.quiz.forEach((q, idx) => {
      if (y > 250) {
        doc.addPage();
        y = 20;
      }
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(15, 23, 42);
      const qLines = doc.splitTextToSize(`${idx + 1}. ${q.question}`, pageWidth - 28);
      doc.text(qLines, 14, y);
      y += (qLines.length * 6) + 4;

      doc.setFont('helvetica', 'normal');
      doc.setTextColor(51, 65, 85);
      q.options.forEach((opt, optIdx) => {
        const isCorrectStr = optIdx === q.correctAnswer ? ' [CORRECT]' : '';
        doc.text(`   ${String.fromCharCode(65 + optIdx)}) ${opt}${isCorrectStr}`, 14, y);
        y += 6;
      });

      doc.setTextColor(100, 116, 139);
      const expLines = doc.splitTextToSize(`Explanation: ${q.explanation}`, pageWidth - 28);
      doc.text(expLines, 18, y);
      y += (expLines.length * 6) + 6;
    });
  }

  const filename = `${deck.title.toLowerCase().replace(/[^a-z0-9]+/g, '_')}_study_deck.pdf`;
  doc.save(filename);
}
