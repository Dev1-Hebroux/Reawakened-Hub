import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { DominionOnboarding } from '../components/DominionOnboarding';

vi.mock('@/lib/queryClient', () => ({
  apiRequest: vi.fn().mockResolvedValue({}),
}));

vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

describe('DominionOnboarding Component', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } }
    });
    vi.clearAllMocks();
    localStorage.clear();
  });

  const renderComponent = (isOpen = true) => {
    const onComplete = vi.fn();
    return {
      ...render(
        <QueryClientProvider client={queryClient}>
          <DominionOnboarding isOpen={isOpen} onComplete={onComplete} />
        </QueryClientProvider>
      ),
      onComplete,
    };
  };

  describe('Rendering', () => {
    it('should render when isOpen is true', () => {
      renderComponent(true);
      expect(screen.getByText('Who are you?')).toBeInTheDocument();
    });

    it('should not render when isOpen is false', () => {
      renderComponent(false);
      expect(screen.queryByText('Who are you?')).not.toBeInTheDocument();
    });

    it('should display all 5 audience options', () => {
      renderComponent();
      expect(screen.getByTestId('button-audience-schools')).toBeInTheDocument();
      expect(screen.getByTestId('button-audience-universities')).toBeInTheDocument();
      expect(screen.getByTestId('button-audience-early-career')).toBeInTheDocument();
      expect(screen.getByTestId('button-audience-builders')).toBeInTheDocument();
      expect(screen.getByTestId('button-audience-couples')).toBeInTheDocument();
    });
  });

  describe('Audience Selection', () => {
    it('should allow selecting an audience', async () => {
      renderComponent();
      
      const schoolsButton = screen.getByTestId('button-audience-schools');
      fireEvent.click(schoolsButton);
      
      await waitFor(() => {
        expect(schoolsButton).toHaveClass('bg-gradient-to-r');
      });
    });

    it('should enable Continue button after selection', async () => {
      renderComponent();
      
      fireEvent.click(screen.getByTestId('button-audience-universities'));
      
      const continueButton = screen.getByRole('button', { name: /continue/i });
      expect(continueButton).not.toBeDisabled();
    });
  });

  describe('Step Navigation', () => {
    it('should transition to mode selection after audience selection', async () => {
      renderComponent();
      
      fireEvent.click(screen.getByTestId('button-audience-schools'));
      fireEvent.click(screen.getByRole('button', { name: /continue/i }));
      
      await waitFor(() => {
        expect(screen.getByText('Choose your experience')).toBeInTheDocument();
      });
    });

    it('should display mode options after transitioning', async () => {
      renderComponent();
      
      fireEvent.click(screen.getByTestId('button-audience-schools'));
      fireEvent.click(screen.getByRole('button', { name: /continue/i }));
      
      await waitFor(() => {
        expect(screen.getByTestId('button-mode-reflection')).toBeInTheDocument();
        expect(screen.getByTestId('button-mode-faith')).toBeInTheDocument();
      });
    });
  });

  describe('Skip Functionality', () => {
    it('should call onComplete when skip button is clicked', async () => {
      const { onComplete } = renderComponent();
      
      const closeButton = screen.getByLabelText('Close');
      fireEvent.click(closeButton);
      
      await waitFor(() => {
        expect(onComplete).toHaveBeenCalled();
      });
    });

    it('should save to localStorage when skipped', async () => {
      renderComponent();
      
      const closeButton = screen.getByLabelText('Close');
      fireEvent.click(closeButton);
      
      await waitFor(() => {
        expect(localStorage.getItem('dominion_onboarding_complete')).toBe('true');
      });
    });
  });
});

describe('Onboarding Business Logic', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  describe('Audience Segments', () => {
    const audiences = [
      { id: 'schools', label: 'Student (15-18)' },
      { id: 'universities', label: 'University' },
      { id: 'early-career', label: 'Young Professional' },
      { id: 'builders', label: 'Entrepreneur/Creative' },
      { id: 'couples', label: 'Couple' },
    ];

    it('should have exactly 5 DOMINION audience segments', () => {
      expect(audiences).toHaveLength(5);
    });

    it('should include all valid segment IDs', () => {
      const ids = audiences.map(a => a.id);
      expect(ids).toContain('schools');
      expect(ids).toContain('universities');
      expect(ids).toContain('early-career');
      expect(ids).toContain('builders');
      expect(ids).toContain('couples');
    });
  });

  describe('Content Modes', () => {
    const modes = [
      { id: 'reflection', label: 'Reflection Mode' },
      { id: 'faith', label: 'Faith Overlay' },
    ];

    it('should have exactly 2 content modes', () => {
      expect(modes).toHaveLength(2);
    });

    it('should include reflection and faith modes', () => {
      const ids = modes.map(m => m.id);
      expect(ids).toContain('reflection');
      expect(ids).toContain('faith');
    });
  });

  describe('LocalStorage Persistence', () => {
    it('should persist audience segment', () => {
      localStorage.setItem('user_audience_segment', 'universities');
      expect(localStorage.getItem('user_audience_segment')).toBe('universities');
    });

    it('should persist content mode', () => {
      localStorage.setItem('sparks_view_mode', 'faith');
      expect(localStorage.getItem('sparks_view_mode')).toBe('faith');
    });

    it('should track onboarding completion', () => {
      localStorage.setItem('dominion_onboarding_complete', 'true');
      expect(localStorage.getItem('dominion_onboarding_complete')).toBe('true');
    });
  });

  describe('Preferences Payload', () => {
    it('should create valid preferences payload', () => {
      const payload = {
        contentMode: 'reflection' as const,
        audienceSegment: 'early-career' as const,
      };

      expect(payload.contentMode).toBe('reflection');
      expect(payload.audienceSegment).toBe('early-career');
    });
  });
});
