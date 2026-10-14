import { Link as RouterLink } from 'react-router-dom';
import { cn } from '@/shared/utils';


export function Link({ href, target, replace, className, children, ref, ...rest }) {
  const isExternal =
    target === '_blank' ||
    /^(https?:|mailto:|tel:)/i.test(href ?? '') ||
    (href != null && !String(href).startsWith('/'));

  if (isExternal)
    return (
      <a
        ref={ref}
        href={href}
        target={target}
        rel="noopener noreferrer"
        className={cn(className)}
        {...rest}
      >
        {children}
      </a>
    );

  return (
    <RouterLink ref={ref} to={href} replace={replace} className={cn(className)} {...rest}>
      {children}
    </RouterLink>
  );
}