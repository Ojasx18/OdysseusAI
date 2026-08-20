import { useState, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, ArrowRight, Compass } from 'lucide-react';
import Button from '../common/Button';
import Card from '../common/Card';
import api from '../../services/api';

// Step components
import DestinationStep from './DestinationStep';
import DateStep from './DateStep';
import TravelerStep from './TravelerStep';
import BudgetStep from './BudgetStep';
import InterestStep from './InterestStep';
import PreferenceStep from './PreferenceStep';
import ReviewStep from './ReviewStep';

const steps = [
  { id: 'destination', fields: ['destination'] },
  { id: 'dates', fields: ['startDate', 'endDate'] },
  { id: 'travelers', fields: ['travelers'] },
  { id: 'budget', fields: ['budget', 'budgetTier'] },
  { id: 'interests', fields: ['interests'] },
  { id: 'preferences', fields: ['travelStyle', 'accommodation', 'foodPreferences', 'transportation'] },
  { id: 'review', fields: [] },
];

function TripPlannerForm() {
  const [currentStep, setCurrentStep] = useState(0);
  const [isGenerating, setIsGenerating] = useState(false);
  const [serverError, setServerError] = useState('');
  const isGeneratingRef = useRef(false);
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const {
    register,
    trigger,
    watch,
    setValue,
    getValues,
    formState: { errors },
  } = useForm({
    defaultValues: {
      destination: '',
      coordinates: null,
      startDate: '',
      endDate: '',
      travelers: 1,
      budgetTier: 'moderate',
      budget: 50000,
      currency: 'INR',
      interests: [],
      travelStyle: 'balanced',
      accommodation: 'Hotel',
      foodPreferences: 'local',
      transportation: 'Metro',
    },
  });

  const isLastStep = currentStep === steps.length - 1;

  const handleNext = async () => {
    // Validate current step fields before going next
    const fieldsToValidate = steps[currentStep].fields;
    const isStepValid = await trigger(fieldsToValidate);
    
    if (isStepValid) {
      setCurrentStep((prev) => prev + 1);
      setServerError('');
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
      setServerError('');
    }
  };

  // Explicit, click-only generation handler — never called from form submit
  const handleGenerateItinerary = async () => {
    // Guard: prevent duplicate requests
    if (isGeneratingRef.current) {
      console.warn('[ITINERARY GENERATION] Blocked duplicate request — generation already in progress.');
      return;
    }

    const requestId = Math.random().toString(36).substring(2, 10);
    const data = getValues();

    console.log('[ITINERARY GENERATION START]', {
      requestId,
      trigger: 'GENERATE_BUTTON_CLICK',
      destination: data.destination,
      timestamp: new Date().toISOString(),
    });

    isGeneratingRef.current = true;
    setIsGenerating(true);
    setServerError('');

    try {
      const payload = {
        destination: data.destination,
        coordinates: data.coordinates,
        startDate: new Date(data.startDate).toISOString(),
        endDate: new Date(data.endDate).toISOString(),
        travelers: Number(data.travelers),
        budget: Number(data.budget),
        currency: data.currency || 'INR',
        interests: data.interests,
        travelStyle: data.travelStyle,
        accommodation: data.accommodation,
        foodPreferences: [data.foodPreferences],
        transportation: data.transportation,
      };

      const res = await api.post('/ai/generate-itinerary', payload);
      const tripId = res.data.data.trip._id;

      console.log('[ITINERARY GENERATION SUCCESS]', {
        requestId,
        tripId,
        timestamp: new Date().toISOString(),
      });

      // Invalidate dashboard and lists to show new trip
      queryClient.invalidateQueries({ queryKey: ['trips'] });

      navigate(`/trips/${tripId}`);
    } catch (error) {
      console.error('[ITINERARY GENERATION FAILED]', {
        requestId,
        error: error.message,
        timestamp: new Date().toISOString(),
      });

      setServerError(
        error.response?.data?.message ||
        error.message ||
        'Failed to generate itinerary. Please try again.'
      );
    } finally {
      isGeneratingRef.current = false;
      setIsGenerating(false);
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return <DestinationStep register={register} errors={errors} setValue={setValue} watch={watch} />;
      case 1:
        return <DateStep register={register} errors={errors} watch={watch} />;
      case 2:
        return <TravelerStep setValue={setValue} watch={watch} register={register} errors={errors} />;
      case 3:
        return <BudgetStep setValue={setValue} watch={watch} register={register} errors={errors} />;
      case 4:
        return <InterestStep watch={watch} setValue={setValue} register={register} />;
      case 5:
        return <PreferenceStep register={register} errors={errors} />;
      case 6:
        return <ReviewStep watch={watch} />;
      default:
        return null;
    }
  };

  return (
    <Card
      gradient={true}
      style={{
        border: '1px solid var(--color-border)',
        boxShadow: '0 10px 30px rgba(15, 118, 110, 0.04)',
      }}
    >
      {/* Progress Bar */}
      <div style={{ width: '100%', height: '5px', backgroundColor: 'var(--color-surface-lighter)', borderRadius: '2px', marginBottom: '2.5rem', overflow: 'hidden' }}>
        <motion.div
          animate={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
          transition={{ duration: 0.3 }}
          style={{
            height: '100%',
            background: 'linear-gradient(90deg, var(--color-primary), var(--color-secondary))',
          }}
        />
      </div>

      {/* Server error */}
      {serverError && (
        <div style={{ color: 'var(--color-error)', backgroundColor: 'rgba(220,38,38,0.05)', border: '1px solid rgba(220,38,38,0.15)', padding: '0.75rem', borderRadius: '0.75rem', fontSize: '0.9rem', marginBottom: '1.5rem', textAlign: 'left' }}>
          {serverError}
        </div>
      )}

      {/* Steps Content — NO <form> wrapper on the Review step */}
      <div
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            e.preventDefault();
          }
        }}
      >
        <div style={{ minHeight: '260px' }}>{renderStep()}</div>

        {/* Action Buttons */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            borderTop: '1px solid var(--color-border)',
            paddingTop: '1.5rem',
            marginTop: '2.5rem',
            gap: '1rem',
          }}
        >
          <Button
            type="button"
            variant="ghost"
            onClick={handleBack}
            disabled={currentStep === 0 || isGenerating}
            icon={ArrowLeft}
          >
            Back
          </Button>

          {isLastStep ? (
            <Button
              type="button"
              variant="primary"
              onClick={handleGenerateItinerary}
              loading={isGenerating}
              disabled={isGenerating}
              icon={Compass}
            >
              {isGenerating ? 'Generating your itinerary...' : 'Generate AI Itinerary'}
            </Button>
          ) : (
            <Button
              type="button"
              variant="secondary"
              onClick={handleNext}
              icon={ArrowRight}
              iconPosition="right"
            >
              Next
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
}

export default TripPlannerForm;

