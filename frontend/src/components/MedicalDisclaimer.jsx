import { ShieldCheck } from 'lucide-react';
import { cn } from '../utils/cn';

export default function MedicalDisclaimer({ className = '', children }) {
  return (
    <div
      className={cn(
        'flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3.5 dark:border-amber-800/50 dark:bg-amber-950/30',
        className
      )}
    >
      <ShieldCheck className="w-5 h-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
      <p className="text-[13px] leading-relaxed text-amber-800 dark:text-amber-300">
        {children ||
          'MediVerse AI provides AI-generated health information for educational purposes only and is not a substitute for professional medical advice, diagnosis, or treatment. Always consult a qualified healthcare provider.'}
      </p>
    </div>
  );
}