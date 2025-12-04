# Frontend Bundle Integration Guide

This guide explains how to integrate the workspace bundle API with your frontend application at `http://localhost:5173/provider/workspaces`.

## API Endpoint

**GET** `/api/workspaces/bundles/{credential_id}/`

- **Authentication**: Required (Job Provider only)
- **Parameters**: 
  - `credential_id`: ID of the cloud credential to fetch bundles for

## Sample API Response Structure

```json
{
  "success": true,
  "bundles": [
    {
      "bundle_id": "azure-standard-d2s-v3",
      "name": "Standard D2s v3",
      "description": "General purpose compute with 2 vCPUs and 8 GB RAM",
      "compute_type": "Standard_D2s_v3",
      "user_storage": 128,
      "root_storage": 30,
      "owner": "AZURE",
      "cloud_provider": "azure",
      "bundle_type": "Standard",
      "category": 2,
      "vcpus": 2,
      "memory_gb": 8,
      "display_name": "Standard D2s v3 (Standard_D2s_v3)",
      "suitable_for": "Business applications, productivity software"
    }
  ],
  "bundles_by_type": {
    "Basic": [...],
    "Standard": [...],
    "Performance": [...]
  },
  "type_summary": [
    {
      "type": "Basic",
      "count": 1,
      "bundles": [...]
    }
  ],
  "cloud_provider": "azure",
  "credential_name": "My Azure Credential",
  "region": "East US",
  "total_count": 3,
  "available_types": ["Basic", "Standard", "Performance"]
}
```

## Bundle Types

The API categorizes bundles into 4 main types:

1. **Basic** - Light office work, email, web browsing
2. **Standard** - Business applications, productivity software  
3. **Performance** - Development, data analysis, multitasking
4. **Graphics** - 3D modeling, video editing, CAD work

## Frontend Implementation Examples

### React/JavaScript Example

```javascript
// Fetch bundles for a specific credential
const fetchBundles = async (credentialId) => {
  try {
    const response = await fetch(`/api/workspaces/bundles/${credentialId}/`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch bundles');
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching bundles:', error);
    return { success: false, bundles: [] };
  }
};

// Create grouped dropdown options
const createDropdownOptions = (bundleData) => {
  if (!bundleData.success) return [];
  
  return bundleData.type_summary.map(typeGroup => ({
    label: `${typeGroup.type} (${typeGroup.count} options)`,
    options: typeGroup.bundles.map(bundle => ({
      value: bundle.bundle_id,
      label: bundle.display_name,
      description: bundle.suitable_for,
      specs: `${bundle.vcpus} vCPUs, ${bundle.memory_gb} GB RAM`,
      storage: `${bundle.user_storage} GB storage`
    }))
  }));
};

// Usage in component
const WorkspaceCreateForm = () => {
  const [bundles, setBundles] = useState([]);
  const [selectedBundle, setSelectedBundle] = useState('');
  
  useEffect(() => {
    if (credentialId) {
      fetchBundles(credentialId).then(data => {
        setBundles(createDropdownOptions(data));
      });
    }
  }, [credentialId]);
  
  return (
    <div>
      <label>Select Workspace Bundle:</label>
      <select 
        value={selectedBundle} 
        onChange={(e) => setSelectedBundle(e.target.value)}
      >
        <option value="">Choose a bundle...</option>
        {bundles.map(group => (
          <optgroup key={group.label} label={group.label}>
            {group.options.map(option => (
              <option key={option.value} value={option.value}>
                {option.label} - {option.specs}
              </option>
            ))}
          </optgroup>
        ))}
      </select>
    </div>
  );
};
```

### React with Custom Dropdown Component

```jsx
const BundleDropdown = ({ credentialId, onSelect, value }) => {
  const [bundles, setBundles] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!credentialId) return;
    
    setLoading(true);
    fetchBundles(credentialId)
      .then(data => {
        if (data.success) {
          setBundles(data);
          setError(null);
        } else {
          setError(data.error || 'Failed to load bundles');
        }
      })
      .finally(() => setLoading(false));
  }, [credentialId]);

  if (loading) return <div>Loading bundles...</div>;
  if (error) return <div className="error">Error: {error}</div>;
  if (!bundles) return <div>Select a credential first</div>;

  return (
    <div className="bundle-dropdown">
      <label>Choose Workspace Type:</label>
      
      {bundles.type_summary.map(typeGroup => (
        <div key={typeGroup.type} className="bundle-group">
          <h4>{typeGroup.type} ({typeGroup.count} options)</h4>
          <div className="bundle-options">
            {typeGroup.bundles.map(bundle => (
              <div 
                key={bundle.bundle_id}
                className={`bundle-option ${value === bundle.bundle_id ? 'selected' : ''}`}
                onClick={() => onSelect(bundle.bundle_id)}
              >
                <div className="bundle-name">{bundle.name}</div>
                <div className="bundle-specs">
                  {bundle.vcpus} vCPUs • {bundle.memory_gb} GB RAM • {bundle.user_storage} GB Storage
                </div>
                <div className="bundle-description">{bundle.suitable_for}</div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};
```

### CSS Styling Example

```css
.bundle-dropdown {
  margin: 1rem 0;
}

.bundle-group {
  margin-bottom: 1.5rem;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  padding: 1rem;
}

.bundle-group h4 {
  margin: 0 0 1rem 0;
  color: #333;
  font-size: 1.1rem;
}

.bundle-options {
  display: grid;
  gap: 0.5rem;
}

.bundle-option {
  padding: 1rem;
  border: 2px solid #f0f0f0;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.bundle-option:hover {
  border-color: #007bff;
  background-color: #f8f9fa;
}

.bundle-option.selected {
  border-color: #007bff;
  background-color: #e7f3ff;
}

.bundle-name {
  font-weight: 600;
  font-size: 1rem;
  margin-bottom: 0.25rem;
}

.bundle-specs {
  font-size: 0.9rem;
  color: #666;
  margin-bottom: 0.25rem;
}

.bundle-description {
  font-size: 0.8rem;
  color: #888;
  font-style: italic;
}

.error {
  color: #dc3545;
  background-color: #f8d7da;
  padding: 0.5rem;
  border-radius: 4px;
  border: 1px solid #f5c6cb;
}
```

## Error Handling

The API returns consistent error responses:

```json
{
  "success": false,
  "error": "Failed to retrieve bundles: No bundles found",
  "bundles": [],
  "bundles_by_type": {},
  "type_summary": []
}
```

Handle errors gracefully in your frontend:

```javascript
const handleBundleError = (error) => {
  console.error('Bundle fetch error:', error);
  
  // Show user-friendly message
  if (error.includes('credential')) {
    showError('Please check your cloud credentials');
  } else if (error.includes('permission')) {
    showError('You do not have permission to access bundles');
  } else {
    showError('Unable to load workspace options. Please try again.');
  }
};
```

## Integration Checklist

- [ ] Set up API endpoint calls with proper authentication
- [ ] Handle loading states while fetching bundles  
- [ ] Display bundles grouped by type for better UX
- [ ] Show bundle specifications (vCPUs, RAM, storage)
- [ ] Include tooltips or descriptions for each bundle type
- [ ] Handle error cases gracefully
- [ ] Validate bundle selection before form submission
- [ ] Cache bundle data to avoid repeated API calls

## Performance Tips

1. **Cache Results**: Cache bundle data per credential to avoid repeated API calls
2. **Lazy Loading**: Only fetch bundles when user selects a credential
3. **Debounce**: If filtering bundles, debounce the filter input
4. **Pagination**: For large bundle lists, consider client-side pagination
5. **Error Boundaries**: Wrap bundle components in error boundaries

## Testing

Test your integration with different scenarios:

1. Valid credentials with available bundles
2. Invalid or expired credentials
3. Network errors/timeouts
4. Empty bundle responses
5. Different bundle types (Basic, Standard, Performance, Graphics)
6. Different cloud providers (AWS vs Azure)

## Example API Calls

```bash
# Fetch bundles for credential ID 1
curl -H "Authorization: Bearer YOUR_TOKEN" \
     http://localhost:8000/api/workspaces/bundles/1/

# Expected response includes grouped bundles by type
```

This integration guide should help you create a smooth user experience for workspace bundle selection in your frontend application.
