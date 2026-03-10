import { FormField, TextInput, TextArea, FileUpload } from '../FormField';

export default function BrandAssetsSection({ data = {}, onChange }) {
  const update = (key, value) => {
    onChange({ ...data, [key]: value });
  };

  const addLogo = (file) => {
    const logos = [...(data.logos || []), file];
    update('logos', logos);
  };

  const removeLogo = (idx) => {
    const logos = (data.logos || []).filter((_, i) => i !== idx);
    update('logos', logos);
  };

  const addColor = () => {
    const colors = [...(data.colors || []), { hex: '#13b973', label: '' }];
    update('colors', colors);
  };

  const updateColor = (idx, key, value) => {
    const colors = [...(data.colors || [])];
    colors[idx] = { ...colors[idx], [key]: value };
    update('colors', colors);
  };

  const removeColor = (idx) => {
    const colors = (data.colors || []).filter((_, i) => i !== idx);
    update('colors', colors);
  };

  const addGuideline = (file) => {
    update('guidelines', file);
  };

  const addMaterial = (file) => {
    const materials = [...(data.materials || []), file];
    update('materials', materials);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
          <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
          </svg>
        </div>
        <div>
          <h3 className="text-lg font-bold text-dark-text">Brand Assets</h3>
          <p className="text-xs text-dark-muted">Logos, colors, fonts, and guidelines</p>
        </div>
      </div>

      {/* Logo Upload */}
      <div>
        <label className="block text-sm font-medium text-dark-text mb-3">Logo Files</label>
        <FileUpload onFileSelect={addLogo} accept="image/*" label="Upload logo files (PNG, SVG, JPG)" multiple />
        {data.logos?.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-3">
            {data.logos.map((logo, idx) => (
              <div key={idx} className="relative bg-dark-bg rounded-lg p-3 border border-dark-border group">
                <img src={logo.data} alt={logo.name} className="w-full h-20 object-contain" />
                <p className="text-xs text-dark-muted mt-2 truncate">{logo.name}</p>
                <button
                  type="button"
                  onClick={() => removeLogo(idx)}
                  className="absolute top-1 right-1 w-6 h-6 rounded-full bg-danger/80 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                >
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Brand Colors */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <label className="block text-sm font-medium text-dark-text">Brand Colors</label>
          <button
            type="button"
            onClick={addColor}
            className="text-xs px-3 py-1.5 bg-primary/20 text-primary rounded-md hover:bg-primary/30 transition-colors cursor-pointer"
          >
            + Add Color
          </button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          {(data.colors || []).map((color, idx) => (
            <div key={idx} className="flex items-center gap-3 bg-dark-bg rounded-lg p-3 border border-dark-border">
              <input
                type="color"
                value={color.hex}
                onChange={(e) => updateColor(idx, 'hex', e.target.value)}
              />
              <div className="flex-1 space-y-1">
                <TextInput
                  value={color.label}
                  onChange={(v) => updateColor(idx, 'label', v)}
                  placeholder="Color name"
                />
                <span className="text-xs text-dark-muted uppercase">{color.hex}</span>
              </div>
              <button
                type="button"
                onClick={() => removeColor(idx)}
                className="text-dark-muted hover:text-danger transition-colors cursor-pointer"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          ))}
        </div>
        {(!data.colors || data.colors.length === 0) && (
          <p className="text-sm text-dark-muted/50 text-center py-4">No brand colors added yet. Click "Add Color" to start.</p>
        )}
      </div>

      {/* Font Preferences */}
      <FormField label="Font Preferences">
        <TextArea
          value={data.fonts}
          onChange={(v) => update('fonts', v)}
          placeholder="e.g., Headings: Montserrat Bold, Body: Open Sans Regular, Accent: Playfair Display"
          rows={3}
        />
      </FormField>

      {/* Brand Guidelines */}
      <div>
        <label className="block text-sm font-medium text-dark-text mb-3">Brand Guidelines Document</label>
        <FileUpload onFileSelect={addGuideline} accept=".pdf,.doc,.docx,.txt" label="Upload brand guidelines (PDF, DOC)" />
        {data.guidelines && (
          <div className="mt-2 flex items-center gap-2 bg-dark-bg rounded-lg px-3 py-2">
            <svg className="w-4 h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <span className="text-sm text-dark-text">{data.guidelines.name}</span>
            <button
              type="button"
              onClick={() => update('guidelines', null)}
              className="ml-auto text-dark-muted hover:text-danger transition-colors cursor-pointer"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        )}
      </div>

      {/* Marketing Materials */}
      <div>
        <label className="block text-sm font-medium text-dark-text mb-3">Existing Marketing Materials</label>
        <FileUpload onFileSelect={addMaterial} accept="image/*,.pdf,.doc,.docx" label="Upload brochures, flyers, ads, etc." multiple />
        {data.materials?.length > 0 && (
          <div className="mt-2 space-y-2">
            {data.materials.map((mat, idx) => (
              <div key={idx} className="flex items-center gap-2 bg-dark-bg rounded-lg px-3 py-2">
                <svg className="w-4 h-4 text-primary shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <span className="text-sm text-dark-text flex-1 truncate">{mat.name}</span>
                <span className="text-xs text-dark-muted">{(mat.size / 1024).toFixed(1)} KB</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
