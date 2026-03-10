import { useState } from 'react';
import { FormField, TextInput, TextArea, FileUpload } from '../FormField';

export default function ContentMediaSection({ data = {}, onChange }) {
  const update = (key, value) => {
    onChange({ ...data, [key]: value });
  };

  const addTeamMember = () => {
    const members = [...(data.teamMembers || []), { name: '', role: '', photo: null }];
    update('teamMembers', members);
  };

  const updateTeamMember = (idx, key, value) => {
    const members = [...(data.teamMembers || [])];
    members[idx] = { ...members[idx], [key]: value };
    update('teamMembers', members);
  };

  const removeTeamMember = (idx) => {
    const members = (data.teamMembers || []).filter((_, i) => i !== idx);
    update('teamMembers', members);
  };

  const addTestimonial = () => {
    const testimonials = [...(data.testimonials || []), { text: '', author: '', role: '' }];
    update('testimonials', testimonials);
  };

  const updateTestimonial = (idx, key, value) => {
    const testimonials = [...(data.testimonials || [])];
    testimonials[idx] = { ...testimonials[idx], [key]: value };
    update('testimonials', testimonials);
  };

  const removeTestimonial = (idx) => {
    const testimonials = (data.testimonials || []).filter((_, i) => i !== idx);
    update('testimonials', testimonials);
  };

  const addMedia = (file) => {
    const media = [...(data.media || []), file];
    update('media', media);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
          <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </div>
        <div>
          <h3 className="text-lg font-bold text-dark-text">Content & Media</h3>
          <p className="text-xs text-dark-muted">Company information and media assets</p>
        </div>
      </div>

      <FormField label="Company Bio / About Text">
        <TextArea
          value={data.companyBio}
          onChange={(v) => update('companyBio', v)}
          placeholder="Write a brief description of your company, its history, mission, and values..."
          rows={5}
        />
      </FormField>

      <FormField label="Product / Service Descriptions">
        <TextArea
          value={data.productDescriptions}
          onChange={(v) => update('productDescriptions', v)}
          placeholder="Describe your main products or services..."
          rows={4}
        />
      </FormField>

      {/* Team Members */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <label className="block text-sm font-medium text-dark-text">Key Team Members</label>
          <button
            type="button"
            onClick={addTeamMember}
            className="text-xs px-3 py-1.5 bg-primary/20 text-primary rounded-md hover:bg-primary/30 transition-colors cursor-pointer"
          >
            + Add Member
          </button>
        </div>
        <div className="space-y-3">
          {(data.teamMembers || []).map((member, idx) => (
            <div key={idx} className="bg-dark-surface rounded-lg p-4 space-y-3 border border-dark-border">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <FormField label="Name">
                  <TextInput value={member.name} onChange={(v) => updateTeamMember(idx, 'name', v)} placeholder="Full name" />
                </FormField>
                <FormField label="Role / Title">
                  <TextInput value={member.role} onChange={(v) => updateTeamMember(idx, 'role', v)} placeholder="e.g., CEO, CTO" />
                </FormField>
              </div>
              <FileUpload
                onFileSelect={(f) => updateTeamMember(idx, 'photo', f)}
                accept="image/*"
                label="Upload headshot photo"
              />
              {member.photo && (
                <div className="flex items-center gap-2">
                  <img src={member.photo.data} alt={member.name} className="w-10 h-10 rounded-full object-cover" />
                  <span className="text-xs text-dark-muted">{member.photo.name}</span>
                </div>
              )}
              <button
                type="button"
                onClick={() => removeTeamMember(idx)}
                className="text-xs text-dark-muted hover:text-danger transition-colors cursor-pointer"
              >
                Remove member
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Testimonials */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <label className="block text-sm font-medium text-dark-text">Testimonials to Include</label>
          <button
            type="button"
            onClick={addTestimonial}
            className="text-xs px-3 py-1.5 bg-primary/20 text-primary rounded-md hover:bg-primary/30 transition-colors cursor-pointer"
          >
            + Add Testimonial
          </button>
        </div>
        <div className="space-y-3">
          {(data.testimonials || []).map((t, idx) => (
            <div key={idx} className="bg-dark-surface rounded-lg p-4 space-y-3 border border-dark-border">
              <TextArea value={t.text} onChange={(v) => updateTestimonial(idx, 'text', v)} placeholder="Testimonial text..." rows={3} />
              <div className="grid grid-cols-2 gap-3">
                <TextInput value={t.author} onChange={(v) => updateTestimonial(idx, 'author', v)} placeholder="Author name" />
                <TextInput value={t.role} onChange={(v) => updateTestimonial(idx, 'role', v)} placeholder="Author role/company" />
              </div>
              <button
                type="button"
                onClick={() => removeTestimonial(idx)}
                className="text-xs text-dark-muted hover:text-danger transition-colors cursor-pointer"
              >
                Remove testimonial
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Photos/Videos */}
      <div>
        <label className="block text-sm font-medium text-dark-text mb-3">Photos / Videos to Use</label>
        <FileUpload onFileSelect={addMedia} accept="image/*,video/*" label="Upload photos and videos" multiple />
        {data.media?.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-3">
            {data.media.map((file, idx) => (
              <div key={idx} className="bg-dark-bg rounded-lg p-2 border border-dark-border">
                {file.type?.startsWith('image/') ? (
                  <img src={file.data} alt={file.name} className="w-full h-20 object-cover rounded" />
                ) : (
                  <div className="w-full h-20 flex items-center justify-center bg-dark-surface rounded">
                    <svg className="w-8 h-8 text-dark-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                  </div>
                )}
                <p className="text-xs text-dark-muted mt-1 truncate">{file.name}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
