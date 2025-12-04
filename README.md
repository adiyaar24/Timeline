# Timeline Plugin

A Backstage plugin that displays audit timeline events in a tabular format with diff capabilities, designed for tracking configuration changes and operations history.

## Features

- **Tab-Based Interface**: Toggle between Timeline and Configuration History views
- **Tabular Layout**: Clean table display matching the provided design
- **Audit Data Processing**: Processes audit data from `metadata.audits` path
- **Diff Functionality**: Compare configurations between different audit entries
- **Configuration Details**: View full configuration for each audit entry
- **Relative Time Display**: Shows both absolute and relative timestamps
- **Action-Based Coloring**: Different colors for create, update, delete actions

## Usage

### As an Entity Tab

```typescript
// In packages/app/src/components/catalog/EntityPage.tsx
import { EntityTimelineContent } from '@adiyaar/backstage-plugin-timeline';

// Add to your entity page:
<EntityLayout.Route path="/timeline" title="Timeline">
  <EntityTimelineContent />
</EntityLayout.Route>
```

### As a Standalone Page

```typescript
import { TimelinePage } from '@adiyaar/backstage-plugin-timeline';

// Add route in App.tsx
<Route path="/timeline" element={<TimelinePage />} />
```

## Expected Metadata Structure

The plugin processes audit data from the `metadata.audits` path:

```yaml
apiVersion: backstage.io/v1alpha1
kind: Component
metadata:
  name: test-s3-component
  audits:
    "1764697221059":  # Timestamp as key
      action: create
      config:
        additional_tags:
          - key: environment
            value: production
        module_name: modules/terraform-aws-s3-module
        type: s3
        resource_name: my-s3-bucket
        env: prod
    "1764698174772":  # Later timestamp
      action: update
      config:
        additional_tags:
          - key: environment
            value: production
          - key: owner
            value: platform-team
        module_name: modules/terraform-aws-s3-module
        type: s3
        resource_name: my-s3-bucket
        env: prod
```

## Features

### Timeline Tab

Displays audit entries in a table format with columns:
- **Time**: Relative time (e.g., "2h ago") and absolute timestamp
- **User**: User avatar and name (from entity spec.owner)
- **Action**: Color-coded action chip (create/update/delete)
- **Resource**: Resource name and type
- **Organization**: Organization name
- **Project**: Project name
- **Module**: Terraform module icon and name
- **Actions**: View config and diff buttons

### Configuration History Tab

Shows a chronological view of all configurations with:
- Expandable cards for each audit entry
- Full JSON configuration display
- Diff buttons to compare with previous versions

### Diff Dialog

- Side-by-side comparison of configurations
- Summary of changes with added/removed/modified fields
- Unified diff view with line-by-line changes
- Color-coded differences (green for additions, red for removals)

## Supported Actions

The plugin recognizes these action types:

- **create**: Green success chip
- **update**: Orange warning chip  
- **delete**: Red error chip
- **default**: Default gray chip

## Installation

1. Install the plugin in your Backstage app
2. Add the plugin to your entity pages
3. Ensure your entities have audit data in `metadata.audits`
4. The plugin automatically detects and displays available audit entries

## Requirements

- Entities must have audit data in `metadata.audits` path
- Audit entries should be keyed by timestamp
- Each audit entry should have `action` and `config` properties