import { cn } from '@/lib/utils';

interface FormIndicatorProps {
  form: string; // e.g., "WWDLW"
  className?: string;
}

export function FormIndicator({ form, className }: FormIndicatorProps) {
  const results = form.split('').slice(-5); // Last 5 results

  return (
    <div className={cn('flex items-center gap-1', className)}>
      {results.map((result, index) => (
        <div
          key={index}
          className={cn('form-indicator', {
            'form-win': result === 'W',
            'form-draw': result === 'D',
            'form-loss': result === 'L',
          })}
          title={result === 'W' ? '勝利' : result === 'D' ? '引分' : '敗北'}
        >
          {result}
        </div>
      ))}
    </div>
  );
}
