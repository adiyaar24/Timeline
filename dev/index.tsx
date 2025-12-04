import React from 'react';
import { createDevApp } from '@backstage/dev-utils';
import { EntityProvider } from '@backstage/plugin-catalog-react';
import { Entity } from '@backstage/catalog-model';
import { timelinePlugin, EntityTimelineContent } from '../src/plugin';

const mockEntity: Entity = {
  apiVersion: 'backstage.io/v1alpha1',
  kind: 'Component',
  metadata: {
    name: 'my-service',
    namespace: 'production',
    audits: {
      "1764697221059": {
        action: 'create',
        config: {
          additional_tags: [
            { key: 'environment', value: 'production' }
          ],
          module_name: 'modules/terraform-aws-s3-module',
          type: 's3',
          resource_name: 'my-s3-bucket',
          env: 'prod'
        }
      },
      "1764698174772": {
        action: 'update', 
        config: {
          additional_tags: [
            { key: 'environment', value: 'production' },
            { key: 'owner', value: 'platform-team' }
          ],
          module_name: 'modules/terraform-aws-s3-module',
          type: 's3',
          resource_name: 'my-s3-bucket',
          env: 'prod'
        }
      }
    }
  },
  spec: {
    type: 'service',
    owner: 'team-platform',
    lifecycle: 'production',
  },
};

const DevPage = () => (
  <EntityProvider entity={mockEntity}>
    <div style={{ padding: '20px' }}>
      <h1>Timeline Plugin Demo</h1>
      <EntityTimelineContent />
    </div>
  </EntityProvider>
);

createDevApp()
  .registerPlugin(timelinePlugin)
  .addPage({
    element: <DevPage />,
    title: 'Timeline Demo',
    path: '/timeline'
  })
  .render();
