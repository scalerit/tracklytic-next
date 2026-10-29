const test = require('node:test');
const assert = require('node:assert/strict');
const React = require('react');
const { act, create } = require('react-test-renderer');
const { TracklyticServer, createTracklyticServer } = require('../dist/server');
const { TracklyticProvider, useTracklytic } = require('../dist/context');
const { eventFromElement } = require('../dist/data-attributes');

globalThis.IS_REACT_ACT_ENVIRONMENT = true;

function transport() {
  const calls = [];
  return {
    calls,
    request: async (url, init) => {
      calls.push({ url, ...init, body: init.body ? JSON.parse(init.body) : undefined });
      const body = init.body ? JSON.parse(init.body) : {};
      return new Response(JSON.stringify(body.steps ? { id: 'event-1', status: 'waiting', pipeline: {} } : {}), { status: 200 });
    },
  };
}

const steps = [{ id: 'build', name: 'Build', stage: 'Build' }];

test('server entry inherits pipeline, event, profile and insight APIs with correct credentials', async () => {
  const { calls, request } = transport();
  const client = createTracklyticServer({ token: 'api-test', accessToken: 'user-test', project: 'app', baseUrl: 'https://example.test', request });
  assert.ok(client instanceof TracklyticServer);
  const pipeline = await client.pipeline.create({ channel: 'deployments', event: 'Deploy', steps });
  assert.equal(pipeline.id, 'event-1');
  await client.pipeline.update(pipeline.id, { id: 'build', status: 'success' });
  await client.pipeline.updateAsUser(pipeline.id, { id: 'build', status: 'running' });
  await client.pipeline.executeAction(pipeline.id, 'build', 0, { confirmed: true });
  await client.events.list();
  await client.profiles.get('person');
  await client.insight.increment({ title: 'Deploys', value: 1 });
  assert.equal(calls[0].url, 'https://example.test/v1/event');
  assert.equal(calls[0].body.project, 'app');
  assert.equal(calls[1].method, 'POST');
  assert.equal(calls[1].headers.Authorization, 'Bearer api-test');
  assert.equal(calls[2].method, 'PATCH');
  for (const index of [2, 3, 4, 5]) assert.equal(calls[index].headers.Authorization, 'Bearer user-test');
  assert.deepEqual(calls[6].body.value, { $inc: 1 });
});

test('server disabled mode suppresses writes and returns no fictitious pipeline ID', async () => {
  const { calls, request } = transport();
  const client = new TracklyticServer({ token: 'api-test', project: 'app', disableTracking: true, request });
  assert.equal(await client.track({ channel: 'events', event: 'Disabled' }), true);
  assert.equal(await client.pipeline.create({ channel: 'events', event: 'Disabled', steps }), undefined);
  assert.equal(calls.length, 0);
});

test('provider adds contextual user IDs, supports pipelines and responds to configuration changes', async () => {
  const { calls, request } = transport();
  let sdk;
  function Consumer() { sdk = useTracklytic(); return null; }
  let renderer;
  const tree = (project, disabled = false) => React.createElement(TracklyticProvider,
    { token: 'api-test', project, request, disableTracking: disabled }, React.createElement(Consumer));
  await act(async () => { renderer = create(tree('first')); });
  await assert.rejects(sdk.identify({ properties: {} }), /requires a userId/);
  assert.equal(calls.length, 0);
  await act(async () => { sdk.setUserId('context-user'); });
  await sdk.track({ channel: 'events', event: 'Viewed' });
  await sdk.createEvent({ channel: 'events', event: 'Custom', userId: 'explicit-user' });
  await sdk.identify({ properties: { plan: 'pro' }, avatar: null });
  await sdk.pipeline.create({ channel: 'deployments', event: 'Build', steps });
  assert.equal(calls[0].body.userId, 'context-user');
  assert.equal(calls[1].body.userId, 'explicit-user');
  assert.equal(calls[2].body.userId, 'context-user');
  assert.equal(calls[2].body.avatar, null);
  assert.equal(calls[3].body.userId, 'context-user');
  await act(async () => { renderer.update(tree('second')); });
  await sdk.track({ channel: 'events', event: 'New configuration' });
  assert.equal(calls[4].body.project, 'second');
  await act(async () => { renderer.update(tree('second', true)); });
  assert.equal(await sdk.pipeline.create({ channel: 'events', event: 'Disabled', steps }), undefined);
  assert.equal(calls.length, 5);
  await act(async () => { sdk.clearUserId(); });
  assert.equal(sdk.userId, null);
  await act(async () => { renderer.unmount(); });
});

test('data attributes use current fields and preserve notification defaults and tag values', () => {
  const attrs = {
    'data-event': 'Failure', 'data-log-level': 'critical', 'data-icon': 'legacy',
    'data-tag-empty': '', 'data-tag-count': '12', 'data-tag-ok': 'false',
    'data-tag-infinite': 'Infinity', 'data-tag-__proto__': 'safe',
  };
  const element = {
    getAttribute: name => attrs[name] ?? null,
    get attributes() { return Object.entries(attrs).map(([name, value]) => ({ name, value })); },
  };
  const options = eventFromElement(element, 'context-user');
  assert.equal(options.notify, undefined);
  assert.equal(options.logLevel, 'critical');
  assert.equal(options.userId, 'context-user');
  assert.equal('icon' in options, false);
  assert.deepEqual(options.tags, { empty: '', count: 12, ok: false, infinite: 'Infinity', ['__proto__']: 'safe' });
  attrs['data-notify'] = 'false';
  attrs['data-user-id'] = 'explicit-user';
  assert.equal(eventFromElement(element).notify, false);
  assert.equal(eventFromElement(element).userId, 'explicit-user');
});
