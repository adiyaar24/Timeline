import React from 'react';
import { Routes, Route } from 'react-router';
import { useEntity } from '@backstage/plugin-catalog-react';
import { MissingAnnotationEmptyState } from '@backstage/core-components';
import { TimelineTable } from '../index.esm.js';
import '@mui/material';
import '@mui/icons-material';
import '@backstage/core-plugin-api';

const isTimelineAvailable = (entity) => {
  const metadataPath = "metadata.audits";
  const keys = metadataPath.split(".");
  let current = entity;
  for (const key of keys) {
    if (current && typeof current === "object" && key in current) {
      current = current[key];
    } else {
      return false;
    }
  }
  return current && typeof current === "object" && Object.keys(current).length > 0;
};
const Router = () => {
  const { entity } = useEntity();
  if (!isTimelineAvailable(entity)) {
    return /* @__PURE__ */ React.createElement(
      MissingAnnotationEmptyState,
      {
        annotation: "metadata.audits",
        readMoreUrl: "https://backstage.io/docs/features/software-catalog/descriptor-format#metadata"
      }
    );
  }
  return /* @__PURE__ */ React.createElement(Routes, null, /* @__PURE__ */ React.createElement(Route, { path: "/", element: /* @__PURE__ */ React.createElement(TimelineTable, null) }));
};

export { Router, isTimelineAvailable };
//# sourceMappingURL=Router-152748ba.esm.js.map
