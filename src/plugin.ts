import {
  createPlugin,
  createRoutableExtension,
} from '@backstage/core-plugin-api';
import { timelineRouteRef } from './route-refs';

export const timelinePlugin = createPlugin({
  id: 'timeline',
  routes: {
    root: timelineRouteRef,
  },
});

export const TimelinePage = timelinePlugin.provide(
  createRoutableExtension({
    name: 'TimelinePage',
    component: () => import('./components/Router').then(m => m.Router),
    mountPoint: timelineRouteRef,
  }),
);

export const EntityTimelineContent = timelinePlugin.provide(
  createRoutableExtension({
    name: 'TimelineContent',
    component: () => import('./components/Router').then(m => m.Router),
    mountPoint: timelineRouteRef,
  }),
);
