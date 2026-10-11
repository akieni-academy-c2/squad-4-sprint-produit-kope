import { useRef, useState } from 'react';
import { Button } from './Button.jsx';
import { Input } from './Input.jsx';
import { Edit, Trash2 } from 'lucide-react';
import { cn } from '@/shared/utils';
import { ALLOWED_MIME, MAX_FILE_SIZE_BYTES } from '@/shared/lib/constants.js';

function formatSize(n) {
  if (n < 1024) return `${n} o`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(0)} Ko`;
  return `${(n / 1024 / 1024).toFixed(1)} Mo`;
}

export function FileUpload({
  label = 'Choisir une photo',
  hint = 'JPG ou PNG, 5 Mo maximum',
  accept = ALLOWED_MIME.join(','),
  capture,
  maxSize = MAX_FILE_SIZE_BYTES,
  value,
  onChange,
  caption = '',
  onCaptionChange,
  captionMax = 100,
  error,
  disabled,
  compact = false,
}) {
  const inputRef = useRef(null);
  const [dragOver, setDragOver] = useState(false);
  const [fileError, setFileError] = useState('');

  const pick = () => inputRef.current?.click();

  const applyFile = (file) => {
    setFileError('');
    if (!file) return;
    if (!ALLOWED_MIME.includes(file.type)) {
      setFileError('Format non autorisé (seulement JPG ou PNG)');
      return;
    }
    if (file.size > maxSize) {
      setFileError(`Fichier trop volumineux (max ${formatSize(maxSize)})`);
      return;
    }
    onChange?.(file);
  };

  return (
    <div className="space-y-2">
      <input
        ref={inputRef}
        type="file"
        hidden
        accept={accept}
        capture={capture}
        disabled={disabled}
        onChange={(e) => applyFile(e.target.files?.[0])}
      />
      {value ? (
        <div className="rounded-sm border border-gray-200 bg-white p-1 ">
          <div className="flex items-center gap-3 relative">
            <img
              src={typeof value === 'string' ? value : URL.createObjectURL(value)}
              alt=""
              className="h-20 w-20 shrink-0 rounded-sm object-cover ring-1 ring-gray-200"
            />
            <div className="min-w-0 flex-1 ">
              <p className="truncate text-sm font-medium text-gray-800">
                {value?.name || 'Aperçu'}
              </p>
              {value?.size != null && (
                <p className="text-xs text-gray-500">{formatSize(value.size)}</p>
              )}
              <div className="mt-1 flex flex-col items-center  w-fit absolute top-0 right-0">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={pick}
                  disabled={disabled}
                  aria-label="Changer le fichier"
                  title="Changer le fichier"
                >
                  <Edit size={16} aria-hidden className="inline" />
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => {
                    onChange?.(null);
                    setFileError('');
                  }}
                  disabled={disabled}
                  aria-label="Retirer le fichier"
                  title="Retirer le fichier"
                >
                  <Trash2 size={16} aria-hidden className="inline" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={pick}
          disabled={disabled}
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragOver(false);
            if (!disabled) applyFile(e.dataTransfer.files?.[0]);
          }}
          className={cn(
            'group flex w-full flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed bg-white px-4 py-6 text-center shadow-sm transition focus-ring',
            dragOver ? 'border-primary-500 bg-primary-50 shadow-md' : 'border-gray-300 hover:border-primary-400 hover:bg-gray-50 hover:shadow-sm',
            disabled && 'cursor-not-allowed opacity-60',
            compact && 'py-4',
          )}
        >
          <div
            aria-hidden
            className="flex size-12 items-center justify-center rounded-full bg-primary-50 text-primary-600 ring-1 ring-primary-100 transition group-hover:bg-primary-100"
          >
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="17 8 12 3 7 8" />
              <line x1="12" y1="3" x2="12" y2="15" />
            </svg>
          </div>
          <div className="max-w-[260px]">
            <p className="text-sm font-semibold text-gray-800">{label}</p>
            {hint && <p className="mt-1 text-xs text-gray-500">{hint}</p>}
          </div>
        </button>
      )}
      {onCaptionChange && value && (
        <Input
          placeholder="Légende (optionnelle, 100 caractères max)"
          value={caption ?? ''}
          onChange={(e) => onCaptionChange?.(e.target.value.slice(0, captionMax))}
          maxLength={captionMax}
          disabled={disabled}
        />
      )}
      {(fileError || error) && (
        <p role="alert" className="text-xs text-danger-500">
          {fileError || error}
        </p>
      )}
    </div>
  );
}
