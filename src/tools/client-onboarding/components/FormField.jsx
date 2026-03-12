export function FormField({ label, required, children, hint }) {
  return (
    <div className="space-y-1.5">
      <label className="block text-sm font-medium text-dark-text">
        {label}
        {required && <span className="text-danger ml-1">*</span>}
      </label>
      {children}
      {hint && <p className="text-xs text-dark-muted">{hint}</p>}
    </div>
  );
}

export function TextInput({ value, onChange, placeholder, type = 'text', required, disabled }) {
  return (
    <input
      type={type}
      value={value || ''}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      required={required}
      disabled={disabled}
      className="w-full px-4 py-2.5 bg-dark-bg border border-dark-border rounded-lg text-dark-text placeholder-dark-muted/50 focus:outline-none transition-colors text-sm disabled:opacity-50"
      style={{ '--tw-ring-color': 'var(--accent)' }}
    />
  );
}

export function TextArea({ value, onChange, placeholder, rows = 4, required }) {
  return (
    <textarea
      value={value || ''}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      rows={rows}
      required={required}
      className="w-full px-4 py-2.5 bg-dark-bg border border-dark-border rounded-lg text-dark-text placeholder-dark-muted/50 focus:outline-none transition-colors text-sm resize-vertical"
      style={{ '--tw-ring-color': 'var(--accent)' }}
    />
  );
}

export function Select({ value, onChange, options, placeholder, required }) {
  return (
    <select
      value={value || ''}
      onChange={(e) => onChange(e.target.value)}
      required={required}
      className="w-full px-4 py-2.5 bg-dark-bg border border-dark-border rounded-lg text-dark-text focus:outline-none transition-colors text-sm cursor-pointer"
      style={{ '--tw-ring-color': 'var(--accent)' }}
    >
      {placeholder && <option value="">{placeholder}</option>}
      {options.map((opt) => (
        <option key={typeof opt === 'string' ? opt : opt.value} value={typeof opt === 'string' ? opt : opt.value}>
          {typeof opt === 'string' ? opt : opt.label}
        </option>
      ))}
    </select>
  );
}

export function Checkbox({ checked, onChange, label, description }) {
  return (
    <label className="flex items-start gap-3 cursor-pointer group">
      <input
        type="checkbox"
        checked={checked || false}
        onChange={(e) => onChange(e.target.checked)}
        className="mt-0.5 w-5 h-5 rounded border-dark-border bg-dark-bg cursor-pointer"
        style={{ accentColor: 'var(--accent)' }}
      />
      <div>
        <span className="text-sm text-dark-text transition-colors">{label}</span>
        {description && <p className="text-xs text-dark-muted mt-0.5">{description}</p>}
      </div>
    </label>
  );
}

export function FileUpload({ onFileSelect, accept, label, multiple }) {
  const handleChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    files.forEach(file => {
      const reader = new FileReader();
      reader.onload = (ev) => {
        onFileSelect({
          name: file.name,
          type: file.type,
          size: file.size,
          data: ev.target.result,
        });
      };
      reader.readAsDataURL(file);
    });
  };

  return (
    <div className="border-2 border-dashed border-dark-border rounded-lg p-6 text-center transition-colors cursor-pointer relative">
      <input
        type="file"
        onChange={handleChange}
        accept={accept}
        multiple={multiple}
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
      />
      <svg className="w-8 h-8 mx-auto text-dark-muted mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
      </svg>
      <p className="text-sm text-dark-muted">{label || 'Click or drag files here'}</p>
      <p className="text-xs text-dark-muted/60 mt-1">Files are stored locally in your browser</p>
    </div>
  );
}
