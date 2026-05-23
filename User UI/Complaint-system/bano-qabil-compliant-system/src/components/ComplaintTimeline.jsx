import { CheckCircle2, Clock } from 'lucide-react';
import { getTimelineSteps, formatDateTime } from '../lib/complaintUtils';

export default function ComplaintTimeline({ complaint }) {
  const steps = getTimelineSteps(complaint);

  return (
    <div>
      <div className="space-y-8">
        {steps.map((step, index) => (
          <div key={step.status} className="flex items-start gap-4">
            {/* Timeline dot and line */}
            <div className="flex flex-col items-center">
              <div
                className={`flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full border-4 ${
                  step.completed
                    ? 'border-green-300 bg-green-100'
                    : 'border-gray-300 bg-gray-100'
                }`}
              >
                {step.completed ? (
                  <CheckCircle2 size={28} className="text-green-600" />
                ) : (
                  <Clock size={24} className="text-gray-400" />
                )}
              </div>

              {/* Timeline line */}
              {index < steps.length - 1 && (
                <div
                  className={`my-3 h-16 w-1 ${
                    step.completed ? 'bg-green-300' : 'bg-gray-300'
                  }`}
                />
              )}
            </div>

            {/* Timeline content */}
            <div className="flex-1 pt-1">
              <p
                className={`text-lg font-semibold ${
                  step.completed ? 'text-green-700' : 'text-gray-600'
                }`}
              >
                {step.label}
              </p>
              {step.date && (
                <div className="mt-2 flex flex-col gap-1">
                  <p className="text-sm text-gray-600">
                    {formatDateTime(step.date)}
                  </p>
                  <div className={`inline-block rounded-full px-3 py-1 text-xs font-medium ${
                    step.completed
                      ? 'bg-green-100 text-green-700'
                      : 'bg-yellow-100 text-yellow-700'
                  }`}>
                    {step.completed ? 'Completed' : 'Current'}
                  </div>
                </div>
              )}
              {!step.date && !step.completed && (
                <p className="mt-2 text-sm text-gray-500">
                  ⏳ Awaiting this stage...
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
