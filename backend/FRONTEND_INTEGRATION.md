# Frontend Integration Guide - Document Versioning

## Quick Reference

### 1. Update Document with Change Tracking

**Endpoint:** `PATCH /documents/:documentId`

```typescript
// Frontend code example
async function saveDocument(documentId: string, title: string, content: string, changeDescription: string) {
  try {
    const response = await fetch(`/api/documents/${documentId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        title,
        content,
        changelog: changeDescription  // NEW: User-provided change description
      })
    });
    return await response.json();
  } catch (error) {
    console.error('Failed to save document:', error);
  }
}
```

**Request Body:**
```json
{
  "title": "Document Title",
  "content": "# Markdown content here",
  "changelog": "Fixed typos in section 1"
}
```

### 2. Fetch Version History

**Endpoint:** `GET /documents/:documentId/versions?skip=0&take=20`

```typescript
async function fetchVersionHistory(documentId: string, page = 0) {
  try {
    const response = await fetch(
      `/api/documents/${documentId}/versions?skip=${page * 20}&take=20`,
      {
        headers: { 'Authorization': `Bearer ${token}` }
      }
    );
    return await response.json();
  } catch (error) {
    console.error('Failed to fetch versions:', error);
  }
}

// Response structure
{
  "versions": [
    {
      "id": "v2-id",
      "documentId": "doc-id",
      "versionNumber": 2,
      "changelog": "Fixed typos in section 1",
      "content": "# Full markdown content...",
      "createdAt": "2024-01-15T10:30:00Z",
      "createdBy": "user-id",
      "creator": { "id": "user-id", "email": "user@example.com" }
    },
    {
      "id": "v1-id",
      "documentId": "doc-id",
      "versionNumber": 1,
      "changelog": null,
      "content": "# Original content...",
      "createdAt": "2024-01-15T10:00:00Z",
      "createdBy": "user-id",
      "creator": { "id": "user-id", "email": "user@example.com" }
    }
  ],
  "total": 2,
  "skip": 0,
  "take": 20
}
```

### 3. View Specific Version

**Endpoint:** `GET /documents/:documentId/versions/:versionNumber`

```typescript
async function getVersion(documentId: string, versionNumber: number) {
  try {
    const response = await fetch(
      `/api/documents/${documentId}/versions/${versionNumber}`,
      {
        headers: { 'Authorization': `Bearer ${token}` }
      }
    );
    return await response.json();
  } catch (error) {
    console.error('Failed to fetch version:', error);
  }
}
```

### 4. Compare Two Versions

**Endpoint:** `GET /documents/:documentId/versions/compare?version1=1&version2=2`

```typescript
async function compareVersions(documentId: string, v1: number, v2: number) {
  try {
    const response = await fetch(
      `/api/documents/${documentId}/versions/compare?version1=${v1}&version2=${v2}`,
      {
        headers: { 'Authorization': `Bearer ${token}` }
      }
    );
    return await response.json();
  } catch (error) {
    console.error('Failed to compare versions:', error);
  }
}

// Response
{
  "version1": { /* full version 1 */ },
  "version2": { /* full version 2 */ },
  "changes": {
    "oldLength": 1234,
    "newLength": 1567,
    "lengthDifference": 333
  }
}
```

### 5. Rollback to Previous Version

**Endpoint:** `POST /documents/:documentId/versions/:versionNumber/rollback`

```typescript
async function rollbackVersion(documentId: string, versionNumber: number) {
  try {
    const response = await fetch(
      `/api/documents/${documentId}/versions/${versionNumber}/rollback`,
      {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      }
    );
    return await response.json();
  } catch (error) {
    console.error('Failed to rollback:', error);
  }
}

// Response
{
  "message": "Document rolled back to version 1",
  "version": { /* new rollback version entry */ },
  "document": { /* updated document */ }
}
```

## UI Component Recommendations

### 1. Change Description Input

```typescript
interface SaveOptions {
  changeDescription?: string;
  autoSave?: boolean;
}

function DocumentEditor() {
  const [isEditing, setIsEditing] = useState(false);
  const [changeDescription, setChangeDescription] = useState('');

  const handleSave = async () => {
    await saveDocument(docId, title, content, changeDescription);
    setChangeDescription(''); // Clear after save
  };

  return (
    <>
      <textarea value={content} onChange={...} />
      <input 
        placeholder="Describe your changes..."
        value={changeDescription}
        onChange={(e) => setChangeDescription(e.target.value)}
      />
      <button onClick={handleSave}>Save</button>
    </>
  );
}
```

### 2. Version History Timeline

```typescript
function VersionHistory({ documentId }) {
  const [versions, setVersions] = useState([]);
  const [page, setPage] = useState(0);

  useEffect(() => {
    fetchVersionHistory(documentId, page).then(setVersions);
  }, [page]);

  return (
    <div className="version-timeline">
      {versions.map((v) => (
        <div key={v.id} className="version-item">
          <div className="version-header">
            <span>Version {v.versionNumber}</span>
            <span>{new Date(v.createdAt).toLocaleString()}</span>
            <span>{v.creator.email}</span>
          </div>
          {v.changelog && <p className="changelog">{v.changelog}</p>}
          <div className="actions">
            <button onClick={() => viewVersion(v.versionNumber)}>View</button>
            <button onClick={() => rollbackVersion(v.versionNumber)}>Restore</button>
            <button onClick={() => compareVersions(currentVersion, v.versionNumber)}>Compare</button>
          </div>
        </div>
      ))}
    </div>
  );
}
```

### 3. Version Comparison Modal

```typescript
function CompareVersions({ documentId, version1, version2 }) {
  const [comparison, setComparison] = useState(null);

  useEffect(() => {
    compareVersions(documentId, version1, version2).then(setComparison);
  }, [version1, version2]);

  if (!comparison) return <Loading />;

  return (
    <div className="comparison">
      <div className="version-panel">
        <h3>Version {version1}</h3>
        <div className="content">{comparison.version1.content}</div>
      </div>
      <div className="diff-panel">
        <h3>Differences</h3>
        <p>Length: {comparison.changes.oldLength} → {comparison.changes.newLength}</p>
        <p>Change: {comparison.changes.lengthDifference > 0 ? '+' : ''}{comparison.changes.lengthDifference} chars</p>
      </div>
      <div className="version-panel">
        <h3>Version {version2}</h3>
        <div className="content">{comparison.version2.content}</div>
      </div>
    </div>
  );
}
```

### 4. Auto-Save Implementation

```typescript
function DocumentEditor() {
  const [content, setContent] = useState('');
  const [lastSavedVersion, setLastSavedVersion] = useState(0);
  const autoSaveTimeoutRef = useRef<NodeJS.Timeout>();

  const handleContentChange = (newContent: string) => {
    setContent(newContent);
    
    // Clear existing timeout
    if (autoSaveTimeoutRef.current) {
      clearTimeout(autoSaveTimeoutRef.current);
    }
    
    // Set new auto-save timeout (e.g., 2 minutes)
    autoSaveTimeoutRef.current = setTimeout(() => {
      handleAutoSave();
    }, 2 * 60 * 1000);
  };

  const handleAutoSave = async () => {
    try {
      await saveDocument(docId, title, content, 'Auto-saved');
      setLastSavedVersion(lastSavedVersion + 1);
    } catch (error) {
      console.error('Auto-save failed:', error);
    }
  };

  return (
    <>
      <textarea value={content} onChange={(e) => handleContentChange(e.target.value)} />
      <span>{lastSavedVersion > 0 ? `Last saved: v${lastSavedVersion}` : 'Not saved'}</span>
    </>
  );
}
```

## Implementation Checklist

- [ ] Add version history button to document toolbar
- [ ] Create change description input field (optional for manual save, auto for auto-save)
- [ ] Implement VersionHistory component showing timeline
- [ ] Add "View Version" modal for viewing past versions
- [ ] Add "Compare Versions" modal with diff display
- [ ] Add "Restore Version" with confirmation dialog
- [ ] Implement auto-save feature (every 2-5 minutes)
- [ ] Display current version number in editor header
- [ ] Add version indicator showing "v2 of 5 versions"
- [ ] Implement pagination for large version histories
- [ ] Add error handling for version operations
- [ ] Add loading states during version operations
- [ ] Test full workflow: create → edit → history → compare → rollback

## API Error Handling

```typescript
async function handleApiError(response: Response) {
  if (!response.ok) {
    const error = await response.json();
    switch (response.status) {
      case 400:
        throw new Error(`Bad request: ${error.message}`);
      case 401:
        throw new Error('Unauthorized. Please login again.');
      case 403:
        throw new Error('Access denied. Only document owner can perform this action.');
      case 404:
        throw new Error('Document or version not found.');
      case 500:
        throw new Error('Server error. Please try again later.');
      default:
        throw new Error(error.message || 'An error occurred');
    }
  }
}
```

## Performance Tips

1. **Lazy Load Versions**: Don't fetch version content until user clicks "View"
2. **Paginate History**: Load 20 versions per page, implement infinite scroll or pagination
3. **Debounce Auto-Save**: Don't auto-save on every keystroke, use 2-5 minute intervals
4. **Cache Versions**: Cache fetched versions in state to avoid redundant API calls
5. **Show Unsaved Indicator**: Show visual indicator when document has unsaved changes

## Example: Complete Editor Component

See `EDITOR_EXAMPLE.tsx` in documentation folder for full working example.
