import { classNames } from '@/utils/classNames';

interface CardProps {
  variant?: 'default' | 'bordered' | 'elevated';
  className?: string;
  children: React.ReactNode;
}

export default function Card({
  variant = 'default',
  className = '',
  children,
}: CardProps) {
  const variants = {
    default: 'bg-white',
    bordered: 'bg-white border border-gray-200',
    elevated: 'bg-white shadow-lg',
  };

  return (
    <div
      className={classNames(
        'rounded-lg',
        variants[variant],
        className
      )}
    >
      {children}
    </div>
  );
}

interface CardHeaderProps {
  className?: string;
  children: React.ReactNode;
}

export function CardHeader({ className = '', children }: CardHeaderProps) {
  return (
    <div
      className={classNames(
        'px-6 py-4 border-b border-gray-200',
        className
      )}
    >
      {children}
    </div>
  );
}

interface CardBodyProps {
  className?: string;
  children: React.ReactNode;
}

export function CardBody({ className = '', children }: CardBodyProps) {
  return (
    <div
      className={classNames(
        'px-6 py-4',
        className
      )}
    >
      {children}
    </div>
  );
}

interface CardFooterProps {
  className?: string;
  children: React.ReactNode;
}

export function CardFooter({ className = '', children }: CardFooterProps) {
  return (
    <div
      className={classNames(
        'px-6 py-4 border-t border-gray-200',
        className
      )}
    >
      {children}
    </div>
  );
} 