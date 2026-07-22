import { useState } from 'react';
import { validateField, validateAll } from '../validation';

const YEARS = [2012, 2011, 2010, 2009, 2008, 2007];

const DEFAULTS = {
    _id: null,
    name: '',
    grapes: '',
    country: 'USA',
    region: 'California',
    year: '',
    description: '',
    picture: null
};

export default function WineForm({ wine, onSave, onDelete, statusMessage }) {
    const [form, setForm] = useState({ ...DEFAULTS, ...wine });
    const [errors, setErrors] = useState({});
    const [previewSrc, setPreviewSrc] = useState(null);

    const picture = previewSrc || (form.picture ? '/pics/' + form.picture : '/pics/generic.jpg');

    function handleChange(e) {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));

        const check = validateField(name, value);
        setErrors((prev) => {
            const next = { ...prev };
            if (check.isValid === false) {
                next[name] = check.message;
            } else {
                delete next[name];
            }
            return next;
        });
    }

    function handleDrop(e) {
        e.preventDefault();
        e.stopPropagation();
        const file = e.dataTransfer.files[0];
        if (!file) {
            return;
        }
        const reader = new FileReader();
        reader.onloadend = () => setPreviewSrc(reader.result);
        reader.readAsDataURL(file);
    }

    function handleDragOver(e) {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'copy';
    }

    function handleSubmit(e) {
        e.preventDefault();
        const check = validateAll(form);
        if (!check.isValid) {
            setErrors(check.messages);
            return;
        }
        onSave(form);
    }

    return (
        <div className="row-fluid">
            <form className="form-horizontal span12" onSubmit={handleSubmit}>
                <fieldset>
                    <legend>Wine Details</legend>

                    <div className="row">
                        <div className="span8">
                            <div className="control-group">
                                <label htmlFor="wineId" className="control-label">Id:</label>
                                <div className="controls">
                                    <input id="wineId" name="id" type="text" value={form._id || ''} disabled readOnly />
                                </div>
                            </div>

                            <div className={'control-group' + (errors.name ? ' error' : '')}>
                                <label htmlFor="name" className="control-label">Name:</label>
                                <div className="controls">
                                    <input type="text" id="name" name="name" value={form.name} onChange={handleChange} />
                                    <span className="help-inline">{errors.name}</span>
                                </div>
                            </div>

                            <div className={'control-group' + (errors.grapes ? ' error' : '')}>
                                <label htmlFor="grapes" className="control-label">Grapes:</label>
                                <div className="controls">
                                    <input type="text" id="grapes" name="grapes" value={form.grapes} onChange={handleChange} />
                                    <span className="help-inline">{errors.grapes}</span>
                                </div>
                            </div>

                            <div className={'control-group' + (errors.country ? ' error' : '')}>
                                <label htmlFor="country" className="control-label">Country:</label>
                                <div className="controls">
                                    <input type="text" id="country" name="country" value={form.country} onChange={handleChange} />
                                    <span className="help-inline">{errors.country}</span>
                                </div>
                            </div>

                            <div className="control-group">
                                <label htmlFor="region" className="control-label">Region:</label>
                                <div className="controls">
                                    <input type="text" id="region" name="region" value={form.region} onChange={handleChange} />
                                </div>
                            </div>

                            <div className="control-group">
                                <label htmlFor="year" className="control-label">Year:</label>
                                <div className="controls">
                                    <select id="year" name="year" value={form.year} onChange={handleChange}>
                                        <option value=""></option>
                                        {YEARS.map((y) => (
                                            <option key={y} value={y}>{y}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div className="control-group">
                                <label htmlFor="description" className="control-label">Notes:</label>
                                <div className="controls">
                                    <textarea id="description" name="description" style={{ width: '90%' }} rows="6" value={form.description} onChange={handleChange} />
                                </div>
                            </div>
                        </div>

                        <div className="span4">
                            <div className="well" style={{ width: 180, textAlign: 'center', margin: '0 auto' }}>
                                <p>
                                    <img
                                        id="picture"
                                        width="180"
                                        src={picture}
                                        alt="Wine"
                                        onDrop={handleDrop}
                                        onDragOver={handleDragOver}
                                    />
                                </p>
                                <p style={{ color: '#999' }}>To change the picture, drag a new picture from your file system onto the box above.</p>
                            </div>
                        </div>
                    </div>
                </fieldset>

                <div className="form-actions">
                    <button type="submit" className="btn btn-primary">Save</button>
                    {onDelete && (
                        <button type="button" className="btn delete" onClick={onDelete}>Delete</button>
                    )}
                </div>
            </form>

            {statusMessage && (
                <div className="row-fluid status-bar">
                    <div className={'alert ' + (statusMessage.type === 'error' ? 'alert-error' : 'alert-success')}>
                        <b>{statusMessage.type === 'error' ? 'Error!' : 'Success!'}</b> {statusMessage.text}
                    </div>
                </div>
            )}
        </div>
    );
}
