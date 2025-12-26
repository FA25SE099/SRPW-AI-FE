import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, AlertTriangle, CheckCircle, Info } from 'lucide-react';
import { YearSeasonAlert } from '../types';

type Props = {
  alerts: YearSeasonAlert[];
};

const getAlertIcon = (type: string) => {
  switch (type) {
    case 'Error':
      return <AlertCircle className="h-4 w-4" />;
    case 'Warning':
      return <AlertTriangle className="h-4 w-4" />;
    case 'Success':
      return <CheckCircle className="h-4 w-4" />;
    case 'Info':
      return <Info className="h-4 w-4" />;
    default:
      return <Info className="h-4 w-4" />;
  }
};

const getAlertVariant = (type: string): 'default' | 'destructive' => {
  return type === 'Error' ? 'destructive' : 'default';
};

const getAlertClassName = (type: string): string => {
  switch (type) {
    case 'Error':
      return 'border-red-200 bg-red-50 text-red-900';
    case 'Warning':
      return 'border-orange-200 bg-orange-50 text-orange-900';
    case 'Success':
      return 'border-green-200 bg-green-50 text-green-900';
    case 'Info':
      return 'border-blue-200 bg-blue-50 text-blue-900';
    default:
      return '';
  }
};

export const AlertBanner = ({ alerts }: Props) => {
  if (!alerts || alerts.length === 0) return null;

  return (
    <div className="space-y-2">
      {alerts.map((alert, idx) => (
        <Alert
          key={idx}
          variant={getAlertVariant(alert.type)}
          className={getAlertClassName(alert.type)}
        >
          {getAlertIcon(alert.type)}
          <AlertDescription>
            <strong>{alert.category}:</strong> {alert.message}
          </AlertDescription>
        </Alert>
      ))}
    </div>
  );
};

