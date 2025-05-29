import { cn } from '@/lib/utils';

interface CodeBlockProps extends React.HTMLAttributes<HTMLPreElement> {
  children?: React.ReactNode;
}

export function CodeBlock({ 
  className, 
  children, 
  ...props 
}: CodeBlockProps) {
  return (
    <div className="relative">
      <pre
        className={cn(
          'relative overflow-x-auto py-4',
          className
        )}
        {...props}
      >
        <code className="text-sm [&>span]:block [&>span]:whitespace-pre [&>span]:leading-relaxed">
          {children}
        </code>
      </pre>
    </div>
  );
}
