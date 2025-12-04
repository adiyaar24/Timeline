/// <reference types="react" />
import * as react from 'react';
import react__default from 'react';
import * as _backstage_core_plugin_api from '@backstage/core-plugin-api';

declare const TimelineTable: () => react__default.JSX.Element;

declare const timelinePlugin: _backstage_core_plugin_api.BackstagePlugin<{
    root: _backstage_core_plugin_api.RouteRef<undefined>;
}, {}, {}>;
declare const TimelinePage: () => react.JSX.Element;
declare const EntityTimelineContent: () => react.JSX.Element;

export { EntityTimelineContent, TimelinePage, TimelineTable, timelinePlugin };
