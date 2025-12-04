import React from 'react';
import { Routes, Route } from 'react-router';
import { Entity } from '@backstage/catalog-model';
import { useEntity } from '@backstage/plugin-catalog-react';
import { MissingAnnotationEmptyState } from '@backstage/core-components';
import { TimelineTable } from './TimelineTable/TimelineTable';

export const isTimelineAvailable = (entity: Entity) => {
  const metadataPath = 'metadata.audits';
  const keys = metadataPath.split('.');
  let current: any = entity;
  
  for (const key of keys) {
    if (current && typeof current === 'object' && key in current) {
      current = current[key];
    } else {
      return false;
    }
  }
  
  return current && typeof current === 'object' && Object.keys(current).length > 0;
};

export const Router = () => {
  const { entity } = useEntity();
  
  if (!isTimelineAvailable(entity)) {
    return (
      <MissingAnnotationEmptyState
        annotation="metadata.audits"
        readMoreUrl="https://backstage.io/docs/features/software-catalog/descriptor-format#metadata"
      />
    );
  }

  return (
    <Routes>
      <Route path="/" element={<TimelineTable />} />
    </Routes>
  );
};