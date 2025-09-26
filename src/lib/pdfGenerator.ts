import { ResumeData, JobAnalysisResponse, EnhancedJobAnalysisResponse } from './types';

export interface PDFGenerationRequest {
  resumeData: ResumeData;
  analysis?: JobAnalysisResponse;
  enhancedAnalysis?: EnhancedJobAnalysisResponse;
  isOptimized?: boolean;
}

export class PDFGenerator {
  static async generatePDF(request: PDFGenerationRequest): Promise<Blob> {
    const response = await fetch('/api/generate-pdf', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || 'Failed to generate PDF');
    }

    return response.blob();
  }

  static async downloadPDF(request: PDFGenerationRequest): Promise<void> {
    try {
      const blob = await this.generatePDF(request);

      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;

      // Generate filename
      const timestamp = new Date().toISOString().slice(0, 10);
      const name = request.resumeData.personalInfo.name.replace(/\s+/g, '_');
      const filename = request.isOptimized
        ? `${name}_Resume_AI_Optimized_${timestamp}.pdf`
        : `${name}_Resume_${timestamp}.pdf`;

      link.download = filename;

      // Trigger download
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // Cleanup
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('PDF download failed:', error);
      throw error;
    }
  }

  static handlePDFError(error: unknown): string {
    if (error instanceof Error) {
      if (error.message.includes('Too many')) {
        return 'Too many PDF generation requests. Please wait a moment and try again.';
      }
      if (error.message.includes('Failed to generate')) {
        return 'Failed to generate PDF. Please try again or check your resume data.';
      }
      return error.message;
    }
    return 'An unexpected error occurred while generating the PDF.';
  }
}

// Hook-like function for PDF generation state
export interface PDFGenerationState {
  isGenerating: boolean;
  error: string | null;
}

export function createPDFGenerationState(): {
  state: PDFGenerationState;
  setGenerating: () => void;
  setError: (error: unknown) => void;
  setSuccess: () => void;
} {
  const state: PDFGenerationState = {
    isGenerating: false,
    error: null,
  };

  return {
    state,
    setGenerating: () => {
      state.isGenerating = true;
      state.error = null;
    },
    setError: (error: unknown) => {
      state.isGenerating = false;
      state.error = PDFGenerator.handlePDFError(error);
    },
    setSuccess: () => {
      state.isGenerating = false;
      state.error = null;
    },
  };
}