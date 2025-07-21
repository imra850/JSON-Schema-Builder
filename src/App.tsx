import React, { useState } from 'react';

type FieldType = '' | 'String' | 'Number' | 'Nested' | 'Boolean' | 'Array' | 'Object' | 'Date' | 'Email' | 'URL' | 'Phone' | 'Enum' | 'Float';

interface Field {
  name: string;
  type: FieldType;
  children?: Field[]; // Only if type is 'Nested'
}

const defaultField = (): Field => ({
  name: '',
  type: '',
});

const JsonFieldEditor: React.FC = () => {
  const [fields, setFields] = useState<Field[]>([]);

  const updateField = (fieldList: Field[], index: number, key: keyof Field, value: any): Field[] => {
    const updatedFields = [...fieldList];
    const field = { ...updatedFields[index] };

    if (key === 'type') {
      field.type = value;
      if (value === 'Nested' ||value === 'Array') {
        field.children = field.children || [{ name: '', type: '' }];
      } else {
        delete field.children;
      }
    } else {
      (field as any)[key] = value;
    }

    updatedFields[index] = field;
    return updatedFields;
  };

  const handleUpdate = (path: number[], key: keyof Field, value: any) => {
    const deepUpdate = (list: Field[], depth = 0): Field[] => {
      const i = path[depth];
      if (depth === path.length - 1) {
        return updateField(list, i, key, value);
      } else {
        const updated = [...list];
        updated[i] = {
          ...updated[i],
          children: deepUpdate(updated[i].children || [], depth + 1),
        };
        return updated;
      }
    };
    setFields((prev) => deepUpdate(prev));
  };

  const handleAddField = (path: number[]) => {
    const deepAdd = (list: Field[], depth = 0): Field[] => {
      if (depth === path.length) return [...list, defaultField()];
      const i = path[depth];
      const updated = [...list];
      updated[i] = {
        ...updated[i],
        children: deepAdd(updated[i].children || [], depth + 1),
      };
      return updated;
    };
    setFields((prev) => deepAdd(prev));
  };

  const handleDeleteField = (path: number[]) => {
    const deepDelete = (list: Field[], depth = 0): Field[] => {
      const i = path[depth];
      if (depth === path.length - 1) {
        return list.filter((_, idx) => idx !== i);
      } else {
        const updated = [...list];
        updated[i] = {
          ...updated[i],
          children: deepDelete(updated[i].children || [], depth + 1),
        };
        return updated;
      }
    };
    setFields((prev) => deepDelete(prev));
  };

  const renderFields = (fieldList: Field[], path: number[] = []): React.ReactElement => (
    <ul style={{ listStyle: 'none', paddingLeft: '1rem' }}>
      {fieldList.map((field, index) => {
        const currentPath = [...path, index];
        return (
          <li key={currentPath.join('-')} style={{ marginBottom: '1rem' }}>
            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
              <input
                type="text"
                value={field.name}
                placeholder="Field Name"
                onChange={(e) => handleUpdate(currentPath, 'name', e.target.value)}
                style={{
                  flex: 1,
                  padding: '0.6rem 1rem',
                  border: '1px solid #ccc',
                  borderRadius: '6px',
                  fontSize: '1rem',
                  outline: 'none',
                  boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.1)',
                  transition: 'border-color 0.3s',
                }}
                onFocus={(e) => (e.currentTarget.style.borderColor = '#007bff')}
                onBlur={(e) => (e.currentTarget.style.borderColor = '#ccc')}
              />

              <select
                value={field.type}
                onChange={(e) => handleUpdate(currentPath, 'type', e.target.value)}
                style={{
                  flex: 1,
                  padding: '0.6rem 1rem',
                  border: '1px solid #ccc',
                  borderRadius: '6px',
                  fontSize: '1rem',
                  outline: 'none',
                  backgroundColor: '#fff',
                  cursor: 'pointer',
                  transition: 'border-color 0.3s',
                }}
                onFocus={(e) => (e.currentTarget.style.borderColor = '#007bff')}
                onBlur={(e) => (e.currentTarget.style.borderColor = '#ccc')}
              >
                <option value=" ">Select Type</option>
                <option value="String">String</option>
                <option value="Number">Number</option>
                <option value="Nested">Nested</option>
                <option value="Boolean">Boolean</option>
                <option value="Array">Array</option>
                <option value="Object">Object</option>
                <option value="Date">Date</option>
                <option value="Email">Email</option>
                <option value="URL">URL</option>
                <option value="Phone">Phone</option>
                <option value="Enum">Enum</option>
                <option value="Float">Float</option>
              </select>

              <button
                onClick={() => handleDeleteField(currentPath)}
                style={{
                  padding: '0.5rem 1rem',
                  backgroundColor: '#dc3545',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  transition: 'background-color 0.3s ease',
                }}
                onMouseOver={(e) => (e.currentTarget.style.backgroundColor = '#c82333')}
                onMouseOut={(e) => (e.currentTarget.style.backgroundColor = '#dc3545')}
              >
                🗑 Delete
              </button>
            </div>

            {(field.type === 'Nested'|| field.type==='Array') && (
              <div style={{ paddingLeft: '2rem', marginTop: '0.5rem' }}>
                {renderFields(field.children || [], currentPath)}
                <button
                  onClick={() => handleAddField(currentPath)}
                  style={{
                    marginTop: '0.5rem',
                    padding: '0.5rem 1rem',
                    backgroundColor: '#007bff',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    transition: 'background-color 0.3s ease',
                  }}
                  onMouseOver={(e) => (e.currentTarget.style.backgroundColor = '#0056b3')}
                  onMouseOut={(e) => (e.currentTarget.style.backgroundColor = '#007bff')}
                >
                  ➕ Add Nested Field
                </button>
              </div>
            )}
          </li>
        );
      })}
    </ul>
  );

  const generateJson = (fieldList: Field[]): any => {
    const obj: Record<string, any> = {};
    for (const field of fieldList) {
      const name = field.name || ''; // Keep blank field name as ""
      if (field.type === 'Array'){
          if (field.children && field.children.length > 0) {
          obj[name] = [generateJson(field.children)];
      }else{
        obj[name] = [];
      }
    }else if (field.type === 'Nested') {
      obj[name] = generateJson(field.children || []);
    } else
      if (field.type === 'String') obj[name] = 'String';
      else if (field.type === 'Number') obj[name] = 'Number';
      else if (field.type === 'Boolean') obj[name] = true;
      else if (field.type === 'Object') obj[name] = {};
      else if (field.type === 'Date') obj[name] = new Date().toISOString();
      else if (field.type === 'Email') obj[name] = '<email@example.com>';
      else if (field.type === 'URL') obj[name] = 'https://example.com';
      else if (field.type === 'Phone') obj[name] = '+1234567890';
      else if (field.type === 'Enum') obj[name] = ['Option1', 'Option2'];
      else if (field.type === 'Float') obj[name] = 0.0;
      // else if (field.type === 'Nested') obj[name] = generateJson(field.children || []);
      else obj[name] = '';
    }
    return obj;
  };

  return (
    <div style={{ display: 'flex', gap: '2rem', padding: '2rem', fontFamily: 'cursive', backgroundColor: '#f9f9f9', minHeight: '100vh' }}>
      <div style={{ flex: 1, backgroundColor: '#ffffff', padding: '2rem', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)' }}>
        <h2 style={{ marginBottom: '1rem', color: '#333' }}>🛠️ Field Builder</h2>
        {renderFields(fields)}
        <button
          onClick={() => handleAddField([])}
          style={{ marginTop: '1.5rem', padding: '0.6rem 1.2rem', backgroundColor: '#007bff', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '1rem', fontFamily: 'cursive', transition: 'background-color 0.3s ease' }}
        >
          + Add Field
        </button>
        <br />
        <button
          onClick={() => {
            const json = generateJson(fields);
            console.log('Submitted JSON:', json);
            const shouldDownload = window.confirm('Do you want to download this JSON?');
            if (shouldDownload) {
              const blob = new Blob([JSON.stringify(json, null, 2)], { type: 'application/json' });
              const url = URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = 'schema.json';
              a.click();
              URL.revokeObjectURL(url);
            }
          }}
          style={{ marginTop: '1rem', padding: '0.6rem 1.2rem', backgroundColor: '#28a745', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '1rem', fontFamily: 'cursive', transition: 'background-color 0.3s ease' }}
        >
          Submit JSON
        </button>
      </div>

      <div style={{ flex: 1, backgroundColor: '#ffffff', padding: '2rem', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)' }}>
        <h2 style={{ marginBottom: '1rem', color: '#333' }}>📄 Live JSON Preview</h2>
        <pre style={{ background: '#f0f0f0', padding: '1.2rem', borderRadius: '8px', fontSize: '0.95rem', color: '#333', overflowX: 'auto' }}>
          {JSON.stringify(generateJson(fields), null, 2)}
        </pre>
      </div>
    </div>
  );
};

export default JsonFieldEditor;
