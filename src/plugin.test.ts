import { timelinePlugin, TimelinePage, EntityTimelineContent } from './plugin';

describe('timeline plugin', () => {
  it('should export timeline plugin', () => {
    expect(timelinePlugin).toBeDefined();
    expect(timelinePlugin.getId()).toBe('timeline');
  });

  it('should export TimelinePage component', () => {
    expect(TimelinePage).toBeDefined();
  });

  it('should export EntityTimelineContent component', () => {
    expect(EntityTimelineContent).toBeDefined();
  });

  it('should have correct plugin routes', () => {
    const routes = timelinePlugin.routes;
    expect(routes).toBeDefined();
    expect(routes.root).toBeDefined();
  });
});
