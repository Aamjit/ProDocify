-- Row-Level Security policies for ProDocify
-- Requires the application to set: SET LOCAL app.current_user = '<user-id>'

ALTER TABLE folders ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE document_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_folders ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_document_versions ENABLE ROW LEVEL SECURITY;

-- Folder policies
CREATE POLICY folder_select ON folders FOR SELECT USING (
  owner_id = current_setting('app.current_user', true)
  OR visibility = 'PUBLIC'
  OR EXISTS (
    SELECT 1 FROM folder_shares fs
    WHERE fs.folder_id = folders.id
      AND fs.user_id = current_setting('app.current_user', true)
  )
);

CREATE POLICY folder_modify ON folders FOR UPDATE, DELETE USING (
  owner_id = current_setting('app.current_user', true)
  OR EXISTS (
    SELECT 1 FROM folder_shares fs
    WHERE fs.folder_id = folders.id
      AND fs.user_id = current_setting('app.current_user', true)
      AND fs.permission IN ('EDITOR', 'OWNER')
  )
) WITH CHECK (
  owner_id = current_setting('app.current_user', true)
);

CREATE POLICY folder_insert ON folders FOR INSERT WITH CHECK (
  owner_id = current_setting('app.current_user', true)
);

-- Document policies
CREATE POLICY document_select ON documents FOR SELECT USING (
  owner_id = current_setting('app.current_user', true)
  OR visibility = 'PUBLIC'
  OR EXISTS (
    SELECT 1 FROM document_shares ds
    WHERE ds.document_id = documents.id
      AND ds.user_id = current_setting('app.current_user', true)
  )
  OR EXISTS (
    SELECT 1 FROM folders f
    JOIN folder_shares fs ON fs.folder_id = f.id
    WHERE f.id = documents.folder_id
      AND fs.user_id = current_setting('app.current_user', true)
  )
);

CREATE POLICY document_modify ON documents FOR UPDATE, DELETE USING (
  owner_id = current_setting('app.current_user', true)
  OR EXISTS (
    SELECT 1 FROM document_shares ds
    WHERE ds.document_id = documents.id
      AND ds.user_id = current_setting('app.current_user', true)
      AND ds.permission IN ('EDITOR', 'OWNER')
  )
) WITH CHECK (
  owner_id = current_setting('app.current_user', true)
);

CREATE POLICY document_insert ON documents FOR INSERT WITH CHECK (
  owner_id = current_setting('app.current_user', true)
);

-- Document version policies
CREATE POLICY document_version_select ON document_versions FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM documents d
    WHERE d.id = document_versions.document_id
      AND (
        d.owner_id = current_setting('app.current_user', true)
        OR d.visibility = 'PUBLIC'
        OR EXISTS (
          SELECT 1 FROM document_shares ds
          WHERE ds.document_id = d.id
            AND ds.user_id = current_setting('app.current_user', true)
        )
        OR EXISTS (
          SELECT 1 FROM folders f
          JOIN folder_shares fs ON fs.folder_id = f.id
          WHERE f.id = d.folder_id
            AND fs.user_id = current_setting('app.current_user', true)
        )
      )
  )
);

CREATE POLICY document_version_insert ON document_versions FOR INSERT WITH CHECK (
  created_by = current_setting('app.current_user', true)
  AND EXISTS (
    SELECT 1 FROM documents d
    WHERE d.id = document_versions.document_id
      AND (
        d.owner_id = current_setting('app.current_user', true)
        OR EXISTS (
          SELECT 1 FROM document_shares ds
          WHERE ds.document_id = d.id
            AND ds.user_id = current_setting('app.current_user', true)
            AND ds.permission IN ('EDITOR', 'OWNER')
        )
      )
  )
);

CREATE POLICY document_version_modify ON document_versions FOR UPDATE, DELETE USING (
  EXISTS (
    SELECT 1 FROM documents d
    WHERE d.id = document_versions.document_id
      AND (
        d.owner_id = current_setting('app.current_user', true)
        OR EXISTS (
          SELECT 1 FROM document_shares ds
          WHERE ds.document_id = d.id
            AND ds.user_id = current_setting('app.current_user', true)
            AND ds.permission IN ('EDITOR', 'OWNER')
        )
      )
  )
);

-- Team folder policies
CREATE POLICY team_folder_select ON team_folders FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM team_members tm
    WHERE tm.team_id = team_folders.team_id
      AND tm.user_id = current_setting('app.current_user', true)
  )
);

CREATE POLICY team_folder_modify ON team_folders FOR UPDATE, DELETE USING (
  EXISTS (
    SELECT 1 FROM team_members tm
    WHERE tm.team_id = team_folders.team_id
      AND tm.user_id = current_setting('app.current_user', true)
      AND tm.role IN ('EDITOR', 'ADMIN')
  )
);

CREATE POLICY team_folder_insert ON team_folders FOR INSERT WITH CHECK (
  created_by = current_setting('app.current_user', true)
  AND EXISTS (
    SELECT 1 FROM team_members tm
    WHERE tm.team_id = team_folders.team_id
      AND tm.user_id = current_setting('app.current_user', true)
      AND tm.role IN ('EDITOR', 'ADMIN')
  )
);

-- Team document policies
CREATE POLICY team_document_select ON team_documents FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM team_members tm
    WHERE tm.team_id = team_documents.team_id
      AND tm.user_id = current_setting('app.current_user', true)
  )
);

CREATE POLICY team_document_modify ON team_documents FOR UPDATE, DELETE USING (
  EXISTS (
    SELECT 1 FROM team_members tm
    WHERE tm.team_id = team_documents.team_id
      AND tm.user_id = current_setting('app.current_user', true)
      AND tm.role IN ('EDITOR', 'ADMIN')
  )
);

CREATE POLICY team_document_insert ON team_documents FOR INSERT WITH CHECK (
  owner_id = current_setting('app.current_user', true)
  AND EXISTS (
    SELECT 1 FROM team_members tm
    WHERE tm.team_id = team_documents.team_id
      AND tm.user_id = current_setting('app.current_user', true)
      AND tm.role IN ('EDITOR', 'ADMIN')
  )
);

-- Team document version policies
CREATE POLICY team_document_version_select ON team_document_versions FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM team_documents td
    JOIN team_members tm ON tm.team_id = td.team_id
    WHERE td.id = team_document_versions.team_document_id
      AND tm.user_id = current_setting('app.current_user', true)
  )
);

CREATE POLICY team_document_version_insert ON team_document_versions FOR INSERT WITH CHECK (
  created_by = current_setting('app.current_user', true)
  AND EXISTS (
    SELECT 1 FROM team_documents td
    JOIN team_members tm ON tm.team_id = td.team_id
    WHERE td.id = team_document_versions.team_document_id
      AND tm.user_id = current_setting('app.current_user', true)
      AND tm.role IN ('EDITOR', 'ADMIN')
  )
);

CREATE POLICY team_document_version_modify ON team_document_versions FOR UPDATE, DELETE USING (
  EXISTS (
    SELECT 1 FROM team_documents td
    JOIN team_members tm ON tm.team_id = td.team_id
    WHERE td.id = team_document_versions.team_document_id
      AND tm.user_id = current_setting('app.current_user', true)
      AND tm.role IN ('EDITOR', 'ADMIN')
  )
);
